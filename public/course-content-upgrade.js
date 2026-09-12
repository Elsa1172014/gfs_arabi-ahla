(() => {
  const VERSION = "2026-09-12-course-content-v4";
  const MARKER_KEY = `gfs:course-content-upgrade:${VERSION}`;
  const COURSE_PREFIX = "gfs:rec:course:";
  const API = "/api/storage";

  /* لا يغيّر هذا الملف أي جزء من نظام المنصة؛ يعدّل محتوى الكورس فقط. */
  const VIDEO_IDS = {
    "الهمزة المتوسطة": "N99RtSaAEj4",
    "الألف اللينة في آخر الأسماء": "3nbdyrRObf0",
    "الاستعارة التصريحية": "Is4R7o4u9XU",
    "الاستعارة المكنية": "Is4R7o4u9XU",
    "الطباق": "G9RFzCQXZGo",
    "المقابلة": "G9RFzCQXZGo",
    "التشبيه المرسل": "JY0VJekdfuA",
    "التشبيه المؤكد": "JY0VJekdfuA",
    "التشبيه المجمل": "JY0VJekdfuA",
    "التشبيه المفصَّل": "JY0VJekdfuA",
    "التشبيه التمثيلي": "JY0VJekdfuA",
    "التشبيه الضمني": "JY0VJekdfuA",
    "همزة الوصل وهمزة القطع": "R6ZyWeqebdw",
    "التاء المربوطة والتاء المفتوحة": "dsJRyz-D0Fo",
    "المبتدأ والخبر": "8LpQNzz7AMI",
    "كان وأخواتها": "Wckqa9spv5k",
    "الهمزة المتطرفة": "CnASFuLa51Q",
    "إنّ وأخواتها": "IdeZdpejhMw",
    "إن وأخواتها": "IdeZdpejhMw",
    "الحال": "962hd_-l8uM",
    "المفعول به": "b7CLeDUXUvE",
    "التمييز": "64f6tzdXsHg",
    "أقسام الكلام: اسم وفعل وحرف": "LXDtA9IZEWU",
    "الجملة الفعلية وأركانها": "yjPS3tn3DYo",
    "الأفعال الناصبة لمفعولين": "9MFEtrlfMcQ",
    "الأفعال التي تنصب مفعولين": "9MFEtrlfMcQ",
    "الفاعل ونائب الفاعل": "2tLJA0MfiJA",
    "المفعول فيه (ظرف الزمان والمكان)": "b7CLeDUXUvE",
    "المفعول فيه «ظرف الزمان والمكان»": "b7CLeDUXUvE",
    "المفعول معه": "b7CLeDUXUvE",
    "المفعول المطلق": "b7CLeDUXUvE",
    "المفعول لأجله": "b7CLeDUXUvE"
  };

  const ART = {
    "الهمزة المتوسطة": ["hamza-anatomy", "hamza-scale"],
    "الألف اللينة في آخر الأسماء": ["alif-tree"],
    "الفاعل ونائب الفاعل": ["passive-flow"]
  };

  async function req(url, opts) {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }
  async function listKeys(prefix) {
    const r = await req(`${API}?action=list&prefix=${encodeURIComponent(prefix)}`);
    return r?.keys || [];
  }
  async function getKey(key) {
    try {
      const r = await req(`${API}?key=${encodeURIComponent(key)}`);
      if (!r?.value) return null;
      return typeof r.value === "string" ? JSON.parse(r.value) : r.value;
    } catch { return null; }
  }
  async function setKey(key, value) {
    return req(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: JSON.stringify(value) })
    });
  }

  const norm = (s) => String(s || "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim().toLowerCase();

  function cleanQuestion(q) {
    if (!q) return q;
    return {
      ...q,
      q: String(q.q || "")
        .replace(/^تحدّي\s*\d+\s*:\s*/u, "")
        .replace(/^موقف\s*\d+\s*:\s*/u, "")
        .replace(/^حلّل ثم اختر\s*:\s*/u, "")
        .trim()
    };
  }

  function uniqueQuestions(items) {
    const out = [], seen = new Set();
    for (const raw of items || []) {
      const q = cleanQuestion(raw);
      if (!q) continue;
      const key = norm(q.q || q.sn || JSON.stringify(q));
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(q);
    }
    return out;
  }

  function diverseQuestions(items, limit = 25) {
    const source = uniqueQuestions(items);
    const groups = {};
    for (const q of source) (groups[q.t || "other"] ||= []).push(q);
    const order = ["mcq", "tf", "fill", "match", "err", "sort", "other"];
    const out = [];
    let moved = true;
    while (out.length < limit && moved) {
      moved = false;
      for (const t of order) {
        const g = groups[t];
        if (g?.length) {
          out.push(g.shift());
          moved = true;
          if (out.length === limit) break;
        }
      }
    }
    return out;
  }

  function extractInfo(course, stages) {
    const rule = stages.find(s => s?.t === "rule");
    const summary = stages.find(s => s?.t === "summary");
    const discover = stages.find(s => s?.t === "discover");
    const worked = stages.find(s => s?.t === "worked");
    const body = rule?.body || summary?.body || discover?.intro || worked?.intro || course.objective || `تعلّم مهارة ${course.title} من خلال الفهم ثم التطبيق.`;
    let bullets = [];
    if (Array.isArray(rule?.concepts)) bullets = rule.concepts.map(x => typeof x === "string" ? x : x?.label || x?.note).filter(Boolean);
    if (!bullets.length && Array.isArray(summary?.bullets)) bullets = summary.bullets.filter(Boolean);
    if (!bullets.length && Array.isArray(discover?.table?.rows)) bullets = discover.table.rows.slice(0, 4).map(r => r.join(" ← "));
    if (!bullets.length) bullets = [body];
    return { rule, summary, discover, worked, body, bullets: bullets.slice(0, 6) };
  }

  function getLearningPool(stages, finalBank) {
    const finalSet = new Set((finalBank || []).map(x => norm(x?.q)));
    const checks = [];
    for (const s of stages || []) {
      for (const q of s?.checks || []) {
        if (!finalSet.has(norm(q?.q))) checks.push(q);
      }
    }
    return diverseQuestions(checks, 16);
  }

  function introStage(course, info) {
    return {
      t: "summary",
      title: "مقدمة وتمهيد — شاهد الفكرة قبل أن تجيب",
      strat: "تهيئة بصرية",
      body: course.objective || info.body,
      bullets: [
        `🎯 هدفك: إتقان «${course.title}»`,
        "👀 لاحظ المثال أو الصورة أولًا",
        "🧠 افهم العلاقة أو النمط",
        "✍️ بعد ذلك فقط تبدأ الأسئلة"
      ],
      art: ART[course.title] || [],
      note: "لا أسئلة في التهيئة؛ الهدف أن تدخل الدرس وأنت تعرف ما الذي ستتعلمه.",
      checks: [],
      __gfsUpgrade: VERSION
    };
  }

  function videoStage(course, stages, pool) {
    const oldVideo = stages.find(s => s?.t === "video");
    const oldClips = Array.isArray(oldVideo?.clips) ? oldVideo.clips.filter(v => v?.id).slice(0, 2) : [];
    const mapped = VIDEO_IDS[course.title];
    const clips = oldClips.length ? oldClips : mapped ? [{ id: mapped, start: 0, label: `شرح ${course.title}` }] : [];
    return {
      t: "video",
      title: "شاهد وافهم — فيديو قصير",
      strat: "التعلّم المدمج",
      intro: "شاهد الفيديو بتركيز. بعد المشاهدة ستظهر أسئلة تحقق قصيرة مرتبطة بالفكرة نفسها.",
      clips,
      videoQuery: clips.length ? undefined : `${course.title} شرح مبسط لغة عربية`,
      checks: pool.splice(0, Math.min(2, pool.length)).map((q, i) => ({ ...q, sn: ["تحقق من المشاهدة", "التقط الفكرة"][i] })),
      __gfsUpgrade: VERSION
    };
  }

  function explanationStage(course, info) {
    const src = info.discover || info.worked;
    if (src) {
      return {
        ...src,
        title: "الشرح المبسّط — افهم كيف تعمل الفكرة",
        strat: "شرح قبل القاعدة",
        checks: [],
        __gfsUpgrade: VERSION
      };
    }
    return {
      t: "summary",
      title: "الشرح المبسّط — قبل القاعدة",
      strat: "مثال ثم تفسير",
      body: info.body,
      bullets: info.bullets.map((b, i) => `${i + 1}. ${b}`),
      note: "اقرأ الشرح ببطء، ثم حاول أن تفسّر المثال بلغتك قبل الانتقال.",
      checks: [],
      __gfsUpgrade: VERSION
    };
  }

  function visualStage(course, info, pool) {
    const q = pool.shift();
    return {
      t: "summary",
      title: "إنفوجرافيك — الفكرة في صورة واحدة",
      strat: "التشفير البصري",
      body: `حوّل درس «${course.title}» إلى نقاط قصيرة مترابطة.`,
      bullets: info.bullets.map((b, i) => `${["🔎","🧩","⚖️","🎯","💡","✅"][i] || "•"} ${b}`),
      art: ART[course.title] || [],
      note: "اقرأ العناصر بالترتيب، ثم أجب عن سؤال واحد للتأكد من أنك فهمت الصورة الكاملة.",
      checks: q ? [{ ...q, sn: "سؤال على الإنفوجرافيك" }] : [],
      __gfsUpgrade: VERSION
    };
  }

  function ruleStage(course, info) {
    return {
      ...(info.rule || {}),
      t: "rule",
      title: "القاعدة — ثبّت ما فهمته الآن",
      strat: "القاعدة بعد الشرح",
      body: info.body,
      concepts: info.rule?.concepts?.length ? info.rule.concepts : info.bullets,
      art: ART[course.title] || [],
      note: "القاعدة تأتي بعد الشرح؛ اربطها بالمثال والإنفوجرافيك ولا تحفظها وحدها.",
      checks: [],
      __gfsUpgrade: VERSION
    };
  }

  function mapStage(course, info, pool) {
    const q = pool.shift();
    const steps = info.bullets.length > 1 ? info.bullets : ["ألاحظ المثال", "أحدد العلامة", "أطبق القاعدة", "أراجع النتيجة"];
    return {
      t: "summary",
      title: "خريطة مفاهيم — من الفكرة إلى التطبيق",
      strat: "الخريطة المفاهيمية",
      body: `اتبع المسار التالي عند تطبيق «${course.title}».`,
      bullets: steps.slice(0, 6).map((b, i) => `${i + 1}️⃣ ${b}`),
      art: ART[course.title] || [],
      checks: q ? [{ ...q, sn: "طبّق الخريطة" }] : [],
      __gfsUpgrade: VERSION
    };
  }

  function challengeStage(course, q, i) {
    const labels = {
      mcq: ["اختيار بصري", "اختر بعد التحليل"],
      tf: ["قرار سريع", "صح أم خطأ مع تعليل"],
      fill: ["أكمل بنفسك", "ابنِ الإجابة"],
      match: ["اربط العلاقات", "مطابقة ذكية"],
      err: ["صيد الخطأ", "اكتشف موضع الخلل"],
      sort: ["رتّب المسار", "أعد بناء الفكرة"]
    };
    const title = (labels[q?.t] || ["تحدّي مختلف", "فكّر ثم قرّر"])[i % 2];
    const cue = ["👁️ لاحظ", "🧠 حلّل", "🧩 اربط", "🎯 قرّر", "🔍 دقّق"][i % 5];
    return {
      t: "summary",
      title: `${cue} — ${title}`,
      strat: "تطبيق متدرّج",
      body: "اقرأ المعطى البصري أو المثال، ثم أجب. لا تعتمد على الحفظ؛ طبّق الفكرة.",
      bullets: [`📘 الدرس: ${course.title}`, "🔎 ابحث عن الدليل داخل المثال", "✅ اختر أو اكتب بعد التفكير"],
      art: ART[course.title] || [],
      checks: [{ ...q, sn: title }],
      __gfsUpgrade: VERSION
    };
  }

  function practicalStages(stages, course) {
    const keep = ["template", "sort", "errors", "problem", "produce"];
    return (stages || [])
      .filter(s => keep.includes(s?.t))
      .slice(0, 3)
      .map((s, i) => ({
        ...s,
        title: s.title || ["مختبر التطبيق", "محاكاة المهارة", "تحدّي الإنتاج"][i],
        checks: uniqueQuestions(s.checks || []).slice(0, 2),
        __gfsUpgrade: VERSION
      }));
  }

  function upgradeCourse(course) {
    if (!course?.id) return course;
    const stages = Array.isArray(course.stages) ? course.stages : [];
    const bank = diverseQuestions(course.bank || [], 25);
    const info = extractInfo(course, stages);
    const pool = getLearningPool(stages, bank);

    const newStages = [
      introStage(course, info),
      videoStage(course, stages, pool),
      explanationStage(course, info),
      visualStage(course, info, pool),
      ruleStage(course, info),
      mapStage(course, info, pool),
      ...practicalStages(stages, course),
      ...pool.slice(0, 8).map((q, i) => challengeStage(course, q, i))
    ];

    return {
      ...course,
      stages: newStages,
      bank: bank.length ? bank : course.bank,
      q: 25,
      __contentVersion: VERSION
    };
  }

  async function run() {
    try {
      if (localStorage.getItem(MARKER_KEY) === "done") return;
      const keys = await listKeys(COURSE_PREFIX);
      let changed = 0;
      for (const key of keys) {
        const course = await getKey(key);
        if (!course?.id) continue;
        const next = upgradeCourse(course);
        await setKey(key, next);
        changed++;
      }
      localStorage.setItem(MARKER_KEY, "done");
      if (changed) setTimeout(() => location.reload(), 250);
    } catch (e) {
      console.error("Course content upgrade v4 failed", e);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();
