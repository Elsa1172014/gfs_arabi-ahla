(() => {
  const VERSION = "2026-09-12-visual-learning-v3";
  const MARKER_KEY = `gfs:course-content-upgrade:${VERSION}`;
  const COURSE_PREFIX = "gfs:rec:course:";
  const API = "/api/storage";

  const VIDEO_IDS = {
    "الهمزة المتوسطة": "N99RtSaAEj4",
    "الألف اللينة في آخر الأسماء": "3nbdyrRObf0",
    "الاستعارة التصريحية": "Is4R7o4u9XU",
    "الاستعارة المكنية": "Is4R7o4u9XU",
    "الطباق": "G9RFzCQXZGo",
    "التشبيه المرسل": "JY0VJekdfuA",
    "التشبيه المؤكد": "JY0VJekdfuA",
    "التشبيه المجمل": "JY0VJekdfuA",
    "التشبيه المفصَّل": "JY0VJekdfuA",
    "المقابلة": "G9RFzCQXZGo",
    "همزة الوصل وهمزة القطع": "R6ZyWeqebdw",
    "التاء المربوطة والتاء المفتوحة": "dsJRyz-D0Fo",
    "المبتدأ والخبر": "8LpQNzz7AMI",
    "كان وأخواتها": "Wckqa9spv5k",
    "الهمزة المتطرفة": "CnASFuLa51Q",
    "إنّ وأخواتها": "IdeZdpejhMw",
    "إن وأخواتها": "IdeZdpejhMw",
    "الحال": "962hd_-l8uM",
    "التشبيه التمثيلي": "JY0VJekdfuA",
    "التشبيه الضمني": "JY0VJekdfuA",
    "المفعول به": "b7CLeDUXUvE",
    "التمييز": "64f6tzdXsHg",
    "أقسام الكلام: اسم وفعل وحرف": "LXDtA9IZEWU",
    "الجملة الفعلية وأركانها": "yjPS3tn3DYo",
    "الأفعال الناصبة لمفعولين": "9MFEtrlfMcQ",
    "الأفعال التي تنصب مفعولين": "9MFEtrlfMcQ",
    "الفاعل ونائب الفاعل": "2tLJA0MfiJA"
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

  function visualText(item, courseTitle) {
    const q = String(item?.q || "");
    const quote = q.match(/«([^»]{1,70})»/u)?.[1];
    if (quote) return quote;
    if (item?.t === "mcq" && Array.isArray(item.o) && Number.isInteger(item.a)) {
      const correct = String(item.o[item.a] || "");
      if (correct.length && correct.length <= 55) return correct;
    }
    if (item?.t === "fill" && Array.isArray(item.a) && item.a[0] && String(item.a[0]).length <= 40) return String(item.a[0]);
    return courseTitle;
  }

  function enrichQuestion(item, courseTitle, index = 0) {
    if (!item) return item;
    return {
      ...item,
      q: String(item.q || "").replace(/^تحدّي\s*\d+\s*:\s*/u, "").replace(/^موقف\s*\d+\s*:\s*/u, "").trim(),
      img: item.img || visualText(item, courseTitle),
      sn: item.sn || ["لاحظ الصورة ثم قرّر", "حلّل ثم اختر", "تحدّي بصري", "طبّق القاعدة", "فكّر ثم أجب"][index % 5]
    };
  }

  function cleanBank(bank, title) {
    const out = [], seen = new Set();
    for (const raw of Array.isArray(bank) ? bank : []) {
      if (!raw) continue;
      const q = String(raw.q || "").replace(/^تحدّي\s*\d+\s*:\s*/u, "").replace(/^موقف\s*\d+\s*:\s*/u, "").trim();
      const key = norm(q || raw.sn);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(enrichQuestion({ ...raw, q }, title, out.length));
      if (out.length === 25) break;
    }
    return out;
  }

  function extractRule(course, base) {
    const rule = base.find(s => s?.t === "rule");
    const summary = [...base].reverse().find(s => s?.t === "summary");
    const body = rule?.body || summary?.body || course.objective || `تعلّم مهارة ${course.title} من خلال الفهم والتطبيق.`;
    let bullets = [];
    if (Array.isArray(rule?.concepts)) bullets = rule.concepts.map(x => typeof x === "string" ? x : x?.label).filter(Boolean);
    if (!bullets.length && Array.isArray(summary?.bullets)) bullets = summary.bullets.filter(Boolean);
    if (!bullets.length) bullets = [body];
    return { rule, body, bullets: bullets.slice(0, 6) };
  }

  function withoutChecks(stage, title) {
    if (!stage) return null;
    const copy = { ...stage, title: title || stage.title, checks: [], __gfsUpgrade: VERSION };
    return copy;
  }

  function buildIntro(course, info) {
    return {
      t: "summary",
      title: "مقدمة وتمهيد — افهم الفكرة أولًا",
      strat: "تهيئة بصرية",
      body: course.objective || info.body,
      bullets: [
        `🎯 ما المهارة التي سأتعلمها؟ ${course.title}`,
        "👀 لاحظ المثال قبل أن تحفظ القاعدة",
        "🧠 ابحث عن النمط أو العلاقة",
        "✍️ طبّق الفكرة على مثال جديد"
      ],
      art: ART[course.title] || [],
      note: "في هذه المرحلة لا توجد درجات. الهدف أن ترى الفكرة وتفهمها قبل القاعدة والأسئلة.",
      __gfsUpgrade: VERSION
    };
  }

  function buildVideo(course, oldStages, bank) {
    const oldVideo = oldStages.find(s => s?.t === "video");
    const oldClips = Array.isArray(oldVideo?.clips) ? oldVideo.clips.filter(x => x?.id).slice(0, 2) : [];
    const mapped = VIDEO_IDS[course.title];
    const clips = oldClips.length ? oldClips : mapped ? [{ id: mapped, start: 0, label: `شرح مبسّط: ${course.title}` }] : [];
    const checks = bank.slice(0, 2).map((q, i) => enrichQuestion(q, course.title, i));
    return {
      t: "video",
      title: "شاهد وافهم — فيديو ثم سؤالان فقط",
      strat: "التعلّم المدمج",
      intro: "شاهد الفيديو بتركيز. بعده ستجيب عن سؤالين قصيرين مرتبطين مباشرة بما شاهدته.",
      clips,
      videoQuery: clips.length ? undefined : `${course.title} شرح مبسط لغة عربية`,
      checks,
      __gfsUpgrade: VERSION
    };
  }

  function buildExplanation(course, base, info) {
    const discover = base.find(s => s?.t === "discover");
    const worked = base.find(s => s?.t === "worked");
    const src = discover || worked;
    if (src) return withoutChecks(src, "الشرح المبسّط — شاهد كيف تعمل الفكرة");
    return {
      t: "summary",
      title: "الشرح المبسّط — قبل القاعدة",
      strat: "مثال ثم تفسير",
      body: info.body,
      bullets: info.bullets.map((b, i) => `${i + 1}. ${typeof b === "string" ? b : String(b)}`),
      note: "اقرأ المثال وفسّره بلغتك، ثم انتقل إلى القاعدة.",
      __gfsUpgrade: VERSION
    };
  }

  function buildRule(course, info) {
    return {
      ...(info.rule || {}),
      t: "rule",
      title: "القاعدة — الآن فقط ثبّت ما فهمته",
      strat: "قاعدة بعد الفهم",
      body: info.body,
      concepts: info.rule?.concepts?.length ? info.rule.concepts : info.bullets,
      art: ART[course.title] || [],
      checks: [],
      note: "لا تحفظ الصياغة وحدها؛ اربطها بالمثال الذي شاهدته قبل قليل.",
      __gfsUpgrade: VERSION
    };
  }

  function buildMap(course, info, bank) {
    const q = bank[2] ? enrichQuestion(bank[2], course.title, 2) : null;
    return {
      t: "summary",
      title: "إنفوجرافيك وخريطة مفاهيم — الدرس في نظرة واحدة",
      strat: "التشفير البصري",
      body: `حوّل مهارة «${course.title}» إلى خطوات قصيرة يمكن تطبيقها بسرعة.`,
      bullets: info.bullets,
      art: ART[course.title] || [],
      checks: q ? [q] : [],
      note: "اقرأ الخريطة من اليمين إلى اليسار، ثم حاول شرحها بصوتك في عشرين ثانية.",
      __gfsUpgrade: VERSION
    };
  }

  function buildChallenges(course, bank, start = 3) {
    const qs = bank.slice(start, start + 8);
    const chunks = [];
    for (let i = 0; i < qs.length; i += 2) {
      const pair = qs.slice(i, i + 2).map((q, k) => enrichQuestion(q, course.title, start + i + k));
      chunks.push({
        t: "summary",
        title: ["تحدّي بصري — اكتشف", "تحدّي تطبيقي — حلّل", "تحدّي ذكي — قرّر", "تحدّي إتقان — علّل"][chunks.length % 4],
        strat: ["الملاحظة", "التحليل", "اتخاذ القرار", "التعليل"][chunks.length % 4],
        body: "كل سؤال هنا يختبر فكرة مختلفة. اقرأ البطاقة البصرية أولًا، ثم أجب.",
        bullets: ["👁️ لاحظ", "🧠 فكّر", "✅ أجب", "🔁 صحّح إن لزم"],
        checks: pair,
        __gfsUpgrade: VERSION
      });
    }
    return chunks;
  }

  function practicalStages(base, course) {
    const allowed = ["template", "sort", "errors", "problem", "produce"];
    return base.filter(s => allowed.includes(s?.t)).slice(0, 3).map((s, idx) => ({
      ...s,
      title: s.title || ["مختبر التطبيق", "نشاط المحاكاة", "تحدّي الإنتاج"][idx],
      checks: (s.checks || []).slice(0, 2).map((q, i) => enrichQuestion(q, course.title, i)),
      __gfsUpgrade: VERSION
    }));
  }

  const HAMZA_BANK = [
    {t:"mcq",q:"في «سُئِلَ» ما الحركة الأقوى؟",o:["الكسرة","الضمة","الفتحة","السكون"],a:0,e:"الهمزة مكسورة؛ والكسرة أقوى."},
    {t:"tf",q:"في كلمة «مؤمن» تناسب الضمةُ الواوَ.",a:true,e:"صحيح."},
    {t:"fill",q:"اكتب كرسي الهمزة المناسب في «مَسْـ…ـلَة». ",a:["أ"],e:"الفتحة أقوى من السكون."},
    {t:"mcq",q:"أي كتابة صحيحة لكلمة «فئة»؟",o:["فأة","فؤة","فئة","فءة"],a:2,e:"الكسرة تحسم الرسم على نبرة."},
    {t:"tf",q:"في «رؤية» كُتبت الهمزة على واو لأن الضمة هي الأقوى.",a:true,e:"صحيح."},
    {t:"fill",q:"أكمل «بِـ…ـر» بالكرسي المناسب.",a:["ئ"],e:"الكسرة أقوى من السكون."},
    {t:"mcq",q:"في «رئاسة» ما الكرسي الصحيح للهمزة؟",o:["ألف","واو","نبرة","سطر"],a:2,e:"الكسرة أقوى."},
    {t:"tf",q:"في «شؤون» تظهر الهمزة على واو.",a:true,e:"صحيح."},
    {t:"fill",q:"أكمل «مِـ…ـذنة» بالهمزة الصحيحة.",a:["ئ"],e:"ما قبلها مكسور."},
    {t:"mcq",q:"في «فأس» ما صورة الهمزة؟",o:["أ","ؤ","ئ","ء"],a:0,e:"الفتحة أقوى من السكون."},
    {t:"tf",q:"في «كأس» تكتب الهمزة على ألف.",a:true,e:"صحيح."},
    {t:"fill",q:"صحح كتابة «يأس» إذا أريد الفعل يَئِسَ.",a:["يئس","يَئِسَ"],e:"الهمزة مكسورة؛ فتكتب على نبرة."},
    {t:"mcq",q:"في «سأل» ما الحركة التي حسمت الكرسي؟",o:["الكسرة","الضمة","الفتحة","السكون"],a:2,e:"الفتحة."},
    {t:"tf",q:"في «يؤدي» تظهر الهمزة على واو.",a:true,e:"صحيح."},
    {t:"fill",q:"اكتب الكلمة صحيحة: «مءسسة».",a:["مؤسسة"],e:"تكتب على واو."},
    {t:"mcq",q:"أي رسم صحيح في «لؤلؤ»؟",o:["لألأ","لؤلؤ","لئلئ","لءلء"],a:1,e:"الرسم الصحيح لؤلؤ."},
    {t:"tf",q:"في «مروءة» تظهر إحدى الهمزات على السطر.",a:true,e:"صحيح."},
    {t:"fill",q:"اكتب الكلمة صحيحة: «قرائة».",a:["قراءة"],e:"الهمزة على السطر بعد الألف."},
    {t:"mcq",q:"أي كتابة صحيحة؟",o:["عبائة","عباءة","عبائةً","عبؤة"],a:1,e:"الصواب عباءة."},
    {t:"tf",q:"في «ضوئية» تكتب الهمزة على نبرة.",a:true,e:"صحيح."},
    {t:"fill",q:"اكتب الكلمة صحيحة: «مطمأن».",a:["مطمئن"],e:"الكسرة أقوى."},
    {t:"mcq",q:"أي كلمة صحيحة؟",o:["ناشأة","ناشؤة","ناشئة","ناشءة"],a:2,e:"الصواب ناشئة."},
    {t:"tf",q:"في «رئة» الهمزة على نبرة.",a:true,e:"صحيح."},
    {t:"fill",q:"اكتب الكلمة الصحيحة: «تئثير».",a:["تأثير"],e:"الصواب تأثير."},
    {t:"mcq",q:"أي كتابة صحيحة؟",o:["مئساة","مؤساة","مأساة","مءساة"],a:2,e:"الصواب مأساة."}
  ].map((q,i)=>enrichQuestion(q,"الهمزة المتوسطة",i));

  const HAMZA_STAGES = [
    {t:"summary",title:"مقدمة وتمهيد — شاهد الفكرة قبل السؤال",strat:"تهيئة بصرية",body:"الهمزة المتوسطة لا تُرسم عشوائيًا. سننظر إلى حركة الهمزة وحركة الحرف الذي قبلها، ثم نقارن القوتين.",bullets:["بِئْر ← ئ","مُؤْمِن ← ؤ","مَسْأَلَة ← أ","قِرَاءَة ← ء"],art:["hamza-anatomy"],note:"لا سؤال الآن. فقط لاحظ اختلاف صورة الهمزة.",__gfsUpgrade:VERSION},
    {t:"video",title:"شاهد وافهم — فيديو واحد مركز",strat:"التعلّم المدمج",intro:"شاهد الفيديو أولًا، ثم أجب عن سؤالين فقط.",clips:[{id:"N99RtSaAEj4",start:0,label:"شرح الهمزة المتوسطة"}],checks:[enrichQuestion({t:"mcq",q:"ما الحركتان اللتان نقارنهما؟",o:["الهمزة وما قبلها","أول الكلمة وآخرها","ما بعدها فقط","عدد الحروف"],a:0,e:"نقارن حركة الهمزة وحركة ما قبلها."},"الهمزة المتوسطة",0),enrichQuestion({t:"tf",q:"الكسرة أقوى من الضمة.",a:true,e:"صحيح."},"الهمزة المتوسطة",1)],__gfsUpgrade:VERSION},
    {t:"worked",title:"الشرح المبسّط — كيف أتخذ القرار؟",strat:"النمذجة المتدرّجة",intro:"شاهد خطوات الحل قبل القاعدة.",items:[{w:"سُئِلَ",steps:["حركة الهمزة: كسرة","حركة ما قبلها: ضمة","الكسرة أقوى","إذن تكتب على نبرة: ئ"]},{w:"مُؤْمِن",steps:["الهمزة ساكنة","ما قبلها مضموم","الضمة أقوى من السكون","إذن تكتب على واو: ؤ"]}],checks:[],__gfsUpgrade:VERSION},
    {t:"rule",title:"القاعدة — بعد أن فهمت المثال",strat:"قاعدة بعد الفهم",body:"رتّب قوة الحركات: الكسرة ثم الضمة ثم الفتحة ثم السكون. قارن حركة الهمزة بحركة ما قبلها، والحركة الأقوى تحدد الكرسي: الكسرة ← ئ، الضمة ← ؤ، الفتحة ← أ.",concepts:["الكسرة ← ئ","الضمة ← ؤ","الفتحة ← أ","السكون هو الأضعف"],art:["hamza-scale"],checks:[],note:"القاعدة الآن تلخّص ما شاهدته في المثال.",__gfsUpgrade:VERSION},
    {t:"summary",title:"إنفوجرافيك — سلم قوة الحركات",strat:"التشفير البصري",body:"كلما ارتفعت قوة الحركة ارتفع تأثيرها في كرسي الهمزة.",bullets:["🥇 الكسرة ِ ← ئ","🥈 الضمة ُ ← ؤ","🥉 الفتحة َ ← أ","السكون ْ ← الأضعف"],art:["hamza-scale"],checks:[HAMZA_BANK[0]],__gfsUpgrade:VERSION},
    {t:"worked",title:"على الألف — عندما تفوز الفتحة",strat:"مثال مرئي",intro:"طبّق على مثالين مختلفين.",items:[{w:"سَأَلَ",steps:["الهمزة مفتوحة","ما قبلها مفتوح","الفتحة هي الأقوى","الكرسي: أ"]},{w:"مَسْأَلَة",steps:["الهمزة مفتوحة","ما قبلها ساكن","الفتحة أقوى","الكرسي: أ"]}],checks:[HAMZA_BANK[2],HAMZA_BANK[9]],__gfsUpgrade:VERSION},
    {t:"worked",title:"على الواو — عندما تفوز الضمة",strat:"مثال مرئي",intro:"لاحظ الضمة وهي تحسم القرار.",items:[{w:"مُؤْمِن",steps:["الهمزة ساكنة","ما قبلها مضموم","الضمة أقوى","الكرسي: ؤ"]},{w:"رُؤْيَة",steps:["الهمزة ساكنة","ما قبلها مضموم","الكرسي: ؤ"]}],checks:[HAMZA_BANK[1],HAMZA_BANK[13]],__gfsUpgrade:VERSION},
    {t:"worked",title:"على النبرة — عندما تفوز الكسرة",strat:"مثال مرئي",intro:"الكسرة هي الأقوى؛ لذلك تظهر النبرة كثيرًا.",items:[{w:"بِئْر",steps:["الهمزة ساكنة","ما قبلها مكسور","الكسرة أقوى","الكرسي: ئ"]},{w:"فِئَة",steps:["الهمزة مفتوحة","ما قبلها مكسور","الكسرة أقوى","الكرسي: ئ"]}],checks:[HAMZA_BANK[3],HAMZA_BANK[5]],__gfsUpgrade:VERSION},
    {t:"summary",title:"حالات خاصة — عندما يظهر السطر",strat:"الانتباه إلى البنية",body:"بعض الكلمات تحتاج النظر إلى حرف المد وبنية الكلمة، مثل: قراءة، عباءة، مروءة.",bullets:["قراءة","عباءة","مروءة","افحص الكلمة كاملة"],checks:[HAMZA_BANK[16],HAMZA_BANK[17]],__gfsUpgrade:VERSION},
    {t:"summary",title:"خريطة المفاهيم — القرار في أربع خطوات",strat:"الخريطة المفاهيمية",body:"حدّد → قارن → اختر → علّل.",bullets:["1️⃣ حركة الهمزة","2️⃣ حركة ما قبلها","3️⃣ الأقوى","4️⃣ الكرسي المناسب"],art:["hamza-anatomy","hamza-scale"],checks:[HAMZA_BANK[20]],__gfsUpgrade:VERSION},
    {t:"template",title:"مختبر الهمزة — حلّل الكلمات بنفسك",strat:"التعلّم بالقالب",cols:["الكلمة","حركة الهمزة","حركة ما قبلها","الأقوى","الرسم"],rows:[["يَئِسَ","كسرة","فتحة","الكسرة","ئ"],["رُؤُوس","ضمة","ضمة","الضمة","ؤ"],["مَأْذَنَة","سكون","فتحة","الفتحة","أ"],["مَرُوءَة","فتحة","واو ساكنة","حالة خاصة","ء"]],opts:{1:["كسرة","ضمة","فتحة","سكون"],2:["كسرة","ضمة","فتحة","سكون","واو ساكنة"],3:["الكسرة","الضمة","الفتحة","السكون","حالة خاصة"],4:["ئ","ؤ","أ","ء"]},__gfsUpgrade:VERSION}
  ];

  function upgradeCourse(course) {
    if (!course || !course.id) return course;
    if (course.title === "الهمزة المتوسطة") {
      return { ...course, q:25, stages:HAMZA_STAGES, bank:HAMZA_BANK, contentVersion:VERSION };
    }

    const oldStages = Array.isArray(course.stages) ? course.stages : [];
    const base = oldStages.filter(s => !s?.__gfsUpgrade);
    const info = extractRule(course, base.length ? base : oldStages);
    const bank = cleanBank(course.bank, course.title);
    const stages = [];
    stages.push(buildIntro(course, info));
    stages.push(buildVideo(course, oldStages, bank));
    stages.push(buildExplanation(course, base.length ? base : oldStages, info));
    stages.push(buildRule(course, info));
    stages.push(buildMap(course, info, bank));
    stages.push(...practicalStages(base.length ? base : oldStages, course));
    stages.push(...buildChallenges(course, bank, 3));
    stages.push({t:"summary",title:"الخلاصة — راجع قبل الاختبار",strat:"مراجعة ذكية",body:info.body,bullets:info.bullets,note:"بعد إكمال رحلة التعلم يُفتح الاختبار النهائي. الاختبار وحده يحدد النجاح.",__gfsUpgrade:VERSION});
    return { ...course, q:25, stages, bank, contentVersion:VERSION };
  }

  async function run() {
    try {
      const marker = await getKey(MARKER_KEY);
      if (marker?.done) return;
      let keys = [];
      for (let i=0;i<6;i++) {
        keys = await listKeys(COURSE_PREFIX);
        if (keys.length) break;
        await new Promise(r=>setTimeout(r,1200));
      }
      if (!keys.length) return;
      let changed = 0;
      for (const key of keys) {
        try {
          const course = await getKey(key);
          if (!course || course.contentVersion === VERSION) continue;
          await setKey(key, upgradeCourse(course));
          changed++;
        } catch (e) { console.warn("course upgrade skipped", key, e); }
      }
      await setKey(MARKER_KEY,{done:true,version:VERSION,changed,total:keys.length,at:new Date().toISOString()});
      if (changed) {
        const rk=`gfs:upgrade-reloaded:${VERSION}`;
        if(!sessionStorage.getItem(rk)){sessionStorage.setItem(rk,"1");setTimeout(()=>location.reload(),500);}
      }
    } catch(e){console.warn("course upgrade failed",e);}
  }

  if(document.readyState==="complete")setTimeout(run,1200);
  else window.addEventListener("load",()=>setTimeout(run,1200),{once:true});
})();
