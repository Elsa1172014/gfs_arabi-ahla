(() => {
  const VERSION = "2026-10-04-course-content-v6-innovative-assessment";
  const MARKER_KEY = `gfs:course-content-upgrade:${VERSION}`;
  const COURSE_PREFIX = "gfs:rec:course:";
  const API = "/api/storage";

  /* هذا الملف يغيّر محتوى الكورس فقط. لا يغيّر تسجيل الدخول أو الخروج أو النتائج أو الشهادات أو بنية المنصة. */
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
    "التشبيه المفصل": "JY0VJekdfuA",
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

  function extractExamples(stages) {
    const out = [];
    for (const s of stages || []) {
      if (Array.isArray(s?.items)) {
        for (const item of s.items) {
          const v = typeof item === "string" ? item : item?.w || item?.text || item?.sentence || item?.example;
          if (v) out.push(String(v));
        }
      }
      if (Array.isArray(s?.table?.rows)) {
        for (const row of s.table.rows) if (Array.isArray(row) && row[0]) out.push(String(row[0]));
      }
      if (Array.isArray(s?.bullets)) {
        for (const b of s.bullets) if (b && String(b).length < 120) out.push(String(b));
      }
    }
    return [...new Set(out.map(x => x.trim()).filter(Boolean))].slice(0, 5);
  }

  function extractInfo(course, stages) {
    const rule = stages.find(s => s?.t === "rule");
    const discover = stages.find(s => s?.t === "discover");
    const worked = stages.find(s => s?.t === "worked");
    const summary = stages.find(s => s?.t === "summary" && !String(s?.title || "").includes("مقدمة وتمهيد"));
    const body = rule?.body || discover?.reveal || worked?.intro || summary?.body || course.objective || `شرح ${course.title}`;
    const concepts = [];
    if (Array.isArray(rule?.concepts)) {
      for (const c of rule.concepts) {
        if (typeof c === "string") concepts.push({ label: c, note: "" });
        else if (c?.label || c?.note) concepts.push({ label: c.label || c.note, note: c.note || "" });
      }
    }
    if (!concepts.length && Array.isArray(summary?.bullets)) {
      summary.bullets.forEach(b => concepts.push({ label: String(b), note: "" }));
    }
    if (!concepts.length && Array.isArray(discover?.table?.rows)) {
      discover.table.rows.slice(0, 4).forEach(r => concepts.push({ label: String(r[0] || ""), note: String(r.slice(1).join(" — ")) }));
    }
    if (!concepts.length) concepts.push({ label: course.title, note: body });
    const examples = extractExamples(stages);
    return { rule, discover, worked, summary, body, concepts: concepts.slice(0, 6), examples };
  }

  function getLearningPool(stages, finalBank) {
    const finalSet = new Set((finalBank || []).map(x => norm(x?.q)));
    const checks = [];
    for (const s of stages || []) {
      for (const q of s?.checks || []) if (!finalSet.has(norm(q?.q))) checks.push(q);
    }
    return diverseQuestions(checks, 18);
  }

  function specificBullets(info) {
    return info.concepts.slice(0, 4).map((c, i) => {
      const icons = ["🔎", "🧩", "⚖️", "🎯"];
      return `${icons[i]} ${c.label}${c.note && c.note !== c.label ? ` — ${c.note}` : ""}`;
    });
  }

  function introStage(course, info) {
    const example = info.examples[0];
    const body = example
      ? `تأمّل المثال الآتي من درس «${course.title}»: «${example}». حاول فقط أن تلاحظ ما يحدث فيه؛ لا نريد منك حل سؤال الآن.`
      : `قبل مشاهدة الفيديو، اقرأ فكرة درس «${course.title}»: ${course.objective || info.body}`;
    const bullets = specificBullets(info);
    return {
      t: "summary",
      title: `تهيئة «${course.title}» — ادخل الفكرة من المثال`,
      strat: "تهيئة مرتبطة بالدرس",
      body,
      bullets: bullets.length ? bullets : [course.objective || info.body],
      art: ART[course.title] || [],
      note: example ? `بعد قليل ستعود إلى «${example}» لتفسّره بعد أن تفهم الدرس.` : `هذه التهيئة خاصة بدرس «${course.title}» وليست مقدمة عامة.`,
      checks: [],
      __gfsUpgrade: VERSION
    };
  }

  function videoStage(course, stages, pool, info) {
    const oldVideo = stages.find(s => s?.t === "video");
    const oldClips = Array.isArray(oldVideo?.clips) ? oldVideo.clips.filter(v => v?.id).slice(0, 2) : [];
    const mapped = VIDEO_IDS[course.title];
    const clips = oldClips.length ? oldClips : mapped ? [{ id: mapped, start: 0, label: `شرح ${course.title}` }] : [];
    const focus = info.concepts.slice(0, 2).map(c => c.label).join("، ");
    return {
      t: "video",
      title: `فيديو «${course.title}» — شاهد ثم تحقّق`,
      strat: "التعلّم المدمج",
      intro: `أثناء مشاهدة الفيديو ركّز تحديدًا على: ${focus || course.title}. بعد الفيديو ستجيب عن سؤالين من نفس المهارة قبل الانتقال.`,
      clips,
      videoQuery: clips.length ? undefined : `${course.title} شرح مبسط لغة عربية`,
      checks: pool.splice(0, Math.min(2, pool.length)).map((q, i) => ({ ...q, sn: ["تحقق من الفيديو", "التقط الفكرة الرئيسة"][i] })),
      __gfsUpgrade: VERSION
    };
  }

  function explanationStage(course, info) {
    const src = info.discover || info.worked;
    if (src) {
      return {
        ...src,
        title: `شرح «${course.title}» — نفهم المثال قبل القاعدة`,
        strat: "شرح قبل القاعدة",
        checks: [],
        __gfsUpgrade: VERSION
      };
    }
    return {
      t: "summary",
      title: `شرح «${course.title}» — المثال أولًا`,
      strat: "مثال ثم تفسير",
      body: info.examples[0] ? `نبدأ من المثال «${info.examples[0]}»، ثم نفهمه في ضوء الفكرة الآتية: ${info.body}` : info.body,
      bullets: specificBullets(info),
      note: "هنا نفهم الفكرة ومعناها قبل أن نقرأ القاعدة بصيغتها النهائية.",
      checks: [],
      __gfsUpgrade: VERSION
    };
  }

  function visualStage(course, info, pool) {
    const q = pool.shift();
    return {
      t: "summary",
      title: `إنفوجرافيك «${course.title}» — الصورة الكاملة`,
      strat: "التشفير البصري",
      body: `هذه خلاصة «${course.title}» في عناصر مترابطة، وكل عنصر مأخوذ من محتوى الدرس نفسه.`,
      bullets: specificBullets(info),
      art: ART[course.title] || [],
      note: info.examples[1] ? `جرّب أن تربط الخريطة بالمثال: «${info.examples[1]}».` : "اربط كل عنصر بما فهمته في الشرح السابق.",
      checks: q ? [{ ...q, sn: `سؤال على إنفوجرافيك ${course.title}` }] : [],
      __gfsUpgrade: VERSION
    };
  }

  function ruleStage(course, info) {
    return {
      ...(info.rule || {}),
      t: "rule",
      title: `قاعدة «${course.title}» — الآن فقط ثبّت ما فهمته`,
      strat: "القاعدة بعد الشرح",
      body: info.body,
      concepts: info.rule?.concepts?.length ? info.rule.concepts : info.concepts,
      art: ART[course.title] || [],
      note: info.examples[0] ? `طبّق القاعدة ذهنيًا على المثال الذي بدأت به: «${info.examples[0]}».` : "اربط القاعدة بالشرح السابق، ولا تحفظها منفصلة عنه.",
      checks: [],
      __gfsUpgrade: VERSION
    };
  }

  function mapStage(course, info, pool) {
    const q = pool.shift();
    const steps = info.concepts.slice(0, 5).map(c => c.label);
    return {
      t: "summary",
      title: `خريطة مفاهيم «${course.title}» — كيف أصل إلى الإجابة؟`,
      strat: "الخريطة المفاهيمية",
      body: `اتبع هذا المسار الخاص بمهارة «${course.title}» عند التطبيق.`,
      bullets: (steps.length ? steps : [info.body]).map((b, i) => `${i + 1}️⃣ ${b}`),
      art: ART[course.title] || [],
      checks: q ? [{ ...q, sn: `طبّق خريطة ${course.title}` }] : [],
      __gfsUpgrade: VERSION
    };
  }

  function challengeStage(course, q, i, info) {
    const labels = {
      mcq: ["اختيار بعد التحليل", "اختر الدليل الأدق"],
      tf: ["قرار مع تعليل", "احكم على الفكرة"],
      fill: ["ابنِ الإجابة", "أكمل من فهمك"],
      match: ["اربط العلاقات", "مطابقة ذكية"],
      err: ["صيد الخطأ", "صحّح الخلل"],
      sort: ["رتّب المسار", "أعد بناء الفكرة"]
    };
    const title = (labels[q?.t] || ["تطبيق مختلف", "فكّر ثم قرّر"])[i % 2];
    const example = info.examples[i % Math.max(1, info.examples.length)] || "";
    return {
      t: "summary",
      title: `${title} — ${course.title}`,
      strat: "تطبيق متدرّج",
      body: example ? `استدعِ المثال «${example}» وما تعلّمته منه، ثم انتقل إلى السؤال التالي.` : `طبّق قاعدة «${course.title}» على السؤال التالي؛ المطلوب فهم المهارة لا تكرار صيغة محفوظة.`,
      bullets: specificBullets(info).slice(0, 2),
      art: ART[course.title] || [],
      checks: [{ ...q, sn: title }],
      __gfsUpgrade: VERSION
    };
  }

  function practicalStages(stages) {
    const keep = ["template", "sort", "errors", "problem", "produce"];
    return (stages || [])
      .filter(s => keep.includes(s?.t))
      .slice(0, 3)
      .map((s) => ({
        ...s,
        checks: uniqueQuestions(s.checks || []).slice(0, 2),
        __gfsUpgrade: VERSION
      }));
  }

  function partsOfSpeechBank() {
    return [
      { t:"mcq", sn:"تصنيف في سياق", q:"في العبارة «عادَ خالدٌ من المدرسةِ مسرعًا»، أي ترتيب يصنّف الكلمات: عادَ ـ خالدٌ ـ من؟", o:["اسم ـ فعل ـ حرف","فعل ـ اسم ـ حرف","فعل ـ حرف ـ اسم","حرف ـ اسم ـ فعل"], a:1, e:"«عاد» فعل، «خالد» اسم، «من» حرف جر." },
      { t:"mcq", sn:"اكتشاف الدخيل", q:"أي مجموعة تحتوي كلمةً واحدة لا تنتمي إلى نوع الكلمات الأخرى؟", o:["كتاب ـ مدرسة ـ نافذة ـ يكتب","قرأ ـ جلس ـ انطلق ـ سافر","في ـ من ـ إلى ـ على","طالب ـ معلم ـ حديقة ـ مدينة"], a:0, e:"«يكتب» فعل، وبقية كلمات المجموعة أسماء." },
      { t:"mcq", sn:"الاستدلال بالعلامة", q:"كلمة تقبل «الـ» والتنوين. ما الحكم الأقوى عليها؟", o:["فعل لأنها تدل على حدث","اسم لأنها تقبل علامتين من علامات الاسم","حرف لأنها تربط الكلمات","لا يمكن تحديدها"], a:1, e:"قبول «الـ» والتنوين من علامات الاسم." },
      { t:"mcq", sn:"تحليل وظيفة", q:"في «سافرنا إلى العينِ صباحًا»، ما وظيفة كلمة «إلى» في بناء المعنى؟", o:["تسمّي مكانًا","تدل على حدث","تربط الفعل بالوجهة","تصف زمن السفر"], a:2, e:"«إلى» حرف جر يربط بين السفر والوجهة." },
      { t:"mcq", sn:"تغيير المعنى", q:"أي كلمة إذا وضعناها مكان الفراغ تجعل الجملة تبدأ بفعل: «___ الطالبُ واجبه»؟", o:["هذا","كتبَ","في","الطالبُ"], a:1, e:"«كتبَ» فعل ماضٍ يدل على حدث وقع." },

      { t:"tf", sn:"حكم مع تعليل", q:"في «العلمُ نورٌ»، كلتا الكلمتين اسمان رغم أن الثانية تصف الأولى.", a:true, e:"«العلم» و«نور» اسمان، والوظيفة في الجملة لا تغيّر قسم الكلمة." },
      { t:"tf", sn:"تمييز الزمن", q:"كل كلمة تدل على زمن تُعد فعلًا.", a:false, e:"قد يدل الاسم على الزمن مثل «صباح» و«يوم»؛ الفعل يدل على حدث مقترن بزمن." },
      { t:"tf", sn:"اختبار العلامات", q:"إذا قبلت الكلمة حرف الجر قبلها مثل «في المدرسةِ»، فهذا دليل يساعد على معرفة أنها اسم.", a:true, e:"الجر من علامات الاسم." },
      { t:"tf", sn:"فهم الحرف", q:"الحرف لا قيمة له في الجملة لأنه لا يدل على شخص أو حدث.", a:false, e:"الحرف يؤدي معنى مهمًا ويربط بين الكلمات، مثل «من» و«إلى»." },
      { t:"tf", sn:"سياق لغوي", q:"في «لن أتأخرَ»، كلمة «لن» فعل لأنها تؤثر في الفعل بعدها.", a:false, e:"«لن» حرف نصب، وتأثيرها في الفعل لا يجعلها فعلًا." },

      { t:"fill", sn:"إنتاج اسم", q:"أكمل بكلمة اسم مناسبة: «زارَ ___ المتحفَ» ثم اكتب الاسم فقط.", a:["الطالب","الطالبُ","محمد","خالد","أحمد","احمد","الطفل","المعلم"], e:"المطلوب اسم يصلح فاعلًا في السياق." },
      { t:"fill", sn:"إنتاج فعل", q:"أكمل بفعل مناسب: «___ الطائرُ فوق الشجرةِ» ثم اكتب الفعل فقط.", a:["طار","طارَ","وقف","وقفَ","حلق","حلّق","حلّقَ","جلس","جلسَ"], e:"المطلوب كلمة تدل على حدث مقترن بزمن." },
      { t:"fill", sn:"إنتاج حرف", q:"أكمل بحرف جر مناسب: «وضعتُ الكتابَ ___ الحقيبةِ».", a:["في","داخل"], e:"«في» حرف جر مناسب للسياق." },
      { t:"fill", sn:"تحويل النوع", q:"حوّل معنى «الكتابة» إلى فعل ماضٍ من الجذر نفسه، واكتب الفعل.", a:["كتب","كتبَ"], e:"«الكتابة» اسم، والفعل الماضي منها «كتبَ»." },
      { t:"fill", sn:"استخراج من سياق", q:"من الجملة «جلسَ الطفلُ على المقعدِ» استخرج الحرف فقط.", a:["على"], e:"«على» حرف جر." },

      { t:"match", sn:"تصنيف الكلمات", q:"صل كل كلمة بقسمها الصحيح.", pairs:[["الحديقة","اسم"],["يقرأ","فعل"],["إلى","حرف"]], e:"التصنيف يعتمد على معنى الكلمة وعلاماتها." },
      { t:"match", sn:"العلامة والدليل", q:"صل كل دليل بالقسم الذي يشير إليه.", pairs:[["يقبل التنوين","اسم"],["يدل على حدث وزمن","فعل"],["يربط بين الكلمات","حرف"]], e:"هذه مفاتيح عملية للتمييز بين الأقسام الثلاثة." },
      { t:"match", sn:"تحليل جملة", q:"صل كلمات الجملة «خرجَ سالمٌ من البيتِ» بأنواعها.", pairs:[["خرجَ","فعل"],["سالمٌ","اسم"],["من","حرف"],["البيتِ","اسم"]], e:"حلّل كل كلمة داخل سياقها." },
      { t:"match", sn:"المعنى والقسم", q:"صل الوصف بالمثال الأنسب.", pairs:[["شخص","المعلم"],["حدث في الماضي","وصلَ"],["علاقة مكانية","في"]], e:"الاسم يسمّي، والفعل يدل على حدث، والحرف يربط المعاني." },
      { t:"match", sn:"بناء جملة", q:"صل كل موضع في النموذج «___ الطفلُ ___ المدرسةِ» بالكلمة التي تكوّن جملة سليمة.", pairs:[["الموضع الأول","ذهبَ"],["الموضع الثاني","إلى"]], e:"«ذهبَ الطفلُ إلى المدرسةِ» تجمع فعلًا واسمًا وحرفًا." },

      { t:"err", sn:"محقق لغوي", q:"قيل إن الكلمات الآتية كلها أسماء. حدّد الكلمة التي تكشف خطأ هذا الحكم.", words:["كتاب","نافذة","يقرأ"], a:2, fix:"«يقرأ» فعل مضارع", e:"الكلمة تدل على حدث يحدث الآن أو يتجدد." },
      { t:"err", sn:"تصحيح تصنيف", q:"صُنّفت الكلمات على أنها أفعال. اختر الكلمة التي لا تنتمي إلى هذا التصنيف.", words:["كتبَ","يلعبُ","في"], a:2, fix:"«في» حرف جر", e:"«في» لا تدل على حدث؛ بل تربط بين الكلمات." },
      { t:"err", sn:"كشف المختلف", q:"ثلاث كلمات وُضعت تحت عنوان «حروف». اكتشف المختلفة.", words:["من","إلى","مدرسة"], a:2, fix:"«مدرسة» اسم", e:"«مدرسة» تسمّي مكانًا وتقبل «الـ» والجر." },
      { t:"err", sn:"تحليل السياق", q:"في تحليل «قرأَ عليٌّ في المكتبةِ» وُصفت الكلمات الآتية بأنها أسماء. اختر التصنيف الخاطئ.", words:["عليٌّ","المكتبةِ","قرأَ"], a:2, fix:"«قرأَ» فعل ماضٍ", e:"«قرأَ» يدل على حدث وقع في الزمن الماضي." },
      { t:"err", sn:"تدقيق قاعدة", q:"أي كلمة لا تصلح مثالًا على قاعدة «الاسم يقبل أل»؟", words:["الكتاب","المدرسة","اليكتب"], a:2, fix:"«يكتب» فعل ولا تدخل عليه «الـ»", e:"لا نستخدم «الـ» مع الفعل." }
    ];
  }

  function upgradeCourse(course) {
    if (!course?.id) return course;
    const stages = Array.isArray(course.stages) ? course.stages : [];
    const bank = course.title === "أقسام الكلام: اسم وفعل وحرف" ? partsOfSpeechBank() : diverseQuestions(course.bank || [], 25);
    const info = extractInfo(course, stages);
    const pool = getLearningPool(stages, bank);

    const newStages = [
      introStage(course, info),
      videoStage(course, stages, pool, info),
      explanationStage(course, info),
      visualStage(course, info, pool),
      ruleStage(course, info),
      mapStage(course, info, pool),
      ...practicalStages(stages),
      ...pool.slice(0, 8).map((q, i) => challengeStage(course, q, i, info))
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
      console.error("Course content upgrade v5 failed", e);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();