(() => {
  const VERSION = "2026-09-12-content-v1";
  const MARKER_KEY = `gfs:course-content-upgrade:${VERSION}`;
  const COURSE_PREFIX = "gfs:rec:course:";
  const API = "/api/storage";

  const EXACT_VIDEO = {
    "الهمزة المتوسطة": "Zu6W9eO6B8Q",
    "الفاعل ونائب الفاعل": "2tLJA0MfiJA",
    "الألف اللينة في آخر الأسماء": "3nbdyrRObf0",
    "همزة الوصل وهمزة القطع": "R6ZyWeqebdw",
    "كان وأخواتها": "Wckqa9spv5k",
    "المقابلة": "G9RFzCQXZGo"
  };

  const RULES = {
    "الهمزة المتوسطة": {
      rule: "انظر إلى حركة الهمزة وحركة الحرف الذي قبلها، ثم اختر أقوى الحركتين: الكسرة ثم الضمة ثم الفتحة ثم السكون. الكسرة تناسبها النبرة، والضمة الواو، والفتحة الألف، والسكون السطر في مواضعه.",
      bullets: ["👁️ حدّد حركة الهمزة", "🔎 حدّد حركة ما قبلها", "⚖️ اختر الأقوى", "✍️ ارسم الهمزة على كرسيها المناسب"]
    },
    "الفاعل ونائب الفاعل": {
      rule: "الفاعل اسم مرفوع قام بالفعل. وعند بناء الفعل للمجهول يُحذف الفاعل، ويتحوّل المفعول به إلى نائب فاعل مرفوع.",
      bullets: ["🟦 معلوم: ابحث عمّن قام بالفعل", "🔄 مجهول: غيّر ضبط الفعل", "⬆️ ارفع نائب الفاعل", "🧠 لا تخلط بين الفاعل والمفعول"]
    },
    "الألف اللينة في آخر الأسماء": {
      rule: "في الاسم الثلاثي نعرف أصل الألف بالتثنية أو الجمع: إن ظهر أصلها واوًا كتبت قائمة، وإن ظهر ياء كتبت مقصورة. وفوق الثلاثي تكتب مقصورة غالبًا، إلا إذا سبقتها ياء فتكتب قائمة.",
      bullets: ["3️⃣ ثلاثي؟ ابحث عن الأصل", "واو ← ا", "ياء ← ى", "➕ فوق الثلاثي: ى إلا بعد ياء"]
    },
    "الاستعارة التصريحية": {
      rule: "الاستعارة التصريحية تشبيه حُذف منه المشبَّه وصُرِّح بالمشبَّه به، وتوجد قرينة تمنع إرادة المعنى الحقيقي.",
      bullets: ["🫥 المشبَّه محذوف", "🎯 المشبَّه به مذكور", "🔍 ابحث عن القرينة", "💡 فسّر الصورة البلاغية"]
    },
    "الاستعارة المكنية": {
      rule: "في الاستعارة المكنية نذكر المشبَّه ونحذف المشبَّه به، ثم نذكر شيئًا من لوازمه يدل عليه.",
      bullets: ["👤 المشبَّه موجود", "🫥 المشبَّه به محذوف", "🧩 لازمة تكشف المحذوف", "🎨 الصورة تمنح المعنى حياة"]
    },
    "الطباق": {
      rule: "الطباق هو الجمع بين لفظين متضادين في المعنى. إن كانا مثبتين فهو طباق إيجاب، وإن كان أحدهما منفيًا والآخر مثبتًا فهو طباق سلب.",
      bullets: ["↔️ ابحث عن التضاد", "➕ إيجاب: الطرفان مثبتان", "➖ سلب: نفي وإثبات", "✨ الأثر: إبراز المعنى"]
    },
    "التشبيه المرسل": {
      rule: "التشبيه المرسل هو التشبيه الذي ذُكرت فيه أداة التشبيه مثل: الكاف، مثل، كأنّ، يشبه.",
      bullets: ["👤 مشبَّه", "🔗 أداة ظاهرة", "🌟 مشبَّه به", "🎯 حدّد وجه الشبه إن وجد"]
    },
    "التشبيه المؤكد": {
      rule: "التشبيه المؤكد هو ما حُذفت منه أداة التشبيه، فيبدو الاتصال بين المشبَّه والمشبَّه به أقوى.",
      bullets: ["👤 مشبَّه", "🚫 لا أداة", "🌟 مشبَّه به", "💪 الحذف يقوّي الصورة"]
    },
    "التشبيه المجمل": {
      rule: "التشبيه المجمل هو ما حُذف منه وجه الشبه، فيستنتجه القارئ من السياق.",
      bullets: ["👤 مشبَّه", "🌟 مشبَّه به", "❓ وجه الشبه محذوف", "🧠 استنتجه من المعنى"]
    },
    "التشبيه المفصَّل": {
      rule: "التشبيه المفصَّل هو ما ذُكر فيه وجه الشبه صراحة، لذلك يكون المعنى المقصود أوضح.",
      bullets: ["👤 مشبَّه", "🌟 مشبَّه به", "🎯 وجه الشبه مذكور", "🔎 حدّده بدقة"]
    },
    "المقابلة": {
      rule: "المقابلة أن نأتي بمعنيين أو أكثر ثم نأتي بما يقابلها من المعاني المضادة بالترتيب نفسه.",
      bullets: ["1️⃣ حدّد المجموعة الأولى", "2️⃣ ابحث عن أضدادها", "🔁 راقب الترتيب", "✨ بيّن أثر المقابلة"]
    },
    "همزة الوصل وهمزة القطع": {
      rule: "همزة القطع تُنطق في البدء والوصل وتُرسم همزة، أما همزة الوصل فتُنطق في البدء وتسقط في درج الكلام وتُرسم ألفًا بلا رأس همزة.",
      bullets: ["🔊 انطق في أول الكلام", "🔗 صِل بما قبلها", "✂️ القطع ثابتة النطق", "🌉 الوصل تسقط في الوصل"]
    },
    "التاء المربوطة والتاء المفتوحة": {
      rule: "التاء المربوطة تُنطق هاء عند الوقف وتاء عند الوصل، أما التاء المفتوحة فتبقى تاء في الوقف والوصل.",
      bullets: ["⏸️ قف على الكلمة", "ـة ← هاء عند الوقف", "ت ← تبقى تاء", "✍️ راقب نوع الكلمة"]
    },
    "المبتدأ والخبر": {
      rule: "الجملة الاسمية تبدأ غالبًا بمبتدأ مرفوع، ويأتي الخبر ليتمم المعنى وهو مرفوع أيضًا، وقد يكون مفردًا أو جملة أو شبه جملة.",
      bullets: ["🏁 ابدأ بالمبتدأ", "💬 الخبر يتمم المعنى", "⬆️ كلاهما مرفوع", "🧩 حدّد نوع الخبر"]
    },
    "كان وأخواتها": {
      rule: "كان وأخواتها تدخل على الجملة الاسمية، فترفع المبتدأ ويسمى اسمها، وتنصب الخبر ويسمى خبرها.",
      bullets: ["🚪 تدخل على جملة اسمية", "⬆️ اسمها مرفوع", "⬇️ خبرها منصوب", "🕒 لكل فعل دلالة"]
    },
    "الهمزة المتطرفة": {
      rule: "رسم الهمزة المتطرفة يعتمد على حركة الحرف الذي قبلها فقط: الكسرة نبرة، الضمة واو، الفتحة ألف، والسكون سطر.",
      bullets: ["👀 انظر لما قبل الهمزة", "ِ ← ئ", "ُ ← ؤ", "َ ← أ، السكون ← ء"]
    },
    "إنّ وأخواتها": {
      rule: "إنّ وأخواتها حروف ناسخة تدخل على الجملة الاسمية، فتنصب المبتدأ ويسمى اسمها، وترفع الخبر ويسمى خبرها.",
      bullets: ["🚪 تدخل على الجملة الاسمية", "⬇️ اسمها منصوب", "⬆️ خبرها مرفوع", "🎯 لكل حرف معنى"]
    },
    "النعت": {
      rule: "النعت تابع يصف اسمًا قبله يسمى المنعوت، ويتبعه في الإعراب والتعريف والتنكير والتذكير والتأنيث والعدد.",
      bullets: ["🔎 حدّد المنعوت", "🎨 ابحث عن الوصف", "🪞 طابق الإعراب", "🪞 طابق النوع والعدد"]
    },
    "الحال": {
      rule: "الحال وصف نكرة منصوب يبيّن هيئة صاحبه وقت وقوع الفعل، وغالبًا نصل إليه بسؤال: كيف؟",
      bullets: ["❓ اسأل: كيف؟", "🎭 يصف الهيئة", "🔓 غالبًا نكرة", "⬇️ منصوب"]
    },
    "التشبيه التمثيلي": {
      rule: "التشبيه التمثيلي يكون وجه الشبه فيه صورة مركبة منتزعة من عدة عناصر، لا صفة مفردة فقط.",
      bullets: ["🖼️ صورة كاملة", "🔗 قارن موقفين", "🧩 وجه شبه مركب", "🎯 لا تبحث عن كلمة واحدة"]
    },
    "التشبيه الضمني": {
      rule: "التشبيه الضمني لا يأتي في صورة تشبيه صريح، بل يُفهم من معنى جملتين؛ الثانية تقدم دليلًا أو صورة تؤكد إمكان معنى الأولى.",
      bullets: ["🧠 لا أداة صريحة", "1️⃣ حكم أو فكرة", "2️⃣ صورة تؤكدها", "🔍 استنتج العلاقة"]
    },
    "حذف الألف وزيادتها": {
      rule: "هناك كلمات تُحذف منها الألف أو تُزاد فيها بحسب الرسم الإملائي المعياري، ويعتمد إتقانها على ملاحظة النمط وكثرة الاستعمال.",
      bullets: ["👁️ لاحظ الرسم", "🧠 اربط بالكلمة الصحيحة", "🚫 لا تعتمد على النطق وحده", "✍️ ثبّت الصورة بالكتابة"]
    },
    "كتابة الأعداد": {
      rule: "تتغير أحكام العدد بحسب فئته؛ فالأعداد من 3 إلى 10 تخالف المعدود غالبًا، و11 و12 لهما أحكام خاصة، والعقود ألفاظ ثابتة ويتبعها معدود مفرد منصوب.",
      bullets: ["🔢 حدّد فئة العدد", "⚧️ راقب جنس المعدود", "🧩 طبّق قاعدة الفئة", "✍️ اضبط المعدود"]
    },
    "الأسلوب الخبري والإنشائي": {
      rule: "الخبر يحتمل الصدق أو الكذب لذاته، أما الإنشاء فلا يحتمل ذلك عند إنشائه، ومنه الأمر والنهي والاستفهام والنداء والتمني والتعجب.",
      bullets: ["📰 خبر: يمكن تصديقه أو تكذيبه", "❓ استفهام", "📣 أمر/نهي/نداء", "✨ تعجب أو تمنٍّ"]
    },
    "المفعول به": {
      rule: "المفعول به اسم منصوب وقع عليه فعل الفاعل، وقد يكون اسمًا ظاهرًا أو ضميرًا، وقد يتعدى بعض الأفعال إلى مفعولين.",
      bullets: ["🎬 حدّد الفعل", "👤 حدّد الفاعل", "🎯 اسأل: وقع الفعل على مَن/ماذا؟", "⬇️ المفعول منصوب"]
    },
    "الإضافة": {
      rule: "الإضافة تركيب من اسمين: الأول مضاف والثاني مضاف إليه مجرور. المضاف لا يقبل التنوين ولا أل إذا كانت الإضافة محضة.",
      bullets: ["1️⃣ المضاف أولًا", "2️⃣ المضاف إليه ثانيًا", "⬇️ الثاني مجرور", "🚫 المضاف بلا تنوين"]
    },
    "التمييز": {
      rule: "التمييز اسم نكرة يزيل إبهامًا قبله؛ قد يوضح ذاتًا مثل المقادير والأعداد، أو يوضح نسبة في الجملة.",
      bullets: ["🌫️ ابحث عن إبهام", "🔦 التمييز يوضحه", "🧱 ذات أو نسبة", "⬇️ غالبًا منصوب"]
    },
    "أقسام الكلام: اسم وفعل وحرف": {
      rule: "الكلمة العربية ثلاثة أقسام: اسم يدل على معنى بلا زمن، وفعل يدل على حدث وزمن، وحرف لا يظهر معناه كاملًا إلا مع غيره.",
      bullets: ["🏷️ اسم", "⏱️ فعل", "🔗 حرف", "🧪 اختبر علامات كل قسم"]
    },
    "الجملة الفعلية وأركانها": {
      rule: "الجملة الفعلية تبدأ بفعل، ثم يأتي الفاعل مرفوعًا، وقد يأتي بعدها مفعول به منصوب إذا كان الفعل متعديًا.",
      bullets: ["🎬 فعل", "👤 فاعل مرفوع", "🎯 مفعول به عند الحاجة", "🧩 رتّب الأركان"]
    },
    "الأفعال الناصبة لمفعولين": {
      rule: "بعض الأفعال تنصب مفعولين، مثل أفعال القلوب والتحويل والعطاء، ويختلف أصل المفعولين بحسب نوع الفعل.",
      bullets: ["🧠 أفعال القلوب", "🔄 أفعال التحويل", "🎁 أفعال العطاء", "⬇️ مفعولان منصوبان"]
    },
    "المفعول فيه (ظرف الزمان والمكان)": {
      rule: "المفعول فيه اسم منصوب يبيّن زمان الفعل أو مكانه، ويجيب عن سؤال: متى؟ أو أين؟",
      bullets: ["⏰ متى؟ ظرف زمان", "📍 أين؟ ظرف مكان", "⬇️ منصوب", "🎬 مرتبط بالفعل"]
    },
    "المفعول معه": {
      rule: "المفعول معه اسم منصوب يأتي بعد واو بمعنى «مع» ليدل على المصاحبة، ويختلف عن المعطوف الذي يشارك ما قبله في الحكم.",
      bullets: ["➕ واو", "🤝 معناها: مع", "⬇️ ما بعدها منصوب", "⚖️ ميّزها عن واو العطف"]
    },
    "المفعول المطلق": {
      rule: "المفعول المطلق مصدر منصوب من لفظ الفعل غالبًا، يأتي لتوكيد الفعل أو بيان نوعه أو عدده.",
      bullets: ["🔁 مصدر من لفظ الفعل", "✅ توكيد", "🎨 بيان النوع", "🔢 بيان العدد"]
    },
    "المفعول لأجله": {
      rule: "المفعول لأجله مصدر منصوب يبيّن سبب وقوع الفعل ويجيب عن سؤال: لماذا؟",
      bullets: ["❓ لماذا؟", "❤️ سبب أو دافع", "🧱 مصدر", "⬇️ منصوب"]
    }
  };

  const DOMAIN_FALLBACK = {
    SP: { rule: "اقرأ المثال ببطء، حدّد العلامة الإملائية المستهدفة، ثم طبّق القاعدة على كلمة جديدة قبل أن تنتقل.", bullets: ["👁️ لاحظ", "🧠 استنتج", "✍️ طبّق", "✅ راجع"] },
    GR: { rule: "ابدأ بالفعل أو الاسم الرئيس في الجملة، حدّد وظيفة كل كلمة، ثم استعمل علامة الإعراب المناسبة.", bullets: ["🔎 حدّد العنصر الرئيس", "🧩 حدّد الوظيفة", "⬆️⬇️ اضبط الإعراب", "✅ اختبر بجملة جديدة"] },
    RH: { rule: "اقرأ الصورة البلاغية كاملة، حدّد طرفيها أو العلاقة بين الألفاظ، ثم فسّر أثرها في المعنى.", bullets: ["👁️ اقرأ الصورة", "🔍 حدّد العلاقة", "💡 فسّر", "✨ بيّن الأثر"] },
    RD: { rule: "اقرأ الفكرة في سياقها، ابحث عن الدليل، ثم استنتج المعنى قبل اختيار الإجابة.", bullets: ["📖 اقرأ", "🔎 استخرج الدليل", "🧠 استنتج", "✅ تحقّق"] },
    VC: { rule: "افهم الكلمة من السياق، جرّب مرادفًا أو ضدًا مناسبًا، ثم أعد قراءة الجملة للتأكد.", bullets: ["📖 سياق", "🔁 مرادف", "↔️ ضد", "✅ تحقق"] },
    WR: { rule: "حدّد الفكرة والجمهور والغرض، رتّب أفكارك، ثم اكتب وراجع اللغة والتنظيم.", bullets: ["🎯 غرض", "🗂️ تنظيم", "✍️ كتابة", "🔎 مراجعة"] }
  };

  function parseValue(v) {
    if (v == null) return null;
    if (typeof v === "object") return v;
    try { return JSON.parse(v); } catch { return null; }
  }

  async function getKey(key) {
    const r = await fetch(`${API}?key=${encodeURIComponent(key)}&t=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return parseValue(j.value);
  }

  async function setKey(key, value) {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: JSON.stringify(value) })
    });
    if (!r.ok) throw new Error(`write failed: ${key}`);
  }

  async function listKeys(prefix) {
    const r = await fetch(`${API}?action=list&prefix=${encodeURIComponent(prefix)}&t=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j.keys) ? j.keys : [];
  }

  const normalize = s => String(s || "").replace(/[\u064B-\u0652\u0640]/g, "").replace(/[«»؟.،,:;!]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

  function videoUrlFor(course) {
    const id = EXACT_VIDEO[course.title];
    if (id) return `https://www.youtube.com/embed/${id}?rel=0`;
    const q = `${course.title} شرح مبسط لغة عربية الصف ${course.grade || ""}`.trim();
    return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}&rel=0`;
  }

  function courseRule(course) {
    return RULES[course.title] || DOMAIN_FALLBACK[course.domain] || DOMAIN_FALLBACK.GR;
  }

  function distractorsFor(course, rule) {
    const pool = [
      "الاعتماد على الحفظ فقط دون فهم أو تطبيق",
      "تجاهل العلامات الموجودة في المثال",
      "اختيار الإجابة قبل قراءة السياق كاملًا"
    ];
    return [rule.rule, ...pool];
  }

  function makeWarmup(course, rule) {
    return {
      t: "summary",
      title: "تهيئة ذكية — اكتشف قبل أن تتعلم",
      strat: "استدعاء المعرفة السابقة",
      body: `قبل شرح «${course.title}»، جرّب أن تتوقع القاعدة من الفكرة العامة. لا تبحث عن الحفظ؛ ابحث عن النمط.`,
      bullets: ["👀 ماذا تلاحظ؟", "💭 ماذا تتوقع؟", "🧩 ما القاعدة المحتملة؟", "🎯 ما الذي تريد أن تتأكد منه؟"],
      note: "أجب عن التحقق القصير، ثم شاهد الفيديو لتقارن توقعك بالشرح.",
      checks: [
        { t: "mcq", q: `ما أفضل طريقة لبدء تعلم «${course.title}»؟`, o: ["ملاحظة الأمثلة والبحث عن نمط", "حفظ الإجابات دون فهم", "تجاوز الشرح إلى الاختبار", "اختيار أي إجابة عشوائيًا"], a: 0, e: "التعلم يبدأ بالملاحظة والاستنتاج." },
        { t: "tf", q: "التهيئة هدفها تنشيط معرفتي السابقة قبل مشاهدة الشرح.", a: true, e: "صحيح؛ التهيئة ليست اختبار نجاح أو رسوب." }
      ],
      __gfsUpgrade: VERSION
    };
  }

  function makeVideo(course, rule, previousVideo) {
    const opts = distractorsFor(course, rule);
    return {
      t: "video",
      title: "شاهد ثم أثبت فهمك",
      strat: "التعلّم المدمج",
      intro: `شاهد الشرح المرتبط بـ«${course.title}». ركّز على الفكرة أو القاعدة الرئيسة لأن بعدها تحقق مباشر من الفهم.`,
      clips: previousVideo?.clips?.length ? previousVideo.clips : [],
      videoUrl: previousVideo?.clips?.length ? "" : (previousVideo?.videoUrl || videoUrlFor(course)),
      videoQuery: previousVideo?.videoQuery || `${course.title} شرح مبسط`,
      checks: [
        { t: "mcq", q: "أي عبارة تلخص الفكرة الرئيسة التي يجب أن تخرج بها من الشرح؟", o: opts, a: 0, e: rule.rule },
        { t: "tf", q: "المطلوب بعد الفيديو هو تطبيق الفكرة على مثال جديد، لا حفظ كلمات الفيديو كما هي.", a: true, e: "الفهم يظهر في التطبيق." }
      ],
      __gfsUpgrade: VERSION
    };
  }

  function makeVisualMap(course, rule) {
    return {
      t: "summary",
      title: "خريطة بصرية — القاعدة في أربع خطوات",
      strat: "التشفير البصري",
      body: rule.rule,
      bullets: rule.bullets,
      note: "اقرأ الخريطة من اليمين إلى اليسار، ثم حاول شرحها بصوتك في عشرين ثانية.",
      __gfsUpgrade: VERSION
    };
  }

  function makeRuleStage(course, rule, originalRule) {
    return {
      ...(originalRule || {}),
      t: "rule",
      title: originalRule?.title || "القاعدة ببساطة",
      strat: originalRule?.strat || "شرح مباشر مبسّط",
      body: rule.rule,
      concepts: Array.isArray(originalRule?.concepts) && originalRule.concepts.length ? originalRule.concepts : rule.bullets.map(x => x.replace(/^[^\p{L}\p{N}]+/u, "")),
      note: originalRule?.note || "لا تحفظ القاعدة وحدها؛ اختبرها على مثال جديد.",
      __gfsUpgrade: VERSION
    };
  }

  function transformBank(bank) {
    if (!Array.isArray(bank) || !bank.length) return bank || [];
    const out = [];
    const seenQ = new Set();
    const seenAnswers = new Set();

    for (let i = 0; i < bank.length && out.length < 25; i++) {
      const src = { ...bank[i] };
      const qKey = normalize(src.q || src.sn || `${i}`);
      if (seenQ.has(qKey)) continue;
      seenQ.add(qKey);

      if (src.t === "mcq" && Array.isArray(src.o) && src.o.length >= 2 && Number.isInteger(src.a)) {
        const correct = src.o[src.a];
        const wrong = src.o.find((_, idx) => idx !== src.a);
        const ansKey = normalize(correct);
        const mode = out.length % 4;

        if (mode === 1 && !seenAnswers.has(ansKey)) {
          out.push({ t: "fill", sn: src.sn || "إجابة بلا خيارات", q: `اكتب الإجابة الصحيحة بنفسك: ${src.q}`, a: [String(correct)], e: src.e || "ارجع إلى القاعدة ثم أعد المحاولة." });
        } else if (mode === 2 && wrong != null) {
          out.push({ t: "tf", sn: src.sn || "حكم وتحليل", q: `«${wrong}» تمثل إجابة صحيحة عن الموقف الآتي: ${src.q}`, a: false, e: src.e || `الإجابة الصحيحة هي: ${correct}` });
        } else if (mode === 3) {
          const indexed = src.o.map((v, idx) => ({ v, idx }));
          const rotated = [...indexed.slice(1), indexed[0]];
          out.push({ ...src, q: `حلّل ثم اختر: ${src.q}`, o: rotated.map(x => x.v), a: rotated.findIndex(x => x.idx === src.a) });
        } else {
          out.push({ ...src, q: `تحدّي ${out.length + 1}: ${src.q}` });
        }
        seenAnswers.add(ansKey);
      } else {
        out.push({ ...src, q: src.q ? `تحدّي ${out.length + 1}: ${src.q}` : src.q });
      }
    }

    // إذا كان البنك الأصلي أقل تنوعًا نكمل من عناصره الأصلية دون تكرار نص السؤال.
    for (let i = 0; i < bank.length && out.length < 25; i++) {
      const src = bank[i];
      const key = normalize(src.q || src.sn || `${i}`) + `-${i}`;
      if (!seenQ.has(key)) {
        out.push({ ...src, q: src.q ? `موقف ${out.length + 1}: ${src.q}` : src.q });
        seenQ.add(key);
      }
    }
    return out.slice(0, 25);
  }

  function upgradeCourse(course) {
    if (!course || !course.id) return course;
    const rule = courseRule(course);
    const oldStages = Array.isArray(course.stages) ? course.stages : [];
    const cleaned = oldStages.filter(s => !s?.__gfsUpgrade);
    const originalVideo = cleaned.find(s => s?.t === "video");
    const originalRule = cleaned.find(s => s?.t === "rule");
    const rest = cleaned.filter(s => s !== originalVideo && s !== originalRule);

    // نحافظ على كل محتوى الكورس القديم، ونضيف فوقه رحلة أوضح فقط.
    const stages = [
      makeWarmup(course, rule),
      makeVideo(course, rule, originalVideo),
      makeRuleStage(course, rule, originalRule),
      makeVisualMap(course, rule),
      ...rest
    ];

    return {
      ...course,
      q: 25,
      stages,
      bank: transformBank(course.bank),
      contentVersion: VERSION
    };
  }

  async function runUpgrade() {
    try {
      const marker = await getKey(MARKER_KEY);
      if (marker?.done) return;

      let keys = [];
      for (let attempt = 0; attempt < 6; attempt++) {
        keys = await listKeys(COURSE_PREFIX);
        if (keys.length) break;
        await new Promise(r => setTimeout(r, 1800));
      }
      if (!keys.length) return;

      let changed = 0;
      for (const key of keys) {
        try {
          const course = await getKey(key);
          if (!course || course.contentVersion === VERSION) continue;
          const upgraded = upgradeCourse(course);
          await setKey(key, upgraded);
          changed++;
        } catch (e) {
          console.warn("Course content upgrade skipped", key, e);
        }
      }

      await setKey(MARKER_KEY, { done: true, version: VERSION, changed, total: keys.length, at: new Date().toISOString() });
      if (changed > 0) {
        console.info(`[GFS] Course content upgraded: ${changed}/${keys.length}`);
        // إعادة تحميل مرة واحدة حتى تقرأ React السجلات المطوّرة من التخزين المشترك.
        const reloadKey = `gfs:upgrade-reloaded:${VERSION}`;
        if (!sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, "1");
          setTimeout(() => location.reload(), 500);
        }
      }
    } catch (e) {
      console.warn("GFS course content upgrade failed", e);
    }
  }

  // ننتظر اكتمال تحميل التطبيق وتهيئة السجلات قبل تنفيذ الترقية مرة واحدة.
  if (document.readyState === "complete") setTimeout(runUpgrade, 1200);
  else window.addEventListener("load", () => setTimeout(runUpgrade, 1200), { once: true });
})();
