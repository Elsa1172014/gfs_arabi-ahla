(() => {
  const VERSION = "2026-09-12-content-v2";
  const MARKER_KEY = `gfs:course-content-upgrade:${VERSION}`;
  const COURSE_PREFIX = "gfs:rec:course:";
  const API = "/api/storage";

  /* فيديوهات تمت مراجعة موضوعها يدويًا. لا نضع فيديو غير متعلق بالدرس. */
  const VIDEO_IDS = {
    "الهمزة المتوسطة": "Zu6W9eO6B8Q",
    "الفاعل ونائب الفاعل": "2tLJA0MfiJA",
    "الألف اللينة في آخر الأسماء": "3nbdyrRObf0",
    "الاستعارة التصريحية": "Is4R7o4u9XU",
    "الاستعارة المكنية": "Is4R7o4u9XU",
    "التشبيه المرسل": "JY0VJekdfuA",
    "التشبيه المؤكد": "JY0VJekdfuA",
    "التشبيه المجمل": "JY0VJekdfuA",
    "التشبيه المفصَّل": "JY0VJekdfuA",
    "التشبيه التمثيلي": "JY0VJekdfuA",
    "التشبيه الضمني": "JY0VJekdfuA",
    "همزة الوصل وهمزة القطع": "R6ZyWeqebdw",
    "الهمزة المتطرفة": "CnASFuLa51Q",
    "المبتدأ والخبر": "8LpQNzz7AMI",
    "أقسام الكلام: اسم وفعل وحرف": "LXDtA9IZEWU",
    "المفعول به": "b7CLeDUXUvE",
    "المفعول فيه (ظرف الزمان والمكان)": "b7CLeDUXUvE",
    "المفعول معه": "b7CLeDUXUvE",
    "المفعول المطلق": "b7CLeDUXUvE",
    "المفعول لأجله": "b7CLeDUXUvE",
    "المقابلة": "G9RFzCQXZGo"
  };

  const ART_BY_TITLE = {
    "الهمزة المتوسطة": ["hamza-anatomy", "hamza-scale"],
    "الفاعل ونائب الفاعل": ["passive-flow"],
    "الألف اللينة في آخر الأسماء": ["alif-tree"]
  };

  const normalize = (s) => String(s || "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim().toLowerCase();

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

  function stripUpgradePrefix(q) {
    return String(q || "")
      .replace(/^تحدّي\s*\d+\s*:\s*/u, "")
      .replace(/^موقف\s*\d+\s*:\s*/u, "")
      .replace(/^حلّل ثم اختر\s*:\s*/u, "")
      .trim();
  }

  function cleanBank(bank) {
    if (!Array.isArray(bank)) return [];
    const out = [], seen = new Set();
    for (const raw of bank) {
      if (!raw) continue;
      const q = stripUpgradePrefix(raw.q);
      const key = normalize(q || raw.sn);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({ ...raw, q });
      if (out.length === 25) break;
    }
    return out;
  }

  function getRuleInfo(course, oldStages, cleanStages) {
    const upgradedRule = oldStages.find(s => s?.t === "rule" && s?.__gfsUpgrade);
    const originalRule = cleanStages.find(s => s?.t === "rule");
    const visual = oldStages.find(s => s?.__gfsUpgrade && Array.isArray(s?.bullets) && s.bullets.length);
    const summary = [...cleanStages].reverse().find(s => s?.t === "summary");
    const ruleText = upgradedRule?.body || originalRule?.body || summary?.body || course.objective || `تعلّم مهارة ${course.title} من خلال الملاحظة والتطبيق.`;
    const bullets = visual?.bullets?.length ? visual.bullets :
      summary?.bullets?.length ? summary.bullets :
      originalRule?.concepts?.length ? originalRule.concepts :
      [course.objective || ruleText];
    return { ruleText, bullets, originalRule };
  }

  function warmupFor(course, ruleInfo) {
    if (course.title === "الهمزة المتوسطة") {
      return {
        t: "rule", title: "تهيئة — فكّر قبل أن تشاهد", strat: "استدعاء المعرفة السابقة",
        body: "أمامك كلمات تتغيّر فيها صورة الهمزة. لا تحفظ الرسم؛ ابحث أولًا عن الحركة الأقوى.",
        art: ["hamza-anatomy"],
        checks: [
          { t: "mcq", q: "في كلمة «سُئِلَ»؛ ما حركة الهمزة؟", o: ["الكسرة", "الضمة", "الفتحة", "السكون"], a: 0, e: "الهمزة مكسورة، والكسرة أقوى الحركات." },
          { t: "tf", q: "عند رسم الهمزة المتوسطة ننظر إلى حركة الهمزة وحركة الحرف الذي قبلها.", a: true, e: "صحيح؛ ثم نأخذ أقوى الحركتين." },
          { t: "match", q: "صل كل حركة بما يناسبها من كرسي الهمزة.", pairs: [["الكسرة", "نبرة ئ"], ["الضمة", "واو ؤ"], ["الفتحة", "ألف أ"], ["السكون", "السطر ء"]], e: "هذه خريطة القرار الأساسية." }
        ],
        __gfsUpgrade: VERSION
      };
    }
    const b = ruleInfo.bullets || [];
    const first = b[0] || course.objective || ruleInfo.ruleText;
    const second = b[1] || ruleInfo.ruleText;
    return {
      t: "rule", title: "تهيئة — ماذا تلاحظ؟", strat: "ملاحظة واستنتاج",
      body: `ابدأ من عنوان الدرس «${course.title}». اقرأ الهدف، ثم توقّع القاعدة قبل مشاهدة الفيديو.`,
      checks: [
        { t: "mcq", q: `أي خطوة ترتبط مباشرة بمهارة «${course.title}»؟`, o: [first, "تجاوز الأمثلة والبدء بالاختبار", "حفظ شكل الإجابة دون فهم", "اختيار إجابة عشوائية"], a: 0, e: `التركيز هنا على: ${first}` },
        { t: "tf", q: second, a: true, e: ruleInfo.ruleText }
      ],
      __gfsUpgrade: VERSION
    };
  }

  function videoFor(course, oldStages, ruleInfo) {
    const previous = oldStages.find(s => s?.t === "video");
    const preservedClips = Array.isArray(previous?.clips) ? previous.clips.filter(v => v?.id) : [];
    const mapped = VIDEO_IDS[course.title];
    const clips = preservedClips.length ? preservedClips : mapped ? [{ id: mapped, start: 0, label: `شرح ${course.title}` }] : [];
    const stage = {
      t: "video", title: "شاهد ثم طبّق", strat: "التعلّم المدمج",
      intro: `شاهد الشرح الخاص بدرس «${course.title}» بتركيز. بعده ستجيب عن تحقق قصير قبل الانتقال.`,
      clips,
      videoQuery: clips.length ? undefined : `${course.title} شرح مبسط لغة عربية`,
      __gfsUpgrade: VERSION
    };
    if (course.title === "الهمزة المتوسطة") {
      stage.checks = [
        { t: "mcq", q: "بعد الشرح: ما ترتيب قوة الحركات من الأقوى إلى الأضعف؟", o: ["الكسرة، الضمة، الفتحة، السكون", "الضمة، الكسرة، السكون، الفتحة", "الفتحة، الضمة، الكسرة، السكون", "السكون، الفتحة، الضمة، الكسرة"], a: 0, e: "الكسرة ثم الضمة ثم الفتحة ثم السكون." },
        { t: "tf", q: "إذا كانت الكسرة إحدى الحركتين فإنها تحسم رسم الهمزة على نبرة غالبًا.", a: true, e: "الكسرة أقوى الحركات." },
        { t: "fill", q: "اكتب كلمة صحيحة فيها همزة متوسطة على واو.", a: ["مؤمن", "مسؤول", "رؤوس", "تفاؤل", "مُؤْمِن"], e: "أي مثال صحيح من هذه الأمثلة مقبول." }
      ];
    } else {
      const b = ruleInfo.bullets || [];
      stage.checks = [
        { t: "tf", q: ruleInfo.ruleText, a: true, e: "هذه هي الفكرة الرئيسة في الدرس." },
        { t: "mcq", q: "أي نقطة من الآتي ينبغي أن تستخدمها عند التطبيق؟", o: [b[1] || b[0] || course.objective, "أتجاهل القاعدة", "أحفظ الإجابة نفسها", "أختار بلا تعليل"], a: 0, e: b[1] || b[0] || ruleInfo.ruleText }
      ];
    }
    return stage;
  }

  function simpleRuleStage(course, ruleInfo) {
    const art = ART_BY_TITLE[course.title] || [];
    return {
      ...(ruleInfo.originalRule || {}),
      t: "rule", title: "القاعدة بأبسط صورة", strat: "شرح مباشر مبسّط",
      body: ruleInfo.ruleText,
      concepts: ruleInfo.originalRule?.concepts?.length ? ruleInfo.originalRule.concepts : ruleInfo.bullets,
      art,
      note: "افهم الفكرة أولًا، ثم طبّقها على مثال جديد. لا تعتمد على حفظ المثال.",
      __gfsUpgrade: VERSION
    };
  }

  function visualStage(course, ruleInfo) {
    return {
      t: "summary", title: "إنفوجرافيك — خريطة القرار", strat: "التشفير البصري",
      body: `حوّل قاعدة «${course.title}» إلى خطوات قصيرة قابلة للتطبيق.`,
      bullets: ruleInfo.bullets.slice(0, 6),
      art: ART_BY_TITLE[course.title] || [],
      note: "اشرح الخريطة بصوتك في عشرين ثانية، ثم انتقل إلى التطبيق.",
      __gfsUpgrade: VERSION
    };
  }

  function upgradeCourse(course) {
    if (!course || !course.id) return course;
    const oldStages = Array.isArray(course.stages) ? course.stages : [];
    const cleanStages = oldStages.filter(s => !s?.__gfsUpgrade);
    const ruleInfo = getRuleInfo(course, oldStages, cleanStages);

    const discover = cleanStages.filter(s => s?.t === "discover");
    const worked = cleanStages.filter(s => ["worked", "template", "sort", "errors", "problem", "produce"].includes(s?.t));
    const summaries = cleanStages.filter(s => s?.t === "summary");
    const other = cleanStages.filter(s => !["discover", "worked", "template", "sort", "errors", "problem", "produce", "summary", "video", "rule"].includes(s?.t));

    const stages = [
      warmupFor(course, ruleInfo),
      videoFor(course, oldStages, ruleInfo),
      ...discover,
      simpleRuleStage(course, ruleInfo),
      visualStage(course, ruleInfo),
      ...worked,
      ...other,
      ...summaries
    ];

    return {
      ...course,
      q: 25,
      stages,
      bank: cleanBank(course.bank),
      contentVersion: VERSION
    };
  }

  async function runUpgrade() {
    try {
      const marker = await getKey(MARKER_KEY);
      if (marker?.done) return;
      let keys = [];
      for (let i = 0; i < 8; i++) {
        keys = await listKeys(COURSE_PREFIX);
        if (keys.length) break;
        await new Promise(r => setTimeout(r, 1200));
      }
      if (!keys.length) return;

      let changed = 0;
      for (const key of keys) {
        const course = await getKey(key);
        if (!course || course.contentVersion === VERSION) continue;
        await setKey(key, upgradeCourse(course));
        changed++;
      }
      await setKey(MARKER_KEY, { done: true, version: VERSION, changed, total: keys.length, at: new Date().toISOString() });
      if (changed) {
        const reloadKey = `gfs:upgrade-reloaded:${VERSION}`;
        if (!sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, "1");
          setTimeout(() => location.reload(), 500);
        }
      }
    } catch (e) {
      console.warn("GFS course content v2 upgrade failed", e);
    }
  }

  if (document.readyState === "complete") setTimeout(runUpgrade, 1000);
  else window.addEventListener("load", () => setTimeout(runUpgrade, 1000), { once: true });
})();