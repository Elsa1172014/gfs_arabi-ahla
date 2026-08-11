// ============================================================
// GFS بالعربي أحلى — Email + Openable Certificate Service
// ============================================================
// - يرسل رسائل المنصة عبر Resend.
// - عند نجاح الطالب: ينشئ شهادة قابلة للفتح مباشرة.
// - يحفظ بيانات الشهادة في Redis.
// - يضيف زر "فتح شهادة الإتمام" داخل البريد.
// - يرفق نسخة HTML بدل SVG.
// ============================================================

import { getRedis } from "./_redis.js";

/* ============================================================
   أدوات مساعدة
   ============================================================ */

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
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
   استخراج بيانات الشهادة من رسالة النجاح
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
    text.match(/بدرجة\s+(\d{1,3})%/)?.[1] ||
    "";

  const date =
    text.match(/بتاريخ\s+([^\.\n]+)/)?.[1]?.trim() ||
    "";

  const serial =
    text.match(/رقم الشهادة:\s*([^\s—\n]+)/)?.[1] ||
    "";

  const token =
    text.match(/رمز التحقق:\s*([^\s—\n]+)/)?.[1] ||
    "";

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
   هل هذه رسالة نجاح تستحق شهادة؟
   ============================================================ */

function isCertificateEmail(subject = "") {
  return (
    /^شهادة إتقان — /.test(subject) ||
    /^تهانينا — أتممت «/.test(subject)
  );
}

/* ============================================================
   عنوان المنصة
   ============================================================ */

function getBaseUrl(req) {
  const forwardedHost =
    req.headers["x-forwarded-host"];

  const host =
    forwardedHost ||
    req.headers.host;

  const forwardedProto =
    req.headers["x-forwarded-proto"];

  const proto =
    forwardedProto ||
    "https";

  return (
    process.env.APP_BASE_URL ||
    (
      host
        ? `${proto}://${host}`
        : "https://gfsarabiahla.vercel.app"
    )
  ).replace(/\/+$/, "");
}

/* ============================================================
   تصميم الشهادة
   ============================================================ */

function createCertificateHtml(data) {
  const student =
    escapeHtml(data.student || "الطالب");

  const course =
    escapeHtml(data.course || "الكورس");

  const score =
    escapeHtml(data.score || "");

  const date =
    escapeHtml(data.date || "");

  const serial =
    escapeHtml(data.serial || "");

  const token =
    escapeHtml(data.token || "");

  return `<!doctype html>

<html lang="ar" dir="rtl">

<head>

<meta charset="utf-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>
شهادة إتمام — ${course}
</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 28px;
  background: #eef2f7;
  color: #233b66;
  font-family:
    Tahoma,
    Arial,
    "Segoe UI",
    sans-serif;
}

/* ============================================================
   أزرار أعلى الشهادة
   ============================================================ */

.actions {
  max-width: 1100px;
  margin: 0 auto 14px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  border: 0;
  border-radius: 10px;
  padding: 12px 22px;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  background: #0646A8;
  color: #ffffff;
}

/* ============================================================
   جسم الشهادة
   ============================================================ */

.certificate {
  position: relative;
  max-width: 1100px;
  min-height: 690px;
  margin: auto;

  background: #ffffff;

  border:
    4px solid
    #0646A8;

  border-radius: 24px;

  padding:
    42px
    54px
    34px;

  overflow: hidden;

  box-shadow:
    0 18px 55px
    rgba(28,48,84,.16);
}

/* زخارف GEMS */

.certificate:before,
.certificate:after {

  content: "";

  position: absolute;

  width: 330px;
  height: 330px;

  border-radius: 50%;

  background:
    linear-gradient(
      135deg,
      #0646A8 0 50%,
      #C91F2C 50% 100%
    );

  opacity: .96;
}

.certificate:before {
  left: -190px;
  top: -185px;
}

.certificate:after {
  right: -190px;
  bottom: -185px;
}

/* الإطار الداخلي */

.inner {

  position: relative;

  z-index: 2;

  border:
    2px solid
    #C91F2C;

  border-radius: 18px;

  padding:
    30px
    40px;

  min-height: 600px;

  text-align: center;
}

/* ============================================================
   رأس الشهادة
   ============================================================ */

.school {

  font-size: 30px;

  font-weight: 800;

  color: #0646A8;
}

.arabic-school {

  font-size: 24px;

  font-weight: 800;

  color: #0646A8;

  margin-top: 8px;
}

.dept {

  font-size: 21px;

  font-weight: 800;

  color: #C91F2C;

  margin-top: 6px;
}

/* ============================================================
   عنوان الشهادة
   ============================================================ */

h1 {

  font-size: 48px;

  color: #0646A8;

  margin:
    30px
    0
    10px;
}

.line {

  height: 4px;

  width: 330px;

  background: #C91F2C;

  margin:
    0 auto 30px;
}

/* ============================================================
   بيانات الطالب
   ============================================================ */

.lead {

  font-size: 19px;

  margin:
    8px 0;
}

.student {

  font-size: 42px;

  font-weight: 900;

  color: #0646A8;

  margin:
    16px 0;
}

.course {

  font-size: 34px;

  font-weight: 900;

  color: #C91F2C;

  margin:
    14px 0 20px;
}

/* ============================================================
   بيانات الشهادة
   ============================================================ */

.meta {

  margin:
    28px auto 8px;

  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(160px,1fr)
    );

  gap: 16px;

  max-width: 820px;
}

.meta > div {

  border:
    2px solid
    #dce5f2;

  border-radius: 14px;

  padding: 15px;

  background: #fbfdff;
}

.label {

  font-size: 13px;

  color: #67768f;
}

.value {

  font-size: 22px;

  font-weight: 800;

  color: #0646A8;

  margin-top: 5px;
}

/* ============================================================
   التحقق
   ============================================================ */

.verify {

  font-size: 12px;

  color: #667085;

  margin-top: 24px;

  direction: ltr;
}

.footer {

  margin-top: 18px;

  color: #667085;

  font-size: 13px;
}

/* ============================================================
   الهاتف
   ============================================================ */

@media (max-width: 760px) {

  body {
    padding: 10px;
  }

  .certificate {

    padding: 15px;

    border-radius: 14px;
  }

  .inner {

    padding:
      22px
      14px;
  }

  .school {

    font-size: 20px;
  }

  .arabic-school {

    font-size: 18px;
  }

  h1 {

    font-size: 34px;
  }

  .student {

    font-size: 30px;
  }

  .course {

    font-size: 25px;
  }

  .meta {

    grid-template-columns:
      1fr;
  }

  .line {

    width: 210px;
  }
}

/* ============================================================
   الطباعة / PDF
   ============================================================ */

@media print {

  body {

    background: #ffffff;

    padding: 0;
  }

  .actions {

    display: none;
  }

  .certificate {

    box-shadow: none;

    max-width: none;

    border-radius: 0;
  }
}

</style>

</head>

<body>

<!-- =========================================================
     زر الطباعة والحفظ PDF
     ========================================================= -->

<div class="actions">

  <button
    class="btn"
    onclick="window.print()"
  >

    طباعة / حفظ PDF

  </button>

</div>

<!-- =========================================================
     الشهادة
     ========================================================= -->

<section class="certificate">

  <div class="inner">

    <div class="school">

      GEMS Founders School Dubai

    </div>

    <div class="arabic-school">

      مدرسة جيمس فاوندرز دبي

    </div>

    <div class="dept">

      قسم اللغة العربية

    </div>

    <h1>

      شهادة إتمام دورة

    </h1>

    <div class="line"></div>

    <p class="lead">

      تشهد إدارة مدرسة جيمس فاوندرز دبي
      – قسم اللغة العربية بأن الطالب

    </p>

    <div class="student">

      ${student}

    </div>

    <p class="lead">

      قد أتم بنجاح دورة

    </p>

    <div class="course">

      ${course}

    </div>

    <p class="lead">

      وأظهر التزامًا وتميزًا في التعلم،
      وبناءً على ذلك مُنحت هذه الشهادة.

    </p>

    <!-- =====================================================
         الدرجة والتاريخ ورقم الشهادة
         ===================================================== -->

    <div class="meta">

      <div>

        <div class="label">

          الدرجة النهائية

        </div>

        <div class="value">

          ${
            score
              ? score + "%"
              : "ناجح"
          }

        </div>

      </div>

      <div>

        <div class="label">

          تاريخ الإكمال

        </div>

        <div class="value">

          ${
            date ||
            "—"
          }

        </div>

      </div>

      <div>

        <div class="label">

          رقم الشهادة

        </div>

        <div class="value">

          ${
            serial ||
            "—"
          }

        </div>

      </div>

    </div>

    <div class="verify">

      Verification Code:
      ${
        token ||
        "—"
      }

    </div>

    <div class="footer">

      Inspiring Minds, Empowering Futures

    </div>

  </div>

</section>

</body>

</html>`;
}

/* ============================================================
   زر فتح الشهادة داخل البريد
   ============================================================ */

function openButton(url) {

  const safeUrl =
    escapeHtml(url);

  return `

  <div
    dir="rtl"
    style="
      text-align:center;
      margin:24px 0;
    "
  >

    <a
      href="${safeUrl}"
      target="_blank"

      style="
        display:inline-block;
        background:#0646A8;
        color:#ffffff;
        text-decoration:none;
        padding:13px 26px;
        border-radius:10px;
        font-family:Tahoma,Arial,sans-serif;
        font-weight:700;
        font-size:16px;
      "
    >

      🏆 فتح شهادة الإتمام

    </a>

    <p
      style="
        font-family:Tahoma,Arial,sans-serif;
        color:#667085;
        font-size:12px;
      "
    >

      اضغط على الزر لفتح الشهادة مباشرة
      في المتصفح، ثم يمكنك طباعتها
      أو حفظها بصيغة PDF.

    </p>

  </div>

  `;
}

/* ============================================================
   API
   ============================================================ */

export default async function handler(req, res) {

  /* ==========================================================
     GET
     فتح الشهادة من الرابط
     ========================================================== */

  if (req.method === "GET") {

    try {

      const token =
        String(
          req.query?.certificate ||
          ""
        ).trim();

      if (!token) {

        return res
          .status(400)
          .send(
            "Missing certificate token"
          );
      }

      const redis =
        getRedis();

      const stored =
        await redis.get(
          `certificate:${token}`
        );

      /* --------------------------------------------------------
         الشهادة غير موجودة
         -------------------------------------------------------- */

      if (!stored) {

        res.setHeader(
          "Content-Type",
          "text/html; charset=utf-8"
        );

        return res
          .status(404)
          .send(`

<!doctype html>

<html
  lang="ar"
  dir="rtl"
>

<head>

<meta charset="utf-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>
الشهادة غير موجودة
</title>

</head>

<body
  style="
    font-family:Tahoma,Arial,sans-serif;
    padding:40px;
    text-align:center;
    background:#f5f7fb;
    color:#233b66;
  "
>

<h2>

  تعذّر العثور على الشهادة

</h2>

<p>

  قد يكون الرابط غير صحيح
  أو أن بيانات الشهادة غير متاحة.

</p>

</body>

</html>

          `);
      }

      /* --------------------------------------------------------
         تحويل بيانات Redis
         -------------------------------------------------------- */

      const data =
        typeof stored === "string"
          ? JSON.parse(stored)
          : stored;

      /* --------------------------------------------------------
         عرض الشهادة مباشرة
         -------------------------------------------------------- */

      res.setHeader(
        "Content-Type",
        "text/html; charset=utf-8"
      );

      res.setHeader(
        "Content-Disposition",
        "inline"
      );

      res.setHeader(
        "Cache-Control",
        "private, no-store, max-age=0"
      );

      return res
        .status(200)
        .send(
          createCertificateHtml(
            data
          )
        );

    } catch (error) {

      console.error(
        "open certificate error:",
        error
      );

      return res
        .status(500)
        .send(
          "Unable to open certificate"
        );
    }
  }

  /* ==========================================================
     POST فقط للإرسال
     ========================================================== */

  if (req.method !== "POST") {

    res.setHeader(
      "Allow",
      "GET, POST"
    );

    return res
      .status(405)
      .json({
        error:
          "method not allowed",
      });
  }

  /* ==========================================================
     مفتاح Resend
     ========================================================== */

  if (!process.env.RESEND_API_KEY) {

    return res
      .status(500)
      .json({

        error:
          "RESEND_API_KEY غير مضبوط في متغيرات البيئة على Vercel",

      });
  }

  try {

    const {
      to,
      subject,
      html,
    } =
      req.body ||
      {};

    /* ========================================================
       التحقق من البيانات
       ======================================================== */

    if (
      !to ||
      !subject ||
      !html
    ) {

      return res
        .status(400)
        .json({

          error:
            "missing to/subject/html",

        });
    }

    const recipients =
      (
        Array.isArray(to)
          ? to
          : [to]
      )
        .filter(Boolean);

    if (
      !recipients.length
    ) {

      return res
        .status(400)
        .json({

          error:
            "no valid recipients",

        });
    }

    /* ========================================================
       البريد الأساسي
       ======================================================== */

    const payload = {

      from:
        process.env.RESEND_FROM ||
        "GFS بالعربي أحلى <onboarding@resend.dev>",

      to:
        recipients,

      subject,

      html,

    };

    /* ========================================================
       هل هذه رسالة شهادة؟
       ======================================================== */

    const certificateEmail =
      isCertificateEmail(
        subject
      );

    let certificateUrl =
      null;

    /* ========================================================
       إنشاء الشهادة
       ======================================================== */

    if (
      certificateEmail
    ) {

      const certData =
        getCertificateData(
          subject,
          html
        );

      /* --------------------------------------------------------
         إنشاء Token إذا لم يكن موجودًا
         -------------------------------------------------------- */

      if (
        !certData.token
      ) {

        certData.token =
          (
            `CERT-${Date.now()}-` +
            Math.random()
              .toString(36)
              .slice(2, 10)
          )
            .toUpperCase();
      }

      /* --------------------------------------------------------
         حفظ الشهادة في Redis
         -------------------------------------------------------- */

      const redis =
        getRedis();

      await redis.set(

        `certificate:${certData.token}`,

        JSON.stringify({

          ...certData,

          createdAt:
            new Date()
              .toISOString(),

        }),

        {

          /*
           * صلاحية الرابط:
           * سنتان
           */

          ex:
            60 *
            60 *
            24 *
            365 *
            2,

        }

      );

      /* --------------------------------------------------------
         رابط الشهادة
         -------------------------------------------------------- */

      certificateUrl =
        (
          `${getBaseUrl(req)}` +
          `/api/send-email-openable` +
          `?certificate=` +
          encodeURIComponent(
            certData.token
          )
        );

      /* --------------------------------------------------------
         إضافة زر فتح الشهادة للبريد
         -------------------------------------------------------- */

      payload.html =
        `${html}` +
        `${openButton(
          certificateUrl
        )}`;

      /* --------------------------------------------------------
         إنشاء مرفق HTML
         -------------------------------------------------------- */

      const certificateHtml =
        createCertificateHtml(
          certData
        );

      payload.attachments = [

        {

          filename:
            (
              `GFS-Certificate-` +
              `${
                certData.serial ||
                certData.token
              }` +
              `.html`
            ),

          content:
            Buffer
              .from(
                certificateHtml,
                "utf8"
              )
              .toString(
                "base64"
              ),

        },

      ];
    }

    /* ========================================================
       إرسال البريد عن طريق Resend
       ======================================================== */

    const response =
      await fetch(

        "https://api.resend.com/emails",

        {

          method:
            "POST",

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

    /* ========================================================
       قراءة استجابة Resend
       ======================================================== */

    let data = {};

    try {

      data =
        await response.json();

    } catch {

      data = {};
    }

    /* ========================================================
       خطأ من Resend
       ======================================================== */

    if (
      !response.ok
    ) {

      return res
        .status(
          response.status
        )
        .json({

          error:
            data,

        });
    }

    /* ========================================================
       نجاح الإرسال
       ======================================================== */

    return res
      .status(200)
      .json({

        ok:
          true,

        id:
          data.id,

        certificateAttached:
          certificateEmail,

        certificateUrl,

      });

  } catch (error) {

    console.error(
      "send-email-openable error:",
      error
    );

    return res
      .status(500)
      .json({

        error:
          String(
            error
          ),

      });
  }
}
