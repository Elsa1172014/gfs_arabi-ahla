import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// تحسين بصري لواجهة البداية فقط.
// لا يغيّر أي منطق داخل App.jsx ولا أي تخزين/تسجيل/بريد/نشر.
const LANDING_REFINE_CSS = `
/* ================= GFS Landing visual refinement only ================= */

/* إزالة خيارات اللغة والتثبيت من واجهة البداية فقط */
.lh-wrap:has(.lx) .lx-actions,
.lh-wrap:has(.lx) .lx-appbox{
  display:none !important;
}

/* إزالة السهم الدائري داخل البطاقات الثلاث */
.lh-wrap:has(.lx) .lx-arrow{
  display:none !important;
}

/* إعادة توزيع الصفحة بعد حذف عناصر التثبيت واللغة */
.lh-wrap:has(.lx){
  min-height:100vh !important;
  height:auto !important;
  overflow-x:hidden !important;
  overflow-y:auto !important;
  background:
    radial-gradient(circle at 9% 16%,rgba(197,31,66,.42),transparent 28%),
    radial-gradient(circle at 32% 48%,rgba(104,35,93,.28),transparent 31%),
    radial-gradient(circle at 91% 34%,rgba(18,80,178,.18),transparent 30%),
    linear-gradient(116deg,#741831 0%,#3b204d 34%,#071b49 68%,#031936 100%) !important;
}

.lh-wrap .wrap.lh-shell:has(.lx){
  min-height:100vh !important;
  height:auto !important;
  overflow:visible !important;
  padding:16px 20px 0 !important;
}

.lh-wrap:has(.lx) .lx{
  min-height:calc(100vh - 16px) !important;
  height:auto !important;
  grid-template-columns:minmax(0,1fr) 300px !important;
  grid-template-rows:auto 92px 30px !important;
  column-gap:24px !important;
  row-gap:10px !important;
  overflow:visible !important;
}

/* رأس الصفحة */
.lh-wrap:has(.lx) .lx-main{
  grid-template-rows:78px 164px 224px 178px !important;
  min-height:650px !important;
}

.lh-wrap:has(.lx) .lx-top{
  grid-template-columns:300px 1fr !important;
}

.lh-wrap:has(.lx) .lx-logo{
  width:300px !important;
  height:88px !important;
  border-radius:20px !important;
}

.lh-wrap:has(.lx) .lx-logo img{
  height:62px !important;
}

/* الأسد: علامة خلفية واحدة أوضح وأنظف، بلا تشويش */
.lh-wrap:has(.lx) .lx-lion{
  left:2.5% !important;
  top:2% !important;
  width:min(500px,34vw) !important;
  height:610px !important;
  object-fit:contain !important;
  object-position:center !important;
  opacity:.17 !important;
  filter:brightness(1.55) saturate(.30) contrast(.92) !important;
  mix-blend-mode:screen !important;
  transform:none !important;
}

.lh-wrap:has(.lx) .lx-crown{
  display:none !important;
}

/* العنوان */
.lh-wrap:has(.lx) .lx-hero{
  width:min(720px,72vw) !important;
  margin:0 auto !important;
}

.lh-wrap:has(.lx) .lx-hello{
  font-size:20px !important;
}

.lh-wrap:has(.lx) .lx-hero h1{
  font-size:46px !important;
  margin:4px 0 5px !important;
}

.lh-wrap:has(.lx) .lx-dept{
  font-size:18px !important;
  margin-bottom:5px !important;
}

.lh-wrap:has(.lx) .lx-vision{
  font-size:23px !important;
}

/* بطاقات الأدوار */
.lh-wrap:has(.lx) .lx-roles{
  width:min(830px,90%) !important;
  gap:20px !important;
  margin:0 auto 10px !important;
}

.lh-wrap:has(.lx) .lx-role{
  height:214px !important;
  min-height:214px !important;
  padding:15px 16px 14px !important;
  border-radius:20px !important;
  justify-content:center !important;
}

.lh-wrap:has(.lx) .lx-role-icon{
  width:60px !important;
  height:60px !important;
  margin-bottom:7px !important;
  filter:drop-shadow(0 7px 10px rgba(0,0,0,.22)) !important;
}

.lh-wrap:has(.lx) .lx-role-icon svg{
  width:58px !important;
  height:58px !important;
}

.lh-wrap:has(.lx) .lx-role b{
  font-size:24px !important;
  margin-bottom:4px !important;
}

.lh-wrap:has(.lx) .lx-role small{
  font-size:13px !important;
  line-height:1.65 !important;
  min-height:auto !important;
}

/* البيانات الحقيقية — القيم نفسها تأتي من students/courses/attempts داخل App.jsx */
.lh-wrap:has(.lx) .lx-data{
  width:min(1050px,96%) !important;
  grid-template-columns:172px minmax(0,1fr) !important;
  gap:16px !important;
  margin:4px auto 0 !important;
  align-self:start !important;
}

.lh-wrap:has(.lx) .lx-active,
.lh-wrap:has(.lx) .lx-tiers{
  height:170px !important;
}

.lh-wrap:has(.lx) .lx-active{
  border-color:rgba(255,69,99,.58) !important;
  background:linear-gradient(145deg,rgba(91,25,57,.62),rgba(7,35,76,.73)) !important;
}

.lh-wrap:has(.lx) .lx-active-icon{
  width:48px !important;
  height:48px !important;
}

.lh-wrap:has(.lx) .lx-active-icon svg{
  width:30px !important;
  height:30px !important;
}

.lh-wrap:has(.lx) .lx-active strong{
  font-size:28px !important;
  margin:7px 0 4px !important;
}

.lh-wrap:has(.lx) .lx-tiers{
  background:linear-gradient(128deg,rgba(45,25,70,.68),rgba(4,37,82,.78)) !important;
  box-shadow:0 16px 38px -28px rgba(39,126,255,.75) !important;
}

.lh-wrap:has(.lx) .lx-tier{
  padding:5px 10px !important;
}

.lh-wrap:has(.lx) .lx-tier-title{
  font-size:17px !important;
}

.lh-wrap:has(.lx) .lx-ring{
  width:96px !important;
  height:96px !important;
  box-shadow:0 0 0 1px rgba(255,255,255,.05),0 12px 26px -18px var(--c) !important;
}

.lh-wrap:has(.lx) .lx-ring:after{
  width:68px !important;
  height:68px !important;
  background:#101a3e !important;
}

.lh-wrap:has(.lx) .lx-ring strong{
  font-size:24px !important;
}

/* الشريط الحي على اليمين بعد حذف بطاقة التطبيق */
.lh-wrap:has(.lx) .lx-side{
  display:block !important;
  padding-top:214px !important;
  min-height:0 !important;
}

.lh-wrap:has(.lx) .lx-live{
  width:100% !important;
  max-height:390px !important;
  background:linear-gradient(154deg,rgba(5,31,72,.93),rgba(5,53,104,.76)) !important;
  border-color:rgba(39,158,255,.72) !important;
  box-shadow:0 22px 50px -34px #168cff !important;
}

/* ذيل GEMS جديد اعتمادًا على العناصر الموجودة بالفعل */
.lh-wrap:has(.lx) .lx-trust{
  position:relative !important;
  grid-column:1/-1 !important;
  min-height:82px !important;
  border-radius:22px 22px 0 0 !important;
  border:1px solid rgba(98,154,255,.24) !important;
  border-bottom:0 !important;
  background:
    linear-gradient(110deg,rgba(139,28,53,.95) 0%,rgba(80,30,67,.96) 27%,rgba(22,38,91,.98) 61%,rgba(5,48,112,.98) 100%) !important;
  box-shadow:0 -14px 38px -34px rgba(44,128,255,.75) !important;
  padding:12px 24px 12px 235px !important;
}

.lh-wrap:has(.lx) .lx-trust::before{
  content:"GEMS Founders School Dubai\\Aقسم اللغة العربية";
  white-space:pre;
  position:absolute;
  left:28px;
  top:50%;
  transform:translateY(-50%);
  direction:rtl;
  text-align:left;
  color:#fff;
  font-weight:900;
  font-size:14px;
  line-height:1.55;
  opacity:.96;
  padding-left:18px;
  border-left:1px solid rgba(255,255,255,.20);
}

.lh-wrap:has(.lx) .lx-trust-item{
  min-height:58px !important;
}

.lh-wrap:has(.lx) .lx-trust-icon{
  width:38px !important;
  height:38px !important;
}

.lh-wrap:has(.lx) .lx-copy{
  grid-column:1/-1 !important;
  min-height:30px !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  background:#041a3d !important;
  color:#c7d5ef !important;
  font-size:11px !important;
  border-radius:0 0 18px 18px !important;
  border-top:1px solid rgba(255,255,255,.08) !important;
}

/* استجابة الشاشات المتوسطة */
@media(max-width:1150px){
  .lh-wrap:has(.lx) .lx{
    grid-template-columns:1fr !important;
  }
  .lh-wrap:has(.lx) .lx-side{
    padding-top:0 !important;
  }
  .lh-wrap:has(.lx) .lx-live{
    max-width:900px !important;
    margin:12px auto !important;
  }
  .lh-wrap:has(.lx) .lx-trust{
    padding-left:24px !important;
  }
  .lh-wrap:has(.lx) .lx-trust::before{
    display:none !important;
  }
}

@media(max-width:760px){
  .lh-wrap:has(.lx) .lx-main{
    grid-template-rows:auto !important;
  }
  .lh-wrap:has(.lx) .lx-logo{
    width:220px !important;
    height:72px !important;
  }
  .lh-wrap:has(.lx) .lx-logo img{
    height:50px !important;
  }
  .lh-wrap:has(.lx) .lx-hero{
    width:100% !important;
    margin:24px auto 16px !important;
  }
  .lh-wrap:has(.lx) .lx-hero h1{
    font-size:34px !important;
  }
  .lh-wrap:has(.lx) .lx-roles{
    grid-template-columns:1fr !important;
    width:100% !important;
  }
  .lh-wrap:has(.lx) .lx-role{
    height:190px !important;
    min-height:190px !important;
  }
  .lh-wrap:has(.lx) .lx-data{
    grid-template-columns:1fr !important;
  }
  .lh-wrap:has(.lx) .lx-tiers{
    height:auto !important;
    min-height:170px !important;
  }
  .lh-wrap:has(.lx) .lx-lion{
    width:380px !important;
    max-width:80vw !important;
    opacity:.11 !important;
  }
  .lh-wrap:has(.lx) .lx-trust{
    grid-template-columns:1fr !important;
    height:auto !important;
  }
}
`;

const landingStyle = document.createElement("style");
landingStyle.id = "gfs-landing-refine";
landingStyle.textContent = LANDING_REFINE_CSS;
document.head.appendChild(landingStyle);

// بديل حقيقي لـ window.storage الخاص بمنصّة Claude Artifacts — نفس التوقيع
// تمامًا (get/set/delete/list بنفس الحقول المُعادة)، فكود App.jsx لا يحتاج
// أي تعديل. كل استدعاء يمر عبر خادمنا (/api/storage) الذي يخزّن في قاعدة
// بيانات حقيقية مشتركة بين كل من يفتح الرابط.
const API = "/api/storage";

window.storage = {
  async get(key) {
    const r = await fetch(`${API}?key=${encodeURIComponent(key)}`);
    if (!r.ok) throw new Error("not found");
    return r.json();
  },
  async set(key, value) {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!r.ok) throw new Error("write failed");
    return r.json();
  },
  async delete(key) {
    const r = await fetch(`${API}?key=${encodeURIComponent(key)}`, { method: "DELETE" });
    if (!r.ok) throw new Error("delete failed");
    return r.json();
  },
  async list(prefix) {
    const r = await fetch(`${API}?action=list&prefix=${encodeURIComponent(prefix || "")}`);
    if (!r.ok) throw new Error("list failed");
    return r.json();
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
