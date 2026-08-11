// ============================================================
// GFS بالعربي أحلى — Email Service
// ============================================================
// جميع رسائل المنصة تستمر عبر Resend كما كانت.
// التغيير الوحيد:
// عند نجاح الطالب، تُرفق شهادة إتمام الكورس تلقائيًا
// برسالة الطالب ورسالة ولي الأمر.
//
// لا يغيّر:
// الطلاب - الدرجات - المحاولات - الكورسات - قاعدة البيانات
// تسجيل الدخول - الواجهة - التصميم - أي وظيفة أخرى.
// ============================================================

function escapeXml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]
  );
}

function stripHtml(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/\n\s+/g, "\n")
    .trim();
}

/* ============================================================
   استخراج بيانات الشهادة من رسالة النجاح الموجودة أصلًا
   ============================================================ */

function getCertificateData(subject = "", html = "") {
  const text = stripHtml(html);

  const course =
    text.match(/مهارة «([^»]+)»/)?.[1] ||
    subject.match(/شهادة إتقان — (.+)$/)?.[1] ||
    subject.match(/أتممت «([^»]+)»/)?.[1] ||
    "الكورس";

  const student =
    text.match(/ابنكم\/ابنتكم\s+(.+?)\s+مهارة/)?.[1] ||
    text.match(/مرحبًا\s+([^،\n]+)/)?.[1] ||
    "الطالب";

  const score =
    text.match(/بدرجة\s+(\d{1,3})%/)?.[1] || "";

  const date =
    text.match(/بتاريخ\s+([^\.\n]+)/)?.[1]?.trim() || "";

  const serial =
    text.match(/رقم الشهادة:\s*([^\s—\n]+)/)?.[1] || "";

  const token =
    text.match(/رمز التحقق:\s*([^\s\n]+)/)?.[1] || "";

  return {
    student: student.trim(),
    course: course.trim(),
    score,
    date,
    serial,
    token,
  };
}

/* ============================================================
   تصميم الشهادة
   ألوان GEMS: الأزرق + الأحمر مدمجان في الجانبين
   ============================================================ */

function createCertificateSvg(data) {
  const student = escapeXml(data.student);
  const course = escapeXml(data.course);
  const score = escapeXml(data.score);
  const date = escapeXml(data.date);
  const serial = escapeXml(data.serial);
  const token = escapeXml(data.token);

  return `<?xml version="1.0" encoding="UTF-8"?>

<svg xmlns="http://www.w3.org/2000/svg"
     width="1600"
     height="1000"
     viewBox="0 0 1600 1000">

  <defs>

    <linearGradient id="gemsGradient"
      x1="0" y1="0"
      x2="1" y2="1">

      <stop offset="0%"
        stop-color="#0646A8"/>

      <stop offset="49%"
        stop-color="#0646A8"/>

      <stop offset="51%"
        stop-color="#C91F2C"/>

      <stop offset="100%"
        stop-color="#C91F2C"/>

    </linearGradient>

    <pattern id="pattern"
      width="75"
      height="75"
      patternUnits="userSpaceOnUse">

      <path
        d="M37 4 L71 37 L37 71 L4 37 Z"
        fill="none"
        stroke="#0646A8"
        stroke-opacity="0.035"
      />

    </pattern>

  </defs>


  <!-- الخلفية -->

  <rect
    width="1600"
    height="1000"
    fill="#FFFFFF"
  />

  <rect
    width="1600"
    height="1000"
    fill="url(#pattern)"
  />


  <!-- زخرفة الجانب العلوي الأيسر -->

  <path
    d="
    M0 0
    H430
    C270 95 125 260 0 510
    Z"
    fill="url(#gemsGradient)"
  />

  <path
    d="
    M0 58
    C120 160 205 275 250 390"
    stroke="#FFFFFF"
    stroke-width="15"
    fill="none"
    opacity=".90"
  />


  <!-- زخرفة الجانب السفلي الأيمن -->

  <path
    d="
    M1600 1000
    H1170
    C1330 905 1475 740 1600 490
    Z"
    fill="url(#gemsGradient)"
  />

  <path
    d="
    M1600 942
    C1480 840 1395 725 1350 610"
    stroke="#FFFFFF"
    stroke-width="15"
    fill="none"
    opacity=".90"
  />


  <!-- الإطار -->

  <rect
    x="28"
    y="28"
    width="1544"
    height="944"
    rx="28"
    fill="none"
    stroke="#0646A8"
    stroke-width="4"
  />

  <rect
    x="39"
    y="39"
    width="1522"
    height="922"
    rx="24"
    fill="none"
    stroke="#C91F2C"
    stroke-width="2"
  />


  <!-- رأس الشهادة -->

  <g
    font-family="Arial, Tahoma, sans-serif"
    text-anchor="middle">

    <text
      x="800"
      y="105"
      font-size="43"
      font-weight="700"
      fill="#0646A8">

      GEMS Founders School Dubai

    </text>

    <text
      x="800"
      y="158"
      font-size="29"
      font-weight="700"
      fill="#0646A8"
      direction="rtl">

      مدرسة جيمس فاوندرز دبي

    </text>

    <text
      x="800"
      y="205"
      font-size="28"
      font-weight="700"
      fill="#C91F2C"
      direction="rtl">

      قسم اللغة العربية

    </text>


    <!-- العنوان -->

    <text
      x="800"
      y="305"
      font-size="72"
      font-weight="700"
      fill="#0646A8"
      direction="rtl">

      شهادة إتمام دورة

    </text>

    <line
      x1="505"
      y1="342"
      x2="1095"
      y2="342"
      stroke="#C91F2C"
      stroke-width="4"
    />


    <!-- بيانات الطالب -->

    <text
      x="800"
      y="405"
      font-size="28"
      fill="#233B66"
      direction="rtl">

      تشهد إدارة مدرسة جيمس فاوندرز دبي – قسم اللغة العربية بأن الطالب

    </text>

    <text
      x="800"
      y="495"
      font-size="62"
      font-weight="700"
      fill="#0646A8"
      direction="rtl">

      ${student}

    </text>

    <text
      x="800"
      y="555"
      font-size="27"
      fill="#233B66"
      direction="rtl">

      قد أتم بنجاح دورة

    </text>

    <text
      x="800"
      y="630"
      font-size="52"
      font-weight="700"
      fill="#C91F2C"
      direction="rtl">

      ${course}

    </text>

    <text
      x="800"
      y="680"
      font-size="25"
      fill="#233B66"
      direction="rtl">

      وأظهر التزامًا وتميزًا في التعلم، وبناءً على ذلك مُنحت هذه الشهادة.

    </text>

  </g>


  <!-- بيانات الشهادة -->

  <g font-family="Arial, Tahoma, sans-serif">

    <!-- الدرجة -->

    <rect
      x="290"
      y="730"
      width="290"
      height="105"
      rx="17"
      fill="#FFFFFF"
      stroke="#0646A8"
      stroke-width="2"
    />

    <text
      x="435"
      y="768"
      text-anchor="middle"
      font-size="21"
      fill="#233B66"
      direction="rtl">

      الدرجة النهائية

    </text>

    <text
      x="435"
      y="812"
      text-anchor="middle"
      font-size="35"
      font-weight="700"
      fill="#0646A8">

      ${score ? score + "%" : "ناجح"}

    </text>


    <!-- التاريخ -->

    <rect
      x="655"
      y="730"
      width="290"
      height="105"
      rx="17"
      fill="#FFFFFF"
      stroke="#C91F2C"
      stroke-width="2"
    />

    <text
      x="800"
      y="768"
      text-anchor="middle"
      font-size="21"
      fill="#233B66"
      direction="rtl">

      تاريخ الإكمال

    </text>

    <text
      x="800"
      y="810"
      text-anchor="middle"
      font-size="26"
      font-weight="700"
      fill="#0646A8"
      direction="rtl">

      ${date}

    </text>


    <!-- رقم الشهادة -->

    <rect
      x="1020"
      y="730"
      width="290"
      height="105"
      rx="17"
      fill="#FFFFFF"
      stroke="#0646A8"
      stroke-width="2"
    />

    <text
      x="1165"
      y="768"
      text-anchor="middle"
      font-size="21"
      fill="#233B66"
      direction="rtl">

      رقم الشهادة

    </text>

    <text
      x="1165"
      y="810"
      text-anchor="middle"
      font-size="23"
      font-weight="700"
      fill="#0646A8">

      ${serial}

    </text>


    <!-- رئيس القسم -->

    <text
      x="405"
      y="895"
      text-anchor="middle"
      font-size="28"
      font-weight="700"
      fill="#0646A8"
      direction="rtl">

      السيد يوسف

    </text>

    <line
      x1="290"
      y1="910"
      x2="520"
      y2="910"
      stroke="#C91F2C"
      stroke-width="2"
    />

    <text
      x="405"
      y="944"
      text-anchor="middle"
      font-size="20"
      fill="#233B66"
      direction="rtl">

      رئيس قسم اللغة العربية

    </text>


    <!-- رئيسة المواد الوزارية -->

    <text
      x="1195"
      y="895"
      text-anchor="middle"
      font-size="28"
      font-weight="700"
      fill="#0646A8"
      direction="rtl">

      شيماء عبدالرحمن

    </text>

    <line
      x1="1070"
      y1="910"
      x2="1320"
      y2="910"
      stroke="#C91F2C"
      stroke-width="2"
    />

    <text
      x="1195"
      y="944"
      text-anchor="middle"
      font-size="20"
      fill="#233B66"
      direction="rtl">

      رئيسة المواد الوزارية

    </text>


    <!-- رمز التحقق -->

    <text
      x="800"
      y="885"
      text-anchor="middle"
      font-size="17"
      fill="#667085"
      direction="rtl">

      رمز التحقق: ${token}

    </text>

    <text
      x="800"
      y="930"
      text-anchor="middle"
      font-size="17"
      fill="#667085">

      Inspiring Minds, Empowering Futures

    </text>

  </g>

</svg>`;
}


/* ============================================================
   هل الرسالة رسالة شهادة نجاح؟
   ============================================================ */

function isCertificateEmail(subject = "") {
  return (
    /^شهادة إتقان — /.test(subject) ||
    /^تهانينا — أتممت «/.test(subject)
  );
}


/* ============================================================
   API
   ============================================================ */

export default async function handler(req, res) {

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      error: "method not allowed",
    });
  }


  if (!process.env.RESEND_API_KEY) {

    return res.status(500).json({
      error:
        "RESEND_API_KEY غير مضبوط في متغيرات البيئة على Vercel",
    });

  }


  try {

    const {
      to,
      subject,
      html,
    } = req.body || {};


    if (!to || !subject || !html) {

      return res.status(400).json({
        error: "missing to/subject/html",
      });

    }


    const recipients =
      (Array.isArray(to) ? to : [to])
        .filter(Boolean);


    if (!recipients.length) {

      return res.status(400).json({
        error: "no valid recipients",
      });

    }


    /* ========================================================
       نفس البريد الحالي
       ======================================================== */

    const payload = {

      from:
        process.env.RESEND_FROM ||
        "GFS بالعربي أحلى <onboarding@resend.dev>",

      to: recipients,

      subject,

      html,

    };


    /* ========================================================
       فقط رسائل نجاح الطالب
       ======================================================== */

    const certificateEmail =
      isCertificateEmail(subject);


    if (certificateEmail) {

      const certData =
        getCertificateData(
          subject,
          html
        );


      const certificate =
        createCertificateSvg(
          certData
        );


      /*
       * Resend يستقبل المرفق Base64.
       * هذا المرفق لا يؤثر على أي رسالة أخرى.
       */

      payload.attachments = [

        {

          filename:
            `GFS-Certificate-${
              certData.serial ||
              Date.now()
            }.svg`,

          content:
            Buffer.from(
              certificate,
              "utf8"
            ).toString("base64"),

        },

      ];

    }


    /* ========================================================
       إرسال البريد
       ======================================================== */

    const response =
      await fetch(
        "https://api.resend.com/emails",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${process.env.RESEND_API_KEY}`,

          },

          body:
            JSON.stringify(
              payload
            ),

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      return res
        .status(response.status)
        .json({
          error: data,
        });

    }


    return res
      .status(200)
      .json({

        ok: true,

        id: data.id,

        certificateAttached:
          certificateEmail,

      });


  } catch (error) {

    console.error(
      "send-email error:",
      error
    );


    return res
      .status(500)
      .json({

        error:
          String(error),

      });

  }

}
