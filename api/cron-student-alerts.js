// تنبيهات تلقائية حقيقية — يعمل تلقائيًّا حسب الجدولة في vercel.json (لا
// يحتاج أحدًا ليضغط زرًا)، بنفس آلية cron-teacher-reminders.js تمامًا.
// يقرأ بيانات الطلاب والمحاولات مباشرة من نفس مفاتيح Redis التي تستعملها
// الواجهة (REC.* في src/App.jsx)، فلا ازدواجية في مصدر الحقيقة.
//
// القواعد المُنفَّذة فعليًّا من المطلوب (لا كل القواعد — الموثَّق أدناه
// ما لم يُنفَّذ ولماذا):
// 1) لم يدخل الطالب خلال 7 أيام → تنبيه (عبر بريد ولي الأمر، الطلاب لا
//    يملكون بريدًا شخصيًّا في هيكل المنصة).
// 2) استنفد 4 محاولات بلا نجاح على كورس → يُنشأ تدخل علاجي تلقائي حقيقي
//    (سجلّ REC.intervention فعلي، يظهر في "الخطط والتدخلات" مباشرة)،
//    ويُخطر المعلم ورئيس القسم معًا — هذا يغطّي قاعدتي "الفشل المتكرر"
//    و"استنفاد المحاولات" معًا لأن كلتيهما تتحقق عند نفس اللحظة فعليًّا.
// غير مُنفَّذ: "لم يبدأ الكورس خلال 3 أيام من إسناده" — لا نملك تاريخ
// إسناد فردي لكل طالب في هيكل البيانات الحالي، فقط تاريخ نشر الكورس
// نفسه؛ يحتاج تصميم بيانات إضافيًّا خارج نطاق هذه الدفعة، لا فبركة رقم.
import { getRedis } from "./_redis.js";

async function loadRecords(redis, prefix) {
  const keys = await redis.keys(prefix + "*");
  if (!keys.length) return [];
  const vals = await redis.mget(...keys);
  return vals.map((v) => { if (!v) return null; if (typeof v === "string") { try { return JSON.parse(v); } catch { return null; } } return v; }).filter(Boolean);
}

function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) return Promise.resolve({ skipped: true });
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) return Promise.resolve({ skipped: true });
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: process.env.RESEND_FROM || "GFS بالعربي أحلى <onboarding@resend.dev>", to: recipients, subject, html }),
  });
}

export default async function handler(req, res) {
  const auth = req.headers.authorization || "";
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const redis = getRedis();
    const students = await loadRecords(redis, "gfs:rec:student:");
    const attempts = await loadRecords(redis, "gfs:rec:attempt:");
    const teachersRaw = await redis.get("gfs:teachers:v5");
    const teachers = Array.isArray(teachersRaw) ? teachersRaw : (teachersRaw ? JSON.parse(teachersRaw) : []);
    const coursesRaw = await loadRecords(redis, "gfs:rec:course:");
    const orgEmail = await redis.get("gfs:orgemail:v1");
    const existingInterventionKeys = await redis.keys("gfs:rec:intervention:*");
    const existingInterventions = existingInterventionKeys.length ? (await redis.mget(...existingInterventionKeys)).map((v) => (typeof v === "string" ? JSON.parse(v) : v)).filter(Boolean) : [];

    const now = Date.now();
    const byStudent = {};
    attempts.forEach((a) => { (byStudent[a.student] = byStudent[a.student] || []).push(a); });

    const notEnteredAlerts = [], autoInterventions = [];

    for (const s of students) {
      const at = (byStudent[s.key] || []).slice().sort((x, y) => new Date(x.at) - new Date(y.at));

      // قاعدة 1: لم يدخل خلال 7 أيام — نافذة يوم واحد (7-8 أيام) لتفادي
      // إرسال نفس التنبيه يوميًّا لنفس الطالب طوال غيابه.
      const lastAt = at.length ? new Date(at[at.length - 1].at).getTime() : null;
      const daysSince = lastAt ? (now - lastAt) / 86400000 : null;
      const neverEntered = at.length === 0;
      if (neverEntered || (daysSince != null && daysSince > 7 && daysSince < 8)) {
        if (s.parentEmail) {
          await sendEmail(s.parentEmail, `تنبيه متابعة — ${s.name}`,
            `<p>مرحبًا،</p><p>لم يدخل ${s.name} (الصف ${s.grade} — ${s.block}) منصة «بالعربي أحلى» منذ أكثر من 7 أيام. نرجو المتابعة.</p>`);
          notEnteredAlerts.push(s.key);
        }
      }

      // قاعدة 2: استنفاد 4 محاولات دون نجاح على كورس واحد → تدخل علاجي
      // تلقائي حقيقي + إخطار المعلم ورئيس القسم معًا.
      const byCourse = {};
      at.forEach((a) => { (byCourse[a.course] = byCourse[a.course] || []).push(a); });
      for (const [courseId, arr] of Object.entries(byCourse)) {
        const allFailed = arr.length >= 4 && !arr.some((a) => a.passed);
        if (!allFailed) continue;
        const already = existingInterventions.some((i) => i.studentKey === s.key && i.autoRule === "exhausted" && i.courseId === courseId);
        if (already) continue;

        const entry = {
          id: `auto-${s.key}-${courseId}-${now}`, at: new Date().toISOString(), status: "مفتوح",
          studentKey: s.key, studentName: s.name, problem: "استنفد 4 محاولات فأكثر بلا نجاح", action: "تدخل علاجي تلقائي — يحتاج مراجعة رئيس القسم/المعلم",
          responsible: "غير محدَّد بعد", reviewDate: "", autoRule: "exhausted", courseId,
        };
        await redis.set("gfs:rec:intervention:" + entry.id, JSON.stringify(entry));
        autoInterventions.push({ student: s.name, course: courseId });

        const course = coursesRaw.find((c) => c.id === courseId);
        const teacherEmail = (teachers.find((t) => t.name === course?.teacher) || {}).email;
        await sendEmail([teacherEmail, orgEmail].filter(Boolean), `تدخل مطلوب — ${s.name}`,
          `<p>الطالب <strong>${s.name}</strong> (الصف ${s.grade} — ${s.block}) استنفد 4 محاولات دون نجاح في كورس «${course?.title || courseId}». أُنشئ تدخل علاجي تلقائي يحتاج مراجعتكم.</p>`);
      }
    }

    return res.status(200).json({ ok: true, notEnteredAlerts: notEnteredAlerts.length, autoInterventions: autoInterventions.length, checked: students.length });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
