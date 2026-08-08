// ملخّص المواعيد النهائية — يعمل يوميًا تلقائيًا حسب جدولة vercel.json.
// لكل كورس منشور له موعد نهائي (dueDate) يقترب (يومان قبله) أو انتهى للتوّ
// (يوم بعده)، يُرسَل للمعلم بريد بقائمة من أنهى الكورس ومن لم ينهِه من
// طلابه المسنَدين إليه — لا يحتاج المعلم لفتح المنصة ليعرف من تأخّر.
import { getRedis } from "./_redis.js";

function assignedTo(course, student) {
  if (course.status !== "published") return false;
  if (course.grade !== student.grade || course.stream !== student.stream) return false;
  if ((course.students || []).length) return course.students.includes(student.key);
  return (course.blocks || []).includes("ALL") || (course.blocks || []).includes(student.block);
}

export default async function handler(req, res) {
  const auth = req.headers.authorization || "";
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "unauthorized" });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(200).json({ skipped: "RESEND_API_KEY غير مضبوط — لا بريد للإرسال" });
  }

  try {
    const redis = getRedis();
    const parseAll = (keys) =>
      keys.length
        ? redis.mget(...keys).then((vals) =>
            vals.map((v) => { if (!v) return null; if (typeof v === "string") { try { return JSON.parse(v); } catch { return null; } } return v; }).filter(Boolean)
          )
        : Promise.resolve([]);

    const [courseKeys, studentKeys, attemptKeys] = await Promise.all([
      redis.keys("gfs:rec:course:*"),
      redis.keys("gfs:rec:student:*"),
      redis.keys("gfs:rec:attempt:*"),
    ]);
    const [courses, students, attempts] = await Promise.all([
      parseAll(courseKeys), parseAll(studentKeys), parseAll(attemptKeys),
    ]);

    const now = new Date();
    const in2Days = new Date(now.getTime() + 2 * 86400000);
    const yesterday = new Date(now.getTime() - 1 * 86400000);

    const targets = courses.filter((c) => {
      if (c.status !== "published" || !c.dueDate) return false;
      const due = new Date(c.dueDate);
      // نافذة الإرسال: يومان قبل الموعد بالضبط، أو يوم واحد بعده بالضبط —
      // لتفادي تكرار نفس البريد كل يوم حتى انتهاء الموعد.
      const isApproaching = due.toDateString() === in2Days.toDateString();
      const isJustPast = due.toDateString() === yesterday.toDateString();
      return isApproaching || isJustPast;
    });

    const sent = [];
    for (const c of targets) {
      const teacherKeysRaw = await redis.get("gfs:teachers:v5");
      const teachers = Array.isArray(teacherKeysRaw) ? teacherKeysRaw : (teacherKeysRaw ? JSON.parse(teacherKeysRaw) : []);
      const teacher = teachers.find((t) => t.name === c.teacher);
      if (!teacher || !teacher.email) continue;

      const roster = students.filter((s) => assignedTo(c, s));
      if (!roster.length) continue;
      const done = roster.filter((s) => attempts.some((a) => a.student === s.key && a.course === c.id && a.passed));
      const notDone = roster.filter((s) => !done.includes(s));
      const due = new Date(c.dueDate);
      const status = due > now ? `يقترب الموعد النهائي (${c.dueDate})` : `انتهى الموعد النهائي (${c.dueDate})`;

      const html = `
        <p>مرحبًا ${teacher.name}،</p>
        <p>${status} لكورس <strong>${c.title}</strong>.</p>
        <p><strong>أنهاه (${done.length} من ${roster.length}):</strong><br/>${done.map((s) => s.name).join("، ") || "لا أحد بعد"}</p>
        <p><strong>لم ينهِه بعد (${notDone.length}):</strong><br/>${notDone.map((s) => s.name).join("، ") || "لا أحد"}</p>`;

      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "GFS بالعربي أحلى <onboarding@resend.dev>",
          to: [teacher.email],
          subject: `موعد كورس «${c.title}» — من أنهى ومن لم ينهِ`,
          html,
        }),
      });
      if (r.ok) sent.push(c.id);
    }

    return res.status(200).json({ ok: true, coursesNotified: sent, checked: targets.length });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
