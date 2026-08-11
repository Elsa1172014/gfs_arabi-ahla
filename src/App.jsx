import React, { useState, useEffect, useRef } from "react";
// xlsx (~500KB مضغوطة) يُحمَّل عند أول استخدام فعلي فقط (رفع/تنزيل قائمة
// طلاب)، لا مع كل فتح للمنصة.
let _XLSX = null;
async function loadXLSX() { if (!_XLSX) _XLSX = await import("xlsx"); return _XLSX; }

/* ============================ الهوية ============================ */
const T = {
  ink: "#0B2E33", inkSoft: "#3B5C60", green: "#14746F", greenSoft: "#E3F0EE",
  gold: "#B47B2B", goldSoft: "#FAF1E1", brick: "#A6402F", brickSoft: "#F9E9E5",
  paper: "#F4F6F3", card: "#FFFFFF", rule: "#DCE4DF", ruleSoft: "#EBF0EC",
  navy: "#12329B",
};

const CSS = `
*{box-sizing:border-box}
.gfs{direction:rtl;text-align:right;background:${T.paper};color:${T.ink};min-height:100vh;
 font-family:"IBM Plex Sans Arabic","Noto Sans Arabic","Segoe UI",Tahoma,sans-serif;font-size:15px;line-height:1.8}
.gfs h1,.gfs h2,.gfs h3,.gfs h4{font-family:Amiri,"Scheherazade New","Traditional Arabic","Times New Roman",serif;font-weight:700;margin:0}
.gfs h1{font-size:28px}.gfs h2{font-size:22px}.gfs h3{font-size:18px}.gfs h4{font-size:15px}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:12px;direction:ltr;display:inline-block}
.wrap{max-width:1160px;margin:0 auto;padding:0 20px}
.card{background:${T.card};border:1px solid ${T.rule};border-radius:14px}
.btn{border:0;border-radius:10px;padding:9px 16px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:filter .15s}
.btn:hover{filter:brightness(1.07)}.btn:focus-visible{outline:3px solid ${T.gold};outline-offset:2px}
.btn-p{background:${T.green};color:#fff}.btn-g{background:${T.gold};color:#fff}.btn-d{background:${T.brick};color:#fff}
.btn-o{background:transparent;color:${T.green};border:1px solid ${T.green}}
.btn-q{background:transparent;color:${T.inkSoft};padding:7px 11px}
.btn:disabled{opacity:.4;cursor:not-allowed}
.inp,.tarea{width:100%;padding:9px 11px;border:1px solid ${T.rule};border-radius:9px;background:#fff;font-family:inherit;font-size:14px;color:${T.ink}}
.inp:focus,.tarea:focus{outline:2px solid ${T.green};outline-offset:1px}
.lbl{display:block;font-size:12px;color:${T.inkSoft};margin-bottom:5px;font-weight:600}
.chip{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600}
.ruled{background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 33px,${T.ruleSoft} 33px,${T.ruleSoft} 34px)}
.inkbar{height:6px;border-radius:999px;background:${T.ruleSoft};overflow:hidden}
.inkbar>i{display:block;height:100%;background:${T.green};border-radius:999px;transition:width .5s}
.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th{text-align:right;padding:8px;color:${T.inkSoft};font-size:11px;font-weight:700;border-bottom:1px solid ${T.rule};background:${T.paper}}
.tbl td{padding:8px;border-bottom:1px solid ${T.ruleSoft}}
.opt{display:block;width:100%;text-align:right;padding:10px 13px;border:1px solid ${T.rule};border-radius:9px;background:#fff;cursor:pointer;font-family:inherit;font-size:14px;margin-bottom:7px;color:${T.ink}}
.opt:hover{border-color:${T.green}}
.opt[data-on="1"]{border-color:${T.green};background:${T.greenSoft};font-weight:600}
.opt[data-r="ok"]{border-color:${T.green};background:${T.greenSoft}}
.opt[data-r="no"]{border-color:${T.brick};background:${T.brickSoft}}
.grid{display:grid;gap:12px}
.word{display:inline-block;padding:5px 10px;margin:3px;border-radius:8px;border:1px dashed ${T.rule};background:#fff;cursor:pointer;font-family:Amiri,serif;font-size:18px;color:${T.ink}}
.word:hover{border-color:${T.green}}
.word[data-on="1"]{background:${T.goldSoft};border-color:${T.gold};border-style:solid;font-weight:700}
.word[data-r="ok"]{background:${T.greenSoft};border-color:${T.green};border-style:solid}
.word[data-r="no"]{background:${T.brickSoft};border-color:${T.brick};border-style:solid}
.bin{flex:1;min-width:150px;border:2px dashed ${T.rule};border-radius:12px;padding:10px;min-height:90px;background:#fff;cursor:pointer}
.vid{position:relative;width:100%;padding-top:56.25%;border-radius:12px;overflow:hidden;background:${T.ink}}
.vid>iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.tabs{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:18px}
.tabbtn{border:0;border-radius:9px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.step{border-right:3px solid ${T.green};padding:0 14px;margin-bottom:12px}
.strat{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.05em;color:${T.gold};background:${T.goldSoft};padding:2px 8px;border-radius:6px;margin-bottom:8px}
.sw{position:relative;width:38px;height:22px;border-radius:11px;background:${T.rule};cursor:pointer;display:inline-block;flex-shrink:0}
.sw[data-on="1"]{background:${T.green}}
.sw>i{position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s}
.sw[data-on="1"]>i{transform:translateX(-16px)}
@media(max-width:760px){.wrap{padding:0 14px}.gfs h1{font-size:22px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}.topbar{animation:none!important}.lh-bg,.lh-orb,.lh-letters text{animation:none!important}}
@media print{.noprint{display:none!important}}
/* ===== شريط علوي: تدرّج خمري إلى كحلي متحرك (هوية النشرة) ===== */
.topbar{position:relative;overflow:hidden;
  background:linear-gradient(115deg,#7A1F2B 0%,#6E2338 22%,#2C2A5C 55%,#141D4F 78%,${T.navy} 100%);
  background-size:180% 180%;animation:topbarGradientShift 14s ease-in-out infinite;isolation:isolate}
@keyframes topbarGradientShift{0%{background-position:0% 40%}50%{background-position:100% 60%}100%{background-position:0% 40%}}
.topbar::before,.topbar::after{content:"";position:absolute;border-radius:50%;filter:blur(2px);opacity:.5;pointer-events:none}
.topbar::before{width:260px;height:260px;background:${T.brick};top:-140px;left:-80px;filter:blur(60px);opacity:.28}
.topbar::after{width:320px;height:320px;background:${T.navy};bottom:-180px;right:-100px;filter:blur(70px);opacity:.32}
.topbar-inner{position:relative;z-index:1}
.brand-row{display:flex;align-items:center;gap:14px}
.logo-chip{background:#fff;border-radius:14px;padding:7px 12px;box-shadow:0 8px 24px -8px rgba(0,0,0,.45);flex-shrink:0;display:flex;align-items:center}
.logo-chip img{display:block;height:34px;width:auto}
.logo-chip.lg img{height:52px}
.brand-title{font-family:Amiri,"Scheherazade New",serif;font-weight:700;color:#fff;letter-spacing:0}
.brand-tagline{font-size:11px;color:#9DBDBB;letter-spacing:.18em}
/* ===== شاشة الترحيب (Hero Login) ===== */
.lh-wrap{position:relative;min-height:100vh;overflow-x:hidden;color:#fff;background:${T.ink}}
.lh-bg{position:fixed;inset:0;z-index:0;background:linear-gradient(135deg,var(--accent,${T.brick}) 0%,${T.ink} 55%,${T.navy} 100%);
  background-size:180% 180%;animation:lhBgShift 16s ease-in-out infinite}
@keyframes lhBgShift{0%{background-position:0% 30%}50%{background-position:100% 70%}100%{background-position:0% 30%}}
.lh-orb{position:fixed;z-index:0;border-radius:50%;filter:blur(70px);opacity:.32;pointer-events:none;animation:lhFloat 10s ease-in-out infinite}
.lh-orb1{width:340px;height:340px;background:${T.gold};top:-100px;left:-80px}
.lh-orb2{width:420px;height:420px;background:${T.green};bottom:-160px;right:-120px;animation-delay:2s}
@keyframes lhFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
.lh-letters{position:fixed;inset:0;z-index:0;width:100%;height:100%;opacity:.06;pointer-events:none}
.lh-watermark{position:fixed;z-index:0;bottom:-60px;left:-60px;width:460px;max-width:60vw;opacity:.07;
  mix-blend-mode:soft-light;pointer-events:none;transform:rotate(-4deg)}
.lh-letters text{font-family:Amiri,serif;font-size:150px;fill:#fff}
.lh-shell{position:relative;z-index:1;padding:56px 20px 60px}
.lh-fade{animation:lhFadeUp .6s ease both}
@keyframes lhFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.lh-hero{max-width:640px;margin:0 auto;text-align:center}
.lh-cta{position:relative;overflow:hidden;background:#fff;color:${T.ink};padding:12px 30px;font-size:15px;border-radius:12px}
.lh-rolegrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;max-width:820px;margin:0 auto}
.lh-rolecard{position:relative;overflow:hidden;text-align:center;padding:26px 16px;border-radius:16px;border:1px solid rgba(255,255,255,.25);
  background:rgba(255,255,255,.10);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#fff;cursor:pointer;font-family:inherit;
  transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
.lh-rolecard:hover{transform:translateY(-4px);box-shadow:0 14px 30px -10px rgba(0,0,0,.4);border-color:var(--card-accent,#fff)}
.lh-role-icon{display:block;font-size:32px;margin-bottom:10px}
.lh-role-title{display:block;font-weight:700;font-size:16px;margin-bottom:4px}
.lh-role-desc{display:block;font-size:12px;color:#E7DCE8}
.lh-formshell{display:grid;grid-template-columns:360px 260px;gap:20px;max-width:660px;margin:0 auto;align-items:start;justify-content:center}
@media(max-width:820px){.lh-formshell{grid-template-columns:1fr;max-width:400px}}
.lh-panel{background:#fff;border-radius:18px;padding:18px;color:${T.ink};box-shadow:0 20px 50px -20px rgba(0,0,0,.55)}
.lh-panel .grid{gap:10px}
.lh-side{background:rgba(255,255,255,.10);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.25);
  border-radius:16px;padding:20px;color:#fff;text-align:center}
.lh-illustration{width:100%;max-width:130px;margin:0 auto 14px;display:block}
.lh-gaugewrap{display:flex;justify-content:space-between;gap:6px;margin-bottom:10px}
.lh-gauge{display:flex;flex-direction:column;align-items:center;flex:1;min-width:0}
.lh-gauge svg{width:100%;max-width:76px}
.lh-gauge-track{fill:none;stroke:rgba(255,255,255,.18);stroke-width:7}
.lh-gauge-fill{fill:none;stroke-width:7;stroke-linecap:round;transform:rotate(-90deg);transform-origin:45px 45px;
  transition:stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)}
.lh-gauge-pct{font-size:15px;font-weight:700;fill:#fff;text-anchor:middle;font-family:inherit}
.lh-gauge-cnt{font-size:9px;fill:#C6DAD8;text-anchor:middle;font-family:inherit}
.lh-gauge-label{font-size:10px;color:#E7DCE8;text-align:center;margin-top:4px;line-height:1.3}
.lh-gauge-note{font-size:11px;color:#9DBDBB;text-align:center;margin:0 0 14px}
.lh-landing-gauges{max-width:640px;margin:56px auto 0;padding-top:34px;border-top:1px solid rgba(255,255,255,.15)}
.lh-gaugewrap-lg{max-width:420px;margin:0 auto;gap:18px}
.lh-gaugewrap-lg .lh-gauge svg{max-width:110px}
.lh-quote{font-family:Amiri,serif;font-size:16px;color:#F1E9D8;margin:0 0 16px}
.lh-stats{display:flex;justify-content:space-around;border-top:1px solid rgba(255,255,255,.2);padding-top:14px}
.lh-stat{display:flex;flex-direction:column;font-size:12px;color:#E7DCE8}
.lh-stat b{font-size:20px;color:#fff}
.lh-step-dots{display:flex;gap:6px;justify-content:center;margin-bottom:6px}
.lh-step-dots span{width:8px;height:8px;border-radius:50%;background:${T.ruleSoft};display:inline-block}
.lh-step-dots span.on{background:${T.green}}
.lh-avatar{width:64px;height:64px;border-radius:50%;background:${T.greenSoft};color:${T.green};display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:22px;margin:0 auto}
.lh-welcome{text-align:center;padding:20px 0}
.lh-ripple-el{position:absolute;border-radius:50%;background:rgba(255,255,255,.55);transform:scale(0);animation:lhRipple .6s linear;pointer-events:none}
@keyframes lhRipple{to{transform:scale(2.4);opacity:0}}

.lh-ripple-btn{position:relative;overflow:hidden}

/* ===== لوحة قيادة رئيس القسم — GEMS Command Center ===== */
.adm-shell{max-width:none!important;padding:0!important;background:#f6f8fb;min-height:100vh}
.adm-hero{position:relative;overflow:hidden;padding:18px 32px 14px;color:#fff;
  background:linear-gradient(110deg,#12329B 0%,#203BA4 30%,#40245C 58%,#7B1F3E 78%,#B4163E 100%);
  isolation:isolate}
.adm-hero::before{content:"";position:absolute;inset:-25% 28% -45% auto;width:460px;
  background:radial-gradient(circle,rgba(255,255,255,.12),transparent 65%);pointer-events:none}
.adm-lion{position:absolute;left:30%;top:-95px;width:360px;opacity:.055;filter:grayscale(1) brightness(4);
  pointer-events:none;transform:rotate(-3deg)}
.adm-hero-row{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
.adm-brand{display:flex;align-items:center;gap:14px}
.adm-brand .logo-chip img{height:48px}
.adm-hero-title{font-family:Amiri,"Traditional Arabic",serif;font-size:27px;font-weight:700}
.adm-hero-sub{font-size:12px;color:rgba(255,255,255,.7)}
.adm-actor{display:flex;align-items:center;gap:10px;background:rgba(7,18,58,.58);border:1px solid rgba(255,255,255,.14);
  padding:8px 12px;border-radius:14px;backdrop-filter:blur(8px)}
.adm-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6E3A86,#B4163E);
  display:grid;place-items:center;font-weight:800}
.adm-mainnav{position:relative;z-index:3;margin-top:14px;display:flex;gap:4px;align-items:center;
  padding:7px;background:#08112F;border-radius:15px;overflow-x:auto;scrollbar-width:thin}
.adm-mainbtn,.adm-subbtn{border:0;font-family:inherit;cursor:pointer;white-space:nowrap}
.adm-mainbtn{padding:9px 15px;border-radius:10px;background:transparent;color:#cbd3eb;font-weight:700}
.adm-mainbtn.on{color:#fff;background:linear-gradient(105deg,#C01F4D,#2439A8)}
.adm-subnav{display:flex;gap:6px;align-items:center;overflow-x:auto;padding:8px 28px;background:#fff;
  border-bottom:1px solid #e2e7ef;box-shadow:0 3px 12px rgba(13,31,71,.04)}
.adm-subbtn{padding:7px 12px;border-radius:9px;background:#f4f6fa;color:#526076;font-size:12px;font-weight:700}
.adm-subbtn.on{background:#e8ecff;color:#18389b;box-shadow:inset 0 0 0 1px #cfd7ff}
.adm-content{padding:20px 28px 28px}
.adm-filterbar{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px}
.adm-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px;margin-bottom:12px}
.adm-kpi{background:#fff;border:1px solid #e0e6ee;border-radius:15px;padding:13px;min-height:116px}
.adm-kpi-top{display:flex;justify-content:space-between;align-items:center;gap:8px}
.adm-kpi-icon{width:35px;height:35px;border-radius:50%;display:grid;place-items:center;background:#f2f5fb}
.adm-kpi-label{font-size:12px;color:#59677d;font-weight:700}
.adm-kpi-value{font:800 27px/1.1 ui-sans-serif,system-ui;margin-top:8px;color:#0c2340}
.adm-kpi-foot{font-size:10px;color:#8490a4;margin-top:7px}
.adm-grid3{display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:12px;margin-bottom:12px}
.adm-grid4{display:grid;grid-template-columns:1.05fr 1.05fr 1.05fr .9fr;gap:12px}
.adm-panel{background:#fff;border:1px solid #e0e6ee;border-radius:16px;padding:15px;min-width:0}
.adm-panel h3{font-size:16px!important;color:#14294a;margin-bottom:10px!important}
.adm-muted{font-size:11px;color:#7e8999}
.adm-donut{width:180px;height:180px;border-radius:50%;margin:auto;display:grid;place-items:center;position:relative}
.adm-donut::after{content:"";position:absolute;width:104px;height:104px;border-radius:50%;background:#fff}
.adm-donut-center{position:relative;z-index:2;text-align:center;font-weight:800;color:#17304e}
.adm-legend{display:grid;gap:7px;margin-top:10px;font-size:11px}
.adm-legend-row{display:flex;justify-content:space-between;gap:10px;align-items:center}
.adm-dot{width:10px;height:10px;border-radius:3px;display:inline-block;margin-left:5px}
.adm-bars{display:grid;gap:8px;margin-top:12px}
.adm-bar-row{display:grid;grid-template-columns:54px 1fr 42px;gap:8px;align-items:center;font-size:11px}
.adm-track{height:11px;border-radius:999px;background:#edf0f4;overflow:hidden}
.adm-fill{height:100%;border-radius:999px}
.adm-heat{display:grid;gap:5px}
.adm-heat-row{display:grid;grid-template-columns:minmax(105px,1.2fr) repeat(3,1fr);gap:5px;align-items:center;font-size:10px}
.adm-heat-cell{padding:8px 5px;border-radius:7px;text-align:center;color:#fff;font-weight:800}
.adm-funnel{display:grid;gap:4px;justify-items:center;margin-top:7px}
.adm-funnel-step{height:34px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:11px;
  clip-path:polygon(7% 0,93% 0,84% 100%,16% 100%)}
.adm-priority{display:grid;gap:8px}
.adm-priority-item{padding:10px;border-radius:11px;background:#fafbfc;border:1px solid #edf0f4;font-size:11px}
.adm-ai{background:linear-gradient(145deg,#0c2d69,#112657)!important;color:#fff!important;border-color:#183e82!important}
.adm-ai h3{color:#fff!important}
.adm-ai ul{padding-inline-start:18px;margin:8px 0;font-size:11px;line-height:1.9}
.adm-footer{position:relative;overflow:hidden;margin-top:18px;padding:18px 30px;color:#fff;
  background:linear-gradient(105deg,#12329B 0%,#26358e 35%,#5c255c 67%,#B4163E 100%);
  display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
.adm-footer::before{content:"";position:absolute;left:16%;bottom:-115px;width:330px;height:260px;
  background:radial-gradient(ellipse,rgba(255,255,255,.1),transparent 66%);transform:rotate(-8deg)}
.adm-footer-main{position:relative;z-index:1;text-align:center;flex:1;font-size:12px}
.adm-footer-tag{font-family:Amiri,serif;font-size:17px;font-weight:700}
@media(max-width:1200px){.adm-kpis{grid-template-columns:repeat(3,1fr)}.adm-grid3,.adm-grid4{grid-template-columns:1fr 1fr}}
@media(max-width:760px){.adm-hero{padding:14px}.adm-content{padding:14px}.adm-kpis,.adm-grid3,.adm-grid4{grid-template-columns:1fr}
.adm-mainnav{border-radius:12px}.adm-subnav{padding:8px 14px}.adm-donut{width:155px;height:155px}}

/* ===== النشرة الأسبوعية — GEMS ===== */
.nl-shell{border-radius:24px;overflow:hidden;background:#fff;box-shadow:0 18px 50px -28px rgba(15,32,80,.38);border:1px solid ${T.rule}}
.nl-head{position:relative;overflow:hidden;background:linear-gradient(110deg,#8E2333 0%,#642849 30%,#2A2D68 62%,#12329B 100%);color:#fff;padding:28px 30px;text-align:center}
.nl-watermark{position:absolute;width:360px;max-width:50vw;opacity:.40;left:5%;top:-105px;filter:grayscale(1) brightness(2.4);mix-blend-mode:soft-light;pointer-events:none}
.nl-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:20px}
.nl-weekcard{position:relative;overflow:hidden;border-radius:22px;color:#fff;padding:22px;min-height:330px;box-shadow:0 14px 30px -22px rgba(5,20,60,.55)}
.nl-weekcard.red{background:linear-gradient(145deg,#8D2132,#A82A42 58%,#6C2033)}
.nl-weekcard.blue{background:linear-gradient(145deg,#12329B,#164CC5 58%,#10265F)}
.nl-weekcard .nl-watermark{width:300px;left:auto;right:-45px;top:10px;opacity:.40}
.nl-lesson{position:relative;z-index:2;background:rgba(255,255,255,.94);color:#13233f;border-radius:14px;padding:13px 15px;margin-top:12px}
.nl-objectives{margin:7px 0 0;padding-right:18px;font-size:13px}
.nl-timeline{display:flex;gap:8px;align-items:center;overflow-x:auto;padding:14px 20px 22px}
.nl-timebtn{border:1px solid ${T.rule};background:#fff;border-radius:999px;padding:8px 13px;white-space:nowrap;cursor:pointer;font-family:inherit;color:${T.inkSoft}}
.nl-timebtn.on{background:${T.navy};color:#fff;border-color:${T.navy}}
@media(max-width:800px){.nl-grid{grid-template-columns:1fr}.nl-head{padding:22px 16px}.nl-weekcard{min-height:0}}

/* ===== Student Learning Hub — المرجع المعتمد ===== */
.stu-shell{padding-bottom:60px}
.stu-nav{margin:0 0 22px;background:#0d173d;border-radius:0 0 18px 18px;padding:11px 18px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;box-shadow:0 12px 28px -20px rgba(5,16,60,.5)}
.stu-nav button{border:0;background:transparent;color:#d9e2ff;font-family:inherit;font-weight:700;padding:9px 14px;border-radius:10px;cursor:pointer}
.stu-nav button:hover,.stu-nav button.on{background:linear-gradient(110deg,#b21f47,#283bb0);color:#fff}
.stu-kpis{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:14px;margin-bottom:24px}
.stu-kpi{background:#fff;border:1px solid #e3e8f1;border-radius:16px;padding:17px;box-shadow:0 9px 24px -20px rgba(16,34,80,.35)}
.stu-kpi-label{font-size:12px;color:#667085;font-weight:700}.stu-kpi-value{font-size:32px;font-weight:900;color:#102d6d;margin-top:5px}.stu-kpi-note{font-size:11px;color:#7a8498;margin-top:2px}
.stu-section-head{display:flex;align-items:end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:26px 0 13px}.stu-section-head h2{font-size:29px}.stu-section-head p{margin:0;color:#667085;font-size:12px}
.stu-course-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}
.stu-course{position:relative;overflow:hidden;border-radius:20px;background:#fff;border:1px solid #e1e6ef;box-shadow:0 15px 34px -24px rgba(15,35,95,.38);min-height:310px;display:flex;flex-direction:column}
.stu-course-top{padding:18px;color:#fff;min-height:110px;position:relative;overflow:hidden}.stu-course-top:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 22%,rgba(255,255,255,.24),transparent 34%)}
.stu-course.green .stu-course-top{background:linear-gradient(145deg,#0f6d5d,#1d8d77)}.stu-course.blue .stu-course-top{background:linear-gradient(145deg,#174bc0,#213fb1)}.stu-course.purple .stu-course-top{background:linear-gradient(145deg,#643bb4,#8a4cca)}.stu-course.red .stu-course-top{background:linear-gradient(145deg,#a5223f,#dc3551)}
.stu-course-body{padding:18px;display:flex;flex-direction:column;gap:12px;flex:1}.stu-ring{width:88px;height:88px;border-radius:50%;display:grid;place-items:center;margin:0 auto;background:conic-gradient(var(--ring) calc(var(--pct)*1%),#e9edf4 0);position:relative}.stu-ring:before{content:"";position:absolute;width:68px;height:68px;border-radius:50%;background:#fff}.stu-ring b{position:relative;z-index:1;font-size:20px;color:#102d6d}.stu-course-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:center;font-size:12px;color:#667085}.stu-course-meta b{display:block;color:#17346e;font-size:16px}.stu-course-btn{margin-top:auto;border:0;border-radius:10px;padding:11px 14px;color:#fff;font-family:inherit;font-weight:800;cursor:pointer}.stu-course.green .stu-course-btn{background:#16816d}.stu-course.blue .stu-course-btn{background:#2154c7}.stu-course.purple .stu-course-btn{background:#7650ba}.stu-course.red .stu-course-btn{background:#d62d49}
.stu-lower{display:grid;grid-template-columns:1.25fr .95fr;gap:18px;margin-top:24px}.stu-panel{background:#fff;border:1px solid #e3e8f1;border-radius:18px;padding:18px}.stu-activity{display:grid;gap:8px}.stu-act{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #eef1f5;font-size:12px}.stu-achievements{display:flex;gap:10px;flex-wrap:wrap}.stu-ach{background:linear-gradient(110deg,#fff7e3,#fff);border:1px solid #f0d798;border-radius:14px;padding:12px 14px;min-width:150px}.stu-ach b{display:block;color:#9b6811}
@media(max-width:900px){.stu-kpis{grid-template-columns:repeat(2,1fr)}.stu-lower{grid-template-columns:1fr}}
@media(max-width:560px){.stu-kpis{grid-template-columns:1fr 1fr}.stu-course-grid{grid-template-columns:1fr}.stu-nav{justify-content:flex-start;overflow-x:auto;flex-wrap:nowrap}.stu-nav button{white-space:nowrap}}

/* ===== Student internal pages + teacher multi-block picker ===== */
.stu-nav{padding:14px 18px;gap:14px}
.stu-nav button{font-size:17px;padding:12px 22px;min-width:150px}
.stu-nav button.on{box-shadow:0 9px 22px -14px rgba(48,68,190,.7)}
.stu-home-actions{display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:0;margin:22px 0 28px;border-radius:18px;overflow:hidden;background:linear-gradient(110deg,#8E2333 0%,#642849 30%,#2A2D68 62%,#12329B 100%);box-shadow:0 16px 38px -26px rgba(15,35,95,.6)}
.stu-home-card{border:0;border-left:1px solid rgba(255,255,255,.18);background:transparent;border-radius:0;padding:10px 16px;min-height:62px;cursor:pointer;font-family:inherit;text-align:center;color:#fff;display:flex;align-items:center;justify-content:center;gap:9px;box-shadow:none;transition:background .18s ease,transform .18s ease}
.stu-home-card:last-child{border-left:0}.stu-home-card:hover{background:rgba(255,255,255,.12);transform:none}
.stu-home-card .ico{font-size:24px;display:inline-block;margin:0}.stu-home-card b{display:inline-block;font-size:19px;color:#fff;white-space:nowrap}.stu-home-card small{display:none}
.stu-page-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:8px 0 20px}
.stu-page-back{border:1px solid #cad4e6;background:#fff;color:#17346e;border-radius:12px;padding:10px 16px;font-family:inherit;font-weight:800;cursor:pointer}
.stu-kpi{cursor:pointer;transition:transform .15s ease}.stu-kpi:hover{transform:translateY(-2px)}
.nl-block-picker{position:relative}
.nl-block-trigger{width:100%;min-height:44px;border:1px solid ${T.rule};border-radius:10px;background:#fff;color:${T.ink};font-family:inherit;font-weight:800;padding:9px 12px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px}
.nl-block-panel{position:absolute;z-index:30;top:calc(100% + 7px);right:0;left:0;background:#fff;border:1px solid #dce3ed;border-radius:15px;padding:12px;box-shadow:0 18px 42px -20px rgba(15,35,95,.45)}
.nl-block-actions{display:flex;gap:7px;margin-bottom:10px;flex-wrap:wrap}
.nl-block-grid{display:grid;grid-template-columns:repeat(9,1fr);gap:7px}
.nl-block-letter{border:1px solid #d9e0eb;background:#f8fafc;color:#17346e;border-radius:9px;padding:7px 4px;font-family:inherit;font-weight:900;cursor:pointer}
.nl-block-letter.on{background:${T.green};color:#fff;border-color:${T.green}}
@media(max-width:900px){.stu-home-actions{grid-template-columns:1fr 1fr}.nl-block-grid{grid-template-columns:repeat(6,1fr)}}
@media(max-width:560px){.stu-home-actions{grid-template-columns:1fr}.stu-nav button{font-size:15px;min-width:132px;padding:11px 15px}.nl-block-grid{grid-template-columns:repeat(5,1fr)}}

/* ===== Weekly Newsletter — التصميم المعتمد ===== */
.nl-shell{border-radius:26px;overflow:hidden;background:#f8fafc;box-shadow:0 22px 60px -32px rgba(15,32,80,.45);border:1px solid #dce3ee}
.nl-head{position:relative;overflow:hidden;background:linear-gradient(112deg,#7d1f31 0%,#622446 30%,#282966 60%,#102f8f 100%);color:#fff;padding:30px 34px 28px;text-align:center;min-height:158px;display:flex;align-items:center;justify-content:center}
.nl-head-logo{position:absolute;left:28px;top:24px;background:#fff;border-radius:15px;padding:8px 12px;box-shadow:0 8px 28px -16px rgba(0,0,0,.45)}.nl-head-logo img{height:46px;display:block}
.nl-watermark{position:absolute;width:420px;max-width:48vw;opacity:.40;left:9%;top:-128px;filter:none;mix-blend-mode:soft-light;pointer-events:none}
.nl-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:14px 22px;background:#fff;border-bottom:1px solid #e6eaf1}.nl-meta>div{background:#f7f9fc;border:1px solid #e4e8ef;border-radius:999px;padding:9px 12px;text-align:center;font-size:12px;color:#33476c}.nl-meta b{color:#102d6d}
.nl-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:20px}
.nl-weekcard{position:relative;overflow:hidden;border-radius:24px;color:#fff;padding:24px;min-height:450px;box-shadow:0 18px 36px -24px rgba(5,20,60,.65);border:1px solid rgba(255,255,255,.2)}
.nl-weekcard.red{background:linear-gradient(145deg,#8D2132 0%,#AE2D43 56%,#6f1c31 100%)}.nl-weekcard.blue{background:linear-gradient(145deg,#12329B 0%,#1851C8 58%,#10265F 100%)}
.nl-weekcard .nl-watermark{width:390px;left:auto;right:-70px;top:15px;opacity:.40;mix-blend-mode:soft-light}
.nl-week-title{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}.nl-week-title h2{color:#fff;font-size:27px}.nl-week-title span{font-size:42px}
.nl-lesson-feature{position:relative;z-index:2;display:grid;grid-template-columns:170px 1fr;gap:18px;align-items:start;margin-top:10px}.nl-lesson-orb{width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.96);color:#17346e;display:grid;place-items:center;text-align:center;padding:18px;box-shadow:0 12px 30px -20px rgba(0,0,0,.45)}.nl-lesson-orb small{display:block;color:#6d7890}.nl-lesson-orb b{display:block;font-size:22px;margin-top:5px}.nl-objective-list{display:grid;gap:10px}.nl-objective{display:grid;grid-template-columns:38px 1fr;align-items:center;gap:10px;background:rgba(255,255,255,.95);color:#263958;border-radius:13px;padding:10px 12px;min-height:54px}.nl-objective-num{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:900}.red .nl-objective-num{background:#8D2132}.blue .nl-objective-num{background:#12329B}.nl-extra-lessons{position:relative;z-index:2;margin-top:14px;display:grid;gap:10px}.nl-extra{background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.25);border-radius:13px;padding:11px 13px}.nl-extra b{display:block}.nl-extra ul{margin:5px 0 0;padding-right:18px;font-size:12px}
.nl-timeline-wrap{padding:16px 24px 22px;background:#fff;border-top:1px solid #e6eaf1}.nl-timeline-title{text-align:center;font-weight:900;color:#102d6d;margin-bottom:13px}.nl-timeline{display:flex;gap:8px;align-items:center;overflow-x:auto;padding:2px 0}.nl-timebtn{border:1px solid #dfe5ef;background:#fff;border-radius:999px;padding:9px 14px;white-space:nowrap;cursor:pointer;font-family:inherit;color:#51617e}.nl-timebtn.on{background:linear-gradient(110deg,#8D2132,#12329B);color:#fff;border-color:transparent}.nl-publish-note{padding:0 22px 14px;text-align:center;font-size:11px;color:#667085}
.nl-editor-shell{display:grid;gap:16px}.nl-editor-actions{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center}.nl-editor-cards{display:grid;grid-template-columns:1fr 1fr;gap:18px}.nl-editor-card{position:relative;overflow:hidden;border-radius:24px;padding:22px;color:#fff;min-height:390px}.nl-editor-card.red{background:linear-gradient(145deg,#8D2132,#AE2D43 56%,#6f1c31)}.nl-editor-card.blue{background:linear-gradient(145deg,#12329B,#1851C8 58%,#10265F)}.nl-editor-card .nl-watermark{width:360px;right:-75px;left:auto;top:0;opacity:.40}.nl-editor-card h2{position:relative;z-index:2;color:#fff}.nl-editor-item{position:relative;z-index:2;background:rgba(255,255,255,.96);border-radius:14px;padding:12px;margin-top:12px}.nl-editor-item .inp,.nl-editor-item .tarea{background:#fff}.nl-editor-add{position:relative;z-index:2;margin-top:10px;background:#fff!important;font-weight:800}.nl-editor-card.red .nl-editor-add{color:#8D2132}.nl-editor-card.blue .nl-editor-add{color:#12329B}
@media(max-width:850px){.nl-grid,.nl-editor-cards{grid-template-columns:1fr}.nl-meta{grid-template-columns:1fr 1fr}.nl-lesson-feature{grid-template-columns:1fr}.nl-lesson-orb{margin:auto}.nl-head-logo{position:static;margin-bottom:12px}.nl-head{flex-direction:column}.nl-watermark{max-width:none}}
`;

// شعار GEMS Founders School — مضمَّن مباشرة (بلا رابط خارجي قد ينكسر)، بخلفية شفافة
const LOGO_URL = "data:image/png;base64,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";
const LION_MARK_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><g fill="none" stroke="white" stroke-width="18" opacity=".88" stroke-linecap="round" stroke-linejoin="round"><path d="M300 88c-67 0-117 47-128 111-43 23-71 69-71 120 0 67 45 123 107 140 25 44 61 69 92 69s67-25 92-69c62-17 107-73 107-140 0-51-28-97-71-120C417 135 367 88 300 88Z"/><path d="M212 225c24-44 56-66 88-66s64 22 88 66M221 305c22-19 47-28 79-28s57 9 79 28M250 361c17 21 33 31 50 31s33-10 50-31M300 277v91M184 246l-44-35M416 246l44-35M172 345l-51 17M428 345l51 17"/><circle cx="248" cy="278" r="9" fill="white" stroke="none"/><circle cx="352" cy="278" r="9" fill="white" stroke="none"/></g></svg>`)}`;

const PHASES = [
  { code: "KS1", name: "الحلقة الأولى", min: 1, max: 3, q: 25, pass: 60, tries: 10 },
  { code: "KS2", name: "الحلقة الثانية", min: 4, max: 6, q: 25, pass: 65, tries: 5 },
  { code: "KS3", name: "الحلقة الثالثة", min: 7, max: 9, q: 25, pass: 70, tries: 4 },
  { code: "KS4", name: "الحلقة الرابعة", min: 10, max: 11, q: 25, pass: 70, tries: 4 },
  { code: "P16", name: "ما بعد 16", min: 12, max: 13, q: 25, pass: 70, tries: 3 },
];
const phaseFor = (g) => PHASES.find((p) => g >= p.min && g <= p.max) || PHASES[2];
const DOMAINS = { SP: "إملاء ورسم", GR: "نحو وصرف", RH: "بلاغة", RD: "قراءة وفهم", VC: "مفردات وتراكيب", WR: "كتابة وتعبير" };
const DEFAULT_BLOCKS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A..Z
const QTYPE = { mcq: "اختيار من متعدد", tf: "صواب وخطأ", fill: "أكمل الفراغ", match: "مطابقة", err: "حدّد الخطأ" };

/* ============================ أشكال ورسوم ============================ */
function Art({ name }) {
  const box = { width: "100%", height: "auto", display: "block", margin: "10px 0" };
  if (name === "hamza-anatomy") return (
    <svg viewBox="0 0 620 190" style={box} role="img" aria-label="تشريح كلمة سئل">
      <text x="310" y="86" textAnchor="middle" fontSize="58" fontFamily="Amiri,serif" fill={T.ink}>سُـئِـل</text>
      <line x1="360" y1="40" x2="330" y2="60" stroke={T.gold} strokeWidth="1.5" />
      <text x="368" y="36" fontSize="15" fill={T.gold} fontWeight="600">حركة ما قبلها: ضمة</text>
      <line x1="262" y1="130" x2="292" y2="98" stroke={T.brick} strokeWidth="1.5" />
      <text x="254" y="148" textAnchor="end" fontSize="15" fill={T.brick} fontWeight="600">حركة الهمزة: كسرة</text>
      <rect x="180" y="158" width="260" height="26" rx="13" fill={T.greenSoft} />
      <text x="310" y="176" textAnchor="middle" fontSize="14" fill={T.green} fontWeight="700">الأقوى: الكسرة ← نبرة</text>
    </svg>);
  if (name === "hamza-scale") return (
    <svg viewBox="0 0 620 200" style={box} role="img" aria-label="ميزان قوة الحركات">
      {[["الكسرة", "ئـ", T.brick, 0], ["الضمة", "ؤ", T.gold, 1], ["الفتحة", "أ", T.green, 2], ["السكون", "ء", T.inkSoft, 3]].map(([n, h, c, i]) => (
        <g key={n}><rect x={30 + i * 148} y={40 + i * 30} width="128" height={130 - i * 26} rx="10" fill={c + "1F"} stroke={c} strokeWidth="1" />
          <text x={94 + i * 148} y={70 + i * 30} textAnchor="middle" fontSize="15" fill={c} fontWeight="700">{n}</text>
          <text x={94 + i * 148} y={110 + i * 30} textAnchor="middle" fontSize="34" fontFamily="Amiri,serif" fill={T.ink}>{h}</text></g>))}
      <text x="590" y="30" textAnchor="end" fontSize="13" fill={T.inkSoft}>الأقوى ← الأضعف</text>
    </svg>);
  if (name === "passive-flow") return (
    <svg viewBox="0 0 620 240" style={box} role="img" aria-label="خطوات البناء للمجهول">
      {[["كَتَبَ الطالبُ الدرسَ", T.inkSoft, 14], ["احذف الفاعل", T.gold, 76], ["غيّر ضبط الفعل: كُتِبَ", T.gold, 138], ["ارفع المفعول: الدرسُ", T.green, 200]].map(([t, c, y], i) => (
        <g key={i}><rect x="110" y={y} width="400" height="44" rx="10" fill={c + "1A"} stroke={c} />
          <text x="310" y={y + 28} textAnchor="middle" fontSize="16" fill={T.ink} fontFamily="Amiri,serif">{t}</text>
          {i < 3 && <><path d={`M310 ${y + 44} L310 ${y + 62}`} stroke={T.rule} strokeWidth="2" /><polygon points={`304,${y + 56} 316,${y + 56} 310,${y + 64}`} fill={T.rule} /></>}</g>))}
    </svg>);
  if (name === "alif-tree") return (
    <svg viewBox="0 0 620 250" style={box} role="img" aria-label="شجرة قرار الألف اللينة">
      <rect x="215" y="10" width="190" height="40" rx="10" fill={T.greenSoft} stroke={T.green} />
      <text x="310" y="35" textAnchor="middle" fontSize="15" fill={T.ink}>اسم آخره ألف لينة</text>
      <path d="M280 50 L150 92" stroke={T.rule} strokeWidth="2" /><path d="M340 50 L470 92" stroke={T.rule} strokeWidth="2" />
      <text x="205" y="76" fontSize="12" fill={T.inkSoft}>ثلاثي</text><text x="410" y="76" fontSize="12" fill={T.inkSoft}>فوق الثلاثي</text>
      <rect x="55" y="92" width="190" height="40" rx="10" fill="#fff" stroke={T.rule} /><text x="150" y="117" textAnchor="middle" fontSize="14" fill={T.ink}>ثنِّه: ماذا ظهر؟</text>
      <rect x="375" y="92" width="190" height="40" rx="10" fill="#fff" stroke={T.rule} /><text x="470" y="117" textAnchor="middle" fontSize="14" fill={T.ink}>هل سبقتها ياء؟</text>
      <path d="M110 132 L75 176" stroke={T.rule} strokeWidth="2" /><path d="M190 132 L225 176" stroke={T.rule} strokeWidth="2" />
      <path d="M430 132 L395 176" stroke={T.rule} strokeWidth="2" /><path d="M510 132 L545 176" stroke={T.rule} strokeWidth="2" />
      {[["واو ← ا", 10, T.green], ["ياء ← ى", 160, T.gold], ["نعم ← ا", 330, T.green], ["لا ← ى", 480, T.gold]].map(([t, x, c]) => (
        <g key={t}><rect x={x} y="176" width="130" height="40" rx="10" fill={c + "1A"} stroke={c} />
          <text x={x + 65} y="201" textAnchor="middle" fontSize="15" fill={c} fontWeight="700" fontFamily="Amiri,serif">{t}</text></g>))}
      <text x="310" y="240" textAnchor="middle" fontSize="12" fill={T.inkSoft}>عصا · فتى · دنيا · ذكرى</text>
    </svg>);
  return null;
}

/* بطاقة كلمة/جملة كبيرة — صورة تصاحب سؤالًا أو مفهومًا دون الاعتماد على صور خارجية */
function WordCard({ text, note, tone }) {
  const c = tone || T.green;
  const big = (text || "").length <= 10;
  return (
    <svg viewBox="0 0 420 150" style={{ width: "100%", maxWidth: 380, height: "auto", display: "block", margin: "10px auto" }} role="img" aria-label={text}>
      <rect x="4" y="4" width="412" height="142" rx="16" fill={c + "12"} stroke={c} strokeWidth="1.5" />
      <text x="210" y="82" textAnchor="middle" fontSize={big ? 44 : 30} fontFamily="Amiri,serif" fontWeight="700" fill={T.ink}>{text}</text>
      {note && <text x="210" y="118" textAnchor="middle" fontSize="13" fill={c} fontWeight="600">{note}</text>}
    </svg>
  );
}

/* صفّ مفاهيم مُولَّد تلقائيًا من عناصر {label, note} — يمنح كل كورس مُولَّد
   بالذكاء الاصطناعي رسمًا توضيحيًا حقيقيًا دون تأليف SVG يدوي لكل موضوع */
function ConceptRow({ items }) {
  const list = (items || []).slice(0, 4);
  const n = list.length || 1;
  const w = 620 / n;
  const palette = [T.brick, T.gold, T.green, T.inkSoft];
  return (
    <svg viewBox="0 0 620 170" style={{ width: "100%", height: "auto", display: "block", margin: "10px 0" }} role="img" aria-label="مخطط توضيحي">
      {list.map((it, i) => { const c = palette[i % palette.length]; return (
        <g key={i}>
          <rect x={i * w + 8} y={20} width={w - 16} height={110} rx={12} fill={c + "16"} stroke={c} strokeWidth="1.2" />
          <text x={i * w + w / 2} y={65} textAnchor="middle" fontSize="16" fontWeight="700" fill={c} fontFamily="Amiri,serif">{it.label}</text>
          {it.note && <text x={i * w + w / 2} y={95} textAnchor="middle" fontSize="12" fill={T.inkSoft}>{it.note}</text>}
        </g>); })}
      <text x="310" y="155" textAnchor="middle" fontSize="11" fill={T.inkSoft} letterSpacing="1">عناصر القاعدة</text>
    </svg>
  );
}

/* ============================ المحتوى ============================ */
const C1 = {
  id: "c-hamza-7", title: "الهمزة المتوسطة", domain: "SP", grade: 7, stream: "A",
  blocks: ["A", "B"], students: [], status: "published", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يرسم الطالب الهمزة المتوسطة على صورتها الصحيحة معلِّلًا اختياره بقاعدة أقوى الحركتين.",
  resources: [],
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لن أعطيك القاعدة. اقرأ الجدول، ولاحظ العلاقة بين العمودين الأوسطين والعمود الأخير، ثم استنتج.",
      table: { head: ["الكلمة", "حركة الهمزة", "حركة ما قبلها", "صورة الهمزة"],
        rows: [["سُئِل", "كسرة", "ضمة", "نبرة ئـ"], ["مُؤْمِن", "سكون", "ضمة", "واو ؤ"], ["سَأَل", "فتحة", "فتحة", "ألف أ"], ["بِئْر", "سكون", "كسرة", "نبرة ئـ"]] },
      checks: [
        { t: "mcq", q: "من الجدول وحده: ما الذي يحكم صورة الهمزة؟", o: ["حركة الهمزة وحدها", "حركة ما قبلها وحدها", "أقوى الحركتين معًا", "موضعها في الكلمة"], a: 2, e: "في كل صف رُسمت على ما يناسب أقوى الحركتين." },
        { t: "mcq", q: "غلبت الكسرة الضمة، وغلبت الضمة السكون. أيّ ترتيب يفسّر ذلك؟", o: ["فتحة ← ضمة ← كسرة ← سكون", "كسرة ← ضمة ← فتحة ← سكون", "سكون ← فتحة ← ضمة ← كسرة", "ضمة ← كسرة ← فتحة ← سكون"], a: 1, e: "الكسرة أقوى، ثم الضمة، ثم الفتحة، وأضعفها السكون." }],
      reveal: "هذه قاعدتك التي استخرجتها بنفسك: صورة الهمزة تتبع أقوى الحركتين — حركتها وحركة سابقها." },
    { t: "rule", title: "الميزان والتشريح", strat: "التمثيل البصري", art: ["hamza-scale", "hamza-anatomy"],
      body: "لكل حركة حرفٌ يناسبها. شكّل الهمزة وما قبلها، رجّح الأقوى، ثم ارسم.",
      note: "استثناء لا يُقاس: همزة مفتوحة بعد ألف ساكنة تُرسم على السطر منعًا لاجتماع ألفين — قِرَاءَة، عَبَاءَة، بَرَاءَة. وكذلك بعد واو مدّية: مُرُوءَة.",
      checks: [
        { t: "tf", q: "إذا اجتمعت كسرة وضمة رُسمت الهمزة على واو.", a: false, e: "الكسرة أقوى، فتُرسم على نبرة." },
        { t: "mcq", q: "لماذا لم تُرسم همزة «قِرَاءَة» على ألف؟", o: ["لأن الفتحة ضعيفة", "كراهة اجتماع ألفين، فرُسمت على السطر", "لأن الكلمة مؤنثة", "لأن الهمزة متطرفة"], a: 1, e: "منعًا لاجتماع ألفين." }] },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الكلمة لتتكشّف خطوات التفكير واحدة تلو الأخرى.",
      items: [
        { w: "تَفَاؤُل", steps: ["حركة الهمزة: الضمة", "ما قبلها: ألف ساكنة", "الأقوى: الضمة", "على واو ← تَفَاؤُل"] },
        { w: "مَسْؤُول", steps: ["حركة الهمزة: الضمة", "ما قبلها: السكون", "الأقوى: الضمة", "على واو ← مَسْؤُول"] },
        { w: "فِئَة", steps: ["حركة الهمزة: الفتحة", "ما قبلها: الكسرة", "الأقوى: الكسرة", "على نبرة ← فِئَة"] },
        { w: "مُرُوءَة", steps: ["حركة الهمزة: الفتحة", "ما قبلها: واو مدّية", "تُمنع كراهة اجتماع واوين", "على السطر ← مُرُوءَة"] }] },
    { t: "template", title: "قالب التطبيق", strat: "التعلّم بالقالب",
      intro: "املأ القالب بنفسك لكل كلمة، ثم تحقّق.",
      cols: ["الكلمة", "حركة الهمزة", "حركة ما قبلها", "الأقوى", "الرسم"],
      opts: { 1: ["كسرة", "ضمة", "فتحة", "سكون"], 2: ["كسرة", "ضمة", "فتحة", "سكون"], 3: ["كسرة", "ضمة", "فتحة", "سكون"], 4: ["نبرة ئـ", "واو ؤ", "ألف أ", "السطر ء"] },
      rows: [["يَئِس", "كسرة", "فتحة", "كسرة", "نبرة ئـ"], ["رُؤُوس", "ضمة", "ضمة", "ضمة", "واو ؤ"], ["شَأْن", "سكون", "فتحة", "فتحة", "ألف أ"], ["عَبَاءَة", "فتحة", "سكون", "فتحة", "السطر ء"]] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "وزّع الكلمات على صورها الأربع.",
      cats: ["نبرة ئـ", "واو ؤ", "ألف أ", "السطر ء"],
      items: [["رئيس", "نبرة ئـ"], ["بِئْر", "نبرة ئـ"], ["مُؤْمِن", "واو ؤ"], ["تفاؤل", "واو ؤ"], ["سَأَل", "ألف أ"], ["مسألة", "ألف أ"], ["قراءة", "السطر ء"], ["مروءة", "السطر ء"]] },
    { t: "video", title: "مقاطع قصيرة ثم أسئلة", strat: "التعلّم المدمج",
      intro: "ثلاث لقطات قصيرة، بعد كل واحدة سؤال.",
      clips: [{ id: "Zu6W9eO6B8Q", start: 0, label: "لقطة ١: ما الهمزة المتوسطة؟" }, { id: "Zu6W9eO6B8Q", start: 180, label: "لقطة ٢: الرسم على واو" }, { id: "Q5kFf-xRLkw", start: 0, label: "لقطة ٣: مراجعة سريعة" }],
      checks: [
        { t: "mcq", q: "بعد اللقطة الأولى: كم صورة للهمزة المتوسطة؟", o: ["اثنتان", "ثلاث", "أربع", "خمس"], a: 2, e: "نبرة، واو، ألف، السطر." },
        { t: "tf", q: "بيّنت اللقطات أن حركة الإعراب تؤثر في رسم الهمزة.", a: false, e: "التشكيل الداخلي وحده هو المعتبر." },
        { t: "fill", q: "اكتب مثالًا على الرسم على واو.", a: ["مؤمن", "مسؤول", "تفاؤل", "رؤوس", "مُؤْمِن"], e: "أي مثال صحيح مقبول." }] },
    { t: "errors", title: "صيد الأخطاء", strat: "الخطأ المتعمَّد",
      intro: "في كل جملة كلمة واحدة خاطئة.",
      items: [
        { words: ["سُؤِل", "الطالبُ", "عن", "واجبه"], a: 0, fix: "سُئِل", e: "الكسرة أقوى من الضمة." },
        { words: ["يتحمّل", "المعلمُ", "مسئوليةً", "كبيرة"], a: 2, fix: "مسؤوليةً", e: "الضمة أقوى من السكون." },
        { words: ["كانت", "قرأة", "النصِّ", "متقنة"], a: 1, fix: "قراءة", e: "همزة مفتوحة بعد ألف ساكنة." },
        { words: ["مُئْمِنٌ", "بالله", "وبرسله"], a: 0, fix: "مُؤْمِن", e: "الضمة أقوى من السكون." }] },
    { t: "problem", title: "حلّ مشكلة", strat: "التعلّم القائم على المشكلات",
      body: "أُسندت إليك مراجعة لافتة معرض المدرسة قبل طباعتها:\n\n«معرضُ العلوم — نسئلكم الدعاء لكل من ساهم في تهيئة المكان، ونتمنى قرأة ممتعة للأبحاث»\n\nحدّد الخطأين وعلّل.",
      steps: ["«نسئلكم»: الفتحة أقوى من السكون ← «نسألكم».", "«قرأة»: همزة مفتوحة بعد ألف ساكنة ← «قراءة».", "القاعدة العملية: شكّل الهمزة وما قبلها أولًا، ثم رجّح."],
      checks: [{ t: "fill", q: "اكتب تصويب «نسئلكم».", a: ["نسألكم"], e: "الفتحة أقوى من السكون." }] },
    { t: "produce", title: "أنتج أنت", strat: "الإنتاج قبل التقويم",
      prompt: "اكتب جملة من إنشائك تجمع ثلاث صور مختلفة للهمزة المتوسطة، وعلّل رسم كل واحدة.",
      model: "نموذج: «سُئِل المسؤولُ عن قراءة التقرير». سُئِل ← نبرة، المسؤول ← واو، قراءة ← السطر.",
      pair: "شارك جملتك مع زميلك وليصحّح كلٌّ منكما للآخر قبل النظر إلى النموذج." },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "شكّل الهمزة وما قبلها، خذ أقوى الحركتين، ارسم على ما يناسبها.",
      bullets: ["الكسرة ← نبرة", "الضمة ← واو", "الفتحة ← ألف", "السكون ← السطر"],
      note: "الاختبار 25 سؤالًا متنوعًا بكلمات لم ترد في الشرح." },
  ],
  bank: [
    { t: "mcq", sn: "الرسم على نبرة", q: "الكتابة الصحيحة:", o: ["اشمئزاز", "اشمءزاز", "اشمؤزاز", "اشمأزاز"], a: 0, e: "الكسرة أقوى." },
    { t: "mcq", sn: "الرسم على واو", q: "الكتابة الصحيحة:", o: ["يُؤَجّل", "يُئَجّل", "يُأَجّل", "يُءَجّل"], a: 0, e: "الضمة أقوى من الفتحة." },
    { t: "mcq", sn: "الرسم على ألف", q: "الكتابة الصحيحة:", o: ["يَتَأَلّم", "يَتَؤَلّم", "يَتَئَلّم", "يَتَءَلّم"], a: 0, e: "فتحتان." },
    { t: "mcq", sn: "الرسم على السطر", q: "الكتابة الصحيحة:", o: ["تساءل", "تسائل", "تساؤل", "تساأل"], a: 0, e: "همزة مفتوحة بعد ألف ساكنة." },
    { t: "mcq", sn: "الرسم على نبرة", q: "الكتابة الصحيحة:", o: ["طمأنينة", "طمئنينة", "طمؤنينة", "طمءنينة"], a: 0, e: "الهمزة ساكنة وما قبلها مفتوح." },
    { t: "mcq", sn: "الرسم على واو", q: "الكتابة الصحيحة لمصدر «تشاءم»:", o: ["تشاؤم", "تشائم", "تشاأم", "تشاءم"], a: 0, e: "الضمة أقوى." },
    { t: "mcq", sn: "التعليل", q: "«ملائكة» رُسمت على نبرة لأن حركة الهمزة:", o: ["الكسرة", "الضمة", "الفتحة", "السكون"], a: 0, e: "الكسرة أقوى." },
    { t: "mcq", sn: "الرسم على نبرة", q: "الكتابة الصحيحة:", o: ["ناشئة", "ناشأة", "ناشؤة", "ناشءة"], a: 0, e: "الكسرة أقوى." },
    { t: "mcq", sn: "التعليل", q: "«يَقْرَؤُون» رُسمت على واو لأن:", o: ["الضمة أقوى من الفتحة", "الفتحة أقوى", "ما قبلها ألف", "متطرفة"], a: 0, e: "حركة الهمزة الضمة." },
    { t: "mcq", sn: "الرسم على السطر", q: "الكتابة الصحيحة:", o: ["إضاءة", "إضائة", "إضاأة", "إضاؤة"], a: 0, e: "همزة مفتوحة بعد ألف ساكنة." },
    { t: "tf", sn: "قاعدة الأقوى", q: "في «سَئِمَ» رُسمت الهمزة على نبرة لأن الكسرة أقوى من الفتحة.", a: true, e: "الكسرة أقوى." },
    { t: "tf", sn: "الرسم على واو", q: "«يُؤْمِن» كتابة خاطئة.", a: false, e: "صحيحة." },
    { t: "tf", sn: "الرسم على ألف", q: "«مَنْشَأ» رُسمت على ألف لأن الفتحة مع الفتحة.", a: true, e: "فتحتان." },
    { t: "tf", sn: "استثناء الألف", q: "«عباءة» تُرسم همزتها على ألف.", a: false, e: "على السطر." },
    { t: "tf", sn: "التعليل", q: "حركة الإعراب تُحسب في ترجيح الرسم.", a: false, e: "التشكيل الداخلي وحده." },
    { t: "tf", sn: "الرسم على نبرة", q: "«مِئْذَنة» تُرسم على نبرة.", a: true, e: "الكسرة أقوى." },
    { t: "tf", sn: "الرسم على السطر", q: "«مُرُوءَة» تُرسم على واو.", a: false, e: "على السطر كراهة اجتماع واوين." },
    { t: "fill", sn: "التصويب", q: "صوّب: «شعرتُ بالطمئنينة».", a: ["الطمأنينة", "طمأنينة"], e: "ألف." },
    { t: "fill", sn: "التصويب", q: "صوّب: «تسائل الطلاب عن النتيجة».", a: ["تساءل"], e: "السطر." },
    { t: "fill", sn: "التصويب", q: "صوّب: «يُئَجّل الاجتماع».", a: ["يؤجل", "يُؤَجّل", "يُؤجل"], e: "واو." },
    { t: "fill", sn: "التطبيق", q: "اكتب مضارع «سأل» مسندًا إلى واو الجماعة: «هم يس__لون».", a: ["يسألون", "يَسْأَلون"], e: "ألف." },
    { t: "fill", sn: "التصويب", q: "صوّب: «كتب مقالًا عن التشائم».", a: ["التشاؤم", "تشاؤم"], e: "واو." },
    { t: "match", sn: "الصورة والسبب", q: "طابق كل كلمة بسبب رسم همزتها.",
      pairs: [["مِئْذَنة", "الكسرة أقوى من السكون"], ["يَقْرَؤُون", "الضمة أقوى من الفتحة"], ["مَنْشَأ", "فتحتان"], ["إضاءة", "ألف ساكنة قبل همزة مفتوحة"]], e: "طبّق الميزان." },
    { t: "match", sn: "التصويب", q: "طابق الكلمة الخاطئة بتصويبها.",
      pairs: [["تسائل", "تساءل"], ["الطمئنينة", "الطمأنينة"], ["يُئجّل", "يُؤجّل"], ["ناشأة", "ناشئة"]], e: "لكل حالة تعليلها." },
    { t: "match", sn: "الصورة والحركة", q: "طابق الحركة الأقوى بالصورة الناتجة.",
      pairs: [["الكسرة", "نبرة ئـ"], ["الضمة", "واو ؤ"], ["الفتحة", "ألف أ"], ["ألف ساكنة قبل فتحة", "السطر ء"]], e: "لكل حركة حرف يناسبها." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["شعر", "الفريق", "بالطمئنينة", "بعد الفوز"], a: 2, fix: "بالطمأنينة", e: "ألف." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["تسائل", "الحضور", "عن", "الموعد"], a: 0, fix: "تساءل", e: "السطر." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["يُئجّل", "المديرُ", "الاجتماعَ"], a: 0, fix: "يُؤجّل", e: "واو." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["أضاءت", "الإضائة", "قاعةَ", "المعرض"], a: 1, fix: "الإضاءة", e: "السطر." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["هذه", "ناشأة", "أدبية", "واعدة"], a: 1, fix: "ناشئة", e: "نبرة." },
  ],
};
const C2 = {
  id: "c-fael-7", title: "الفاعل ونائب الفاعل", domain: "GR", grade: 7, stream: "A",
  blocks: ["A"], students: [], status: "published", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب الفاعل ونائب الفاعل، ويحوّل بين المبني للمعلوم والمجهول.",
  resources: [],
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "قارن كل جملتين متقابلتين.",
      table: { head: ["مبني للمعلوم", "مبني للمجهول", "تغيّر الفعل", "تغيّر الاسم"],
        rows: [["كَتَبَ الطالبُ الدرسَ", "كُتِبَ الدرسُ", "ضُمّ أوله وكُسر ما قبل آخره", "الدرسَ ← الدرسُ"],
               ["يَفْتَحُ العاملُ البابَ", "يُفْتَحُ البابُ", "ضُمّ أوله وفُتح ما قبل آخره", "البابَ ← البابُ"],
               ["قَالَ الشاهدُ الحقَّ", "قِيلَ الحقُّ", "كُسر أوله وقُلبت علته ياءً", "الحقَّ ← الحقُّ"]] },
      checks: [
        { t: "mcq", q: "ماذا حدث للمفعول به بعد حذف الفاعل؟", o: ["حُذف", "بقي منصوبًا", "رُفع وناب عن الفاعل", "صار فعلًا"], a: 2, e: "يُرفع." },
        { t: "mcq", q: "الفرق بين ضبط الماضي والمضارع عند البناء للمجهول:", o: ["الماضي يُكسر ما قبل آخره والمضارع يُفتح", "كلاهما يُكسر", "كلاهما يُفتح", "لا فرق"], a: 0, e: "الماضي كسر، والمضارع فتح." }],
      reveal: "استنتجت التعريف: نائب الفاعل اسم مرفوع حلّ محلّ الفاعل." },
    { t: "rule", title: "المسار في أربع خطوات", strat: "التمثيل البصري", art: ["passive-flow"],
      body: "الفاعل مرفوع بعد المعلوم، ونائب الفاعل مرفوع بعد المجهول.",
      note: "نائب الفاعل قد لا يكون المفعول به: جارًّا ومجرورًا، أو ظرفًا، أو مصدرًا.",
      checks: [
        { t: "tf", q: "الفاعل يُنصب إذا تأخر عن المفعول به.", a: false, e: "مرفوع دائمًا." },
        { t: "mcq", q: "«يُكرَمُ المجتهدونَ» — علامة رفع نائب الفاعل:", o: ["الضمة", "الألف", "الواو", "الفتحة"], a: 2, e: "جمع مذكر سالم." }] },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات التحويل.",
      items: [
        { w: "شرح المعلمُ الدرسَ", steps: ["احذف الفاعل", "ماضٍ: ضمّ الأول واكسر ما قبل الآخر ← شُرِحَ", "ارفع المفعول ← الدرسُ", "شُرِحَ الدرسُ"] },
        { w: "يقرأ الطلابُ القصةَ", steps: ["احذف الفاعل", "مضارع: ضمّ الأول وافتح ما قبل الآخر ← يُقرَأُ", "ارفع المفعول ← القصةُ", "يُقرَأُ القصةُ"] },
        { w: "باع التاجرُ القمحَ", steps: ["الفعل أجوف", "اكسر الأول واقلب العلة ياءً ← بِيعَ", "ارفع المفعول ← القمحُ", "بِيعَ القمحُ"] },
        { w: "دعا الإمامُ الناسَ", steps: ["الفعل ناقص", "ضمّ الأول واقلب الآخر ياءً ← دُعِيَ", "ارفع المفعول ← الناسُ", "دُعِيَ الناسُ"] }] },
    { t: "template", title: "قالب التحويل", strat: "التعلّم بالقالب",
      intro: "لكل جملة: حدّد نوع الفعل، ثم ضبطه المجهول، ثم علامة رفع نائب الفاعل.",
      cols: ["الجملة", "نوع الفعل", "الفعل مجهولًا", "علامة الرفع"],
      opts: { 1: ["ماضٍ صحيح", "مضارع", "أجوف", "ناقص"], 2: ["كُتِبَ", "يُفتَحُ", "بِيعَ", "دُعِيَ"], 3: ["الضمة", "الألف", "الواو"] },
      rows: [["كتب الطالبُ الدرسَ", "ماضٍ صحيح", "كُتِبَ", "الضمة"], ["يفتح العاملُ البابَ", "مضارع", "يُفتَحُ", "الضمة"], ["باع التاجرُ القمحَ", "أجوف", "بِيعَ", "الضمة"], ["دعا الإمامُ المصلّينَ", "ناقص", "دُعِيَ", "الواو"]] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف الجمل: أيّها فيه فاعل؟ وأيّها فيه نائب فاعل؟",
      cats: ["فيه فاعل", "فيه نائب فاعل"],
      items: [["حضر المعلمُ", "فيه فاعل"], ["كُسِر الزجاجُ", "فيه نائب فاعل"], ["فاز اللاعبونَ", "فيه فاعل"], ["يُكرَمُ الضيفُ", "فيه نائب فاعل"], ["سِيرَ على الطريقِ", "فيه نائب فاعل"], ["اجتهدت الطالبةُ", "فيه فاعل"]] },
    { t: "video", title: "مقاطع قصيرة ثم أسئلة", strat: "التعلّم المدمج",
      intro: "لقطتان قصيرتان.",
      clips: [{ id: "2tLJA0MfiJA", start: 0, label: "لقطة ١: ما المبني للمجهول؟" }, { id: "Rtf8m-0o-ls", start: 60, label: "لقطة ٢: إعراب نائب الفاعل" }],
      checks: [
        { t: "mcq", q: "لماذا يُحذف الفاعل؟", o: ["للإطالة", "للجهل به أو الإيجاز أو عدم إرادة ذكره", "لأن الجملة اسمية", "لأن الفعل لازم"], a: 1, e: "ثلاثة أسباب." },
        { t: "tf", q: "يمكن حذف نائب الفاعل.", a: false, e: "عمدة لا يُحذف." },
        { t: "fill", q: "اكتب «قال» مبنيًّا للمجهول.", a: ["قيل", "قِيلَ"], e: "أجوف." }] },
    { t: "errors", title: "صيد الأخطاء", strat: "الخطأ المتعمَّد",
      intro: "في كل جملة كلمة واحدة ضُبطت خطأً.",
      items: [
        { words: ["حضر", "المعلمَ", "مبكرًا"], a: 1, fix: "المعلمُ", e: "الفاعل مرفوع." },
        { words: ["فاز", "اللاعبينَ", "بالبطولة"], a: 1, fix: "اللاعبونَ", e: "جمع مذكر سالم." },
        { words: ["كُتِبَ", "الدرسَ", "بخطٍّ", "جميل"], a: 1, fix: "الدرسُ", e: "نائب الفاعل مرفوع." },
        { words: ["نجح", "الطالبينِ", "في", "الامتحان"], a: 1, fix: "الطالبانِ", e: "المثنى بالألف." }] },
    { t: "problem", title: "حلّ مشكلة", strat: "التعلّم القائم على المشكلات",
      body: "أنت محرّر النشرة المدرسية:\n\n«أُعلن نتائجَ المسابقة أمس، وسُلّم الجوائزَ للفائزين، ويُكرَم المشاركينَ الأسبوع القادم.»\n\nثلاثة أخطاء. صوّبها.",
      steps: ["«نتائجَ» ← «نتائجُ».", "«الجوائزَ» ← «الجوائزُ».", "«المشاركينَ» ← «المشاركونَ».", "القاعدة: لا يبقى مفعول به منصوب مع فعل مبني للمجهول."],
      checks: [{ t: "fill", q: "صوّب: «يُكرَم المشاركينَ».", a: ["المشاركون", "المشاركونَ"], e: "واو." }] },
    { t: "produce", title: "أنتج أنت", strat: "الإنتاج قبل التقويم",
      prompt: "اكتب فقرة قصيرة تبني فيها الأفعال للمجهول، واضبط نائب الفاعل.",
      model: "نموذج: «فُتِحَ المعرضُ صباحًا. عُرِضَت الأبحاثُ. كُرِّمَ الفائزونَ.»",
      pair: "بادل فقرتك مع زميلك قبل النظر إلى النموذج." },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "الفاعل بعد المعلوم، ونائب الفاعل بعد المجهول.",
      bullets: ["ماضٍ: ضمّ + كسر", "مضارع: ضمّ + فتح", "أجوف: كسر + قلب ياء", "ناقص: ضمّ + قلب ياء"],
      note: "الاختبار 25 سؤالًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "تعيين الفاعل", q: "الفاعل في «انطلقت الحافلةُ صباحًا»:", o: ["انطلقت", "الحافلةُ", "صباحًا", "لا فاعل"], a: 1, e: "اسم مرفوع." },
    { t: "mcq", sn: "علامة الرفع", q: "«تفوّق المهندسونَ» — علامة رفع الفاعل:", o: ["الضمة", "الألف", "الواو", "الياء"], a: 2, e: "جمع مذكر سالم." },
    { t: "mcq", sn: "نائب الفاعل", q: "نائب الفاعل في «هُدِمَ الجدارُ»:", o: ["هُدِمَ", "الجدارُ", "محذوف", "لا يوجد"], a: 1, e: "مرفوع." },
    { t: "mcq", sn: "البناء للمجهول", q: "المبني للمجهول من «زرع الفلاحُ القمحَ»:", o: ["زُرِعَ القمحُ", "زَرَعَ القمحُ", "زُرِعَ القمحَ", "يُزرَع القمحَ"], a: 0, e: "ضمّ + كسر + رفع." },
    { t: "mcq", sn: "الفعل الناقص", q: "«دعا» مبنيًّا للمجهول:", o: ["دُعِيَ", "دَعَى", "دُعَا", "دِيعَ"], a: 0, e: "ضمّ + قلب ياء." },
    { t: "mcq", sn: "أنواع نائب الفاعل", q: "في «سُهِرَت ليلةُ العيدِ» نائب الفاعل:", o: ["ضمير مستتر", "ظرف زمان", "جار ومجرور", "مصدر"], a: 1, e: "الظرف ينوب." },
    { t: "mcq", sn: "علامة الرفع", q: "«فُتِحَ البابانِ» — علامة رفع نائب الفاعل:", o: ["الضمة", "الألف", "الواو", "الكسرة"], a: 1, e: "المثنى بالألف." },
    { t: "mcq", sn: "الفعل الأجوف", q: "«صام» مبنيًّا للمجهول:", o: ["صِيمَ", "صُومَ", "صَامَ", "صُيِمَ"], a: 0, e: "كسر + قلب ياء." },
    { t: "mcq", sn: "تعيين الفاعل", q: "أيّ الجمل فاعلها مصدر مؤوّل؟", o: ["يسرّني أن تنجحَ", "حضر الضيوفُ", "فازت البنتُ", "كُتِبَ الدرسُ"], a: 0, e: "«أن تنجح» في محل رفع." },
    { t: "mcq", sn: "البناء للمجهول", q: "المبني للمجهول من «يوزّع المديرُ الشهاداتِ»:", o: ["تُوزَّعُ الشهاداتُ", "يُوزِّعُ الشهاداتُ", "وُزِّعَ الشهاداتِ", "تُوزِّعُ الشهاداتِ"], a: 0, e: "ضمّ + فتح + تأنيث." },
    { t: "tf", sn: "حكم الفاعل", q: "الفاعل مرفوع مهما تغيّر موقعه.", a: true, e: "حكم ثابت." },
    { t: "tf", sn: "نائب الفاعل", q: "يمكن حذف نائب الفاعل دون اختلال المعنى.", a: false, e: "عمدة." },
    { t: "tf", sn: "البناء للمجهول", q: "المضارع عند البناء للمجهول يُضمّ أوله ويُكسر ما قبل آخره.", a: false, e: "يُفتح." },
    { t: "tf", sn: "الفعل الناقص", q: "«رمى» مبنيًّا للمجهول تصير «رُمِيَ».", a: true, e: "قلب ياء." },
    { t: "tf", sn: "أنواع نائب الفاعل", q: "الجار والمجرور لا يصلح نائب فاعل.", a: false, e: "يصلح." },
    { t: "tf", sn: "علامة الرفع", q: "«كُرِّمَ الفائزينَ» جملة صحيحة.", a: false, e: "الصواب الفائزونَ." },
    { t: "tf", sn: "الفعل الأجوف", q: "«باع» مبنيًّا للمجهول تصير «بُوِعَ».", a: false, e: "الصواب بِيعَ." },
    { t: "fill", sn: "البناء للمجهول", q: "اكتب «زَرَعَ» مبنيًّا للمجهول.", a: ["زرع", "زُرِع", "زُرِعَ"], e: "ضمّ + كسر." },
    { t: "fill", sn: "البناء للمجهول", q: "اكتب «يَحْصُدُ» مبنيًّا للمجهول.", a: ["يحصد", "يُحصَد", "يُحْصَدُ"], e: "ضمّ + فتح." },
    { t: "fill", sn: "علامة الرفع", q: "صوّب: «كُرِّمَ الفائزينَ».", a: ["الفائزون", "الفائزونَ"], e: "واو." },
    { t: "fill", sn: "تعيين الفاعل", q: "استخرج الفاعل من «تسابق الفريقانِ بحماسة».", a: ["الفريقان", "الفريقانِ"], e: "ألف." },
    { t: "fill", sn: "الفعل الناقص", q: "اكتب «رمى» مبنيًّا للمجهول.", a: ["رمي", "رُمِيَ", "رُمي"], e: "قلب ياء." },
    { t: "match", sn: "البناء للمجهول", q: "طابق الفعل بصيغته مبنيًّا للمجهول.",
      pairs: [["زَرَعَ", "زُرِعَ"], ["يَحْصُدُ", "يُحْصَدُ"], ["صَامَ", "صِيمَ"], ["رَمَى", "رُمِيَ"]], e: "لكل نوع ضبطه." },
    { t: "match", sn: "أنواع نائب الفاعل", q: "طابق الجملة بنوع نائب الفاعل فيها.",
      pairs: [["كُسِر الزجاجُ", "مفعول به"], ["سِيرَ على الطريقِ", "جار ومجرور"], ["سُهِرَت ليلةُ العيد", "ظرف"], ["احتُفِلَ احتفالٌ كبير", "مصدر"]], e: "أربعة أنواع." },
    { t: "match", sn: "علامات الرفع", q: "طابق الاسم بعلامة رفعه.",
      pairs: [["الفائزونَ", "الواو"], ["البابانِ", "الألف"], ["الحافلةُ", "الضمة"], ["الطالباتُ", "الضمة"]], e: "علامات الرفع." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["انطلقت", "الحافلةَ", "صباحًا"], a: 1, fix: "الحافلةُ", e: "الفاعل مرفوع." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["كُرِّمَ", "الفائزينَ", "في", "الحفل"], a: 1, fix: "الفائزونَ", e: "واو." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["تسابق", "الفريقينِ", "بحماسة"], a: 1, fix: "الفريقانِ", e: "ألف." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["هُدِمَ", "الجدارَ", "القديمَ"], a: 1, fix: "الجدارُ", e: "نائب الفاعل مرفوع." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["تفوّق", "المهندسينَ", "في", "المسابقة"], a: 1, fix: "المهندسونَ", e: "واو." },
  ],
};
const C3 = {
  id: "c-alif-4", title: "الألف اللينة في آخر الأسماء", domain: "SP", grade: 4, stream: "A",
  blocks: ["A", "B", "C"], students: [], status: "published", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يكتب الطالب الألف اللينة قائمة أو مقصورة معتمدًا على التثنية.",
  resources: [],
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "ثنِّ كل اسم، وانظر ماذا ظهر مكان الألف.",
      table: { head: ["الاسم", "عند التثنية", "ما ظهر", "صورة الألف"],
        rows: [["عصا", "عصوان", "واو", "قائمة ا"], ["فتى", "فتيان", "ياء", "مقصورة ى"], ["رِضا", "رضوان", "واو", "قائمة ا"], ["هدى", "هديان", "ياء", "مقصورة ى"]] },
      checks: [
        { t: "mcq", q: "ما الذي يحدّد صورة الألف؟", o: ["عدد حروفه", "أصل الألف الذي يظهر بالتثنية", "معنى الكلمة", "حركة أوله"], a: 1, e: "التثنية تكشف الأصل." },
        { t: "mcq", q: "إذا ظهرت ياء عند التثنية كُتبت الألف:", o: ["قائمة ا", "مقصورة ى", "همزة", "لا تُكتب"], a: 1, e: "أصلها ياء." }],
      reveal: "قاعدتك: ثنِّ الاسم؛ واو ← قائمة، ياء ← مقصورة." },
    { t: "rule", title: "شجرة القرار", strat: "التمثيل البصري", art: ["alif-tree"],
      body: "امشِ في الشجرة: هل الاسم ثلاثي؟ ثنِّه. فوق الثلاثي؟ هل سبقتها ياء؟",
      note: "ذكرى، مستشفى، كبرى (مقصورة) — دنيا، عليا، هدايا (قائمة).",
      checks: [
        { t: "tf", q: "كل اسم فوق الثلاثي تُكتب ألفه مقصورة بلا استثناء.", a: false, e: "يُستثنى ما سُبق بياء." },
        { t: "mcq", q: "«دنيا» كُتبت قائمة لأن:", o: ["أصلها واو", "سبقتها ياء", "هي ثلاثية", "هي علم"], a: 1, e: "استثناء." }] },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الكلمة لترى خطوات الحكم.",
      items: [
        { w: "عصا", steps: ["ثلاثي", "ثنِّه: عصوان", "ظهرت واو", "قائمة ← عصا"] },
        { w: "فتى", steps: ["ثلاثي", "ثنِّه: فتيان", "ظهرت ياء", "مقصورة ← فتى"] },
        { w: "ذكرى", steps: ["فوق الثلاثي", "لم تسبقها ياء", "إذن مقصورة", "ذكرى"] },
        { w: "دنيا", steps: ["فوق الثلاثي", "سبقتها ياء", "إذن قائمة", "دنيا"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "وزّع الأسماء على الصورتين.",
      cats: ["ألف قائمة ا", "ألف مقصورة ى"],
      items: [["عصا", "ألف قائمة ا"], ["رِضا", "ألف قائمة ا"], ["دنيا", "ألف قائمة ا"], ["فتى", "ألف مقصورة ى"], ["هدى", "ألف مقصورة ى"], ["ذكرى", "ألف مقصورة ى"], ["مستشفى", "ألف مقصورة ى"], ["عليا", "ألف قائمة ا"]] },
    { t: "errors", title: "صيد الأخطاء", strat: "الخطأ المتعمَّد",
      intro: "في كل جملة كلمة واحدة كُتبت ألفها خطأً.",
      items: [
        { words: ["حمل", "الفتا", "العصا"], a: 1, fix: "الفتى", e: "«فتيان»." },
        { words: ["انكسرت", "العصى", "في", "يده"], a: 1, fix: "العصا", e: "«عصوان»." },
        { words: ["سقط", "الندا", "على", "الورد"], a: 1, fix: "الندى", e: "«نديان»." },
        { words: ["زرنا", "المستشفا", "أمس"], a: 1, fix: "المستشفى", e: "فوق الثلاثي." }] },
    { t: "problem", title: "حلّ مشكلة", strat: "التعلّم القائم على المشكلات",
      body: "كتب زميلك بطاقة تهنئة:\n\n«إلى الفتا المجتهد: أهنئك على جائزتك. أهدي إليك عصى الجدّ، وأتمنى لك حياة كلها هدا.»\n\nثلاثة أخطاء. حدّدها وعلّل.",
      steps: ["«الفتا» ← «الفتى»: فتيان.", "«عصى» ← «عصا»: عصوان.", "«هدا» ← «هدى»: هديان.", "لا تكتب الألف بالسماع؛ ثنِّ أولًا."],
      checks: [{ t: "fill", q: "صوّب كلمة «عصى» في البطاقة.", a: ["عصا"], e: "«عصوان»." }] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "ثلاثي؟ ثنِّه: واو ← قائمة، ياء ← مقصورة. فوق الثلاثي؟ مقصورة إلا بعد ياء.",
      bullets: ["عصا ← عصوان ← قائمة", "فتى ← فتيان ← مقصورة", "ذكرى ← فوق الثلاثي ← مقصورة", "دنيا ← بعد ياء ← قائمة"],
      note: "الاختبار 25 سؤالًا بأسماء جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "الألف القائمة", q: "الكتابة الصحيحة:", o: ["صفا", "صفى", "صفاء", "صفي"], a: 0, e: "«صفوان»." },
    { t: "mcq", sn: "الألف المقصورة", q: "الكتابة الصحيحة:", o: ["رحا", "رحى", "رحاء", "رحي"], a: 1, e: "«رحيان»." },
    { t: "mcq", sn: "الألف القائمة", q: "الكتابة الصحيحة:", o: ["شذا", "شذى", "شذاء", "شذي"], a: 0, e: "«شذوان»." },
    { t: "mcq", sn: "فوق الثلاثي", q: "الكتابة الصحيحة:", o: ["كبرا", "كبرى", "كبراء", "كبري"], a: 1, e: "فوق الثلاثي." },
    { t: "mcq", sn: "استثناء الياء", q: "الكتابة الصحيحة:", o: ["هدايى", "هدايا", "هداية", "هداي"], a: 1, e: "سبقتها ياء." },
    { t: "mcq", sn: "التثنية", q: "تثنية «رحى»:", o: ["رحوان", "رحيان", "رحاءان", "رحان"], a: 1, e: "ياء." },
    { t: "mcq", sn: "الألف المقصورة", q: "أيّ الأسماء أصل ألفه ياء؟", o: ["صفا", "شذا", "مرمى", "رِضا"], a: 2, e: "«مرميان»." },
    { t: "mcq", sn: "فوق الثلاثي", q: "الكتابة الصحيحة:", o: ["مصطفا", "مصطفى", "مصطفاء", "مصطفي"], a: 1, e: "فوق الثلاثي." },
    { t: "mcq", sn: "استثناء الياء", q: "«عليا» كُتبت قائمة لأن:", o: ["أصلها واو", "سبقتها ياء", "ثلاثية", "علم"], a: 1, e: "استثناء." },
    { t: "mcq", sn: "الألف القائمة", q: "أيّ الأسماء تُكتب ألفه قائمة؟", o: ["مرمى", "كبرى", "صفا", "ذكرى"], a: 2, e: "«صفوان»." },
    { t: "tf", sn: "أداة القاعدة", q: "نعتمد على السماع في كتابة الألف اللينة.", a: false, e: "نعتمد على التثنية." },
    { t: "tf", sn: "الألف القائمة", q: "«شذا» تُكتب قائمة لأن أصل ألفها واو.", a: true, e: "«شذوان»." },
    { t: "tf", sn: "الألف المقصورة", q: "«رحى» تُكتب قائمة.", a: false, e: "أصلها ياء." },
    { t: "tf", sn: "فوق الثلاثي", q: "«مصطفى» تُكتب مقصورة.", a: true, e: "قاعدة ما زاد على ثلاثة." },
    { t: "tf", sn: "استثناء الياء", q: "«هدايا» تُكتب مقصورة.", a: false, e: "سبقتها ياء." },
    { t: "tf", sn: "التثنية", q: "تثنية «صفا» هي «صفيان».", a: false, e: "«صفوان»." },
    { t: "tf", sn: "الألف المقصورة", q: "«مرمى» أصل ألفه ياء.", a: true, e: "«مرميان»." },
    { t: "fill", sn: "التصويب", q: "صوّب: «طحن القمح في الرحا».", a: ["الرحى", "رحى"], e: "ياء." },
    { t: "fill", sn: "التصويب", q: "صوّب: «جلسنا على صفى النهر».", a: ["صفا"], e: "واو." },
    { t: "fill", sn: "التثنية", q: "اكتب تثنية «شذا».", a: ["شذوان"], e: "واو." },
    { t: "fill", sn: "فوق الثلاثي", q: "صوّب: «هذه ذكرا جميلة».", a: ["ذكرى"], e: "فوق الثلاثي." },
    { t: "fill", sn: "استثناء الياء", q: "صوّب: «وزّع المعلم الهدايى».", a: ["الهدايا", "هدايا"], e: "سبقتها ياء." },
    { t: "match", sn: "أصل الألف", q: "طابق كل اسم بأصل ألفه.",
      pairs: [["صفا", "واو"], ["رحى", "ياء"], ["شذا", "واو"], ["مرمى", "ياء"]], e: "التثنية تكشف الأصل." },
    { t: "match", sn: "التثنية", q: "طابق الاسم بتثنيته.",
      pairs: [["صفا", "صفوان"], ["رحى", "رحيان"], ["شذا", "شذوان"], ["مرمى", "مرميان"]], e: "أداة الحكم." },
    { t: "match", sn: "القاعدة المطبَّقة", q: "طابق الاسم بالقاعدة التي حكمت رسمه.",
      pairs: [["عصا", "ثلاثي أصله واو"], ["فتى", "ثلاثي أصله ياء"], ["ذكرى", "فوق الثلاثي"], ["دنيا", "سبقتها ياء"]], e: "ثلاث قواعد واستثناء." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["طحنّا", "القمح", "في", "الرحا"], a: 3, fix: "الرحى", e: "ياء." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["جلسنا", "على", "صفى", "النهر"], a: 2, fix: "صفا", e: "واو." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["هذه", "ذكرا", "جميلة"], a: 1, fix: "ذكرى", e: "فوق الثلاثي." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["وزّع", "المعلم", "الهدايى"], a: 2, fix: "الهدايا", e: "سبقتها ياء." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["فاز", "مصطفا", "بالجائزة"], a: 1, fix: "مصطفى", e: "فوق الثلاثي." },
  ],
};

const C4 = {
  id: "c-istiara-tasrihiya-8", title: "الاستعارة التصريحية", domain: "RH", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب الاستعارة التصريحية من التشبيه، ويحدّد المشبَّه المحذوف والقرينة الدالّة عليه.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "كل جملة أدناه أصلها تشبيه حُذف منه أحد طرفيه. لاحظ أيّ طرف بقي، وأيّ كلمة دلّت على المحذوف.",
      table: { head: ["الجملة", "الطرف المذكور", "الطرف المحذوف", "القرينة"],
        rows: [["رأيت أسدًا يحارب في الميدان", "المشبَّه به: الأسد", "المشبَّه: الجندي الشجاع", "يحارب في الميدان"],
               ["أشرقت شمس العلم في الفصل", "المشبَّه به: الشمس", "المشبَّه: المعرفة", "أشرقت … في الفصل"],
               ["نعق الغراب بيننا بالشؤم", "المشبَّه به: الغراب", "المشبَّه: رجل الشؤم", "نعق بيننا"],
               ["ركبنا سفينة الصحراء نحو الواحة", "المشبَّه به: السفينة", "المشبَّه: الجمل", "الصحراء"]] },
      checks: [
        { t: "mcq", q: "في كل الأمثلة: أيّ طرف بقي مذكورًا دائمًا؟", o: ["المشبَّه", "المشبَّه به", "أداة التشبيه", "وجه الشبه"], a: 1, e: "المشبَّه به هو الحاضر دائمًا، والمشبَّه محذوف." },
        { t: "mcq", q: "ما وظيفة الكلمة التي سمّيناها «القرينة»؟", o: ["تزيّن الجملة", "تدلّ على المشبَّه المحذوف", "تُلغي المعنى", "لا وظيفة لها"], a: 1, e: "القرينة تدلّ السامع على المحذوف رغم غيابه." }],
      reveal: "استنتجت تعريف الاستعارة التصريحية: تشبيه حُذف منه المشبَّه وصُرِّح بالمشبَّه به، مع قرينة تدلّ على المحذوف." },
    { t: "rule", title: "من التشبيه إلى الاستعارة", strat: "التمثيل البصري",
      body: "الاستعارة في جوهرها تشبيه حُذف أحد طرفيه. إن حُذف المشبَّه وبقي المشبَّه به مصرَّحًا به، فهي استعارة تصريحية. القرينة هي ما يمنع اللبس ويدلّ على المشبَّه المحذوف.",
      concepts: [{ label: "المشبَّه به", note: "يبقى مذكورًا" }, { label: "المشبَّه", note: "يُحذف بالكامل" }, { label: "القرينة", note: "تدلّ على المحذوف" }],
      note: "لا تخلط بينها وبين التشبيه: التشبيه يذكر الطرفين معًا بأداة (كـ، مثل)، أما الاستعارة التصريحية فتحذف أداة التشبيه والمشبَّه معًا، ولا يبقى إلا المشبَّه به وحده.",
      checks: [
        { t: "tf", q: "الاستعارة التصريحية تُذكر فيها أداة التشبيه.", a: false, e: "الأداة محذوفة كالمشبَّه تمامًا؛ هذا ما يميّزها عن التشبيه." },
        { t: "mcq", q: "«ركبنا سفينة الصحراء» — ما المحذوف؟", o: ["السفينة", "الصحراء", "الجمل", "ركبنا"], a: 2, e: "المشبَّه (الجمل) محذوف، والمشبَّه به (السفينة) مصرَّح به." }] },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات الكشف عن الاستعارة.",
      items: [
        { w: "رأيت أسدًا يحارب في الميدان", steps: ["ابحث عن كلمة لا تُستعمل بمعناها الحقيقي: «أسدًا»", "قدّر التشبيه الأصلي: الجندي كالأسد في الشجاعة", "المشبَّه (الجندي) محذوف، والمشبَّه به (أسدًا) مذكور", "استعارة تصريحية — القرينة: يحارب في الميدان"] },
        { w: "أشرقت شمس العلم في عقولنا", steps: ["الكلمة غير الحقيقية: «شمس»", "الأصل: العلم كالشمس في الإشراق", "المشبَّه (العلم) محذوف، والمشبَّه به (شمس) مذكور", "استعارة تصريحية — القرينة: أشرقت … في عقولنا"] },
        { w: "نعق الغراب بيننا منذرًا بالشرّ", steps: ["الكلمة غير الحقيقية: «الغراب»", "الأصل: رجل الشؤم كالغراب في التطيّر منه", "المشبَّه محذوف، والمشبَّه به (الغراب) مذكور", "استعارة تصريحية — القرينة: نعق بيننا"] },
        { w: "سقطت أوراق الخريف عن شجرة العمر", steps: ["الكلمة غير الحقيقية: «شجرة العمر»", "الأصل: العمر كالشجرة له أوراق تتساقط", "المشبَّه (العمر) محذوف، والمشبَّه به (شجرة) مذكور", "استعارة تصريحية — القرينة: سقطت أوراق … عن"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة: هل هي استعارة تصريحية أم تشبيه صريح بأداة ظاهرة؟",
      cats: ["استعارة تصريحية", "تشبيه صريح"],
      items: [["رأيت أسدًا يحارب", "استعارة تصريحية"], ["الطالب كالأسد شجاعةً", "تشبيه صريح"],
              ["أشرقت شمس العلم بيننا", "استعارة تصريحية"], ["العلم كالشمس في الإشراق", "تشبيه صريح"],
              ["نعق الغراب في المجلس", "استعارة تصريحية"], ["هو مثل الغراب نذير شؤم", "تشبيه صريح"],
              ["ركبنا سفينة الصحراء", "استعارة تصريحية"], ["الجمل كالسفينة في الصحراء", "تشبيه صريح"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "الاستعارة التصريحية: تشبيه حُذف مشبَّهه وصُرِّح بمشبَّهه به، مع قرينة تدلّ على المحذوف.",
      bullets: ["المشبَّه به: مذكور", "المشبَّه: محذوف بالكامل", "الأداة: محذوفة أيضًا", "القرينة: تكشف المحذوف"],
      note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." },
  ],
  bank: [
    { t: "mcq", sn: "الطرف المذكور", q: "في «هطلت أمطار الرحمة على القرية»، الطرف المذكور هو:", o: ["الرحمة", "الأمطار", "القرية", "هطلت"], a: 1, e: "المشبَّه به (الأمطار) مذكور، والمشبَّه (الرحمة أو الخير) محذوف." },
    { t: "mcq", sn: "التمييز عن التشبيه", q: "ما الذي يميّز الاستعارة التصريحية عن التشبيه الصريح؟", o: ["حذف المشبَّه وأداة التشبيه", "ذكر الطرفين معًا", "استعمال «كأنّ»", "التكرار"], a: 0, e: "التشبيه يذكر الطرفين والأداة، والاستعارة تحذف المشبَّه والأداة." },
    { t: "mcq", sn: "القرينة", q: "في «افترس الظلمُ حقوق الضعفاء»، ما القرينة الدالة على الاستعارة؟", o: ["الظلم", "افترس", "حقوق", "الضعفاء"], a: 1, e: "كلمة «افترس» قرينة تدلّ على تشبيه الظلم بالوحش المفترس." },
    { t: "mcq", sn: "تحديد المشبَّه به", q: "في «رأيت وردةً تشرح الدرس بلطف»، ما المشبَّه به المذكور؟", o: ["الدرس", "وردةً", "المعلمة", "تشرح"], a: 1, e: "«وردة» مصرَّح بها، والمشبَّه (المعلمة) محذوف تمامًا." },
    { t: "mcq", sn: "تطبيق التعريف", q: "«ابتسم الصباح لأهل القرية» — نوع الاستعارة:", o: ["تصريحية، لأن المشبَّه به (شيء يبتسم) مذكور ضمنًا", "مكنية", "تشبيه صريح", "لا استعارة هنا"], a: 1, e: "حُذف المشبَّه به (الإنسان المبتسم) وذُكر المشبَّه (الصباح) مع لازمة (ابتسم) — هذه مكنية لا تصريحية." },
    { t: "mcq", sn: "تمييز نوع الاستعارة", q: "«حصدنا ثمار جهدنا في النهاية» — نوع الأسلوب:", o: ["استعارة تصريحية؛ المشبَّه به (ثمار) مذكور والمشبَّه (النتائج) محذوف", "استعارة مكنية", "تشبيه صريح", "لا استعارة هنا"], a: 0, e: "المشبَّه به «ثمار» مصرَّح به، والمشبَّه «النتائج» محذوف — نمط تصريحي قياسي." },
    { t: "mcq", sn: "تمييز الأداة", q: "أيّ الجمل لا تحتوي أداة تشبيه ظاهرة؟", o: ["الطالب كالنجم تفوّقًا", "رأيت نجمًا يشرح الدرس", "العلم مثل النور", "الصدق كالشمس وضوحًا"], a: 1, e: "الثانية استعارة تصريحية بلا أداة، والباقي تشبيه صريح بأداة." },
    { t: "mcq", sn: "المشبَّه به الثابت", q: "الاستعارة التصريحية يبقى فيها دائمًا:", o: ["المشبَّه", "المشبَّه به", "أداة التشبيه", "وجه الشبه"], a: 1, e: "المشبَّه به هو الحاضر لفظًا." },
    { t: "mcq", sn: "تطبيق", q: "«طار خبر النجاح بين الطلاب» — ما المشبَّه به المحذوف اسمه لكنه مصرَّح بأثره؟", o: ["الطائر", "الخبر", "النجاح", "الطلاب"], a: 0, e: "شُبّه انتشار الخبر بالطيران، فالمشبَّه به (طائر) حاضر عبر الفعل «طار»." },
    { t: "mcq", sn: "غرض الاستعارة", q: "الغرض البلاغي الأساسي من الاستعارة هو:", o: ["التوضيح فقط", "تقوية المعنى بالتصوير", "الإطالة", "تعقيد الجملة"], a: 1, e: "الاستعارة تصوّر المعنى وتقوّيه بصورة حسّية." },
    { t: "tf", sn: "التعريف", q: "الاستعارة التصريحية يُحذف فيها المشبَّه به.", a: false, e: "يُحذف المشبَّه لا المشبَّه به." },
    { t: "tf", sn: "الأداة", q: "تبقى أداة التشبيه ظاهرة في الاستعارة التصريحية.", a: false, e: "الأداة محذوفة كالمشبَّه." },
    { t: "tf", sn: "القرينة", q: "القرينة كلمة أو عبارة تدلّ على المشبَّه المحذوف.", a: true, e: "هذا تعريفها بالضبط." },
    { t: "tf", sn: "تمييز", q: "«الطالب كالنجم» تُعدّ استعارة تصريحية.", a: false, e: "هي تشبيه صريح لوجود الأداة «كـ» وذكر الطرفين." },
    { t: "tf", sn: "تطبيق", q: "«رأيت أسدًا يحارب» فيها استعارة تصريحية.", a: true, e: "حُذف المشبَّه (الجندي) وذُكر المشبَّه به (أسدًا)." },
    { t: "tf", sn: "الوظيفة البلاغية", q: "الاستعارة أسلوب حقيقي لا مجازي.", a: false, e: "الاستعارة من أبواب المجاز اللغوي القائم على علاقة المشابهة." },
    { t: "fill", sn: "تحديد المشبَّه به", q: "في «هطلت أمطار الرحمة»، اكتب المشبَّه به المذكور.", a: ["الأمطار", "أمطار"], e: "هو اللفظ الحاضر في الجملة." },
    { t: "fill", sn: "تحديد القرينة", q: "في «افترس الظلمُ حقوق الضعفاء»، اكتب كلمة القرينة.", a: ["افترس"], e: "الفعل الذي دلّ على تشبيه الظلم بالمفترس." },
    { t: "fill", sn: "التطبيق", q: "أكمل: في الاستعارة التصريحية يُحذف ____ ويبقى المشبَّه به.", a: ["المشبه", "المشبَّه"], e: "هذا جوهر تعريفها." },
    { t: "fill", sn: "تمييز عن التشبيه", q: "اكتب الأداة المحذوفة في الاستعارة التصريحية إن قارنّاها بالتشبيه (كلمة واحدة تمثّل نوع الأداة الغائبة).", a: ["كأداة", "أداة", "الكاف", "مثل"], e: "أي أداة تشبيه تُعد مقبولة كإجابة عامة توضح غياب الأداة." },
    { t: "fill", sn: "تحديد المحذوف", q: "في «ابتسم الصباح»، ما المشبَّه المذكور صراحة (لا المحذوف)؟", a: ["الصباح"], e: "الصباح مذكور، وحُذف المشبَّه به مع ذكر لازمة له." },
    { t: "fill", sn: "تطبيق", q: "صوّب: اكتب نوع الأسلوب في «سفينة الصحراء» بكلمتين.", a: ["استعارة تصريحية"], e: "المشبَّه به (سفينة) مذكور، والمشبَّه (الجمل) محذوف." },
    { t: "match", sn: "الطرف المذكور", q: "طابق كل جملة بالمشبَّه به المذكور فيها.",
      pairs: [["رأيت أسدًا يحارب", "الأسد"], ["أشرقت شمس العلم", "الشمس"], ["نعق الغراب بيننا", "الغراب"], ["ركبنا سفينة الصحراء", "السفينة"]], e: "المشبَّه به هو الحاضر لفظًا دائمًا." },
    { t: "match", sn: "المصطلح وتعريفه", q: "طابق كل مصطلح بتعريفه.",
      pairs: [["الاستعارة التصريحية", "حذف المشبَّه وذكر المشبَّه به"], ["القرينة", "ما يدلّ على المحذوف"], ["التشبيه الصريح", "ذكر الطرفين والأداة"], ["المشبَّه به", "الطرف الباقي في الاستعارة التصريحية"]], e: "تعريفات أساسية في الباب." },
    { t: "match", sn: "تصنيف الجمل", q: "طابق كل جملة بنوعها البلاغي.",
      pairs: [["رأيت أسدًا يحارب", "استعارة تصريحية"], ["الطالب كالأسد شجاعة", "تشبيه صريح"], ["أشرقت شمس العلم بيننا", "استعارة تصريحية"], ["العلم كالشمس وضوحًا", "تشبيه صريح"]], e: "الفارق: وجود الأداة والطرفين معًا من عدمه." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي جعلت الجملة استعارة تصريحية.", words: ["شاهدنا", "نجمًا", "يشرح", "الدرس"], a: 1, fix: "المعلم المتألق (لا حذف هنا؛ فسّر السبب لفظيًّا)", e: "«نجمًا» هي المشبَّه به المذكور بدل المعلم المحذوف." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل المشبَّه به المذكور.", words: ["زأر", "المدرّب", "في", "الملعب"], a: 0, fix: "زأر (بمعنى الأسد ضمنًا)", e: "الفعل «زأر» قرينة على تشبيه المدرّب بالأسد." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تدلّ على القرينة في الجملة.", words: ["طار", "خبر", "النجاح", "بسرعة"], a: 0, fix: "طار", e: "الفعل «طار» قرينة على تشبيه انتشار الخبر بالطيران." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي هي المشبَّه به في الجملة.", words: ["هطلت", "أمطار", "الرحمة", "علينا"], a: 1, fix: "أمطار", e: "هي الحاضرة لفظًا، والمشبَّه (الرحمة) محذوف فعليًا." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الدخيلة على استعارة تصريحية صحيحة (أي التي تكسر التعريف).", words: ["الطالب", "كالنجم", "تفوّقًا", "دائمًا"], a: 1, fix: "نجمًا (بلا أداة)", e: "وجود «كـ» يجعلها تشبيهًا صريحًا لا استعارة." },
  ],
};

const C5 = {
  id: "c-istiara-makniya-8", title: "الاستعارة المكنية", domain: "RH", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب الاستعارة المكنية، ويحدّد المشبَّه به المحذوف ولازمته الدالّة عليه.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "في كل جملة أدناه، المشبَّه مذكور، لكن المشبَّه به محذوف تمامًا وبقيت له لازمة (صفة أو فعل يخصّه). اكتشف اللازمة.",
      table: { head: ["الجملة", "المشبَّه المذكور", "المشبَّه به المحذوف", "اللازمة الدالّة عليه"],
        rows: [["ابتسم الصباح لأهل القرية", "الصباح", "إنسان", "ابتسم"],
               ["يدُ الزمن تمحو الأحزان", "الزمن", "إنسان له يد", "يدُ"],
               ["الحقّ ينادي المنصفين", "الحقّ", "إنسان", "ينادي"],
               ["أظافر الجوع نهشت الفقراء", "الجوع", "وحش له أظافر", "أظافر … نهشت"]] },
      checks: [
        { t: "mcq", q: "أيّ طرف بقي مذكورًا في كل الأمثلة هذه المرّة؟", o: ["المشبَّه", "المشبَّه به", "الأداة", "لا شيء"], a: 0, e: "على عكس التصريحية، هنا المشبَّه هو الباقي." },
        { t: "mcq", q: "ما وظيفة كلمة مثل «ابتسم» أو «يد» في هذه الجمل؟", o: ["زخرفة لا فائدة منها", "لازمة تدلّ على المشبَّه به المحذوف", "أداة تشبيه", "فعل ماضٍ عادي فقط"], a: 1, e: "هذه الألفاظ من خصائص المشبَّه به (الإنسان) المحذوف، فتدلّ عليه." }],
      reveal: "استنتجت تعريف الاستعارة المكنية: تشبيه حُذف منه المشبَّه به، ورُمز له بشيء من لوازمه، وذُكر المشبَّه صراحة." },
    { t: "rule", title: "المشبَّه يبقى واللازمة تكشف الغائب", strat: "التمثيل البصري",
      body: "في المكنية يبقى المشبَّه ظاهرًا، ويُحذف المشبَّه به بالكامل، لكن تُذكر له «لازمة» — صفة أو فعل يخصّه عادة — فتدلّ عليه ضمنًا دون تسميته.",
      concepts: [{ label: "المشبَّه", note: "يبقى مذكورًا" }, { label: "المشبَّه به", note: "محذوف كليًّا، لا يُسمَّى" }, { label: "اللازمة", note: "صفة أو فعل يخصّ المحذوف" }],
      note: "قارن بالتصريحية: هناك يُذكر المشبَّه به نفسه (أسدًا، شمس)؛ هنا لا يُذكر اسمه إطلاقًا، بل شيء من خصائصه فقط (ابتسم، يد، أظافر).",
      checks: [
        { t: "tf", q: "في الاستعارة المكنية يُذكر اسم المشبَّه به صراحة.", a: false, e: "لا يُذكر اسمه أبدًا، بل لازمة من لوازمه فقط." },
        { t: "mcq", q: "«يدُ الزمن تمحو الأحزان» — ما اللازمة الدالّة على المشبَّه به المحذوف (إنسان)؟", o: ["الزمن", "يدُ", "تمحو", "الأحزان"], a: 1, e: "«يد» من خصائص الإنسان، فدلّت عليه." }] },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات الكشف عن الاستعارة المكنية.",
      items: [
        { w: "ابتسم الصباح لأهل القرية", steps: ["المشبَّه المذكور: الصباح", "قدّر التشبيه: الصباح كالإنسان المبتسم", "المشبَّه به (إنسان) محذوف تمامًا", "استعارة مكنية — اللازمة: ابتسم"] },
        { w: "يدُ الزمن تمحو الأحزان", steps: ["المشبَّه المذكور: الزمن", "قدّر التشبيه: الزمن كالإنسان له يد", "المشبَّه به (إنسان) محذوف", "استعارة مكنية — اللازمة: يدُ"] },
        { w: "أظافر الجوع نهشت الفقراء", steps: ["المشبَّه المذكور: الجوع", "قدّر التشبيه: الجوع كالوحش له أظافر", "المشبَّه به (وحش) محذوف", "استعارة مكنية — اللازمة: أظافر … نهشت"] },
        { w: "الحقّ ينادي المنصفين", steps: ["المشبَّه المذكور: الحقّ", "قدّر التشبيه: الحقّ كالإنسان الذي ينادي", "المشبَّه به (إنسان) محذوف", "استعارة مكنية — اللازمة: ينادي"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة: استعارة مكنية أم تصريحية؟ تذكّر: في المكنية يبقى المشبَّه، وفي التصريحية يبقى المشبَّه به.",
      cats: ["استعارة مكنية", "استعارة تصريحية"],
      items: [["ابتسم الصباح لنا", "استعارة مكنية"], ["رأيت أسدًا يحارب", "استعارة تصريحية"],
              ["يدُ الزمن تمحو الأحزان", "استعارة مكنية"], ["أشرقت شمس العلم بيننا", "استعارة تصريحية"],
              ["الحقّ ينادي المنصفين", "استعارة مكنية"], ["نعق الغراب بيننا", "استعارة تصريحية"],
              ["أظافر الجوع نهشت الفقراء", "استعارة مكنية"], ["ركبنا سفينة الصحراء", "استعارة تصريحية"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "الاستعارة المكنية: تشبيه حُذف منه المشبَّه به، وذُكر المشبَّه، ودلّت عليه لازمة من لوازم المحذوف.",
      bullets: ["المشبَّه: مذكور", "المشبَّه به: محذوف تمامًا", "لا يُذكر اسم المحذوف أبدًا", "اللازمة تكشف عنه ضمنًا"],
      note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." },
  ],
  bank: [
    { t: "mcq", sn: "الطرف المذكور", q: "في الاستعارة المكنية، الطرف المذكور دائمًا هو:", o: ["المشبَّه", "المشبَّه به", "الأداة", "اللازمة فقط"], a: 0, e: "على عكس التصريحية، المشبَّه هو الباقي هنا." },
    { t: "mcq", sn: "تعريف اللازمة", q: "اللازمة في الاستعارة المكنية هي:", o: ["أداة التشبيه", "صفة أو فعل من خصائص المشبَّه به المحذوف", "اسم المشبَّه به نفسه", "وجه الشبه فقط"], a: 1, e: "اللازمة تدلّ على المحذوف دون تسميته." },
    { t: "mcq", sn: "تطبيق", q: "«ضحك الأمل في قلوبنا» — ما اللازمة؟", o: ["الأمل", "ضحك", "قلوبنا", "في"], a: 1, e: "«ضحك» من خصائص الإنسان، فدلّت على المشبَّه به المحذوف." },
    { t: "mcq", sn: "تمييز عن التصريحية", q: "الفارق الجوهري بين المكنية والتصريحية:", o: ["أيّ طرف يُذكر وأيّهما يُحذف", "عدد الكلمات", "نوع الجملة", "لا فرق بينهما"], a: 0, e: "في المكنية يبقى المشبَّه، وفي التصريحية يبقى المشبَّه به." },
    { t: "mcq", sn: "تطبيق", q: "«مخالب الفقر تنهش الأسرة» — ما نوع الأسلوب؟", o: ["استعارة مكنية", "استعارة تصريحية", "تشبيه صريح", "لا استعارة"], a: 0, e: "المشبَّه (الفقر) مذكور، والمشبَّه به (وحش) محذوف، واللازمة (مخالب … تنهش)." },
    { t: "mcq", sn: "اللازمة", q: "في «عيون النجوم تراقبنا»، ما اللازمة الدالّة على التشبيه؟", o: ["النجوم", "عيون", "تراقبنا", "لا لازمة"], a: 1, e: "«عيون» من خصائص الكائن الحيّ، فدلّت على المحذوف." },
    { t: "mcq", sn: "تطبيق عكسي", q: "أيّ الجمل ليست استعارة مكنية؟", o: ["ابتسم الصباح", "رأيت أسدًا يحارب", "يدُ الزمن تمحو", "الحقّ ينادي المنصفين"], a: 1, e: "هذه استعارة تصريحية؛ المشبَّه به (أسدًا) مذكور لا محذوف." },
    { t: "mcq", sn: "الغرض البلاغي", q: "الاستعارة المكنية تمنح الجمادات أو المعاني صفة:", o: ["الجمود", "الحياة والحركة", "الغموض التام", "لا أثر بلاغيًّا"], a: 1, e: "تُضفي الحيوية على المعنى المجرَّد أو الجماد." },
    { t: "mcq", sn: "تطبيق", q: "«صرخ الجرح في صمت الليل» — المشبَّه به المحذوف على الأرجح:", o: ["إنسان", "شجرة", "نهر", "لا يوجد"], a: 0, e: "«صرخ» من خصائص الإنسان." },
    { t: "mcq", sn: "التمييز الدقيق", q: "«الأمل نجمٌ يهدينا» — نوع الأسلوب:", o: ["تشبيه صريح لوجود المشبَّه والمشبَّه به معًا", "استعارة مكنية", "استعارة تصريحية", "لا علاقة بالتشبيه"], a: 0, e: "ذُكر الطرفان (الأمل، نجم) فهو تشبيه لا استعارة." },
    { t: "tf", sn: "التعريف", q: "في الاستعارة المكنية يُحذف المشبَّه.", a: false, e: "يُحذف المشبَّه به، ويبقى المشبَّه." },
    { t: "tf", sn: "اللازمة", q: "اللازمة تدلّ على المشبَّه به المحذوف دون ذكر اسمه.", a: true, e: "هذا دورها بالضبط." },
    { t: "tf", sn: "تطبيق", q: "«يدُ الزمن تمحو الأحزان» استعارة مكنية.", a: true, e: "المشبَّه (الزمن) مذكور، واللازمة (يد) دلّت على الإنسان المحذوف." },
    { t: "tf", sn: "تمييز", q: "«رأيت أسدًا يحارب» استعارة مكنية.", a: false, e: "هذه تصريحية؛ المشبَّه به (أسدًا) مذكور لا محذوف." },
    { t: "tf", sn: "تطبيق", q: "«أظافر الجوع نهشت الفقراء» فيها تشبيه ضمني للجوع بوحش مفترس.", a: true, e: "اللازمتان (أظافر، نهشت) من خصائص الوحش." },
    { t: "tf", sn: "الأثر البلاغي", q: "الاستعارة المكنية أسلوب خالٍ من التصوير.", a: false, e: "هي من أقوى أساليب التصوير البلاغي." },
    { t: "fill", sn: "تحديد اللازمة", q: "في «ضحك الأمل في قلوبنا»، اكتب اللازمة الدالّة على المحذوف.", a: ["ضحك"], e: "من خصائص الإنسان." },
    { t: "fill", sn: "تحديد المشبَّه", q: "في «الحقّ ينادي المنصفين»، اكتب المشبَّه المذكور.", a: ["الحق", "الحقّ"], e: "هو الطرف الباقي في الجملة." },
    { t: "fill", sn: "التطبيق", q: "أكمل: في الاستعارة المكنية يُحذف ____ وتبقى له لازمة.", a: ["المشبه به", "المشبَّه به"], e: "هذا جوهر تعريفها." },
    { t: "fill", sn: "تحديد اللازمة", q: "في «مخالب الفقر تنهش الأسرة»، اكتب اللازمتين معًا بكلمة أو كلمتين.", a: ["مخالب", "نهشت", "مخالب تنهش"], e: "أي إجابة تذكر إحدى اللازمتين تُقبل." },
    { t: "fill", sn: "تطبيق عكسي", q: "صوّب: اكتب نوع الأسلوب في «الحقّ ينادي المنصفين» بكلمتين.", a: ["استعارة مكنية"], e: "المشبَّه (الحق) مذكور، والمشبَّه به محذوف." },
    { t: "match", sn: "المشبَّه واللازمة", q: "طابق كل جملة باللازمة الدالّة فيها.",
      pairs: [["ابتسم الصباح", "ابتسم"], ["يدُ الزمن تمحو", "يد"], ["الحقّ ينادي", "ينادي"], ["أظافر الجوع نهشت", "أظافر"]], e: "اللازمة من خصائص المشبَّه به المحذوف." },
    { t: "match", sn: "المصطلح وتعريفه", q: "طابق كل مصطلح بتعريفه.",
      pairs: [["الاستعارة المكنية", "حذف المشبَّه به وذكر لازمته"], ["اللازمة", "صفة أو فعل من خصائص المحذوف"], ["الاستعارة التصريحية", "ذكر المشبَّه به وحذف المشبَّه"], ["المشبَّه", "الطرف الباقي في المكنية"]], e: "تعريفات أساسية للمقارنة." },
    { t: "match", sn: "تصنيف الجمل", q: "طابق كل جملة بنوعها.",
      pairs: [["ضحك الأمل في قلوبنا", "استعارة مكنية"], ["رأيت أسدًا يحارب", "استعارة تصريحية"], ["عيون النجوم تراقبنا", "استعارة مكنية"], ["أشرقت شمس العلم", "استعارة تصريحية"]], e: "طبّق قاعدة أيّ طرف مذكور." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل اللازمة في الجملة.", words: ["ضحك", "الأمل", "في", "قلوبنا"], a: 0, fix: "ضحك", e: "من خصائص الإنسان المحذوف." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي هي المشبَّه المذكور في الجملة.", words: ["يدُ", "الزمن", "تمحو", "الأحزان"], a: 1, fix: "الزمن", e: "هو الطرف الباقي والمشبَّه." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الدالّة على المحذوف في الجملة.", words: ["عيون", "النجوم", "تراقبنا", "دومًا"], a: 0, fix: "عيون", e: "من خصائص الكائن الحيّ المحذوف." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تكشف الاستعارة في الجملة.", words: ["صرخ", "الجرح", "في", "صمت"], a: 0, fix: "صرخ", e: "من خصائص الإنسان المحذوف." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل المشبَّه لا اللازمة.", words: ["مخالب", "الجوع", "نهشت", "الفقراء"], a: 1, fix: "الجوع", e: "الجوع هو المشبَّه المذكور، لا اللازمة." },
  ],
};

const C6 = {
  id: "c-tibaq-9", title: "الطباق", domain: "RH", grade: 9, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يستخرج الطالب الطباق من النص، ويميّز بين طباق الإيجاب وطباق السلب.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "في كل جملة كلمتان متضادّتان في المعنى. لاحظهما، ولاحظ هل كلتاهما مثبتة أم إحداهما منفية.",
      table: { head: ["الجملة", "الكلمة الأولى", "الكلمة المضادّة", "هل إحداهما منفية؟"],
        rows: [["يعلم السرَّ والعلانية", "السرَّ", "العلانية", "لا — كلتاهما مثبتة"],
               ["﴿وَتَحْسَبُهُمْ أَيْقَاظًا وَهُمْ رُقُودٌ﴾", "أيقاظًا", "رقود", "لا — كلتاهما مثبتة"],
               ["لا يستوي الأعمى والبصير", "الأعمى", "البصير", "لا — كلتاهما مثبتة لفظًا وإن سُبقتا بنفي الاستواء"],
               ["فَلْيَضْحَكُوا قَلِيلًا وَلْيَبْكُوا كَثِيرًا", "يضحكوا", "يبكوا", "لا — كلتاهما مثبتة"]] },
      checks: [
        { t: "mcq", q: "ما الرابط المشترك بين كلمتَي كل جملة؟", o: ["الترادف", "التضاد في المعنى", "التشابه الصوتي", "لا رابط"], a: 1, e: "كل زوج كلمتين متضادّتان معنى." },
        { t: "mcq", q: "في هذه الأمثلة، هل الكلمتان المتضادّتان مثبتتان أم إحداهما منفية بأداة نفي (لا، ما، لم)؟", o: ["كلتاهما مثبتة", "إحداهما منفية دائمًا", "كلتاهما منفية", "لا علاقة للنفي"], a: 0, e: "في هذه الأمثلة كلتا الكلمتين مثبتة — هذا طباق الإيجاب تحديدًا." }],
      reveal: "استنتجت تعريف الطباق: الجمع بين كلمة ومعناها المضادّ في الجملة نفسها." },
    { t: "rule", title: "نوعا الطباق", strat: "التمثيل البصري",
      body: "الطباق هو الجمع بين لفظين متضادَّين في المعنى ضمن الجملة نفسها. وله نوعان: إن كانت الكلمتان مثبتتين معًا (لا نفي)، فهو طباق إيجاب. وإن اختلفتا إثباتًا ونفيًا (إحداهما منفية بأداة نفي)، فهو طباق سلب.",
      concepts: [{ label: "طباق الإيجاب", note: "كلمتان مثبتتان، لا نفي" }, { label: "طباق السلب", note: "إحدى الكلمتين منفية" }],
      note: "مثال طباق السلب: ﴿قُلْ لَا يَسْتَوِي الْخَبِيثُ وَالطَّيِّبُ﴾ ليس مثالًا على السلب لأنّ الفعل «يستوي» هو المنفيّ لا أحد الضدّين. المثال الصحيح لطباق السلب: «يعلم ما تُخفون وما تُعلنون» — لا نفي هنا أيضًا فهو إيجاب. مثال حقيقي لطباق السلب: «أتضحك ولا تبكي؟» — الفعلان ضدّان وأحدهما منفيّ (لا تبكي).",
      checks: [
        { t: "tf", q: "طباق الإيجاب هو الجمع بين كلمة وضدّها من غير نفي.", a: true, e: "هذا تعريفه بالضبط." },
        { t: "mcq", q: "«أتضحك ولا تبكي؟» — نوع الطباق:", o: ["طباق إيجاب", "طباق سلب", "لا طباق هنا", "تشبيه"], a: 1, e: "الفعل الثاني منفيّ بـ«لا»، فهو طباق سلب." }] },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات استخراج الطباق وتحديد نوعه.",
      items: [
        { w: "يعلم السرَّ والعلانية", steps: ["ابحث عن كلمتين متضادّتين: السرّ / العلانية", "هل إحداهما منفية؟ لا", "إذن: طباق إيجاب", "الأثر: الإحاطة الكاملة بكل الأحوال"] },
        { w: "لا يستوي الأعمى والبصير", steps: ["الكلمتان المتضادّتان: الأعمى / البصير", "الكلمتان نفسهما مثبتتان (النفي وقع على الفعل يستوي لا عليهما)", "إذن: طباق إيجاب", "الأثر: تأكيد الفارق الكبير بين الحالتين"] },
        { w: "أتضحك ولا تبكي؟", steps: ["الكلمتان المتضادّتان: تضحك / تبكي", "هل إحداهما منفية؟ نعم، «لا تبكي»", "إذن: طباق سلب", "الأثر: تسليط الضوء على المفارقة"] },
        { w: "فليضحكوا قليلًا وليبكوا كثيرًا", steps: ["الكلمتان المتضادّتان: يضحكوا / يبكوا", "هل إحداهما منفية؟ لا", "إذن: طباق إيجاب", "الأثر: موازنة الفرح القليل بالحزن الكثير"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة: طباق إيجاب أم طباق سلب؟",
      cats: ["طباق إيجاب", "طباق سلب"],
      items: [["يعلم السرَّ والعلانية", "طباق إيجاب"], ["أتضحك ولا تبكي", "طباق سلب"],
              ["فليضحكوا قليلًا وليبكوا كثيرًا", "طباق إيجاب"], ["يحبّ الخير ولا يكره إلا الشرّ", "طباق سلب"],
              ["الليل والنهار آيتان", "طباق إيجاب"], ["أنطق بالحقّ ولا أكتمه", "طباق سلب"],
              ["الأول والآخر سبحانه", "طباق إيجاب"], ["يقدّم ولا يؤخّر واجبًا", "طباق سلب"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "الطباق: الجمع بين كلمة ومعناها المضادّ في الجملة. إن كانتا مثبتتين فطباق إيجاب، وإن نُفيت إحداهما فطباق سلب.",
      bullets: ["طباق إيجاب: بلا نفي", "طباق سلب: إحداهما منفية", "الأثر: تقوية المعنى بالمقابلة", "يشمل الأسماء والأفعال والحروف"],
      note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." },
  ],
  bank: [
    { t: "mcq", sn: "تعريف الطباق", q: "الطباق اصطلاحًا هو:", o: ["الجمع بين مترادفين", "الجمع بين لفظ ومعناه المضادّ", "تكرار اللفظ نفسه", "حذف كلمة من الجملة"], a: 1, e: "هذا تعريفه الدقيق." },
    { t: "mcq", sn: "استخراج الطباق", q: "أين الطباق في «يعلم ما يُسرّون وما يُعلنون»؟", o: ["يعلم / ما", "يُسرّون / يُعلنون", "ما / وما", "لا طباق هنا"], a: 1, e: "الفعلان متضادّان معنى." },
    { t: "mcq", sn: "طباق الإيجاب", q: "طباق الإيجاب هو:", o: ["إحدى الكلمتين منفية", "كلتا الكلمتين مثبتة", "كلتاهما منفية", "لا علاقة بالإثبات والنفي"], a: 1, e: "لا نفي في أيّ من الطرفين." },
    { t: "mcq", sn: "طباق السلب", q: "طباق السلب هو:", o: ["كلتا الكلمتين مثبتة", "إحدى الكلمتين منفية والأخرى مثبتة", "غياب الطباق تمامًا", "تكرار الفعل مرتين"], a: 1, e: "الاختلاف بين الطرفين إثباتًا ونفيًا." },
    { t: "mcq", sn: "تطبيق", q: "«أنطق بالحقّ ولا أكتمه» — نوع الطباق:", o: ["إيجاب", "سلب", "لا طباق", "تشبيه"], a: 1, e: "الفعل الثاني منفيّ بـ«لا»." },
    { t: "mcq", sn: "تطبيق", q: "«الليل والنهار آيتان من آياته» — نوع الطباق:", o: ["إيجاب", "سلب", "لا طباق", "استعارة"], a: 0, e: "كلا اللفظين مثبت." },
    { t: "mcq", sn: "شمول الطباق", q: "الطباق يكون بين:", o: ["اسمين فقط", "فعلين فقط", "اسمين أو فعلين أو حرفين", "حروف فقط"], a: 2, e: "يشمل كل أقسام الكلمة." },
    { t: "mcq", sn: "الأثر البلاغي", q: "الأثر البلاغي للطباق هو:", o: ["تقوية المعنى بالمقابلة بين المتضادَّين", "تعقيد الجملة بلا فائدة", "الإطالة فقط", "لا أثر بلاغي"], a: 0, e: "المقابلة بين الضدّين تُبرز المعنى بوضوح." },
    { t: "mcq", sn: "تمييز", q: "أيّ زوج كلمات لا يصلح مثالًا على الطباق؟", o: ["السرّ / العلانية", "الليل / النهار", "الكتاب / القلم", "يضحك / يبكي"], a: 2, e: "الكتاب والقلم ليسا ضدّين، بل مرتبطان لا متضادّان." },
    { t: "mcq", sn: "تطبيق", q: "«يقدّم ولا يؤخّر واجبًا عليه» — نوع الطباق:", o: ["إيجاب", "سلب", "لا طباق", "مقابلة"], a: 1, e: "الفعل الثاني منفيّ." },
    { t: "tf", sn: "التعريف", q: "الطباق هو الجمع بين لفظين متضادّين في المعنى.", a: true, e: "هذا تعريفه." },
    { t: "tf", sn: "طباق الإيجاب", q: "طباق الإيجاب تكون فيه إحدى الكلمتين منفية.", a: false, e: "كلتاهما مثبتة في طباق الإيجاب." },
    { t: "tf", sn: "طباق السلب", q: "طباق السلب تختلف فيه الكلمتان إثباتًا ونفيًا.", a: true, e: "هذا تعريفه بالضبط." },
    { t: "tf", sn: "الشمول", q: "الطباق يقتصر على الأسماء فقط.", a: false, e: "يكون بين أسماء أو أفعال أو حروف." },
    { t: "tf", sn: "تطبيق", q: "«يعلم السرّ والعلانية» فيها طباق إيجاب.", a: true, e: "كلا اللفظين مثبت." },
    { t: "tf", sn: "تطبيق", q: "«أتضحك ولا تبكي» فيها طباق إيجاب.", a: false, e: "هي طباق سلب؛ أحد الفعلين منفيّ." },
    { t: "fill", sn: "استخراج الطباق", q: "استخرج الطباق من: «يعلم السرَّ والعلانية» (اكتب الكلمتين).", a: ["السر والعلانية", "السرّ والعلانية", "السر، العلانية"], e: "لفظان متضادّان في المعنى." },
    { t: "fill", sn: "تحديد النوع", q: "«أنطق بالحقّ ولا أكتمه» — اكتب نوع الطباق (كلمتان).", a: ["طباق سلب"], e: "لوجود أداة النفي «لا»." },
    { t: "fill", sn: "تحديد النوع", q: "«الليل والنهار آيتان» — اكتب نوع الطباق (كلمتان).", a: ["طباق إيجاب"], e: "لا نفي في اللفظين." },
    { t: "fill", sn: "استخراج الطباق", q: "استخرج الطباق من: «فليضحكوا قليلًا وليبكوا كثيرًا».", a: ["يضحكوا ويبكوا", "يضحكوا، يبكوا", "الضحك والبكاء"], e: "الفعلان متضادّان معنى." },
    { t: "fill", sn: "التطبيق", q: "أكمل: إن نُفيت إحدى كلمتَي الطباق سُمّي طباق ____.", a: ["سلب"], e: "طباق السلب تحديدًا." },
    { t: "match", sn: "استخراج الطباق", q: "طابق كل جملة بالكلمتين المتضادّتين فيها.",
      pairs: [["يعلم السرَّ والعلانية", "السرّ والعلانية"], ["أتضحك ولا تبكي", "تضحك وتبكي"], ["الليل والنهار آيتان", "الليل والنهار"], ["يقدّم ولا يؤخّر", "يقدّم ويؤخّر"]], e: "استخرج الضدّين من كل جملة." },
    { t: "match", sn: "تحديد النوع", q: "طابق كل جملة بنوع الطباق فيها.",
      pairs: [["يعلم السرَّ والعلانية", "طباق إيجاب"], ["أتضحك ولا تبكي", "طباق سلب"], ["الليل والنهار آيتان", "طباق إيجاب"], ["أنطق بالحقّ ولا أكتمه", "طباق سلب"]], e: "طبّق قاعدة وجود النفي من عدمه." },
    { t: "match", sn: "المصطلح وتعريفه", q: "طابق كل مصطلح بتعريفه.",
      pairs: [["الطباق", "الجمع بين لفظ ومعناه المضادّ"], ["طباق الإيجاب", "كلا اللفظين مثبت"], ["طباق السلب", "أحد اللفظين منفيّ"], ["الأثر البلاغي", "تقوية المعنى بالمقابلة"]], e: "تعريفات أساسية للباب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تشكّل طباقًا مع كلمة أخرى في الجملة.", words: ["يعلم", "السرَّ", "والعلانية", "جميعًا"], a: 2, fix: "العلانية تضادّ السرّ", e: "السرّ والعلانية ضدّان." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الفعل المنفيّ الذي يجعل الطباق من نوع السلب.", words: ["أنطق", "بالحقّ", "ولا", "أكتمه"], a: 3, fix: "أكتمه (مسبوق بأداة نفي لا)", e: "النفي وقع على الفعل الثاني." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تضادّ «قليلًا» في الجملة.", words: ["فليضحكوا", "قليلًا", "وليبكوا", "كثيرًا"], a: 3, fix: "كثيرًا", e: "قليلًا وكثيرًا ضدّان." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تضادّ «الليل» في الجملة.", words: ["الليل", "والنهار", "آيتان", "له"], a: 1, fix: "والنهار", e: "الليل والنهار ضدّان." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الفعل الذي يضادّ «يقدّم» في الجملة.", words: ["يقدّم", "ولا", "يؤخّر", "واجبًا"], a: 2, fix: "يؤخّر", e: "يقدّم ويؤخّر ضدّان، والنفي على الثاني فالطباق سلب." },
  ],
};

const C7 = {
  id: "c-tashbih-mursal-8", title: "التشبيه المرسل", domain: "RH", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب التشبيه المرسل بذكر أداته، ويفرّقه عن التشبيه المؤكد المحذوف الأداة.",
  stages: [
    { t: "rule", title: "القاعدة", strat: "العرض المباشر",
      body: "التشبيه المرسل هو ما ذُكرت فيه أداة التشبيه صراحة (كـ، مثل، كأنّ، شبه). سُمّي مرسلًا لأن الأداة تُطلقه من الالتباس، فيتأكّد السامع أنه تشبيه لا حقيقة. يقابله التشبيه المؤكد الذي تُحذف منه الأداة.",
      concepts: [{ label: "الأداة", note: "مذكورة صراحة" }, { label: "كـ / مثل / كأنّ", note: "أشهر أدواته" }, { label: "الأثر", note: "وضوح أن المعنى تشبيه لا حقيقة" }],
      note: "مثال: «العلمُ كالنورِ يهدي الحائرين» — الأداة «الكاف» مذكورة، فهو تشبيه مرسل." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات الكشف عن التشبيه المرسل.",
      items: [
        { w: "العلمُ كالنورِ يهدي الحائرين", steps: ["ابحث عن أداة التشبيه", "وُجدت: الكاف", "الأداة مذكورة صراحة", "تشبيه مرسل"] },
        { w: "الصبرُ مثل الدواء مرّ الطعم نافع الأثر", steps: ["ابحث عن أداة التشبيه", "وُجدت: مثل", "الأداة مذكورة صراحة", "تشبيه مرسل"] },
        { w: "كأنّ الحديقة لوحةٌ فنية بديعة", steps: ["ابحث عن أداة التشبيه", "وُجدت: كأنّ", "الأداة مذكورة صراحة", "تشبيه مرسل"] }] },
    { t: "summary", title: "الخلاصة", strat: "بطاقة الخروج",
      body: "التشبيه المرسل: ما ذُكرت فيه أداة التشبيه. الأدوات الشائعة: كـ، مثل، كأنّ، شبه، يشابه.",
      bullets: ["الأداة: مذكورة", "الأثر: توضيح أنه تشبيه لا حقيقة", "يقابله: التشبيه المؤكد"],
      note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." },
  ],
  bank: [
    { t: "mcq", sn: "تعريف المرسل", q: "التشبيه المرسل هو ما:", o: ["حُذفت منه الأداة", "ذُكرت فيه الأداة", "حُذف منه وجه الشبه", "ذُكر فيه وجه الشبه فقط"], a: 1, e: "الأداة مذكورة صراحة في المرسل." },
    { t: "mcq", sn: "تحديد الأداة", q: "في «العلمُ كالنورِ»، أداة التشبيه هي:", o: ["العلم", "كالنور", "الكاف", "يهدي"], a: 2, e: "حرف الكاف هو الأداة." },
    { t: "mcq", sn: "من أدواته", q: "أيّ الكلمات ليست من أدوات التشبيه؟", o: ["كـ", "مثل", "كأنّ", "لأنّ"], a: 3, e: "«لأنّ» أداة تعليل لا تشبيه." },
    { t: "mcq", sn: "تطبيق", q: "«الصبرُ مثل الدواء» — نوع التشبيه:", o: ["مرسل", "مؤكد", "استعارة", "لا تشبيه"], a: 0, e: "الأداة «مثل» مذكورة." },
    { t: "mcq", sn: "تطبيق", q: "«كأنّ الحديقة لوحةٌ فنية» — الأداة المستعملة:", o: ["كـ", "مثل", "كأنّ", "شبه"], a: 2, e: "«كأنّ» أداة تشبيه من أخوات إنّ." },
    { t: "mcq", sn: "تمييز", q: "ما الذي يميّز المرسل عن المؤكد؟", o: ["وجود الأداة من عدمه", "وجود وجه الشبه", "طول الجملة", "لا فرق بينهما"], a: 0, e: "المرسل تُذكر فيه الأداة، والمؤكد تُحذف." },
    { t: "mcq", sn: "تطبيق", q: "«الحقّ يشبه الشمس وضوحًا» — نوع التشبيه:", o: ["مرسل، والأداة: يشبه", "مؤكد", "استعارة مكنية", "طباق"], a: 0, e: "الفعل «يشبه» يعمل عمل أداة التشبيه هنا." },
    { t: "mcq", sn: "الأثر البلاغي", q: "وجود الأداة في التشبيه المرسل يجعل التشبيه:", o: ["أضعف من المؤكد في الإيحاء بالوحدة بين الطرفين", "أقوى من المؤكد دائمًا", "غامضًا", "بلا معنى"], a: 0, e: "ذكر الأداة يُبقي فاصلًا واضحًا بين المشبَّه والمشبَّه به." },
    { t: "mcq", sn: "تطبيق", q: "«الأمّ كالشمس تدفئ من حولها» — الأداة:", o: ["الأمّ", "كـ", "تدفئ", "حولها"], a: 1, e: "الكاف أداة التشبيه." },
    { t: "mcq", sn: "تطبيق", q: "أيّ الجمل تحتوي تشبيهًا مرسلًا؟", o: ["الطالب مجتهدٌ نشيط", "الطالب كالنحلة نشاطًا", "اجتهد الطالب كثيرًا", "الطالب في الفصل"], a: 1, e: "وجود الأداة «كـ» يجعله تشبيهًا مرسلًا." },
    { t: "tf", sn: "التعريف", q: "التشبيه المرسل تُذكر فيه أداة التشبيه.", a: true, e: "هذا تعريفه بالضبط." },
    { t: "tf", sn: "تمييز", q: "«العلمُ نورٌ يهدي» تشبيه مرسل.", a: false, e: "لا أداة هنا، فهو تشبيه مؤكد." },
    { t: "tf", sn: "الأدوات", q: "«كأنّ» من أدوات التشبيه.", a: true, e: "من أشهر أدوات التشبيه." },
    { t: "tf", sn: "تطبيق", q: "«الصبرُ مثل الدواء» تشبيه مرسل.", a: true, e: "الأداة «مثل» مذكورة." },
    { t: "tf", sn: "الأثر", q: "التشبيه المرسل أقوى في الإيحاء من التشبيه المؤكد.", a: false, e: "المؤكد أقوى لأنه يوحي بالاتحاد التام بين الطرفين." },
    { t: "fill", sn: "تحديد الأداة", q: "في «الصبرُ مثل الدواء»، اكتب أداة التشبيه.", a: ["مثل"], e: "هي أداة التشبيه المذكورة." },
    { t: "fill", sn: "تحديد النوع", q: "«كأنّ الحديقة لوحة فنية» — اكتب نوع التشبيه (كلمتان).", a: ["تشبيه مرسل"], e: "لوجود الأداة كأنّ." },
    { t: "fill", sn: "تطبيق", q: "أكمل: التشبيه المرسل هو ما ذُكرت فيه ____.", a: ["الاداة", "الأداة"], e: "هذا جوهر تعريفه." },
    { t: "fill", sn: "استخراج", q: "استخرج أداة التشبيه من «الأمّ كالشمس تدفئ من حولها».", a: ["كـ", "الكاف", "ك"], e: "حرف الكاف هو الأداة." },
    { t: "match", sn: "الأداة", q: "طابق كل جملة بأداة التشبيه فيها.",
      pairs: [["العلمُ كالنورِ", "الكاف"], ["الصبرُ مثل الدواء", "مثل"], ["كأنّ الحديقة لوحة", "كأنّ"], ["الحقّ يشبه الشمس", "يشبه"]], e: "استخرج الأداة من كل جملة." },
    { t: "match", sn: "التصنيف", q: "طابق كل جملة بنوع التشبيه فيها.",
      pairs: [["العلمُ كالنورِ", "تشبيه مرسل"], ["العلمُ نورٌ", "تشبيه مؤكد"], ["الصبرُ مثل الدواء", "تشبيه مرسل"], ["الصبرُ دواءٌ مرّ", "تشبيه مؤكد"]], e: "وجود الأداة من عدمه هو الفارق." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل أداة التشبيه في الجملة.", words: ["العلمُ", "كالنورِ", "يهدي", "الحائرين"], a: 1, fix: "الكاف داخل «كالنور»", e: "الكاف هي الأداة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل الأداة في الجملة.", words: ["الصبرُ", "مثل", "الدواء", "نافع"], a: 1, fix: "مثل", e: "أداة تشبيه واضحة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل الأداة في الجملة.", words: ["كأنّ", "الحديقة", "لوحةٌ", "فنية"], a: 0, fix: "كأنّ", e: "من أخوات إنّ المستعملة للتشبيه." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الفعل الذي يعمل عمل أداة التشبيه في الجملة.", words: ["الحقّ", "يشبه", "الشمس", "وضوحًا"], a: 1, fix: "يشبه", e: "فعل يفيد معنى المشابهة فيعمل عمل الأداة." },
  ],
};

const C8 = {
  id: "c-tashbih-muakkad-8", title: "التشبيه المؤكد", domain: "RH", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب التشبيه المؤكد بحذف أداته، ويدرك أثره في توكيد اتحاد الطرفين.",
  stages: [
    { t: "rule", title: "القاعدة", strat: "العرض المباشر",
      body: "التشبيه المؤكد هو ما حُذفت منه أداة التشبيه، فيصير المشبَّه والمشبَّه به وكأنهما شيء واحد. سُمّي مؤكدًا لأن حذف الأداة يقوّي الصلة بين الطرفين ويوحي باتحادهما.",
      concepts: [{ label: "الأداة", note: "محذوفة تمامًا" }, { label: "الأثر", note: "توكيد اتحاد الطرفين" }, { label: "المقابل", note: "التشبيه المرسل (بالأداة)" }],
      note: "مثال: «العلمُ نورٌ يهدي الحائرين» — لا أداة، فالجملة توحي بأن العلم هو النور نفسه." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات الكشف عن التشبيه المؤكد.",
      items: [
        { w: "العلمُ نورٌ يهدي الحائرين", steps: ["ابحث عن أداة تشبيه ظاهرة", "لا توجد أداة", "الجملة تصف العلم بأنه نور مباشرة", "تشبيه مؤكد"] },
        { w: "الصبرُ دواءٌ مرّ الطعم نافع الأثر", steps: ["ابحث عن أداة تشبيه ظاهرة", "لا توجد أداة", "وُصف الصبر بأنه دواء مباشرة", "تشبيه مؤكد"] },
        { w: "الوقتُ سيفٌ إن لم تقطعه قطعك", steps: ["ابحث عن أداة تشبيه ظاهرة", "لا توجد أداة", "وُصف الوقت بأنه سيف مباشرة", "تشبيه مؤكد"] }] },
    { t: "summary", title: "الخلاصة", strat: "بطاقة الخروج",
      body: "التشبيه المؤكد: ما حُذفت منه أداة التشبيه، فيوحي باتحاد الطرفين وقوّة الصلة بينهما.",
      bullets: ["الأداة: محذوفة", "الأثر: توكيد الاتحاد بين الطرفين", "أقوى إيحاءً من المرسل"],
      note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." },
  ],
  bank: [
    { t: "mcq", sn: "تعريف المؤكد", q: "التشبيه المؤكد هو ما:", o: ["ذُكرت فيه الأداة", "حُذفت منه الأداة", "حُذف منه المشبَّه", "ذُكر فيه وجه الشبه فقط"], a: 1, e: "الأداة محذوفة تمامًا في المؤكد." },
    { t: "mcq", sn: "تطبيق", q: "«العلمُ نورٌ يهدي الحائرين» — نوع التشبيه:", o: ["مرسل", "مؤكد", "استعارة مكنية", "طباق"], a: 1, e: "لا أداة ظاهرة، فهو مؤكد." },
    { t: "mcq", sn: "الأثر البلاغي", q: "حذف الأداة في التشبيه المؤكد يجعل المعنى:", o: ["أضعف اتصالًا بين الطرفين", "أقوى إيحاءً باتحاد الطرفين", "غامضًا تمامًا", "بلا أثر يُذكر"], a: 1, e: "الحذف يقوّي الصلة بين المشبَّه والمشبَّه به." },
    { t: "mcq", sn: "تمييز", q: "أيّ الجمل فيها تشبيه مؤكد؟", o: ["الصبرُ كالدواء", "الصبرُ دواءٌ مرّ نافع", "الصبرُ مثل الدواء", "الصبرُ يشبه الدواء"], a: 1, e: "لا أداة في هذه الجملة وحدها." },
    { t: "mcq", sn: "تطبيق", q: "«الوقتُ سيفٌ إن لم تقطعه قطعك» — نوع التشبيه:", o: ["مرسل", "مؤكد", "لا تشبيه هنا", "استعارة تصريحية"], a: 1, e: "الأداة محذوفة." },
    { t: "mcq", sn: "التحويل", q: "حوّل «الأمّ كالشمس» إلى تشبيه مؤكد بحذف الأداة:", o: ["الأمّ مثل الشمس", "الأمّ شمسٌ", "الأمّ كأنها شمس", "الأمّ تشبه الشمس"], a: 1, e: "حذف الأداة «كـ» يجعلها مؤكدًا: الأمّ شمسٌ." },
    { t: "mcq", sn: "تمييز", q: "الفارق الجوهري بين المرسل والمؤكد:", o: ["طول الجملة", "وجود الأداة من عدمه", "عدد الكلمات", "نوع الأداة فقط"], a: 1, e: "المرسل بالأداة، والمؤكد بلا أداة." },
    { t: "mcq", sn: "تطبيق", q: "«الحياةُ رحلةٌ مليئة بالدروس» — نوع التشبيه:", o: ["مرسل", "مؤكد", "طباق", "لا تشبيه"], a: 1, e: "لا أداة تشبيه ظاهرة." },
    { t: "mcq", sn: "تطبيق", q: "أيّ جملة يمكن اعتبارها الأقوى إيحاءً باتحاد الطرفين؟", o: ["الجندي كالأسد", "الجندي مثل الأسد", "الجندي أسدٌ", "الجندي يشبه الأسد"], a: 2, e: "التشبيه المؤكد (بلا أداة) هو الأقوى إيحاءً." },
    { t: "tf", sn: "التعريف", q: "التشبيه المؤكد تُحذف منه أداة التشبيه.", a: true, e: "هذا تعريفه بالضبط." },
    { t: "tf", sn: "تمييز", q: "«العلمُ كالنورِ» تشبيه مؤكد.", a: false, e: "الأداة «كـ» مذكورة، فهو مرسل." },
    { t: "tf", sn: "الأثر", q: "حذف الأداة يُضعف الصلة بين المشبَّه والمشبَّه به.", a: false, e: "بالعكس، يقوّيها ويوحي بالاتحاد." },
    { t: "tf", sn: "تطبيق", q: "«الصبرُ دواءٌ مرّ» تشبيه مؤكد.", a: true, e: "لا أداة ظاهرة في الجملة." },
    { t: "tf", sn: "تطبيق", q: "«الوقتُ سيفٌ» يمكن أن تكون أيضًا مرسلة بإضافة «كـ».", a: true, e: "بإضافة الأداة تصير: الوقت كالسيف — تشبيه مرسل." },
    { t: "fill", sn: "التحويل", q: "حوّل «الجندي كالأسد» إلى تشبيه مؤكد (احذف الأداة واكتب الجملة).", a: ["الجندي أسد", "الجندي أسدٌ"], e: "حذف الأداة يجعله مؤكدًا." },
    { t: "fill", sn: "تحديد النوع", q: "«العلمُ نورٌ يهدي الحائرين» — اكتب نوع التشبيه (كلمتان).", a: ["تشبيه مؤكد"], e: "لا أداة في الجملة." },
    { t: "fill", sn: "التطبيق", q: "أكمل: في التشبيه المؤكد تُحذف ____.", a: ["الاداة", "الأداة", "أداة التشبيه"], e: "هذا جوهر تعريفه." },
    { t: "fill", sn: "تطبيق", q: "صوّب: اكتب نوع «الوقتُ سيفٌ» بكلمتين.", a: ["تشبيه مؤكد"], e: "لا أداة ظاهرة." },
    { t: "match", sn: "التحويل", q: "طابق كل تشبيه مرسل بمقابله المؤكد.",
      pairs: [["العلمُ كالنورِ", "العلمُ نورٌ"], ["الصبرُ مثل الدواء", "الصبرُ دواءٌ"], ["الأمّ كالشمس", "الأمّ شمسٌ"], ["الجندي مثل الأسد", "الجندي أسدٌ"]], e: "حذف الأداة يحوّل المرسل إلى مؤكد." },
    { t: "match", sn: "التصنيف", q: "طابق كل جملة بنوعها.",
      pairs: [["العلمُ نورٌ", "تشبيه مؤكد"], ["العلمُ كالنورِ", "تشبيه مرسل"], ["الوقتُ سيفٌ", "تشبيه مؤكد"], ["الوقتُ كالسيفِ", "تشبيه مرسل"]], e: "وجود الأداة من عدمه هو الفيصل." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تجعل الجملة تشبيهًا مرسلًا لا مؤكدًا لو أُضيفت.", words: ["العلمُ", "نورٌ", "يهدي", "الحائرين"], a: 1, fix: "كالنور (بإضافة الكاف)", e: "إضافة الأداة تحوّله لمرسل." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تدلّ على غياب الأداة (اسم المشبَّه به المباشر).", words: ["الصبرُ", "دواءٌ", "مرّ", "نافع"], a: 1, fix: "دواءٌ (بلا أداة قبلها)", e: "غياب الأداة قبل «دواء» يجعله مؤكدًا." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي هي المشبَّه به في تشبيه مؤكد.", words: ["الوقتُ", "سيفٌ", "إن", "قطعك"], a: 1, fix: "سيفٌ", e: "المشبَّه به مذكور بلا أداة." },
  ],
};

const C9 = {
  id: "c-tashbih-mujmal-9", title: "التشبيه المجمل", domain: "RH", grade: 9, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب التشبيه المجمل بحذف وجه الشبه، ويستنتج وجه الشبه المحذوف من السياق.",
  stages: [
    { t: "rule", title: "القاعدة", strat: "العرض المباشر",
      body: "وجه الشبه هو الصفة المشتركة بين المشبَّه والمشبَّه به. فإن حُذف من الجملة ولم يُذكر صراحة، سُمّي التشبيه مجملًا — ويُترك للسامع استنتاجه من السياق.",
      concepts: [{ label: "وجه الشبه", note: "الصفة المشتركة، وهي المحذوفة هنا" }, { label: "الإجمال", note: "يفتح المجال للتأويل والتخيّل" }, { label: "المقابل", note: "التشبيه المفصَّل (يُذكر فيه وجه الشبه)" }],
      note: "مثال: «العلمُ كالنورِ» — لم يُذكر وجه الشبه (كالهداية أو الإشراق)، فتُرك للقارئ أن يتخيّله." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات الكشف عن التشبيه المجمل.",
      items: [
        { w: "العلمُ كالنورِ", steps: ["ابحث عن وجه الشبه المذكور", "لا يوجد وجه شبه صريح", "تُرك للقارئ أن يتخيّل الصفة المشتركة", "تشبيه مجمل"] },
        { w: "الصديقُ الوفيّ كالكنزِ", steps: ["ابحث عن وجه الشبه المذكور", "لا يوجد وجه شبه صريح", "تُرك للقارئ استنتاج الصفة المشتركة", "تشبيه مجمل"] },
        { w: "الأمُّ كالبحرِ", steps: ["ابحث عن وجه الشبه المذكور", "لا يوجد وجه شبه صريح", "الصفة (العطاء أو السعة) غير مذكورة", "تشبيه مجمل"] }] },
    { t: "summary", title: "الخلاصة", strat: "بطاقة الخروج",
      body: "التشبيه المجمل: ما حُذف منه وجه الشبه، فيُترك للسامع استنتاجه من السياق أو الخيال.",
      bullets: ["وجه الشبه: محذوف", "الأثر: يفتح للتأويل والتخيّل", "يقابله: التشبيه المفصَّل"],
      note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." },
  ],
  bank: [
    { t: "mcq", sn: "تعريف المجمل", q: "التشبيه المجمل هو ما:", o: ["ذُكر فيه وجه الشبه", "حُذف منه وجه الشبه", "ذُكرت فيه الأداة فقط", "حُذفت منه الأداة"], a: 1, e: "وجه الشبه غير مذكور في المجمل." },
    { t: "mcq", sn: "تطبيق", q: "«العلمُ كالنورِ» — نوع التشبيه من حيث وجه الشبه:", o: ["مفصَّل", "مجمل", "لا تشبيه", "استعارة"], a: 1, e: "لم يُذكر وجه الشبه (الهداية مثلًا)." },
    { t: "mcq", sn: "الأثر البلاغي", q: "حذف وجه الشبه في التشبيه المجمل يجعل المعنى:", o: ["مغلقًا تمامًا", "مفتوحًا للتأويل والخيال", "خاطئًا", "بلا معنى"], a: 1, e: "يترك مجالًا للقارئ ليتخيّل وجه الشبه بنفسه." },
    { t: "mcq", sn: "تطبيق", q: "«الصديقُ الوفيّ كالكنزِ» — وجه الشبه:", o: ["مذكور: الندرة والقيمة", "محذوف، فالتشبيه مجمل", "غير موجود أصلًا", "لا علاقة لوجه الشبه هنا"], a: 1, e: "لم تُذكر صفة الكنز المقصودة، فالتشبيه مجمل." },
    { t: "mcq", sn: "تمييز", q: "أيّ الجمل فيها تشبيه مجمل؟", o: ["الأمّ كالبحر في العطاء", "الأمّ كالبحر", "الأمّ كالبحر سعةً وعطاءً", "لا فرق بينها"], a: 1, e: "الثانية وحدها بلا وجه شبه مذكور." },
    { t: "mcq", sn: "تطبيق", q: "«الوقتُ كالسيفِ» — وجه الشبه:", o: ["مذكور صراحة: الحدّة", "محذوف، فالتشبيه مجمل", "غير موجود", "استعارة لا تشبيه"], a: 1, e: "لم يُذكر أن السيف حادّ يقطع، فهو مجمل." },
    { t: "mcq", sn: "التحويل", q: "لتحويل تشبيه مجمل إلى مفصَّل، ماذا تفعل؟", o: ["تحذف الأداة", "تضيف وجه الشبه", "تحذف المشبَّه", "تضيف أداة جديدة"], a: 1, e: "إضافة وجه الشبه تحوّله إلى مفصَّل." },
    { t: "mcq", sn: "تطبيق", q: "«الحديقةُ كاللوحةِ» — التشبيه:", o: ["مفصَّل لأن اللوحة جميلة", "مجمل لعدم ذكر وجه الشبه", "لا تشبيه هنا", "استعارة مكنية"], a: 1, e: "لم يُذكر وجه الشبه (الجمال والألوان)." },
    { t: "tf", sn: "التعريف", q: "التشبيه المجمل يُذكر فيه وجه الشبه صراحة.", a: false, e: "بالعكس، وجه الشبه محذوف في المجمل." },
    { t: "tf", sn: "تطبيق", q: "«العلمُ كالنورِ» تشبيه مجمل.", a: true, e: "لا وجه شبه مذكور." },
    { t: "tf", sn: "الأثر", q: "التشبيه المجمل يفتح مجالًا للخيال والتأويل.", a: true, e: "لأن وجه الشبه غير محدَّد، يتخيّله كل قارئ حسب فهمه." },
    { t: "tf", sn: "تطبيق", q: "«الأمّ كالبحر في العطاء» تشبيه مجمل.", a: false, e: "وجه الشبه (العطاء) مذكور، فهو مفصَّل." },
    { t: "fill", sn: "تحديد النوع", q: "«الصديقُ الوفيّ كالكنزِ» — اكتب نوع التشبيه من حيث وجه الشبه (كلمتان).", a: ["تشبيه مجمل"], e: "وجه الشبه غير مذكور." },
    { t: "fill", sn: "التطبيق", q: "أكمل: التشبيه المجمل هو ما حُذف منه ____.", a: ["وجه الشبه"], e: "هذا جوهر تعريفه." },
    { t: "fill", sn: "التحويل", q: "أضف وجه شبه مناسبًا لتحويل «الأمّ كالبحر» إلى تشبيه مفصَّل (اكتب كلمة واحدة تمثّل وجه الشبه).", a: ["العطاء", "السعة", "الحنان", "عطاء"], e: "أي صفة مشتركة منطقية بين الأمّ والبحر تُقبل." },
    { t: "fill", sn: "تطبيق", q: "صوّب: اكتب نوع «الوقتُ كالسيفِ» من حيث وجه الشبه.", a: ["تشبيه مجمل", "مجمل"], e: "لا وجه شبه مذكور." },
    { t: "match", sn: "التصنيف", q: "طابق كل جملة بنوعها من حيث وجه الشبه.",
      pairs: [["العلمُ كالنورِ", "تشبيه مجمل"], ["العلمُ كالنورِ هداية", "تشبيه مفصَّل"], ["الأمّ كالبحر", "تشبيه مجمل"], ["الأمّ كالبحر عطاءً", "تشبيه مفصَّل"]], e: "ذكر وجه الشبه من عدمه هو الفيصل." },
    { t: "match", sn: "المصطلح وتعريفه", q: "طابق كل مصطلح بتعريفه.",
      pairs: [["التشبيه المجمل", "حذف وجه الشبه"], ["وجه الشبه", "الصفة المشتركة بين الطرفين"], ["التشبيه المفصَّل", "ذكر وجه الشبه"], ["الأثر البلاغي للإجمال", "فتح المجال للتخيّل"]], e: "تعريفات أساسية للباب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي لو أُضيفت لصارت الجملة تشبيهًا مفصَّلًا لا مجملًا.", words: ["العلمُ", "كالنورِ", "يهدي", "دومًا"], a: 1, fix: "كالنور هداية (بإضافة وجه الشبه)", e: "إضافة وجه الشبه صراحة تحوّله لمفصَّل." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل المشبَّه به في تشبيه مجمل.", words: ["الصديقُ", "الوفيّ", "كالكنزِ", "دائمًا"], a: 2, fix: "كالكنزِ", e: "المشبَّه به مذكور، ووجه الشبه (الندرة أو القيمة) محذوف." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل المشبَّه به في الجملة.", words: ["الحديقةُ", "كاللوحةِ", "الجميلة", "دومًا"], a: 1, fix: "كاللوحةِ", e: "المشبَّه به مذكور بلا وجه شبه صريح." },
  ],
};

const C10 = {
  id: "c-tashbih-mufassal-9", title: "التشبيه المفصَّل", domain: "RH", grade: 9, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب التشبيه المفصَّل بذكر وجه الشبه صراحة، ويحدّد الصفة المشتركة بين الطرفين.",
  stages: [
    { t: "rule", title: "القاعدة", strat: "العرض المباشر",
      body: "التشبيه المفصَّل هو ما ذُكر فيه وجه الشبه صراحة — أي الصفة المشتركة بين المشبَّه والمشبَّه به تُذكر في الجملة نفسها، فلا يحتاج السامع إلى تخمينها.",
      concepts: [{ label: "وجه الشبه", note: "مذكور صراحة" }, { label: "الوضوح", note: "لا لبس في المعنى المقصود" }, { label: "المقابل", note: "التشبيه المجمل (وجه الشبه محذوف)" }],
      note: "مثال: «العلمُ كالنورِ هدايةً وإشراقًا» — وجه الشبه (الهداية والإشراق) مذكور صراحة، فالتشبيه مفصَّل." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات الكشف عن التشبيه المفصَّل.",
      items: [
        { w: "العلمُ كالنورِ هدايةً وإشراقًا", steps: ["ابحث عن وجه الشبه", "وُجد: هداية وإشراقًا", "الصفة المشتركة مذكورة صراحة", "تشبيه مفصَّل"] },
        { w: "الصديقُ الوفيّ كالكنزِ ندرةً وقيمةً", steps: ["ابحث عن وجه الشبه", "وُجد: ندرة وقيمة", "الصفة المشتركة مذكورة صراحة", "تشبيه مفصَّل"] },
        { w: "الأمّ كالبحر عطاءً وسعةً", steps: ["ابحث عن وجه الشبه", "وُجد: عطاء وسعة", "الصفة المشتركة مذكورة صراحة", "تشبيه مفصَّل"] }] },
    { t: "summary", title: "الخلاصة", strat: "بطاقة الخروج",
      body: "التشبيه المفصَّل: ما ذُكر فيه وجه الشبه صراحة، فيتّضح المعنى المقصود بلا حاجة للتخمين.",
      bullets: ["وجه الشبه: مذكور", "الأثر: وضوح تام للمعنى", "يقابله: التشبيه المجمل"],
      note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." },
  ],
  bank: [
    { t: "mcq", sn: "تعريف المفصَّل", q: "التشبيه المفصَّل هو ما:", o: ["حُذف منه وجه الشبه", "ذُكر فيه وجه الشبه صراحة", "حُذفت منه الأداة", "ذُكرت فيه الأداة فقط"], a: 1, e: "وجه الشبه مذكور في المفصَّل." },
    { t: "mcq", sn: "تحديد وجه الشبه", q: "في «العلمُ كالنورِ هدايةً»، وجه الشبه هو:", o: ["العلم", "النور", "هدايةً", "كالنور"], a: 2, e: "«هداية» هي الصفة المشتركة المذكورة." },
    { t: "mcq", sn: "تطبيق", q: "«الأمّ كالبحر عطاءً وسعةً» — نوع التشبيه:", o: ["مجمل", "مفصَّل", "لا تشبيه", "استعارة"], a: 1, e: "وجه الشبه (عطاء وسعة) مذكور صراحة." },
    { t: "mcq", sn: "الأثر البلاغي", q: "ذكر وجه الشبه في التشبيه المفصَّل يجعل المعنى:", o: ["غامضًا", "واضحًا محدَّدًا", "بلا فائدة", "أطول بلا معنى"], a: 1, e: "يحدّد المعنى المقصود بدقة." },
    { t: "mcq", sn: "تطبيق", q: "«الصديقُ الوفيّ كالكنزِ ندرةً» — وجه الشبه:", o: ["الكنز", "الصديق", "ندرةً", "الوفيّ"], a: 2, e: "«ندرة» هي الصفة المشتركة المذكورة." },
    { t: "mcq", sn: "تمييز", q: "أيّ الجمل فيها تشبيه مفصَّل؟", o: ["الوقتُ كالسيفِ", "الوقتُ كالسيفِ حدّةً", "الوقتُ سيفٌ", "لا فرق بينها"], a: 1, e: "الثانية وحدها ذُكر فيها وجه الشبه." },
    { t: "mcq", sn: "التحويل", q: "لتحويل تشبيه مفصَّل إلى مجمل، ماذا تفعل؟", o: ["تضيف الأداة", "تحذف وجه الشبه", "تحذف المشبَّه به", "تضيف وجه شبه آخر"], a: 1, e: "حذف وجه الشبه يحوّله إلى مجمل." },
    { t: "mcq", sn: "تطبيق", q: "«الحديقةُ كاللوحةِ جمالًا وألوانًا» — وجه الشبه:", o: ["اللوحة", "الحديقة", "جمالًا وألوانًا", "كاللوحة"], a: 2, e: "الصفتان المذكورتان هما وجه الشبه." },
    { t: "mcq", sn: "تطبيق", q: "أيّ جملة أكثر وضوحًا في تحديد المقصود من التشبيه؟", o: ["الرجل كالجبل", "الرجل كالجبل ثباتًا", "الرجل جبلٌ", "لا فرق بينها"], a: 1, e: "ذكر «ثباتًا» يحدّد وجه الشبه بدقة." },
    { t: "tf", sn: "التعريف", q: "التشبيه المفصَّل يُحذف فيه وجه الشبه.", a: false, e: "بالعكس، وجه الشبه مذكور في المفصَّل." },
    { t: "tf", sn: "تطبيق", q: "«العلمُ كالنورِ هدايةً» تشبيه مفصَّل.", a: true, e: "وجه الشبه (هداية) مذكور." },
    { t: "tf", sn: "الأثر", q: "ذكر وجه الشبه يزيد المعنى وضوحًا وتحديدًا.", a: true, e: "هذا أثره البلاغي الأساسي." },
    { t: "tf", sn: "تطبيق", q: "«الأمّ كالبحر» وحدها تشبيه مفصَّل.", a: false, e: "لا وجه شبه مذكور هنا، فهي مجمل." },
    { t: "fill", sn: "تحديد وجه الشبه", q: "في «الصديقُ الوفيّ كالكنزِ ندرةً وقيمةً»، اكتب وجه الشبه.", a: ["ندرة وقيمة", "ندرةً وقيمةً", "ندرة", "قيمة"], e: "الصفة المشتركة المذكورة صراحة." },
    { t: "fill", sn: "تحديد النوع", q: "«الأمّ كالبحر عطاءً وسعةً» — اكتب نوع التشبيه (كلمتان).", a: ["تشبيه مفصل", "تشبيه مفصَّل"], e: "وجه الشبه مذكور." },
    { t: "fill", sn: "التطبيق", q: "أكمل: التشبيه المفصَّل هو ما ذُكر فيه ____ صراحة.", a: ["وجه الشبه"], e: "هذا جوهر تعريفه." },
    { t: "fill", sn: "التحويل", q: "احذف وجه الشبه من «الوقتُ كالسيفِ حدّةً» لتحويله إلى مجمل (اكتب الجملة الناتجة).", a: ["الوقت كالسيف", "الوقتُ كالسيفِ"], e: "حذف «حدّة» يجعله مجملًا." },
    { t: "match", sn: "تحديد وجه الشبه", q: "طابق كل جملة بوجه الشبه المذكور فيها.",
      pairs: [["العلمُ كالنورِ هدايةً", "هداية"], ["الأمّ كالبحر عطاءً", "عطاء"], ["الصديقُ كالكنزِ ندرةً", "ندرة"], ["الوقتُ كالسيفِ حدّةً", "حدّة"]], e: "وجه الشبه هو الصفة المشتركة المذكورة." },
    { t: "match", sn: "التصنيف", q: "طابق كل جملة بنوعها من حيث وجه الشبه.",
      pairs: [["العلمُ كالنورِ هدايةً", "تشبيه مفصَّل"], ["العلمُ كالنورِ", "تشبيه مجمل"], ["الأمّ كالبحر عطاءً", "تشبيه مفصَّل"], ["الأمّ كالبحر", "تشبيه مجمل"]], e: "ذكر وجه الشبه من عدمه هو الفيصل." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل وجه الشبه في الجملة.", words: ["العلمُ", "كالنورِ", "هدايةً", "دومًا"], a: 2, fix: "هدايةً", e: "هي الصفة المشتركة المذكورة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل وجه الشبه في الجملة.", words: ["الأمّ", "كالبحر", "عطاءً", "دائمًا"], a: 2, fix: "عطاءً", e: "الصفة المشتركة المذكورة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل وجه الشبه في الجملة.", words: ["الوقتُ", "كالسيفِ", "حدّةً", "غالبًا"], a: 2, fix: "حدّةً", e: "الصفة المشتركة المذكورة صراحة." },
  ],
};

const C11 = {
  id: "c-muqabala-9", title: "المقابلة", domain: "RH", grade: 9, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب المقابلة بوصفها معنيين فأكثر يقابلهما معنيان متضادّان فأكثر بالترتيب، ويفرّقها عن الطباق.",
  stages: [
    { t: "rule", title: "القاعدة", strat: "العرض المباشر",
      body: "المقابلة هي الإتيان بمعنيين متوافقين أو أكثر، ثم الإتيان بما يقابلهما من المعاني المتضادّة بالترتيب نفسه. تختلف عن الطباق في أن الطباق يقتصر على ضدّين اثنين فقط، بينما المقابلة تشمل ثلاثة أضداد أو أكثر مرتَّبة.",
      concepts: [{ label: "معنيان فأكثر", note: "في الشطر الأول" }, { label: "أضدادهما", note: "بالترتيب نفسه في الشطر الثاني" }, { label: "الفارق عن الطباق", note: "المقابلة أشمل من ضدّين" }],
      note: "مثال: «جزاء الصادق: الثقة والاحترام، وجزاء الكاذب: الريبة والازدراء» — قابلنا (الصادق/الكاذب) و(الثقة والاحترام/الريبة والازدراء) بالترتيب نفسه." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات استخراج المقابلة وتحديد أطرافها.",
      items: [
        { w: "جزاء الصادق: الثقة والاحترام، وجزاء الكاذب: الريبة والازدراء", steps: ["حدّد المعاني في الشطر الأول: الصادق، الثقة، الاحترام", "حدّد أضدادها في الشطر الثاني: الكاذب، الريبة، الازدراء", "تحقّق من الترتيب: مطابق تمامًا", "مقابلة (ثلاثة أضداد فأكثر)"] },
        { w: "من استقام فله الفوز، ومن اعوجّ فله الخسران", steps: ["المعاني الأولى: استقام، الفوز", "أضدادها: اعوجّ، الخسران", "الترتيب مطابق", "مقابلة (ضدّان فقط هنا يجعلانها أقرب لطباق مزدوج، لكن يُعدّ من صور المقابلة البسيطة)"] },
        { w: "يُحيي القويّ الضعيفَ برحمته، ويُميت الظالمُ المظلومَ بقسوته", steps: ["المعاني الأولى: يحيي، القوي، الضعيف، رحمته", "أضدادها: يميت، الظالم، المظلوم، قسوته", "الترتيب مطابق تمامًا لأربعة عناصر", "مقابلة واضحة وقوية"] }] },
    { t: "summary", title: "الخلاصة", strat: "بطاقة الخروج",
      body: "المقابلة: الإتيان بمعنيين فأكثر ثم أضدادهما بالترتيب نفسه. تحتاج ثلاثة أضداد فأكثر لتتميّز بوضوح عن الطباق (ضدّان فقط).",
      bullets: ["معنيان أو أكثر", "أضدادهما بالترتيب نفسه", "أشمل من الطباق", "تُبرز الموازنة بين حالتين متقابلتين"],
      note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." },
  ],
  bank: [
    { t: "mcq", sn: "تعريف المقابلة", q: "المقابلة هي:", o: ["ضدّان فقط", "معنيان فأكثر يقابلهما ضدّاهما بالترتيب", "ترادف كلمتين", "تكرار الجملة"], a: 1, e: "المقابلة أشمل من الطباق." },
    { t: "mcq", sn: "الفارق عن الطباق", q: "ما الذي يميّز المقابلة عن الطباق؟", o: ["لا فرق بينهما", "المقابلة تشمل ثلاثة أضداد فأكثر، والطباق ضدّان فقط", "الطباق أشمل من المقابلة", "المقابلة لا تحتاج ترتيبًا"], a: 1, e: "هذا الفارق الجوهري بينهما." },
    { t: "mcq", sn: "تطبيق", q: "«جزاء الصادق: الثقة، وجزاء الكاذب: الريبة» — نوع الأسلوب:", o: ["طباق", "مقابلة", "استعارة", "لا علاقة"], a: 1, e: "عنصران متقابلان (الصادق/الكاذب، الثقة/الريبة) بالترتيب." },
    { t: "mcq", sn: "شرط الترتيب", q: "يُشترط في المقابلة أن تكون الأضداد:", o: ["بلا ترتيب معيّن", "بالترتيب نفسه للمعاني الأولى", "متفرّقة في الجملة", "لا يُشترط شيء"], a: 1, e: "الترتيب شرط أساسي في المقابلة." },
    { t: "mcq", sn: "تطبيق", q: "«يُحيي القويّ الضعيفَ برحمته، ويُميت الظالمُ المظلومَ بقسوته» — عدد الأضداد المتقابلة:", o: ["ضدّان", "ثلاثة أضداد", "أربعة أضداد", "لا أضداد"], a: 3, e: "يحيي/يميت، القوي/الظالم، الضعيف/المظلوم، رحمته/قسوته — أربعة أزواج." },
    { t: "mcq", sn: "تمييز", q: "أيّ الجمل تمثّل مقابلة لا طباقًا؟", o: ["الليل والنهار آيتان", "من صدق نجا ومن كذب خاب وهلك", "يعلم السرَّ والعلانية", "أنطق بالحقّ ولا أكتمه"], a: 1, e: "فيها أكثر من ضدّين مرتَّبين (صدق/كذب، نجا/خاب وهلك)." },
    { t: "mcq", sn: "الأثر البلاغي", q: "الأثر البلاغي للمقابلة:", o: ["تُبرز الموازنة الشاملة بين حالتين متضادّتين", "تُشوّش المعنى", "لا أثر لها", "تُطيل الجملة بلا فائدة"], a: 0, e: "تُقدّم صورة متكاملة الأضداد بترتيب منطقي." },
    { t: "mcq", sn: "تطبيق", q: "«من استقام فله الفوز، ومن اعوجّ فله الخسران» — نوع الأسلوب:", o: ["طباق بسيط بضدّين فقط، ويُعدّ من صور المقابلة", "استعارة", "تشبيه", "لا علاقة"], a: 0, e: "ضدّان مرتَّبان (استقام/اعوجّ، الفوز/الخسران) — مقابلة بسيطة." },
    { t: "mcq", sn: "شمول المقابلة", q: "المقابلة يمكن أن تكون بين:", o: ["كلمتين فقط دائمًا", "عبارتين أو أكثر بينهما تقابل كامل", "حرفين فقط", "لا حدّ لعدد الكلمات المتقابلة"], a: 1, e: "تشمل عبارات كاملة لا كلمات مفردة فقط." },
    { t: "tf", sn: "التعريف", q: "المقابلة تقتصر على ضدّين اثنين فقط كالطباق تمامًا.", a: false, e: "المقابلة أشمل، وقد تصل لثلاثة أضداد فأكثر." },
    { t: "tf", sn: "الترتيب", q: "يُشترط في المقابلة أن تأتي الأضداد بالترتيب نفسه للمعاني الأصلية.", a: true, e: "هذا شرط أساسي فيها." },
    { t: "tf", sn: "تطبيق", q: "«جزاء الصادق الثقة، وجزاء الكاذب الريبة» مقابلة.", a: true, e: "عنصران متقابلان بالترتيب." },
    { t: "tf", sn: "الفارق", q: "كل طباق يُعدّ مقابلة، وكل مقابلة تُعدّ طباقًا.", a: false, e: "المقابلة أعمّ من الطباق؛ ليس كل طباق مقابلة إن اقتصر على ضدّين بلا بنية متوازنة." },
    { t: "fill", sn: "استخراج المقابلة", q: "استخرج الطرفين المتقابلين الأولين من: «يُحيي القويّ الضعيفَ، ويُميت الظالمُ المظلومَ» (اكتب الفعلين).", a: ["يحيي ويميت", "يحيي، يميت"], e: "الفعلان المتضادّان في بداية كل شطر." },
    { t: "fill", sn: "عدد الأضداد", q: "في «يُحيي القويّ الضعيفَ برحمته، ويُميت الظالمُ المظلومَ بقسوته»، اكتب عدد الأزواج المتقابلة رقمًا.", a: ["4", "أربعة"], e: "يحيي/يميت، القوي/الظالم، الضعيف/المظلوم، رحمته/قسوته." },
    { t: "fill", sn: "التطبيق", q: "أكمل: المقابلة هي الإتيان بمعنيين فأكثر يقابلهما ____ بالترتيب.", a: ["ضدهما", "ضدّاهما", "اضدادهما", "أضدادهما"], e: "هذا جوهر تعريفها." },
    { t: "match", sn: "استخراج الأطراف", q: "طابق كل طرف في الشطر الأول بضدّه في الشطر الثاني من جملة «يُحيي القويّ الضعيفَ برحمته، ويُميت الظالمُ المظلومَ بقسوته».",
      pairs: [["يُحيي", "يُميت"], ["القويّ", "الظالم"], ["الضعيف", "المظلوم"], ["رحمته", "قسوته"]], e: "كل عنصر في الشطر الأول له ضدّه بالترتيب نفسه." },
    { t: "match", sn: "التصنيف", q: "طابق كل جملة بنوعها البلاغي.",
      pairs: [["الليل والنهار آيتان", "طباق"], ["جزاء الصادق الثقة وجزاء الكاذب الريبة", "مقابلة"], ["يعلم السرَّ والعلانية", "طباق"], ["يُحيي القويّ ويُميت الظالمُ برحمته وقسوته", "مقابلة"]], e: "عدد الأضداد المتقابلة هو الفيصل." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تقابل «الصادق» في الجملة.", words: ["جزاء", "الصادق", "الثقة", "الكاذب"], a: 3, fix: "الكاذب تقابل الصادق", e: "الصادق والكاذب طرفان متقابلان." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تقابل «الثقة» في الجملة الكاملة (جزاء الصادق الثقة وجزاء الكاذب الريبة).", words: ["جزاء", "الكاذب", "الريبة", "و"], a: 2, fix: "الريبة", e: "الثقة تقابلها الريبة بالترتيب نفسه." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تقابل «القويّ» في جملة «يحيي القويّ الضعيف ويميت الظالم المظلوم».", words: ["يميت", "الظالم", "المظلوم", "و"], a: 1, fix: "الظالم", e: "القويّ يقابله الظالم بالترتيب." },
  ],
};

const C12 = {
  id: "c-hamza-wasl-qat-5", title: "همزة الوصل وهمزة القطع", domain: "SP", grade: 5, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب همزة الوصل من همزة القطع بالنطق، ويحدّد مواضع كل منهما.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "انطق كل كلمة بعد كلمة «و» قبلها، ولاحظ: هل تسمع صوت الهمزة أم يختفي؟",
      table: { head: ["الكلمة", "بعد «و» قبلها", "هل تُنطق الهمزة؟", "النوع"],
        rows: [["اكتبْ", "واكتبْ", "لا تُنطق، تسقط", "همزة وصل"], ["أكتبُ", "وأكتبُ", "تُنطق دائمًا", "همزة قطع"],
               ["استخرج", "واستخرج", "لا تُنطق، تسقط", "همزة وصل"], ["أحمد", "وأحمد", "تُنطق دائمًا", "همزة قطع"]] },
      checks: [
        { t: "mcq", q: "ما الفارق الجوهري بين النوعين حسب الجدول؟", o: ["الشكل فقط", "النطق: تسقط همزة الوصل ولا تسقط همزة القطع", "الطول", "لا فرق"], a: 1, e: "همزة الوصل تسقط نطقًا في وسط الكلام، وهمزة القطع تبقى دائمًا." },
        { t: "mcq", q: "كيف تختبر نوع الهمزة عمليًا؟", o: ["أنطقها بعد كلمة قبلها ثم أستمع", "أعدّ حروف الكلمة", "أنظر إلى معناها فقط", "لا طريقة للاختبار"], a: 0, e: "هذا الاختبار العملي الأسرع." }],
      reveal: "استنتجت القاعدة: إن سقط نطق الهمزة عند الوصل فهي همزة وصل (تُكتب ا بلا رأس)، وإن بقيت منطوقة فهي همزة قطع (تُكتب أ أو إ)." },
    { t: "rule", title: "مواضع الهمزتين", strat: "التمثيل البصري",
      body: "همزة الوصل تُكتب بلا رأس همزة (ا) وتسقط نطقًا في درج الكلام. همزة القطع تُكتب برأس همزة (أ فوق الألف أو إ تحتها) وتُنطق دائمًا في كل موضع.",
      concepts: [{ label: "همزة الوصل", note: "أمر الثلاثي، ماضي/أمر/مصدر الخماسي والسداسي، عشرة أسماء، أل التعريف" }, { label: "همزة القطع", note: "كل ما عدا ذلك: أغلب الأسماء، مضارع المتكلم، ماضي الثلاثي" }],
      note: "الأسماء العشرة لهمزة الوصل: ابن، ابنة، اثنان، اثنتان، امرؤ، امرأة، اسم، است، ايم الله، اثنا. احفظها فهي استثناء لا يُقاس." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الكلمة لترى خطوات تحديد نوع همزتها.",
      items: [
        { w: "اجتهد", steps: ["انطقها بعد «و»: واجتهد", "الهمزة سقطت نطقًا", "الفعل خماسي (اجتهد)", "همزة وصل — تُكتب بلا رأس"] },
        { w: "أحمد", steps: ["انطقها بعد «و»: وأحمد", "الهمزة بقيت منطوقة", "اسم علم عادي", "همزة قطع — تُكتب أحمد"] },
        { w: "ابن", steps: ["انطقها بعد «و»: وابن", "الهمزة سقطت نطقًا", "من الأسماء العشرة المحفوظة", "همزة وصل — تُكتب بلا رأس"] },
        { w: "أكرمَ", steps: ["انطقها بعد «و»: وأكرمَ", "الهمزة بقيت منطوقة", "فعل ماضٍ رباعي (أكرم)", "همزة قطع — تُكتب أكرم"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "وزّع الكلمات حسب نوع همزتها.",
      cats: ["همزة وصل", "همزة قطع"],
      items: [["اكتب", "همزة وصل"], ["أكل", "همزة قطع"], ["استخراج", "همزة وصل"], ["إحسان", "همزة قطع"],
              ["امرأة", "همزة وصل"], ["أستاذ", "همزة قطع"], ["انطلاق", "همزة وصل"], ["أمل", "همزة قطع"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "اختبر الهمزة بنطقها بعد «و». إن سقطت فهي وصل، وإن بقيت فهي قطع.",
      bullets: ["وصل: بلا رأس همزة (ا)", "قطع: برأس همزة (أ / إ)", "الأسماء العشرة: احفظها", "الفعل الثلاثي أمرًا: وصل دائمًا"],
      note: "الاختبار 25 سؤالًا متنوعًا بكلمات لم ترد في الشرح." },
  ],
  bank: [
    { t: "mcq", sn: "همزة الأمر", q: "الكتابة الصحيحة لأمر «كتب»:", o: ["اكتب", "أكتب", "إكتب", "ااكتب"], a: 0, e: "أمر الفعل الثلاثي همزته وصل." },
    { t: "mcq", sn: "همزة الأسماء العشرة", q: "أيّ الكلمات من الأسماء العشرة؟", o: ["أحمد", "امرأة", "أمل", "إيمان"], a: 1, e: "«امرأة» من الأسماء العشرة المحفوظة." },
    { t: "mcq", sn: "همزة المضارع", q: "همزة المضارع للمتكلم (أكتبُ) نوعها:", o: ["وصل", "قطع", "لا همزة", "يعتمد على السياق"], a: 1, e: "همزة المضارع للمتكلم قطع دائمًا." },
    { t: "mcq", sn: "همزة الخماسي والسداسي", q: "همزة «استخرج» (فعل سداسي):", o: ["قطع", "وصل", "لا يوجد قاعدة", "تعتمد على المعنى"], a: 1, e: "ماضي وأمر ومصدر الخماسي والسداسي همزته وصل." },
    { t: "mcq", sn: "همزة أل", q: "همزة «ال» التعريف:", o: ["قطع", "وصل", "لا تُكتب أصلًا", "تختلف حسب الكلمة"], a: 1, e: "أل التعريف همزتها وصل دائمًا." },
    { t: "mcq", sn: "تطبيق", q: "الكتابة الصحيحة لماضي الفعل الرباعي «كرَّم» (أكرم):", o: ["اكرم", "أكرم", "إكرم", "ااكرم"], a: 1, e: "الرباعي همزته قطع، ليس من الخماسي أو السداسي." },
    { t: "mcq", sn: "تطبيق", q: "همزة «اسم» في «بسم الله» (اسم):", o: ["قطع", "وصل، ومن الأسماء العشرة", "لا همزة", "تعتمد على الموضع"], a: 1, e: "«اسم» من الأسماء العشرة المحفوظة." },
    { t: "mcq", sn: "تمييز", q: "أيّ الأفعال همزته قطع؟", o: ["اجتهد", "أرسل", "استقبل", "انطلق"], a: 1, e: "«أرسل» رباعي، همزته قطع." },
    { t: "mcq", sn: "الاختبار العملي", q: "الطريقة الأسرع لمعرفة نوع الهمزة:", o: ["حفظ كل كلمة عن ظهر قلب", "نطقها بعد كلمة تسبقها ومراقبة السقوط", "عدّ حروف الكلمة", "النظر لطولها"], a: 1, e: "الاختبار العملي بالنطق هو الأدق والأسرع." },
    { t: "mcq", sn: "تطبيق", q: "همزة «امرؤ» في «هذا امرؤٌ صالح»:", o: ["قطع", "وصل، من الأسماء العشرة", "لا همزة", "يعتمد على الإعراب"], a: 1, e: "من الأسماء العشرة المحفوظة." },
    { t: "tf", sn: "التعريف", q: "همزة الوصل تُنطق دائمًا في كل مواضع الكلمة.", a: false, e: "تسقط نطقًا في درج الكلام." },
    { t: "tf", sn: "الأمر الثلاثي", q: "أمر الفعل الثلاثي همزته دائمًا وصل.", a: true, e: "قاعدة ثابتة بلا استثناء." },
    { t: "tf", sn: "المضارع", q: "همزة المضارع للمتكلم (أفعل) قطع دائمًا.", a: true, e: "لا استثناء لهذه القاعدة." },
    { t: "tf", sn: "الأسماء العشرة", q: "«أمل» و«أحمد» من الأسماء العشرة لهمزة الوصل.", a: false, e: "همزتهما قطع؛ ليسا من العشرة المحفوظة." },
    { t: "tf", sn: "تطبيق", q: "همزة «استخراج» (مصدر سداسي) وصل.", a: true, e: "مصدر السداسي همزته وصل." },
    { t: "tf", sn: "الرباعي", q: "همزة ماضي الفعل الرباعي (أكرم) وصل.", a: false, e: "همزته قطع؛ فقط الخماسي والسداسي وصل." },
    { t: "fill", sn: "التطبيق", q: "اكتب أمر الفعل «جلس».", a: ["اجلس"], e: "أمر الثلاثي همزته وصل." },
    { t: "fill", sn: "التطبيق", q: "اكتب ماضي الفعل الخماسي من «جتهد» (اجتهاد).", a: ["اجتهد"], e: "ماضي الخماسي همزته وصل." },
    { t: "fill", sn: "التصويب", q: "صوّب: «إبن الجيران زارنا».", a: ["ابن"], e: "«ابن» من الأسماء العشرة، همزتها وصل." },
    { t: "fill", sn: "التصويب", q: "صوّب: «ادرك الطالب هدفه» إن كانت «أدرك» فعلًا رباعيًّا.", a: ["أدرك"], e: "الرباعي همزته قطع." },
    { t: "fill", sn: "التطبيق", q: "اكتب مضارع «أخذ» للمتكلم المفرد (أنا ____ الكتاب).", a: ["آخذ", "اخذ"], e: "همزة المضارع للمتكلم قطع؛ آخذ (بمدة لالتقاء همزتين)." },
    { t: "match", sn: "التصنيف", q: "طابق كل كلمة بنوع همزتها.",
      pairs: [["اكتب", "همزة وصل"], ["أكرم", "همزة قطع"], ["استخرج", "همزة وصل"], ["أستاذ", "همزة قطع"]], a: 0, e: "طبّق قاعدة السقوط بالنطق." },
    { t: "match", sn: "الأسماء العشرة", q: "طابق كل اسم بحكمه.",
      pairs: [["ابن", "همزة وصل"], ["أمل", "همزة قطع"], ["امرأة", "همزة وصل"], ["إيمان", "همزة قطع"]], e: "الأسماء العشرة محفوظة، والباقي قطع." },
    { t: "match", sn: "نوع الفعل والهمزة", q: "طابق نوع الفعل بحكم همزته.",
      pairs: [["ثلاثي أمرًا", "همزة وصل"], ["رباعي ماضيًا", "همزة قطع"], ["خماسي ماضيًا", "همزة وصل"], ["مضارع للمتكلم", "همزة قطع"]], e: "قواعد أساسية للتمييز." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المكتوبة همزتها خطأً.", words: ["إجتهد", "الطالب", "في", "دروسه"], a: 0, fix: "اجتهد", e: "خماسي، همزته وصل بلا رأس." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المكتوبة همزتها خطأً.", words: ["ادرك", "المعلم", "خطأه", "بسرعة"], a: 0, fix: "أدرك", e: "رباعي، همزته قطع." },
  ],
};

const C13 = {
  id: "c-taa-marbuta-maftuha-4", title: "التاء المربوطة والتاء المفتوحة", domain: "SP", grade: 4, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب التاء المربوطة من المفتوحة بالوقف على الكلمة، ويكتب كلًّا منهما في موضعها الصحيح.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "قف على كل كلمة (توقّف عن نطقها كأنها آخر الجملة)، ولاحظ الصوت الأخير الذي تسمعه.",
      table: { head: ["الكلمة", "الوقف عليها", "الصوت المسموع", "نوع التاء"],
        rows: [["مدرسة", "مدرسْه", "هاء", "مربوطة"], ["بيت", "بيتْ", "تاء", "مفتوحة"],
               ["معلمة", "معلمْه", "هاء", "مربوطة"], ["بنات", "بناتْ", "تاء", "مفتوحة"]] },
      checks: [
        { t: "mcq", q: "ما الاختبار العملي لتحديد نوع التاء؟", o: ["عدّ حروف الكلمة", "الوقف على الكلمة والاستماع للصوت الأخير", "النظر لطولها", "لا اختبار ممكن"], a: 1, e: "الوقف هو الاختبار الحاسم." },
        { t: "mcq", q: "إذا سمعت صوت الهاء عند الوقف، فالتاء:", o: ["مفتوحة", "مربوطة", "لا تُكتب", "يعتمد على المعنى"], a: 1, e: "صوت الهاء عند الوقف علامة التاء المربوطة." }],
      reveal: "استنتجت الاختبار: قف على الكلمة؛ إن سمعت هاء فالتاء مربوطة (ة)، وإن سمعت تاء فهي مفتوحة (ت)." },
    { t: "rule", title: "مواضع كل نوع", strat: "التمثيل البصري",
      body: "التاء المربوطة (ة) تُنطق هاء عند الوقف، وتكون غالبًا آخر اسم مفرد مؤنث أو صفة. التاء المفتوحة (ت) تُنطق تاء عند الوقف، وتكون في الأفعال، وجمع المؤنث السالم، وبعض الأسماء والحروف.",
      concepts: [{ label: "التاء المربوطة", note: "أسماء مفردة مؤنثة غالبًا، تُنطق هاء وقفًا" }, { label: "التاء المفتوحة", note: "أفعال، جموع مؤنث سالم، بعض الأسماء" }],
      note: "لا تخلط: «بنت» اسم مفرد لكن تاءه مفتوحة (أصلية لا علامة تأنيث)، و«قضاة» جمع تكسير لكن تاءه مربوطة." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الكلمة لترى خطوات تحديد نوع تائها.",
      items: [
        { w: "حديقة", steps: ["قف على الكلمة: حديقْه", "الصوت المسموع: هاء", "اسم مفرد مؤنث", "تاء مربوطة — تُكتب ة"] },
        { w: "بيوت", steps: ["قف على الكلمة: بيوتْ", "الصوت المسموع: تاء", "جمع تكسير", "تاء مفتوحة — تُكتب ت"] },
        { w: "معلمات", steps: ["قف على الكلمة: معلماتْ", "الصوت المسموع: تاء", "جمع مؤنث سالم", "تاء مفتوحة — تُكتب ت"] },
        { w: "قضاة", steps: ["قف على الكلمة: قضاهْ", "الصوت المسموع: هاء", "جمع تكسير لكن ينتهي بصوت الهاء", "تاء مربوطة — تُكتب ة"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "وزّع الكلمات حسب نوع تائها بعد الوقف عليها ذهنيًّا.",
      cats: ["تاء مربوطة", "تاء مفتوحة"],
      items: [["مدرسة", "تاء مربوطة"], ["بيت", "تاء مفتوحة"], ["معلمة", "تاء مربوطة"], ["بنات", "تاء مفتوحة"],
              ["حديقة", "تاء مربوطة"], ["كتبت", "تاء مفتوحة"], ["قضاة", "تاء مربوطة"], ["أخوات", "تاء مفتوحة"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "قف على الكلمة ذهنيًّا: صوت الهاء = تاء مربوطة، صوت التاء = تاء مفتوحة.",
      bullets: ["مربوطة: تُنطق هاء وقفًا", "مفتوحة: تُنطق تاء وقفًا", "الأفعال: تاء مفتوحة دائمًا", "جمع المؤنث السالم: تاء مفتوحة"],
      note: "الاختبار 25 سؤالًا متنوعًا بكلمات لم ترد في الشرح." },
  ],
  bank: [
    { t: "mcq", sn: "الاختبار العملي", q: "الطريقة الصحيحة لتحديد نوع التاء:", o: ["عدّ الحروف", "الوقف على الكلمة والاستماع", "النظر إلى الشكل فقط", "لا طريقة أكيدة"], a: 1, e: "الوقف هو الاختبار الحاسم." },
    { t: "mcq", sn: "تطبيق", q: "نوع التاء في «مكتبة»:", o: ["مفتوحة", "مربوطة", "لا تاء هنا", "يعتمد على الجملة"], a: 1, e: "تُنطق هاء عند الوقف." },
    { t: "mcq", sn: "الأفعال", q: "تاء الفعل الماضي (مثل: كتبتُ) نوعها:", o: ["مربوطة دائمًا", "مفتوحة دائمًا", "تعتمد على الفاعل", "لا قاعدة"], a: 1, e: "تاء الأفعال مفتوحة دائمًا." },
    { t: "mcq", sn: "جمع المؤنث السالم", q: "تاء جمع المؤنث السالم (مثل: معلمات):", o: ["مربوطة", "مفتوحة", "تختفي", "تعتمد على المفرد"], a: 1, e: "جمع المؤنث السالم تاؤه مفتوحة دائمًا." },
    { t: "mcq", sn: "الاستثناء", q: "«بنت» و«أخت» تاؤهما:", o: ["مربوطة لأنهما مؤنث", "مفتوحة لأنها أصلية لا علامة تأنيث", "تعتمد على الجملة", "لا تاء فيهما"], a: 1, e: "التاء هنا جزء أصلي من الكلمة لا علامة تأنيث مضافة." },
    { t: "mcq", sn: "تطبيق", q: "نوع التاء في «سيارة»:", o: ["مفتوحة", "مربوطة", "لا تاء", "يعتمد على السياق"], a: 1, e: "تُنطق هاء عند الوقف." },
    { t: "mcq", sn: "جمع التكسير", q: "«قضاة» و«رعاة» جمعا تكسير تاؤهما:", o: ["مفتوحة", "مربوطة رغم أنهما جموع تكسير", "لا تاء", "تعتمد على المفرد"], a: 1, e: "استثناء: بعض جموع التكسير تنتهي بتاء مربوطة." },
    { t: "mcq", sn: "تطبيق", q: "نوع التاء في «صوت»:", o: ["مربوطة", "مفتوحة، فهي حرف أصلي من الكلمة", "لا تاء", "تعتمد على الإعراب"], a: 1, e: "التاء هنا أصلية لا علامة تأنيث." },
    { t: "mcq", sn: "الحروف", q: "تاء التأنيث في «قامتْ» (الفعل الماضي):", o: ["مربوطة", "مفتوحة", "لا تُكتب", "تعتمد على الفاعل"], a: 1, e: "تاء التأنيث الساكنة في الأفعال دائمًا مفتوحة." },
    { t: "mcq", sn: "تمييز", q: "أيّ الكلمات تاؤها مربوطة؟", o: ["بيت", "شجرة", "صوت", "بيوت"], a: 1, e: "«شجرة» تُنطق هاء عند الوقف." },
    { t: "tf", sn: "التعريف", q: "التاء المربوطة تُنطق تاء عند الوقف.", a: false, e: "تُنطق هاء عند الوقف." },
    { t: "tf", sn: "الأفعال", q: "تاء الأفعال دائمًا مفتوحة.", a: true, e: "قاعدة ثابتة بلا استثناء." },
    { t: "tf", sn: "تطبيق", q: "«مدرسة» تاؤها مفتوحة.", a: false, e: "تُنطق هاء عند الوقف، فهي مربوطة." },
    { t: "tf", sn: "الاستثناء", q: "«بنت» تاؤها علامة تأنيث لا حرف أصلي.", a: false, e: "التاء هنا حرف أصلي من بنية الكلمة." },
    { t: "tf", sn: "جمع المؤنث السالم", q: "«طالبات» تاؤها مربوطة.", a: false, e: "جمع المؤنث السالم تاؤه مفتوحة دائمًا." },
    { t: "tf", sn: "تطبيق", q: "«قضاة» تاؤها مربوطة رغم كونها جمع تكسير.", a: true, e: "استثناء يُحفظ." },
    { t: "fill", sn: "التصويب", q: "صوّب: «ذهبت إلى المكتبت».", a: ["المكتبة"], e: "تُنطق هاء عند الوقف." },
    { t: "fill", sn: "التصويب", q: "صوّب: «الطالبة كتبة الدرس» (الفعل).", a: ["كتبت"], e: "تاء الفعل مفتوحة دائمًا." },
    { t: "fill", sn: "التطبيق", q: "اكتب جمع «معلمة» جمع مؤنث سالم.", a: ["معلمات"], e: "جمع المؤنث السالم تاؤه مفتوحة." },
    { t: "fill", sn: "التصويب", q: "صوّب: «رأيت بيتة جميلة» إن كانت الكلمة المقصودة بيتًا واحدًا.", a: ["بيتًا", "بيت"], e: "«بيت» تاؤه أصلية مفتوحة، لا مربوطة." },
    { t: "fill", sn: "تطبيق", q: "اكتب مفرد «أخوات».", a: ["أخت"], e: "تاء «أخت» أصلية مفتوحة." },
    { t: "match", sn: "التصنيف", q: "طابق كل كلمة بنوع تائها.",
      pairs: [["مدرسة", "تاء مربوطة"], ["بيت", "تاء مفتوحة"], ["حديقة", "تاء مربوطة"], ["بنات", "تاء مفتوحة"]], e: "الوقف يحدّد النوع." },
    { t: "match", sn: "قاعدة الموضع", q: "طابق كل نوع كلمة بحكم تائه.",
      pairs: [["فعل ماضٍ", "تاء مفتوحة"], ["اسم مفرد مؤنث", "تاء مربوطة"], ["جمع مؤنث سالم", "تاء مفتوحة"], ["صفة مؤنثة", "تاء مربوطة"]], e: "قواعد أساسية للتمييز." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المكتوبة تاؤها خطأً.", words: ["ذهبت", "الطالبات", "الى", "المدرست"], a: 3, fix: "المدرسة", e: "تُنطق هاء عند الوقف." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المكتوبة تاؤها خطأً.", words: ["كتبة", "الطالبة", "درسها", "بعناية"], a: 0, fix: "كتبت", e: "تاء الفعل مفتوحة دائمًا." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المكتوبة تاؤها خطأً.", words: ["زارت", "المعلماة", "المدرسة", "الجديدة"], a: 1, fix: "المعلمات", e: "جمع المؤنث السالم تاؤه مفتوحة." },
  ],
};

const C14 = {
  id: "c-mubtada-khabar-6", title: "المبتدأ والخبر", domain: "GR", grade: 6, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب المبتدأ والخبر في الجملة الاسمية، ويحدّد أنواع الخبر الثلاثة.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ بداية كل جملة، والاسم الذي جاء بعده يخبر عنه.",
      table: { head: ["الجملة", "الاسم الأول (المبتدأ)", "ما أخبر عنه (الخبر)", "نوع الخبر"],
        rows: [["الجوُّ صافٍ", "الجوّ", "صافٍ", "مفرد"], ["الحديقةُ أزهارُها جميلة", "الحديقة", "أزهارها جميلة", "جملة اسمية"],
               ["الطالبُ يجتهدُ", "الطالب", "يجتهد", "جملة فعلية"], ["الكتابُ على الطاولة", "الكتاب", "على الطاولة", "شبه جملة"]] },
      checks: [
        { t: "mcq", q: "ما الموقع الإعرابي المشترك بين كل «المبتدأ» في الأمثلة؟", o: ["منصوب", "مرفوع", "مجرور", "لا إعراب له"], a: 1, e: "المبتدأ مرفوع دائمًا." },
        { t: "mcq", q: "كم نوعًا للخبر ظهر في الجدول؟", o: ["نوع واحد", "نوعان", "ثلاثة أنواع", "أربعة أنواع"], a: 2, e: "مفرد، وجملة (اسمية أو فعلية)، وشبه جملة." }],
      reveal: "استنتجت: المبتدأ اسم مرفوع في أول الجملة الاسمية، والخبر ما يتمّم معناه، وله ثلاثة أنواع: مفرد، وجملة، وشبه جملة." },
    { t: "rule", title: "أنواع الخبر الثلاثة", strat: "التمثيل البصري",
      body: "المبتدأ: اسم مرفوع يقع غالبًا أول الجملة الاسمية، يُخبر عنه بحكم. الخبر: ما يُتمّ به معنى الجملة، وله ثلاثة أنواع.",
      concepts: [{ label: "خبر مفرد", note: "كلمة واحدة، غير جملة ولا شبه جملة" }, { label: "خبر جملة", note: "اسمية أو فعلية، وتحتاج رابطًا يعود على المبتدأ" }, { label: "خبر شبه جملة", note: "جار ومجرور أو ظرف" }],
      note: "الرابط في خبر الجملة غالبًا ضمير يعود على المبتدأ: «الحديقةُ أزهارُها جميلة» — الضمير في «أزهارها» يعود على الحديقة." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تحديد المبتدأ ونوع الخبر.",
      items: [
        { w: "الشمسُ مشرقة", steps: ["حدّد الاسم الأول: الشمس", "هو المبتدأ، مرفوع", "الخبر: مشرقة", "خبر مفرد (كلمة واحدة)"] },
        { w: "المعلمُ يشرحُ الدرس", steps: ["حدّد الاسم الأول: المعلم", "هو المبتدأ، مرفوع", "الخبر: يشرح الدرس", "خبر جملة فعلية"] },
        { w: "الطالبُ خطُّه جميل", steps: ["حدّد الاسم الأول: الطالب", "هو المبتدأ، مرفوع", "الخبر: خطّه جميل", "خبر جملة اسمية، والرابط: الضمير في خطّه"] },
        { w: "الكتابُ فوق الطاولة", steps: ["حدّد الاسم الأول: الكتاب", "هو المبتدأ، مرفوع", "الخبر: فوق الطاولة", "خبر شبه جملة (ظرف)"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة حسب نوع خبرها.",
      cats: ["خبر مفرد", "خبر جملة", "خبر شبه جملة"],
      items: [["الجوّ جميل", "خبر مفرد"], ["الطائر يُغرّد", "خبر جملة"], ["القلم على المكتب", "خبر شبه جملة"],
              ["الحديقة أزهارها زاهية", "خبر جملة"], ["البيت واسع", "خبر مفرد"], ["الكتاب في الحقيبة", "خبر شبه جملة"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "المبتدأ اسم مرفوع في أول الجملة الاسمية. الخبر يتمّم معناه، وله ثلاثة أنواع: مفرد، وجملة، وشبه جملة.",
      bullets: ["المبتدأ: مرفوع دائمًا", "خبر مفرد: كلمة واحدة", "خبر جملة: يحتاج رابطًا", "خبر شبه جملة: جار ومجرور أو ظرف"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "تعيين المبتدأ", q: "المبتدأ في «السماءُ صافية»:", o: ["السماء", "صافية", "لا مبتدأ", "الاثنان معًا"], a: 0, e: "الاسم الأول المرفوع في الجملة الاسمية." },
    { t: "mcq", sn: "حكم المبتدأ", q: "المبتدأ حكمه الإعرابي:", o: ["منصوب دائمًا", "مرفوع دائمًا", "مجرور أحيانًا", "لا إعراب له"], a: 1, e: "حكم ثابت." },
    { t: "mcq", sn: "نوع الخبر", q: "في «الحديقةُ أشجارُها مثمرة»، نوع الخبر:", o: ["مفرد", "جملة اسمية", "جملة فعلية", "شبه جملة"], a: 1, e: "«أشجارها مثمرة» جملة اسمية كاملة." },
    { t: "mcq", sn: "نوع الخبر", q: "في «الطيرُ يُحلّق»، نوع الخبر:", o: ["مفرد", "جملة اسمية", "جملة فعلية", "شبه جملة"], a: 2, e: "«يحلّق» فعل مضارع وفاعله." },
    { t: "mcq", sn: "نوع الخبر", q: "في «الهاتفُ فوق الطاولة»، نوع الخبر:", o: ["مفرد", "جملة اسمية", "جملة فعلية", "شبه جملة (ظرف)"], a: 3, e: "«فوق الطاولة» ظرف مكان وما بعده." },
    { t: "mcq", sn: "الرابط", q: "الرابط في خبر الجملة عادة يكون:", o: ["أداة تشبيه", "ضمير يعود على المبتدأ", "أداة نفي", "لا رابط ضروري"], a: 1, e: "يربط الخبر بالمبتدأ." },
    { t: "mcq", sn: "تطبيق", q: "«العلمُ نورٌ» — نوع الخبر:", o: ["مفرد", "جملة اسمية", "جملة فعلية", "شبه جملة"], a: 0, e: "«نور» كلمة واحدة." },
    { t: "mcq", sn: "تطبيق", q: "«الطالباتُ مجتهداتٌ» — المبتدأ:", o: ["الطالبات", "مجتهدات", "كلاهما", "لا مبتدأ"], a: 0, e: "الاسم الأول المرفوع." },
    { t: "mcq", sn: "شبه الجملة", q: "شبه الجملة يتكوّن من:", o: ["فعل وفاعل", "جار ومجرور أو ظرف وما بعده", "مبتدأ وخبر فقط", "حرف واحد"], a: 1, e: "هذا تعريفه." },
    { t: "mcq", sn: "تطبيق", q: "«القمرُ بدرٌ الليلةَ» — نوع الخبر:", o: ["مفرد", "جملة", "شبه جملة", "لا خبر"], a: 0, e: "«بدر» كلمة واحدة." },
    { t: "tf", sn: "حكم المبتدأ", q: "المبتدأ منصوب دائمًا.", a: false, e: "مرفوع دائمًا." },
    { t: "tf", sn: "أنواع الخبر", q: "للخبر ثلاثة أنواع: مفرد وجملة وشبه جملة.", a: true, e: "هذا التصنيف الصحيح." },
    { t: "tf", sn: "تطبيق", q: "«الجوّ جميل» خبرها جملة.", a: false, e: "خبرها مفرد (كلمة واحدة)." },
    { t: "tf", sn: "تطبيق", q: "«الطائر يُغرّد على الشجرة» خبرها جملة فعلية.", a: true, e: "«يغرّد» فعل مضارع." },
    { t: "tf", sn: "الرابط", q: "خبر الجملة لا يحتاج رابطًا يعود على المبتدأ.", a: false, e: "يحتاج رابطًا غالبًا ضميرًا." },
    { t: "fill", sn: "تعيين المبتدأ", q: "استخرج المبتدأ من «النجومُ ساطعة».", a: ["النجوم", "النجومُ"], e: "الاسم الأول المرفوع." },
    { t: "fill", sn: "تحديد النوع", q: "«الحديقةُ أزهارُها جميلة» — اكتب نوع الخبر (كلمتان).", a: ["جملة اسمية"], e: "«أزهارها جميلة» جملة اسمية." },
    { t: "fill", sn: "تحديد النوع", q: "«الطائرُ يُغرّد» — اكتب نوع الخبر (كلمتان).", a: ["جملة فعلية"], e: "«يغرّد» فعل وفاعله." },
    { t: "fill", sn: "تحديد النوع", q: "«الكتابُ على الرفّ» — اكتب نوع الخبر (كلمتان أو ثلاث).", a: ["شبه جملة"], e: "جار ومجرور." },
    { t: "fill", sn: "تطبيق", q: "أكمل: المبتدأ اسم ____ يقع غالبًا أول الجملة الاسمية.", a: ["مرفوع"], e: "حكمه الإعرابي." },
    { t: "match", sn: "تعيين المبتدأ والخبر", q: "طابق كل جملة بخبرها.",
      pairs: [["الجوّ جميل", "جميل"], ["الطالب يجتهد", "يجتهد"], ["الكتاب فوق الطاولة", "فوق الطاولة"], ["الحديقة أزهارها زاهية", "أزهارها زاهية"]], e: "الخبر هو ما بعد المبتدأ يتمّم معناه." },
    { t: "match", sn: "تصنيف نوع الخبر", q: "طابق كل جملة بنوع خبرها.",
      pairs: [["الجوّ جميل", "خبر مفرد"], ["الطائر يغرّد", "خبر جملة فعلية"], ["الكتاب على الرفّ", "خبر شبه جملة"], ["البيت بابه مفتوح", "خبر جملة اسمية"]], e: "طبّق التصنيف الثلاثي." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل المبتدأ في الجملة.", words: ["الجوَّ", "جميلٌ", "اليوم", "جدًّا"], a: 0, fix: "الجوُّ (بالرفع لا النصب)", e: "المبتدأ مرفوع لا منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل الخبر المفرد في الجملة.", words: ["السماءُ", "صافيةٌ", "اليوم", "جدًّا"], a: 1, fix: "صافيةٌ", e: "خبر مفرد يتمّم معنى المبتدأ." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمتين اللتين تشكّلان شبه جملة الخبر.", words: ["الكتاب", "فوق", "الطاولة", "الجديدة"], a: 1, fix: "فوق الطاولة", e: "ظرف وما بعده يشكّلان شبه الجملة." },
  ],
};

const C15 = {
  id: "c-kana-akhawatuha-8", title: "كان وأخواتها", domain: "GR", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب كان وأخواتها، ويعرب اسمها المرفوع وخبرها المنصوب في الجملة.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "قارن كل جملتين: العادية، وبعد دخول «كان» عليها. لاحظ ماذا تغيّر في إعراب الخبر.",
      table: { head: ["قبل دخول كان", "بعد دخول كان", "حال المبتدأ (الاسم)", "حال الخبر"],
        rows: [["الجوُّ باردٌ", "كان الجوُّ باردًا", "بقي مرفوعًا (اسم كان)", "تحوّل من مرفوع إلى منصوب (خبر كان)"],
               ["الطالبُ مجتهدٌ", "أصبح الطالبُ مجتهدًا", "بقي مرفوعًا", "تحوّل إلى منصوب"],
               ["الجوُّ حارٌّ", "ما زال الجوُّ حارًّا", "بقي مرفوعًا", "تحوّل إلى منصوب"]] },
      checks: [
        { t: "mcq", q: "ماذا حدث لخبر المبتدأ بعد دخول «كان» أو أخواتها؟", o: ["بقي مرفوعًا كما هو", "تحوّل من مرفوع إلى منصوب", "تحوّل إلى مجرور", "حُذف تمامًا"], a: 1, e: "هذا أثر كان وأخواتها الأساسي." },
        { t: "mcq", q: "ماذا حدث للمبتدأ (الاسم الأول) بعد دخول هذه الأفعال؟", o: ["تحوّل إلى منصوب", "بقي مرفوعًا وسُمّي اسم كان", "تحوّل إلى مجرور", "حُذف"], a: 1, e: "يبقى مرفوعًا لكن يتغيّر اسمه الإعرابي." }],
      reveal: "استنتجت: كان وأخواتها أفعال ناسخة تدخل على الجملة الاسمية، فيبقى المبتدأ مرفوعًا وتُسمّيه اسمها، ويصير الخبر منصوبًا وتُسمّيه خبرها." },
    { t: "rule", title: "كان وأخواتها", strat: "التمثيل البصري",
      body: "كان وأخواتها أفعال ناقصة ناسخة، ترفع الاسم (المبتدأ سابقًا) وتنصب الخبر. من أخواتها: أصبح، أضحى، ظلّ، أمسى، بات، صار، ليس، ما زال، ما دام، ما فتئ، ما انفكّ، ما برح.",
      concepts: [{ label: "اسم كان", note: "مرفوع، هو المبتدأ سابقًا" }, { label: "خبر كان", note: "منصوب، هو الخبر سابقًا" }, { label: "الأثر", note: "نقل الجملة من الرفع المطلق إلى رفع الاسم ونصب الخبر" }],
      note: "«ليس» تفيد النفي دائمًا، و«ما زال/ما دام/ما فتئ/ما انفكّ/ما برح» تُسبق غالبًا بـ«ما» وتفيد الاستمرار." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات إعراب اسم كان وخبرها.",
      items: [
        { w: "كان الجوُّ باردًا", steps: ["حدّد الفعل الناسخ: كان", "الاسم بعده: الجوّ — مرفوع، اسم كان", "الخبر: باردًا — منصوب، خبر كان", "الأثر: رفع الاسم ونصب الخبر"] },
        { w: "أصبح الطالبُ متفوّقًا", steps: ["الفعل الناسخ: أصبح", "الاسم: الطالب — مرفوع، اسم أصبح", "الخبر: متفوّقًا — منصوب، خبر أصبح", "معنى أصبح: التحوّل وقت الصباح أو مطلقًا"] },
        { w: "ليس الكسلُ طريقَ النجاح", steps: ["الفعل الناسخ: ليس", "الاسم: الكسل — مرفوع، اسم ليس", "الخبر: طريقَ النجاح — منصوب، خبر ليس", "ليس تفيد النفي"] },
        { w: "ما زال الأملُ موجودًا", steps: ["الفعل الناسخ: ما زال", "الاسم: الأمل — مرفوع، اسم ما زال", "الخبر: موجودًا — منصوب، خبر ما زال", "تفيد استمرار الحال"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل كلمة: هل هي من أخوات كان، أم فعل عادي؟",
      cats: ["من أخوات كان", "فعل عادي (ليس ناسخًا)"],
      items: [["أصبح", "من أخوات كان"], ["كتب", "فعل عادي (ليس ناسخًا)"], ["ظلّ", "من أخوات كان"], ["ذهب", "فعل عادي (ليس ناسخًا)"],
              ["ليس", "من أخوات كان"], ["لعب", "فعل عادي (ليس ناسخًا)"], ["صار", "من أخوات كان"], ["جلس", "فعل عادي (ليس ناسخًا)"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "كان وأخواتها أفعال ناسخة: ترفع الاسم وتنصب الخبر، عكس أثر إنّ وأخواتها.",
      bullets: ["اسم كان: مرفوع", "خبر كان: منصوب", "من أخواتها: أصبح، صار، ليس، ما زال", "الأثر: تحويل الخبر من مرفوع إلى منصوب"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "حكم اسم كان", q: "اسم كان حكمه الإعرابي:", o: ["منصوب", "مرفوع", "مجرور", "لا إعراب"], a: 1, e: "يبقى مرفوعًا كالمبتدأ سابقًا." },
    { t: "mcq", sn: "حكم خبر كان", q: "خبر كان حكمه الإعرابي:", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 1, e: "يتحوّل من مرفوع إلى منصوب." },
    { t: "mcq", sn: "تطبيق", q: "في «أصبح الجوُّ معتدلًا»، خبر أصبح:", o: ["الجوّ", "معتدلًا", "أصبح", "لا خبر"], a: 1, e: "منصوب بالفتحة." },
    { t: "mcq", sn: "تطبيق", q: "في «ليس الكذبُ خُلقًا كريمًا»، اسم ليس:", o: ["الكذب", "خُلقًا", "كريمًا", "ليس"], a: 0, e: "مرفوع." },
    { t: "mcq", sn: "من أخواتها", q: "أيّ الأفعال ليس من أخوات كان؟", o: ["أصبح", "ظلّ", "كتب", "بات"], a: 2, e: "«كتب» فعل عادي تام لا ناقص ناسخ." },
    { t: "mcq", sn: "معنى ما زال", q: "«ما زال» تفيد:", o: ["الانقطاع", "استمرار الحال", "النفي المطلق", "التحوّل المفاجئ"], a: 1, e: "من أخوات كان الدالة على الاستمرار." },
    { t: "mcq", sn: "تطبيق", q: "في «صار الطقسُ باردًا»، نوع «باردًا»:", o: ["اسم صار", "خبر صار", "فاعل", "مفعول به"], a: 1, e: "منصوب، خبر الفعل الناسخ صار." },
    { t: "mcq", sn: "ليس", q: "«ليس» من أخوات كان وتفيد:", o: ["الاستمرار", "النفي", "التحوّل", "التوكيد"], a: 1, e: "تنفي مضمون الجملة." },
    { t: "mcq", sn: "تطبيق", q: "في «بات المسافرُ متعَبًا»، اسم بات:", o: ["المسافر", "متعبًا", "بات", "لا اسم"], a: 0, e: "مرفوع." },
    { t: "mcq", sn: "الأثر العام", q: "الأثر العام لدخول كان وأخواتها على الجملة الاسمية:", o: ["رفع الاسم ونصب الخبر", "نصب الاسم ورفع الخبر", "جرّ الاسم والخبر معًا", "لا أثر إعرابي"], a: 0, e: "هذا أثرها الثابت." },
    { t: "tf", sn: "حكم اسم كان", q: "اسم كان منصوب دائمًا.", a: false, e: "مرفوع دائمًا." },
    { t: "tf", sn: "حكم خبر كان", q: "خبر كان منصوب دائمًا.", a: true, e: "هذا أثرها الأساسي." },
    { t: "tf", sn: "من أخواتها", q: "«ذهب» و«جلس» من أخوات كان.", a: false, e: "أفعال عادية تامة، لا ناسخة." },
    { t: "tf", sn: "ليس", q: "«ليس» تفيد معنى النفي.", a: true, e: "من أخوات كان الدالة على النفي." },
    { t: "tf", sn: "تطبيق", q: "في «أصبح الطالبُ متفوّقًا»، «متفوقًا» مرفوعة.", a: false, e: "منصوبة؛ خبر أصبح." },
    { t: "tf", sn: "المعنى", q: "كل أخوات كان تدل على المعنى نفسه بلا فروق.", a: false, e: "لكل منها دلالة خاصة: تحوّل، استمرار، نفي، إلخ." },
    { t: "fill", sn: "التطبيق", q: "أعرب «باردًا» في «كان الجوُّ باردًا» (اكتب: مرفوع أم منصوب).", a: ["منصوب"], e: "خبر كان منصوب." },
    { t: "fill", sn: "التطبيق", q: "أعرب «الجوّ» في «كان الجوُّ باردًا» (اكتب: مرفوع أم منصوب).", a: ["مرفوع"], e: "اسم كان مرفوع." },
    { t: "fill", sn: "التحويل", q: "حوّل «الطقس معتدل» بإدخال «أصبح» عليها (اكتب الجملة كاملة).", a: ["أصبح الطقس معتدلا", "أصبح الطقسُ معتدلًا"], e: "الخبر يتحوّل إلى منصوب." },
    { t: "fill", sn: "التطبيق", q: "أكمل: من أخوات كان الدالة على الاستمرار: ما ____ وما دام.", a: ["زال"], e: "«ما زال» من أخوات كان." },
    { t: "match", sn: "الإعراب", q: "طابق كل كلمة بحكمها الإعرابي في «كان الجوُّ باردًا».",
      pairs: [["الجوّ", "اسم كان مرفوع"], ["باردًا", "خبر كان منصوب"], ["كان", "فعل ناسخ ناقص"]], e: "ثلاثة عناصر أساسية في الجملة." },
    { t: "match", sn: "المعنى والفعل", q: "طابق كل فعل بدلالته.",
      pairs: [["ليس", "النفي"], ["ما زال", "الاستمرار"], ["أصبح", "التحوّل وقت الصباح أو مطلقًا"], ["صار", "التحوّل والانتقال"]], e: "لكل فعل من أخوات كان دلالة خاصة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً في «كان الجوُّ باردٌ».", words: ["كان", "الجوُّ", "باردٌ", "اليوم"], a: 2, fix: "باردًا", e: "خبر كان منصوب لا مرفوع." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً في «أصبح الطالبَ متفوقًا».", words: ["أصبح", "الطالبَ", "متفوقًا", "حقًّا"], a: 1, fix: "الطالبُ", e: "اسم أصبح مرفوع لا منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً في «ليس الكسلُ مفيدٌ».", words: ["ليس", "الكسلُ", "مفيدٌ", "أبدًا"], a: 2, fix: "مفيدًا", e: "خبر ليس منصوب." },
  ],
};

const C16 = {
  id: "c-hamza-mutatarrifa-8", title: "الهمزة المتطرفة", domain: "SP", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يرسم الطالب الهمزة المتطرفة وفق حركة الحرف الذي قبلها، ويميّزها عن الهمزة المتوسطة.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ أن كل همزة هنا في آخر الكلمة. انظر إلى حركة الحرف الذي قبلها لا حركة الهمزة نفسها.",
      table: { head: ["الكلمة", "حركة ما قبل الهمزة", "صورة الهمزة", "السبب"],
        rows: [["تكافؤ", "ضمة", "على واو", "ما قبلها مضموم"], ["شاطئ", "كسرة", "على ياء", "ما قبلها مكسور"],
               ["بدأ", "فتحة", "على ألف", "ما قبلها مفتوح"], ["جزء", "سكون", "على السطر", "ما قبلها ساكن"]] },
      checks: [
        { t: "mcq", q: "على أيّ أساس تُرسم صورة الهمزة المتطرفة؟", o: ["حركة الهمزة نفسها", "حركة الحرف الذي قبلها فقط", "طول الكلمة", "لا قاعدة"], a: 1, e: "خلافًا للمتوسطة (أقوى الحركتين)، المتطرفة تتبع حركة ما قبلها فقط لأنها ساكنة دائمًا في الأصل عند التطرف." },
        { t: "mcq", q: "إذا كان ما قبل الهمزة ساكنًا، فإنها تُرسم:", o: ["على واو", "على ياء", "على ألف", "منفردة على السطر"], a: 3, e: "الهمزة المتطرفة بعد ساكن تُكتب منفردة." }],
      reveal: "استنتجت القاعدة: الهمزة المتطرفة تتبع حركة الحرف الذي قبلها — مضموم فواو، مكسور فياء، مفتوح فألف، ساكن فعلى السطر." },
    { t: "rule", title: "أربع حالات لا خامسة لها", strat: "التمثيل البصري",
      body: "الهمزة المتطرفة همزة في آخر الكلمة، وتُرسم حسب حركة الحرف السابق لها مباشرة، بصرف النظر عن حركة الهمزة نفسها (فهي غالبًا ساكنة عند الوقف أو تُعرَب حسب موقعها).",
      concepts: [{ label: "ما قبلها مضموم", note: "واو (تكافؤ)" }, { label: "ما قبلها مكسور", note: "ياء (شاطئ)" }, { label: "ما قبلها مفتوح", note: "ألف (بدأ)" }, { label: "ما قبلها ساكن", note: "السطر (جزء، دفء)" }],
      note: "إذا كان الساكن قبلها حرف مدّ (ألف أو واو أو ياء ساكنة)، تُكتب أيضًا على السطر بعده: سماء، هدوء، بريء." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الكلمة لترى خطوات تحديد صورة همزتها المتطرفة.",
      items: [
        { w: "لؤلؤ", steps: ["حدّد حركة الحرف قبل الهمزة الأخيرة: ضمة", "طبّق القاعدة: مضموم فواو", "ارسم: لؤلؤ", "الهمزة على واو"] },
        { w: "قارئ", steps: ["حدّد حركة الحرف قبل الهمزة: كسرة", "طبّق القاعدة: مكسور فياء", "ارسم: قارئ", "الهمزة على ياء"] },
        { w: "قرأ", steps: ["حدّد حركة الحرف قبل الهمزة: فتحة", "طبّق القاعدة: مفتوح فألف", "ارسم: قرأ", "الهمزة على ألف"] },
        { w: "دفء", steps: ["حدّد حركة الحرف قبل الهمزة: سكون", "طبّق القاعدة: ساكن فعلى السطر", "ارسم: دفء", "الهمزة منفردة على السطر"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "وزّع الكلمات حسب صورة همزتها المتطرفة.",
      cats: ["على واو", "على ياء", "على ألف", "على السطر"],
      items: [["تكافؤ", "على واو"], ["امتلأ", "على ألف"], ["شاطئ", "على ياء"], ["عبء", "على السطر"],
              ["تباطؤ", "على واو"], ["بدأ", "على ألف"], ["قارئ", "على ياء"], ["جزء", "على السطر"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "انظر إلى حركة الحرف الذي قبل الهمزة المتطرفة مباشرة، وارسمها وفقًا لها: مضموم فواو، مكسور فياء، مفتوح فألف، ساكن فعلى السطر.",
      bullets: ["مضموم ← واو", "مكسور ← ياء", "مفتوح ← ألف", "ساكن ← السطر"],
      note: "الاختبار 25 سؤالًا متنوعًا بكلمات لم ترد في الشرح." },
  ],
  bank: [
    { t: "mcq", sn: "الرسم على واو", q: "الكتابة الصحيحة:", o: ["تباطؤ", "تباطأ", "تباطئ", "تباطء"], a: 0, e: "ما قبل الهمزة مضموم." },
    { t: "mcq", sn: "الرسم على ياء", q: "الكتابة الصحيحة:", o: ["مبتدئ", "مبتدأ", "مبتدؤ", "مبتدء"], a: 0, e: "ما قبل الهمزة مكسور." },
    { t: "mcq", sn: "الرسم على ألف", q: "الكتابة الصحيحة:", o: ["نشأ", "نشئ", "نشؤ", "نشء"], a: 0, e: "ما قبل الهمزة مفتوح." },
    { t: "mcq", sn: "الرسم على السطر", q: "الكتابة الصحيحة:", o: ["عبء", "عبأ", "عبئ", "عبؤ"], a: 0, e: "ما قبل الهمزة ساكن." },
    { t: "mcq", sn: "تطبيق", q: "الكتابة الصحيحة لكلمة أصلها «قرأ» في صيغة اسم الفاعل:", o: ["قارئ", "قارأ", "قارؤ", "قارء"], a: 0, e: "ما قبل الهمزة مكسور (كسرة اسم الفاعل)." },
    { t: "mcq", sn: "تطبيق", q: "الكتابة الصحيحة:", o: ["تفاءل", "تفائل", "تفائول", "تفاول"], a: 0, e: "ما قبل الهمزة مفتوح." },
    { t: "mcq", sn: "التمييز عن المتوسطة", q: "الفارق بين الهمزة المتطرفة والمتوسطة:", o: ["لا فرق", "المتطرفة في آخر الكلمة والمتوسطة في وسطها", "المتطرفة لا تُكتب أبدًا", "المتوسطة فقط تتبع حركة ما قبلها"], a: 1, e: "الموضع هو الفارق الأساسي بينهما." },
    { t: "mcq", sn: "تطبيق", q: "الكتابة الصحيحة:", o: ["يجرؤ", "يجرأ", "يجرئ", "يجرء"], a: 0, e: "ما قبل الهمزة مضموم." },
    { t: "mcq", sn: "بعد حرف المد", q: "الكتابة الصحيحة لكلمة معناها «صوت مرتفع» (من هدأ):", o: ["هدوء", "هدوأ", "هدوئ", "هدوؤ"], a: 0, e: "بعد واو ساكنة (حرف مد) تُكتب على السطر." },
    { t: "mcq", sn: "تطبيق", q: "الكتابة الصحيحة:", o: ["بريء", "بريئ", "بريؤ", "بريأ"], a: 0, e: "بعد ياء ساكنة (حرف مد) تُكتب على السطر." },
    { t: "tf", sn: "القاعدة", q: "الهمزة المتطرفة تتبع حركة الهمزة نفسها لا حركة ما قبلها.", a: false, e: "العكس؛ تتبع حركة ما قبلها." },
    { t: "tf", sn: "تطبيق", q: "«جزء» همزتها على السطر لأن ما قبلها ساكن.", a: true, e: "قاعدة صحيحة." },
    { t: "tf", sn: "تطبيق", q: "«قرأ» همزتها على واو.", a: false, e: "على ألف؛ ما قبلها مفتوح." },
    { t: "tf", sn: "تطبيق", q: "«شاطئ» همزتها على ياء لأن ما قبلها مكسور.", a: true, e: "صحيح." },
    { t: "tf", sn: "حرف المد", q: "إذا كان قبل الهمزة المتطرفة حرف مد ساكن، تُكتب دائمًا على واو.", a: false, e: "تُكتب على السطر بعد حرف المد." },
    { t: "fill", sn: "التصويب", q: "صوّب: «تباطأ نموّ الشركة» إن كان المقصود مصدرًا بمعنى التباطؤ.", a: ["تباطؤ"], e: "ما قبل الهمزة مضموم." },
    { t: "fill", sn: "التصويب", q: "صوّب: «هو قارأ نشيط».", a: ["قارئ"], e: "ما قبل الهمزة مكسور." },
    { t: "fill", sn: "التطبيق", q: "اكتب الفعل الماضي من مادة (ن ش أ) بصيغة الغائب.", a: ["نشأ"], e: "ما قبل الهمزة مفتوح." },
    { t: "fill", sn: "التصويب", q: "صوّب: «شعرتُ بالدفأ».", a: ["الدفء", "دفء"], e: "ما قبل الهمزة ساكن." },
    { t: "fill", sn: "تطبيق", q: "اكتب اسم الفاعل من «بدأ».", a: ["بادئ"], e: "كسرة اسم الفاعل تجعل الهمزة على ياء." },
    { t: "match", sn: "التصنيف", q: "طابق كل كلمة بصورة همزتها.",
      pairs: [["تكافؤ", "على واو"], ["قارئ", "على ياء"], ["بدأ", "على ألف"], ["جزء", "على السطر"]], e: "طبّق قاعدة حركة ما قبل الهمزة." },
    { t: "match", sn: "التعليل", q: "طابق كل كلمة بسبب رسم همزتها.",
      pairs: [["لؤلؤ", "ما قبلها مضموم"], ["شاطئ", "ما قبلها مكسور"], ["نشأ", "ما قبلها مفتوح"], ["عبء", "ما قبلها ساكن"]], e: "أسباب الرسم الأربعة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["شعر", "الطفل", "بالدفأ", "شديدًا"], a: 2, fix: "بالدفء", e: "ما قبل الهمزة ساكن." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["هو", "قارأ", "نشيط", "دائمًا"], a: 1, fix: "قارئ", e: "ما قبل الهمزة مكسور." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["نشئ", "المشروع", "منذ", "عام"], a: 0, fix: "نشأ", e: "ما قبل الهمزة مفتوح." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة.", words: ["لاحظنا", "تباطأ", "في", "الأداء"], a: 1, fix: "تباطؤ", e: "ما قبل الهمزة مضموم (إن قُصد المصدر)." },
  ],
};

const C17 = {
  id: "c-inna-akhawatuha-8", title: "إنّ وأخواتها", domain: "GR", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب إنّ وأخواتها، ويعرب اسمها المنصوب وخبرها المرفوع، ويحدّد دلالة كل حرف منها.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "قارن الجملة قبل دخول «إنّ» وبعده. لاحظ ماذا حدث لإعراب المبتدأ هذه المرة — بعكس ما رأيته مع «كان».",
      table: { head: ["قبل دخول إنّ", "بعد دخول إنّ", "حال الاسم", "حال الخبر"],
        rows: [["الحقُّ منتصرٌ", "إنَّ الحقَّ منتصرٌ", "تحوّل من مرفوع إلى منصوب (اسم إنّ)", "بقي مرفوعًا (خبر إنّ)"],
               ["العلمُ نافعٌ", "لعلَّ العلمَ نافعٌ", "تحوّل إلى منصوب", "بقي مرفوعًا"],
               ["الوقتُ ثمينٌ", "ليت الوقتَ ثمينٌ", "تحوّل إلى منصوب", "بقي مرفوعًا"]] },
      checks: [
        { t: "mcq", q: "ماذا حدث للمبتدأ بعد دخول «إنّ» وأخواتها؟", o: ["بقي مرفوعًا", "تحوّل من مرفوع إلى منصوب", "تحوّل إلى مجرور", "حُذف"], a: 1, e: "عكس أثر كان تمامًا." },
        { t: "mcq", q: "ماذا حدث للخبر؟", o: ["تحوّل إلى منصوب", "بقي مرفوعًا", "تحوّل إلى مجرور", "حُذف"], a: 1, e: "خبر إنّ يبقى مرفوعًا، بعكس خبر كان." }],
      reveal: "استنتجت: إنّ وأخواتها حروف ناسخة تنصب المبتدأ فتُسمّيه اسمها، وترفع الخبر فتُسمّيه خبرها — تمامًا عكس أثر كان وأخواتها." },
    { t: "rule", title: "إنّ وأخواتها ومعانيها", strat: "التمثيل البصري",
      body: "إنّ وأخواتها حروف ناسخة تدخل على الجملة الاسمية، فتنصب المبتدأ اسمًا لها، وترفع الخبر خبرًا لها — عكس كان وأخواتها تمامًا في الأثر الإعرابي.",
      concepts: [{ label: "اسم إنّ", note: "منصوب، هو المبتدأ سابقًا" }, { label: "خبر إنّ", note: "مرفوع، هو الخبر سابقًا" }, { label: "الأثر", note: "عكس أثر كان: نصب الاسم ورفع الخبر" }],
      note: "المعاني: إنّ/أنّ للتوكيد، كأنّ للتشبيه، لكنّ للاستدراك، ليت للتمنّي، لعلّ للترجّي (الأمل فيما يُرجى وقوعه)." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات إعراب اسم إنّ وخبرها.",
      items: [
        { w: "إنَّ العلمَ نورٌ", steps: ["حدّد الحرف الناسخ: إنّ", "الاسم بعده: العلم — منصوب، اسم إنّ", "الخبر: نورٌ — مرفوع، خبر إنّ", "الدلالة: توكيد"] },
        { w: "لكنَّ الطريقَ طويلٌ", steps: ["الحرف الناسخ: لكنّ", "الاسم: الطريق — منصوب، اسم لكنّ", "الخبر: طويلٌ — مرفوع، خبر لكنّ", "الدلالة: استدراك"] },
        { w: "ليت الشبابَ يعودُ", steps: ["الحرف الناسخ: ليت", "الاسم: الشباب — منصوب، اسم ليت", "الخبر: يعود — مرفوع (جملة فعلية)، خبر ليت", "الدلالة: تمنٍّ لأمر مستحيل أو بعيد"] },
        { w: "لعلَّ الفرَجَ قريبٌ", steps: ["الحرف الناسخ: لعلّ", "الاسم: الفرج — منصوب، اسم لعلّ", "الخبر: قريبٌ — مرفوع، خبر لعلّ", "الدلالة: ترجٍّ لأمر ممكن"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل حرف حسب دلالته.",
      cats: ["توكيد", "تمنٍّ أو ترجٍّ", "استدراك أو تشبيه"],
      items: [["إنّ", "توكيد"], ["ليت", "تمنٍّ أو ترجٍّ"], ["لكنّ", "استدراك أو تشبيه"], ["أنّ", "توكيد"],
              ["لعلّ", "تمنٍّ أو ترجٍّ"], ["كأنّ", "استدراك أو تشبيه"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "إنّ وأخواتها تنصب الاسم وترفع الخبر — عكس أثر كان وأخواتها تمامًا.",
      bullets: ["اسم إنّ: منصوب", "خبر إنّ: مرفوع", "من أخواتها: أنّ، كأنّ، لكنّ، ليت، لعلّ", "الأثر: عكس كان تمامًا"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "حكم اسم إنّ", q: "اسم إنّ حكمه الإعرابي:", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 1, e: "عكس اسم كان." },
    { t: "mcq", sn: "حكم خبر إنّ", q: "خبر إنّ حكمه الإعرابي:", o: ["منصوب", "مرفوع", "مجرور", "لا إعراب"], a: 1, e: "يبقى مرفوعًا." },
    { t: "mcq", sn: "تطبيق", q: "في «إنّ الصدقَ منجاةٌ»، اسم إنّ:", o: ["الصدق", "منجاة", "إنّ", "لا اسم"], a: 0, e: "منصوب بالفتحة." },
    { t: "mcq", sn: "دلالة لعلّ", q: "«لعلّ» تفيد:", o: ["التوكيد", "الترجّي (الأمل)", "الاستدراك", "التشبيه"], a: 1, e: "تفيد الرجاء فيما يُتوقّع وقوعه." },
    { t: "mcq", sn: "دلالة ليت", q: "«ليت» تفيد:", o: ["التوكيد", "التمنّي", "الاستدراك", "التشبيه"], a: 1, e: "تمنّي أمر مستحيل أو بعيد الحصول." },
    { t: "mcq", sn: "دلالة لكنّ", q: "«لكنّ» تفيد:", o: ["التوكيد", "التمنّي", "الاستدراك", "الترجّي"], a: 2, e: "الاستدراك بين كلامين." },
    { t: "mcq", sn: "دلالة كأنّ", q: "«كأنّ» تفيد:", o: ["التشبيه", "التوكيد", "الاستدراك", "التمنّي"], a: 0, e: "من أخوات إنّ الدالة على التشبيه." },
    { t: "mcq", sn: "تمييز عن كان", q: "الفارق الجوهري بين إنّ وكان في الأثر الإعرابي:", o: ["لا فرق بينهما", "إنّ تنصب الاسم وترفع الخبر، وكان تفعل العكس", "كلتاهما ترفعان الاسم والخبر", "كلتاهما تنصبان الاسم والخبر"], a: 1, e: "أثران متعاكسان تمامًا." },
    { t: "mcq", sn: "تطبيق", q: "في «أعلم أنَّ النجاحَ قريبٌ»، اسم أنّ:", o: ["النجاح", "قريب", "أعلم", "لا اسم"], a: 0, e: "منصوب." },
    { t: "mcq", sn: "تطبيق", q: "في «كأنَّ القمرَ مصباحٌ»، خبر كأنّ:", o: ["القمر", "مصباح", "كأنّ", "لا خبر"], a: 1, e: "مرفوع." },
    { t: "tf", sn: "حكم اسم إنّ", q: "اسم إنّ مرفوع دائمًا.", a: false, e: "منصوب دائمًا." },
    { t: "tf", sn: "حكم خبر إنّ", q: "خبر إنّ مرفوع دائمًا.", a: true, e: "بعكس خبر كان." },
    { t: "tf", sn: "العكسية", q: "إنّ وأخواتها تفعل عكس ما تفعله كان وأخواتها في الاسم والخبر.", a: true, e: "هذا الفارق الجوهري بينهما." },
    { t: "tf", sn: "دلالة لعلّ وليت", q: "لعلّ وليت كلتاهما تفيدان المعنى نفسه بلا فرق.", a: false, e: "لعلّ للترجّي (الممكن)، وليت للتمنّي (المستحيل أو البعيد)." },
    { t: "tf", sn: "تطبيق", q: "في «إنّ الأملَ باقٍ»، «الأمل» مرفوعة.", a: false, e: "منصوبة؛ اسم إنّ." },
    { t: "fill", sn: "التطبيق", q: "أعرب «الحقَّ» في «إنّ الحقَّ منتصرٌ» (مرفوع أم منصوب).", a: ["منصوب"], e: "اسم إنّ منصوب." },
    { t: "fill", sn: "التطبيق", q: "أعرب «منتصرٌ» في «إنّ الحقَّ منتصرٌ» (مرفوع أم منصوب).", a: ["مرفوع"], e: "خبر إنّ مرفوع." },
    { t: "fill", sn: "التحويل", q: "حوّل «الطريقُ طويلٌ» بإدخال «لكنّ» عليها (اكتب الجملة كاملة).", a: ["لكن الطريق طويل", "لكنَّ الطريقَ طويلٌ"], e: "لكنّ تنصب الاسم وترفع الخبر." },
    { t: "fill", sn: "التطبيق", q: "اكتب حرفًا من أخوات إنّ يفيد التمنّي.", a: ["ليت"], e: "ليت للتمنّي." },
    { t: "fill", sn: "التطبيق", q: "اكتب حرفًا من أخوات إنّ يفيد التشبيه.", a: ["كأن", "كأنّ"], e: "كأنّ للتشبيه." },
    { t: "match", sn: "الإعراب", q: "طابق كل كلمة بحكمها الإعرابي في «إنّ العلمَ نورٌ».",
      pairs: [["العلم", "اسم إنّ منصوب"], ["نور", "خبر إنّ مرفوع"], ["إنّ", "حرف ناسخ"]], e: "ثلاثة عناصر أساسية." },
    { t: "match", sn: "المعنى والحرف", q: "طابق كل حرف بدلالته.",
      pairs: [["إنّ", "توكيد"], ["ليت", "تمنٍّ"], ["لعلّ", "ترجٍّ"], ["لكنّ", "استدراك"]], e: "لكل حرف دلالته الخاصة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً في «إنّ الصدقُ منجاةٌ».", words: ["إنّ", "الصدقُ", "منجاةٌ", "دائمًا"], a: 1, fix: "الصدقَ", e: "اسم إنّ منصوب لا مرفوع." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً في «ليت الشبابَ يعودَ».", words: ["ليت", "الشبابَ", "يعودَ", "يومًا"], a: 2, fix: "يعودُ", e: "خبر ليت (جملة فعلية) فعلها مرفوع لا منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً في «لعلَّ الفرجُ قريبٌ».", words: ["لعلَّ", "الفرجُ", "قريبٌ", "قادم"], a: 1, fix: "الفرجَ", e: "اسم لعلّ منصوب." },
  ],
};

const C18 = {
  id: "c-naat-7", title: "النعت", domain: "GR", grade: 7, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب النعت ومنعوته، ويطابق بينهما في النوع والعدد والتعريف والإعراب.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ الكلمة التي تصف الاسم قبلها، وقارن خصائصها بخصائص الاسم الموصوف.",
      table: { head: ["الجملة", "الاسم الموصوف (المنعوت)", "الصفة (النعت)", "أوجه المطابقة"],
        rows: [["جاء طالبٌ مجتهدٌ", "طالبٌ (مفرد، مذكر، نكرة، مرفوع)", "مجتهدٌ", "مطابق في كل شيء"],
               ["رأيتُ طالبتينِ مجتهدتينِ", "طالبتينِ (مثنى، مؤنث، منصوب)", "مجتهدتينِ", "مطابق في كل شيء"],
               ["سلَّمتُ على الطالبِ المجتهدِ", "الطالبِ (معرفة، مجرور)", "المجتهدِ", "مطابق في التعريف والإعراب"]] },
      checks: [
        { t: "mcq", q: "في كم وجه يطابق النعت منعوته حسب الجدول؟", o: ["وجه واحد فقط", "أربعة أوجه: النوع والعدد والتعريف والإعراب", "لا يطابقه في شيء", "وجهان فقط دائمًا"], a: 1, e: "المطابقة شاملة لهذه الأوجه الأربعة." },
        { t: "mcq", q: "ماذا يحدث لإعراب النعت إذا تغيّر إعراب المنعوت؟", o: ["يبقى ثابتًا", "يتغيّر ليطابق المنعوت", "يُحذف النعت", "لا علاقة بينهما"], a: 1, e: "النعت يتبع منعوته في الإعراب دائمًا." }],
      reveal: "استنتجت: النعت تابع يصف اسمًا قبله (المنعوت) ويطابقه في النوع والعدد والتعريف والتنكير والإعراب." },
    { t: "rule", title: "أوجه المطابقة الأربعة", strat: "التمثيل البصري",
      body: "النعت (الصفة) تابع يصف المنعوت (الموصوف) ويوضّحه، ويجب أن يطابقه في أربعة أوجه معًا: النوع (تذكير/تأنيث)، والعدد (إفراد/تثنية/جمع)، والتعريف والتنكير، والإعراب (رفعًا ونصبًا وجرًّا).",
      concepts: [{ label: "المنعوت", note: "الاسم الموصوف، يأتي أولًا" }, { label: "النعت", note: "الصفة التابعة، تطابقه في أربعة أوجه" }, { label: "التبعية", note: "النعت يتبع منعوته في كل شيء" }],
      note: "قد يكون النعت جملة (اسمية أو فعلية) بعد نكرة: «رأيتُ طائرًا يُغرّد» — «يغرّد» نعت جملة فعلية لـ«طائرًا»." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تحديد النعت ومطابقته.",
      items: [
        { w: "قرأتُ كتابًا مفيدًا", steps: ["حدّد المنعوت: كتابًا (مفرد، مذكر، نكرة، منصوب)", "حدّد النعت: مفيدًا", "تحقّق من المطابقة: مفرد مذكر نكرة منصوب — مطابق تمامًا", "النعت صحيح ومطابق"] },
        { w: "كافأتُ الطالباتِ المتفوّقاتِ", steps: ["حدّد المنعوت: الطالباتِ (جمع، مؤنث، معرفة، منصوب)", "حدّد النعت: المتفوّقاتِ", "تحقّق من المطابقة: جمع مؤنث معرفة منصوب — مطابق", "النعت صحيح ومطابق"] },
        { w: "هذا رجلٌ كريمٌ خُلقُه", steps: ["حدّد المنعوت: رجلٌ (مفرد، مذكر، نكرة، مرفوع)", "حدّد النعت: كريمٌ خُلقُه (نعت سببي — يصف شيئًا متعلقًا بالمنعوت)", "تحقّق: النعت السببي يطابق ما بعده لا المنعوت مباشرة", "نعت سببي صحيح"] },
        { w: "رأيتُ طائرًا يُغرّد", steps: ["حدّد المنعوت: طائرًا (نكرة)", "حدّد النعت: يُغرّد (جملة فعلية)", "تحقّق: النعت الجملة يأتي بعد نكرة ويحتاج رابطًا", "نعت جملة فعلية صحيح"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل عبارة: هل النعت فيها مفرد أم جملة؟",
      cats: ["نعت مفرد", "نعت جملة"],
      items: [["طالبٌ مجتهدٌ", "نعت مفرد"], ["طائرٌ يُغرّد", "نعت جملة"], ["كتابٌ مفيدٌ", "نعت مفرد"], ["رجلٌ يعملُ بجدّ", "نعت جملة"],
              ["بيتٌ واسعٌ", "نعت مفرد"], ["طفلةٌ تبتسمُ", "نعت جملة"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "النعت تابع يصف منعوته، ويطابقه في: النوع، والعدد، والتعريف والتنكير، والإعراب.",
      bullets: ["يطابق في النوع (تذكير/تأنيث)", "يطابق في العدد", "يطابق في التعريف والتنكير", "يطابق في الإعراب"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "تعيين النعت", q: "النعت في «جاء طالبٌ مجتهدٌ»:", o: ["طالب", "مجتهد", "جاء", "لا نعت"], a: 1, e: "الصفة التابعة للمنعوت." },
    { t: "mcq", sn: "أوجه المطابقة", q: "النعت يطابق منعوته في:", o: ["النوع فقط", "العدد فقط", "النوع والعدد والتعريف والإعراب معًا", "لا يطابقه في شيء"], a: 2, e: "المطابقة شاملة لأربعة أوجه." },
    { t: "mcq", sn: "تطبيق", q: "في «رأيتُ طالبتينِ مجتهدتينِ»، إعراب النعت:", o: ["مرفوع", "منصوب مثنى", "مجرور", "لا إعراب"], a: 1, e: "يطابق المنعوت في النصب والتثنية." },
    { t: "mcq", sn: "النعت الجملة", q: "«رأيتُ طائرًا يُغرّد» — نوع النعت:", o: ["مفرد", "جملة فعلية", "جملة اسمية", "شبه جملة"], a: 1, e: "«يغرّد» جملة فعلية نعتية." },
    { t: "mcq", sn: "شرط نعت الجملة", q: "نعت الجملة يأتي بعد:", o: ["معرفة دائمًا", "نكرة دائمًا", "لا شرط", "فعل فقط"], a: 1, e: "يُشترط أن يكون المنعوت نكرة." },
    { t: "mcq", sn: "تطبيق", q: "في «سلّمتُ على الطالبِ المجتهدِ»، إعراب النعت:", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 2, e: "يطابق المنعوت المجرور بحرف الجر." },
    { t: "mcq", sn: "النعت السببي", q: "النعت السببي يصف:", o: ["المنعوت مباشرة", "اسمًا متعلقًا بالمنعوت (كالضمير العائد عليه)", "الفعل فقط", "لا علاقة له بالمنعوت"], a: 1, e: "مثل: رجلٌ كريمٌ خُلقُه — كريم تصف خلقه لا الرجل مباشرة." },
    { t: "mcq", sn: "تطبيق", q: "في «قرأتُ كتبًا مفيدةً»، النعت «مفيدة» يطابق المنعوت في:", o: ["الجمع والتأنيث والتنكير والنصب", "الإفراد فقط", "التذكير فقط", "لا يطابقه"], a: 0, e: "مطابقة شاملة." },
    { t: "mcq", sn: "تمييز", q: "أيّ الجمل نعتها جملة اسمية؟", o: ["رأيتُ رجلًا كريمًا", "رأيتُ رجلًا خُلقُه كريمٌ", "رأيتُ رجلًا يعمل بجدّ", "رأيتُ الرجلَ الكريمَ"], a: 1, e: "«خلقه كريم» جملة اسمية نعتية." },
    { t: "mcq", sn: "تطبيق", q: "«هذا بيتٌ واسعٌ» — منعوت «واسع»:", o: ["هذا", "بيتٌ", "واسعٌ", "لا منعوت"], a: 1, e: "الاسم الموصوف قبل النعت مباشرة." },
    { t: "tf", sn: "التعريف", q: "النعت تابع يصف المنعوت ويطابقه في أربعة أوجه.", a: true, e: "هذا تعريفه الدقيق." },
    { t: "tf", sn: "المطابقة", q: "لا يلزم أن يطابق النعت منعوته في الإعراب.", a: false, e: "يلزم أن يطابقه في الإعراب أيضًا." },
    { t: "tf", sn: "نعت الجملة", q: "نعت الجملة يأتي بعد اسم معرفة.", a: false, e: "يأتي بعد نكرة لا معرفة." },
    { t: "tf", sn: "تطبيق", q: "«طالبٌ مجتهدٌ» النعت فيها مفرد.", a: true, e: "كلمة واحدة تصف المنعوت." },
    { t: "tf", sn: "النعت السببي", q: "النعت السببي يطابق ما بعده لا المنعوت مباشرة في النوع والعدد.", a: true, e: "خاصية النعت السببي." },
    { t: "fill", sn: "تعيين النعت", q: "استخرج النعت من «هذا كتابٌ نافعٌ».", a: ["نافع", "نافعٌ"], e: "الصفة التابعة للمنعوت." },
    { t: "fill", sn: "تعيين المنعوت", q: "استخرج المنعوت من «رأيتُ حديقةً جميلةً».", a: ["حديقة", "حديقةً"], e: "الاسم الموصوف." },
    { t: "fill", sn: "المطابقة", q: "أكمل: النعت يطابق منعوته في النوع والعدد والتعريف و____.", a: ["الاعراب", "الإعراب"], e: "الوجه الرابع للمطابقة." },
    { t: "fill", sn: "التطبيق", q: "اكتب النعت المناسب لـ«طالبات» (جمع مؤنث): الطالبات ____ (اجتهاد).", a: ["المجتهدات", "مجتهدات"], e: "يطابق الجمع والتأنيث." },
    { t: "fill", sn: "تطبيق", q: "صوّب: «كافأتُ الطالبَ المجتهدون» (المنعوت مفرد).", a: ["المجتهد"], e: "يجب مطابقة الإفراد." },
    { t: "match", sn: "المطابقة", q: "طابق كل منعوت بنعته الصحيح.",
      pairs: [["طالبٌ", "مجتهدٌ"], ["طالبتانِ", "مجتهدتانِ"], ["طلابٌ", "مجتهدون"], ["طالباتٌ", "مجتهداتٌ"]], e: "طابق حسب العدد والنوع." },
    { t: "match", sn: "نوع النعت", q: "طابق كل جملة بنوع نعتها.",
      pairs: [["طالبٌ مجتهدٌ", "نعت مفرد"], ["طائرٌ يُغرّد", "نعت جملة فعلية"], ["رجلٌ خُلقُه كريمٌ", "نعت جملة اسمية"], ["بيتٌ واسعٌ", "نعت مفرد"]], e: "ثلاثة أنواع أساسية للنعت." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة غير المطابقة للمنعوت.", words: ["كافأتُ", "الطالبةَ", "المجتهدَ", "بجائزة"], a: 2, fix: "المجتهدةَ", e: "يجب مطابقة التأنيث." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة غير المطابقة للمنعوت.", words: ["رأيتُ", "الطلابَ", "المجتهدةَ", "في الصف"], a: 2, fix: "المجتهدين", e: "يجب مطابقة الجمع والتذكير." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة غير المطابقة للمنعوت.", words: ["سلّمتُ", "على", "الطالبِ", "المجتهدُ"], a: 3, fix: "المجتهدِ", e: "يجب مطابقة الجرّ." },
  ],
};

const C19 = {
  id: "c-hal-8", title: "الحال", domain: "GR", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب الحال في الجملة، ويبيّن أنها اسم نكرة منصوب يصف هيئة صاحبها وقت وقوع الفعل.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ الكلمة التي تصف هيئة صاحبها وقت حدوث الفعل، لا صفة ثابتة له.",
      table: { head: ["الجملة", "صاحب الحال", "الحال", "متى تصحّ الهيئة؟"],
        rows: [["عاد الطالبُ مسرورًا", "الطالب (معرفة)", "مسرورًا", "وقت العودة فقط"], ["رأيتُ الهلالَ ساطعًا", "الهلال (معرفة)", "ساطعًا", "وقت الرؤية فقط"],
               ["أقبل الجيشُ منتصرًا", "الجيش (معرفة)", "منتصرًا", "وقت الإقبال فقط"]] },
      checks: [
        { t: "mcq", q: "ما الذي تصفه الحال بالضبط؟", o: ["صفة ثابتة دائمة لصاحبها", "هيئة صاحبها وقت وقوع الفعل تحديدًا", "نوع صاحبها", "عدد صاحبها"], a: 1, e: "الحال تصف هيئة مؤقتة وقت الفعل، لا صفة دائمة." },
        { t: "mcq", q: "ما حكم صاحب الحال في الأمثلة (معرفة أم نكرة)؟", o: ["نكرة دائمًا", "معرفة غالبًا", "لا فرق", "مجرور دائمًا"], a: 1, e: "صاحب الحال يكون معرفة في الغالب." }],
      reveal: "استنتجت: الحال اسم نكرة منصوب يبيّن هيئة صاحبها (الذي يكون معرفة غالبًا) وقت وقوع الفعل تحديدًا." },
    { t: "rule", title: "الحال وصاحبها", strat: "التمثيل البصري",
      body: "الحال اسم نكرة منصوب، يأتي بعد تمام الكلام (فعل وفاعل، أو فعل ومفعول)، ليبيّن هيئة صاحبها وقت وقوع الفعل تحديدًا لا صفة دائمة له.",
      concepts: [{ label: "الحال", note: "نكرة منصوبة، تصف هيئة مؤقتة" }, { label: "صاحب الحال", note: "معرفة غالبًا، يسبق الحال" }, { label: "الوقتية", note: "الوصف يخصّ لحظة الفعل فقط" }],
      note: "قد تأتي الحال جملة (اسمية أو فعلية) أو شبه جملة: «جاء الطالبُ وهو مسرورٌ» (حال جملة اسمية)، «رأيتُ الطفلَ يلعبُ» (حال جملة فعلية)." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تحديد الحال وصاحبها.",
      items: [
        { w: "عاد الطالبُ مسرورًا", steps: ["حدّد صاحب الحال: الطالب (معرفة)", "حدّد الحال: مسرورًا (نكرة منصوبة)", "تحقّق: تصف هيئته وقت العودة فقط", "حال مفردة صحيحة"] },
        { w: "أقبل الفريقُ يهتفُ بالنصر", steps: ["حدّد صاحب الحال: الفريق (معرفة)", "حدّد الحال: يهتف بالنصر (جملة فعلية)", "تحقّق: تصف هيئته وقت الإقبال", "حال جملة فعلية صحيحة"] },
        { w: "رأيتُ الهلالَ وهو ساطعٌ", steps: ["حدّد صاحب الحال: الهلال (معرفة)", "حدّد الحال: وهو ساطعٌ (جملة اسمية)", "تحقّق: تصف هيئته وقت الرؤية", "حال جملة اسمية صحيحة، والواو رابطة"] },
        { w: "خرج الطلابُ من المدرسةِ مسرعين", steps: ["حدّد صاحب الحال: الطلاب (معرفة)", "حدّد الحال: مسرعين (نكرة منصوبة جمعًا)", "تحقّق: تصف هيئتهم وقت الخروج", "حال مفردة، تطابق الجمع"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة حسب نوع حالها.",
      cats: ["حال مفردة", "حال جملة"],
      items: [["عاد الطالبُ مسرورًا", "حال مفردة"], ["جاء وهو يبتسمُ", "حال جملة"], ["أقبل الجيشُ منتصرًا", "حال مفردة"],
              ["رأيتُ الطفلَ يلعبُ", "حال جملة"], ["خرج الطلابُ مسرعين", "حال مفردة"], ["وصل وقد تعِبَ", "حال جملة"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "الحال اسم نكرة منصوب يصف هيئة صاحبه (المعرفة غالبًا) وقت وقوع الفعل تحديدًا، لا صفة دائمة.",
      bullets: ["الحال: نكرة منصوبة", "صاحب الحال: معرفة غالبًا", "تصف هيئة مؤقتة لا دائمة", "قد تكون مفردة أو جملة"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "حكم الحال", q: "الحال حكمها الإعرابي:", o: ["مرفوعة", "منصوبة", "مجرورة", "لا إعراب لها"], a: 1, e: "اسم نكرة منصوب دائمًا." },
    { t: "mcq", sn: "تعيين الحال", q: "الحال في «عاد الطالبُ مسرورًا»:", o: ["الطالب", "مسرورًا", "عاد", "لا حال"], a: 1, e: "تصف هيئته وقت العودة." },
    { t: "mcq", sn: "حكم صاحب الحال", q: "صاحب الحال يكون غالبًا:", o: ["نكرة", "معرفة", "مجرورًا دائمًا", "لا حكم له"], a: 1, e: "الأصل أن يكون معرفة." },
    { t: "mcq", sn: "الوقتية", q: "الحال تصف:", o: ["صفة ثابتة دائمة", "هيئة مؤقتة وقت الفعل", "نوع صاحبها فقط", "عدد صاحبها فقط"], a: 1, e: "هذا جوهر تعريفها." },
    { t: "mcq", sn: "تطبيق", q: "في «رأيتُ الطفلَ يلعبُ»، نوع الحال:", o: ["مفردة", "جملة فعلية", "جملة اسمية", "شبه جملة"], a: 1, e: "«يلعب» فعل مضارع وفاعله." },
    { t: "mcq", sn: "تطبيق", q: "في «جاء وهو مبتسمٌ»، نوع الحال:", o: ["مفردة", "جملة فعلية", "جملة اسمية", "شبه جملة"], a: 2, e: "«هو مبتسم» جملة اسمية." },
    { t: "mcq", sn: "الرابط", q: "الرابط بين الحال الجملة وصاحبها غالبًا:", o: ["أداة تشبيه", "الواو أو الضمير أو كلاهما", "أداة نفي", "لا رابط ضروري"], a: 1, e: "يربط الحال الجملة بصاحبها." },
    { t: "mcq", sn: "تمييز عن النعت", q: "الفارق بين الحال والنعت:", o: ["لا فرق بينهما", "الحال منصوبة دائمًا وتصف هيئة مؤقتة، والنعت يطابق المنعوت في الإعراب ويصف صفة عامة", "النعت لا يُعرب", "الحال تكون معرفة دائمًا"], a: 1, e: "فارقان أساسيان: الحكم الإعرابي الثابت للحال، والدلالة الوقتية." },
    { t: "mcq", sn: "تطبيق", q: "في «خرج الطلابُ مسرعين»، الحال «مسرعين» تطابق صاحبها في:", o: ["الجمع", "الإفراد", "التأنيث", "لا تطابقه"], a: 0, e: "تطابق الجمع (طلاب)." },
    { t: "mcq", sn: "تطبيق", q: "في «أقبل الجيشُ منتصرًا»، صاحب الحال:", o: ["الجيش", "منتصرًا", "أقبل", "لا صاحب حال"], a: 0, e: "الاسم المعرفة الذي تصف الحال هيئته." },
    { t: "tf", sn: "حكم الحال", q: "الحال مرفوعة دائمًا.", a: false, e: "منصوبة دائمًا." },
    { t: "tf", sn: "صاحب الحال", q: "صاحب الحال يكون نكرة دائمًا.", a: false, e: "معرفة غالبًا." },
    { t: "tf", sn: "الوقتية", q: "الحال تصف صفة دائمة ثابتة لصاحبها.", a: false, e: "تصف هيئة مؤقتة وقت الفعل فقط." },
    { t: "tf", sn: "تطبيق", q: "«عاد الطالبُ مسرورًا» الحال فيها مفردة.", a: true, e: "كلمة واحدة تصف الهيئة." },
    { t: "tf", sn: "تطبيق", q: "«رأيتُ الطفلَ يلعبُ» الحال فيها جملة فعلية.", a: true, e: "«يلعب» جملة فعلية حالية." },
    { t: "fill", sn: "تعيين الحال", q: "استخرج الحال من «أقبل الفريقُ منتصرًا».", a: ["منتصرا", "منتصرًا"], e: "تصف هيئته وقت الإقبال." },
    { t: "fill", sn: "تعيين صاحب الحال", q: "استخرج صاحب الحال من «خرج الطلابُ مسرعين».", a: ["الطلاب"], e: "الاسم المعرفة الذي تصفه الحال." },
    { t: "fill", sn: "التطبيق", q: "أكمل: الحال اسم ____ منصوب يصف هيئة صاحبها وقت الفعل.", a: ["نكرة"], e: "حكمها التنكيري." },
    { t: "fill", sn: "التحويل", q: "حوّل «رأيتُ الهلالَ» بإضافة حال مناسبة تصف هيئته (اكتب كلمة واحدة).", a: ["ساطعا", "ساطعًا", "منيرا", "منيرًا"], e: "أي حال نكرة منصوبة مناسبة تُقبل." },
    { t: "fill", sn: "تطبيق", q: "صوّب: «عاد الطالبُ مسرورٌ» (اضبط الحال).", a: ["مسرورا", "مسرورًا"], e: "الحال منصوبة لا مرفوعة." },
    { t: "match", sn: "الحال وصاحبها", q: "طابق كل جملة بالحال فيها.",
      pairs: [["عاد الطالبُ مسرورًا", "مسرورًا"], ["أقبل الجيشُ منتصرًا", "منتصرًا"], ["خرج الطلابُ مسرعين", "مسرعين"], ["رجع مبتهجًا", "مبتهجًا"]], e: "الحال تصف هيئة صاحبها." },
    { t: "match", sn: "نوع الحال", q: "طابق كل جملة بنوع حالها.",
      pairs: [["عاد مسرورًا", "حال مفردة"], ["جاء يبتسمُ", "حال جملة فعلية"], ["وصل وهو متعَبٌ", "حال جملة اسمية"], ["خرج مسرعًا", "حال مفردة"]], e: "أنواع الحال الثلاثة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً في «عاد الطالبُ مسرورٌ».", words: ["عاد", "الطالبُ", "مسرورٌ", "اليوم"], a: 2, fix: "مسرورًا", e: "الحال منصوبة لا مرفوعة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً في «أقبل الجيشُ منتصرٌ».", words: ["أقبل", "الجيشُ", "منتصرٌ", "أخيرًا"], a: 2, fix: "منتصرًا", e: "الحال منصوبة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً في «خرج الطلابُ مسرعون».", words: ["خرج", "الطلابُ", "مسرعون", "بسرعة"], a: 2, fix: "مسرعين", e: "الحال منصوبة، وجمعها بالياء والنون لا بالواو." },
  ],
};

const C20 = {
  id: "c-tashbih-tamthili-10", title: "التشبيه التمثيلي", domain: "RH", grade: 10, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب التشبيه التمثيلي بوجه شبهه المنتزع من صورة مركّبة، ويفرّقه عن التشبيه المفرد البسيط.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "قارن وجه الشبه في كل مثال: هل هو صفة واحدة بسيطة، أم صورة مركّبة من عدة عناصر مجتمعة؟",
      table: { head: ["الجملة", "المشبَّه", "المشبَّه به", "وجه الشبه"],
        rows: [["الطالبُ كالأسدِ", "الطالب", "الأسد", "صفة مفردة: الشجاعة"],
               ["العلمُ في الصِّغَر كالنقشِ في الحَجَر", "ثبات العلم إذا تعلّمه الصغير", "ثبات النقش في الحجر", "صورة مركّبة: الرسوخ والدوام معًا لا صفة واحدة"],
               ["المجتهدُ كالنحلةِ تجني من كل زهرة رحيقًا مفيدًا", "حال من يجمع الفائدة من كل مصدر", "حال النحلة وهي تجمع الرحيق من الأزهار", "صورة مركّبة: الحركة الدائبة وجمع الفائدة من متعدد"]] },
      checks: [
        { t: "mcq", q: "ما الفارق بين وجه الشبه في المثال الأول ووجه الشبه في الثاني والثالث؟", o: ["لا فرق", "الأول صفة مفردة بسيطة، والآخران صورة مركّبة من عناصر متعددة", "الأول أطول", "لا وجه شبه في أي منها"], a: 1, e: "هذا الفارق الجوهري الذي يميّز التشبيه التمثيلي." },
        { t: "mcq", q: "التشبيه التمثيلي يُشبَّه فيه غالبًا:", o: ["مفرد بمفرد", "حال (هيئة مركّبة) بحال أخرى مشابهة", "حرف بحرف", "لا علاقة بالحال"], a: 1, e: "يقارن هيئتين مركّبتين لا صفتين مفردتين." }],
      reveal: "استنتجت تعريف التشبيه التمثيلي: تشبيه وجه الشبه فيه صورة منتزعة من متعدد (مركّبة من عدة عناصر مجتمعة)، لا صفة مفردة بسيطة كالشجاعة أو الجمال." },
    { t: "rule", title: "الصورة المركّبة", strat: "التمثيل البصري",
      body: "التشبيه التمثيلي تشبيه يكون وجه الشبه فيه صورة منتزعة من متعدد — أي لا يمكن اختزالها في كلمة واحدة كـ«الشجاعة» أو «الجمال»، بل هي هيئة مركّبة من عدة عناصر مجتمعة تُدرَك بالتأمل.",
      concepts: [{ label: "وجه الشبه المركّب", note: "صورة من عدة عناصر لا صفة مفردة" }, { label: "مقارنة حالين", note: "لا مفرد بمفرد غالبًا" }, { label: "المقابل", note: "التشبيه المفرد (كالأسد شجاعةً) وجه شبهه بسيط" }],
      note: "اختبار عملي: اسأل نفسك «هل أستطيع تلخيص وجه الشبه في كلمة واحدة؟» — إن كانت الإجابة لا، وتحتاج جملة كاملة لوصفه، فالتشبيه تمثيلي." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات الكشف عن التشبيه التمثيلي.",
      items: [
        { w: "العلمُ في الصِّغَر كالنقشِ في الحَجَر", steps: ["حدّد المشبَّه والمشبَّه به: العلم في الصغر / النقش في الحجر", "حاول تلخيص وجه الشبه في كلمة واحدة: يصعب ذلك", "وجه الشبه صورة مركّبة: الرسوخ + الديمومة + صعوبة التغيير", "تشبيه تمثيلي"] },
        { w: "الأمّةُ المتفرقةُ كبنيانٍ تصدّعت أركانه فانهار", steps: ["حدّد الطرفين: الأمة المتفرقة / بنيان متصدّع", "حاول تلخيص وجه الشبه بكلمة واحدة: يصعب ذلك", "وجه الشبه صورة مركّبة: التصدّع + ضعف الأركان + الانهيار", "تشبيه تمثيلي"] },
        { w: "الحكيمُ بين الجهّال كالسراج في الظلام يهتدي به الحائرون", steps: ["حدّد الطرفين: الحكيم بين الجهال / سراج في الظلام", "حاول تلخيص وجه الشبه بكلمة واحدة: يصعب ذلك", "وجه الشبه صورة مركّبة: الإضاءة + الهداية + بيئة الظلام", "تشبيه تمثيلي"] },
        { w: "الطالبُ كالأسدِ شجاعةً", steps: ["حدّد الطرفين: الطالب / الأسد", "حاول تلخيص وجه الشبه بكلمة واحدة: الشجاعة", "وجه الشبه صفة مفردة بسيطة", "تشبيه مفرد عادي، لا تمثيلي"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة: هل وجه الشبه فيها مفرد بسيط أم صورة مركّبة؟",
      cats: ["تشبيه تمثيلي (صورة مركّبة)", "تشبيه مفرد (صفة بسيطة)"],
      items: [["العلمُ في الصِّغَر كالنقشِ في الحَجَر", "تشبيه تمثيلي (صورة مركّبة)"], ["الوجهُ كالبدرِ", "تشبيه مفرد (صفة بسيطة)"],
              ["المجتهدُ كالنحلةِ تجني من كل زهرة رحيقًا", "تشبيه تمثيلي (صورة مركّبة)"], ["الماءُ كالثلجِ برودةً", "تشبيه مفرد (صفة بسيطة)"],
              ["الحكيمُ كالسراج في الظلام يهدي الحائرين", "تشبيه تمثيلي (صورة مركّبة)"], ["الخدُّ كالوردةِ", "تشبيه مفرد (صفة بسيطة)"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "التشبيه التمثيلي: وجه الشبه فيه صورة منتزعة من متعدد، لا صفة مفردة بسيطة. يقارن غالبًا حالًا بحال.",
      bullets: ["وجه الشبه: صورة مركّبة", "لا يُلخَّص بكلمة واحدة", "يقارن حالين غالبًا", "المقابل: التشبيه المفرد البسيط"],
      note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." },
  ],
  bank: [
    { t: "mcq", sn: "تعريف التمثيلي", q: "التشبيه التمثيلي وجه الشبه فيه:", o: ["صفة مفردة بسيطة", "صورة منتزعة من متعدد (مركّبة)", "لا وجه شبه فيه", "أداة تشبيه محذوفة"], a: 1, e: "هذا تعريفه الدقيق." },
    { t: "mcq", sn: "الاختبار العملي", q: "كيف تختبر أن التشبيه تمثيلي؟", o: ["عدّ كلمات الجملة", "حاول تلخيص وجه الشبه بكلمة واحدة؛ إن تعذّر فهو تمثيلي", "ابحث عن الأداة فقط", "لا اختبار ممكن"], a: 1, e: "هذا الاختبار العملي الأدق." },
    { t: "mcq", sn: "تطبيق", q: "«العلمُ في الصِّغَر كالنقشِ في الحَجَر» — نوع التشبيه:", o: ["مفرد بسيط", "تمثيلي", "استعارة مكنية", "طباق"], a: 1, e: "وجه الشبه صورة مركّبة يصعب اختزالها." },
    { t: "mcq", sn: "تطبيق", q: "«الوجهُ كالبدرِ» — نوع التشبيه:", o: ["تمثيلي", "مفرد بسيط، وجه الشبه: الإشراق أو الجمال", "استعارة", "طباق"], a: 1, e: "وجه الشبه يُلخَّص بكلمة واحدة." },
    { t: "mcq", sn: "المقارنة", q: "التشبيه التمثيلي يقارن غالبًا بين:", o: ["كلمتين مفردتين", "حالين (هيئتين مركّبتين)", "حرفين", "لا مقارنة فيه"], a: 1, e: "يقارن هيئة مركّبة بأخرى مشابهة." },
    { t: "mcq", sn: "تطبيق", q: "«الأمّةُ المتفرقةُ كبنيانٍ تصدّعت أركانه» — نوع التشبيه:", o: ["مفرد بسيط", "تمثيلي", "طباق", "مقابلة"], a: 1, e: "وجه الشبه صورة مركّبة (التصدّع، ضعف الأركان، الانهيار)." },
    { t: "mcq", sn: "تمييز", q: "أيّ الجمل تشبيهها مفرد لا تمثيلي؟", o: ["الحكيمُ كالسراج في الظلام يهدي الحائرين", "الخدّ كالوردةِ", "المجتهدُ كالنحلةِ تجني من كل زهرة", "العلمُ في الصِّغَر كالنقشِ في الحَجَر"], a: 1, e: "«الخدّ كالوردة» وجه شبهها بسيط (النضارة أو الحمرة)." },
    { t: "mcq", sn: "الأثر البلاغي", q: "الأثر البلاغي للتشبيه التمثيلي:", o: ["يُقرّب المعنى المجرّد المركّب بصورة حسّية شاملة", "يُبسّط المعنى فقط", "لا أثر له", "يُطيل الجملة بلا فائدة"], a: 0, e: "يُجسّد معنى معقدًا في صورة واحدة متكاملة." },
    { t: "mcq", sn: "تطبيق", q: "«المجتهدُ كالنحلةِ تجني من كل زهرة رحيقًا مفيدًا» — وجه الشبه:", o: ["اللون", "الحركة الدائبة وجمع الفائدة من مصادر متعددة", "الحجم", "الصوت"], a: 1, e: "صورة مركّبة من عدة عناصر." },
    { t: "mcq", sn: "تطبيق", q: "أيّ وجه شبه أقرب إلى «التمثيلي»؟", o: ["الشجاعة", "البياض", "أن يبني إنسانٌ بيتًا بلا أساس فينهار سريعًا", "السرعة"], a: 2, e: "صورة مركّبة من عدة عناصر مجتمعة." },
    { t: "tf", sn: "التعريف", q: "وجه الشبه في التشبيه التمثيلي صفة مفردة بسيطة.", a: false, e: "هو صورة مركّبة من متعدد." },
    { t: "tf", sn: "الاختبار", q: "إذا تعذّر تلخيص وجه الشبه بكلمة واحدة، فالتشبيه غالبًا تمثيلي.", a: true, e: "هذا الاختبار العملي الأساسي." },
    { t: "tf", sn: "تطبيق", q: "«الطالبُ كالأسدِ شجاعةً» تشبيه تمثيلي.", a: false, e: "وجه شبهه بسيط (الشجاعة)، فهو تشبيه مفرد." },
    { t: "tf", sn: "تطبيق", q: "«العلمُ في الصِّغَر كالنقشِ في الحَجَر» تشبيه تمثيلي.", a: true, e: "وجه الشبه صورة مركّبة." },
    { t: "tf", sn: "المقارنة", q: "التشبيه التمثيلي يقارن غالبًا مفردًا بمفرد لا حالًا بحال.", a: false, e: "يقارن حالًا بحال غالبًا." },
    { t: "fill", sn: "تحديد وجه الشبه", q: "في «الحكيمُ كالسراج في الظلام يهدي الحائرين»، صف وجه الشبه بجملة قصيرة.", a: ["الاضاءة والهداية", "الإضاءة والهداية", "الهداية في الظلام"], e: "صورة مركّبة من الإضاءة والهداية معًا." },
    { t: "fill", sn: "تحديد النوع", q: "«المجتهدُ كالنحلةِ تجني من كل زهرة رحيقًا» — اكتب نوع التشبيه (كلمة واحدة).", a: ["تمثيلي"], e: "وجه الشبه صورة مركّبة." },
    { t: "fill", sn: "التطبيق", q: "أكمل: التشبيه التمثيلي وجه شبهه صورة ____ من متعدد.", a: ["منتزعة"], e: "هذا تعريفه الدقيق." },
    { t: "fill", sn: "تمييز", q: "اكتب نوع تشبيه «الوجه كالبدر» (كلمتان).", a: ["تشبيه مفرد"], e: "وجه شبهه بسيط يُلخَّص بكلمة." },
    { t: "match", sn: "التصنيف", q: "طابق كل جملة بنوع تشبيهها.",
      pairs: [["العلمُ في الصِّغَر كالنقشِ في الحَجَر", "تمثيلي"], ["الوجهُ كالبدرِ", "مفرد بسيط"], ["الحكيمُ كالسراج يهدي الحائرين", "تمثيلي"], ["الماءُ كالثلجِ بردًا", "مفرد بسيط"]], e: "طبّق اختبار تلخيص وجه الشبه." },
    { t: "match", sn: "وجه الشبه", q: "طابق كل جملة بوصف وجه شبهها.",
      pairs: [["العلمُ في الصِّغَر كالنقشِ في الحَجَر", "الرسوخ والديمومة"], ["المجتهدُ كالنحلةِ", "الحركة الدائبة وجمع الفائدة"], ["الأمّةُ المتفرقةُ كبنيانٍ متصدّع", "التصدّع والانهيار"]], e: "صور مركّبة من عدة عناصر." },
    { t: "mcq", sn: "تطبيق", q: "«الظالمُ كالنارِ تأكل بعضها بعضًا» — نوع التشبيه:", o: ["مفرد بسيط", "تمثيلي، وجه الشبه صورة الفناء الذاتي", "استعارة مكنية", "طباق"], a: 1, e: "وجه الشبه صورة مركّبة يصعب اختزالها بكلمة واحدة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تمثّل المشبَّه به في تشبيه تمثيلي.", words: ["العلمُ", "في", "الصِّغَر", "كالنقشِ"], a: 3, fix: "كالنقشِ في الحَجَر", e: "المشبَّه به هو النقش في الحجر، صورة مركّبة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تدلّ على وجود صورة مركّبة لا صفة مفردة.", words: ["الحكيمُ", "كالسراجِ", "في", "الظلامِ"], a: 3, fix: "في الظلامِ يهدي الحائرين", e: "السياق الكامل يُظهر الصورة المركّبة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الجزء الذي يمثّل وجه الشبه المركّب في «الأمّة المتفرقة كبنيان تصدّعت أركانه فانهار».", words: ["الأمّة", "المتفرقة", "تصدّعت", "أركانه فانهار"], a: 3, fix: "تصدّعت أركانه فانهار (وجه الشبه)", e: "صورة الانهيار الكاملة هي وجه الشبه المركّب." },
  ],
};

const C21 = {
  id: "c-tashbih-dimni-11", title: "التشبيه الضمني", domain: "RH", grade: 11, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يكشف الطالب التشبيه الضمني من غياب أداة التشبيه وصيغته المباشرة، ويدرك وظيفته في تقرير إمكان المعنى.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "ابحث في كل مثال عن أداة تشبيه ظاهرة (كـ، مثل، كأنّ) وعن صيغة مباشرة «المشبَّه كالمشبَّه به». هل تجدها؟",
      table: { head: ["الجملة", "أداة تشبيه ظاهرة؟", "صيغة مباشرة؟", "كيف نفهم التشبيه؟"],
        rows: [["من يتهاون في صغار الأمور يتهاون في كبارها، وهل يُحسن البناء من لم يُحكم أساسه؟", "لا", "لا", "من تجاور الحكمين: التهاون في الصغائر يشبه ضعف الأساس"],
               ["لا يُفلح الكسول في عمله، وهل يُثمر غرسٌ لم يُسقَ؟", "لا", "لا", "من تجاور الحكمين: الكسل يشبه عدم سقي الغرس"],
               ["الصبرُ مفتاح الفرج، وهل يُفتح بابٌ مغلقٌ إلا بمفتاحه؟", "لا", "لا", "من تجاور الحكمين: الصبر يشبه المفتاح اللازم لفتح الباب"]] },
      checks: [
        { t: "mcq", q: "ما المشترك بين الأمثلة الثلاثة من حيث الأداة والصيغة؟", o: ["كلها فيها أداة تشبيه ظاهرة", "لا أداة ظاهرة ولا صيغة تشبيه مباشرة في أي منها", "كلها بصيغة كأنّ", "لا علاقة بينها"], a: 1, e: "هذا ما يميّز التشبيه الضمني عن كل أنواع التشبيه الأخرى." },
        { t: "mcq", q: "كيف يُدرك القارئ التشبيه رغم غياب الأداة والصيغة المباشرة؟", o: ["لا يُدرَك إطلاقًا", "من مجاورة حكمين متشابهين في المعنى يوضّح أحدهما الآخر", "من طول الجملة", "من عدد الكلمات"], a: 1, e: "التجاور بين الحكمين يوحي بالعلاقة التشبيهية ضمنًا." }],
      reveal: "استنتجت تعريف التشبيه الضمني: تشبيه لا تُذكر فيه أداة ولا يُصرَّح بصيغة تشبيه مباشرة، بل يُفهم من مجاورة حكمين يقرّر أحدهما إمكان الآخر أو يوضّحه." },
    { t: "rule", title: "التشبيه الذي يختفي شكله وتبقى وظيفته", strat: "التمثيل البصري",
      body: "التشبيه الضمني تشبيه لا تظهر فيه أداة تشبيه ولا صيغة «المشبَّه كالمشبَّه به» المباشرة؛ بل يُساق الكلام في حكمين متجاورين: الأول يحمل المعنى المراد إثباته، والثاني مثال أو حكم مألوف يقرّر إمكان الأول ضمنًا.",
      concepts: [{ label: "غياب الأداة والصيغة", note: "لا كـ، لا مثل، لا كأنّ، ولا تركيب تشبيهي ظاهر" }, { label: "التجاور", note: "حكمان متجاوران يوضّح أحدهما الآخر" }, { label: "الوظيفة", note: "تقرير إمكان المعنى أو توكيده بمثال مألوف" }],
      note: "غالبًا ما يأتي الحكم الثاني في صورة سؤال استنكاري (وهل…؟) يقرّر استحالة نقيض المعنى الأول، فيثبته ضمنًا." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات الكشف عن التشبيه الضمني.",
      items: [
        { w: "من يتهاون في صغار الأمور يتهاون في كبارها، وهل يُحسن البناء من لم يُحكم أساسه؟", steps: ["ابحث عن أداة تشبيه ظاهرة: لا توجد", "ابحث عن صيغة مباشرة: لا توجد", "لاحظ الحكمين المتجاورين: التهاون بالصغائر / ضعف الأساس", "تشبيه ضمني: ضعف الأساس يُثبت أن التهاون بالصغائر يهدم الكبائر"] },
        { w: "لا يُفلح الكسول في عمله، وهل يُثمر غرسٌ لم يُسقَ؟", steps: ["ابحث عن أداة تشبيه ظاهرة: لا توجد", "ابحث عن صيغة مباشرة: لا توجد", "لاحظ الحكمين: فشل الكسول / عدم إثمار الغرس بلا سقي", "تشبيه ضمني: عدم إثمار الغرس يقرّر فشل الكسول"] },
        { w: "الصبرُ مفتاح الفرج، وهل يُفتح بابٌ مغلقٌ إلا بمفتاحه؟", steps: ["ابحث عن أداة تشبيه ظاهرة: لا توجد", "ابحث عن صيغة مباشرة: لا توجد", "لاحظ الحكمين: الصبر سبب الفرج / المفتاح سبب فتح الباب", "تشبيه ضمني: ضرورة المفتاح تقرّر ضرورة الصبر"] },
        { w: "الطالبُ المجتهدُ كالنجمِ يُضيء طريق زملائه", steps: ["ابحث عن أداة تشبيه ظاهرة: «كـ» موجودة", "ابحث عن صيغة مباشرة: «المشبَّه كالمشبَّه به» موجودة", "هذا تشبيه صريح مباشر لا ضمني", "ليس تشبيهًا ضمنيًّا"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة: هل تشبيهها ضمني أم صريح (بأداة وصيغة مباشرة)؟",
      cats: ["تشبيه ضمني", "تشبيه صريح"],
      items: [["من يتهاون في صغار الأمور يتهاون في كبارها، وهل يُحسن البناء من لم يُحكم أساسه؟", "تشبيه ضمني"],
              ["الطالبُ كالأسدِ شجاعةً", "تشبيه صريح"],
              ["لا يُفلح الكسول، وهل يُثمر غرسٌ لم يُسقَ؟", "تشبيه ضمني"],
              ["العلمُ كالنورِ يهدي", "تشبيه صريح"],
              ["الصبرُ مفتاح الفرج، وهل يُفتح بابٌ إلا بمفتاحه؟", "تشبيه ضمني"],
              ["الوجهُ كالبدرِ", "تشبيه صريح"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "التشبيه الضمني: لا أداة ظاهرة ولا صيغة تشبيه مباشرة، بل حكمان متجاوران يقرّر أحدهما إمكان الآخر أو يوضّحه.",
      bullets: ["لا أداة تشبيه ظاهرة", "لا صيغة «المشبَّه كالمشبَّه به»", "حكمان متجاوران", "الوظيفة: تقرير إمكان المعنى"],
      note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." },
  ],
  bank: [
    { t: "mcq", sn: "تعريف الضمني", q: "التشبيه الضمني يُميَّز بـ:", o: ["أداة تشبيه ظاهرة", "غياب الأداة والصيغة المباشرة، وفهمه من تجاور حكمين", "تكرار المشبَّه", "طول الجملة"], a: 1, e: "هذا تعريفه الدقيق." },
    { t: "mcq", sn: "الوظيفة", q: "الوظيفة الأساسية للتشبيه الضمني:", o: ["الزخرفة اللفظية فقط", "تقرير إمكان المعنى المدَّعى أو توكيده بمثال مألوف", "الإطالة", "لا وظيفة له"], a: 1, e: "يقرّب المعنى بمثال يقبله كل عقل." },
    { t: "mcq", sn: "تمييز", q: "ما الذي يميّزه عن كل أنواع التشبيه الأخرى؟", o: ["طوله", "غياب الأداة والصيغة التشبيهية المباشرة معًا", "استعماله في الشعر فقط", "لا فرق"], a: 1, e: "هذا الفارق الجوهري." },
    { t: "mcq", sn: "تطبيق", q: "«لا يُفلح الكسول، وهل يُثمر غرسٌ لم يُسقَ؟» — نوع التشبيه:", o: ["صريح", "ضمني", "استعارة تصريحية", "طباق"], a: 1, e: "لا أداة ولا صيغة مباشرة؛ يُفهم من تجاور الحكمين." },
    { t: "mcq", sn: "الصيغة الشائعة", q: "غالبًا ما يأتي الحكم الثاني في التشبيه الضمني في صورة:", o: ["نداء", "سؤال استنكاري يقرّر استحالة النقيض", "أمر", "تعجب فقط"], a: 1, e: "أسلوب شائع لتقرير المعنى ضمنًا." },
    { t: "mcq", sn: "تمييز", q: "أيّ الجمل فيها تشبيه ضمني؟", o: ["العلمُ كالنورِ يهدي", "الصبرُ مفتاح الفرج، وهل يُفتح بابٌ إلا بمفتاحه؟", "الطالبُ كالأسدِ شجاعةً", "الوجهُ كالبدرِ"], a: 1, e: "لا أداة ولا صيغة مباشرة فيها، والمعنى يُفهم بالتجاور." },
    { t: "mcq", sn: "تطبيق", q: "لماذا لا يُعدّ «الطالبُ كالنجمِ يُضيء طريق زملائه» تشبيهًا ضمنيًّا؟", o: ["لأنه قصير", "لوجود أداة التشبيه «كـ» وصيغة مباشرة", "لأنه عن الطلاب", "لا سبب"], a: 1, e: "التشبيه الضمني يخلو من الأداة والصيغة المباشرة معًا." },
    { t: "mcq", sn: "الأثر البلاغي", q: "الأثر البلاغي للتشبيه الضمني:", o: ["إثبات المعنى بمثال بديهي يصعب إنكاره", "إخفاء المعنى تمامًا", "لا أثر يُذكر", "تعقيد الجملة فقط"], a: 0, e: "يجعل المعنى مقنعًا لا يقبل الجدل." },
    { t: "mcq", sn: "تطبيق", q: "«من يتهاون في صغار الأمور يتهاون في كبارها، وهل يُحسن البناء من لم يُحكم أساسه؟» — الحكم الأول هو:", o: ["ضعف الأساس يهدم البناء", "التهاون في صغار الأمور يؤدي للتهاون في كبارها", "لا حكم في الجملة", "البناء وحده"], a: 1, e: "الحكم الأول هو المعنى المراد إثباته." },
    { t: "mcq", sn: "تطبيق", q: "في المثال السابق، الحكم الثاني (المثال المقرِّر) هو:", o: ["التهاون في الصغائر", "ضعف الأساس يمنع إحسان البناء", "الكبائر", "لا حكم ثانٍ"], a: 1, e: "هو المثال المألوف الذي يقرّر إمكان الحكم الأول." },
    { t: "tf", sn: "التعريف", q: "التشبيه الضمني تُذكر فيه أداة التشبيه صراحة.", a: false, e: "لا أداة ظاهرة فيه إطلاقًا." },
    { t: "tf", sn: "الصيغة", q: "التشبيه الضمني يُصاغ بتركيب «المشبَّه كالمشبَّه به» المباشر.", a: false, e: "يخلو من هذا التركيب المباشر." },
    { t: "tf", sn: "الوظيفة", q: "التشبيه الضمني يُستعمل غالبًا لتقرير إمكان معنى مدَّعى.", a: true, e: "هذه وظيفته الأساسية." },
    { t: "tf", sn: "تطبيق", q: "«الصبرُ مفتاح الفرج، وهل يُفتح بابٌ إلا بمفتاحه؟» تشبيه ضمني.", a: true, e: "لا أداة ولا صيغة مباشرة، والمعنى يُفهم بالتجاور." },
    { t: "tf", sn: "تمييز", q: "كل تشبيه لا أداة فيه يُعدّ ضمنيًّا تلقائيًّا.", a: false, e: "يجب أيضًا غياب الصيغة المباشرة وتحقّق شرط تجاور الحكمين المتناظرين." },
    { t: "fill", sn: "استخراج الحكمين", q: "في «لا يُفلح الكسول، وهل يُثمر غرسٌ لم يُسقَ؟»، اكتب الحكم الأول (المعنى المراد إثباته) بإيجاز.", a: ["الكسول لا يفلح", "فشل الكسول", "عدم فلاح الكسول"], e: "الحكم الأول هو ما يريد الكاتب إثباته." },
    { t: "fill", sn: "استخراج المثال المقرِّر", q: "في المثال السابق، اكتب الحكم الثاني (المثال المقرِّر) بإيجاز.", a: ["الغرس لا يثمر بلا سقي", "عدم إثمار الغرس بلا ماء"], e: "المثال البديهي الذي يقرّر إمكان الحكم الأول." },
    { t: "fill", sn: "التطبيق", q: "أكمل: التشبيه الضمني يُفهم من ____ حكمين لا من أداة أو صيغة ظاهرة.", a: ["تجاور", "مجاورة"], e: "هذا جوهر تعريفه." },
    { t: "fill", sn: "تطبيق", q: "اكتب نوع تشبيه «العلمُ كالنورِ يهدي» (كلمتان).", a: ["تشبيه صريح"], e: "لوجود الأداة والصيغة المباشرة." },
    { t: "match", sn: "الحكمان", q: "طابق كل مثال بحكمه الثاني (المقرِّر).",
      pairs: [["لا يُفلح الكسول", "وهل يُثمر غرسٌ لم يُسقَ؟"], ["من يتهاون في الصغائر يتهاون في الكبائر", "وهل يُحسن البناء من لم يُحكم أساسه؟"], ["الصبرُ مفتاح الفرج", "وهل يُفتح بابٌ إلا بمفتاحه؟"]], e: "الحكم الثاني يقرّر إمكان الأول." },
    { t: "match", sn: "التصنيف", q: "طابق كل جملة بنوع تشبيهها.",
      pairs: [["العلمُ كالنورِ يهدي", "تشبيه صريح"], ["لا يُفلح الكسول، وهل يُثمر غرسٌ لم يُسقَ؟", "تشبيه ضمني"], ["الطالبُ كالأسدِ", "تشبيه صريح"], ["الصبرُ مفتاح الفرج، وهل يُفتح بابٌ إلا بمفتاحه؟", "تشبيه ضمني"]], e: "غياب الأداة والصيغة المباشرة هو الفيصل." },
    { t: "mcq", sn: "تطبيق", q: "«لا يبني مجدًا من يستحي من العمل، وهل يشبع من يستحي من الطعام؟» — نوع التشبيه:", o: ["صريح", "ضمني", "استعارة تصريحية", "مقابلة"], a: 1, e: "لا أداة ولا صيغة مباشرة؛ يُفهم من تجاور الحكمين." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي لو أُضيفت لجعلت الجملة تشبيهًا صريحًا لا ضمنيًّا.", words: ["الصبرُ", "مفتاح", "الفرج", "دائمًا"], a: 1, fix: "كمفتاح (بإضافة أداة التشبيه)", e: "إضافة الأداة تحوّله لتشبيه صريح." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الجزء الذي يمثّل الحكم الثاني المقرِّر في الجملة.", words: ["لا", "يُفلح", "الكسول", "وهل يُثمر غرسٌ لم يُسقَ"], a: 3, fix: "وهل يُثمر غرسٌ لم يُسقَ (الحكم الثاني)", e: "هذا الجزء هو المثال المقرِّر للحكم الأول." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الجزء الذي يمثّل الحكم الأول (المعنى المراد إثباته).", words: ["من", "يتهاون في الصغائر يتهاون في الكبائر", "وهل", "يُحسن البناء من لم يُحكم أساسه"], a: 1, fix: "يتهاون في الصغائر يتهاون في الكبائر (الحكم الأول)", e: "هذا هو المعنى المراد إثباته." },
  ],
};

const C22 = {
  id: "c-hadf-alif-7", title: "حذف الألف وزيادتها", domain: "SP", grade: 7, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يكتب الطالب الكلمات المحفوظة التي تُحذف منها الألف أو تُزاد فيها رغم عدم نطقها.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ كل كلمة: هل تُنطق فيها الألف الظاهرة في الكتابة؟ وهل هناك ألف تُنطق ولا تُكتب؟",
      table: { head: ["الكلمة", "تُنطق ألف؟", "تُكتب ألف؟", "الظاهرة"],
        rows: [["هذا", "نعم تُنطق", "لا تُكتب", "ألف محذوفة خطًّا رغم نطقها"], ["الرحمن", "نعم تُنطق", "لا تُكتب", "ألف محذوفة خطًّا"],
               ["مائة", "لا تُنطق", "تُكتب", "ألف زائدة تُكتب ولا تُنطق"], ["عمرو", "لا تُنطق واوها", "تُكتب واو زائدة", "زيادة للتمييز عن عمر"]] },
      checks: [
        { t: "mcq", q: "ماذا لاحظت في «هذا» و«الرحمن»؟", o: ["الألف تُنطق وتُكتب معًا", "الألف تُنطق لكنها لا تُكتب — حذف استثنائي محفوظ", "لا ألف فيهما أصلًا", "الألف تُكتب ولا تُنطق"], a: 1, e: "كلمات معدودة محفوظة يُحذف رسمها رغم بقاء نطقها." },
        { t: "mcq", q: "ماذا لاحظت في «مائة»؟", o: ["الألف تُنطق وتُكتب", "الألف تُكتب ولا تُنطق — زيادة خطية محفوظة", "لا ألف فيها", "الألف محذوفة تمامًا"], a: 1, e: "ألف زائدة تُكتب رسمًا فقط لتمييز الكلمة." }],
      reveal: "استنتجت: بعض الكلمات المحفوظة تُحذف ألفها خطًّا رغم نطقها (هذا، الرحمن، لكن، ذلك)، وبعضها تُزاد فيها ألف أو واو تُكتب ولا تُنطق (مائة، عمرو) — وكلاهما يُحفظ لا يُقاس." },
    { t: "rule", title: "قائمتان محفوظتان", strat: "التمثيل البصري",
      body: "هذا الباب استثنائي بطبيعته: كلمات معدودة حُذفت ألفها خطًّا مع بقاء نطقها، وأخرى زيدت فيها ألف أو واو تُكتب ولا تُنطق. كلاهما يُحفظ عن ظهر قلب لا يُقاس عليه.",
      concepts: [{ label: "الحذف", note: "هذا، هذه، ذلك، ذا، لكن، الرحمن، إله، الله، طه — ألف تُنطق ولا تُكتب" }, { label: "الزيادة", note: "مائة ومضاعفاتها، عمرو (تمييزًا عن عمر)، أولئك، أولو، أولات" }],
      note: "«عمرو» تُكتب بواو زائدة لتمييزها عن «عمر» في الرسم فقط، والواو لا تُنطق أبدًا." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الكلمة لترى خطوات ضبط رسمها.",
      items: [
        { w: "هذا", steps: ["انطق الكلمة: تسمع ألفًا بعد الهاء", "انظر إلى الرسم القياسي: لا تُكتب الألف", "هذه كلمة محفوظة من كلمات الحذف", "تُكتب: هذا (بلا ألف بعد الهاء)"] },
        { w: "الرحمن", steps: ["انطق الكلمة: تسمع ألفًا قبل النون", "انظر إلى الرسم القياسي: لا تُكتب الألف", "من الكلمات المحفوظة", "تُكتب: الرحمن (بلا ألف قبل النون)"] },
        { w: "مائة", steps: ["انطق الكلمة: لا تسمع صوت الألف بعد الميم", "انظر إلى الرسم القياسي: تُكتب الألف رغم ذلك", "من كلمات الزيادة المحفوظة", "تُكتب: مائة (بألف بعد الميم)"] },
        { w: "عمرو", steps: ["انطق اسم العلم: لا تسمع صوت الواو", "انظر إلى الرسم القياسي: تُكتب الواو رغم ذلك", "زيادة لتمييزه عن «عمر» في الرفع والجر", "تُكتب: عمرو (بواو بعد الراء)"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "وزّع الكلمات: هل فيها حذف ألف محفوظ أم زيادة محفوظة؟",
      cats: ["حذف محفوظ", "زيادة محفوظة"],
      items: [["هذا", "حذف محفوظ"], ["مائة", "زيادة محفوظة"], ["ذلك", "حذف محفوظ"], ["عمرو", "زيادة محفوظة"],
              ["لكن", "حذف محفوظ"], ["ثلاثمائة", "زيادة محفوظة"], ["الرحمن", "حذف محفوظ"], ["أولئك", "زيادة محفوظة"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "كلمات معدودة محفوظة تُحذف ألفها خطًّا رغم نطقها، وأخرى تُزاد فيها ألف أو واو تُكتب ولا تُنطق. لا قاعدة تُقاس، بل حفظ مباشر.",
      bullets: ["حذف: هذا، ذلك، لكن، الرحمن، الله", "زيادة: مائة، عمرو، أولئك", "كلاهما استثناء محفوظ", "لا يُقاس على غيره"],
      note: "الاختبار 25 سؤالًا متنوعًا بكلمات من نفس القوائم المحفوظة." },
  ],
  bank: [
    { t: "mcq", sn: "كلمات الحذف", q: "أيّ الكلمات تُحذف ألفها خطًّا رغم نطقها؟", o: ["هذا", "كتاب", "قلم", "بيت"], a: 0, e: "من كلمات الحذف المحفوظة." },
    { t: "mcq", sn: "كلمات الزيادة", q: "أيّ الكلمات تُزاد فيها ألف تُكتب ولا تُنطق؟", o: ["كتاب", "مائة", "قلم", "باب"], a: 1, e: "من كلمات الزيادة المحفوظة." },
    { t: "mcq", sn: "تطبيق", q: "الكتابة الصحيحة لاسم العلم الذي لا تُنطق واوه:", o: ["عمر", "عمرو", "عمرْو منطوقة", "عُمرو بواو منطوقة"], a: 1, e: "تُكتب بواو زائدة للتمييز عن «عمر»." },
    { t: "mcq", sn: "تطبيق", q: "الكتابة الصحيحة:", o: ["هاذا", "هذا", "هذآ", "هاذآ"], a: 1, e: "من كلمات الحذف المحفوظة؛ لا تُكتب الألف رغم نطقها." },
    { t: "mcq", sn: "مضاعفات مائة", q: "الكتابة الصحيحة لعدد 300:", o: ["ثلاثمئة", "ثلاثمائة", "ثلاثماءة", "ثلاث مائه"], a: 1, e: "مضاعفات «مائة» تحتفظ بالألف الزائدة." },
    { t: "mcq", sn: "تطبيق", q: "الكتابة الصحيحة:", o: ["الرحمان", "الرحمن", "الرحمن بألف", "لا فرق"], a: 1, e: "من كلمات الحذف المحفوظة." },
    { t: "mcq", sn: "تمييز", q: "لماذا تُزاد الواو في «عمرو» تحديدًا؟", o: ["زخرفة فقط", "لتمييزه خطًّا عن «عمر»", "لأنها تُنطق فعلًا", "لا سبب معروف"], a: 1, e: "الزيادة وظيفية: تمييز الاسمين كتابيًّا." },
    { t: "mcq", sn: "تطبيق", q: "الكتابة الصحيحة:", o: ["ذالك", "ذلك", "ذلكْ بألف", "ذالكْ"], a: 1, e: "من كلمات الحذف المحفوظة." },
    { t: "mcq", sn: "تمييز", q: "أيّ الكلمات لا تنتمي لقوائم الحذف أو الزيادة المحفوظة؟", o: ["هذا", "مائة", "كتاب", "عمرو"], a: 2, e: "«كتاب» كلمة عادية تُكتب كما تُنطق." },
    { t: "mcq", sn: "تطبيق", q: "الكتابة الصحيحة لكلمة تفيد الاستدراك:", o: ["لاكن", "لكن", "لاكنْ", "لكنْ بألف"], a: 1, e: "من كلمات الحذف المحفوظة." },
    { t: "tf", sn: "التعريف", q: "هذا الباب يُقاس عليه بقاعدة عامة كباقي أبواب الإملاء.", a: false, e: "استثنائي محفوظ لا يُقاس." },
    { t: "tf", sn: "كلمات الحذف", q: "«هذا» و«ذلك» و«لكن» من كلمات الحذف المحفوظة.", a: true, e: "صحيح، تُحذف ألفها خطًّا رغم نطقها." },
    { t: "tf", sn: "كلمات الزيادة", q: "«مائة» تُنطق ألفها فعلًا.", a: false, e: "الألف زائدة خطًّا فقط، لا تُنطق." },
    { t: "tf", sn: "عمرو", q: "واو «عمرو» تُنطق دائمًا.", a: false, e: "لا تُنطق أبدًا؛ زيادة خطية للتمييز فقط." },
    { t: "tf", sn: "تطبيق", q: "«الرحمن» تُكتب بألف بعد الحاء.", a: false, e: "من كلمات الحذف؛ لا تُكتب الألف." },
    { t: "fill", sn: "التصويب", q: "صوّب: «هاذا الكتاب مفيد».", a: ["هذا"], e: "من كلمات الحذف المحفوظة." },
    { t: "fill", sn: "التصويب", q: "صوّب: «دفعتُ مئة درهم» إن أردنا الرسم التقليدي المحفوظ.", a: ["مائة"], e: "تحتفظ بالألف الزائدة في الرسم التقليدي." },
    { t: "fill", sn: "التصويب", q: "صوّب: «قابلتُ عمر بن العاص» إن كان المقصود عمرو بن العاص (بالواو).", a: ["عمرو"], e: "زيادة الواو تميّزه عن «عمر»." },
    { t: "fill", sn: "التطبيق", q: "اكتب كلمة الاستدراك التي تُحذف ألفها خطًّا رغم نطقها.", a: ["لكن"], e: "من كلمات الحذف المحفوظة." },
    { t: "fill", sn: "تطبيق", q: "اكتب عدد 500 بالرسم التقليدي المحفوظ للمائة.", a: ["خمسمائة"], e: "مضاعفات مائة تحتفظ بالألف." },
    { t: "match", sn: "التصنيف", q: "طابق كل كلمة بحكمها.",
      pairs: [["هذا", "حذف محفوظ"], ["مائة", "زيادة محفوظة"], ["الرحمن", "حذف محفوظ"], ["عمرو", "زيادة محفوظة"]], e: "قائمتان محفوظتان منفصلتان." },
    { t: "match", sn: "الكلمة والرسم الصحيح", q: "طابق كل كلمة منطوقة برسمها الصحيح.",
      pairs: [["هاذا (نطقًا)", "هذا (رسمًا)"], ["ذالك (نطقًا)", "ذلك (رسمًا)"], ["مئة (نطقًا)", "مائة (رسمًا)"], ["عمر بالواو (نطقًا)", "عمرو (رسمًا)"]], e: "الرسم يخالف النطق في هذه الكلمات تحديدًا." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة رسمًا.", words: ["هاذا", "الكتاب", "مفيد", "جدًّا"], a: 0, fix: "هذا", e: "من كلمات الحذف المحفوظة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة رسمًا.", words: ["دفعتُ", "مئة", "درهمٍ", "كاملة"], a: 1, fix: "مائة", e: "من كلمات الزيادة المحفوظة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة الخاطئة رسمًا.", words: ["ذالك", "الكتاب", "قديمٌ", "جدًّا"], a: 0, fix: "ذلك", e: "من كلمات الحذف المحفوظة." },
  ],
};

const C23 = {
  id: "c-kitabat-adad-5", title: "كتابة الأعداد", domain: "SP", grade: 5, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يكتب الطالب الأعداد بالحروف كتابةً صحيحة، ويطابق بين العدد والمعدود في التذكير والتأنيث وفق قواعد كل فئة.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ العلاقة بين نوع العدد ونوع المعدود في كل مثال.",
      table: { head: ["العدد", "المعدود", "نوع العدد", "العلاقة"],
        rows: [["ثلاثةُ طلابٍ", "طلاب (مذكر)", "3 إلى 10", "العدد يخالف المعدود: عدد مؤنث مع معدود مذكر"],
               ["ثلاثُ طالباتٍ", "طالبات (مؤنث)", "3 إلى 10", "العدد يخالف المعدود: عدد مذكر مع معدود مؤنث"],
               ["واحدٌ وعشرون طالبًا", "طالب (مفرد منصوب)", "11 وما فوق (مركّب وعقود)", "المعدود مفرد منصوب تمييزًا"]] },
      checks: [
        { t: "mcq", q: "ماذا لاحظت في علاقة الأعداد من 3 إلى 10 بمعدودها؟", o: ["تطابق العدد والمعدود في النوع", "تخالف العدد والمعدود في النوع (عكس النوع)", "لا علاقة بينهما", "المعدود يُحذف دائمًا"], a: 1, e: "قاعدة العكس: عدد مؤنث اللفظ مع معدود مذكر، والعكس." },
        { t: "mcq", q: "ماذا لاحظت عن حالة المعدود بعد 11 وما فوق؟", o: ["جمع مجرور", "مفرد منصوب على التمييز", "مثنى مرفوع", "لا معدود يُذكر"], a: 1, e: "المعدود بعد أحد عشر وما فوق مفرد منصوب." }],
      reveal: "استنتجت: أعداد 3-10 تخالف المعدود في النوع، وأعداد 11 وما فوق (المركّبة والعقود) يكون معدودها مفردًا منصوبًا." },
    { t: "rule", title: "فئات الأعداد الثلاث", strat: "التمثيل البصري",
      body: "العددان 1 و2 يطابقان المعدود في النوع (طالبٌ واحدٌ، طالبةٌ واحدةٌ). الأعداد 3-10 تخالف المعدود في النوع، ومعدودها جمع مجرور. الأعداد 11 وما فوق (عدا العقود الصريحة كعشرين) معدودها مفرد منصوب على التمييز.",
      concepts: [{ label: "1 و2", note: "يطابقان المعدود في النوع" }, { label: "3-10", note: "تخالف المعدود، ومعدودها جمع مجرور" }, { label: "11 فأكثر", note: "معدودها مفرد منصوب" }],
      note: "العقود الصريحة (عشرون، ثلاثون…) لا تتغيّر بتغيّر نوع المعدود: عشرون طالبًا، عشرون طالبةً — بلا مخالفة." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط العبارة لترى خطوات ضبط العدد ومعدوده.",
      items: [
        { w: "ثلاثة أقلام", steps: ["حدّد فئة العدد: 3-10", "المعدود (أقلام) مذكر", "طبّق قاعدة المخالفة: العدد يُؤنَّث لفظًا", "ثلاثة أقلامٍ (جمع مجرور)"] },
        { w: "ثلاث طالبات", steps: ["حدّد فئة العدد: 3-10", "المعدود (طالبات) مؤنث", "طبّق قاعدة المخالفة: العدد يُذكَّر لفظًا (بلا تاء)", "ثلاث طالباتٍ (جمع مجرور)"] },
        { w: "أحد عشر كتابًا", steps: ["حدّد فئة العدد: 11 فأكثر (مركّب)", "المعدود يكون مفردًا منصوبًا", "لا مخالفة في هذه الفئة لجزأي العدد المركّب معًا", "أحد عشر كتابًا (مفرد منصوب)"] },
        { w: "عشرون طالبةً", steps: ["حدّد فئة العدد: عقد صريح (عشرون)", "العقود لا تتغيّر بنوع المعدود", "المعدود مفرد منصوب", "عشرون طالبةً (مفرد منصوب، العدد ثابت الصيغة)"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل عبارة حسب فئة عددها.",
      cats: ["1 و2 (مطابقة)", "3-10 (مخالفة)", "11 فأكثر (مفرد منصوب)"],
      items: [["كتابٌ واحدٌ", "1 و2 (مطابقة)"], ["خمسةُ كتبٍ", "3-10 (مخالفة)"], ["اثنتا عشرة طالبةً", "11 فأكثر (مفرد منصوب)"],
              ["طالبتانِ اثنتانِ", "1 و2 (مطابقة)"], ["سبعُ طالباتٍ", "3-10 (مخالفة)"], ["ثلاثون طالبًا", "11 فأكثر (مفرد منصوب)"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "1 و2 يطابقان المعدود. 3-10 يخالفان المعدود ومعدودهما جمع مجرور. 11 فأكثر معدودها مفرد منصوب.",
      bullets: ["1، 2: مطابقة", "3-10: مخالفة + جمع مجرور", "11 فأكثر: مفرد منصوب", "العقود: صيغة ثابتة بلا مخالفة"],
      note: "الاختبار 25 سؤالًا متنوعًا بأعداد ومعدودات جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "قاعدة المطابقة", q: "العددان 1 و2 حكمهما مع المعدود:", o: ["مخالفة النوع", "مطابقة النوع", "جمع دائمًا", "لا علاقة"], a: 1, e: "يطابقان المعدود في التذكير والتأنيث." },
    { t: "mcq", sn: "قاعدة المخالفة", q: "الأعداد 3-10 حكمها مع المعدود:", o: ["مطابقة النوع", "مخالفة النوع", "لا نوع لها", "تحذف المعدود"], a: 1, e: "تخالف المعدود في النوع." },
    { t: "mcq", sn: "تطبيق", q: "العدد الصحيح مع «كتب» (مذكر):", o: ["ثلاثةُ كتبٍ", "ثلاثُ كتبٍ", "ثلاثة كتابًا", "ثلاثُ كتابًا"], a: 0, e: "العدد يُؤنَّث لفظًا مع المعدود المذكر (مخالفة)." },
    { t: "mcq", sn: "تطبيق", q: "العدد الصحيح مع «طالبات» (مؤنث):", o: ["ثلاثةُ طالباتٍ", "ثلاثُ طالباتٍ", "ثلاثة طالباتٍ", "ثلاثًا طالباتٍ"], a: 1, e: "العدد يُذكَّر لفظًا (بلا تاء) مع المعدود المؤنث." },
    { t: "mcq", sn: "حالة المعدود بعد 11", q: "معدود الأعداد 11 فأكثر يكون:", o: ["جمعًا مجرورًا", "مفردًا منصوبًا", "مثنى مرفوعًا", "جمعًا مرفوعًا"], a: 1, e: "قاعدة ثابتة لهذه الفئة." },
    { t: "mcq", sn: "تطبيق", q: "العدد الصحيح: «أحد عشر ____» (كتاب):", o: ["كتبٍ", "كتابًا", "كتابٍ", "كتابٌ"], a: 1, e: "مفرد منصوب." },
    { t: "mcq", sn: "العقود", q: "«عشرون» مع المعدود المؤنث:", o: ["تتغيّر صيغتها", "تبقى ثابتة الصيغة بلا مخالفة", "تُحذف", "تُجمع"], a: 1, e: "العقود لا تتغيّر بنوع المعدود." },
    { t: "mcq", sn: "تطبيق", q: "العدد الصحيح: «عشرون ____» (طالبة):", o: ["طالباتٍ", "طالبةً", "طالباتٌ", "طالبةٍ"], a: 1, e: "مفرد منصوب، والعدد ثابت الصيغة." },
    { t: "mcq", sn: "حالة المعدود بعد 3-10", q: "معدود الأعداد 3-10 يكون:", o: ["جمعًا مجرورًا", "مفردًا منصوبًا", "مثنى", "جمعًا مرفوعًا"], a: 0, e: "قاعدة ثابتة لهذه الفئة." },
    { t: "mcq", sn: "تطبيق", q: "العدد الصحيح مع «أقلام» (مذكر):", o: ["سبعةُ أقلامٍ", "سبعُ أقلامٍ", "سبعة أقلامًا", "سبعُ أقلامًا"], a: 0, e: "مخالفة: عدد مؤنث لفظًا مع معدود مذكر." },
    { t: "tf", sn: "قاعدة 1 و2", q: "العددان 1 و2 يخالفان المعدود في النوع.", a: false, e: "يطابقانه، لا يخالفانه." },
    { t: "tf", sn: "قاعدة 3-10", q: "الأعداد 3-10 تخالف المعدود في النوع.", a: true, e: "قاعدة ثابتة." },
    { t: "tf", sn: "المعدود بعد 3-10", q: "معدود الأعداد 3-10 يكون جمعًا مجرورًا.", a: true, e: "صحيح." },
    { t: "tf", sn: "المعدود بعد 11", q: "معدود الأعداد 11 فأكثر يكون جمعًا مجرورًا كالفئة السابقة.", a: false, e: "يكون مفردًا منصوبًا لا جمعًا." },
    { t: "tf", sn: "العقود", q: "العقود الصريحة مثل عشرين تتغيّر صيغتها حسب نوع المعدود.", a: false, e: "تبقى ثابتة الصيغة بلا مخالفة." },
    { t: "fill", sn: "التطبيق", q: "اكتب الصيغة الصحيحة: خمسة ____ (طالب).", a: ["طلاب"], e: "جمع مجرور بعد عدد 3-10." },
    { t: "fill", sn: "التطبيق", q: "اكتب الصيغة الصحيحة: خمس ____ (طالبة).", a: ["طالبات"], e: "جمع مجرور، والعدد بلا تاء لمعدود مؤنث." },
    { t: "fill", sn: "التصويب", q: "صوّب: «حضر اثنا عشر طالبٍ» (اضبط المعدود).", a: ["طالبا", "طالبًا"], e: "مفرد منصوب بعد 11 فأكثر." },
    { t: "fill", sn: "التطبيق", q: "أكمل: الأعداد من ____ إلى ____ تخالف المعدود في النوع.", a: ["3 الى 10", "3 إلى 10", "ثلاثة الى عشرة"], e: "الفئة الوسطى من فئات الأعداد الثلاث." },
    { t: "fill", sn: "تطبيق", q: "صوّب: «اشتريتُ عشرين كتبًا» (اضبط المعدود).", a: ["كتابا", "كتابًا"], e: "مفرد منصوب بعد العقود." },
    { t: "match", sn: "فئات الأعداد", q: "طابق كل عدد بفئته.",
      pairs: [["كتابٌ واحدٌ", "1 و2 (مطابقة)"], ["خمسةُ كتبٍ", "3-10 (مخالفة)"], ["أحد عشر كتابًا", "11 فأكثر (مفرد منصوب)"], ["عشرون كتابًا", "العقود (ثابتة الصيغة)"]], e: "أربع فئات لأحكام الأعداد." },
    { t: "match", sn: "المطابقة والمخالفة", q: "طابق كل عدد بمعدوده الصحيح.",
      pairs: [["ثلاثة", "طلابٍ"], ["ثلاث", "طالباتٍ"], ["أحد عشر", "طالبًا"], ["إحدى عشرة", "طالبةً"]], e: "طبّق قواعد المطابقة والمخالفة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["حضر", "خمسة", "طالباتٍ", "اليوم"], a: 1, fix: "خمسُ", e: "العدد يُذكَّر لفظًا مع المعدود المؤنث." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["اشتريتُ", "أحد", "عشر", "كتبٍ"], a: 3, fix: "كتابًا", e: "معدود 11 فأكثر مفرد منصوب لا جمع مجرور." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["نجح", "عشرون", "طالبةً", "طالباتٍ"], a: 3, fix: "(احذفها، العبارة صحيحة بدونها)", e: "لا حاجة لتكرار المعدود؛ العقد ثابت الصيغة والمعدود مفرد منصوب واحد." },
  ],
};

const C24 = {
  id: "c-khabari-inshai-9", title: "الأسلوب الخبري والإنشائي", domain: "RH", grade: 9, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب الأسلوب الخبري من الإنشائي، ويحدّد أقسام الإنشائي الطلبي وغير الطلبي.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "اسأل نفسك عن كل جملة: هل يصحّ أن أقول لقائلها «أنت صادق» أو «أنت كاذب»؟",
      table: { head: ["الجملة", "هل يصحّ الحكم بصدقها أو كذبها؟", "النوع", "الغرض"],
        rows: [["الشمسُ مشرقةٌ", "نعم، يصحّ الحكم", "خبري", "إخبار"], ["اجتهدْ في دروسك", "لا، لا يُقال صادق أو كاذب لأمر", "إنشائي طلبي", "أمر"],
               ["هل حضرتَ الاجتماعَ؟", "لا، سؤال لا يُوصف بالصدق أو الكذب", "إنشائي طلبي", "استفهام"], ["ما أجملَ السماءَ!", "لا، تعجب لا يُوصف بالصدق أو الكذب", "إنشائي غير طلبي", "تعجب"]] },
      checks: [
        { t: "mcq", q: "ما الاختبار العملي للتفريق بين الخبري والإنشائي؟", o: ["طول الجملة", "هل يصحّ وصفها بالصدق أو الكذب؟", "عدد الكلمات", "وجود فعل من عدمه"], a: 1, e: "هذا الاختبار الحاسم للتفريق بينهما." },
        { t: "mcq", q: "الأمر والاستفهام كلاهما إنشائي، لكن بأيّ قسم؟", o: ["غير طلبي", "طلبي، لأنهما يطلبان تحقيق أمر لم يكن حاصلًا وقت الكلام", "خبري", "لا قسم لهما"], a: 1, e: "الطلبي يطلب تحقيق شيء غير حاصل." }],
      reveal: "استنتجت: الخبري كلام يحتمل الصدق أو الكذب، والإنشائي كلام لا يحتمل ذلك، وينقسم إلى طلبي (يطلب أمرًا) وغير طلبي (لا يطلب شيئًا)." },
    { t: "rule", title: "خريطة الأسلوبين", strat: "التمثيل البصري",
      body: "الأسلوب الخبري: كلام يحتمل الصدق أو الكذب لذاته. الأسلوب الإنشائي: كلام لا يحتمل الصدق أو الكذب، لأنه يطلب تحقيق مضمونه أو يعبّر عن انفعال لا خبر.",
      concepts: [{ label: "الخبري", note: "يُوصف بالصدق أو الكذب" }, { label: "الإنشائي الطلبي", note: "أمر، نهي، استفهام، تمنٍّ، نداء — يطلب أمرًا غير حاصل" }, { label: "الإنشائي غير الطلبي", note: "تعجب، مدح وذم، قسم — لا يطلب شيئًا" }],
      note: "علامة الإنشاء الطلبي غالبًا أدواته الظاهرة: افعل (أمر)، لا تفعل (نهي)، هل/أ (استفهام)، ليت (تمنٍّ)، يا (نداء)." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تصنيف أسلوبها.",
      items: [
        { w: "الكتابُ على الطاولةِ", steps: ["اسأل: هل يصحّ الحكم بصدقها أو كذبها؟", "نعم، يمكن التحقّق من وجود الكتاب فعلًا", "الجملة خبرية", "الغرض: إخبار السامع بمعلومة"] },
        { w: "لا تُهملْ واجباتِك", steps: ["اسأل: هل يصحّ الحكم بصدقها أو كذبها؟", "لا، فهي طلب لم يتحقّق بعد", "الجملة إنشائية طلبية", "النوع: نهي، الأداة: لا الناهية"] },
        { w: "ليت الشبابَ يعودُ", steps: ["اسأل: هل يصحّ الحكم بصدقها أو كذبها؟", "لا، فهي تمنٍّ لا خبر", "الجملة إنشائية طلبية", "النوع: تمنٍّ، الأداة: ليت"] },
        { w: "ما أروعَ الإخلاصَ!", steps: ["اسأل: هل يصحّ الحكم بصدقها أو كذبها؟", "لا، فهي تعبير عن انفعال لا خبر", "الجملة إنشائية غير طلبية", "النوع: تعجب"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة إلى خبرية أو إنشائية.",
      cats: ["أسلوب خبري", "أسلوب إنشائي"],
      items: [["الجوّ باردٌ اليوم", "أسلوب خبري"], ["اكتبْ واجبك", "أسلوب إنشائي"], ["حضر الطلابُ باكرًا", "أسلوب خبري"],
              ["هل أنجزتَ العمل؟", "أسلوب إنشائي"], ["نجح الفريقُ في المباراة", "أسلوب خبري"], ["يا طالبُ، انتبهْ", "أسلوب إنشائي"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "الخبري يحتمل الصدق أو الكذب. الإنشائي لا يحتمله، وينقسم إلى طلبي (أمر، نهي، استفهام، تمنٍّ، نداء) وغير طلبي (تعجب، مدح وذم، قسم).",
      bullets: ["الخبري: يُوصف بالصدق أو الكذب", "الإنشائي الطلبي: يطلب أمرًا غير حاصل", "الإنشائي غير الطلبي: لا يطلب شيئًا", "الاختبار: هل يصحّ الحكم بالصدق أو الكذب؟"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "تعريف الخبري", q: "الأسلوب الخبري هو:", o: ["كلام لا يحتمل الصدق أو الكذب", "كلام يحتمل الصدق أو الكذب لذاته", "طلب أمر", "تعبير عن انفعال فقط"], a: 1, e: "هذا تعريفه الدقيق." },
    { t: "mcq", sn: "تعريف الإنشائي", q: "الأسلوب الإنشائي هو:", o: ["كلام يحتمل الصدق أو الكذب", "كلام لا يحتمل الصدق أو الكذب", "إخبار محض", "لا فرق عن الخبري"], a: 1, e: "لا يُوصف بصدق أو كذب." },
    { t: "mcq", sn: "الاختبار العملي", q: "كيف تميّز بين الخبري والإنشائي عمليًّا؟", o: ["عدّ الكلمات", "هل يصحّ وصف الجملة بالصدق أو الكذب؟", "طول الجملة", "وجود الفعل"], a: 1, e: "الاختبار الحاسم للتفريق." },
    { t: "mcq", sn: "أقسام الطلبي", q: "من أنواع الإنشاء الطلبي:", o: ["التعجب", "الأمر والنهي والاستفهام والتمنّي والنداء", "المدح والذم", "القسم"], a: 1, e: "خمسة أنواع أساسية للطلبي." },
    { t: "mcq", sn: "أقسام غير الطلبي", q: "من أنواع الإنشاء غير الطلبي:", o: ["الأمر", "التعجب والمدح والذم والقسم", "النهي", "الاستفهام"], a: 1, e: "لا تطلب تحقيق شيء، بل تعبّر عن انفعال أو تقرّر حكمًا." },
    { t: "mcq", sn: "تطبيق", q: "«اجتهدْ في دروسك» — نوعها:", o: ["خبري", "إنشائي طلبي (أمر)", "إنشائي غير طلبي", "لا نوع لها"], a: 1, e: "أمر يطلب تحقيق فعل غير حاصل." },
    { t: "mcq", sn: "تطبيق", q: "«هل حضرتَ الاجتماعَ؟» — نوعها:", o: ["خبري", "إنشائي طلبي (استفهام)", "إنشائي غير طلبي", "لا نوع لها"], a: 1, e: "استفهام يطلب معرفة أمر مجهول." },
    { t: "mcq", sn: "تطبيق", q: "«ما أجملَ السماءَ!» — نوعها:", o: ["خبري", "إنشائي طلبي", "إنشائي غير طلبي (تعجب)", "لا نوع لها"], a: 2, e: "تعجب لا يطلب شيئًا، بل يعبّر عن انفعال." },
    { t: "mcq", sn: "الغرض", q: "الغرض الأساسي من الأسلوب الخبري:", o: ["الطلب", "نقل معلومة أو حكم يحتمل الصدق أو الكذب", "التعجب", "النداء"], a: 1, e: "وظيفته الأساسية الإخبار." },
    { t: "mcq", sn: "تطبيق", q: "«نجح الفريقُ في المباراة» — نوعها:", o: ["خبري", "إنشائي طلبي", "إنشائي غير طلبي", "لا نوع لها"], a: 0, e: "يصحّ الحكم عليها بالصدق أو الكذب." },
    { t: "tf", sn: "التعريف", q: "الأسلوب الخبري يحتمل الصدق أو الكذب.", a: true, e: "هذا تعريفه." },
    { t: "tf", sn: "التعريف", q: "الأسلوب الإنشائي يحتمل الصدق أو الكذب كالخبري.", a: false, e: "لا يحتمل ذلك؛ هذا ما يميّزه عن الخبري." },
    { t: "tf", sn: "أقسام الإنشاء", q: "الاستفهام من أنواع الإنشاء الطلبي.", a: true, e: "يطلب معرفة أمر مجهول." },
    { t: "tf", sn: "أقسام الإنشاء", q: "التعجب من أنواع الإنشاء الطلبي.", a: false, e: "من الإنشاء غير الطلبي؛ لا يطلب شيئًا." },
    { t: "tf", sn: "تطبيق", q: "«الجوّ باردٌ اليوم» أسلوب إنشائي.", a: false, e: "أسلوب خبري؛ يصحّ الحكم عليه بالصدق أو الكذب." },
    { t: "tf", sn: "تطبيق", q: "«يا طالبُ، انتبهْ» أسلوب إنشائي طلبي (نداء).", a: true, e: "النداء من أنواع الإنشاء الطلبي." },
    { t: "fill", sn: "التصنيف", q: "صنّف «حضر الطلابُ باكرًا» (خبري أم إنشائي).", a: ["خبري"], e: "يصحّ الحكم عليها بالصدق أو الكذب." },
    { t: "fill", sn: "التصنيف", q: "صنّف «اكتبْ واجبك» من حيث النوع الفرعي (كلمة واحدة).", a: ["امر", "أمر"], e: "طلب فعل غير حاصل." },
    { t: "fill", sn: "التصنيف", q: "صنّف «هل أنت مستعدّ؟» من حيث النوع الفرعي.", a: ["استفهام"], e: "طلب معرفة أمر مجهول." },
    { t: "fill", sn: "التطبيق", q: "أكمل: الأسلوب الخبري كلام ____ الصدق أو الكذب.", a: ["يحتمل"], e: "هذا جوهر تعريفه." },
    { t: "fill", sn: "تطبيق", q: "اكتب نوع «ليت الوقتَ يعودُ» الفرعي (كلمة واحدة).", a: ["تمن", "تمنٍّ", "تمني"], e: "أداة التمنّي ليت." },
    { t: "match", sn: "التصنيف", q: "طابق كل جملة بنوعها.",
      pairs: [["الجوّ باردٌ", "خبري"], ["اجتهدْ", "إنشائي طلبي (أمر)"], ["هل نجحتَ؟", "إنشائي طلبي (استفهام)"], ["ما أجملَ الطبيعةَ!", "إنشائي غير طلبي (تعجب)"]], e: "طبّق اختبار الصدق والكذب." },
    { t: "match", sn: "الأداة والنوع", q: "طابق كل أداة بنوع الإنشاء الذي تدلّ عليه.",
      pairs: [["افعلْ", "أمر"], ["لا تفعلْ", "نهي"], ["هل", "استفهام"], ["ليت", "تمنٍّ"]], e: "أدوات الإنشاء الطلبي الأساسية." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تدلّ على أن الجملة إنشاء طلبي (نهي).", words: ["لا", "تُهملْ", "واجباتِك", "أبدًا"], a: 0, fix: "لا (الناهية)", e: "«لا» الناهية تجزم الفعل وتدلّ على النهي، وهو إنشاء طلبي." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تدلّ على أن الجملة إنشاء طلبي (استفهام).", words: ["هل", "حضرتَ", "الاجتماعَ", "أمس"], a: 0, fix: "هل (أداة الاستفهام)", e: "أداة الاستفهام تحوّل الجملة لإنشاء طلبي." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي تدلّ على أن الجملة إنشاء غير طلبي (تعجب).", words: ["ما", "أروعَ", "الإخلاصَ", "دائمًا"], a: 1, fix: "أروعَ (صيغة التعجب)", e: "صيغة «ما أفعلَ» من صيغ التعجب القياسية." },
  ],
};

const C25 = {
  id: "c-mafool-bih-6", title: "المفعول به", domain: "GR", grade: 6, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب المفعول به في الجملة الفعلية، ويحدّد أنواعه المختلفة.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ الاسم الذي وقع عليه فعل الفاعل في كل جملة.",
      table: { head: ["الجملة", "الفاعل", "من وقع عليه الفعل؟", "حكمه الإعرابي"],
        rows: [["كتب الطالبُ الدرسَ", "الطالب", "الدرس", "منصوب"], ["أكل الولدُ التفاحةَ", "الولد", "التفاحة", "منصوب"],
               ["قرأتُ كتابًا مفيدًا", "التاء (أنا)", "كتابًا", "منصوب"]] },
      checks: [
        { t: "mcq", q: "ما الحكم الإعرابي المشترك للاسم الذي وقع عليه الفعل في كل الأمثلة؟", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 1, e: "المفعول به منصوب دائمًا." },
        { t: "mcq", q: "أين يقع المفعول به غالبًا في الجملة الفعلية؟", o: ["قبل الفعل دائمًا", "بعد الفاعل غالبًا", "لا يقع في جملة فعلية", "بين الفعل والفاعل"], a: 1, e: "الترتيب الشائع: فعل، فاعل، مفعول به." }],
      reveal: "استنتجت: المفعول به اسم منصوب يقع عليه فعل الفاعل، ويقع غالبًا بعد الفعل والفاعل." },
    { t: "rule", title: "المفعول به وأنواعه", strat: "التمثيل البصري",
      body: "المفعول به اسم منصوب يدلّ على من وقع عليه فعل الفاعل. قد يكون اسمًا ظاهرًا، أو ضميرًا متصلًا أو منفصلًا، وقد يتعدّد الفعل لأكثر من مفعول به (أفعال تنصب مفعولين كـ«ظنّ» و«أعطى»).",
      concepts: [{ label: "المفعول به الظاهر", note: "اسم صريح (الدرسَ)" }, { label: "المفعول به الضمير", note: "متصل (كتبَه) أو منفصل (إيّاه)" }, { label: "تعدّد المفعول", note: "بعض الأفعال تنصب مفعولين معًا" }],
      note: "أفعال تنصب مفعولين أصلهما مبتدأ وخبر: ظنّ، حسب، خال، علم. وأفعال تنصب مفعولين ليسا أصلهما مبتدأ وخبر: أعطى، منح، كسا." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تعيين المفعول به.",
      items: [
        { w: "شرح المعلمُ الدرسَ", steps: ["حدّد الفعل والفاعل: شرح، المعلم", "من وقع عليه الفعل؟ الدرس", "المفعول به: الدرسَ", "منصوب بالفتحة"] },
        { w: "قابلتُه في السوق", steps: ["حدّد الفعل والفاعل: قابلتُ، التاء", "من وقع عليه الفعل؟ الهاء (ضمير)", "المفعول به: الهاء (ضمير متصل)", "في محل نصب مفعول به"] },
        { w: "ظننتُ الجوَّ باردًا", steps: ["حدّد الفعل: ظننتُ (من أفعال الظن تنصب مفعولين)", "المفعول به الأول: الجوَّ", "المفعول به الثاني: باردًا (أصله خبر)", "كلاهما منصوب"] },
        { w: "أعطى المعلمُ الطالبَ جائزةً", steps: ["حدّد الفعل: أعطى (ينصب مفعولين)", "المفعول به الأول: الطالبَ", "المفعول به الثاني: جائزةً", "كلاهما منصوب، وليسا أصلهما مبتدأ وخبر"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة حسب نوع المفعول به فيها.",
      cats: ["مفعول به واحد", "مفعولان به"],
      items: [["كتب الطالبُ الدرسَ", "مفعول به واحد"], ["ظننتُ الجوَّ باردًا", "مفعولان به"], ["أكل الولدُ التفاحةَ", "مفعول به واحد"],
              ["أعطى المعلمُ الطالبَ كتابًا", "مفعولان به"], ["قرأتُ القصةَ", "مفعول به واحد"], ["حسبتُ الأمرَ سهلًا", "مفعولان به"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "المفعول به اسم منصوب وقع عليه فعل الفاعل. قد يكون ظاهرًا أو ضميرًا، وقد تنصب بعض الأفعال مفعولين معًا.",
      bullets: ["حكمه: منصوب دائمًا", "يقع بعد الفاعل غالبًا", "قد يكون ضميرًا متصلًا أو منفصلًا", "أفعال الظن وأعطى تنصب مفعولين"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "حكم المفعول به", q: "المفعول به حكمه الإعرابي:", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 1, e: "منصوب دائمًا." },
    { t: "mcq", sn: "تعيين المفعول به", q: "المفعول به في «سقى الفلاحُ الأرضَ»:", o: ["الفلاح", "الأرض", "سقى", "لا مفعول به"], a: 1, e: "من وقع عليه فعل السقي." },
    { t: "mcq", sn: "الضمير المفعول", q: "في «رأيتُه أمس»، المفعول به:", o: ["التاء", "الهاء (ضمير متصل)", "أمس", "لا مفعول به"], a: 1, e: "ضمير متصل في محل نصب مفعول به." },
    { t: "mcq", sn: "أفعال الظن", q: "أيّ الأفعال تنصب مفعولين أصلهما مبتدأ وخبر؟", o: ["أعطى", "ظنّ", "سقى", "كسا"], a: 1, e: "ظنّ من أفعال القلوب التي تنصب مفعولين." },
    { t: "mcq", sn: "تطبيق", q: "في «ظننتُ الامتحانَ صعبًا»، المفعول به الثاني:", o: ["الامتحان", "صعبًا", "ظننتُ", "لا مفعول ثانٍ"], a: 1, e: "أصله خبر «الامتحان صعب»." },
    { t: "mcq", sn: "أفعال العطاء", q: "أيّ الأفعال تنصب مفعولين ليسا أصلهما مبتدأ وخبر؟", o: ["ظنّ", "حسب", "أعطى", "علم"], a: 2, e: "أعطى ومنح وكسا من هذا النوع." },
    { t: "mcq", sn: "تطبيق", q: "في «كسا الأبُ ابنَه ثوبًا»، عدد المفاعيل:", o: ["مفعول واحد", "مفعولان", "ثلاثة مفاعيل", "لا مفعول"], a: 1, e: "ابنَه وثوبًا مفعولان به." },
    { t: "mcq", sn: "الترتيب", q: "الترتيب الشائع للجملة الفعلية:", o: ["مفعول، فعل، فاعل", "فعل، فاعل، مفعول به", "فاعل، مفعول، فعل", "لا ترتيب"], a: 1, e: "هذا الترتيب الأشيع وإن جاز التقديم والتأخير." },
    { t: "mcq", sn: "تطبيق", q: "في «أكرمَ المعلمُ الطالبَ المجتهدَ»، المفعول به:", o: ["المعلم", "الطالب", "المجتهد", "أكرم"], a: 1, e: "من وقع عليه فعل الإكرام (والمجتهد نعت له)." },
    { t: "mcq", sn: "تطبيق", q: "في «منحه المديرُ جائزةً»، المفعولان به:", o: ["المدير وجائزة", "الهاء وجائزة", "منح والمدير", "لا مفعول"], a: 1, e: "الهاء (ضمير) وجائزة كلاهما مفعول به." },
    { t: "tf", sn: "حكم المفعول به", q: "المفعول به مرفوع دائمًا.", a: false, e: "منصوب دائمًا." },
    { t: "tf", sn: "الضمير المفعول", q: "الضمير المتصل يمكن أن يكون مفعولًا به.", a: true, e: "مثل الهاء في رأيتُه." },
    { t: "tf", sn: "أفعال الظن", q: "«ظنّ» و«حسب» و«علم» من الأفعال التي تنصب مفعولين أصلهما مبتدأ وخبر.", a: true, e: "من أفعال القلوب." },
    { t: "tf", sn: "تطبيق", q: "«كتب الطالبُ الدرسَ» فيها مفعولان به.", a: false, e: "مفعول به واحد فقط (الدرس)." },
    { t: "tf", sn: "تطبيق", q: "«أعطى» من الأفعال التي تنصب مفعولين ليسا أصلهما مبتدأ وخبر.", a: true, e: "صحيح." },
    { t: "fill", sn: "تعيين المفعول به", q: "استخرج المفعول به من «شرب الطفلُ الحليبَ».", a: ["الحليب", "الحليبَ"], e: "من وقع عليه فعل الشرب." },
    { t: "fill", sn: "تطبيق", q: "استخرج المفعولين من «ظننتُ الجوَّ معتدلًا».", a: ["الجو ومعتدلا", "الجوّ ومعتدلًا"], e: "مفعولان أصلهما مبتدأ وخبر." },
    { t: "fill", sn: "التطبيق", q: "أكمل: المفعول به اسم ____ وقع عليه فعل الفاعل.", a: ["منصوب"], e: "حكمه الإعرابي الثابت." },
    { t: "fill", sn: "تطبيق", q: "اكتب فعلًا واحدًا ينصب مفعولين ليسا أصلهما مبتدأ وخبر.", a: ["اعطى", "أعطى", "منح", "كسا"], e: "أي فعل من هذه المجموعة يُقبل." },
    { t: "fill", sn: "تطبيق", q: "صوّب: «قرأتُ القصةُ» (اضبط المفعول به).", a: ["القصة", "القصةَ"], e: "المفعول به منصوب لا مرفوع." },
    { t: "match", sn: "تعيين المفعول", q: "طابق كل جملة بمفعولها به.",
      pairs: [["كتب الطالبُ الدرسَ", "الدرسَ"], ["أكل الولدُ التفاحةَ", "التفاحةَ"], ["سقى الفلاحُ الأرضَ", "الأرضَ"], ["قرأتُ الكتابَ", "الكتابَ"]], e: "المفعول به هو من وقع عليه الفعل." },
    { t: "match", sn: "المفعولان", q: "طابق كل جملة بمفعوليها.",
      pairs: [["ظننتُ الجوَّ باردًا", "الجوَّ / باردًا"], ["أعطى المعلمُ الطالبَ كتابًا", "الطالبَ / كتابًا"], ["حسبتُ الأمرَ سهلًا", "الأمرَ / سهلًا"]], e: "أفعال تنصب مفعولين معًا." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["كتب", "الطالبُ", "الدرسُ", "بعناية"], a: 2, fix: "الدرسَ", e: "المفعول به منصوب لا مرفوع." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["ظننتُ", "الجوَّ", "باردٌ", "اليوم"], a: 2, fix: "باردًا", e: "المفعول به الثاني منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["أعطى", "المعلمُ", "الطالبُ", "جائزةً"], a: 2, fix: "الطالبَ", e: "المفعول به الأول منصوب لا مرفوع." },
  ],
};

const C26 = {
  id: "c-idafa-7", title: "الإضافة", domain: "GR", grade: 7, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب المضاف والمضاف إليه، ويدرك أن المضاف يتجرّد من التنوين وأل ونون المثنى والجمع.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ الاسمين في كل عبارة، وحكم إعراب كل منهما.",
      table: { head: ["العبارة", "الاسم الأول (المضاف)", "الاسم الثاني (المضاف إليه)", "حكم المضاف إليه"],
        rows: [["كتابُ الطالبِ", "كتاب (بلا تنوين)", "الطالب", "مجرور"], ["معلّما المدرسةِ", "معلّما (بلا نون مثنى)", "المدرسة", "مجرور"],
               ["مدرّسو اللغةِ", "مدرّسو (بلا نون جمع)", "اللغة", "مجرور"]] },
      checks: [
        { t: "mcq", q: "ما الحكم الإعرابي المشترك للاسم الثاني (المضاف إليه) في كل الأمثلة؟", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 2, e: "المضاف إليه مجرور دائمًا." },
        { t: "mcq", q: "ماذا لاحظت في المضاف (الاسم الأول) من حيث التنوين أو نون المثنى والجمع؟", o: ["يحتفظ بها كاملة", "يتجرّد منها", "لا علاقة له بها", "يُضاعفها"], a: 1, e: "المضاف يتجرّد من التنوين ونون المثنى والجمع وأل التعريف." }],
      reveal: "استنتجت: الإضافة نسبة اسم (المضاف) إلى اسم آخر (المضاف إليه) المجرور دائمًا، ويتجرّد المضاف من التنوين ونون المثنى والجمع وأل التعريف." },
    { t: "rule", title: "المضاف والمضاف إليه", strat: "التمثيل البصري",
      body: "الإضافة تركيب من اسمين: المضاف (الأول) والمضاف إليه (الثاني، مجرور دائمًا). يتجرّد المضاف من التنوين إن كان مفردًا، ومن نون المثنى أو الجمع إن كان مثنى أو جمعًا سالمًا، ولا يدخله «أل» التعريف مباشرة.",
      concepts: [{ label: "المضاف", note: "بلا تنوين، بلا نون مثنى/جمع، بلا أل" }, { label: "المضاف إليه", note: "مجرور دائمًا" }, { label: "معنى الإضافة", note: "التخصيص أو التعريف" }],
      note: "الإضافة تُعرّف المضاف أو تخصّصه: «كتابُ» نكرة، فإذا أُضيف إلى معرفة (الطالبِ) صار معرفة (كتابُ الطالبِ)." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط العبارة لترى خطوات تحليل الإضافة.",
      items: [
        { w: "قلمُ المعلّمِ", steps: ["حدّد المضاف: قلم (بلا تنوين)", "حدّد المضاف إليه: المعلّم", "تحقّق من حكمه: مجرور", "إضافة صحيحة؛ المضاف تجرّد من التنوين"] },
        { w: "معلّما المدرسةِ", steps: ["حدّد المضاف: معلّما (مثنى، بلا نون)", "حدّد المضاف إليه: المدرسة", "تحقّق من حكمه: مجرور", "المضاف تجرّد من نون المثنى"] },
        { w: "مدرّسو اللغةِ", steps: ["حدّد المضاف: مدرّسو (جمع مذكر سالم، بلا نون)", "حدّد المضاف إليه: اللغة", "تحقّق من حكمه: مجرور", "المضاف تجرّد من نون الجمع"] },
        { w: "بابُ البيتِ", steps: ["حدّد المضاف: باب (بلا تنوين ولا أل رغم أنه معرفة بالإضافة)", "حدّد المضاف إليه: البيت", "تحقّق من حكمه: مجرور", "إضافة صحيحة، والمضاف عرّفته الإضافة لا أل"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل عبارة حسب نوع المضاف فيها.",
      cats: ["مضاف مفرد", "مضاف مثنى أو جمع"],
      items: [["كتابُ الطالبِ", "مضاف مفرد"], ["معلّما المدرسةِ", "مضاف مثنى أو جمع"], ["بابُ البيتِ", "مضاف مفرد"],
              ["مدرّسو اللغةِ", "مضاف مثنى أو جمع"], ["قلمُ الطالبةِ", "مضاف مفرد"], ["طالبتا الصفِّ", "مضاف مثنى أو جمع"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "الإضافة نسبة اسم إلى اسم آخر. المضاف إليه مجرور دائمًا، والمضاف يتجرّد من التنوين ونون المثنى والجمع وأل التعريف.",
      bullets: ["المضاف إليه: مجرور دائمًا", "المضاف: بلا تنوين", "المضاف: بلا نون مثنى أو جمع", "المضاف: بلا أل مباشرة"],
      note: "الاختبار 25 سؤالًا متنوعًا بعبارات جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "حكم المضاف إليه", q: "المضاف إليه حكمه الإعرابي:", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 2, e: "مجرور دائمًا." },
    { t: "mcq", sn: "تعيين المضاف إليه", q: "المضاف إليه في «حقيبةُ الطالبةِ»:", o: ["حقيبة", "الطالبة", "لا مضاف إليه", "كلاهما"], a: 1, e: "الاسم الثاني المجرور." },
    { t: "mcq", sn: "تجرّد المضاف", q: "المضاف المفرد يتجرّد من:", o: ["الجرّ", "التنوين", "الرفع", "لا يتجرّد من شيء"], a: 1, e: "المضاف المفرد بلا تنوين." },
    { t: "mcq", sn: "تطبيق", q: "الصحيح: «هذا كتابُ الطالبِ» أم «هذا كتابٌ الطالبِ»؟", o: ["كتابُ الطالبِ (بلا تنوين)", "كتابٌ الطالبِ (بتنوين)", "كلاهما صحيح", "لا فرق"], a: 0, e: "المضاف يتجرّد من التنوين وجوبًا." },
    { t: "mcq", sn: "تجرّد المثنى", q: "المضاف المثنى يتجرّد من:", o: ["نون المثنى", "التنوين فقط", "الألف", "لا يتجرّد من شيء"], a: 0, e: "مثل: معلّما المدرسة (لا معلّمان)." },
    { t: "mcq", sn: "تجرّد الجمع", q: "المضاف جمع المذكر السالم يتجرّد من:", o: ["الواو", "نون الجمع", "الألف", "لا يتجرّد من شيء"], a: 1, e: "مثل: مدرّسو اللغة (لا مدرّسون)." },
    { t: "mcq", sn: "أل التعريف", q: "المضاف لا يدخله:", o: ["الإعراب", "أل التعريف مباشرة", "الجرّ", "التنوين فقط في كل الحالات"], a: 1, e: "لا يجتمع التنوين أو أل مع الإضافة في المضاف." },
    { t: "mcq", sn: "معنى الإضافة", q: "الإضافة تفيد المضاف:", o: ["التنكير دائمًا", "التعريف أو التخصيص حسب المضاف إليه", "لا تفيد شيئًا", "الجمع دائمًا"], a: 1, e: "تُعرّفه إن أُضيف لمعرفة، وتخصّصه إن أُضيف لنكرة." },
    { t: "mcq", sn: "تطبيق", q: "في «طالبتا الصفِّ نشيطتانِ»، المضاف:", o: ["طالبتا", "الصفِّ", "نشيطتان", "لا مضاف"], a: 0, e: "تجرّد من نون المثنى." },
    { t: "mcq", sn: "تطبيق", q: "في «بابُ البيتِ مفتوحٌ»، المضاف إليه:", o: ["باب", "البيت", "مفتوح", "لا مضاف إليه"], a: 1, e: "الاسم المجرور بعد المضاف." },
    { t: "tf", sn: "حكم المضاف إليه", q: "المضاف إليه مرفوع دائمًا.", a: false, e: "مجرور دائمًا." },
    { t: "tf", sn: "تجرّد المضاف", q: "المضاف المفرد يحتفظ بتنوينه.", a: false, e: "يتجرّد من التنوين وجوبًا." },
    { t: "tf", sn: "تجرّد المثنى", q: "المضاف المثنى يتجرّد من نونه.", a: true, e: "صحيح، مثل: معلّما لا معلّمان." },
    { t: "tf", sn: "أل التعريف", q: "يجوز أن يجتمع المضاف مع أل التعريف والتنوين معًا.", a: false, e: "لا يجتمعان مع الإضافة." },
    { t: "tf", sn: "تطبيق", q: "«كتابُ الطالبِ» المضاف فيها هو «الطالب».", a: false, e: "المضاف هو «كتابُ»، والمضاف إليه «الطالب»." },
    { t: "fill", sn: "تعيين المضاف إليه", q: "استخرج المضاف إليه من «قلمُ المعلّمِ».", a: ["المعلم", "المعلّم", "المعلّمِ"], e: "الاسم المجرور بعد المضاف." },
    { t: "fill", sn: "تعيين المضاف", q: "استخرج المضاف من «حقيبةُ الطالبةِ».", a: ["حقيبة", "حقيبةُ"], e: "الاسم الأول المتجرّد من التنوين." },
    { t: "fill", sn: "التطبيق", q: "أكمل: المضاف إليه حكمه الإعرابي ____.", a: ["مجرور", "الجر"], e: "حكم ثابت." },
    { t: "fill", sn: "التحويل", q: "أضف «معلّمان» إلى «المدرسة» بصيغة الإضافة الصحيحة (احذف النون).", a: ["معلما المدرسة", "معلّما المدرسةِ"], e: "المضاف المثنى يتجرّد من النون." },
    { t: "fill", sn: "التحويل", q: "أضف «مدرّسون» إلى «اللغة» بصيغة الإضافة الصحيحة (احذف النون).", a: ["مدرسو اللغة", "مدرّسو اللغةِ"], e: "المضاف جمع المذكر السالم يتجرّد من النون." },
    { t: "match", sn: "تعيين المضاف والمضاف إليه", q: "طابق كل عبارة بمضافها إليه.",
      pairs: [["كتابُ الطالبِ", "الطالبِ"], ["حقيبةُ المعلّمةِ", "المعلّمةِ"], ["بابُ البيتِ", "البيتِ"], ["قلمُ الطالبةِ", "الطالبةِ"]], e: "المضاف إليه هو الاسم الثاني المجرور." },
    { t: "match", sn: "نوع المضاف", q: "طابق كل عبارة بنوع المضاف فيها.",
      pairs: [["كتابُ الطالبِ", "مضاف مفرد"], ["معلّما المدرسةِ", "مضاف مثنى"], ["مدرّسو اللغةِ", "مضاف جمع مذكر سالم"]], e: "أنواع المضاف الثلاثة الأساسية." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["هذا", "كتابٌ", "الطالبِ", "الجديد"], a: 1, fix: "كتابُ", e: "المضاف يتجرّد من التنوين." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["حضر", "معلّمانِ", "المدرسةِ", "باكرًا"], a: 1, fix: "معلّما", e: "المضاف المثنى يتجرّد من النون." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["قابلتُ", "مدرّسونَ", "اللغةِ", "أمس"], a: 1, fix: "مدرّسي", e: "المضاف جمع المذكر السالم يتجرّد من النون." },
  ],
};

const C27 = {
  id: "c-tamyiz-9", title: "التمييز", domain: "GR", grade: 9, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب التمييز، ويميّز بين تمييز الذات (المفرد) وتمييز النسبة (الجملة).",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ الكلمة التي تُزيل غموض ما قبلها في كل جملة.",
      table: { head: ["الجملة", "الكلمة المبهمة قبل التمييز", "التمييز", "حكمه الإعرابي"],
        rows: [["اشتريتُ عشرين كتابًا", "عشرين (عدد مبهم)", "كتابًا", "منصوب"], ["عندي كيلو تمرٍ", "كيلو (وزن مبهم)", "تمرٍ", "مجرور بالإضافة"],
               ["ازداد الوطنُ تقدّمًا", "ازداد (نسبة مبهمة، ماذا ازداد؟)", "تقدّمًا", "منصوب"]] },
      checks: [
        { t: "mcq", q: "ما وظيفة التمييز في كل الأمثلة؟", o: ["تزيين الجملة فقط", "إزالة غموض كلمة أو نسبة قبله", "لا وظيفة له", "تكرار المعنى"], a: 1, e: "التمييز يوضّح المقصود من كلمة أو نسبة مبهمة." },
        { t: "mcq", q: "ما الحكم الإعرابي الغالب للتمييز؟", o: ["مرفوع دائمًا", "منصوب غالبًا (وقد يُجرّ بالإضافة أو بمن)", "مجزوم", "لا إعراب"], a: 1, e: "الأصل النصب، وقد يُجرّ في حالات محدَّدة." }],
      reveal: "استنتجت: التمييز اسم نكرة يوضّح المقصود من اسم مبهم قبله (تمييز الذات) أو من نسبة غامضة في جملة كاملة (تمييز النسبة)." },
    { t: "rule", title: "نوعا التمييز", strat: "التمثيل البصري",
      body: "تمييز الذات (المفرد): يوضّح المقصود من اسم مبهم كالأعداد والمقادير (وزن، كيل، مساحة). تمييز النسبة (الجملة): يوضّح المقصود من نسبة غامضة بين فعل وفاعله أو اسمين في الجملة.",
      concepts: [{ label: "تمييز الذات", note: "بعد عدد أو مقدار (وزن، كيل، مساحة)" }, { label: "تمييز النسبة", note: "يوضّح غموض جملة كاملة" }, { label: "الحكم", note: "الأصل النصب، وقد يُجرّ بالإضافة أو بـ«من»" }],
      note: "مثال تمييز مجرور بالإضافة: «كيلو تمرٍ». مثال تمييز مجرور بـ«من»: «عندي كيلو من التمر»." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تعيين التمييز ونوعه.",
      items: [
        { w: "اشتريتُ عشرين كتابًا", steps: ["حدّد الكلمة المبهمة: عشرين (عدد)", "حدّد التمييز: كتابًا", "النوع: تمييز ذات (بعد عدد)", "الحكم: منصوب"] },
        { w: "عندي كيلو تمرٍ", steps: ["حدّد الكلمة المبهمة: كيلو (وزن)", "حدّد التمييز: تمرٍ", "النوع: تمييز ذات (بعد مقدار وزن)", "الحكم: مجرور بالإضافة"] },
        { w: "ازداد الوطنُ تقدّمًا", steps: ["حدّد النسبة الغامضة: ازداد الوطن (ماذا ازداد؟)", "حدّد التمييز: تقدّمًا", "النوع: تمييز نسبة (يوضّح الجملة كلها)", "الحكم: منصوب"] },
        { w: "طاب محمدٌ نفسًا", steps: ["حدّد النسبة الغامضة: طاب محمد (من أيّ جهة طاب؟)", "حدّد التمييز: نفسًا", "النوع: تمييز نسبة", "الحكم: منصوب"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة حسب نوع تمييزها.",
      cats: ["تمييز ذات", "تمييز نسبة"],
      items: [["اشتريتُ عشرين قلمًا", "تمييز ذات"], ["ازداد الإنتاجُ كمًّا", "تمييز نسبة"], ["عندي مترٌ قماشًا", "تمييز ذات"],
              ["طابت النفسُ سرورًا", "تمييز نسبة"], ["ملكتُ فدّانًا أرضًا", "تمييز ذات"], ["تفجّر النبعُ ماءً", "تمييز نسبة"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "التمييز اسم نكرة يوضّح غموض ما قبله: تمييز ذات بعد عدد أو مقدار، وتمييز نسبة يوضّح جملة كاملة.",
      bullets: ["تمييز الذات: بعد عدد أو مقدار", "تمييز النسبة: يوضّح جملة كاملة", "الحكم الأصلي: منصوب", "قد يُجرّ بالإضافة أو بمن"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "حكم التمييز", q: "الحكم الإعرابي الأصلي للتمييز:", o: ["مرفوع", "منصوب", "مجزوم", "لا إعراب"], a: 1, e: "الأصل النصب." },
    { t: "mcq", sn: "تعيين التمييز", q: "التمييز في «اشتريتُ عشرين كتابًا»:", o: ["عشرين", "كتابًا", "اشتريتُ", "لا تمييز"], a: 1, e: "يوضّح المقصود من العدد المبهم." },
    { t: "mcq", sn: "تمييز الذات", q: "تمييز الذات يأتي بعد:", o: ["فعل فقط", "عدد أو مقدار (وزن، كيل، مساحة)", "حرف جر فقط", "لا شرط له"], a: 1, e: "هذا موضعه الأساسي." },
    { t: "mcq", sn: "تمييز النسبة", q: "تمييز النسبة يوضّح:", o: ["اسمًا مفردًا مبهمًا", "غموض نسبة بين فعل وفاعله أو اسمين", "عددًا فقط", "لا شيء"], a: 1, e: "يوضّح جملة كاملة لا كلمة واحدة." },
    { t: "mcq", sn: "تطبيق", q: "في «عندي كيلو تمرٍ»، حكم التمييز:", o: ["منصوب", "مجرور بالإضافة", "مرفوع", "لا إعراب"], a: 1, e: "بعد المقادير يُجرّ التمييز بالإضافة غالبًا." },
    { t: "mcq", sn: "تطبيق", q: "في «ازداد الوطنُ تقدّمًا»، نوع التمييز:", o: ["تمييز ذات", "تمييز نسبة", "لا تمييز", "مفعول به"], a: 1, e: "يوضّح غموض النسبة في الجملة كلها." },
    { t: "mcq", sn: "الجرّ بمن", q: "يجوز جرّ التمييز بـ«من» في مثل:", o: ["عندي كيلو من التمر", "اشتريتُ عشرين كتابًا", "ازداد تقدّمًا", "لا يجوز أبدًا"], a: 0, e: "من صور جرّ التمييز الجائزة." },
    { t: "mcq", sn: "تمييز", q: "الفارق بين تمييز الذات وتمييز النسبة:", o: ["لا فرق", "الذات يوضّح كلمة مبهمة، والنسبة يوضّح جملة غامضة", "النسبة فقط منصوبة", "الذات لا يُعرب"], a: 1, e: "هذا الفارق الجوهري بينهما." },
    { t: "mcq", sn: "تطبيق", q: "في «طاب محمدٌ نفسًا»، التمييز:", o: ["محمد", "نفسًا", "طاب", "لا تمييز"], a: 1, e: "يوضّح جهة الطيب (تمييز نسبة)." },
    { t: "mcq", sn: "تطبيق", q: "في «ملكتُ فدّانًا أرضًا»، نوع التمييز:", o: ["تمييز ذات (بعد مقدار مساحة)", "تمييز نسبة", "لا تمييز", "مفعول مطلق"], a: 0, e: "الفدّان مقدار مساحة." },
    { t: "tf", sn: "حكم التمييز", q: "التمييز مرفوع في كل حالاته.", a: false, e: "الأصل النصب، وقد يُجرّ." },
    { t: "tf", sn: "تمييز الذات", q: "تمييز الذات يأتي بعد الأعداد والمقادير.", a: true, e: "هذا موضعه الأساسي." },
    { t: "tf", sn: "تمييز النسبة", q: "تمييز النسبة يوضّح كلمة مفردة لا جملة.", a: false, e: "يوضّح غموض جملة كاملة." },
    { t: "tf", sn: "تطبيق", q: "«اشتريتُ عشرين كتابًا» فيها تمييز ذات.", a: true, e: "بعد عدد مبهم." },
    { t: "tf", sn: "الجرّ", q: "يمكن جرّ التمييز بالإضافة أو بـ«من».", a: true, e: "صورتان جائزتان لجرّ التمييز." },
    { t: "fill", sn: "تعيين التمييز", q: "استخرج التمييز من «عندي مترٌ قماشًا».", a: ["قماشا", "قماشًا"], e: "يوضّح المقصود من المقدار (متر)." },
    { t: "fill", sn: "تحديد النوع", q: "«ازداد الإنتاجُ كمًّا» — اكتب نوع التمييز (كلمتان).", a: ["تمييز نسبة"], e: "يوضّح غموض النسبة في الجملة." },
    { t: "fill", sn: "التطبيق", q: "أكمل: التمييز اسم ____ يوضّح غموض ما قبله.", a: ["نكرة"], e: "حكمه من حيث التعريف والتنكير." },
    { t: "fill", sn: "تطبيق", q: "صوّب: «اشتريتُ عشرين كتابٌ» (اضبط التمييز).", a: ["كتابا", "كتابًا"], e: "التمييز منصوب." },
    { t: "fill", sn: "تطبيق", q: "اكتب تمييزًا مناسبًا لـ«عندي كيلو ____» (اسم فاكهة أو مادة).", a: ["تفاح", "سكر", "أرز", "تمر"], e: "أي اسم مادة نكرة مناسب يُقبل." },
    { t: "match", sn: "تعيين التمييز", q: "طابق كل جملة بتمييزها.",
      pairs: [["اشتريتُ عشرين كتابًا", "كتابًا"], ["عندي كيلو تمرٍ", "تمرٍ"], ["ازداد الوطنُ تقدّمًا", "تقدّمًا"], ["طاب محمدٌ نفسًا", "نفسًا"]], e: "التمييز يزيل الغموض." },
    { t: "match", sn: "نوع التمييز", q: "طابق كل جملة بنوع تمييزها.",
      pairs: [["اشتريتُ عشرين قلمًا", "تمييز ذات"], ["ازداد الإنتاجُ كمًّا", "تمييز نسبة"], ["عندي مترٌ قماشًا", "تمييز ذات"], ["تفجّر النبعُ ماءً", "تمييز نسبة"]], e: "بعد عدد أو مقدار = ذات، وإلا فنسبة." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["اشتريتُ", "عشرين", "كتابٌ", "جديد"], a: 2, fix: "كتابًا", e: "التمييز منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["ازداد", "الوطنُ", "تقدّمٌ", "كثيرًا"], a: 2, fix: "تقدّمًا", e: "تمييز النسبة منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["ملكتُ", "فدّانًا", "أرضٌ", "خصبة"], a: 2, fix: "أرضًا", e: "تمييز الذات منصوب." },
  ],
};

const C28 = {
  id: "c-aqsam-kalam-3", title: "أقسام الكلام: اسم وفعل وحرف", domain: "GR", grade: 3, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يصنّف الطالب أي كلمة إلى اسم أو فعل أو حرف باستعمال علامات كل قسم.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "جرّب إدخال «أل» أو تنوينًا على كل كلمة، وجرّب إسنادها لتاء الفاعل (فعلتُ)، ولاحظ ماذا يحدث.",
      table: { head: ["الكلمة", "أل / تنوين؟", "تاء الفاعل؟", "القسم"],
        rows: [["كتاب", "الكتاب ✓ / كتابٌ ✓", "لا يصحّ", "اسم"], ["كتبَ", "لا يصحّ", "كتبْتُ ✓", "فعل"], ["في", "لا يصحّ", "لا يصحّ", "حرف"]] },
      checks: [
        { t: "mcq", q: "ما العلامة التي قبلت الاسم ورفضها الفعل والحرف؟", o: ["تاء الفاعل", "أل والتنوين", "لا علامة مشتركة", "الطول"], a: 1, e: "أل والتنوين من أخصّ علامات الاسم." },
        { t: "mcq", q: "الحرف لم يقبل أيًّا من العلامتين. ماذا يدلّ ذلك؟", o: ["أنه اسم مموّه", "أن الحرف لا معنى له بذاته، ويحتاج غيره ليكتمل معناه", "أنه فعل ناقص", "لا دلالة"], a: 1, e: "الحرف يربط الكلام ولا يقبل علامات الاسم أو الفعل." }],
      reveal: "استنتجت: الكلمة العربية ثلاثة أقسام: اسم (يقبل أل والتنوين)، فعل (يقبل تاء الفاعل ويقترن بزمن)، حرف (لا يقبل أيًّا منهما، ويربط الكلام)." },
    { t: "rule", title: "علامات الأقسام الثلاثة", strat: "التمثيل البصري",
      body: "الاسم: يدلّ على إنسان أو شيء أو مكان أو معنى، وعلاماته: التنوين، أل، الجرّ، النداء. الفعل: يدلّ على حدث مقترن بزمن (ماضٍ، مضارع، أمر)، وعلاماته: تاء الفاعل، ياء المخاطبة، قد، السين وسوف. الحرف: لا معنى له بذاته، يربط الكلام، ولا يقبل أيًّا من علامات الاسم أو الفعل.",
      concepts: [{ label: "الاسم", note: "أل، تنوين، جرّ، نداء" }, { label: "الفعل", note: "تاء الفاعل، ياء المخاطبة، قد، السين/سوف" }, { label: "الحرف", note: "لا يقبل أي علامة من علامتيهما" }],
      note: "أمثلة الحروف الشائعة: في، على، من، إلى، عن، و، ثم، لا، هل، بل." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الكلمة لترى خطوات تصنيفها.",
      items: [
        { w: "مدرسة", steps: ["جرّب أل: المدرسة ✓", "جرّب التنوين: مدرسةٌ ✓", "قبلت علامات الاسم", "اسم"] },
        { w: "يكتبُ", steps: ["جرّب أل أو التنوين: لا يصحّ", "جرّب ياء المخاطبة: تكتبين ✓ (بعد تحويل الصيغة)", "قبلت علامة من علامات الفعل واقترنت بزمن الحاضر", "فعل مضارع"] },
        { w: "على", steps: ["جرّب أل أو التنوين: لا يصحّ", "جرّب تاء الفاعل: لا يصحّ", "لم تقبل أي علامة", "حرف"] },
        { w: "كتبَ", steps: ["جرّب تاء الفاعل: كتبْتُ ✓", "اقترنت بزمن الماضي", "قبلت علامة من علامات الفعل", "فعل ماضٍ"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "وزّع الكلمات على أقسامها الثلاثة.",
      cats: ["اسم", "فعل", "حرف"],
      items: [["قلم", "اسم"], ["ذهبَ", "فعل"], ["إلى", "حرف"], ["مدرسة", "اسم"], ["يلعبُ", "فعل"], ["و", "حرف"], ["كتاب", "اسم"], ["اكتبْ", "فعل"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "الكلمة العربية ثلاثة أقسام: اسم يقبل أل والتنوين، فعل يقبل تاء الفاعل ويقترن بزمن، حرف لا يقبل أيًّا منهما ويربط الكلام.",
      bullets: ["اسم: أل، تنوين، جرّ", "فعل: تاء الفاعل، زمن", "حرف: لا علامة، يربط", "اختبر بإدخال العلامات"],
      note: "الاختبار 25 سؤالًا متنوعًا بكلمات جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "علامة الاسم", q: "من أخصّ علامات الاسم:", o: ["تاء الفاعل", "أل والتنوين", "قد", "السين"], a: 1, e: "هاتان أخصّ علامتين للاسم." },
    { t: "mcq", sn: "علامة الفعل", q: "من أخصّ علامات الفعل:", o: ["أل التعريف", "تاء الفاعل", "التنوين", "الجرّ"], a: 1, e: "تاء الفاعل تقبلها الأفعال فقط." },
    { t: "mcq", sn: "تصنيف", q: "كلمة «حديقة» قسمها:", o: ["اسم", "فعل", "حرف", "لا قسم"], a: 0, e: "تقبل أل والتنوين." },
    { t: "mcq", sn: "تصنيف", q: "كلمة «لعبَ» قسمها:", o: ["اسم", "فعل ماضٍ", "حرف", "لا قسم"], a: 1, e: "تقبل تاء الفاعل: لعبْتُ." },
    { t: "mcq", sn: "تصنيف", q: "كلمة «من» (حرف جر) قسمها:", o: ["اسم", "فعل", "حرف", "لا قسم"], a: 2, e: "لا تقبل علامات الاسم أو الفعل." },
    { t: "mcq", sn: "تعريف الحرف", q: "الحرف كلمة:", o: ["لها معنى كامل بذاتها", "لا معنى لها إلا مع غيرها، تربط الكلام", "تقبل أل دائمًا", "تدل على زمن"], a: 1, e: "هذا تعريف الحرف الدقيق." },
    { t: "mcq", sn: "أقسام الفعل", q: "الفعل ينقسم من حيث الزمن إلى:", o: ["نوعين فقط", "ماضٍ ومضارع وأمر", "اسم وفعل", "لا ينقسم"], a: 1, e: "ثلاثة أزمنة للفعل." },
    { t: "mcq", sn: "تصنيف", q: "كلمة «اكتبْ» قسمها:", o: ["اسم", "فعل أمر", "حرف", "لا قسم"], a: 1, e: "فعل يطلب تحقيق الكتابة." },
    { t: "mcq", sn: "علامة إضافية", q: "من علامات الفعل المضارع:", o: ["أل التعريف", "السين وسوف للاستقبال", "التنوين", "الجرّ"], a: 1, e: "السين وسوف تدخلان على المضارع للدلالة على المستقبل." },
    { t: "mcq", sn: "تصنيف", q: "كلمة «هل» (أداة استفهام) قسمها:", o: ["اسم", "فعل", "حرف", "لا قسم"], a: 2, e: "لا تقبل علامات الاسم أو الفعل." },
    { t: "tf", sn: "علامة الاسم", q: "الاسم يقبل دخول أل عليه.", a: true, e: "من أخصّ علاماته." },
    { t: "tf", sn: "علامة الفعل", q: "الفعل يقبل التنوين.", a: false, e: "التنوين من علامات الاسم لا الفعل." },
    { t: "tf", sn: "الحرف", q: "الحرف له معنى كامل بذاته كالاسم.", a: false, e: "لا معنى له إلا بارتباطه بغيره." },
    { t: "tf", sn: "تصنيف", q: "«مدرسة» اسم لأنها تقبل أل والتنوين.", a: true, e: "صحيح." },
    { t: "tf", sn: "تصنيف", q: "«ذهبَ» حرف.", a: false, e: "فعل ماضٍ؛ يقبل تاء الفاعل." },
    { t: "fill", sn: "التصنيف", q: "صنّف كلمة «قلم» (اسم أم فعل أم حرف).", a: ["اسم"], e: "تقبل أل والتنوين." },
    { t: "fill", sn: "التصنيف", q: "صنّف كلمة «يلعبُ».", a: ["فعل", "فعل مضارع"], e: "يقترن بزمن الحاضر." },
    { t: "fill", sn: "التصنيف", q: "صنّف كلمة «في».", a: ["حرف"], e: "لا تقبل علامات الاسم أو الفعل." },
    { t: "fill", sn: "التطبيق", q: "أكمل: من علامات الاسم أل و____.", a: ["التنوين"], e: "العلامة الثانية الأخصّ." },
    { t: "fill", sn: "التطبيق", q: "أكمل: من علامات الفعل تاء ____.", a: ["الفاعل"], e: "العلامة الأساسية للفعل." },
    { t: "match", sn: "التصنيف", q: "طابق كل كلمة بقسمها.",
      pairs: [["قلم", "اسم"], ["ذهبَ", "فعل"], ["إلى", "حرف"], ["مدرسة", "اسم"]], e: "طبّق اختبار العلامات." },
    { t: "match", sn: "العلامة والقسم", q: "طابق كل علامة بالقسم الذي تخصّه.",
      pairs: [["أل والتنوين", "الاسم"], ["تاء الفاعل", "الفعل"], ["لا علامة، تربط الكلام", "الحرف"]], e: "لكل قسم علاماته." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المصنَّفة خطأً بأنها اسم في جملة «ذهبَ الطالبُ إلى المدرسةِ».", words: ["ذهبَ", "الطالبُ", "إلى", "المدرسةِ"], a: 0, fix: "ذهبَ فعل لا اسم", e: "تقبل تاء الفاعل (ذهبْتُ) فهي فعل." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي هي حرف في الجملة.", words: ["كتب", "الطالب", "الدرس", "في"], a: 3, fix: "في (حرف جر)", e: "لا تقبل علامات الاسم أو الفعل." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة التي هي فعل في الجملة.", words: ["الحديقة", "جميلة", "تُزهر", "دائمًا"], a: 2, fix: "تُزهر (فعل مضارع)", e: "تقترن بزمن الحاضر وتقبل علامات الفعل." },
  ],
};

const C29 = {
  id: "c-jumla-filiyya-4", title: "الجملة الفعلية وأركانها", domain: "GR", grade: 4, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب أركان الجملة الفعلية (الفعل والفاعل والمفعول به إن وُجد)، ويرتّبها ترتيبًا صحيحًا.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ ترتيب الكلمات في كل جملة، وحدّد وظيفة كل كلمة.",
      table: { head: ["الجملة", "الفعل", "الفاعل", "المفعول به (إن وُجد)"],
        rows: [["نامَ الطفلُ", "نامَ", "الطفلُ", "لا يوجد (فعل لازم)"], ["كتبَ الطالبُ الدرسَ", "كتبَ", "الطالبُ", "الدرسَ"],
               ["يلعبُ الأطفالُ", "يلعبُ", "الأطفالُ", "لا يوجد (فعل لازم)"]] },
      checks: [
        { t: "mcq", q: "ما الترتيب الأساسي لعناصر الجملة الفعلية؟", o: ["فاعل، فعل، مفعول", "فعل، فاعل، مفعول به", "مفعول، فعل، فاعل", "لا ترتيب"], a: 1, e: "هذا الترتيب الأشيع في العربية." },
        { t: "mcq", q: "هل كل جملة فعلية تحتاج مفعولًا به؟", o: ["نعم دائمًا", "لا، فقط الأفعال المتعدّية تحتاجه", "لا يوجد فرق", "المفعول به إجباري دومًا"], a: 1, e: "الفعل اللازم يكتفي بالفاعل، والمتعدّي يحتاج مفعولًا به." }],
      reveal: "استنتجت: الجملة الفعلية تتكوّن من فعل وفاعل وجوبًا، ومفعول به إن كان الفعل متعدّيًا (يحتاج من يقع عليه الحدث)." },
    { t: "rule", title: "أركان الجملة الفعلية", strat: "التمثيل البصري",
      body: "الجملة الفعلية تبدأ بفعل، ولها ركنان أساسيان: الفعل والفاعل (لا تصحّ الجملة الفعلية بدونهما)، وركن ثالث اختياري: المفعول به (يظهر فقط مع الأفعال المتعدّية).",
      concepts: [{ label: "الفعل", note: "يدلّ على الحدث وزمنه" }, { label: "الفاعل", note: "من قام بالفعل، مرفوع وجوبًا" }, { label: "المفعول به", note: "من وقع عليه الفعل، منصوب، اختياري حسب نوع الفعل" }],
      note: "الفعل اللازم يكتفي بفاعله (نامَ الطفلُ)، والفعل المتعدّي يحتاج مفعولًا به لتمام المعنى (كتبَ الطالبُ الدرسَ)." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تحليل أركانها.",
      items: [
        { w: "طار العصفورُ", steps: ["حدّد الفعل: طار", "حدّد الفاعل: العصفورُ (مرفوع)", "هل الفعل متعدٍّ؟ لا (لازم)", "الجملة مكتملة بفعل وفاعل فقط"] },
        { w: "أكل الولدُ التفاحةَ", steps: ["حدّد الفعل: أكل", "حدّد الفاعل: الولدُ (مرفوع)", "هل الفعل متعدٍّ؟ نعم", "المفعول به: التفاحةَ (منصوب)"] },
        { w: "يشرب الطفلُ الحليبَ", steps: ["حدّد الفعل: يشرب (مضارع)", "حدّد الفاعل: الطفلُ (مرفوع)", "هل الفعل متعدٍّ؟ نعم", "المفعول به: الحليبَ (منصوب)"] },
        { w: "جلستْ الفتاةُ", steps: ["حدّد الفعل: جلستْ", "حدّد الفاعل: الفتاةُ (مرفوع، وتاء التأنيث في الفعل تطابقه)", "هل الفعل متعدٍّ؟ لا (لازم)", "الجملة مكتملة بفعل وفاعل فقط"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة حسب أركانها.",
      cats: ["فعل وفاعل فقط (لازم)", "فعل وفاعل ومفعول به (متعدٍّ)"],
      items: [["نامَ الطفلُ", "فعل وفاعل فقط (لازم)"], ["كتبَ الطالبُ الدرسَ", "فعل وفاعل ومفعول به (متعدٍّ)"],
              ["ذهبَ الرجلُ", "فعل وفاعل فقط (لازم)"], ["قرأ الطالبُ القصةَ", "فعل وفاعل ومفعول به (متعدٍّ)"],
              ["ضحكَ الطفلُ", "فعل وفاعل فقط (لازم)"], ["شرب الولدُ العصيرَ", "فعل وفاعل ومفعول به (متعدٍّ)"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "الجملة الفعلية: فعل وفاعل وجوبًا، ومفعول به إن كان الفعل متعدّيًا.",
      bullets: ["الترتيب: فعل، فاعل، مفعول به", "الفعل والفاعل: ركنان أساسيان", "المفعول به: مع الأفعال المتعدّية فقط", "الفاعل: مرفوع دائمًا"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "أركان الجملة", q: "الركنان الأساسيان اللذان لا تصحّ الجملة الفعلية بدونهما:", o: ["الفعل والمفعول به", "الفعل والفاعل", "الفاعل والمفعول به", "لا أركان ثابتة"], a: 1, e: "لا جملة فعلية بلا فعل وفاعل." },
    { t: "mcq", sn: "تعيين الفعل", q: "الفعل في «كتبَ الطالبُ الدرسَ»:", o: ["كتبَ", "الطالبُ", "الدرسَ", "لا فعل"], a: 0, e: "الكلمة الدالة على الحدث." },
    { t: "mcq", sn: "تعيين الفاعل", q: "الفاعل في «طار العصفورُ»:", o: ["طار", "العصفورُ", "لا فاعل", "كلاهما"], a: 1, e: "من قام بالفعل." },
    { t: "mcq", sn: "الفعل اللازم", q: "الفعل اللازم:", o: ["يحتاج مفعولًا به دائمًا", "يكتفي بالفاعل ولا يحتاج مفعولًا به", "لا فاعل له", "لا يُستعمل في العربية"], a: 1, e: "يكتمل معناه بالفاعل وحده." },
    { t: "mcq", sn: "الفعل المتعدّي", q: "الفعل المتعدّي:", o: ["يكتفي بالفاعل", "يحتاج مفعولًا به ليكتمل معناه", "لا فاعل له", "لا يُنصب مفعوله"], a: 1, e: "يحتاج من يقع عليه الحدث." },
    { t: "mcq", sn: "تطبيق", q: "«نامَ الطفلُ» — هل الفعل لازم أم متعدٍّ؟", o: ["لازم", "متعدٍّ", "كلاهما", "لا فعل"], a: 0, e: "يكتفي بالفاعل، لا يحتاج مفعولًا به." },
    { t: "mcq", sn: "تطبيق", q: "«شرب الولدُ العصيرَ» — هل الفعل لازم أم متعدٍّ؟", o: ["لازم", "متعدٍّ", "كلاهما", "لا فعل"], a: 1, e: "يحتاج مفعولًا به (العصيرَ)." },
    { t: "mcq", sn: "حكم الفاعل", q: "الفاعل حكمه الإعرابي:", o: ["منصوب", "مرفوع", "مجرور", "لا إعراب"], a: 1, e: "مرفوع دائمًا." },
    { t: "mcq", sn: "حكم المفعول به", q: "المفعول به حكمه الإعرابي:", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 1, e: "منصوب دائمًا." },
    { t: "mcq", sn: "الترتيب", q: "الترتيب الأصلي للجملة الفعلية:", o: ["فاعل، فعل، مفعول", "فعل، فاعل، مفعول به", "مفعول، فاعل، فعل", "لا ترتيب ثابت"], a: 1, e: "الفعل يبدأ الجملة الفعلية غالبًا." },
    { t: "tf", sn: "أركان الجملة", q: "لا تصحّ الجملة الفعلية بدون فعل وفاعل.", a: true, e: "ركنان أساسيان لا غنى عنهما." },
    { t: "tf", sn: "المفعول به", q: "كل جملة فعلية تحتاج مفعولًا به.", a: false, e: "فقط الأفعال المتعدّية تحتاجه." },
    { t: "tf", sn: "حكم الفاعل", q: "الفاعل منصوب.", a: false, e: "مرفوع دائمًا." },
    { t: "tf", sn: "تطبيق", q: "«ذهبَ الرجلُ» فعلها لازم.", a: true, e: "يكتفي بالفاعل." },
    { t: "tf", sn: "تطبيق", q: "«قرأ الطالبُ القصةَ» فعلها لازم.", a: false, e: "متعدٍّ؛ يحتاج مفعولًا به." },
    { t: "fill", sn: "تعيين الفعل", q: "استخرج الفعل من «يلعبُ الأطفالُ في الحديقةِ».", a: ["يلعب", "يلعبُ"], e: "الكلمة الدالة على الحدث." },
    { t: "fill", sn: "تعيين الفاعل", q: "استخرج الفاعل من «ضحكَ الطفلُ بفرحٍ».", a: ["الطفل", "الطفلُ"], e: "من قام بالفعل." },
    { t: "fill", sn: "تعيين المفعول به", q: "استخرج المفعول به من «قرأ الطالبُ القصةَ».", a: ["القصة", "القصةَ"], e: "من وقع عليه الفعل." },
    { t: "fill", sn: "التطبيق", q: "أكمل: الجملة الفعلية تبدأ بـ____.", a: ["فعل"], e: "الفعل هو الركن الأول غالبًا." },
    { t: "fill", sn: "تطبيق", q: "صوّب: «شرب الولدُ العصيرُ» (اضبط المفعول به).", a: ["العصير", "العصيرَ"], e: "المفعول به منصوب لا مرفوع." },
    { t: "match", sn: "تعيين الأركان", q: "طابق كل جملة بفعلها وفاعلها.",
      pairs: [["نامَ الطفلُ", "نامَ / الطفلُ"], ["طار العصفورُ", "طار / العصفورُ"], ["كتبَ الطالبُ الدرسَ", "كتبَ / الطالبُ"]], e: "الفعل أولًا، ثم الفاعل." },
    { t: "match", sn: "لازم أم متعدٍّ", q: "طابق كل جملة بنوع فعلها.",
      pairs: [["نامَ الطفلُ", "لازم"], ["كتبَ الطالبُ الدرسَ", "متعدٍّ"], ["ذهبَ الرجلُ", "لازم"], ["قرأ الطالبُ القصةَ", "متعدٍّ"]], e: "المتعدّي يحتاج مفعولًا به، واللازم لا يحتاجه." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["كتبَ", "الطالبَ", "الدرسَ", "بعناية"], a: 1, fix: "الطالبُ", e: "الفاعل مرفوع لا منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["شرب", "الولدُ", "العصيرُ", "بسرعة"], a: 2, fix: "العصيرَ", e: "المفعول به منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["نامَ", "الطفلَ", "مبكرًا", "أمس"], a: 1, fix: "الطفلُ", e: "الفاعل مرفوع لا منصوب." },
  ],
};

const C30 = {
  id: "c-afaal-mafoulayn-8", title: "الأفعال الناصبة لمفعولين", domain: "GR", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يميّز الطالب أفعال القلوب من أفعال التحويل والعطاء، ويعرب مفعوليهما.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "قارن كل جملتين: الجملة الاسمية الأصلية، والجملة بعد دخول الفعل عليها.",
      table: { head: ["الجملة الأصلية", "بعد دخول الفعل", "نوع الفعل", "أصل المفعولين"],
        rows: [["الجوُّ باردٌ", "ظننتُ الجوَّ باردًا", "من أفعال القلوب", "أصلهما مبتدأ وخبر"],
               ["الطالبُ مجتهدٌ", "علمتُ الطالبَ مجتهدًا", "من أفعال القلوب", "أصلهما مبتدأ وخبر"],
               ["لا مبتدأ وخبر هنا أصلًا", "أعطى المعلمُ الطالبَ كتابًا", "من أفعال العطاء", "ليسا أصلهما مبتدأ وخبر"]] },
      checks: [
        { t: "mcq", q: "ما أصل المفعولين بعد أفعال مثل «ظنّ» و«علم»؟", o: ["لا أصل لهما", "أصلهما مبتدأ وخبر في جملة اسمية", "أصلهما فاعل ومفعول", "أصلهما مضاف ومضاف إليه"], a: 1, e: "أفعال القلوب تدخل على جملة اسمية أصلها مبتدأ وخبر." },
        { t: "mcq", q: "هل مفعولا «أعطى» أصلهما مبتدأ وخبر؟", o: ["نعم دائمًا", "لا، فهما اسمان مستقلّان لا علاقة مبتدأ وخبر بينهما", "أحيانًا فقط", "لا مفعولين لأعطى"], a: 1, e: "أفعال العطاء تنصب مفعولين مستقلّين لا علاقة إسنادية بينهما." }],
      reveal: "استنتجت: قسمان من الأفعال تنصب مفعولين: أفعال القلوب (كظنّ وعلم) وأصل مفعوليها مبتدأ وخبر، وأفعال العطاء والتحويل (كأعطى وكسا) وليس أصل مفعوليها مبتدأ وخبر." },
    { t: "rule", title: "قسما الأفعال الناصبة لمفعولين", strat: "التمثيل البصري",
      body: "أفعال القلوب: ظنّ، حسب، خال، زعم، رأى (العلمية)، علم، وجد (العلمية)، درى — تنصب مفعولين أصلهما مبتدأ وخبر لأنها تدخل على جملة اسمية. أفعال العطاء والتحويل: أعطى، منح، وهب، كسا، ألبس — تنصب مفعولين ليس بينهما علاقة إسنادية.",
      concepts: [{ label: "أفعال القلوب", note: "ظنّ، حسب، خال، علم — المفعولان أصلهما مبتدأ وخبر" }, { label: "أفعال العطاء", note: "أعطى، منح، كسا — مفعولان مستقلّان" }, { label: "الحكم المشترك", note: "كلا المفعولين منصوب في القسمين" }],
      note: "تمييز عملي: إن استطعت حذف الفعل وتحويل الباقي إلى جملة اسمية مفيدة (مبتدأ وخبر)، فالفعل من أفعال القلوب. «ظننتُ الجوَّ باردًا» ← «الجوُّ باردٌ» جملة مفيدة. أما «أعطى المعلمُ الطالبَ كتابًا» فلا يصحّ حذف الفعل وتكوين «الطالبُ كتابٌ» بنفس المعنى." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تحديد نوع الفعل ومفعوليه.",
      items: [
        { w: "حسبتُ الامتحانَ سهلًا", steps: ["حدّد الفعل: حسبتُ (من أفعال القلوب)", "المفعول الأول: الامتحانَ", "المفعول الثاني: سهلًا (أصله خبر)", "تحقّق: الامتحانُ سهلٌ — جملة مفيدة، فالفعل من أفعال القلوب"] },
        { w: "وجدتُ الحقيقةَ مُرّةً", steps: ["حدّد الفعل: وجدتُ (بمعنى علمتُ، من أفعال القلوب)", "المفعول الأول: الحقيقةَ", "المفعول الثاني: مُرّةً (أصله خبر)", "تحقّق: الحقيقةُ مُرّةٌ — جملة مفيدة"] },
        { w: "منحَ المعلمُ الطالبَ شهادةً", steps: ["حدّد الفعل: منحَ (من أفعال العطاء)", "المفعول الأول: الطالبَ", "المفعول الثاني: شهادةً", "تحقّق: لا يصحّ «الطالبُ شهادةٌ» بنفس المعنى؛ فالفعل من أفعال العطاء"] },
        { w: "ألبسَ الأبُ ابنَه معطفًا", steps: ["حدّد الفعل: ألبسَ (من أفعال التحويل والعطاء)", "المفعول الأول: ابنَه", "المفعول الثاني: معطفًا", "تحقّق: مفعولان مستقلّان لا علاقة إسنادية بينهما"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل فعل حسب نوعه.",
      cats: ["من أفعال القلوب", "من أفعال العطاء والتحويل"],
      items: [["ظنّ", "من أفعال القلوب"], ["أعطى", "من أفعال العطاء والتحويل"], ["حسب", "من أفعال القلوب"], ["منح", "من أفعال العطاء والتحويل"],
              ["علم", "من أفعال القلوب"], ["كسا", "من أفعال العطاء والتحويل"], ["خال", "من أفعال القلوب"], ["وهب", "من أفعال العطاء والتحويل"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "قسمان من الأفعال تنصب مفعولين: أفعال القلوب (أصل مفعوليها مبتدأ وخبر)، وأفعال العطاء والتحويل (مفعولان مستقلّان).",
      bullets: ["أفعال القلوب: ظنّ، حسب، خال، علم", "أفعال العطاء: أعطى، منح، كسا، وهب", "كلا المفعولين منصوب", "اختبار القلوب: حوّل لجملة مبتدأ وخبر"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "أفعال القلوب", q: "أيّ الأفعال من أفعال القلوب؟", o: ["أعطى", "ظنّ", "كسا", "منح"], a: 1, e: "ظنّ تدخل على جملة اسمية أصلها مبتدأ وخبر." },
    { t: "mcq", sn: "أفعال العطاء", q: "أيّ الأفعال من أفعال العطاء والتحويل؟", o: ["ظنّ", "حسب", "أعطى", "علم"], a: 2, e: "أعطى تنصب مفعولين مستقلّين." },
    { t: "mcq", sn: "أصل المفعولين", q: "مفعولا أفعال القلوب أصلهما:", o: ["فاعل ومفعول", "مبتدأ وخبر", "مضاف ومضاف إليه", "لا أصل لهما"], a: 1, e: "لأنها تدخل على جملة اسمية." },
    { t: "mcq", sn: "تطبيق", q: "في «ظننتُ الجوَّ باردًا»، المفعول الثاني «باردًا» أصله:", o: ["مبتدأ", "خبر", "فاعل", "لا أصل له"], a: 1, e: "أصله خبر «الجوّ» في الجملة الاسمية الأصلية." },
    { t: "mcq", sn: "الاختبار العملي", q: "كيف تختبر أن الفعل من أفعال القلوب؟", o: ["عدّ حروفه", "حاول تحويل مفعوليه لجملة مبتدأ وخبر مفيدة", "طول الجملة", "لا اختبار ممكن"], a: 1, e: "إن صحّ التحويل فهو من أفعال القلوب." },
    { t: "mcq", sn: "تطبيق", q: "في «منحَ المعلمُ الطالبَ شهادةً»، عدد المفاعيل:", o: ["مفعول واحد", "مفعولان مستقلّان", "ثلاثة مفاعيل", "لا مفعول"], a: 1, e: "الطالبَ وشهادةً مفعولان مستقلّان." },
    { t: "mcq", sn: "تطبيق", q: "في «وجدتُ الحقيقةَ مُرّةً» (بمعنى علمتُ)، نوع الفعل:", o: ["من أفعال العطاء", "من أفعال القلوب", "فعل لازم", "لا نوع له"], a: 1, e: "بمعنى العلم، فهو من أفعال القلوب." },
    { t: "mcq", sn: "تمييز", q: "الفارق الجوهري بين القسمين:", o: ["لا فرق", "أفعال القلوب مفعولاها أصلهما مبتدأ وخبر، وأفعال العطاء مفعولاها مستقلّان", "أفعال العطاء لا تُعرب", "أفعال القلوب لا تنصب"], a: 1, e: "هذا الفارق الأساسي بينهما." },
    { t: "mcq", sn: "تطبيق", q: "في «ألبسَ الأبُ ابنَه معطفًا»، نوع الفعل:", o: ["من أفعال القلوب", "من أفعال التحويل والعطاء", "فعل لازم", "لا نوع له"], a: 1, e: "مفعولاه مستقلّان لا علاقة إسنادية بينهما." },
    { t: "mcq", sn: "تطبيق", q: "أيّ جملة فيها فعل من أفعال القلوب؟", o: ["كسا الأبُ ابنَه ثوبًا", "حسبتُ الأمرَ سهلًا", "أعطى المعلمُ الطالبَ جائزةً", "وهبَ الأبُ ابنَه هديةً"], a: 1, e: "حسب من أفعال القلوب؛ يصحّ تحويل مفعوليها لجملة مبتدأ وخبر." },
    { t: "tf", sn: "أصل المفعولين", q: "مفعولا أفعال العطاء أصلهما مبتدأ وخبر.", a: false, e: "مستقلّان لا علاقة إسنادية بينهما." },
    { t: "tf", sn: "أفعال القلوب", q: "ظنّ وحسب وخال وعلم من أفعال القلوب.", a: true, e: "صحيح." },
    { t: "tf", sn: "أفعال العطاء", q: "أعطى ومنح وكسا ووهب من أفعال العطاء والتحويل.", a: true, e: "صحيح." },
    { t: "tf", sn: "الحكم المشترك", q: "كلا المفعولين في القسمين منصوب.", a: true, e: "حكم مشترك بينهما." },
    { t: "tf", sn: "تطبيق", q: "«ظننتُ الجوَّ باردًا» يصحّ تحويلها إلى «الجوّ باردٌ» بمعنى مفيد.", a: true, e: "دليل على أن ظنّ من أفعال القلوب." },
    { t: "fill", sn: "تعيين المفعولين", q: "استخرج مفعولَي «حسبتُ الامتحانَ سهلًا».", a: ["الامتحان وسهلا", "الامتحانَ وسهلًا"], e: "أفعال القلوب تنصب مفعولين." },
    { t: "fill", sn: "التصنيف", q: "صنّف فعل «كسا» (من أفعال القلوب أم العطاء؟).", a: ["العطاء", "من أفعال العطاء"], e: "مفعولاه مستقلّان." },
    { t: "fill", sn: "التطبيق", q: "أكمل: أفعال القلوب مفعولاها أصلهما ____ و____.", a: ["مبتدأ وخبر"], e: "هذا جوهر تعريفها." },
    { t: "fill", sn: "تطبيق", q: "اكتب فعلًا واحدًا من أفعال القلوب غير الأمثلة الواردة في الشرح.", a: ["زعم", "درى", "رأى"], e: "أي فعل من هذه المجموعة يُقبل." },
    { t: "fill", sn: "تطبيق", q: "اكتب فعلًا واحدًا من أفعال العطاء غير الأمثلة الواردة في الشرح.", a: ["الاس", "ألبس"], e: "من أفعال التحويل والعطاء." },
    { t: "match", sn: "التصنيف", q: "طابق كل فعل بنوعه.",
      pairs: [["ظنّ", "من أفعال القلوب"], ["أعطى", "من أفعال العطاء"], ["علم", "من أفعال القلوب"], ["وهب", "من أفعال العطاء"]], e: "قسمان أساسيان." },
    { t: "match", sn: "تعيين المفعولين", q: "طابق كل جملة بمفعوليها.",
      pairs: [["حسبتُ الامتحانَ سهلًا", "الامتحانَ / سهلًا"], ["أعطى المعلمُ الطالبَ كتابًا", "الطالبَ / كتابًا"], ["وجدتُ الحقيقةَ مُرّةً", "الحقيقةَ / مُرّةً"]], e: "كل فعل ينصب مفعولين معًا." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["ظننتُ", "الجوَّ", "باردٌ", "اليوم"], a: 2, fix: "باردًا", e: "المفعول الثاني منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["أعطى", "المعلمُ", "الطالبُ", "جائزةً"], a: 2, fix: "الطالبَ", e: "المفعول الأول منصوب لا مرفوع." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["حسبتُ", "الأمرَ", "سهلٌ", "جدًّا"], a: 2, fix: "سهلًا", e: "المفعول الثاني منصوب." },
  ],
};

const C31 = {
  id: "c-mafool-fih-6", title: "المفعول فيه (ظرف الزمان والمكان)", domain: "GR", grade: 6, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب المفعول فيه، ويميّز ظرف الزمان من ظرف المكان.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ الكلمة التي تدلّ على زمان أو مكان وقوع الفعل في كل جملة.",
      table: { head: ["الجملة", "الكلمة", "تدلّ على زمان أم مكان؟", "حكمها"],
        rows: [["سافرتُ صباحًا", "صباحًا", "زمان", "منصوب"], ["جلستُ أمامَ المعلمِ", "أمامَ", "مكان", "منصوب"],
               ["ذاكرتُ الليلةَ", "الليلةَ", "زمان", "منصوب"], ["وقفَ الطلابُ خلفَ المعلمِ", "خلفَ", "مكان", "منصوب"]] },
      checks: [
        { t: "mcq", q: "ما الحكم الإعرابي المشترك لكل هذه الكلمات؟", o: ["مرفوعة", "منصوبة", "مجرورة", "لا إعراب"], a: 1, e: "المفعول فيه (الظرف) منصوب دائمًا." },
        { t: "mcq", q: "ما المعنى الذي يتضمّنه كل ظرف من هذه الكلمات؟", o: ["معنى «مع»", "معنى «في»", "معنى «من»", "لا معنى إضافيًّا"], a: 1, e: "الظرف يتضمّن معنى «في» (سافرتُ في الصباح)." }],
      reveal: "استنتجت: المفعول فيه (الظرف) اسم منصوب يدلّ على زمان وقوع الفعل أو مكانه، متضمّنًا معنى «في»." },
    { t: "rule", title: "ظرف الزمان وظرف المكان", strat: "التمثيل البصري",
      body: "المفعول فيه اسم منصوب يدلّ على زمان الفعل (ظرف زمان) أو مكانه (ظرف مكان)، ويتضمّن معنى «في» ضمنيًّا.",
      concepts: [{ label: "ظرف الزمان", note: "اليوم، الليلة، صباحًا، مساءً، الآن، حينَ" }, { label: "ظرف المكان", note: "أمامَ، خلفَ، فوقَ، تحتَ، عندَ، بينَ، وسطَ" }, { label: "الحكم", note: "منصوب دائمًا" }],
      note: "اختبار عملي: أضِف «في» قبل الظرف؛ إن استقام المعنى فهو ظرف: سافرتُ (في) صباحًا." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تعيين الظرف ونوعه.",
      items: [
        { w: "درسَ الطالبُ ليلًا", steps: ["ابحث عن كلمة تدلّ على زمان أو مكان: ليلًا", "أضف «في»: درس في الليل — يستقيم المعنى", "النوع: ظرف زمان", "الحكم: منصوب"] },
        { w: "جلسَ الأطفالُ حولَ المعلمةِ", steps: ["ابحث عن كلمة تدلّ على زمان أو مكان: حولَ", "أضف «في»: جلسوا في محيط المعلمة — يستقيم المعنى", "النوع: ظرف مكان", "الحكم: منصوب"] },
        { w: "سأزورُك غدًا", steps: ["ابحث عن الكلمة: غدًا", "أضف «في»: سأزورك في الغد — يستقيم المعنى", "النوع: ظرف زمان", "الحكم: منصوب"] },
        { w: "وقفَ الحارسُ عندَ البابِ", steps: ["ابحث عن الكلمة: عندَ", "أضف «في»: وقف في مكان قريب من الباب — يستقيم المعنى", "النوع: ظرف مكان", "الحكم: منصوب"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل ظرف: زمان أم مكان؟",
      cats: ["ظرف زمان", "ظرف مكان"],
      items: [["صباحًا", "ظرف زمان"], ["أمامَ", "ظرف مكان"], ["الليلةَ", "ظرف زمان"], ["خلفَ", "ظرف مكان"],
              ["غدًا", "ظرف زمان"], ["فوقَ", "ظرف مكان"], ["الآنَ", "ظرف زمان"], ["تحتَ", "ظرف مكان"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "المفعول فيه (الظرف) اسم منصوب يدلّ على زمان الفعل أو مكانه، ويتضمّن معنى «في».",
      bullets: ["ظرف الزمان: صباحًا، الآن، غدًا", "ظرف المكان: أمامَ، فوقَ، عندَ", "الحكم: منصوب دائمًا", "اختبار: أضِف «في» قبله"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "حكم المفعول فيه", q: "المفعول فيه حكمه الإعرابي:", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 1, e: "منصوب دائمًا." },
    { t: "mcq", sn: "تعيين الظرف", q: "الظرف في «سافرتُ صباحًا»:", o: ["سافرتُ", "صباحًا", "لا ظرف", "كلاهما"], a: 1, e: "يدلّ على زمان الفعل." },
    { t: "mcq", sn: "ظرف المكان", q: "«أمامَ» و«خلفَ» و«فوقَ» أمثلة على:", o: ["ظرف زمان", "ظرف مكان", "مفعول به", "حال"], a: 1, e: "تدلّ على مكان وقوع الفعل." },
    { t: "mcq", sn: "المعنى المتضمَّن", q: "المفعول فيه يتضمّن معنى:", o: ["مع", "في", "من", "على"], a: 1, e: "دائمًا يتضمّن معنى «في»." },
    { t: "mcq", sn: "تطبيق", q: "في «درسَ الطالبُ ليلًا»، نوع الظرف:", o: ["ظرف زمان", "ظرف مكان", "لا ظرف", "مفعول به"], a: 0, e: "يدلّ على زمن الدراسة." },
    { t: "mcq", sn: "تطبيق", q: "في «جلسَ الأطفالُ حولَ المعلمةِ»، نوع الظرف:", o: ["ظرف زمان", "ظرف مكان", "لا ظرف", "مفعول به"], a: 1, e: "يدلّ على مكان الجلوس." },
    { t: "mcq", sn: "الاختبار العملي", q: "كيف تختبر أن الكلمة ظرف؟", o: ["عدّ حروفها", "أضِف «في» قبلها وتحقّق من استقامة المعنى", "لا اختبار ممكن", "انظر لطولها"], a: 1, e: "هذا الاختبار العملي الأدقّ." },
    { t: "mcq", sn: "تطبيق", q: "أيّ الكلمات ظرف زمان؟", o: ["فوقَ", "الآنَ", "تحتَ", "عندَ"], a: 1, e: "«الآن» تدلّ على زمن الحدث." },
    { t: "mcq", sn: "تطبيق", q: "في «وقفَ الحارسُ عندَ البابِ»، الظرف:", o: ["الحارس", "عندَ", "البابِ", "وقفَ"], a: 1, e: "يدلّ على مكان الوقوف." },
    { t: "mcq", sn: "تمييز", q: "أيّ الكلمات ليست ظرفًا؟", o: ["صباحًا", "أمامَ", "الكتابُ", "غدًا"], a: 2, e: "«الكتاب» اسم عادي لا يدلّ على زمان أو مكان الفعل." },
    { t: "tf", sn: "حكم المفعول فيه", q: "المفعول فيه مرفوع.", a: false, e: "منصوب دائمًا." },
    { t: "tf", sn: "المعنى", q: "المفعول فيه يتضمّن معنى «في».", a: true, e: "صحيح، هذا جوهر تعريفه." },
    { t: "tf", sn: "تطبيق", q: "«صباحًا» ظرف مكان.", a: false, e: "ظرف زمان." },
    { t: "tf", sn: "تطبيق", q: "«أمامَ» ظرف مكان.", a: true, e: "صحيح." },
    { t: "tf", sn: "تطبيق", q: "«سأزورُك غدًا» فيها ظرف زمان.", a: true, e: "«غدًا» تدلّ على الزمن." },
    { t: "fill", sn: "تعيين الظرف", q: "استخرج الظرف من «ذاكرتُ الليلةَ».", a: ["الليلة", "الليلةَ"], e: "يدلّ على زمن المذاكرة." },
    { t: "fill", sn: "تحديد النوع", q: "«خلفَ» ظرف زمان أم مكان؟", a: ["مكان", "ظرف مكان"], e: "يدلّ على موضع." },
    { t: "fill", sn: "التطبيق", q: "أكمل: المفعول فيه يتضمّن معنى ____.", a: ["في"], e: "هذا جوهر تعريفه." },
    { t: "fill", sn: "تطبيق", q: "اكتب ظرف زمان واحدًا غير الأمثلة الواردة في الشرح.", a: ["ظهرا", "ظهرًا", "عصرا", "عصرًا", "بعد", "قبل"], e: "أي ظرف زمان صحيح يُقبل." },
    { t: "fill", sn: "تصويب", q: "صوّب: «جلستُ أمامُ المعلمِ» (اضبط الظرف).", a: ["أمام", "أمامَ"], e: "الظرف منصوب لا مرفوع." },
    { t: "match", sn: "التصنيف", q: "طابق كل ظرف بنوعه.",
      pairs: [["صباحًا", "ظرف زمان"], ["أمامَ", "ظرف مكان"], ["غدًا", "ظرف زمان"], ["فوقَ", "ظرف مكان"]], e: "زمان أم مكان؟" },
    { t: "match", sn: "تعيين الظرف", q: "طابق كل جملة بظرفها.",
      pairs: [["سافرتُ صباحًا", "صباحًا"], ["جلستُ أمامَ المعلمِ", "أمامَ"], ["ذاكرتُ الليلةَ", "الليلةَ"]], e: "الظرف يدلّ على زمن أو مكان الفعل." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["سافرتُ", "صباحٌ", "إلى", "الرياض"], a: 1, fix: "صباحًا", e: "الظرف منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["وقفَ", "الحارسُ", "أمامُ", "البابِ"], a: 2, fix: "أمامَ", e: "ظرف المكان منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["سأزورُك", "غدٌ", "بإذن", "الله"], a: 1, fix: "غدًا", e: "ظرف الزمان منصوب." },
  ],
};

const C32 = {
  id: "c-mafool-maah-9", title: "المفعول معه", domain: "GR", grade: 9, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب المفعول معه، ويميّز واو المعية عن واو العطف.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ معنى «الواو» في كل جملة: هل تفيد المشاركة والمصاحبة، أم الجمع والتشريك في الحكم؟",
      table: { head: ["الجملة", "معنى الواو", "الاسم بعدها", "حكمه"],
        rows: [["سرتُ والنيلَ", "بمعنى «مع» (مصاحبة)", "النيلَ", "منصوب — مفعول معه"],
               ["حضرَ المعلمُ والطلابُ", "بمعنى العطف (تشريك في الحكم)", "الطلابُ", "مرفوع — معطوف على الفاعل"],
               ["استيقظتُ وطلوعَ الشمسِ", "بمعنى «مع» (مصاحبة زمنية)", "طلوعَ الشمسِ", "منصوب — مفعول معه"]] },
      checks: [
        { t: "mcq", q: "كيف تميّز بين واو المعية وواو العطف؟", o: ["لا فرق بينهما إطلاقًا", "المعية بمعنى «مع» (مصاحبة)، والعطف بمعنى التشريك في نفس الحكم", "المعية دائمًا في أول الجملة", "لا يمكن التمييز أبدًا"], a: 1, e: "هذا الفارق الدلالي الجوهري." },
        { t: "mcq", q: "ما حكم الاسم بعد واو المعية؟", o: ["مرفوع", "منصوب", "مجرور", "يتبع ما قبله"], a: 1, e: "المفعول معه منصوب دائمًا." }],
      reveal: "استنتجت: المفعول معه اسم منصوب يقع بعد واو بمعنى «مع» (لا العطف)، ويدلّ على من حصل الفعل بمصاحبته." },
    { t: "rule", title: "واو المعية لا واو العطف", strat: "التمثيل البصري",
      body: "المفعول معه اسم منصوب يقع بعد واو المعية (بمعنى «مع») مسبوقة بجملة فيها فعل أو ما يشبهه، ويدلّ على من حصل الفعل بمصاحبته لا بمشاركته في الحكم.",
      concepts: [{ label: "واو المعية", note: "بمعنى «مع»، الاسم بعدها منصوب" }, { label: "واو العطف", note: "تشريك في الحكم، الاسم بعدها يتبع ما قبله" }, { label: "الاختبار", note: "استبدل الواو بـ«مع» وتحقّق من استقامة المعنى" }],
      note: "إن صحّ إحلال «مع» محلّ الواو دون فساد المعنى، فهي واو المعية والاسم بعدها مفعول معه." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تحديد المفعول معه.",
      items: [
        { w: "سرتُ والنيلَ", steps: ["استبدل الواو بـ«مع»: سرتُ مع النيل — يستقيم المعنى", "الواو واو معية", "الاسم بعدها: النيلَ", "مفعول معه، منصوب"] },
        { w: "استيقظتُ وطلوعَ الشمسِ", steps: ["استبدل الواو بـ«مع»: استيقظتُ مع طلوع الشمس — يستقيم المعنى", "الواو واو معية", "الاسم بعدها: طلوعَ الشمسِ", "مفعول معه، منصوب"] },
        { w: "حضرَ المعلمُ والطلابُ", steps: ["استبدل الواو بـ«مع»: حضر المعلم مع الطلاب — المعنى يتغيّر (تشريك لا مصاحبة فعل واحد)", "الواو واو عطف", "الاسم بعدها: الطلابُ", "معطوف على الفاعل، مرفوع"] },
        { w: "لا تنهَ عن خُلقٍ وتأتيَ مثلَه", steps: ["هذه الواو ليست معية ولا عطفًا بسيطًا بل سياق آخر", "لاحظ أن «تأتي» فعل منصوب بأن مضمرة بعد الواو", "هذا خارج نطاق المفعول معه (سياق نحوي مختلف)", "مثال توضيحي لعدم الخلط"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة: واوها معية أم عطف؟",
      cats: ["واو معية (مفعول معه)", "واو عطف"],
      items: [["سرتُ والنيلَ", "واو معية (مفعول معه)"], ["حضرَ المعلمُ والطلابُ", "واو عطف"],
              ["استيقظتُ وطلوعَ الشمسِ", "واو معية (مفعول معه)"], ["نجحَ سالمٌ وأحمدُ", "واو عطف"],
              ["سافرَ الأبُ وغروبَ الشمسِ", "واو معية (مفعول معه)"], ["قرأ الطالبُ والمعلمُ الدرسَ", "واو عطف"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "المفعول معه اسم منصوب بعد واو المعية (بمعنى «مع»)، لا واو العطف (التشريك في الحكم).",
      bullets: ["واو المعية: بمعنى «مع»", "الاسم بعدها: منصوب", "واو العطف: تشريك، الاسم يتبع ما قبله", "اختبار: استبدل الواو بـ«مع»"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "حكم المفعول معه", q: "المفعول معه حكمه الإعرابي:", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 1, e: "منصوب دائمًا." },
    { t: "mcq", sn: "تعريف واو المعية", q: "واو المعية بمعنى:", o: ["العطف", "مع (المصاحبة)", "أو", "لا معنى لها"], a: 1, e: "تدلّ على المصاحبة." },
    { t: "mcq", sn: "الاختبار العملي", q: "كيف تميّز واو المعية من واو العطف؟", o: ["عدّ الكلمات", "استبدل الواو بـ«مع» وتحقّق من استقامة المعنى", "لا طريقة للتمييز", "انظر لطول الجملة"], a: 1, e: "هذا الاختبار العملي الحاسم." },
    { t: "mcq", sn: "تطبيق", q: "في «سرتُ والنيلَ»، «النيلَ»:", o: ["فاعل", "مفعول معه", "مفعول به", "مبتدأ"], a: 1, e: "يقع بعد واو معية." },
    { t: "mcq", sn: "تطبيق", q: "في «حضرَ المعلمُ والطلابُ»، «الطلابُ»:", o: ["مفعول معه، منصوب", "معطوف على الفاعل، مرفوع", "مفعول به", "لا إعراب له"], a: 1, e: "الواو هنا عطف لا معية." },
    { t: "mcq", sn: "شرط المفعول معه", q: "يُشترط في المفعول معه أن تُسبق الواو بـ:", o: ["اسم مفرد فقط", "جملة فيها فعل أو ما يشبهه", "حرف جر", "لا شرط"], a: 1, e: "تحتاج جملة فعلية أو شبهها قبلها." },
    { t: "mcq", sn: "تطبيق", q: "في «استيقظتُ وطلوعَ الشمسِ»، نوع الواو:", o: ["عطف", "معية", "استئناف", "حالية"], a: 1, e: "يستقيم المعنى بإحلال «مع» محلّها." },
    { t: "mcq", sn: "تمييز", q: "أيّ الجمل فيها واو عطف لا معية؟", o: ["سرتُ والنيلَ", "نجحَ سالمٌ وأحمدُ", "استيقظتُ وطلوعَ الشمسِ", "سافرَ الأبُ وغروبَ الشمسِ"], a: 1, e: "لا يستقيم المعنى بإحلال «مع» (نجح سالم مع أحمد يغيّر المعنى إلى مصاحبة زمنية غير مقصودة، بل المقصود تشريكهما في النجاح)." },
    { t: "mcq", sn: "حكم المعطوف", q: "الاسم بعد واو العطف حكمه:", o: ["منصوب دائمًا", "يتبع ما قبله في الإعراب", "مجرور دائمًا", "لا إعراب"], a: 1, e: "يتبع المعطوف عليه." },
    { t: "mcq", sn: "تطبيق", q: "في «سافرَ الأبُ وغروبَ الشمسِ»، «غروبَ»:", o: ["مفعول معه، منصوب", "معطوف، مرفوع", "فاعل", "مبتدأ"], a: 0, e: "يقع بعد واو معية تفيد المصاحبة الزمنية." },
    { t: "tf", sn: "حكم المفعول معه", q: "المفعول معه مرفوع.", a: false, e: "منصوب دائمًا." },
    { t: "tf", sn: "واو المعية", q: "واو المعية تفيد المصاحبة بمعنى «مع».", a: true, e: "صحيح." },
    { t: "tf", sn: "واو العطف", q: "الاسم بعد واو العطف يتبع ما قبله في الإعراب.", a: true, e: "صحيح، فهو معطوف." },
    { t: "tf", sn: "تطبيق", q: "«سرتُ والنيلَ» فيها مفعول معه.", a: true, e: "الواو بمعنى «مع»." },
    { t: "tf", sn: "تطبيق", q: "«حضرَ المعلمُ والطلابُ» فيها مفعول معه.", a: false, e: "الواو هنا عطف؛ الطلاب معطوف مرفوع." },
    { t: "fill", sn: "تعيين المفعول معه", q: "استخرج المفعول معه من «سافرَ الأبُ وغروبَ الشمسِ».", a: ["غروب الشمس", "غروبَ الشمسِ"], e: "يقع بعد واو معية." },
    { t: "fill", sn: "التصنيف", q: "صنّف واو «نجحَ سالمٌ وأحمدُ» (معية أم عطف؟).", a: ["عطف", "واو عطف"], e: "تشريك في حكم النجاح." },
    { t: "fill", sn: "التطبيق", q: "أكمل: المفعول معه اسم ____ يقع بعد واو المعية.", a: ["منصوب"], e: "حكمه الإعرابي." },
    { t: "fill", sn: "تصويب", q: "صوّب: «سرتُ والنيلُ» (اضبط المفعول معه).", a: ["النيل", "النيلَ"], e: "المفعول معه منصوب." },
    { t: "match", sn: "التصنيف", q: "طابق كل جملة بنوع واوها.",
      pairs: [["سرتُ والنيلَ", "واو معية"], ["حضرَ المعلمُ والطلابُ", "واو عطف"], ["استيقظتُ وطلوعَ الشمسِ", "واو معية"], ["نجحَ سالمٌ وأحمدُ", "واو عطف"]], e: "استبدل الواو بـ«مع» للتحقّق." },
    { t: "match", sn: "تعيين المفعول معه", q: "طابق كل جملة بمفعولها معه.",
      pairs: [["سرتُ والنيلَ", "النيلَ"], ["استيقظتُ وطلوعَ الشمسِ", "طلوعَ الشمسِ"], ["سافرَ الأبُ وغروبَ الشمسِ", "غروبَ الشمسِ"]], e: "الاسم الواقع بعد واو المعية." },
    { t: "mcq", sn: "تطبيق", q: "«ركبتُ السيارةَ والغروبَ» — نوع الواو:", o: ["عطف", "معية، بمعنى: ركبتُ مع الغروب (وقت الغروب)", "استئناف", "لا معنى لها"], a: 1, e: "يستقيم المعنى بإحلال «مع» محلّها." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["سرتُ", "والنيلُ", "طويلًا", "أمس"], a: 1, fix: "والنيلَ", e: "المفعول معه منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["استيقظتُ", "وطلوعُ", "الشمسِ", "باكرًا"], a: 1, fix: "وطلوعَ", e: "المفعول معه منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["سافرَ", "الأبُ", "وغروبُ", "الشمسِ"], a: 2, fix: "وغروبَ", e: "المفعول معه منصوب." },
  ],
};

const C33 = {
  id: "c-mafool-mutlaq-8", title: "المفعول المطلق", domain: "GR", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب المفعول المطلق، ويحدّد وظيفته في التوكيد أو بيان النوع أو بيان العدد.",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "لاحظ المصدر الذي جاء بعد كل فعل، وقارنه بحروف الفعل نفسه.",
      table: { head: ["الجملة", "الفعل", "المصدر بعده", "من نفس حروف الفعل؟"],
        rows: [["انتصرَ الجيشُ انتصارًا", "انتصرَ", "انتصارًا", "نعم"], ["سرتُ سيرَ الأبطالِ", "سرتُ", "سيرَ", "نعم"],
               ["ضربتُه ضربتينِ", "ضربتُه", "ضربتينِ", "نعم"]] },
      checks: [
        { t: "mcq", q: "ما العلاقة بين المصدر والفعل في كل الأمثلة؟", o: ["لا علاقة بينهما", "المصدر من نفس حروف الفعل (أو معناه)", "المصدر ضدّ معنى الفعل", "المصدر فعل آخر"], a: 1, e: "هذا شرط المفعول المطلق الأساسي." },
        { t: "mcq", q: "ما حكم هذا المصدر الإعرابي؟", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 1, e: "المفعول المطلق منصوب دائمًا." }],
      reveal: "استنتجت: المفعول المطلق مصدر منصوب من لفظ الفعل (أو معناه) يُذكر بعده لتوكيده أو بيان نوعه أو بيان عدده." },
    { t: "rule", title: "وظائف المفعول المطلق الثلاث", strat: "التمثيل البصري",
      body: "المفعول المطلق مصدر منصوب يُذكر بعد فعل من لفظه غالبًا، وله ثلاث وظائف: التوكيد (تقوية معنى الفعل)، أو بيان النوع (بوصف المصدر أو إضافته)، أو بيان العدد (بتثنيته أو جمعه).",
      concepts: [{ label: "التوكيد", note: "انتصرَ انتصارًا — تقوية المعنى" }, { label: "بيان النوع", note: "سرتُ سيرَ الأبطالِ — يوضّح كيفية الفعل" }, { label: "بيان العدد", note: "ضربتُه ضربتينِ — يوضّح تكرار الفعل" }],
      note: "قد يأتي المفعول المطلق من غير لفظ الفعل لكن بمعناه: «جلستُ قعودًا» (قعد وجلس بمعنى واحد)." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تعيين المفعول المطلق ووظيفته.",
      items: [
        { w: "احترمتُ المعلمَ احترامًا", steps: ["حدّد الفعل: احترمتُ", "المصدر بعده: احترامًا (من نفس الحروف)", "هل وُصف أو أُضيف؟ لا", "المفعول المطلق للتوكيد"] },
        { w: "سار الجنديُّ سيرَ الأبطالِ", steps: ["حدّد الفعل: سار", "المصدر بعده: سيرَ", "هل أُضيف لبيان الكيفية؟ نعم (سير الأبطال)", "المفعول المطلق لبيان النوع"] },
        { w: "طفتُ حول الكعبةِ طوفتينِ", steps: ["حدّد الفعل: طفتُ", "المصدر بعده: طوفتينِ (مثنى)", "هل يدلّ على عدد المرات؟ نعم", "المفعول المطلق لبيان العدد"] },
        { w: "فرحتُ فرحَ الفائزين", steps: ["حدّد الفعل: فرحتُ", "المصدر بعده: فرحَ", "هل أُضيف لبيان الكيفية؟ نعم (فرح الفائزين)", "المفعول المطلق لبيان النوع"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل جملة حسب وظيفة مفعولها المطلق.",
      cats: ["توكيد", "بيان النوع", "بيان العدد"],
      items: [["انتصرَ الجيشُ انتصارًا", "توكيد"], ["سرتُ سيرَ الأبطالِ", "بيان النوع"], ["ضربتُه ضربتينِ", "بيان العدد"],
              ["احترمتُ المعلمَ احترامًا", "توكيد"], ["فرحتُ فرحَ الفائزين", "بيان النوع"], ["طفتُ طوفتينِ", "بيان العدد"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "المفعول المطلق مصدر منصوب من لفظ الفعل أو معناه، يفيد التوكيد أو بيان النوع أو بيان العدد.",
      bullets: ["حكمه: منصوب دائمًا", "التوكيد: مصدر مجرَّد", "بيان النوع: مصدر موصوف أو مضاف", "بيان العدد: مصدر مثنّى أو مجموع"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "حكم المفعول المطلق", q: "المفعول المطلق حكمه الإعرابي:", o: ["مرفوع", "منصوب", "مجرور", "لا إعراب"], a: 1, e: "منصوب دائمًا." },
    { t: "mcq", sn: "شرط المفعول المطلق", q: "المفعول المطلق مصدر:", o: ["من فعل مختلف تمامًا", "من لفظ الفعل أو معناه", "لا علاقة له بالفعل", "دائمًا جامد"], a: 1, e: "هذا شرطه الأساسي." },
    { t: "mcq", sn: "وظيفة التوكيد", q: "في «انتصرَ الجيشُ انتصارًا»، وظيفة المفعول المطلق:", o: ["بيان النوع", "بيان العدد", "التوكيد", "لا وظيفة"], a: 2, e: "مصدر مجرَّد يقوّي معنى الفعل." },
    { t: "mcq", sn: "وظيفة بيان النوع", q: "في «سرتُ سيرَ الأبطالِ»، وظيفة المفعول المطلق:", o: ["التوكيد", "بيان النوع", "بيان العدد", "لا وظيفة"], a: 1, e: "أُضيف ليبيّن كيفية السير." },
    { t: "mcq", sn: "وظيفة بيان العدد", q: "في «ضربتُه ضربتينِ»، وظيفة المفعول المطلق:", o: ["التوكيد", "بيان النوع", "بيان العدد", "لا وظيفة"], a: 2, e: "صيغة المثنى تدلّ على تكرار الفعل مرتين." },
    { t: "mcq", sn: "تطبيق", q: "في «احترمتُ المعلمَ احترامًا»، نوع الوظيفة:", o: ["توكيد", "بيان نوع", "بيان عدد", "لا وظيفة"], a: 0, e: "مصدر مجرَّد بلا وصف أو إضافة." },
    { t: "mcq", sn: "تطبيق", q: "في «فرحتُ فرحَ الفائزين»، نوع الوظيفة:", o: ["توكيد", "بيان نوع", "بيان عدد", "لا وظيفة"], a: 1, e: "أُضيف ليبيّن كيفية الفرح." },
    { t: "mcq", sn: "من غير لفظ الفعل", q: "«جلستُ قعودًا» — العلاقة بين المصدر والفعل:", o: ["من نفس الحروف", "بمعنى واحد رغم اختلاف الحروف", "لا علاقة", "أضداد"], a: 1, e: "قعد وجلس بمعنى واحد." },
    { t: "mcq", sn: "تمييز", q: "أيّ الجمل فيها مفعول مطلق لبيان العدد؟", o: ["انتصرَ انتصارًا", "دُرتُ حول الملعب دورتينِ", "سرتُ سيرَ الحكماءِ", "لا مثال هنا"], a: 1, e: "صيغة المثنى «دورتين» تدلّ على العدد." },
    { t: "mcq", sn: "تطبيق", q: "في «طفتُ حول الكعبةِ طوفتينِ»، المفعول المطلق:", o: ["طفتُ", "حول", "طوفتينِ", "الكعبةِ"], a: 2, e: "المصدر المثنّى بعد الفعل." },
    { t: "tf", sn: "حكم المفعول المطلق", q: "المفعول المطلق مرفوع.", a: false, e: "منصوب دائمًا." },
    { t: "tf", sn: "الشرط", q: "المفعول المطلق يجب أن يكون من نفس حروف الفعل دائمًا بلا استثناء.", a: false, e: "قد يأتي من غير لفظه لكن بمعناه." },
    { t: "tf", sn: "الوظائف", q: "للمفعول المطلق ثلاث وظائف: التوكيد وبيان النوع وبيان العدد.", a: true, e: "صحيح." },
    { t: "tf", sn: "تطبيق", q: "«انتصرَ انتصارًا» وظيفتها بيان النوع.", a: false, e: "وظيفتها التوكيد؛ المصدر مجرَّد بلا وصف." },
    { t: "tf", sn: "تطبيق", q: "«ضربتُه ضربتينِ» وظيفتها بيان العدد.", a: true, e: "صيغة المثنى تدلّ على العدد." },
    { t: "fill", sn: "تعيين المفعول المطلق", q: "استخرج المفعول المطلق من «احترمتُ المعلمَ احترامًا».", a: ["احتراما", "احترامًا"], e: "مصدر من نفس حروف الفعل." },
    { t: "fill", sn: "تحديد الوظيفة", q: "«سرتُ سيرَ الأبطالِ» — اكتب وظيفة المفعول المطلق (كلمتان).", a: ["بيان النوع"], e: "أُضيف ليبيّن كيفية السير." },
    { t: "fill", sn: "التطبيق", q: "أكمل: المفعول المطلق مصدر ____ من لفظ الفعل أو معناه.", a: ["منصوب"], e: "حكمه الإعرابي." },
    { t: "fill", sn: "تطبيق", q: "صوّب: «انتصرَ الجيشُ انتصارٌ» (اضبط المفعول المطلق).", a: ["انتصارا", "انتصارًا"], e: "المفعول المطلق منصوب." },
    { t: "fill", sn: "تطبيق", q: "اكتب مصدرًا مناسبًا لتوكيد الفعل «فرح» (مصدر مجرَّد).", a: ["فرحا", "فرحًا"], e: "أي مصدر من نفس حروف الفعل يُقبل." },
    { t: "match", sn: "الوظيفة", q: "طابق كل جملة بوظيفة مفعولها المطلق.",
      pairs: [["انتصرَ انتصارًا", "توكيد"], ["سرتُ سيرَ الأبطالِ", "بيان النوع"], ["ضربتُه ضربتينِ", "بيان العدد"]], e: "ثلاث وظائف أساسية." },
    { t: "match", sn: "تعيين المفعول المطلق", q: "طابق كل جملة بمفعولها المطلق.",
      pairs: [["احترمتُ المعلمَ احترامًا", "احترامًا"], ["فرحتُ فرحَ الفائزين", "فرحَ"], ["طفتُ طوفتينِ", "طوفتينِ"]], e: "مصدر من نفس حروف الفعل." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["انتصرَ", "الجيشُ", "انتصارٌ", "كبير"], a: 2, fix: "انتصارًا", e: "المفعول المطلق منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["سرتُ", "سيرُ", "الأبطالِ", "بثبات"], a: 1, fix: "سيرَ", e: "المفعول المطلق منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["ضربتُه", "ضربتانِ", "بلا", "رحمة"], a: 1, fix: "ضربتينِ", e: "المفعول المطلق منصوب." },
  ],
};

const C34 = {
  id: "c-mafool-liajlih-8", title: "المفعول لأجله", domain: "GR", grade: 8, stream: "A",
  blocks: [], students: [], status: "draft", q: 25, teacher: "معلم اللغة العربية",
  objective: "أن يعيّن الطالب المفعول لأجله، ويدرك أنه يبيّن سبب وقوع الفعل ويجيب عن سؤال «لماذا؟».",
  stages: [
    { t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
      intro: "اسأل «لماذا؟» بعد كل فعل، ولاحظ أيّ كلمة تجيب عن السؤال.",
      table: { head: ["الجملة", "السؤال", "الكلمة المجيبة", "حكمها"],
        rows: [["وقفتُ إجلالًا للمعلمِ", "لماذا وقفتَ؟", "إجلالًا", "منصوبة"], ["اجتهدَ الطالبُ رغبةً في النجاحِ", "لماذا اجتهد؟", "رغبةً", "منصوبة"],
               ["سكتُّ خوفًا من الفضيحةِ", "لماذا سكتَّ؟", "خوفًا", "منصوبة"]] },
      checks: [
        { t: "mcq", q: "ما السؤال الذي تجيب عنه هذه الكلمات؟", o: ["متى؟", "أين؟", "لماذا؟", "كيف؟"], a: 2, e: "المفعول لأجله يبيّن سبب الفعل." },
        { t: "mcq", q: "ما الحكم الإعرابي المشترك لهذه الكلمات؟", o: ["مرفوعة", "منصوبة", "مجرورة", "لا إعراب"], a: 1, e: "المفعول لأجله منصوب دائمًا." }],
      reveal: "استنتجت: المفعول لأجله مصدر منصوب يُذكر لبيان سبب وقوع الفعل، ويصلح جوابًا لسؤال «لماذا؟»." },
    { t: "rule", title: "المفعول لأجله وشروطه", strat: "التمثيل البصري",
      body: "المفعول لأجله مصدر منصوب يُذكر لبيان سبب وقوع الفعل أو الحكمة منه، ويشترك مع الفعل في الفاعل والزمان.",
      concepts: [{ label: "السبب", note: "يجيب عن سؤال «لماذا؟»" }, { label: "المصدر", note: "غالبًا مصدر قلبي (رغبة، خوفًا، إجلالًا)" }, { label: "الحكم", note: "منصوب، وقد يُجرّ بحرف جر أحيانًا" }],
      note: "لا تخلط المفعول لأجله بالمفعول المطلق: المفعول لأجله ليس من لفظ الفعل غالبًا، بل يبيّن سببه، بينما المطلق من لفظ الفعل نفسه." },
    { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة",
      intro: "اضغط الجملة لترى خطوات تعيين المفعول لأجله.",
      items: [
        { w: "قصدتُ المعلمَ طلبًا للعلمِ", steps: ["اسأل: لماذا قصدتُ المعلم؟", "الإجابة: طلبًا للعلم", "المفعول لأجله: طلبًا", "منصوب، يبيّن السبب"] },
        { w: "ابتعدَ عن الشرِّ خوفًا من العقابِ", steps: ["اسأل: لماذا ابتعد عن الشرّ؟", "الإجابة: خوفًا من العقاب", "المفعول لأجله: خوفًا", "منصوب، يبيّن السبب"] },
        { w: "ادّخرَ المالَ استعدادًا للمستقبلِ", steps: ["اسأل: لماذا ادّخر المال؟", "الإجابة: استعدادًا للمستقبل", "المفعول لأجله: استعدادًا", "منصوب، يبيّن السبب"] },
        { w: "احترمَ الطالبُ معلمَه تقديرًا لجهدِه", steps: ["اسأل: لماذا احترم الطالب معلمه؟", "الإجابة: تقديرًا لجهده", "المفعول لأجله: تقديرًا", "منصوب، يبيّن السبب"] }] },
    { t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط",
      intro: "صنّف كل مصدر: هل هو مفعول لأجله (يبيّن السبب) أم مفعول مطلق (من لفظ الفعل للتوكيد)؟",
      cats: ["مفعول لأجله (سبب)", "مفعول مطلق (توكيد)"],
      items: [["وقفتُ إجلالًا للمعلمِ", "مفعول لأجله (سبب)"], ["انتصرَ الجيشُ انتصارًا", "مفعول مطلق (توكيد)"],
              ["اجتهدَ رغبةً في النجاحِ", "مفعول لأجله (سبب)"], ["احترمتُ المعلمَ احترامًا", "مفعول مطلق (توكيد)"],
              ["سكتُّ خوفًا من الفضيحةِ", "مفعول لأجله (سبب)"], ["فرحتُ فرحًا شديدًا", "مفعول مطلق (توكيد)"]] },
    { t: "summary", title: "الخلاصة وبطاقة الخروج", strat: "بطاقة الخروج",
      body: "المفعول لأجله مصدر منصوب يبيّن سبب وقوع الفعل، ويجيب عن سؤال «لماذا؟».",
      bullets: ["يجيب عن: لماذا؟", "الحكم: منصوب غالبًا", "غالبًا مصدر قلبي (خوفًا، رغبةً، إجلالًا)", "يختلف عن المطلق: لا يشترط لفظ الفعل"],
      note: "الاختبار 25 سؤالًا متنوعًا بجمل جديدة." },
  ],
  bank: [
    { t: "mcq", sn: "حكم المفعول لأجله", q: "المفعول لأجله حكمه الإعرابي الغالب:", o: ["مرفوع", "منصوب", "مجزوم", "لا إعراب"], a: 1, e: "منصوب غالبًا." },
    { t: "mcq", sn: "السؤال المُجاب عنه", q: "المفعول لأجله يجيب عن سؤال:", o: ["متى؟", "أين؟", "لماذا؟", "كيف؟"], a: 2, e: "يبيّن سبب الفعل." },
    { t: "mcq", sn: "تطبيق", q: "المفعول لأجله في «وقفتُ إجلالًا للمعلمِ»:", o: ["وقفتُ", "إجلالًا", "للمعلمِ", "لا مفعول لأجله"], a: 1, e: "يبيّن سبب الوقوف." },
    { t: "mcq", sn: "تمييز عن المطلق", q: "الفارق بين المفعول لأجله والمفعول المطلق:", o: ["لا فرق بينهما", "لأجله يبيّن السبب وليس من لفظ الفعل غالبًا، والمطلق من لفظ الفعل للتوكيد", "المطلق لا يُنصب", "لأجله لا يُنصب"], a: 1, e: "فارق جوهري في الوظيفة والاشتقاق." },
    { t: "mcq", sn: "تطبيق", q: "المفعول لأجله في «اجتهدَ الطالبُ رغبةً في النجاحِ»:", o: ["الطالبُ", "رغبةً", "النجاحِ", "اجتهدَ"], a: 1, e: "يجيب عن: لماذا اجتهد؟" },
    { t: "mcq", sn: "نوع المصدر", q: "المفعول لأجله غالبًا مصدر:", o: ["مصدر فعل حركي", "مصدر قلبي (يدلّ على شعور أو دافع)", "اسم جامد", "فعل مضارع"], a: 1, e: "مثل: خوفًا، رغبةً، إجلالًا، حبًّا." },
    { t: "mcq", sn: "تطبيق", q: "المفعول لأجله في «سكتُّ خوفًا من الفضيحةِ»:", o: ["سكتُّ", "خوفًا", "الفضيحةِ", "لا مفعول لأجله"], a: 1, e: "يبيّن سبب السكوت." },
    { t: "mcq", sn: "الاشتراك", q: "يُشترط أن يشترك المفعول لأجله مع الفعل في:", o: ["اللفظ فقط", "الفاعل والزمان", "الحروف", "لا شرط"], a: 1, e: "يجب أن يصدر السبب والفعل من نفس الفاعل في نفس الوقت." },
    { t: "mcq", sn: "تطبيق", q: "المفعول لأجله في «ادّخرَ المالَ استعدادًا للمستقبلِ»:", o: ["ادّخرَ", "المالَ", "استعدادًا", "للمستقبلِ"], a: 2, e: "يجيب عن: لماذا ادّخر؟" },
    { t: "mcq", sn: "تمييز", q: "أيّ الجمل فيها مفعول لأجله؟", o: ["انتصرَ الجيشُ انتصارًا", "احترمَ الطالبُ معلمَه تقديرًا لجهدِه", "سرتُ سيرَ الأبطالِ", "ضربتُه ضربتينِ"], a: 1, e: "يبيّن سبب الاحترام (تقديرًا)." },
    { t: "tf", sn: "حكم المفعول لأجله", q: "المفعول لأجله مرفوع دائمًا.", a: false, e: "منصوب غالبًا." },
    { t: "tf", sn: "الوظيفة", q: "المفعول لأجله يبيّن سبب وقوع الفعل.", a: true, e: "صحيح، هذا جوهر تعريفه." },
    { t: "tf", sn: "الاشتقاق", q: "المفعول لأجله يجب أن يكون من نفس حروف الفعل دائمًا.", a: false, e: "غالبًا ليس من لفظ الفعل، بخلاف المفعول المطلق." },
    { t: "tf", sn: "تطبيق", q: "«وقفتُ إجلالًا للمعلمِ» فيها مفعول لأجله.", a: true, e: "صحيح؛ يبيّن سبب الوقوف." },
    { t: "tf", sn: "تمييز", q: "«انتصرَ الجيشُ انتصارًا» فيها مفعول لأجله.", a: false, e: "فيها مفعول مطلق للتوكيد لا مفعول لأجله." },
    { t: "fill", sn: "تعيين المفعول لأجله", q: "استخرج المفعول لأجله من «ابتعدَ عن الشرِّ خوفًا من العقابِ».", a: ["خوفا", "خوفًا"], e: "يبيّن سبب الابتعاد." },
    { t: "fill", sn: "التطبيق", q: "أكمل: المفعول لأجله يجيب عن سؤال ____.", a: ["لماذا"], e: "هذا جوهر وظيفته." },
    { t: "fill", sn: "تطبيق", q: "اكتب مفعولًا لأجله مناسبًا لـ«اجتهد الطالب ____ في التفوّق» (مصدر قلبي).", a: ["رغبة", "رغبةً"], e: "أي مصدر قلبي منطقي يُقبل." },
    { t: "fill", sn: "تصويب", q: "صوّب: «وقفتُ إجلالٌ للمعلمِ» (اضبط المفعول لأجله).", a: ["إجلالا", "إجلالًا"], e: "المفعول لأجله منصوب." },
    { t: "fill", sn: "تمييز", q: "اكتب نوع «انتصرَ الجيشُ انتصارًا» (مفعول لأجله أم مطلق؟).", a: ["مطلق", "مفعول مطلق"], e: "من لفظ الفعل نفسه، للتوكيد." },
    { t: "match", sn: "تعيين المفعول لأجله", q: "طابق كل جملة بمفعولها لأجله.",
      pairs: [["وقفتُ إجلالًا للمعلمِ", "إجلالًا"], ["اجتهدَ رغبةً في النجاحِ", "رغبةً"], ["سكتُّ خوفًا من الفضيحةِ", "خوفًا"]], e: "المصدر الذي يجيب عن لماذا." },
    { t: "match", sn: "تمييز عن المطلق", q: "طابق كل جملة بنوع مفعولها.",
      pairs: [["وقفتُ إجلالًا للمعلمِ", "مفعول لأجله"], ["انتصرَ الجيشُ انتصارًا", "مفعول مطلق"], ["سكتُّ خوفًا", "مفعول لأجله"], ["فرحتُ فرحًا", "مفعول مطلق"]], e: "لأجله يبيّن السبب، والمطلق يوكّد أو يبيّن النوع أو العدد." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["وقفتُ", "إجلالٌ", "للمعلمِ", "احترامًا"], a: 1, fix: "إجلالًا", e: "المفعول لأجله منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["اجتهدَ", "الطالبُ", "رغبةٌ", "في النجاح"], a: 2, fix: "رغبةً", e: "المفعول لأجله منصوب." },
    { t: "err", sn: "تصويب في سياق", q: "حدّد الكلمة المضبوطة خطأً.", words: ["سكتُّ", "خوفٌ", "من", "الفضيحة"], a: 1, fix: "خوفًا", e: "المفعول لأجله منصوب." },
  ],
};

const SEED_COURSES = [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11, C12, C13, C14, C15, C16, C17, C18, C19, C20, C21, C22, C23, C24, C25, C26, C27, C28, C29, C30, C31, C32, C33, C34];

/* ============================ تخزين وأدوات ============================ */
const K = {
  courses: "gfs:courses:v5", students: "gfs:students:v5", attempts: "gfs:attempts:v5", progress: "gfs:progress:v5",
  teachers: "gfs:teachers:v5", blocksAdmin: "gfs:blocksadmin:v5", blockGroups: "gfs:blockgroups:v1", audit: "gfs:audit:v5", parentTok: "gfs:parenttok:v5",
  codes: "gfs:codes:v1", orgEmail: "gfs:orgemail:v1",
};
const readKey = async (k, f) => { try { const r = await window.storage.get(k, true); return r && r.value ? JSON.parse(r.value) : f; } catch { return f; } };
const writeKey = async (k, v) => { try { await window.storage.set(k, JSON.stringify(v), true); return true; } catch { return false; } };

// تخزين قائم على السجلّ الواحد لا على مصفوفة كبيرة واحدة: كل طالب/محاولة/كورس
// له مفتاحه الخاص، فكتابة عنصر واحد لا تُعيد كتابة البقية ولا تصطدم بكتابة
// متزامنة من متصفّح آخر يعمل على عنصر مختلف — وهو ما يمنع فقدان بيانات
// المشاركين الآخرين عند الاستخدام الجماعي المتزامن للمنصة.
const REC = { student: "gfs:rec:student:", attempt: "gfs:rec:attempt:", progress: "gfs:rec:progress:", course: "gfs:rec:course:", audit: "gfs:rec:audit:", parentTok: "gfs:rec:ptok:", intervention: "gfs:rec:intervention:", newsletter: "gfs:rec:newsletter:" };
const safeId = (s) => String(s).replace(/[\s\/\\'"]+/g, "_");
async function listRecords(prefix) {
  try {
    const idx = await window.storage.list(prefix, true);
    const keys = (idx && idx.keys) || [];
    if (!keys.length) return [];
    const vals = await Promise.all(keys.map((k) => window.storage.get(k, true).catch(() => null)));
    return vals.filter(Boolean).map((v) => { try { return JSON.parse(v.value); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}
async function putRecord(prefix, id, obj) { try { await window.storage.set(prefix + safeId(id), JSON.stringify(obj), true); return true; } catch { return false; } }
async function readRecord(prefix, id) { try { const r = await window.storage.get(prefix + safeId(id), true); return r && r.value ? JSON.parse(r.value) : null; } catch { return null; } }
async function deleteRecord(prefix, id) { try { await window.storage.delete(prefix + safeId(id), true); return true; } catch { return false; } }
const uid = () => Math.random().toString(36).slice(2, 10);
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pKey = (s, c) => `${s}|${c}`;
const normEmail = (s) => String(s || "").trim().toLowerCase();
const dateAr = (i) => { try { return new Date(i).toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" }); } catch { return ""; } };
const norm = (s) => (s || "").replace(/[\u064B-\u0652\u0640]/g, "").replace(/[«»؟.،]/g, "").replace(/\s+/g, "").trim();

function grade(item, v) {
  if (v === undefined || v === null) return false;
  if (item.t === "mcq" || item.t === "err" || item.t === "tf") return v === item.a;
  if (item.t === "fill") return (item.a || []).some((x) => norm(x) === norm(v));
  if (item.t === "match") return item.pairs.every((p, i) => v[i] === p[1]);
  return false;
}
const answerText = (it, v) => v === undefined || v === null ? "بلا إجابة"
  : it.t === "mcq" ? it.o[v] : it.t === "err" ? it.words[v] : it.t === "tf" ? (v ? "صواب" : "خطأ")
  : it.t === "fill" ? v : it.pairs.map((p, i) => `${p[0]} ← ${v[i] || "—"}`).join("، ");
const correctText = (it) => it.t === "mcq" ? it.o[it.a] : it.t === "err" ? `${it.words[it.a]} ← ${it.fix}`
  : it.t === "tf" ? (it.a ? "صواب" : "خطأ") : it.t === "fill" ? it.a[0] : it.pairs.map((p) => `${p[0]} ← ${p[1]}`).join("، ");

function dedupeBank(bank) {
  const seen = new Set();
  return (bank || []).filter((b) => {
    if (!b || !b.t || !b.q || !QTYPE[b.t]) return false;
    const k = norm(b.q) + "|" + norm(correctText(b));
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}
function collectLessonStrings(value, out = []) {
  if (value == null) return out;
  if (typeof value === "string") { out.push(value); return out; }
  if (Array.isArray(value)) { value.forEach((v) => collectLessonStrings(v, out)); return out; }
  if (typeof value === "object") Object.entries(value).forEach(([k, v]) => { if (k !== "bank") collectLessonStrings(v, out); });
  return out;
}
function cleanBank(course) {
  const inLesson = new Set();
  (course.stages || []).forEach((st) => (st.checks || []).forEach((c) => inLesson.add(norm(c.q))));
  const lessonText = norm(collectLessonStrings(course.stages || []).join(" "));
  const seen = new Set();
  return (course.bank || []).filter((b) => {
    if (!b || !b.t || !b.q || !QTYPE[b.t]) return false;
    const nq = norm(b.q);
    const k = nq + "|" + norm(correctText(b));
    const repeatedInLesson = nq.length >= 18 && lessonText.includes(nq);
    if (seen.has(k) || inLesson.has(nq) || repeatedInLesson) return false;
    seen.add(k); return true;
  });
}
function courseQuality(course) {
  const original = Array.isArray(course?.bank) ? course.bank : [];
  const clean = cleanBank(course || {});
  const duplicateCount = Math.max(0, original.length - clean.length);
  const stageCount = (course?.stages || []).length;
  const types = new Set(clean.map((q) => q.t)).size;
  const objectiveOk = String(course?.objective || "").trim().length >= 12;
  const explanationChars = collectLessonStrings(course?.stages || []).join(" ").trim().length;
  const questionScore = Math.min(30, Math.round(clean.length / 25 * 30));
  const varietyScore = Math.min(20, types * 5);
  const structureScore = Math.min(20, stageCount * 4);
  const clarityScore = (objectiveOk ? 10 : 4) + (explanationChars >= 350 ? 10 : explanationChars >= 150 ? 7 : 3);
  const duplicateScore = duplicateCount === 0 ? 10 : Math.max(0, 10 - duplicateCount * 3);
  return { score: Math.max(0, Math.min(100, questionScore + varietyScore + structureScore + clarityScore + duplicateScore)),
    cleanCount: clean.length, duplicateCount, stageCount, types, objectiveOk, explanationChars };
}

// إرسال بريد حقيقي عبر /api/send-email — "أطلق ولا تنتظر": فشل الإرسال لا
// يوقف أو يغيّر أي سلوك آخر في المنصة.
function notifyEmail(to, subject, html) {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) return;
  fetch("/api/send-email", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: recipients, subject, html }),
  }).catch(() => { });
}

async function sendEmailTracked(to, subject, html) {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) return { ok: false, status: 0 };
  try {
    const r = await fetch("/api/send-email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: recipients, subject, html }),
    });
    return { ok: r.ok, status: r.status };
  } catch { return { ok: false, status: 0 }; }
}
async function runEmailTasks(tasks, chunkSize = 8) {
  const results = [];
  for (let i = 0; i < tasks.length; i += chunkSize) {
    const chunk = tasks.slice(i, i + chunkSize);
    const r = await Promise.all(chunk.map((fn) => fn()));
    results.push(...r);
  }
  return results;
}
function nlEsc(v="") { return String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]); }
function newsletterEmailHtml(rec, studentName, parentCopy=false) {
  const side=(arr,tone,title)=>{const first=(arr||[])[0]||{title:"",objectives:[]};return `<div style="background:${tone==='red'?'linear-gradient(145deg,#8D2132,#AE2D43)':'linear-gradient(145deg,#12329B,#1851C8)'};color:#fff;border-radius:20px;padding:18px;min-height:310px"><h3 style="font-size:22px;margin:0 0 14px">${title}</h3><div style="background:#fff;color:#17233d;border-radius:999px;padding:16px;text-align:center;font-weight:700;font-size:18px;margin-bottom:12px">${nlEsc(first.title||'الدرس')}</div>${(first.objectives||[]).map((o,i)=>`<div style="background:#fff;color:#253858;border-radius:12px;padding:11px;margin:8px 0"><strong>${i+1}</strong> · ${nlEsc(o)}</div>`).join('')}${(arr||[]).slice(1).map(l=>`<div style="border:1px solid rgba(255,255,255,.3);border-radius:12px;padding:10px;margin-top:10px"><strong>${nlEsc(l.title||'درس إضافي')}</strong><ul>${(l.objectives||[]).map(o=>`<li>${nlEsc(o)}</li>`).join('')}</ul></div>`).join('')}</div>`};
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#eef2f8;padding:22px;line-height:1.8"><div style="max-width:900px;margin:auto;background:#fff;border-radius:24px;overflow:hidden"><div style="background:linear-gradient(112deg,#7d1f31,#282966,#102f8f);color:#fff;padding:28px;text-align:center"><div style="font-size:30px;font-weight:800">النشرة الأسبوعية</div><div>اللغة العربية · الأسبوع من ${nlEsc(rec.weekStart||'')} إلى ${nlEsc(rec.weekEnd||'')}</div></div><div style="padding:20px"><p>${parentCopy?'عزيزي ولي الأمر':'مرحبًا'} ${nlEsc(studentName||'')},</p><p>${parentCopy?'إليكم ما تعلمه الطالب هذا الأسبوع وما سيبدأه الأسبوع القادم.':'هذه نشرتك الأسبوعية في اللغة العربية.'}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${side(rec.currentLessons,'red','✅ ماذا تعلمنا هذا الأسبوع؟')}${side(rec.nextLessons,'blue','🚀 ماذا سنتعلم الأسبوع القادم؟')}</div><p style="margin-top:18px;text-align:center"><a href="${typeof window!=="undefined"?window.location.origin:""}" style="display:inline-block;background:#12329b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700">فتح منصة بالعربي أحلى</a></p><p style="font-size:12px;color:#667085;text-align:center">نُشرت بواسطة ${nlEsc(rec.teacherName||'معلم اللغة العربية')} — ${rec.publishedAt?new Date(rec.publishedAt).toLocaleString('ar-AE'):''}</p></div></div></div>`;
}
function toCSV(rows, headers) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.map(esc).join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\r\n");
}
function downloadText(filename, text, mime = "text/csv;charset=utf-8") {
  const blob = new Blob(["\uFEFF" + text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
async function downloadXLSX(filename, aoa) {
  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 26 }, { wch: 16 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(wb, ws, "قائمة الطلاب");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
async function downloadXLSXReport(filename, sheetName, aoa) {
  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// طباعة/PDF حقيقية عبر نافذة طباعة معزولة (بلا تدخّل في تنسيق المنصة
// الأصلي) — يستعملها المستخدم عبر "حفظ كـ PDF" في مربّع الطباعة، بلا أي
// مكتبة PDF جديدة تُضاف لهيكل المشروع. يحمل كل عناصر الترويسة المطلوبة
// عدا شعار المدرسة (لا أملك ملف الشعار الفعلي لتضمينه — نص اسم المدرسة فقط).
function printReport(title, periodLabel, bodyHtml) {
  const w = window.open("", "_blank");
  if (!w) return alert("يرجى السماح بالنوافذ المنبثقة لطباعة التقرير.");
  w.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body{font-family:"IBM Plex Sans Arabic","Noto Sans Arabic",Tahoma,sans-serif;padding:28px;color:#0B2E33}
      h1{font-size:20px;margin:0 0 4px}
      .meta{font-size:12px;color:#3B5C60;margin-bottom:18px}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px}
      th,td{border:1px solid #DCE4DF;padding:6px 8px;text-align:right}
      th{background:#F4F6F3}
      .sec{font-weight:700;margin:16px 0 8px}
    </style></head><body>
    <h1>مدرسة GEMS Founders — قسم اللغة العربية</h1>
    <div class="meta">${title} — الفترة: ${periodLabel} — تاريخ التقرير: ${new Date().toLocaleDateString("ar-AE")}</div>
    ${bodyHtml}
    </body></html>`);
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 300);
}

function assignedTo(course, student) {
  if (course.status !== "published") return false;
  if (course.grade !== student.grade || course.stream !== student.stream) return false;
  if ((course.students || []).length) return course.students.includes(student.key);
  return (course.blocks || []).includes("ALL") || (course.blocks || []).includes(student.block);
}

/* ============================ عناصر عامة ============================ */
function Chip({ tone = "n", children }) {
  const m = { n: [T.paper, T.inkSoft], g: [T.greenSoft, T.green], a: [T.goldSoft, T.gold], r: [T.brickSoft, T.brick] };
  const [bg, fg] = m[tone] || m.n;
  return <span className="chip" style={{ background: bg, color: fg }}>{children}</span>;
}
const Bar = ({ pct, tone }) => <div className="inkbar"><i style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: tone || T.green }} /></div>;
// دائرة نسبة مئوية — تُستعمل أثناء الاختبار (نسبة ما أُجيب عنه) وفي شاشة
// النتيجة (الدرجة النهائية)، بدل الاكتفاء برقم أو شريط مسطّح فقط.
function CircleProgress({ pct, size = 84, stroke = 9, tone, label, sub }) {
  const p = Math.max(0, Math.min(100, pct));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (p / 100) * c;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.ruleSoft} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone || T.green} strokeWidth={stroke}
            strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset .4s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size / 4.2, color: T.ink }}>
          {Math.round(p)}%
        </div>
      </div>
      {label && <div style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft }}>{label}</div>}
      {sub && <div style={{ fontSize: 11, color: T.inkSoft }}>{sub}</div>}
    </div>
  );
}
const Stat = ({ label, value, note, tone }) => (
  <div className="card" style={{ padding: 15 }}>
    <div style={{ fontSize: 11, color: T.inkSoft, fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 27, fontWeight: 700, color: tone || T.ink }}>{value}</div>
    {note && <div style={{ fontSize: 11, color: T.inkSoft }}>{note}</div>}
  </div>
);

// رسم بياني خطّي حقيقي — يبني نقاطه من بيانات فعلية مُمرَّرة إليه (لا
// قيمًا وهمية)، ويُظهر نقطة البداية والنهاية ومسار الارتفاع/الانخفاض
// بينهما بوضوح، بلا أي مكتبة خارجية.
function TrendChart({ points, height = 120, tone }) {
  if (!points || points.length < 2) return <div style={{ fontSize: 12, color: T.inkSoft, padding: 12 }}>لا بيانات كافية بعد لرسم اتجاه — تحتاج أسبوعين على الأقل من المحاولات.</div>;
  const w = 100, h = height;
  const vals = points.map((p) => p.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const stepX = w / (points.length - 1);
  const coords = points.map((p, i) => ({ x: i * stepX, y: h - 20 - ((p.v - min) / range) * (h - 40), v: p.v, label: p.label }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const color = tone || T.green;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="1.6" fill={i === 0 || i === coords.length - 1 ? T.ink : color} />
          <text x={c.x} y={h - 6} fontSize="4.5" textAnchor="middle" fill={T.inkSoft}>{c.label}</text>
          {(i === 0 || i === coords.length - 1) && <text x={c.x} y={c.y - 4} fontSize="5" textAnchor="middle" fontWeight="700" fill={T.ink}>{Math.round(c.v)}%</text>}
        </g>
      ))}
    </svg>
  );
}
const Switch = ({ on, onClick }) => <span className="sw" data-on={on ? "1" : "0"} onClick={onClick}><i /></span>;

// بوابة كشف: البيانات الحساسة لا تُعرض تلقائيًا عند فتح التبويب، بل تنتظر
// ضغطة صريحة — حاجز إضافي يمنع عرض بيانات طلاب أو سجلّ نشاط لمجرد المرور بالصفحة.
function Locked({ title, note, children }) {
  const [open, setOpen] = useState(false);
  if (open) return children;
  return (
    <div className="card" style={{ padding: 28, textAlign: "center", background: T.paper }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
      <h4 style={{ marginBottom: 6 }}>{title || "بيانات محمية"}</h4>
      <p style={{ fontSize: 13, color: T.inkSoft, marginBottom: 14 }}>{note || "هذا القسم يحتوي بيانات حساسة. اضغط للمتابعة."}</p>
      <button className="btn btn-p" onClick={() => setOpen(true)}>إظهار البيانات</button>
    </div>
  );
}

function QInput({ item, value, onChange, locked, showResult }) {
  const ok = showResult ? grade(item, value) : null;
  if (item.t === "err") return <div>{item.words.map((w, i) => (
    <button key={i} className="word" disabled={locked} data-on={value === i ? "1" : "0"}
      data-r={showResult ? (i === item.a ? "ok" : value === i ? "no" : "") : ""} onClick={() => onChange(i)}>{w}</button>))}</div>;
  if (item.t === "mcq") return <div>{item.o.map((o, i) => (
    <button key={i} className="opt" disabled={locked} data-on={value === i ? "1" : "0"}
      data-r={showResult ? (i === item.a ? "ok" : value === i ? "no" : "") : ""} onClick={() => onChange(i)}>{o}</button>))}</div>;
  if (item.t === "tf") return <div style={{ display: "flex", gap: 8 }}>{[["صواب", true], ["خطأ", false]].map(([l, v]) => (
    <button key={l} className="opt" style={{ flex: 1, textAlign: "center" }} disabled={locked} data-on={value === v ? "1" : "0"}
      data-r={showResult ? (v === item.a ? "ok" : value === v ? "no" : "") : ""} onClick={() => onChange(v)}>{l}</button>))}</div>;
  if (item.t === "fill") return <input className="inp" disabled={locked} value={value || ""} placeholder="اكتب إجابتك"
    style={showResult ? { borderColor: ok ? T.green : T.brick, background: ok ? T.greenSoft : T.brickSoft } : undefined}
    onChange={(e) => onChange(e.target.value)} />;
  if (item.t === "match") {
    const opts = item._opts || item.pairs.map((p) => p[1]);
    return <div className="grid">{item.pairs.map((p, i) => (
      <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ minWidth: 150, fontWeight: 600 }}>{p[0]}</span>
        <select className="inp" disabled={locked} style={{ flex: 1, minWidth: 170, borderColor: showResult ? ((value || [])[i] === p[1] ? T.green : T.brick) : T.rule }}
          value={(value || [])[i] || ""} onChange={(e) => { const v = [...(value || [])]; v[i] = e.target.value; onChange(v); }}>
          <option value="">اختر…</option>{opts.map((o, k) => <option key={k} value={o}>{o}</option>)}
        </select></div>))}</div>;
  }
  return null;
}
function Check({ item }) {
  const [v, setV] = useState(item.t === "match" ? [] : undefined);
  const [done, setDone] = useState(false);
  const ok = grade(item, v);
  const it = item.t === "match" ? { ...item, _opts: shuffle(item.pairs.map((p) => p[1])) } : item;
  return (
    <div className="card" style={{ padding: 16, background: T.paper, marginTop: 12, borderColor: done ? (ok ? T.green : T.brick) : T.rule }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <strong style={{ fontSize: 14 }}>{item.q}</strong><Chip>{QTYPE[item.t]}</Chip></div>
      {item.img && <WordCard text={item.img} tone={T.gold} />}
      <QInput item={it} value={v} onChange={setV} locked={done} showResult={done} />
      {!done ? <button className="btn btn-o" style={{ marginTop: 10 }} disabled={v === undefined || v === ""} onClick={() => setDone(true)}>تحقّق</button>
        : <div style={{ marginTop: 10, color: ok ? T.green : T.brick, fontWeight: 600 }}>
            {ok ? "إجابة صحيحة." : `الصواب: ${correctText(item)}`}
            <div style={{ color: T.inkSoft, fontWeight: 400, fontSize: 14 }}>{item.e}</div></div>}
    </div>
  );
}
function SortGame({ s }) {
  const [pool, setPool] = useState(() => shuffle(s.items.map((x, i) => i)));
  const [bins, setBins] = useState(() => Object.fromEntries(s.cats.map((c) => [c, []])));
  const [sel, setSel] = useState(null); const [done, setDone] = useState(false);
  const drop = (cat) => { if (sel === null || done) return; setBins({ ...bins, [cat]: [...bins[cat], sel] }); setPool(pool.filter((i) => i !== sel)); setSel(null); };
  const total = s.items.length;
  const right = Object.entries(bins).reduce((n, [c, arr]) => n + arr.filter((i) => s.items[i][1] === c).length, 0);
  return (
    <div>
      <div style={{ minHeight: 44, marginBottom: 10 }}>
        {pool.map((i) => <button key={i} className="word" data-on={sel === i ? "1" : "0"} onClick={() => setSel(i)}>{s.items[i][0]}</button>)}
        {pool.length === 0 && <span style={{ color: T.inkSoft, fontSize: 14 }}>وزّعت كل البطاقات.</span>}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {s.cats.map((c) => (<div key={c} className="bin" onClick={() => drop(c)}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 6 }}>{c}</div>
          {bins[c].map((i) => <span key={i} className="word" data-r={done ? (s.items[i][1] === c ? "ok" : "no") : ""} style={{ cursor: "default" }}>{s.items[i][0]}</span>)}
        </div>))}
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn btn-o" disabled={pool.length > 0 || done} onClick={() => setDone(true)}>تحقّق من الفرز</button>
        {done && <span style={{ fontWeight: 700, color: right === total ? T.green : T.gold }}>أصبت {right} من {total}</span>}
        {done && right < total && <button className="btn btn-q" onClick={() => { setPool(shuffle(s.items.map((x, i) => i))); setBins(Object.fromEntries(s.cats.map((c) => [c, []]))); setDone(false); }}>أعد المحاولة</button>}
      </div>
    </div>
  );
}
function TemplateGrid({ s }) {
  const [v, setV] = useState({}); const [done, setDone] = useState(false);
  const cells = s.rows.length * (s.cols.length - 1);
  const right = s.rows.reduce((n, r, ri) => n + r.slice(1).filter((c, ci) => v[`${ri}-${ci + 1}`] === c).length, 0);
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="tbl"><thead><tr>{s.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{s.rows.map((r, ri) => (<tr key={ri}>
          <td style={{ fontFamily: "Amiri,serif", fontSize: 19, fontWeight: 700 }}>{r[0]}</td>
          {r.slice(1).map((correct, k) => { const ci = k + 1; const key = `${ri}-${ci}`; const ok = done ? v[key] === correct : null;
            return (<td key={ci}>
              <select className="inp" disabled={done} style={{ minWidth: 110, padding: "7px 9px", borderColor: done ? (ok ? T.green : T.brick) : T.rule, background: done ? (ok ? T.greenSoft : T.brickSoft) : "#fff" }}
                value={v[key] || ""} onChange={(e) => setV({ ...v, [key]: e.target.value })}>
                <option value="">—</option>{(s.opts[ci] || []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>{done && !ok && <div style={{ fontSize: 12, color: T.brick }}>الصواب: {correct}</div>}
            </td>); })}</tr>))}</tbody></table>
      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <button className="btn btn-o" disabled={done} onClick={() => setDone(true)}>تحقّق من القالب</button>
        {done && <span style={{ fontWeight: 700, color: right === cells ? T.green : T.gold }}>أصبت {right} من {cells} خانة</span>}
        {done && <button className="btn btn-q" onClick={() => { setV({}); setDone(false); }}>أعد المحاولة</button>}
      </div>
    </div>
  );
}
function ErrorHunt({ item, n }) {
  const [v, setV] = useState(null); const done = v !== null, ok = v === item.a;
  return (
    <div className="card" style={{ padding: 14, marginBottom: 10, borderColor: done ? (ok ? T.green : T.brick) : T.rule }}>
      <div style={{ fontSize: 12, color: T.inkSoft, fontWeight: 700, marginBottom: 6 }}>الجملة {n}</div>
      <div>{item.words.map((w, i) => (<button key={i} className="word" disabled={done} data-on={v === i ? "1" : "0"}
        data-r={done && i === item.a ? "ok" : ""} onClick={() => setV(i)}>{w}</button>))}</div>
      {done && <div style={{ marginTop: 10, color: ok ? T.green : T.brick, fontWeight: 600 }}>
        {ok ? "أصبت." : `الخطأ في: ${item.words[item.a]}`} — الصواب: {item.fix}
        <div style={{ color: T.inkSoft, fontWeight: 400, fontSize: 14 }}>{item.e}</div></div>}
    </div>
  );
}
function StageBody({ s }) {
  const [open, setOpen] = useState(-1); const [txt, setTxt] = useState(""); const [show, setShow] = useState(false);
  return (
    <div>
      {s.strat && <div className="strat">استراتيجية: {s.strat}</div>}
      {s.intro && <p style={{ marginTop: 0 }}>{s.intro}</p>}
      {(s.art || []).map((a) => <Art key={a} name={a} />)}
      {s.videoUrl && <div className="vid" style={{ marginBottom: 10 }}><iframe src={s.videoUrl} title="فيديو" allowFullScreen /></div>}
      {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noreferrer" className="btn btn-o" style={{ display: "inline-block", marginBottom: 10 }}>فتح الملف المرفق</a>}
      {s.t === "discover" && <div style={{ overflowX: "auto" }}><table className="tbl">
        <thead><tr>{s.table.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{s.table.rows.map((r, i) => (<tr key={i}>{r.map((c, k) => (
          <td key={k} style={{ fontWeight: k === 0 ? 700 : 400, fontSize: k === 0 ? 18 : 14, fontFamily: k === 0 ? "Amiri,serif" : "inherit" }}>{c}</td>))}</tr>))}</tbody>
      </table></div>}
      {s.t === "rule" && <>{s.body && <p>{s.body}</p>}{s.concepts && s.concepts.length > 0 && <ConceptRow items={s.concepts} />}{s.note && <div className="card" style={{ padding: 14, background: T.goldSoft, borderColor: T.gold }}>{s.note}</div>}</>}
      {s.t === "worked" && (s.items || []).map((it, i) => (
        <div key={i} className="card" style={{ padding: 0, marginBottom: 10, overflow: "hidden" }}>
          <button onClick={() => setOpen(open === i ? -1 : i)} style={{ width: "100%", textAlign: "right", padding: "12px 16px", border: 0, background: open === i ? T.greenSoft : "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ fontSize: 20, fontFamily: "Amiri,serif", fontWeight: 700 }}>{it.w}</span>
            <span style={{ float: "left", fontSize: 13, color: T.inkSoft }}>{open === i ? "إخفاء" : "اعرض التحليل"}</span></button>
          {open === i && <div style={{ padding: "8px 16px 16px" }}>{(it.steps || []).map((st, k) => (
            <div key={k} className="step"><span style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>خطوة {k + 1}</span><div>{st}</div></div>))}</div>}
        </div>))}
      {s.t === "template" && <TemplateGrid s={s} />}
      {s.t === "sort" && <SortGame s={s} />}
      {s.t === "video" && (s.clips || []).map((v, i) => (
        <div key={i} style={{ marginBottom: 16 }}><h4 style={{ marginBottom: 8 }}>{v.label}</h4>
          <div className="vid"><iframe src={`https://www.youtube.com/embed/${v.id}?start=${v.start || 0}&rel=0`} title={v.label} allowFullScreen /></div>
          <a href={`https://www.youtube.com/watch?v=${v.id}&t=${v.start || 0}`} target="_blank" rel="noreferrer" style={{ color: T.green, fontSize: 13 }}>افتح في نافذة جديدة</a>
        </div>))}
      {s.t === "video" && (!s.clips || s.clips.length === 0) && !s.videoUrl && s.videoQuery && (
        <div className="card" style={{ padding: 16, background: T.goldSoft, borderColor: T.gold }}>
          لا فيديو مرفق بعد لهذه الوحدة. <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(s.videoQuery)}`} target="_blank" rel="noreferrer" style={{ color: T.green, fontWeight: 700 }}>ابحث في يوتيوب عن «{s.videoQuery}»</a> ثم أضِف رابطه من زر «تعديل» في الكورس.
        </div>)}
      {s.t === "errors" && (s.items || []).map((it, i) => <ErrorHunt key={i} item={it} n={i + 1} />)}
      {s.t === "problem" && <>
        <div className="card" style={{ padding: 16, background: T.paper, whiteSpace: "pre-line", marginBottom: 12 }}>{s.body}</div>
        <button className="btn btn-o" onClick={() => setOpen(open === 0 ? -1 : 0)}>{open === 0 ? "أخفِ الحلّ" : "اعرض الحلّ المتدرّج"}</button>
        {open === 0 && <div style={{ marginTop: 12 }}>{(s.steps || []).map((st, k) => (
          <div key={k} className="step"><span style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>خطوة {k + 1}</span><div>{st}</div></div>))}</div>}
      </>}
      {s.t === "produce" && <>
        <p style={{ fontWeight: 600 }}>{s.prompt}</p>
        <textarea className="tarea" rows={4} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="اكتب إجابتك هنا…" />
        {s.pair && <div className="card" style={{ padding: 12, background: T.goldSoft, borderColor: T.gold, marginTop: 10, fontSize: 14 }}>{s.pair}</div>}
        <button className="btn btn-o" style={{ marginTop: 10 }} disabled={txt.trim().length < 10} onClick={() => setShow(true)}>
          {txt.trim().length < 10 ? "اكتب إجابتك أولًا" : "قارن بالنموذج"}</button>
        {show && <div className="card" style={{ padding: 14, marginTop: 10, background: T.greenSoft, borderColor: T.green }}>{s.model}</div>}
      </>}
      {s.t === "summary" && <>
        {s.body && <p style={{ fontSize: 17 }}>{s.body}</p>}
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          {(s.bullets || []).map((b) => <div key={b} className="card" style={{ padding: 12, background: T.greenSoft, borderColor: T.green, textAlign: "center", fontWeight: 600 }}>{b}</div>)}
        </div>{s.note && <p style={{ color: T.inkSoft, fontSize: 14 }}>{s.note}</p>}
      </>}
      {s.reveal && <div className="card" style={{ padding: 14, marginTop: 14, background: T.greenSoft, borderColor: T.green }}>{s.reveal}</div>}
      {(s.checks || []).map((c, i) => <Check key={i} item={c} />)}
    </div>
  );
}

/* ============================ الدخول ============================ */
function Login({ onStudent, onTeacher, onAdmin, onParent, codes, students, teachers = [], courses = [], attempts = [] }) {
  const [stage, setStage] = useState("welcome"); // welcome | pick | form
  const [role, setRole] = useState(null); // s | p | t | a
  const [step, setStep] = useState(1); // خطوة معالج الطالب
  const [f, setF] = useState({ name: "", sid: "", grade: 7, block: "A", stream: "A", email: "" });
  const [code, setCode] = useState(""); const [tname, setTname] = useState(""); const [temail, setTemail] = useState(""); const [ptok, setPtok] = useState(""); const [err, setErr] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [rememberT, setRememberT] = useState(true); const [rememberA, setRememberA] = useState(true);
  const [teacherMem, setTeacherMem] = useState(null); const [adminMem, setAdminMem] = useState(null);
  const [welcomeName, setWelcomeName] = useState("");

  // تخزين شخصي غير مشترك (shared:false) — يخصّ حساب هذا المستخدم وحده على
  // هذا الجهاز، لا يظهر لأي مستخدم آخر يفتح المنصة. هذا بديل window.storage
  // الآمن لِـ localStorage الممنوع استخدامه داخل المُصنَّفات.
  useEffect(() => { (async () => {
    try { const r = await window.storage.get("gfs:mem:teacher", false); if (r && r.value) setTeacherMem(JSON.parse(r.value)); } catch { }
    try { const r = await window.storage.get("gfs:mem:admin", false); if (r && r.value) setAdminMem(JSON.parse(r.value)); } catch { }
  })(); }, []);
  useEffect(() => {
    if (role === "t" && teacherMem) { setTname(teacherMem.name || ""); setTemail(teacherMem.email || ""); setCode(teacherMem.code || ""); }
    if (role === "a" && adminMem) { setCode(adminMem.code || ""); }
  }, [role, teacherMem, adminMem]);
  const forget = async (which) => {
    try { await window.storage.delete(`gfs:mem:${which}`, false); } catch { }
    if (which === "teacher") { setTeacherMem(null); setTname(""); setTemail(""); setCode(""); }
    else { setAdminMem(null); setCode(""); }
  };

  // نفس منطق التحقق والأمان الأصلي بحرفه — لا تغيير في شرط المطابقة (اسم +
  // رقم + صف + بلوك يجب أن يطابق سجلًّا موجودًا). الإضافة الوحيدة: لحظة
  // ترحيب مرئية بعد نجاح المطابقة وقبل الدخول الفعلي، لا قبلها — حتى لا
  // يُكشَف اسم أي طالب لمجرّد تخمين رقمه.
  const go = () => {
    if (f.name.trim().split(/\s+/).length < 3) return setErr("اكتب الاسم الثلاثي كاملًا.");
    if (!/^\d{6}$/.test(f.sid)) return setErr("أدخل آخر ستة أرقام من الرقم المدرسي.");
    const key = `${f.grade}-${f.block}-${f.sid}`;
    const existing = (students || []).find((s) => s.key === key);
    if (!existing) return setErr("هذه البيانات غير مسجَّلة في قائمة الطلاب. راجع معلمك للتأكّد من تسجيلك في القائمة.");
    const normalize = (n) => n.trim().replace(/\s+/g, " ").toLowerCase();
    if (normalize(existing.name) !== normalize(f.name)) return setErr("الاسم المُدخَل لا يطابق الاسم المسجَّل لهذا الرقم التعريفي. تحقّق من كتابة اسمك كما هو مسجَّل بالضبط.");
    setErr(""); setWelcomeName(existing.name);
    setTimeout(() => onStudent({ ...f, name: existing.name, role: "student", key,
      email: existing.email || f.email || "", parentEmail: existing.parentEmail || "", teacherEmail: existing.teacherEmail || "" }), 900);
  };

  const ripple = (e) => {
    const btn = e.currentTarget;
    const d = Math.max(btn.clientWidth, btn.clientHeight);
    const span = document.createElement("span");
    span.className = "lh-ripple-el";
    span.style.width = span.style.height = d + "px";
    const rect = btn.getBoundingClientRect();
    span.style.left = (e.clientX - rect.left - d / 2) + "px";
    span.style.top = (e.clientY - rect.top - d / 2) + "px";
    btn.appendChild(span);
    setTimeout(() => span.remove(), 650);
  };

  const ROLES = [
    { k: "s", icon: "🎓", title: "طالب", desc: "ابدأ رحلتك التعليمية.", accent: T.green },
    { k: "p", icon: "👨‍👩‍👧", title: "ولي أمر", desc: "تابع تقدم ابنك.", accent: T.gold },
    { k: "t", icon: "👨‍🏫", title: "معلم", desc: "أنشئ الكورسات وتابع طلابك.", accent: T.brick },
    { k: "a", icon: "👨‍💼", title: "رئيس القسم", desc: "حلّل الأداء واتخذ القرار.", accent: T.navy },
  ];
  const activeRole = ROLES.find((r) => r.k === role);
  const accent = activeRole ? activeRole.accent : T.brick;
  const certCount = (attempts || []).filter((a) => a.passed).length;

  // توزيع الطلاب حسب نسبة إنجازهم الفعلي للكورسات المُسنَدة إليهم —
  // محسوبة من بيانات المنصة الحقيقية (courses/attempts)، لا أرقام افتراضية.
  const [ringsOn, setRingsOn] = useState(false);
  useEffect(() => {
    setRingsOn(false); const t = setTimeout(() => setRingsOn(true), 200); return () => clearTimeout(t);
  }, [stage]);
  const completionStats = (() => {
    const rows = (students || []).map((s) => {
      const assigned = (courses || []).filter((c) => assignedTo(c, s));
      if (!assigned.length) return null;
      const at = (attempts || []).filter((a) => a.student === s.key);
      const passedCourses = new Set(at.filter((a) => a.passed).map((a) => a.course)).size;
      return Math.round((passedCourses / assigned.length) * 100);
    }).filter((v) => v !== null);
    const total = rows.length || 1;
    const high = rows.filter((p) => p >= 90).length;
    const mid = rows.filter((p) => p >= 70 && p < 90).length;
    const low = rows.filter((p) => p < 70).length;
    return {
      total: rows.length,
      tiers: [
        { label: "مرتفع (90%+)", color: T.green, count: high, pct: Math.round((high / total) * 100) },
        { label: "متوسط (70–89%)", color: T.gold, count: mid, pct: Math.round((mid / total) * 100) },
        { label: "منخفض (أقل من 70%)", color: T.brick, count: low, pct: Math.round((low / total) * 100) },
      ],
    };
  })();

  return (
    <div className="gfs lh-wrap" style={{ "--accent": accent }}><style>{CSS}</style>
      <div className="lh-bg" />
      <div className="lh-orb lh-orb1" /><div className="lh-orb lh-orb2" />
      <img src={LOGO_URL} alt="" aria-hidden="true" className="lh-watermark" />
      <svg className="lh-letters" viewBox="0 0 800 600" aria-hidden="true">
        <text x="40" y="130">ع</text><text x="630" y="100">ل</text><text x="70" y="490">م</text>
        <text x="690" y="530">أ</text><text x="380" y="70">س</text><text x="360" y="570">ح</text>
      </svg>

      <div className="wrap lh-shell">
        {stage === "welcome" && (
          <div className="lh-fade">
            <div className="lh-hero">
              <div className="logo-chip lg" style={{ margin: "0 auto 18px" }}><img src={LOGO_URL} alt="GEMS Founders School" /></div>
              <div className="brand-tagline" style={{ textAlign: "center" }}>قسم اللغة العربية — ننمو · ننجح · نزدهر</div>
              <h1 style={{ color: "#fff", fontSize: 34, textAlign: "center", margin: "10px 0 8px" }}>مرحبًا بكم في منصة كورسات GFS بالعربي أحلى</h1>
              <p style={{ color: "#E7DCE8", textAlign: "center", fontSize: 16, margin: "0 0 10px" }}>رحلة ذكية لإتقان اللغة العربية</p>
              <p style={{ color: "#C6DAD8", textAlign: "center", fontSize: 13, margin: "0 0 30px", maxWidth: 480, marginInline: "auto" }}>منصة كاملة: تعلّم للطالب، لوحة تحكم للمعلم، وحدة إدارة للقسم، وبوابة تقرير لولي الأمر.</p>
            </div>

            <h2 style={{ color: "#fff", textAlign: "center", marginBottom: 20 }}>من أنت؟ اختر خانتك للدخول</h2>
            <div className="lh-rolegrid">
              {ROLES.filter((r) => r.k === "s" || r.k === "p").map((r) => (
                <button key={r.k} className="lh-rolecard" style={{ "--card-accent": r.accent }}
                  onClick={(e) => { ripple(e); setRole(r.k); setStage("form"); setStep(1); setErr(""); setWelcomeName(""); }}>
                  <span className="lh-role-icon">{r.icon}</span>
                  <span className="lh-role-title">{r.title}</span>
                  <span className="lh-role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button className="btn btn-q" style={{ color: "#E7DCE8" }} onClick={(e) => { ripple(e); setStage("staff"); }}>الإدارة ←</button>
            </div>

            <div className="lh-landing-gauges">
              <h3 style={{ color: "#fff", textAlign: "center", marginBottom: 4 }}>الطلاب داخل المنصة</h3>
              <p className="lh-gauge-note">نسبة إنجاز الطلاب لكورساتهم المُسنَدة ({completionStats.total} طالب لديهم كورسات)</p>
              <div className="lh-gaugewrap lh-gaugewrap-lg">
                {completionStats.tiers.map((t) => {
                  const r = 34, c = 2 * Math.PI * r;
                  const offset = c - (Math.min(t.pct, 100) / 100) * c;
                  return (
                    <div className="lh-gauge" key={t.label}>
                      <svg viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r={r} className="lh-gauge-track" />
                        <circle cx="45" cy="45" r={r} className="lh-gauge-fill" stroke={t.color}
                          style={{ strokeDasharray: c, strokeDashoffset: ringsOn ? offset : c }} />
                        <text x="45" y="41" className="lh-gauge-pct">{t.pct}%</text>
                        <text x="45" y="56" className="lh-gauge-cnt">{t.count}</text>
                      </svg>
                      <span className="lh-gauge-label">{t.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="lh-stats" style={{ maxWidth: 360, margin: "18px auto 0" }}>
                <div className="lh-stat"><b>{(students || []).length}</b><span>طالب</span></div>
                <div className="lh-stat"><b>{(courses || []).length}</b><span>كورس</span></div>
                <div className="lh-stat"><b>{certCount}</b><span>شهادة</span></div>
              </div>
            </div>
          </div>
        )}

        {stage === "staff" && (
          <div className="lh-fade">
            <button className="btn btn-q" style={{ color: "#E7DCE8", marginBottom: 16 }} onClick={() => setStage("welcome")}>→ رجوع</button>
            <h2 style={{ color: "#fff", textAlign: "center", marginBottom: 20 }}>دخول الإدارة</h2>
            <div className="lh-rolegrid">
              {ROLES.filter((r) => r.k === "t" || r.k === "a").map((r) => (
                <button key={r.k} className="lh-rolecard" style={{ "--card-accent": r.accent }}
                  onClick={(e) => { ripple(e); setRole(r.k); setStage("form"); setStep(1); setErr(""); setWelcomeName(""); }}>
                  <span className="lh-role-icon">{r.icon}</span>
                  <span className="lh-role-title">{r.title}</span>
                  <span className="lh-role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === "form" && (
          <div className="lh-formshell lh-fade">
            <div className="lh-panel">
              <button className="btn btn-q" style={{ marginBottom: 10, color: T.inkSoft }} onClick={() => { setStage((role === "t" || role === "a") ? "staff" : "welcome"); setErr(""); }}>→ رجوع لاختيار الدور</button>

              {role === "s" && welcomeName ? (
                <div className="lh-welcome lh-fade">
                  <div className="lh-avatar">{welcomeName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}</div>
                  <h3 style={{ margin: "12px 0 4px" }}>مرحبًا {welcomeName} 👋</h3>
                  <p style={{ color: T.inkSoft, margin: 0 }}>جارٍ فتح كورساتك…</p>
                </div>
              ) : role === "s" ? (
                <div className="grid">
                  <div className="lh-step-dots"><span className={step === 1 ? "on" : ""} /><span className={step === 2 ? "on" : ""} /></div>
                  {step === 1 && <>
                    <div><label className="lbl" htmlFor="nm">الاسم الثلاثي</label><input id="nm" className="inp" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="سالم أحمد الكعبي" /></div>
                    <div><label className="lbl" htmlFor="sid">آخر ٦ أرقام من الرقم المدرسي</label><input id="sid" className="inp mono" value={f.sid} maxLength={6} inputMode="numeric" onChange={(e) => setF({ ...f, sid: e.target.value.replace(/\D/g, "") })} placeholder="000000" /></div>
                    {err && <div style={{ color: T.brick }}>{err}</div>}
                    <button className="btn btn-p lh-ripple-btn" onClick={(e) => {
                      if (f.name.trim().split(/\s+/).length < 3) return setErr("اكتب الاسم الثلاثي كاملًا.");
                      if (!/^\d{6}$/.test(f.sid)) return setErr("أدخل آخر ستة أرقام من الرقم المدرسي.");
                      setErr(""); ripple(e); setStep(2);
                    }}>التالي ←</button>
                  </>}
                  {step === 2 && <>
                    <div><label className="lbl" htmlFor="em">بريدك الإلكتروني (اختياري — يُستخدم فقط إذا لم يكن مسجّلًا في ملف الطلاب)</label><input id="em" className="inp" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="name@school.ae" /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      <div><label className="lbl" htmlFor="gr">الصف</label><select id="gr" className="inp" value={f.grade} onChange={(e) => setF({ ...f, grade: +e.target.value })}>{Array.from({ length: 13 }, (_, i) => i + 1).map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
                      <div><label className="lbl" htmlFor="bl">البلوك</label><select id="bl" className="inp" value={f.block} onChange={(e) => setF({ ...f, block: e.target.value })}>{DEFAULT_BLOCKS.map((b) => <option key={b}>{b}</option>)}</select></div>
                      <div><label className="lbl" htmlFor="st">المسار</label><select id="st" className="inp" value={f.stream} onChange={(e) => setF({ ...f, stream: e.target.value })}><option value="A">عربي أ</option><option value="B">عربي ب</option></select></div>
                    </div>
                    {err && <div style={{ color: T.brick }}>{err}</div>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-q" onClick={() => setStep(1)}>→ السابق</button>
                      <button className="btn btn-p lh-ripple-btn" style={{ flex: 1 }} onClick={(e) => { ripple(e); go(); }}>دخول المنصة</button>
                    </div>
                  </>}
                </div>
              ) : null}

              {role === "t" && <div className="grid">
                <div><label className="lbl" htmlFor="tn">اسمك</label><input id="tn" className="inp" value={tname} onChange={(e) => setTname(e.target.value)} placeholder="أ. سالم المعلم" /></div>
                <div><label className="lbl" htmlFor="te">بريدك الإلكتروني المدرسي</label><input id="te" className="inp mono" type="email" value={temail} onChange={(e) => setTemail(e.target.value)} placeholder="name@school.ae" /></div>
                <div><label className="lbl" htmlFor="cd">رمز دخول المعلم</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input id="cd" className="inp mono" style={{ flex: 1 }} type={showCode ? "text" : "password"} value={code} onChange={(e) => setCode(e.target.value)} placeholder="—" />
                    <button type="button" className="btn btn-q" onClick={() => setShowCode(!showCode)} title={showCode ? "إخفاء الرمز" : "إظهار الرمز"}>{showCode ? "🙈" : "👁️"}</button>
                  </div></div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.inkSoft }}>
                  <input type="checkbox" checked={rememberT} onChange={(e) => setRememberT(e.target.checked)} /> تذكّرني على هذا الجهاز
                </label>
                {teacherMem && <button className="btn btn-q" style={{ alignSelf: "start", padding: "2px 0", color: T.brick }} onClick={() => forget("teacher")}>نسيان البيانات المحفوظة</button>}
                {err && <div style={{ color: T.brick }}>{err}</div>}
                <button className="btn btn-p lh-ripple-btn" onClick={async (e) => {
                  const email = normEmail(temail);
                  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("أدخل بريدك الإلكتروني المدرسي بصورة صحيحة.");
                  const name = tname.trim() || "معلم اللغة العربية";
                  const knownTeacher = (teachers || []).find((t) => t.name === name || normEmail(t.email) === email);
                  const expectedCode = knownTeacher?.code || codes.teacher;
                  if (code !== expectedCode) return setErr("الرمز غير صحيح. راجع رئيس القسم للحصول عليه.");
                  ripple(e);
                  if (rememberT) { try { await window.storage.set("gfs:mem:teacher", JSON.stringify({ name, email, code }), false); } catch { } }
                  else { try { await window.storage.delete("gfs:mem:teacher", false); } catch { } }
                  onTeacher(name, email);
                }}>ادخل إلى لوحة المعلم</button>
              </div>}

              {role === "a" && <div className="grid">
                <div><label className="lbl" htmlFor="ad">رمز دخول رئيس القسم</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input id="ad" className="inp mono" style={{ flex: 1 }} type={showCode ? "text" : "password"} value={code} onChange={(e) => setCode(e.target.value)} placeholder="—" />
                    <button type="button" className="btn btn-q" onClick={() => setShowCode(!showCode)} title={showCode ? "إخفاء الرمز" : "إظهار الرمز"}>{showCode ? "🙈" : "👁️"}</button>
                  </div></div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.inkSoft }}>
                  <input type="checkbox" checked={rememberA} onChange={(e) => setRememberA(e.target.checked)} /> تذكّرني على هذا الجهاز
                </label>
                {adminMem && <button className="btn btn-q" style={{ alignSelf: "start", padding: "2px 0", color: T.brick }} onClick={() => forget("admin")}>نسيان البيانات المحفوظة</button>}
                {err && <div style={{ color: T.brick }}>{err}</div>}
                <button className="btn btn-p lh-ripple-btn" onClick={async (e) => {
                  if (code !== codes.admin) return setErr("الرمز غير صحيح.");
                  ripple(e);
                  if (rememberA) { try { await window.storage.set("gfs:mem:admin", JSON.stringify({ code }), false); } catch { } }
                  else { try { await window.storage.delete("gfs:mem:admin", false); } catch { } }
                  onAdmin();
                }}>ادخل إلى وحدة الإدارة</button>
              </div>}

              {role === "p" && <div className="grid">
                <p style={{ margin: 0, fontSize: 13, color: T.inkSoft }}>الصق رمز التقرير الذي أرسله لك المعلم أو القسم.</p>
                <div><label className="lbl" htmlFor="pt">رمز التقرير</label><input id="pt" className="inp mono" value={ptok} onChange={(e) => setPtok(e.target.value.trim())} placeholder="PR-XXXXXXXX" /></div>
                {err && <div style={{ color: T.brick }}>{err}</div>}
                <button className="btn btn-p lh-ripple-btn" onClick={(e) => { ripple(e); ptok ? onParent(ptok, setErr) : setErr("أدخل رمز التقرير أولًا."); }}>عرض تقرير ابني</button>
              </div>}
            </div>

            <aside className="lh-side">
              <p className="lh-quote">"من أتقن لغته، فهم هويته"</p>
              <div className="lh-gaugewrap">
                {completionStats.tiers.map((t) => {
                  const r = 34, c = 2 * Math.PI * r;
                  const offset = c - (Math.min(t.pct, 100) / 100) * c;
                  return (
                    <div className="lh-gauge" key={t.label}>
                      <svg viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r={r} className="lh-gauge-track" />
                        <circle cx="45" cy="45" r={r} className="lh-gauge-fill" stroke={t.color}
                          style={{ strokeDasharray: c, strokeDashoffset: ringsOn ? offset : c }} />
                        <text x="45" y="41" className="lh-gauge-pct">{t.pct}%</text>
                        <text x="45" y="56" className="lh-gauge-cnt">{t.count}</text>
                      </svg>
                      <span className="lh-gauge-label">{t.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="lh-gauge-note">نسبة إنجاز الطلاب لكورساتهم المُسنَدة ({completionStats.total} طالب لديهم كورسات)</p>
              <div className="lh-stats">
                <div className="lh-stat"><b>{(students || []).length}</b><span>طالب</span></div>
                <div className="lh-stat"><b>{(courses || []).length}</b><span>كورس</span></div>
                <div className="lh-stat"><b>{certCount}</b><span>شهادة</span></div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ الطالب ============================ */

function NewsletterViewer({ newsletter, archive = [], onSelect }) {
  if (!newsletter) return <div className="card" style={{padding:28,textAlign:"center",color:T.inkSoft}}>لم تُنشر نشرة أسبوعية لهذا الصف بعد.</div>;
  const firstCurrent=(newsletter.currentLessons||[])[0]||{title:"",objectives:[]};
  const firstNext=(newsletter.nextLessons||[])[0]||{title:"",objectives:[]};
  const extras=(arr)=>Math.max(0,(arr||[]).length-1);
  const objectiveList=(objectives,tone)=>{const items=(objectives||[]).map(o=>String(o||"").trim()).filter(Boolean);return items.length?<div className="nl-objective-list">{items.map((o,i)=><div className="nl-objective" key={i}><span className="nl-objective-num">{i+1}</span><span>{o}</span></div>)}</div>:null;};
  const renderSide=(tone,title,icon,lesson,allLessons)=> <section className={`nl-weekcard ${tone}`}>
    <img src={LION_MARK_URL} className="nl-watermark" alt="" aria-hidden="true"/>
    <div className="nl-week-title"><h2>{title}</h2><span>{icon}</span></div>
    <div className="nl-lesson-feature">
      <div className="nl-lesson-orb"><div><small>الدرس</small><b>{lesson.title||"—"}</b></div></div>
      {objectiveList(lesson.objectives,tone)}
    </div>
    {extras(allLessons)>0 && <div className="nl-extra-lessons">{allLessons.slice(1).map((l,i)=><div className="nl-extra" key={i}><b>{l.title||`درس إضافي ${i+2}`}</b><ul>{(l.objectives||[]).map(o=>String(o||"").trim()).filter(Boolean).map((o,j)=><li key={j}>{o}</li>)}</ul></div>)}</div>}
  </section>;
  return <div className="nl-shell">
    <header className="nl-head">
      <img src={LION_MARK_URL} className="nl-watermark" alt="" aria-hidden="true"/>
      <div className="nl-head-logo"><img src={LOGO_URL} alt="GEMS Founders School"/></div>
      <div style={{position:"relative",zIndex:2}}><div style={{fontSize:37,fontWeight:900}}>النشرة الأسبوعية</div><div style={{fontSize:20,opacity:.94}}>اللغة العربية</div><div style={{marginTop:9,fontSize:13,border:"1px solid rgba(255,255,255,.5)",borderRadius:999,padding:"5px 16px"}}>الأسبوع من {newsletter.weekStart} إلى {newsletter.weekEnd}</div></div>
    </header>
    <div className="nl-meta"><div>🎓 الصف <b>{newsletter.grade}</b></div><div>👥 البلوكات <b>{(newsletter.blocks||[]).join("، ")}</b></div><div>👨‍🏫 المعلم <b>{newsletter.teacherName||"معلم اللغة العربية"}</b></div><div>📅 تاريخ النشر <b>{newsletter.publishedAt?dateAr(newsletter.publishedAt):"—"}</b></div></div>
    <div className="nl-grid">
      {renderSide("red","ماذا تعلمنا هذا الأسبوع؟","✅",firstCurrent,newsletter.currentLessons||[])}
      {renderSide("blue","ماذا سنتعلم الأسبوع القادم؟","🚀",firstNext,newsletter.nextLessons||[])}
    </div>
    <div className="nl-publish-note">معًا نستمر كل أسبوع لبناء مهاراتنا وتحقيق أهدافنا · نُشرت بواسطة {newsletter.teacherName||"معلم اللغة العربية"}</div>
    {archive.length>0 && <div className="nl-timeline-wrap"><div className="nl-timeline-title">🏁 رحلتنا التعليمية — أرشيف النشرات</div><div className="nl-timeline">{archive.map((x,i)=><button className={`nl-timebtn ${x.id===newsletter.id?"on":""}`} key={x.id} onClick={()=>onSelect&&onSelect(x.id)}>الأسبوع {archive.length-i} · {dateAr(x.publishedAt||x.createdAt)}</button>)}</div></div>}
  </div>;
}

function NewsletterEditor({ teacherName, teacherEmail, students, newsletters, onSave, onDelete }) {
  const mineStudents = students.filter(s=>!teacherEmail || !s.teacherEmail || normEmail(s.teacherEmail)===normEmail(teacherEmail));
  const allGrades = Array.from({length:13},(_,i)=>i+1);
  const allBlocks = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const emptyObjectives=()=>["","","",""];
  const normalizeObjectives=(arr)=>[...(arr||[])].map(x=>String(x||"")).slice(0,4).concat(["","","",""]).slice(0,4);
  const normalizeLessons=(arr)=>(arr||[]).map(l=>({...l,objectives:normalizeObjectives(l.objectives)}));
  const [grade,setGrade]=useState(7);
  const [blocks,setBlocks]=useState([]);
  const [blockPickerOpen,setBlockPickerOpen]=useState(false);
  const [weekStart,setWeekStart]=useState(()=>new Date().toISOString().slice(0,10));
  const [weekEnd,setWeekEnd]=useState(()=>{const d=new Date();d.setDate(d.getDate()+6);return d.toISOString().slice(0,10)});
  const [currentLessons,setCurrentLessons]=useState([{title:"",objectives:emptyObjectives()}]);
  const [nextLessons,setNextLessons]=useState([{title:"",objectives:emptyObjectives()}]);
  const [busy,setBusy]=useState(false),[msg,setMsg]=useState("");
  const addLesson=(which)=>which==="current"?setCurrentLessons(v=>[...v,{title:"",objectives:emptyObjectives()}]):setNextLessons(v=>[...v,{title:"",objectives:emptyObjectives()}]);
  const updateLesson=(which,idx,field,val)=>{const setter=which==="current"?setCurrentLessons:setNextLessons;setter(prev=>prev.map((l,i)=>i===idx?{...l,[field]:val}:l));};
  const updateObjective=(which,lessonIdx,objIdx,val)=>{const setter=which==="current"?setCurrentLessons:setNextLessons;setter(prev=>prev.map((l,i)=>{if(i!==lessonIdx)return l;const objectives=normalizeObjectives(l.objectives);objectives[objIdx]=val;return {...l,objectives};}));};
  const clean=(arr)=>arr.map(l=>({title:l.title.trim(),objectives:(l.objectives||[]).map(o=>String(o||"").trim()).filter(Boolean).slice(0,4)})).filter(l=>l.title||l.objectives.length);
  const improve=async()=>{setBusy(true);setMsg("");const prompt=`أنت محرر تربوي عربي. حسّن صياغة عناوين الدروس وأهداف التعلم الآتية دون تغيير المعنى أو إضافة محتوى غير موجود. اجعل الأهداف قصيرة وقابلة للملاحظة ومناسبة للصف ${grade}. لكل درس حد أقصى أربعة أهداف تعلم فقط. أعد JSON فقط بهذا الشكل: {"currentLessons":[{"title":"","objectives":["","","",""]}],"nextLessons":[{"title":"","objectives":["","","",""]}]}.
هذا الأسبوع: ${JSON.stringify(clean(currentLessons))}
الأسبوع القادم: ${JSON.stringify(clean(nextLessons))}`;const out=await ask(prompt,"auto");if(out?.currentLessons) setCurrentLessons(normalizeLessons(out.currentLessons));if(out?.nextLessons) setNextLessons(normalizeLessons(out.nextLessons));setMsg(out?"✅ تم تحسين الصياغة. راجعها ثم قرر النشر.":"تعذّر التحسين الآن؛ يمكنك النشر بصياغتك الحالية.");setBusy(false)};
  const submit=async(status)=>{const c=clean(currentLessons),n=clean(nextLessons);if(!blocks.length)return setMsg("اختر بلوكًا واحدًا على الأقل.");if(!c.length||!n.length)return setMsg("أدخل درسًا واحدًا على الأقل لكل أسبوع.");setBusy(true);const rec={id:uid(),teacherName,teacherEmail:normEmail(teacherEmail),grade:+grade,blocks,weekStart,weekEnd,currentLessons:c,nextLessons:n,status,createdAt:new Date().toISOString()};const r=await onSave(rec);setMsg(status==="published"?`✅ تم نشر النشرة وإرسالها. ${r?.sendStats?`الطلاب: ${r.sendStats.studentSent}/${r.sendStats.studentTotal} · أولياء الأمور: ${r.sendStats.parentSent}/${r.sendStats.parentTotal}`:""}`:"✅ تم حفظ المسودة.");setBusy(false)};
  const myNews=(newsletters||[]).filter(n=>n.teacherName===teacherName).sort((a,b)=>(b.publishedAt||b.createdAt||"").localeCompare(a.publishedAt||a.createdAt||""));
  const side=(which,list,tone,title,icon)=><section className={`nl-editor-card ${tone}`}><img src={LION_MARK_URL} className="nl-watermark" alt="" aria-hidden="true"/><div className="nl-week-title"><h2>{title}</h2><span>{icon}</span></div>{list.map((l,i)=><div className="nl-editor-item" key={i}><input className="inp" placeholder="اسم الدرس" value={l.title} onChange={e=>updateLesson(which,i,"title",e.target.value)}/><div style={{marginTop:10,fontWeight:800,fontSize:14,color:"inherit"}}>في نهاية الدرس سيكون الطالب قادرًا على أن:</div><div className="grid" style={{gap:8,marginTop:8}}>{[0,1,2,3].map(j=><input key={j} className="inp" placeholder={`هدف التعلم ${j+1}`} value={normalizeObjectives(l.objectives)[j]} onChange={e=>updateObjective(which,i,j,e.target.value)}/>)}</div></div>)}<button className="btn nl-editor-add" onClick={()=>addLesson(which)}>+ إضافة درس</button></section>;
  const toggleBlock=(b)=>setBlocks(v=>v.includes(b)?v.filter(x=>x!==b):[...v,b]);
  const removeNewsletter=async(n)=>{if(!onDelete)return;const ok=window.confirm(`هل تريد حذف نشرة الصف ${n.grade} — ${(n.blocks||[]).join("، ")}؟ ستختفي أيضًا من صفحة الطالب وولي الأمر.`);if(!ok)return;setBusy(true);await onDelete(n.id,n);setMsg("🗑️ تم حذف النشرة من المنصة ومن صفحات الطلاب وأولياء الأمور.");setBusy(false);};
  return <div className="nl-editor-shell">
    <div className="card" style={{padding:20}}><div className="nl-editor-actions"><div><h2>📰 إعداد النشرة الأسبوعية</h2><p style={{margin:"3px 0",fontSize:12,color:T.inkSoft}}>المعلم يكتب المحتوى، والذكاء الاصطناعي يحسّن الصياغة فقط. لا تظهر أي إعدادات للطالب أو ولي الأمر.</p></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="btn btn-o" disabled={busy} onClick={improve}>✨ تحسين بالذكاء الاصطناعي</button><button className="btn btn-p" disabled={busy} onClick={()=>submit("published")}>📢 اعتماد ونشر وإرسال</button></div></div>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",marginTop:15}}>
        <div><label className="lbl">الصف</label><select className="inp" value={grade} onChange={e=>{setGrade(+e.target.value);setBlocks([])}}>{allGrades.map(g=><option key={g} value={g}>الصف {g}</option>)}</select></div>
        <div className="nl-block-picker" style={{gridColumn:"span 2"}}><label className="lbl">البلوكات</label><button type="button" className="nl-block-trigger" onClick={()=>setBlockPickerOpen(v=>!v)}><span>{blocks.length?`تم اختيار ${blocks.length}: ${blocks.join("، ")}`:"اضغط لاختيار البلوكات A–Z"}</span><span>{blockPickerOpen?"▲":"▼"}</span></button>{blockPickerOpen&&<div className="nl-block-panel"><div className="nl-block-actions"><button type="button" className="btn btn-o" onClick={()=>setBlocks(allBlocks)}>تحديد الكل</button><button type="button" className="btn btn-q" onClick={()=>setBlocks([])}>مسح الاختيار</button><button type="button" className="btn btn-p" onClick={()=>setBlockPickerOpen(false)}>تم</button></div><div className="nl-block-grid">{allBlocks.map(b=><button type="button" key={b} className={`nl-block-letter ${blocks.includes(b)?"on":""}`} onClick={()=>toggleBlock(b)}>{b}</button>)}</div></div>}</div>
        <div><label className="lbl">من</label><input type="date" className="inp" value={weekStart} onChange={e=>setWeekStart(e.target.value)}/></div>
        <div><label className="lbl">إلى</label><input type="date" className="inp" value={weekEnd} onChange={e=>setWeekEnd(e.target.value)}/></div>
      </div>
    </div>
    <div className="nl-editor-cards">{side("current",currentLessons,"red","ماذا تعلمنا هذا الأسبوع؟","✅")}{side("next",nextLessons,"blue","ماذا سنتعلم الأسبوع القادم؟","🚀")}</div>
    {msg&&<div className="card" style={{padding:13,background:T.greenSoft}}>{msg}</div>}
    <div className="card" style={{padding:18}}><h3>النشرات المنشورة</h3>{myNews.length===0?<p style={{color:T.inkSoft}}>لا توجد نشرات منشورة بعد.</p>:<table className="tbl"><thead><tr><th>تاريخ النشر</th><th>الصف</th><th>البلوكات</th><th>الحالة</th><th>الإرسال</th><th>إجراء</th></tr></thead><tbody>{myNews.slice(0,20).map(n=><tr key={n.id}><td>{n.publishedAt?new Date(n.publishedAt).toLocaleString("ar-AE"):"مسودة"}</td><td>{n.grade}</td><td>{(n.blocks||[]).join("، ")}</td><td>{n.status==="published"?<Chip tone="g">منشورة</Chip>:<Chip>مسودة</Chip>}</td><td>{n.sendStats?`${n.sendStats.studentSent}/${n.sendStats.studentTotal} طلاب · ${n.sendStats.parentSent}/${n.sendStats.parentTotal} أولياء أمور`:"—"}</td><td><button className="btn btn-d" disabled={busy} onClick={()=>removeNewsletter(n)}>حذف</button></td></tr>)}</tbody></table>}</div>
  </div>;
}

function StudentHome({ user, courses, progress, attempts, newsletters = [], onOpen, onCert }) {
  const mine = courses.filter((c) => assignedTo(c, user));
  const ph = phaseFor(user.grade);
  const publishedNews = newsletters.filter(n => n.status === "published" && +n.grade === +user.grade && (n.blocks || []).includes(user.block)).sort((a,b)=>(b.publishedAt||"").localeCompare(a.publishedAt||""));
  const [newsId,setNewsId]=useState(publishedNews[0]?.id||null);
  const [page,setPage]=useState("home");
  const activeNews = publishedNews.find(n=>n.id===newsId) || publishedNews[0] || null;
  const mineAttempts=(attempts||[]).filter(a=>a.student===user.key).sort((a,b)=>(b.at||b.createdAt||"").localeCompare(a.at||a.createdAt||""));
  const passedAttempts=mineAttempts.filter(a=>a.passed);
  const passedCourseIds = new Set(passedAttempts.map((a) => a.course));
  const avg=mineAttempts.length?Math.round(mineAttempts.reduce((s,a)=>s+(+a.pct||0),0)/mineAttempts.length):0;
  const stateOf = (c) => { const p = progress[pKey(user.key, c.id)] || { done: [], cycle: 1 }; const at = mineAttempts.filter((a) => a.course === c.id); if (at.some((a) => a.passed)) return { label: "مكتمل", tone: "g", pct: 100 }; if (at.filter((a) => a.cycle === (p.cycle || 1)).length >= (c.tries || ph.tries)) return { label: "إعادة تعلّم", tone: "r", pct: 60 }; if (p.done.length) return { label: "قيد التعلّم", tone: "a", pct: Math.round((p.done.length / Math.max(1,c.stages.length)) * 90) }; return { label: "جديد", tone: "n", pct: 0 }; };
  const lockOf = (c) => { if (!c.prereqId || passedCourseIds.has(c.prereqId)) return null; const prereq = courses.find((x) => x.id === c.prereqId); return prereq ? prereq.title : "كورس سابق"; };
  const bestOf=(c)=>{const at=mineAttempts.filter(a=>a.course===c.id);return at.length?Math.max(...at.map(a=>+a.pct||0)):0};
  const trend=mineAttempts.slice(0,6).reverse().map(a=>+a.pct||0); while(trend.length<6) trend.unshift(0);
  const points=trend.map((v,i)=>`${i*18+5},${100-(v*.75+12)}`).join(" ");
  const colors=["green","blue","purple","red"];
  const completed=mine.filter(c=>stateOf(c).label==="مكتمل").length;
  const bestScore=mineAttempts.length?Math.max(...mineAttempts.map(a=>+a.pct||0)):0;

  const CourseCards=()=>mine.length===0?<div className="card" style={{padding:28,textAlign:"center",color:T.inkSoft}}>لا توجد كورسات مسندة إليك حاليًا.</div>:<div className="stu-course-grid">{mine.map((c,idx)=>{const st=stateOf(c),lock=lockOf(c),best=bestOf(c),at=mineAttempts.filter(a=>a.course===c.id);const passed=at.find(a=>a.passed);const color=colors[idx%colors.length];return <div className={`stu-course ${color}`} key={c.id}><div className="stu-course-top"><div style={{position:"relative",zIndex:2}}><div style={{fontSize:11,opacity:.9}}>{DOMAINS[c.domain]} · الصف {c.grade}</div><h3 style={{color:"#fff",fontSize:22,marginTop:8}}>{c.title}</h3><div style={{marginTop:8}}><Chip tone={st.tone}>{lock?"مقفل":st.label}</Chip></div></div></div><div className="stu-course-body"><div className="stu-ring" style={{"--pct":st.pct,"--ring":color==="green"?"#16816d":color==="blue"?"#2154c7":color==="purple"?"#7650ba":"#d62d49"}}><b>{st.pct}%</b></div><div className="stu-course-meta"><div>أفضل نتيجة<b>{best||"—"}{best?"%":""}</b></div><div>المحاولات<b>{at.length}/{c.tries||ph.tries}</b></div></div>{lock&&<div style={{fontSize:11,color:T.brick,textAlign:"center"}}>أكمل «{lock}» أولًا</div>}{passed?<button className="stu-course-btn" onClick={()=>onCert&&onCert(passed.id)}>🏆 عرض الشهادة</button>:<button className="stu-course-btn" disabled={!!lock} onClick={()=>!lock&&onOpen(c.id)}>{st.label==="جديد"?"ابدأ الآن":"متابعة الكورس"} ←</button>}</div></div>})}</div>;

  const Back=()=> <button className="stu-page-back" onClick={()=>setPage("home")}>← رجوع للصفحة الرئيسية</button>;

  return <div className="stu-shell">
    <div className="stu-nav">
      <button className={page==="courses"?"on":""} onClick={()=>setPage("courses")}>🧠 كورساتي</button>
      <button className={page==="newsletter"?"on":""} onClick={()=>setPage("newsletter")}>📰 النشرة الأسبوعية</button>
      <button className={page==="journey"?"on":""} onClick={()=>setPage("journey")}>🏅 إنجازاتي ورحلتي التعليمية</button>
      <button className={page==="certificates"?"on":""} onClick={()=>setPage("certificates")}>📜 الشهادات</button>
    </div>

    <div className="wrap">
      {page==="home" && <>
        <div className="stu-kpis">
          <div className="stu-kpi" onClick={()=>setPage("courses")}><div className="stu-kpi-label">الكورسات المسندة إليك</div><div className="stu-kpi-value">{mine.length}</div><div className="stu-kpi-note">اضغط لفتح كورساتي</div></div>
          <div className="stu-kpi" onClick={()=>setPage("journey")}><div className="stu-kpi-label">المكتمل</div><div className="stu-kpi-value">{completed}</div><div className="stu-kpi-note">اضغط لفتح إنجازاتي</div></div>
          <div className="stu-kpi" onClick={()=>setPage("journey")}><div className="stu-kpi-label">متوسط أدائك</div><div className="stu-kpi-value">{avg}%</div><div className="stu-kpi-note">اضغط لمشاهدة رحلتي</div></div>
          <div className="stu-kpi" onClick={()=>setPage("certificates")}><div className="stu-kpi-label">شهاداتك</div><div className="stu-kpi-value">{passedAttempts.length}</div><div className="stu-kpi-note">اضغط لفتح الشهادات</div></div>
        </div>

        <div className="stu-home-actions">
          <button className="stu-home-card" onClick={()=>setPage("courses")}><span className="ico">🧠</span><b>كورساتي</b><small>الكورسات المهارية والتقدم والمحاولات</small></button>
          <button className="stu-home-card" onClick={()=>setPage("newsletter")}><span className="ico">📰</span><b>النشرة الأسبوعية</b><small>ماذا تعلمنا وماذا سنتعلم الأسبوع القادم</small></button>
          <button className="stu-home-card" onClick={()=>setPage("journey")}><span className="ico">🏅</span><b>إنجازاتي ورحلتي التعليمية</b><small>الإنجازات وتطور النتائج وآخر النشاطات</small></button>
          <button className="stu-home-card" onClick={()=>setPage("certificates")}><span className="ico">📜</span><b>الشهادات</b><small>فتح شهادات إتمام الكورسات مباشرة</small></button>
        </div>

        <div className="stu-section-head"><div><h2>🧠 كورساتي</h2><p>أهم ما تحتاج إليه الآن — تابع كورساتك من هنا.</p></div><button className="btn btn-o" onClick={()=>setPage("courses")}>عرض جميع الكورسات</button></div>
        <CourseCards/>
      </>}

      {page==="courses" && <section>
        <div className="stu-page-head"><div><h1>🧠 كورساتي</h1><p style={{margin:0,color:T.inkSoft}}>تابع تقدمك في الكورسات المهارية المسندة إليك.</p></div><Back/></div>
        <CourseCards/>
      </section>}

      {page==="newsletter" && <section>
        <div className="stu-page-head"><div><h1>📰 النشرة الأسبوعية</h1><p style={{margin:0,color:T.inkSoft}}>ما تعلمناه هذا الأسبوع وما سنبدأه في الأسبوع القادم.</p></div><Back/></div>
        {publishedNews.length>1&&<div style={{marginBottom:12}}><span className="chip">{publishedNews.length} نشرات محفوظة</span></div>}
        <NewsletterViewer newsletter={activeNews} archive={publishedNews} onSelect={setNewsId}/>
      </section>}

      {page==="journey" && <section>
        <div className="stu-page-head"><div><h1>🏅 إنجازاتي ورحلتي التعليمية</h1><p style={{margin:0,color:T.inkSoft}}>إنجازاتك الحقيقية واتجاه تقدمك في مكان واحد.</p></div><Back/></div>
        <div className="stu-achievements">
          <div className="stu-ach"><span>🏆</span><b>{passedAttempts.length} شهادة</b><small>شهادات إتمام مستحقة</small></div>
          <div className="stu-ach"><span>⭐</span><b>{bestScore}% أفضل نتيجة</b><small>أعلى نتيجة حققتها</small></div>
          <div className="stu-ach"><span>🔥</span><b>{completed} كورس مكتمل</b><small>استمر في التقدم</small></div>
        </div>
        <div className="stu-lower">
          <section className="stu-panel"><div className="stu-section-head" style={{marginTop:0}}><div><h2 style={{fontSize:22}}>📈 رحلتي التعليمية</h2><p>اتجاه نتائج آخر محاولاتك.</p></div></div><svg viewBox="0 0 100 100" style={{width:"100%",height:210,overflow:"visible"}}><line x1="5" y1="88" x2="95" y2="88" stroke="#dfe5ee"/><polyline points={points} fill="none" stroke="#2454c6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>{trend.map((v,i)=><g key={i}><circle cx={i*18+5} cy={100-(v*.75+12)} r="2.7" fill="#2454c6"/><text x={i*18+5} y={100-(v*.75+17)} fontSize="5" textAnchor="middle" fill="#51617e">{v}%</text></g>)}</svg></section>
          <section className="stu-panel"><div className="stu-section-head" style={{marginTop:0}}><div><h2 style={{fontSize:22}}>🕘 آخر النشاطات</h2><p>آخر ما أنجزته في المنصة.</p></div></div><div className="stu-activity">{mineAttempts.slice(0,8).map((a,i)=>{const c=courses.find(x=>x.id===a.course);return <div className="stu-act" key={a.id||i}><span>{a.passed?"🏆 أكملت":"📝 محاولة في"} {c?.title||"كورس"}</span><b>{a.pct||0}%</b></div>})}{mineAttempts.length===0&&<div style={{color:T.inkSoft,fontSize:12}}>لم تسجل محاولات بعد.</div>}</div></section>
        </div>
      </section>}

      {page==="certificates" && <section>
        <div className="stu-page-head"><div><h1>📜 الشهادات</h1><p style={{margin:0,color:T.inkSoft}}>افتح شهادات إتمام الكورسات مباشرة.</p></div><Back/></div>
        {passedAttempts.length===0?<div className="card" style={{padding:22,color:T.inkSoft}}>لا توجد شهادات حتى الآن.</div>:<div className="stu-achievements">{passedAttempts.map(a=>{const c=courses.find(x=>x.id===a.course);return <button key={a.id} className="stu-ach" style={{textAlign:"right",cursor:"pointer",fontFamily:"inherit"}} onClick={()=>onCert&&onCert(a.id)}><span>📜</span><b>{c?.title||"شهادة إتمام"}</b><small>{a.pct}% · اضغط لفتح الشهادة</small></button>})}</div>}
      </section>}

      <footer className="adm-footer" style={{marginTop:32,borderRadius:18}}><div style={{position:"relative",zIndex:1,fontSize:11}}>منصة بالعربي أحلى — رحلة تعلم مستمرة</div><div className="adm-footer-main"><div className="adm-footer-tag">نزدهر • ننجح • ننمو</div><div style={{opacity:.72}}>GEMS Founders School Dubai — Inspiring Minds, Empowering Futures</div></div><div style={{position:"relative",zIndex:1,fontSize:11}}>قسم اللغة العربية</div></footer>
    </div>
  </div>;
}

function CourseView({ user, course, progress, attempts, onProgress, onStartExam, onCert }) {
  const key = pKey(user.key, course.id);
  const p = progress[key] || { done: [], cycle: 1 };
  const ph = phaseFor(course.grade);
  const max = course.tries || ph.tries, cyc = p.cycle || 1;
  const at = attempts.filter((a) => a.student === user.key && a.course === course.id);
  const cycAt = at.filter((a) => a.cycle === cyc);
  const passed = at.find((a) => a.passed);
  const [open, setOpen] = useState(Math.min(p.done.length, course.stages.length - 1));
  const allDone = p.done.length >= course.stages.length;
  const locked = !passed && cycAt.length >= max;
  const nQ = Math.min(course.q || ph.q, cleanBank(course).length);
  return (
    <div className="wrap" style={{ paddingBottom: 60 }}>
      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2>{course.title}</h2><div style={{ fontSize: 13, color: T.inkSoft }}>{DOMAINS[course.domain]} · الصف {course.grade}</div>
            <div style={{ textAlign: "left", fontSize: 13, color: T.inkSoft, marginTop: 8 }}><div>الأسئلة: {nQ}</div><div>النجاح: {course.pass || ph.pass}%</div><div>المحاولات: {cycAt.length} من {max}</div></div>
          </div>
          <CircleProgress pct={(p.done.length / course.stages.length) * 100} size={92} stroke={9}
            tone={allDone ? T.green : T.gold} label={allDone ? "اكتمل الحضور" : "نسبة الحضور"} sub={allDone ? "الاختبار مفتوح" : "أكمل 100% ليُفتح الاختبار"} />
        </div>
        <p style={{ marginBottom: 0, marginTop: 12 }}>{course.objective}</p>
        <div style={{ marginTop: 12 }}><Bar pct={(p.done.length / course.stages.length) * 100} /></div>
      </div>
      {passed && <div className="card" style={{ padding: 20, marginBottom: 18, background: T.goldSoft, borderColor: T.gold }}>
        <h3 style={{ color: T.gold }}>أتقنت هذه القاعدة</h3><p style={{ margin: "6px 0 12px" }}>نتيجتك {passed.pct}%.</p>
        <button className="btn btn-g" onClick={() => onCert(passed.id)}>اعرض الشهادة</button></div>}
      {locked && !passed && <div className="card" style={{ padding: 20, marginBottom: 18, background: T.brickSoft, borderColor: T.brick }}>
        <h3 style={{ color: T.brick }}>وقفة إعادة تعلّم</h3><p style={{ margin: "6px 0 12px" }}>استنفدت {max} محاولات.</p>
        <button className="btn" style={{ background: T.brick, color: "#fff" }} onClick={() => { onProgress(key, { done: [], cycle: cyc + 1 }); setOpen(0); }}>ابدأ دورة إعادة التعلّم</button></div>}
      <div className="card" style={{ overflow: "hidden" }}>
        {course.stages.map((s, i) => {
          const isDone = p.done.includes(i), isOpen = open === i, can = i === 0 || p.done.includes(i - 1);
          return (<div key={i} style={{ borderBottom: i < course.stages.length - 1 ? `1px solid ${T.ruleSoft}` : "none" }}>
            <button onClick={() => can && setOpen(isOpen ? -1 : i)} disabled={!can}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: isOpen ? T.paper : "transparent", border: 0, cursor: can ? "pointer" : "not-allowed", fontFamily: "inherit", textAlign: "right", opacity: can ? 1 : .45 }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: isDone ? T.green : T.ruleSoft, color: isDone ? "#fff" : T.inkSoft, fontSize: 12, fontWeight: 700 }}>{isDone ? "✓" : i + 1}</span>
              <span style={{ flex: 1, fontWeight: 600 }}>{s.title}</span>{!can && <span style={{ fontSize: 12, color: T.inkSoft }}>مقفلة</span>}</button>
            {isOpen && can && <div style={{ padding: "4px 18px 20px" }}><StageBody s={s} />
              {!isDone && <button className="btn btn-o" style={{ marginTop: 14 }} onClick={() => { onProgress(key, { ...p, done: [...p.done, i].sort((a, b) => a - b), cycle: cyc }); setOpen(i + 1 < course.stages.length ? i + 1 : i); }}>أنهيت هذه الوحدة</button>}</div>}
          </div>); })}
      </div>
      <div style={{ marginTop: 20 }}><button className="btn btn-p" disabled={!allDone || locked || !!passed} onClick={() => onStartExam(course.id)}>
        {passed ? "اجتزت الاختبار" : allDone ? `ابدأ الاختبار (${nQ} سؤالًا)` : "أكمل الوحدات لفتح الاختبار"}</button></div>
      {at.length > 0 && <div className="card" style={{ marginTop: 20, padding: 18 }}><h3 style={{ marginBottom: 10 }}>محاولاتك</h3>
        <table className="tbl"><thead><tr><th>المحاولة</th><th>النتيجة</th><th>الحالة</th><th>التاريخ</th></tr></thead>
          <tbody>{at.map((a) => (<tr key={a.id}><td className="mono">{a.cycle}.{a.no}</td><td className="mono">{a.pct}%</td>
            <td>{a.passed ? <Chip tone="g">ناجح</Chip> : <Chip tone="r">دون النجاح</Chip>}</td><td style={{ fontSize: 13, color: T.inkSoft }}>{dateAr(a.at)}</td></tr>))}</tbody></table></div>}
    </div>
  );
}
function Exam({ course, items, onSubmit, onCancel }) {
  const [ans, setAns] = useState({}); const [i, setI] = useState(0); const q = items[i];
  const answered = Object.keys(ans).filter((k) => { const v = ans[k]; return v !== undefined && v !== ""; }).length;
  const answeredPct = (answered / items.length) * 100;
  return (
    <div className="wrap" style={{ paddingBottom: 60, maxWidth: 780 }}><div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 14 }}>
        <div>
          <span style={{ fontSize: 13, color: T.inkSoft, display: "block", marginBottom: 6 }}>{course.title}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Chip>{QTYPE[q.t]}</Chip>
            <span className="chip" style={{ background: T.ink, color: "#fff", fontWeight: 700 }}>السؤال {i + 1} من {items.length}</span>
          </div>
        </div>
        <CircleProgress pct={answeredPct} size={72} stroke={7} tone={answeredPct === 100 ? T.green : T.gold} label="أُجبت عنه" />
      </div>
      <Bar pct={((i + 1) / items.length) * 100} />
      <h3 style={{ margin: "22px 0 16px", fontSize: 20 }}>{q.q}</h3>
      {q.img && <WordCard text={q.img} tone={T.gold} />}
      <QInput item={q} value={ans[i]} onChange={(v) => setAns({ ...ans, [i]: v })} />
      <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
        <button className="btn btn-q" disabled={i === 0} onClick={() => setI(i - 1)}>السابق</button>
        {i < items.length - 1 ? <button className="btn btn-p" onClick={() => setI(i + 1)}>التالي</button>
          : <button className="btn btn-p" disabled={answered < items.length} onClick={() => onSubmit(ans)}>{answered < items.length ? `بقي ${items.length - answered} سؤالًا` : "سلّم الاختبار"}</button>}
        <button className="btn btn-q" style={{ marginRight: "auto", color: T.brick }} onClick={onCancel}>إلغاء</button></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 16 }}>{items.map((_, k) => (
        <button key={k} onClick={() => setI(k)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${k === i ? T.green : T.rule}`, cursor: "pointer", background: ans[k] !== undefined && ans[k] !== "" ? T.greenSoft : "#fff", fontSize: 11, fontFamily: "inherit", color: T.ink }}>{k + 1}</button>))}</div>
    </div></div>
  );
}
function weakestSkill(studentKey, attempts) {
  const at = attempts.filter((a) => a.student === studentKey);
  const m = {};
  at.forEach((a) => a.detail.forEach((d) => { m[d.sn] = m[d.sn] || { c: 0, t: 0 }; m[d.sn].t++; if (d.ok) m[d.sn].c++; }));
  let worst = null, worstPct = 101;
  Object.entries(m).forEach(([k, v]) => { const pct = v.c / v.t * 100; if (pct < worstPct) { worstPct = pct; worst = k; } });
  return worst ? { skill: worst, pct: Math.round(worstPct) } : null;
}
// خريطة إتقان كاملة لطالب واحد: كل مهارة تعرّض لها مع نسبة إتقانها — تُستعمل
// لاستخراج أقوى وأضعف نقطة، ولعرض تفصيل كامل عند تحليل طالب بعينه.
function skillBreakdown(studentKey, attempts) {
  const at = attempts.filter((a) => a.student === studentKey);
  const m = {};
  at.forEach((a) => a.detail.forEach((d) => { m[d.sn] = m[d.sn] || { c: 0, t: 0 }; m[d.sn].t++; if (d.ok) m[d.sn].c++; }));
  return Object.entries(m).map(([skill, v]) => ({ skill, pct: Math.round(v.c / v.t * 100), t: v.t })).sort((a, b) => a.pct - b.pct);
}
function strongestSkill(studentKey, attempts) {
  const list = skillBreakdown(studentKey, attempts);
  return list.length ? list[list.length - 1] : null;
}
// رسم بياني لمقارنة تقدّم الطلاب مرتَّبًا من الأعلى للأدنى، مع أضعف مهارة
// لكل طالب — نفس المكوّن يُستعمل في لوحة المعلم (لطلابه) وفي الإدارة (للجميع).
function CompareChart({ rows, attempts }) {
  const sorted = [...rows].filter((r) => r.avg !== null).sort((a, b) => (b.avg || 0) - (a.avg || 0));
  if (!sorted.length) return <p style={{ color: T.inkSoft }}>لا بيانات كافية بعد — تظهر المقارنة بعد أول اختبار.</p>;
  return (
    <div>{sorted.map((r) => {
      const w = weakestSkill(r.key, attempts);
      return (
        <div key={r.key} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>{r.name} — الصف {r.grade} / {r.block}</span>
            <span className="mono">{r.avg}%</span>
          </div>
          <Bar pct={r.avg} tone={r.avg < 60 ? T.brick : r.avg < 75 ? T.gold : T.green} />
          {w && <div style={{ fontSize: 12, color: T.brick, marginTop: 3 }}>أضعف مهارة لديه: {w.skill} ({w.pct}%)</div>}
        </div>
      ); })}
    </div>
  );
}
// بطاقة تحليل طالب واحد بالتفصيل: دائرة النسبة الكلية، تقدّم كل كورس مسنَد
// إليه، وأقوى وأضعف مهارة لديه مستخرجتان من إجاباته الفعلية.
// خط تتبّع الكورسات: خط أفقي متّصل بنقاط لكل كورس — أخضر لمكتمل، ذهبي لقيد
// التنفيذ، رمادي لم يُنفَّذ إطلاقًا. يُستعمل لتتبّع طالب واحد أو صفّ كامل.
function CourseTracker({ items }) {
  if (!items.length) return <p style={{ color: T.inkSoft, fontSize: 13 }}>لا كورسات لعرضها هنا.</p>;
  const toneOf = (st) => st === "done" ? T.green : st === "progress" ? T.gold : T.rule;
  const labelOf = (st) => st === "done" ? "منفَّذ" : st === "progress" ? "قيد التنفيذ" : "لم يُنفَّذ";
  return (
    <div style={{ overflowX: "auto", padding: "8px 2px" }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: items.length * 110 }}>
        {items.map((it, i) => (
          <React.Fragment key={it.id}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 100, flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: toneOf(it.status), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                {it.status === "done" ? "✓" : it.status === "progress" ? "…" : ""}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, textAlign: "center", marginTop: 6, lineHeight: 1.3, minHeight: 28 }}>{it.title}</div>
              <div style={{ fontSize: 10, color: toneOf(it.status), fontWeight: 700 }}>{labelOf(it.status)}{it.pct !== undefined ? ` ${it.pct}%` : ""}</div>
            </div>
            {i < items.length - 1 && <div style={{ flex: 1, height: 3, background: toneOf(it.status), minWidth: 16 }} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
function StudentDetailCard({ student, courses, progress, attempts }) {
  const at = attempts.filter((a) => a.student === student.key);
  const avg = at.length ? Math.round(at.reduce((x, a) => x + a.pct, 0) / at.length) : null;
  const mine = courses.filter((c) => assignedTo(c, student));
  const weak = weakestSkill(student.key, attempts);
  const strong = strongestSkill(student.key, attempts);
  const breakdown = skillBreakdown(student.key, attempts);
  const trackerItems = mine.map((c) => {
    const p = progress[pKey(student.key, c.id)] || { done: [] };
    const pct = Math.round((p.done.length / c.stages.length) * 100);
    const passed = at.some((a) => a.course === c.id && a.passed);
    return { id: c.id, title: c.title, pct: passed ? 100 : pct, status: passed ? "done" : p.done.length ? "progress" : "notstarted" };
  });
  const doneCount = trackerItems.filter((it) => it.status === "done").length;
  const completionPct = mine.length ? Math.round((doneCount / mine.length) * 100) : 0;
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <CircleProgress pct={avg || 0} size={110} stroke={10} tone={avg === null ? T.rule : avg < 60 ? T.brick : avg < 75 ? T.gold : T.green} label="المتوسط العام" />
        <CircleProgress pct={completionPct} size={110} stroke={10} tone={T.navy} label="الكورسات المنفَّذة" sub={`${doneCount} من ${mine.length}`} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3>{student.name}</h3>
          <div style={{ fontSize: 13, color: T.inkSoft }}>الصف {student.grade} — {student.block} · {mine.length} كورس مسنَد · {at.length} محاولة</div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 10 }}>
            <div className="card" style={{ padding: 10, background: T.greenSoft, borderColor: T.green }}>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>أقوى مهارة</div>
              <div style={{ fontSize: 13 }}>{strong ? `${strong.skill} (${strong.pct}%)` : "لا بيانات بعد"}</div>
            </div>
            <div className="card" style={{ padding: 10, background: T.brickSoft, borderColor: T.brick }}>
              <div style={{ fontSize: 11, color: T.brick, fontWeight: 700 }}>أضعف مهارة</div>
              <div style={{ fontSize: 13 }}>{weak ? `${weak.skill} (${weak.pct}%)` : "لا بيانات بعد"}</div>
            </div>
          </div>
        </div>
      </div>
      <h4 style={{ marginBottom: 10 }}>خط تتبّع الكورسات — ما نُفِّذ وما لم يُنفَّذ</h4>
      <CourseTracker items={trackerItems} />
      <h4 style={{ margin: "20px 0 10px" }}>تقدّم كل كورس مسنَد</h4>
      {mine.length === 0 ? <p style={{ color: T.inkSoft, fontSize: 13 }}>لا كورسات مسنَدة لهذا الطالب بعد.</p> : mine.map((c) => {
        const p = progress[pKey(student.key, c.id)] || { done: [] };
        const pct = Math.round((p.done.length / c.stages.length) * 100);
        const passed = at.some((a) => a.course === c.id && a.passed);
        return (<div key={c.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{c.title}</span><span className="mono">{passed ? "مكتمل" : pct + "%"}</span></div>
          <Bar pct={passed ? 100 : pct} tone={passed ? T.green : T.gold} />
        </div>); })}
      {breakdown.length > 0 && <>
        <h4 style={{ margin: "16px 0 10px" }}>كل المهارات المُختبَرة</h4>
        {breakdown.map((s) => (<div key={s.skill} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>{s.skill}</span><span className="mono">{s.pct}%</span></div>
          <Bar pct={s.pct} tone={s.pct < 60 ? T.brick : s.pct < 75 ? T.gold : T.green} />
        </div>))}
      </>}
    </div>
  );
}
function Result({ attempt, course, onBack, onCert, onRetry, canRetry }) {
  const bySkill = {}, byType = {};
  attempt.detail.forEach((d) => { bySkill[d.sn] = bySkill[d.sn] || { c: 0, t: 0 }; bySkill[d.sn].t++; if (d.ok) bySkill[d.sn].c++;
    byType[d.type] = byType[d.type] || { c: 0, t: 0 }; byType[d.type].t++; if (d.ok) byType[d.type].c++; });
  return (
    <div className="wrap" style={{ paddingBottom: 60, maxWidth: 780 }}>
      <div className="card" style={{ padding: 26, textAlign: "center", borderColor: attempt.passed ? T.green : T.brick }}>
        <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 10 }}>{course.title}</div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircleProgress pct={attempt.pct} size={140} stroke={13} tone={attempt.passed ? T.green : T.brick} />
        </div>
        <div style={{ margin: "14px 0 16px" }}>{attempt.raw} من {attempt.detail.length} — النجاح {attempt.pass}%</div>
        {attempt.passed ? <button className="btn btn-g" onClick={() => onCert(attempt.id)}>احصل على شهادتك</button>
          : canRetry ? <button className="btn btn-p" onClick={onRetry}>أعد المحاولة بأسئلة جديدة</button> : <div style={{ color: T.brick, fontWeight: 600 }}>استنفدت محاولات هذه الدورة.</div>}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", marginTop: 18 }}>
        <div className="card" style={{ padding: 20 }}><h3 style={{ marginBottom: 12 }}>حسب المهارة</h3>
          {Object.entries(bySkill).map(([k, v]) => (<div key={k} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span>{k}</span><span className="mono">{v.c}/{v.t}</span></div>
            <Bar pct={v.c / v.t * 100} tone={v.c / v.t >= .7 ? T.green : T.brick} /></div>))}</div>
        <div className="card" style={{ padding: 20 }}><h3 style={{ marginBottom: 12 }}>حسب نوع السؤال</h3>
          {Object.entries(byType).map(([k, v]) => (<div key={k} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span>{QTYPE[k]}</span><span className="mono">{v.c}/{v.t}</span></div>
            <Bar pct={v.c / v.t * 100} tone={v.c / v.t >= .7 ? T.green : T.gold} /></div>))}</div>
      </div>
      <div className="card" style={{ padding: 22, marginTop: 18 }}><h3 style={{ marginBottom: 12 }}>مراجعة الإجابات</h3>
        {attempt.detail.map((d, i) => (<div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${T.ruleSoft}` }}>
          <div style={{ fontWeight: 600 }}>{i + 1}. {d.q} <Chip>{QTYPE[d.type]}</Chip></div>
          <div style={{ fontSize: 14, color: d.ok ? T.green : T.brick }}>{d.ok ? "إجابتك صحيحة" : `إجابتك: ${d.picked} — الصواب: ${d.correct}`}</div>
          <div style={{ fontSize: 14, color: T.inkSoft }}>{d.e}</div></div>))}
        <button className="btn btn-o" style={{ marginTop: 16 }} onClick={onBack}>عودة إلى الكورس</button></div>
    </div>
  );
}
function Certificate({ attempt, course, user, onBack }) {
  return (
    <div className="wrap" style={{ paddingBottom: 60, maxWidth: 720 }}>
      <div className="card" style={{ padding: 40, textAlign: "center", border: `2px solid ${T.gold}`, background: "#FFFDF8" }}>
        <img src={LOGO_URL} alt="GEMS Founders School" style={{ height: 44, margin: "0 auto 14px", display: "block" }} />
        <h1>شهادة إتقان</h1><div style={{ width: 60, height: 2, background: T.gold, margin: "16px auto" }} />
        <p style={{ margin: 0, color: T.inkSoft }}>تشهد إدارة قسم اللغة العربية بأن الطالب</p>
        <h2 style={{ margin: "10px 0", fontSize: 28 }}>{user.name}</h2>
        <p style={{ margin: 0, color: T.inkSoft }}>قد أتقن مهارة</p>
        <h3 style={{ margin: "8px 0 18px", fontSize: 22, color: T.green }}>{course.title}</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: 34, flexWrap: "wrap", marginBottom: 22 }}>
          {[["الدرجة", `${attempt.pct}%`], ["الصف", `${user.grade} — ${user.block}`], ["التاريخ", dateAr(attempt.at)]].map(([l, v]) => (
            <div key={l}><div style={{ fontSize: 12, color: T.inkSoft }}>{l}</div><div style={{ fontWeight: 700 }}>{v}</div></div>))}</div>
        <div style={{ borderTop: `1px solid ${T.rule}`, paddingTop: 16, fontSize: 12, color: T.inkSoft }}>
          <div>رقم الشهادة <span className="mono">{attempt.serial}</span></div><div>رمز التحقق <span className="mono">{attempt.token}</span></div></div>
      </div>
      <div className="card noprint" style={{ padding: 16, marginTop: 16, background: T.greenSoft, borderColor: T.green }}>
        <h4 style={{ marginBottom: 6 }}>✅ تم إصدار الشهادة</h4>
        <p style={{ fontSize: 13, color: T.inkSoft, margin: 0 }}>ترسل المنصة الشهادة تلقائيًا إلى بريد الطالب وبريد ولي الأمر المسجلين فور اجتياز الكورس، دون تدخل من المعلم.</p>
      </div>
      <div className="noprint" style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button className="btn btn-g" onClick={() => window.print()}>اطبع أو احفظ PDF</button><button className="btn btn-q" onClick={onBack}>عودة</button></div>
    </div>
  );
}

/* ============================ منشئ الكورس اليدوي ============================ */
const STAGE_TEMPLATES = {
  rule: { t: "rule", title: "القاعدة", strat: "العرض المباشر", body: "", note: "" },
  worked: { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة", intro: "اضغط المثال لترى التحليل.", items: [] },
  problem: { t: "problem", title: "حلّ مشكلة", strat: "التعلّم القائم على المشكلات", body: "", steps: [] },
  video: { t: "video", title: "فيديو", strat: "التعلّم المدمج", intro: "", clips: [] },
  summary: { t: "summary", title: "الخلاصة", strat: "بطاقة الخروج", body: "", bullets: [], note: "" },
};
function CourseBuilder({ teacherName, initial, onSave, onCancel }) {
  const [c, setC] = useState(() => initial || {
    id: "c-" + uid(), title: "", objective: "", domain: "SP", grade: 7, stream: "A",
    blocks: ["A"], students: [], status: "draft", q: 25, teacher: teacherName,
    stages: [{ ...STAGE_TEMPLATES.rule }, { ...STAGE_TEMPLATES.summary }], bank: [], resources: [],
  });
  const set = (k, v) => setC({ ...c, [k]: v });
  const setStage = (i, patch) => { const st = [...c.stages]; st[i] = { ...st[i], ...patch }; set("stages", st); };
  const addStage = (kind) => set("stages", [...c.stages.slice(0, -1), { ...STAGE_TEMPLATES[kind], title: STAGE_TEMPLATES[kind].title + ` ${c.stages.length}` }, c.stages[c.stages.length - 1]]);
  const removeStage = (i) => set("stages", c.stages.filter((_, k) => k !== i));

  const [q, setQ] = useState({ t: "mcq", sn: "", q: "", o: ["", "", "", ""], a: 0, e: "", words: ["", "", ""], fixv: "", av: "" });
  const addQuestion = () => {
    if (!q.q.trim()) return;
    let item;
    if (q.t === "mcq") item = { t: "mcq", sn: q.sn || c.title, q: q.q, o: q.o, a: q.a, e: q.e };
    else if (q.t === "tf") item = { t: "tf", sn: q.sn || c.title, q: q.q, a: !!q.a, e: q.e };
    else if (q.t === "fill") item = { t: "fill", sn: q.sn || c.title, q: q.q, a: [q.av], e: q.e };
    else if (q.t === "err") item = { t: "err", sn: q.sn || c.title, q: q.q, words: q.words, a: q.a, fix: q.fixv, e: q.e };
    else if (q.t === "match") item = { t: "match", sn: q.sn || c.title, q: q.q, pairs: q.words.filter(Boolean).map((w) => w.split("=>").map((x) => x.trim())).filter((p) => p.length === 2), e: q.e };
    set("bank", [...c.bank, item]);
    setQ({ t: "mcq", sn: "", q: "", o: ["", "", "", ""], a: 0, e: "", words: ["", "", ""], fixv: "", av: "" });
  };
  const removeQuestion = (i) => set("bank", c.bank.filter((_, k) => k !== i));

  const valid = c.title.trim() && c.objective.trim() && c.bank.length >= 25;

  return (
    <div className="wrap" style={{ paddingBottom: 60, maxWidth: 900 }}>
      <div className="card" style={{ padding: 22 }}>
        <h2>{initial ? "تعديل الكورس" : "إنشاء كورس جديد"}</h2>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
          <div style={{ gridColumn: "1/-1" }}><label className="lbl">عنوان الكورس</label><input className="inp" value={c.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div style={{ gridColumn: "1/-1" }}><label className="lbl">الهدف التعليمي</label><input className="inp" value={c.objective} onChange={(e) => set("objective", e.target.value)} /></div>
          <div><label className="lbl">المجال</label><select className="inp" value={c.domain} onChange={(e) => set("domain", e.target.value)}>{Object.entries(DOMAINS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="lbl">الصف</label><select className="inp" value={c.grade} onChange={(e) => set("grade", +e.target.value)}>{Array.from({ length: 13 }, (_, i) => i + 1).map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
          <div><label className="lbl">المسار</label><select className="inp" value={c.stream} onChange={(e) => set("stream", e.target.value)}><option value="A">عربي أ</option><option value="B">عربي ب</option></select></div>
          <div><label className="lbl">عدد أسئلة الاختبار</label><input className="inp mono" value="25 — سياسة القسم الثابتة" disabled /></div>
          <div style={{ gridColumn: "1/-1" }}><label className="lbl">البلوكات المستهدفة (يُتجاهل إذا خُصّص لطلاب أفراد أدناه)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{DEFAULT_BLOCKS.map((b) => (
              <button key={b} className="btn" onClick={() => set("blocks", c.blocks.includes(b) ? c.blocks.filter((x) => x !== b) : [...c.blocks, b])}
                style={{ background: c.blocks.includes(b) ? T.green : "transparent", color: c.blocks.includes(b) ? "#fff" : T.inkSoft, border: `1px solid ${T.rule}` }}>{b}</button>))}</div></div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3>وحدات الشرح ({c.stages.length})</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.keys(STAGE_TEMPLATES).map((k) => <button key={k} className="btn btn-q" style={{ background: T.paper }} onClick={() => addStage(k)}>+ {STAGE_TEMPLATES[k].title}</button>)}
          </div>
        </div>
        {c.stages.map((s, i) => (
          <details key={i} className="card" style={{ padding: 0, marginBottom: 10, borderColor: T.ruleSoft }}>
            <summary style={{ cursor: "pointer", padding: "10px 14px", fontWeight: 600 }}>{i + 1}. {s.title} <Chip>{s.t}</Chip></summary>
            <div style={{ padding: "0 14px 14px" }}>
              <label className="lbl">عنوان الوحدة</label><input className="inp" value={s.title} onChange={(e) => setStage(i, { title: e.target.value })} />
              {["rule", "problem", "summary"].includes(s.t) && <>
                <label className="lbl" style={{ marginTop: 10 }}>النص</label>
                <textarea className="tarea" rows={3} value={s.body || ""} onChange={(e) => setStage(i, { body: e.target.value })} /></>}
              <label className="lbl" style={{ marginTop: 10 }}>رابط فيديو مضمَّن (اختياري — من YouTube embed)</label>
              <input className="inp" value={s.videoUrl || ""} onChange={(e) => setStage(i, { videoUrl: e.target.value })} placeholder="https://www.youtube.com/embed/xxxxxxxx" />
              <label className="lbl" style={{ marginTop: 10 }}>رابط ملف مرفق (اختياري — PDF أو عرض تقديمي)</label>
              <input className="inp" value={s.fileUrl || ""} onChange={(e) => setStage(i, { fileUrl: e.target.value })} placeholder="https://…" />
              <button className="btn btn-q" style={{ color: T.brick, marginTop: 10 }} onClick={() => removeStage(i)}>حذف هذه الوحدة</button>
            </div>
          </details>
        ))}
      </div>

      <div className="card" style={{ padding: 22, marginTop: 16 }}>
        <h3 style={{ marginBottom: 4 }}>بنك أسئلة الاختبار ({c.bank.length} / 25 مطلوبة)</h3>
        <div style={{ marginBottom: 10 }}><Bar pct={Math.min(100, c.bank.length / 25 * 100)} tone={c.bank.length >= 25 ? T.green : T.gold} /></div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div><label className="lbl">نوع السؤال</label>
            <select className="inp" value={q.t} onChange={(e) => setQ({ ...q, t: e.target.value })}>{Object.entries(QTYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="lbl">المهارة الفرعية</label><input className="inp" value={q.sn} onChange={(e) => setQ({ ...q, sn: e.target.value })} /></div>
          <div style={{ gridColumn: "1/-1" }}><label className="lbl">نص السؤال</label><input className="inp" value={q.q} onChange={(e) => setQ({ ...q, q: e.target.value })} /></div>
          {q.t === "mcq" && <>
            {[0, 1, 2, 3].map((i) => (<div key={i}><label className="lbl">خيار {i + 1}</label><input className="inp" value={q.o[i]} onChange={(e) => { const o = [...q.o]; o[i] = e.target.value; setQ({ ...q, o }); }} /></div>))}
            <div><label className="lbl">رقم الخيار الصحيح (0-3)</label><input className="inp" type="number" min={0} max={3} value={q.a} onChange={(e) => setQ({ ...q, a: +e.target.value })} /></div>
          </>}
          {q.t === "tf" && <div><label className="lbl">الإجابة</label><select className="inp" value={q.a ? "1" : "0"} onChange={(e) => setQ({ ...q, a: e.target.value === "1" })}><option value="1">صواب</option><option value="0">خطأ</option></select></div>}
          {q.t === "fill" && <div style={{ gridColumn: "1/-1" }}><label className="lbl">الإجابة الصحيحة</label><input className="inp" value={q.av} onChange={(e) => setQ({ ...q, av: e.target.value })} /></div>}
          {q.t === "err" && <>
            {[0, 1, 2].map((i) => (<div key={i}><label className="lbl">كلمة {i + 1}</label><input className="inp" value={q.words[i]} onChange={(e) => { const w = [...q.words]; w[i] = e.target.value; setQ({ ...q, words: w }); }} /></div>))}
            <div><label className="lbl">رقم الكلمة الخاطئة (0-2)</label><input className="inp" type="number" min={0} max={2} value={q.a} onChange={(e) => setQ({ ...q, a: +e.target.value })} /></div>
            <div><label className="lbl">التصويب</label><input className="inp" value={q.fixv} onChange={(e) => setQ({ ...q, fixv: e.target.value })} /></div>
          </>}
          {q.t === "match" && <div style={{ gridColumn: "1/-1" }}><label className="lbl">أزواج المطابقة — سطر لكل زوج بصيغة: طرف أول {"=>"} طرف ثانٍ</label>
            <textarea className="tarea" rows={3} value={q.words.join("\n")} onChange={(e) => setQ({ ...q, words: e.target.value.split("\n") })} /></div>}
          <div style={{ gridColumn: "1/-1" }}><label className="lbl">تفسير الإجابة</label><input className="inp" value={q.e} onChange={(e) => setQ({ ...q, e: e.target.value })} /></div>
        </div>
        <button className="btn btn-o" style={{ marginTop: 10 }} onClick={addQuestion}>أضف السؤال إلى البنك</button>
        {c.bank.map((b, i) => (<div key={i} style={{ padding: "8px 0", borderTop: `1px solid ${T.ruleSoft}`, display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 13 }}>{i + 1}. {b.q} <Chip>{QTYPE[b.t]}</Chip></div>
          <button className="btn btn-q" style={{ color: T.brick }} onClick={() => removeQuestion(i)}>حذف</button></div>))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button className="btn btn-p" disabled={!valid} onClick={() => onSave(c)}>{valid ? "حفظ الكورس كمسودة" : `أكمل العنوان والهدف و٢٥ سؤالًا على الأقل (${c.bank.length}/25 حاليًا)`}</button>
        <button className="btn btn-q" onClick={onCancel}>إلغاء</button>
      </div>
    </div>
  );
}

/* ==================== مولّد الذكاء الاصطناعي ==================== */
function parseJSON(txt) {
  let s = (txt || "").replace(/```json|```/g, "").trim();
  const i = s.indexOf("{"), j = s.lastIndexOf("}");
  if (i >= 0 && j > i) s = s.slice(i, j + 1);
  try { return JSON.parse(s); } catch { }
  const k = s.lastIndexOf("},");
  if (k > 0) { try { return JSON.parse(s.slice(0, k + 1) + "]}"); } catch { } }
  return null;
}
const PROVIDERS = {
  gemini: { endpoint: "/api/generate-gemini", label: "Gemini", env: "GEMINI_API_KEY" },
  claude: { endpoint: "/api/generate", label: "Claude", env: "ANTHROPIC_API_KEY" },
  openai: { endpoint: "/api/generate-openai", label: "ChatGPT", env: "OPENAI_API_KEY" },
};
const PROVIDER_ORDER = ["gemini", "claude", "openai"];

async function callProvider(prompt, provider, image = null) {
  const cfg = PROVIDERS[provider];
  if (!cfg) return { ok: false, provider, error: "مزود غير معروف" };
  try {
    const body = { prompt };
    if (image) { body.imageBase64 = image.base64; body.imageMediaType = image.mediaType; }
    const r = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let d = {};
    try { d = await r.json(); } catch { d = {}; }
    if (!r.ok || d.error) {
      const msg = typeof d.error === "string"
        ? d.error
        : (d.error?.message || d.message || `HTTP ${r.status}`);
      return { ok: false, provider, error: msg };
    }
    return { ok: true, provider, text: d.text || "" };
  } catch (e) {
    return { ok: false, provider, error: String(e) };
  }
}

async function ask(prompt, provider = "auto", image = null) {
  const order = provider === "auto" ? PROVIDER_ORDER : [provider, ...PROVIDER_ORDER.filter((p) => p !== provider)];
  for (const p of order) {
    const r = await callProvider(prompt, p, image);
    if (!r.ok) continue;
    const parsed = parseJSON(r.text || "");
    if (parsed) return parsed;
  }
  return null;
}

async function askText(prompt, provider = "auto") {
  const order = provider === "auto" ? PROVIDER_ORDER : [provider, ...PROVIDER_ORDER.filter((p) => p !== provider)];
  for (const p of order) {
    const r = await callProvider(prompt, p);
    if (r.ok && r.text) return r.text;
  }
  return null;
}

function providerHelpText(provider = "auto") {
  if (provider === "auto") return "لم يعمل أي مزوّد. أضف مفتاحًا واحدًا على الأقل في Vercel: GEMINI_API_KEY أو ANTHROPIC_API_KEY أو OPENAI_API_KEY.";
  const cfg = PROVIDERS[provider];
  return cfg ? `تعذّر الاتصال بـ ${cfg.label}. تحقّق من المتغير ${cfg.env} في Vercel، وستحاول المنصة المزوّدات الأخرى تلقائيًا.` : "تعذّر الاتصال بمزوّد الذكاء الاصطناعي.";
}
// مساعد تحليل بالذكاء الاصطناعي — يُرسل ملخّصًا رقميًّا مجمَّعًا فقط (لا إجابات
// الطلاب الخام ولا بيانات اتصال) إلى المزوّد المختار.
function AIAnalytics({ rows, gaps }) {
  const [provider, setProvider] = useState("claude");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const [err, setErr] = useState("");
  const run = async () => {
    if (!q.trim()) return;
    setBusy(true); setAnswer(""); setErr("");
    const summary = {
      students: rows.filter((r) => r.avg !== null).map((r) => ({ name: r.name, grade: r.grade, block: r.block, average_pct: r.avg, attempts: r.tries, assigned_courses: r.assigned })),
      weakest_skills_overall: gaps.slice(0, 10),
    };
    const prompt = `أنت محلّل بيانات تعليمية لقسم اللغة العربية. لديك ملخّص أداء مجمَّع بصيغة JSON (لا تكشف أي بيانات لم تُذكر فيه):\n${JSON.stringify(summary)}\n\nأجب بإيجاز ووضوح بالعربية الفصحى، معتمدًا فقط على هذه البيانات، على سؤال المعلم التالي. إن لم تكفِ البيانات للإجابة فقل ذلك صراحة:\n"${q}"`;
    const out = await askText(prompt, provider);
    setBusy(false);
    if (out === null) return setErr(`تعذّر الاتصال بمزوّد ${PROVIDERS[provider].label}. تحقّق أن مفتاحه مضبوط في إعدادات الخادم.`);
    setAnswer(out);
  };
  return (
    <div className="card" style={{ padding: 16, background: T.paper }}>
      <h4 style={{ marginBottom: 8 }}>تحليل بالذكاء الاصطناعي</h4>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>{Object.entries(PROVIDERS).map(([k, v]) => (
        <button key={k} className="btn" onClick={() => setProvider(k)}
          style={{ background: provider === k ? T.green : "transparent", color: provider === k ? "#fff" : T.inkSoft, border: `1px solid ${T.rule}` }}>{v.label}</button>))}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input className="inp" style={{ flex: 1, minWidth: 220 }} value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="مثال: من الطلاب الثلاثة الأكثر تعثّرًا، ولماذا في تقديرك؟" onKeyDown={(e) => e.key === "Enter" && run()} />
        <button className="btn btn-p" disabled={busy} onClick={run}>{busy ? "جارٍ التحليل…" : "اسأل"}</button>
      </div>
      {err && <div style={{ color: T.brick, fontSize: 13, marginTop: 8 }}>{err}</div>}
      {answer && <div className="card" style={{ padding: 14, marginTop: 10, background: "#fff", whiteSpace: "pre-line", fontSize: 14 }}>{answer}</div>}
      <p style={{ fontSize: 11, color: T.inkSoft, marginTop: 8, marginBottom: 0 }}>يُرسَل ملخّص أرقام مجمَّع فقط (لا أسماء أولياء أمور ولا إجابات فردية) إلى مزوّد الذكاء الاصطناعي المختار.</p>
    </div>
  );
}
function Generator({ teacherName, onSave, onCancel }) {
  const [f, setF] = useState({ skill: "", domain: "SP", grade: 7, stream: "A", blocks: ["A"] });
  const [busy, setBusy] = useState(false); const [note, setNote] = useState(""); const [draft, setDraft] = useState(null);
  const [vid, setVid] = useState({ url: "", label: "" });
  const [provider, setProvider] = useState("auto");

  const gen = async () => {
    if (!f.skill.trim()) return setNote("اكتب المهارة المستهدفة أولًا.");
    setBusy(true); setNote("جارٍ التوليد… سبعة طلبات متوازية."); setDraft(null); setVid({ url: "", label: "" });
    const head = `مهارة "${f.skill}" — ${DOMAINS[f.domain]} — الصف ${f.grade} — ${f.stream === "A" ? "الناطقون بالعربية" : "غير الناطقين بها"}. أعد JSON فقط بلا نص خارجه. عربية فصيحة موجزة.`;
    const P = [
      `${head} {"title":"عنوان قصير","objective":"هدف في سطر","rule":"القاعدة في ٤ إلى ٦ جمل مفصَّلة","concepts":[{"label":"مصطلح قصير","note":"إيضاح قصير جدًّا"}],"videoQuery":"عبارة بحث يوتيوب مناسبة للقاعدة بالعربية الفصحى","summary":"سطر","bullets":["","","",""]} — اجعل concepts من ثلاثة إلى أربعة عناصر تمثّل خطوات أو حالات القاعدة، ووسّع شرح rule بحيث يغطي التعريف والسبب والاستثناء إن وُجد.`,
      `${head} {"examples":[{"w":"مثال","steps":["","","",""]}]} — أربعة أمثلة، كل مثال بأربع خطوات تحليل مفصَّلة لا ثلاث.`,
      `${head} {"table":{"head":["عمود1","عمود2","عمود3"],"rows":[["","",""]]},"checks":[{"t":"mcq","q":"سؤال استنتاجي من الجدول","o":["أ","ب","ج","د"],"a":0,"e":"تفسير قصير"},{"t":"mcq","q":"سؤال استنتاجي ثانٍ","o":["أ","ب","ج","د"],"a":0,"e":""}]} — جدول من 5 صفوف يقود الطالب لاستنتاج القاعدة قبل أن تُشرح له، وسؤالَي استنتاج بعده.`,
      `${head} {"cats":["فئة1","فئة2"],"items":[["كلمة أو جملة","فئة1"]]} — نشاط فرز بطاقات من 10 عناصر موزعة على فئتين أو ثلاث مشتقة من القاعدة نفسها.`,
      `${head} {"bank":[{"t":"mcq","sn":"مهارة فرعية","q":"سؤال","o":["أ","ب","ج","د"],"a":0,"e":"تفسير قصير","img":"كلمة قصيرة فقط إن كان عرضها بخط كبير يفيد فهم السؤال، وإلا اتركه فارغًا"}]} — 14 سؤالًا متنوعة لا تتكرر فيها الصياغة، أضف img لأربعة منها فقط حيث يفيد ذلك بصريًا.`,
      `${head} {"bank":[{"t":"tf","sn":"","q":"عبارة","a":true,"e":""}]} — 8 أسئلة صواب وخطأ.`,
      `${head} {"bank":[{"t":"fill","sn":"","q":"سؤال","a":["الإجابة"],"e":""},{"t":"err","sn":"","q":"حدّد الكلمة الخاطئة","words":["ك١","ك٢","ك٣"],"a":1,"fix":"الصواب","e":""}]} — 6 fill و6 err.`,
    ];
    const res = await Promise.allSettled(P.map((prompt) => ask(prompt, provider)));
    const g = (i) => (res[i].status === "fulfilled" && res[i].value) || null;
    const a = g(0) || {}, ex = g(1) || {}, disc = g(2) || {}, sortD = g(3) || {};
    const rawBank = [4, 5, 6].flatMap((i) => ((g(i) || {}).bank || [])).filter((x) => x && x.t && x.q && QTYPE[x.t]);
    const bank = dedupeBank(rawBank);
    if (bank.length < 8) { setNote(`تعذّر التوليد. ${providerHelpText(provider)}`); setBusy(false); return; }
    const stages = [];
    if (disc.table && disc.table.rows && disc.table.rows.length)
      stages.push({ t: "discover", title: "استقرئ ثم استنتج", strat: "التعلّم بالاكتشاف",
        intro: "اقرأ الجدول ولاحظ العلاقة بين أعمدته، ثم استنتج القاعدة بنفسك.", table: disc.table, checks: disc.checks || [],
        reveal: a.rule || "" });
    stages.push({ t: "rule", title: "القاعدة", strat: "العرض المباشر", body: a.rule || "", concepts: a.concepts || [], note: "" });
    stages.push({ t: "video", title: "شاهد ثم أجب", strat: "التعلّم المدمج",
      intro: "شاهد الفيديو الذي يرفقه معلمك، ثم أجب.", clips: [], videoQuery: a.videoQuery || f.skill });
    stages.push({ t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة", intro: "اضغط المثال لترى التحليل.", items: ex.examples || [] });
    if (sortD.items && sortD.items.length)
      stages.push({ t: "sort", title: "فرز البطاقات", strat: "التصنيف النشط", intro: "وزّع العناصر على فئاتها.", cats: sortD.cats || [], items: sortD.items });
    stages.push({ t: "summary", title: "الخلاصة", strat: "بطاقة الخروج", body: a.summary || "", bullets: a.bullets || [], note: "الاختبار 25 سؤالًا متنوعًا وتتغيّر أسئلته في كل محاولة." });
    setDraft({
      id: "c-" + uid(), title: a.title || f.skill, objective: a.objective || "", domain: f.domain, grade: f.grade,
      stream: f.stream, blocks: f.blocks, students: [], status: "draft", q: 25, teacher: teacherName,
      resources: [], stages, bank,
    });
    setNote(bank.length >= 25
      ? `تم توليد ${bank.length} سؤالًا صالحًا (فوق حدّ الـ25) و${stages.length} وحدات. أضف رابط الفيديو أدناه، ثم راجع الكل قبل الحفظ.`
      : `تم توليد ${bank.length} سؤالًا صالحًا فقط — أقل من 25 المطلوبة (سياسة القسم). اضغط «أكمل الأسئلة الناقصة» أدناه.`);
    setBusy(false);
  };

  const topUp = async () => {
    if (!draft) return;
    const need = 25 - draft.bank.length;
    if (need <= 0) return;
    setBusy(true); setNote(`جارٍ توليد ${need} سؤالًا إضافيًا…`);
    const head2 = `مهارة "${f.skill}" — ${DOMAINS[f.domain]} — الصف ${f.grade} — ${f.stream === "A" ? "الناطقون بالعربية" : "غير الناطقين بها"}. أعد JSON فقط بلا نص خارجه.`;
    const res = await ask(`${head2} {"bank":[{"t":"mcq","sn":"","q":"سؤال","o":["أ","ب","ج","د"],"a":0,"e":""}]} — ${need} سؤالًا اختيار من متعدد، بصياغة مختلفة تمامًا عن أي أسئلة سابقة عن هذه المهارة.`, provider);
    const merged = dedupeBank([...draft.bank, ...((res && res.bank) || [])]);
    setDraft({ ...draft, bank: merged });
    setNote(merged.length >= 25 ? `اكتمل البنك: ${merged.length} سؤالًا. راجعها قبل الحفظ.` : `لا يزال البنك ${merged.length} فقط. أعد الضغط أو أضف أسئلة يدويًا من زر «تعديل» بعد الحفظ.`);
    setBusy(false);
  };

  const attachVideo = () => {
    const m = vid.url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
    const id = m ? m[1] : vid.url.trim();
    if (!id) return;
    const stages = draft.stages.map((s) => s.t === "video" ? { ...s, clips: [{ id, start: 0, label: vid.label || draft.title }] } : s);
    setDraft({ ...draft, stages });
  };

  return (
    <div className="wrap" style={{ paddingBottom: 60, maxWidth: 820 }}>
      <div className="card" style={{ padding: 22 }}>
        <h2>توليد كورس بالذكاء الاصطناعي</h2>
        <p style={{ color: T.inkSoft, fontSize: 13 }}>سبعة طلبات متوازية تُنتج كورسًا بنفس آلية المنصة: استقراء واستنتاج، شرح القاعدة، أمثلة محلَّلة، أنشطة، ثم بنك اختبار موحّد. الناتج مسودة دائمًا وتحتاج مراجعتك واعتمادك قبل النشر.</p>
        <div className="card" style={{ padding: 12, margin: "12px 0", background: T.paper }}>
          <label className="lbl">مزوّد الذكاء الاصطناعي</label>
          <select className="inp" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="auto">تلقائي — Gemini ثم Claude ثم ChatGPT</option>
            {Object.entries(PROVIDERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <p style={{ fontSize: 11, color: T.inkSoft, margin: "6px 0 0" }}>
            إذا تعذّر المزوّد المختار، تحاول المنصة المزوّدات الأخرى تلقائيًا. يلزم وجود مفتاح API واحد صالح على الأقل في Vercel.
          </p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 10 }}>
          <div style={{ gridColumn: "1/-1" }}><label className="lbl">المهارة أو القاعدة</label><input className="inp" value={f.skill} onChange={(e) => setF({ ...f, skill: e.target.value })} placeholder="التمييز الملحوظ والملفوظ" /></div>
          <div><label className="lbl">المجال</label><select className="inp" value={f.domain} onChange={(e) => setF({ ...f, domain: e.target.value })}>{Object.entries(DOMAINS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="lbl">الصف</label><select className="inp" value={f.grade} onChange={(e) => setF({ ...f, grade: +e.target.value })}>{Array.from({ length: 13 }, (_, i) => i + 1).map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
          <div><label className="lbl">المسار</label><select className="inp" value={f.stream} onChange={(e) => setF({ ...f, stream: e.target.value })}><option value="A">عربي أ</option><option value="B">عربي ب</option></select></div>
          <div style={{ gridColumn: "1/-1" }}><label className="lbl">البلوكات</label><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{DEFAULT_BLOCKS.map((b) => (
            <button key={b} className="btn" onClick={() => setF({ ...f, blocks: f.blocks.includes(b) ? f.blocks.filter((x) => x !== b) : [...f.blocks, b] })}
              style={{ background: f.blocks.includes(b) ? T.green : "transparent", color: f.blocks.includes(b) ? "#fff" : T.inkSoft, border: `1px solid ${T.rule}` }}>{b}</button>))}</div></div>
        </div>
        {note && <div style={{ marginTop: 12, color: draft ? T.green : busy ? T.inkSoft : T.gold, fontWeight: 600 }}>{note}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}><button className="btn btn-p" disabled={busy} onClick={gen}>{busy ? "جارٍ التوليد…" : "ولّد الكورس"}</button><button className="btn btn-q" onClick={onCancel}>عودة</button></div>
      </div>

      {draft && (<div className="card" style={{ padding: 22, marginTop: 16, borderColor: T.gold }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}><h3>{draft.title}</h3><Chip tone="a">مسودة — {draft.bank.length} سؤالًا</Chip></div>
        <p style={{ color: T.inkSoft }}>{draft.objective}</p>

        {draft.stages.find((s) => s.t === "video") && (
          <div className="card" style={{ padding: 16, background: T.paper, marginBottom: 14 }}>
            <h4 style={{ marginBottom: 8 }}>أضف الفيديو التعليمي لهذه الوحدة</h4>
            <p style={{ fontSize: 13, color: T.inkSoft, marginTop: 0 }}>
              اقترح الذكاء الاصطناعي عبارة بحث: «{draft.stages.find((s) => s.t === "video").videoQuery}». {" "}
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(draft.stages.find((s) => s.t === "video").videoQuery)}`} target="_blank" rel="noreferrer" style={{ color: T.green, fontWeight: 700 }}>ابحث في يوتيوب</a>{" "}
              ثم الصق رابط الفيديو الذي اخترته هنا.
            </p>
            <div className="grid" style={{ gridTemplateColumns: "2fr 1fr auto" }}>
              <input className="inp" value={vid.url} onChange={(e) => setVid({ ...vid, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=xxxxxxxx" />
              <input className="inp" value={vid.label} onChange={(e) => setVid({ ...vid, label: e.target.value })} placeholder="عنوان مختصر للمقطع" />
              <button className="btn btn-o" onClick={attachVideo}>إرفاق</button>
            </div>
            {draft.stages.find((s) => s.t === "video").clips.length > 0 && <div style={{ color: T.green, fontWeight: 600, marginTop: 8, fontSize: 13 }}>تم إرفاق الفيديو. راجعه في معاينة الوحدة أدناه.</div>}
            <p style={{ fontSize: 12, color: T.inkSoft, marginBottom: 0 }}>يمكنك تخطي هذه الخطوة والإرفاق لاحقًا من زر «تعديل» في قائمة الكورسات — لكن الكورس يبقى مسودة حتى تراجعه بأي حال.</p>
          </div>
        )}

        {draft.stages.map((s, i) => (<details key={i} style={{ borderTop: `1px solid ${T.ruleSoft}`, padding: "8px 0" }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>{s.title}</summary><div style={{ marginTop: 8 }}><StageBody s={s} /></div></details>))}
        <h3 style={{ marginTop: 14, marginBottom: 4 }}>الأسئلة ({draft.bank.length} / 25 مطلوبة)</h3>
        <div style={{ marginBottom: 10 }}><Bar pct={Math.min(100, draft.bank.length / 25 * 100)} tone={draft.bank.length >= 25 ? T.green : T.gold} /></div>
        {draft.bank.length < 25 && <button className="btn btn-o" disabled={busy} style={{ marginBottom: 12 }} onClick={topUp}>{busy ? "جارٍ التوليد…" : `أكمل الأسئلة الناقصة (${25 - draft.bank.length})`}</button>}
        {draft.bank.map((b, i) => (<div key={i} style={{ padding: "8px 0", borderTop: `1px solid ${T.ruleSoft}`, fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{i + 1}. {b.q} <Chip>{QTYPE[b.t]}</Chip>{b.img && <Chip tone="a">مصحوب بصورة</Chip>}</div>
          {b.img && <WordCard text={b.img} tone={T.gold} />}
          <div style={{ color: T.green }}>الصواب: {correctText(b)}</div><div style={{ color: T.inkSoft }}>{b.e}</div></div>))}
        <button className="btn btn-p" style={{ marginTop: 16 }} disabled={draft.bank.length < 25} onClick={() => onSave(draft)}>
          {draft.bank.length >= 25 ? "احفظ مسودةً" : `أكمل 25 سؤالًا أولًا (${draft.bank.length}/25)`}
        </button>
      </div>)}
    </div>
  );
}

// الصق وأعد التنظيم: المعلم يولّد المحتوى على أي منصة ذكاء اصطناعي خارجية
// (ChatGPT، Gemini، أو غيرها) بنفسه، ثم يلصقه هنا كنص خام — والمنصة تعيد
// هيكلته إلى وحدات شرح وبنك أسئلة بصيغة العرض القياسية نفسها التي يراها
// الطالب في كل كورس آخر. هذا مسار بديل كامل عن زر التوليد الداخلي، فلا
// يتعطّل عمل المعلم أبدًا مهما حدث لمفاتيح API الداخلية.

function cleanExternalLine(line = "") {
  return String(line).replace(/^\s*(?:[-*•#]+|\d+[\).\-\s]+)\s*/, "").trim();
}

function parseExternalBank(raw = "") {
  const lines = String(raw).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const out = [];
  const optRe = /^(?:[أابتثجحخدABCD]|[1-4])[\)\.\-:]\s*(.+)$/i;
  const ansRe = /^(?:الإجابة(?:\s+الصحيحة)?|الجواب|الصواب)\s*[:：\-]\s*(.+)$/i;
  const tfRe = /^(?:الإجابة(?:\s+الصحيحة)?|الجواب|الصواب)\s*[:：\-]\s*(صح|صواب|خطأ|خطا|true|false)$/i;

  for (let i = 0; i < lines.length; i++) {
    const rawQ = lines[i];
    const qLine = cleanExternalLine(rawQ);
    const looksQ = /[؟?]$/.test(qLine) || /^(?:سؤال|اختر|حدّد|حدد|أكمل|صح أم خطأ|صواب أم خطأ)/.test(qLine);
    if (!looksQ) continue;

    const options = [];
    let answer = "";
    let j = i + 1;
    for (; j < Math.min(lines.length, i + 8); j++) {
      const om = lines[j].match(optRe);
      if (om) { options.push(cleanExternalLine(om[1])); continue; }
      const am = lines[j].match(ansRe);
      if (am) { answer = cleanExternalLine(am[1]); break; }
      if (/[؟?]$/.test(cleanExternalLine(lines[j])) && options.length === 0) break;
    }

    if (options.length >= 2 && answer) {
      let idx = options.findIndex((o) => norm(o) === norm(answer));
      if (idx < 0 && /^[أابتثجحخدABCD1-4]$/i.test(answer)) {
        const letters = ["أ", "ب", "ج", "د"];
        idx = letters.indexOf(answer);
        if (idx < 0 && /^[1-4]$/.test(answer)) idx = +answer - 1;
      }
      if (idx >= 0 && idx < options.length) {
        out.push({ t: "mcq", sn: "", q: qLine, o: options.slice(0, 4), a: idx, e: "من محتوى الكورس الملصوق." });
        i = j;
        continue;
      }
    }

    const tf = lines.slice(i + 1, Math.min(lines.length, i + 5)).map((x) => x.match(tfRe)).find(Boolean);
    if (tf) {
      const val = /^(صح|صواب|true)$/i.test(tf[1]);
      out.push({ t: "tf", sn: "", q: qLine, a: val, e: "من محتوى الكورس الملصوق." });
      continue;
    }

    if (answer && options.length === 0) {
      out.push({ t: "fill", sn: "", q: qLine, a: [answer], e: "من محتوى الكورس الملصوق." });
    }
  }
  return dedupeBank(out);
}

function buildLocalExternalDraft(raw, f, teacherName) {
  const parsed = parseJSON(raw);
  if (parsed && (parsed.bank || parsed.stages)) {
    const bank = dedupeBank((parsed.bank || []).filter((x) => x && x.t && x.q && QTYPE[x.t]));
    const stages = Array.isArray(parsed.stages) && parsed.stages.length ? parsed.stages : [
      { t: "rule", title: "الشرح والقاعدة", strat: "العرض المباشر", body: parsed.rule || parsed.explanation || "", concepts: parsed.concepts || [], note: "" },
      { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة", intro: "راجع الأمثلة ثم انتقل للتطبيق.", items: parsed.examples || [] },
      { t: "summary", title: "الخلاصة", strat: "بطاقة الخروج", body: parsed.summary || "", bullets: parsed.bullets || [], note: "الاختبار يعمل بآلية المنصة نفسها." },
    ];
    return {
      id: "c-" + uid(), title: parsed.title || "كورس مُعاد تنظيمه", objective: parsed.objective || "",
      domain: f.domain, grade: f.grade, stream: f.stream, blocks: f.blocks, students: [], status: "draft",
      q: 25, teacher: teacherName, resources: [], stages, bank,
    };
  }

  const lines = String(raw).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const plain = lines.map(cleanExternalLine).filter(Boolean);
  const firstUseful = plain.find((x) => x.length >= 3 && x.length <= 100) || "كورس مُعاد تنظيمه";
  const objectiveLine = plain.find((x) => /^(?:الهدف|هدف التعلم|نواتج التعلم|الناتج)/.test(x));
  const objective = objectiveLine ? objectiveLine.replace(/^[^:：\-]*[:：\-]?\s*/, "") : `إتقان محتوى «${firstUseful}» وتطبيقه بصورة صحيحة.`;

  const qStart = lines.findIndex((x) => /^(?:#+\s*)?(?:الأسئلة|الاختبار|التقييم|أسئلة)/.test(cleanExternalLine(x)));
  const explanationLines = (qStart > 0 ? lines.slice(0, qStart) : lines).filter((x) => !/^(?:الهدف|هدف التعلم|نواتج التعلم)/.test(cleanExternalLine(x)));
  const rule = explanationLines.map(cleanExternalLine).slice(1).join("\n").slice(0, 3500) || plain.slice(1, 15).join("\n");

  const examples = plain.filter((x) => /^(?:مثال|مثال\s*\d|مثال:)/.test(x)).slice(0, 5)
    .map((x) => ({ w: x.replace(/^مثال(?:\s*\d+)?\s*[:：\-]?\s*/, "") || x, steps: ["اقرأ المثال.", "حدّد موضع المهارة.", "طبّق القاعدة.", "تحقّق من الصواب."] }));

  const summaryLine = plain.find((x) => /^(?:الخلاصة|ملخص|ملخّص)/.test(x));
  const summary = summaryLine ? summaryLine.replace(/^[^:：\-]*[:：\-]?\s*/, "") : "راجع القاعدة والأمثلة ثم طبّقها في الاختبار.";
  const bank = parseExternalBank(raw);

  return {
    id: "c-" + uid(), title: firstUseful.replace(/^(?:عنوان|الكورس|المهارة)\s*[:：\-]?\s*/, ""), objective,
    domain: f.domain, grade: f.grade, stream: f.stream, blocks: f.blocks, students: [], status: "draft",
    q: 25, teacher: teacherName, resources: [],
    stages: [
      { t: "rule", title: "الشرح والقاعدة", strat: "العرض المباشر", body: rule, concepts: [], note: "" },
      ...(examples.length ? [{ t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة", intro: "راجع الأمثلة ثم انتقل للتطبيق.", items: examples }] : []),
      { t: "summary", title: "الخلاصة", strat: "بطاقة الخروج", body: summary, bullets: [], note: "الاختبار يعمل بآلية المنصة نفسها: 25 سؤالًا ودرجة النجاح والمحاولات وفق إعدادات الصف." },
    ],
    bank,
  };
}

// مسار اللصق لا يعتمد على مفتاح API: يبني الكورس محليًا أولًا، ثم يستخدم
// الذكاء الاصطناعي — إن كان متاحًا — لتحسين الشرح وإكمال بنك الاختبار.
function PasteReorganizer({ teacherName, onSave, onCancel }) {
  const [f, setF] = useState({ domain: "SP", grade: 7, stream: "A", blocks: ["A"] });
  const [raw, setRaw] = useState("");
  const [provider, setProvider] = useState("auto");
  const [busy, setBusy] = useState(false); const [note, setNote] = useState(""); const [draft, setDraft] = useState(null);

  const reorganize = async () => {
    if (raw.trim().length < 80) return setNote("الصق محتوى الكورس كاملًا: الشرح والأمثلة والأسئلة إن وُجدت.");
    setBusy(true); setDraft(null);

    const local = buildLocalExternalDraft(raw, f, teacherName);
    setDraft(local);
    setNote(`تم ترتيب المحتوى محليًا فورًا. تم التعرّف على ${local.bank.length} سؤالًا. جارٍ محاولة تحسينه وإكمال بنك الاختبار بالذكاء الاصطناعي إن كان متاحًا…`);

    const ctx = `الصف ${f.grade} — ${DOMAINS[f.domain]} — ${f.stream === "A" ? "الناطقون بالعربية" : "غير الناطقين بها"}.
أعد تنظيم النص التالي في بنية تعليمية، مع الحفاظ على معناه، وبصيغة JSON فقط بلا أي نص خارج JSON.
يجب أن يكون الشرح واضحًا ومناسبًا للصف، وأن يتكوّن بنك الاختبار من 25 سؤالًا على الأقل، متنوعًا بين mcq وtf وfill وerr.
--- بداية النص ---
${raw.slice(0, 12000)}
--- نهاية النص ---`;

    const P = [
      `${ctx}\nأعد: {"title":"عنوان","objective":"هدف","rule":"شرح منظم مفصل","concepts":[{"label":"مفهوم","note":"توضيح"}],"summary":"خلاصة","bullets":["نقطة"]}`,
      `${ctx}\nأعد: {"examples":[{"w":"مثال","steps":["تحليل1","تحليل2","تحليل3","تحليل4"]}]} — من 4 إلى 6 أمثلة.`,
      `${ctx}\nأعد: {"bank":[{"t":"mcq","sn":"مهارة فرعية","q":"سؤال","o":["أ","ب","ج","د"],"a":0,"e":"سبب الإجابة"},{"t":"tf","sn":"","q":"عبارة","a":true,"e":""},{"t":"fill","sn":"","q":"أكمل","a":["الإجابة"],"e":""},{"t":"err","sn":"","q":"حدّد الخطأ","words":["ك1","ك2","ك3"],"a":1,"fix":"الصواب","e":""}]} — 30 سؤالًا على الأقل دون تكرار.`,
    ];

    const res = await Promise.allSettled(P.map((prompt) => ask(prompt, provider)));
    const g = (i) => (res[i].status === "fulfilled" && res[i].value) || null;
    const a = g(0), ex = g(1), qb = g(2);

    if (a || ex || qb) {
      const bank = dedupeBank([...(local.bank || []), ...((qb && qb.bank) || [])]);
      const stages = [
        { t: "rule", title: "الشرح والقاعدة", strat: "العرض المباشر", body: (a && a.rule) || local.stages.find((s) => s.t === "rule")?.body || "", concepts: (a && a.concepts) || [], note: "" },
        { t: "worked", title: "أمثلة محلَّلة", strat: "النمذجة المتدرّجة", intro: "راجع الأمثلة ثم انتقل للتطبيق.", items: (ex && ex.examples) || local.stages.find((s) => s.t === "worked")?.items || [] },
        { t: "summary", title: "الخلاصة", strat: "بطاقة الخروج", body: (a && a.summary) || local.stages.find((s) => s.t === "summary")?.body || "", bullets: (a && a.bullets) || [], note: "الاختبار يعمل بآلية المنصة نفسها: 25 سؤالًا، نجاح ومحاولات وشهادة عند الاجتياز." },
      ];
      const enhanced = { ...local, title: (a && a.title) || local.title, objective: (a && a.objective) || local.objective, stages, bank };
      setDraft(enhanced);
      setNote(bank.length >= 25
        ? `تمت إعادة التنظيم بنجاح: ${stages.length} وحدات و${bank.length} سؤالًا. الكورس الآن يعمل بنفس آليات كورسات المنصة.`
        : `تم تحسين الكورس، لكن البنك يحتوي ${bank.length} سؤالًا فقط. اضغط «أكمل الأسئلة» أو ألصق أسئلة أكثر.`);
    } else {
      setNote(local.bank.length >= 25
        ? `لم يتصل أي مزوّد AI، لكن المنصة أعادت ترتيب النص محليًا واستخرجت ${local.bank.length} سؤالًا، ويمكن حفظ الكورس الآن.`
        : `تم ترتيب النص محليًا دون API، لكن تم التعرّف على ${local.bank.length} سؤالًا فقط. ${providerHelpText(provider)}`);
    }
    setBusy(false);
  };

  const topUp = async () => {
    if (!draft) return;
    const need = Math.max(0, 25 - draft.bank.length);
    if (!need) return;
    setBusy(true); setNote(`جارٍ إكمال ${need} سؤالًا…`);
    const prompt = `اعتمادًا على هذا الشرح فقط:\n${draft.stages.find((s) => s.t === "rule")?.body || raw.slice(0, 5000)}
\nأنشئ JSON فقط: {"bank":[{"t":"mcq","sn":"","q":"سؤال","o":["أ","ب","ج","د"],"a":0,"e":"تفسير"}]}.
أنشئ ${Math.max(need + 5, 12)} سؤالًا جديدًا متنوعًا، ولا تكرر الأسئلة الموجودة.`;
    const r = await ask(prompt, provider);
    const bank = dedupeBank([...(draft.bank || []), ...((r && r.bank) || [])]);
    setDraft({ ...draft, bank });
    setNote(bank.length >= 25 ? `اكتمل بنك الاختبار: ${bank.length} سؤالًا.` : `أصبح البنك ${bank.length} سؤالًا. ${providerHelpText(provider)}`);
    setBusy(false);
  };

  return (
    <div className="wrap" style={{ paddingBottom: 60, maxWidth: 860 }}>
      <div className="card" style={{ padding: 22 }}>
        <h2>الصق كورسًا من أي منصة ذكاء اصطناعي</h2>
        <p style={{ color: T.inkSoft, fontSize: 13 }}>
          الصق الكورس كما خرج من ChatGPT أو Gemini أو Claude: شرح، أمثلة وأسئلة. المنصة تعيد ترتيبه إلى نفس بنية كورساتها،
          وتستخرج الأسئلة محليًا أولًا؛ لذلك لا يتوقف هذا المسار إذا تعطل مفتاح الذكاء الاصطناعي الداخلي.
        </p>

        <div className="card" style={{ padding: 12, background: T.paper, marginBottom: 12 }}>
          <label className="lbl">التحسين بالذكاء الاصطناعي (اختياري)</label>
          <select className="inp" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="auto">تلقائي — Gemini ثم Claude ثم ChatGPT</option>
            {Object.entries(PROVIDERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 10 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="lbl">النص الملصوق</label>
            <textarea className="tarea" rows={12} value={raw} onChange={(e) => setRaw(e.target.value)}
              placeholder="الصق هنا الكورس كاملًا: العنوان، الهدف، الشرح، الأمثلة، ثم أسئلة الاختبار مع الإجابات الصحيحة…" />
          </div>
          <div><label className="lbl">المجال</label><select className="inp" value={f.domain} onChange={(e) => setF({ ...f, domain: e.target.value })}>{Object.entries(DOMAINS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="lbl">الصف</label><select className="inp" value={f.grade} onChange={(e) => setF({ ...f, grade: +e.target.value })}>{Array.from({ length: 13 }, (_, i) => i + 1).map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
          <div><label className="lbl">المسار</label><select className="inp" value={f.stream} onChange={(e) => setF({ ...f, stream: e.target.value })}><option value="A">عربي أ</option><option value="B">عربي ب</option></select></div>
          <div style={{ gridColumn: "1/-1" }}><label className="lbl">البلوكات</label><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{DEFAULT_BLOCKS.map((b) => (
            <button key={b} type="button" className="btn" onClick={() => setF({ ...f, blocks: f.blocks.includes(b) ? f.blocks.filter((x) => x !== b) : [...f.blocks, b] })}
              style={{ background: f.blocks.includes(b) ? T.green : "transparent", color: f.blocks.includes(b) ? "#fff" : T.inkSoft, border: `1px solid ${T.rule}` }}>{b}</button>))}</div></div>
        </div>
        {note && <div style={{ marginTop: 12, color: draft ? T.green : busy ? T.inkSoft : T.gold, fontWeight: 600 }}>{note}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn btn-p" disabled={busy} onClick={reorganize}>{busy ? "جارٍ إعادة التنظيم…" : "أعد التنظيم للمنصة"}</button>
          <button className="btn btn-q" onClick={onCancel}>عودة</button>
        </div>
      </div>

      {draft && (<div className="card" style={{ padding: 22, marginTop: 16, borderColor: T.gold }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <h3>{draft.title}</h3><Chip tone="a">مسودة — {draft.bank.length} سؤالًا</Chip>
        </div>
        <p style={{ color: T.inkSoft }}>{draft.objective}</p>
        {draft.stages.map((s, i) => (<details key={i} style={{ borderTop: `1px solid ${T.ruleSoft}`, padding: "8px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>{s.title}</summary><div style={{ marginTop: 8 }}><StageBody s={s} /></div>
        </details>))}
        <h3 style={{ marginTop: 14 }}>نموذج الامتحان ({draft.bank.length}/25)</h3>
        <div style={{ marginBottom: 10 }}><Bar pct={Math.min(100, draft.bank.length / 25 * 100)} tone={draft.bank.length >= 25 ? T.green : T.gold} /></div>
        {draft.bank.slice(0, 30).map((b, i) => (<div key={i} style={{ padding: "8px 0", borderTop: `1px solid ${T.ruleSoft}`, fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{i + 1}. {b.q} <Chip>{QTYPE[b.t]}</Chip></div>
          <div style={{ color: T.green }}>الصواب: {correctText(b)}</div><div style={{ color: T.inkSoft }}>{b.e}</div>
        </div>))}
        {draft.bank.length < 25 && <button className="btn btn-o" disabled={busy} onClick={topUp} style={{ marginTop: 12 }}>
          {busy ? "جارٍ الإكمال…" : `أكمل الأسئلة (${25 - draft.bank.length})`}
        </button>}
        <button className="btn btn-p" style={{ marginTop: 16, marginInlineStart: 8 }} disabled={draft.bank.length < 25} onClick={() => onSave(draft)}>
          {draft.bank.length >= 25 ? "احفظ مسودةً" : `أكمل 25 سؤالًا أولًا (${draft.bank.length}/25)`}
        </button>
      </div>)}
    </div>
  );
}

function AssignPanel({ course, students, onSave, onClose }) {
  const [mode, setMode] = useState((course.students || []).length ? "students" : "blocks");
  const [blocks, setBlocks] = useState(course.blocks || []);
  const [picked, setPicked] = useState(course.students || []);
  const pool = students.filter((s) => s.grade === course.grade && s.stream === course.stream);
  return (
    <div className="card" style={{ padding: 18, marginTop: 10, background: T.paper }}>
      <h4 style={{ marginBottom: 10 }}>تخصيص «{course.title}»</h4>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="btn" style={{ background: mode === "blocks" ? T.green : "#fff", color: mode === "blocks" ? "#fff" : T.inkSoft }} onClick={() => setMode("blocks")}>حسب البلوك</button>
        <button className="btn" style={{ background: mode === "students" ? T.green : "#fff", color: mode === "students" ? "#fff" : T.inkSoft }} onClick={() => setMode("students")}>طلاب أفراد</button>
      </div>
      {mode === "blocks" ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DEFAULT_BLOCKS.map((b) => (<button key={b} className="btn" onClick={() => setBlocks(blocks.includes(b) ? blocks.filter((x) => x !== b) : [...blocks, b])}
            style={{ background: blocks.includes(b) ? T.green : "#fff", color: blocks.includes(b) ? "#fff" : T.inkSoft, border: `1px solid ${T.rule}` }}>{b}</button>))}
        </div>
      ) : (
        <div style={{ maxHeight: 220, overflowY: "auto" }}>
          {pool.length === 0 ? <p style={{ color: T.inkSoft, fontSize: 13 }}>لا طلاب مسجَّلون بعد في الصف {course.grade} لهذا المسار.</p> :
            pool.map((s) => (<label key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 }}>
              <input type="checkbox" checked={picked.includes(s.key)} onChange={() => setPicked(picked.includes(s.key) ? picked.filter((x) => x !== s.key) : [...picked, s.key])} />
              {s.name} — {s.block}</label>))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn btn-p" onClick={() => onSave(mode === "blocks" ? { blocks, students: [] } : { blocks: [], students: picked })}>حفظ التخصيص</button>
        <button className="btn btn-q" onClick={onClose}>إلغاء</button>
      </div>
    </div>
  );
}

// جدولة الكورس: موعد نهائي، وكورس سابق يجب إتمامه أولًا — كلاهما يحدّده
// المعلم بنفسه، ويُقفل الكورس التالي على الطالب حتى يستوفي الشرط.
function SchedulePanel({ course, otherCourses, onSave, onClose }) {
  const [dueDate, setDueDate] = useState(course.dueDate || "");
  const [prereqId, setPrereqId] = useState(course.prereqId || "");
  return (
    <div className="card" style={{ padding: 18, marginTop: 10, background: T.paper }}>
      <h4 style={{ marginBottom: 10 }}>جدولة «{course.title}»</h4>
      {course.publishedAt && <p style={{ fontSize: 12, color: T.inkSoft, marginTop: 0 }}>تاريخ النشر: {dateAr(course.publishedAt)} (يُسجَّل تلقائيًا ولا يُعدَّل)</p>}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div><label className="lbl">الموعد النهائي لإتمام هذا الكورس (اختياري)</label>
          <input className="inp" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
        <div><label className="lbl">يتطلب إتمام كورس سابق أولًا (اختياري)</label>
          <select className="inp" value={prereqId} onChange={(e) => setPrereqId(e.target.value)}>
            <option value="">بلا اشتراط</option>
            {otherCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select></div>
      </div>
      <p style={{ fontSize: 12, color: T.inkSoft, marginTop: 8 }}>إن اشترطت كورسًا سابقًا، لن يستطيع الطالب فتح هذا الكورس إطلاقًا حتى ينجح في الكورس المُشترَط.</p>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn btn-p" onClick={() => onSave({ dueDate: dueDate || null, prereqId: prereqId || null })}>حفظ الجدولة</button>
        <button className="btn btn-q" onClick={onClose}>إلغاء</button>
      </div>
    </div>
  );
}

// نشر إلزامي: لا يصبح الكورس مرئيًّا لأي طالب إلا بعد أن يحدّد المعلم صراحة
// الصفَّ المستهدَف، والبلوك أو الطلاب، والموعد النهائي — الثلاثة معًا شرط
// لتفعيل زر النشر، لا خطوات لاحقة اختيارية.
function PublishPanel({ course, students, onClose, onPublish }) {
  const [grade, setGrade] = useState(course.grade);
  const [mode, setMode] = useState((course.students || []).length ? "students" : "blocks");
  const [blocks, setBlocks] = useState(course.blocks || []);
  const [picked, setPicked] = useState(course.students || []);
  const [dueDate, setDueDate] = useState(course.dueDate || "");
  const pool = students.filter((s) => s.grade === grade && s.stream === course.stream);
  const hasAudience = mode === "blocks" ? blocks.length > 0 : picked.length > 0;
  const ready = !!grade && hasAudience && !!dueDate;
  return (
    <div className="card" style={{ padding: 18, marginTop: 10, background: T.paper, border: `1px solid ${T.gold}` }}>
      <h4 style={{ marginBottom: 4 }}>نشر «{course.title}»</h4>
      <p style={{ fontSize: 12, color: T.inkSoft, marginTop: 0, marginBottom: 12 }}>
        لن يظهر هذا الكورس لأي طالب حتى تحدّد الحقول الثلاثة أدناه كاملة.
      </p>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div><label className="lbl">الصف المستهدَف</label>
          <select className="inp" value={grade} onChange={(e) => { setGrade(+e.target.value); setBlocks([]); setPicked([]); }}>
            {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => <option key={g} value={g}>{g}</option>)}
          </select></div>
        <div><label className="lbl">الموعد النهائي (إلزامي)</label>
          <input className="inp" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
      </div>
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <button className="btn" style={{ background: mode === "blocks" ? T.green : "#fff", color: mode === "blocks" ? "#fff" : T.inkSoft }} onClick={() => setMode("blocks")}>حسب البلوك</button>
        <button className="btn" style={{ background: mode === "students" ? T.green : "#fff", color: mode === "students" ? "#fff" : T.inkSoft }} onClick={() => setMode("students")}>طلاب أفراد</button>
      </div>
      {mode === "blocks" ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DEFAULT_BLOCKS.map((b) => (<button key={b} className="btn" onClick={() => setBlocks(blocks.includes(b) ? blocks.filter((x) => x !== b) : [...blocks, b])}
            style={{ background: blocks.includes(b) ? T.green : "#fff", color: blocks.includes(b) ? "#fff" : T.inkSoft, border: `1px solid ${T.rule}` }}>{b}</button>))}
        </div>
      ) : (
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          {pool.length === 0 ? <p style={{ color: T.inkSoft, fontSize: 13 }}>لا طلاب مسجَّلون بعد في الصف {grade} لهذا المسار.</p> :
            pool.map((s) => (<label key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 }}>
              <input type="checkbox" checked={picked.includes(s.key)} onChange={() => setPicked(picked.includes(s.key) ? picked.filter((x) => x !== s.key) : [...picked, s.key])} />
              {s.name} — {s.block}</label>))}
        </div>
      )}
      {!ready && <p style={{ fontSize: 12, color: T.brick, marginTop: 10 }}>
        أكمل: {!grade && "الصف، "}{!hasAudience && "البلوك أو الطلاب، "}{!dueDate && "الموعد النهائي"}
      </p>}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn btn-p" disabled={!ready} onClick={() => onPublish({
          status: "published", grade,
          blocks: mode === "blocks" ? blocks : [],
          students: mode === "students" ? picked : [],
          dueDate,
        })}>{ready ? "انشر الآن" : "أكمل الحقول أولًا"}</button>
        <button className="btn btn-q" onClick={onClose}>إلغاء</button>
      </div>
    </div>
  );
}

/* ==================== إرسال تقرير لولي الأمر ==================== */
function buildReport(student, courses, progress, attempts) {
  const mine = courses.filter((c) => c.status === "published" && c.grade === student.grade && c.stream === student.stream);
  const rows = mine.map((c) => {
    const assigned = assignedTo(c, student);
    const p = progress[pKey(student.key, c.id)] || { done: [] };
    const at = attempts.filter((a) => a.student === student.key && a.course === c.id);
    const passed = at.find((a) => a.passed);
    const started = p.done.length > 0;
    const skillMap = skillMastery(at);
    const latest = [...at].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))[0] || null;
    const latestPassed = [...at].filter((a) => a.passed).sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))[0] || null;
    return { id: c.id, title: c.title, teacher: c.teacher || "", assigned, started, completed: !!passed, pct: c.stages?.length ? p.done.length / c.stages.length * 100 : 0,
      bestScore: at.length ? Math.max(...at.map((a) => a.pct)) : null, attempts: at.length, lastAt: latest?.at || null,
      history: [...at].sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0)).map((a) => ({ at: a.at, pct: a.pct, passed: !!a.passed })),
      certificateToken: latestPassed?.token || null, certificateSerial: latestPassed?.serial || null,
      weak: skillMap.filter(([, r]) => r < .6).map(([k]) => k),
      strong: skillMap.filter(([, r]) => r >= .8).map(([k]) => k) };
  }).filter((r) => r.assigned);
  return rows;
}
function skillMastery(at) {
  const m = {};
  at.forEach((a) => a.detail.forEach((d) => { m[d.sn] = m[d.sn] || { c: 0, t: 0 }; m[d.sn].t++; if (d.ok) m[d.sn].c++; }));
  return Object.entries(m).map(([k, v]) => [k, v.c / v.t]);
}
function SendReportModal({ student, courses, progress, attempts, onSend, onClose }) {
  const rows = buildReport(student, courses, progress, attempts);
  const [email, setEmail] = useState(student.parentEmail || "");
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");
  const send = () => {
    const to = normEmail(email);
    if (!to) return setErr("بريد ولي الأمر غير مسجل. أضفه أولًا إلى بيانات الطالب.");
    setErr("");
    const token = "PR-" + uid().toUpperCase();
    onSend(token, { email: to, rows });
    setDone(token);
  };
  return (
    <div className="card" style={{ padding: 20, marginTop: 10, background: T.paper }}>
      <h4>تقرير {student.name}</h4>
      <table className="tbl" style={{ marginTop: 10 }}><thead><tr><th>الكورس</th><th>الإنجاز</th><th>أفضل نتيجة</th><th>المحاولات</th><th>نقاط القوة</th><th>تحتاج دعمًا</th></tr></thead>
        <tbody>{rows.map((r) => (<tr key={r.title}><td>{r.title}</td><td>{Math.round(r.pct)}%</td>
          <td className="mono">{r.bestScore === null ? "—" : r.bestScore + "%"}</td><td>{r.attempts}</td>
          <td style={{ fontSize: 12, color: T.green }}>{r.strong.join("، ") || "—"}</td>
          <td style={{ fontSize: 12, color: T.brick }}>{r.weak.join("، ") || "لا يوجد"}</td></tr>))}</tbody></table>
      <div style={{ marginTop: 14 }}>
        <label className="lbl">بريد ولي الأمر</label>
        <input className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@example.com" />
      </div>
      {!done ? <button className="btn btn-p" style={{ marginTop: 12 }} onClick={send}>أرسل رابط التقرير إلى ولي الأمر</button>
        : <div className="card" style={{ padding: 14, marginTop: 12, background: T.greenSoft, borderColor: T.green }}>
            <div style={{ fontWeight: 700 }}>✅ تم إنشاء رابط التقرير وإرساله إلى بريد ولي الأمر.</div>
            <div className="mono" style={{ fontSize: 12, marginTop: 5 }}>{done}</div>
          </div>}
      {err && <div style={{ color: T.brick, marginTop: 8, fontSize: 13 }}>{err}</div>}
      <button className="btn btn-q" style={{ marginTop: 10 }} onClick={onClose}>إغلاق</button>
    </div>
  );
}

/* ==================== لوحة المعلم التحليلية التفاعلية ==================== */
function TeacherDashboard({ students, courses, attempts, progress, onNavigate }) {
  const [grade, setGrade] = useState("ALL");
  const [block, setBlock] = useState("ALL");
  const [courseId, setCourseId] = useState("ALL");
  const [days, setDays] = useState(30);
  const [masteryFocus, setMasteryFocus] = useState(null);

  const grades = Array.from(new Set([
    ...students.map((s) => String(s.grade || "")).filter(Boolean),
    ...courses.map((c) => String(c.grade || "")).filter(Boolean),
  ])).sort((a, b) => Number(a) - Number(b));
  const blocks = Array.from(new Set(students.map((s) => String(s.block || "")).filter(Boolean))).sort();

  const scopedStudents = students.filter((s) => {
    if (grade !== "ALL" && String(s.grade) !== grade) return false;
    if (block !== "ALL" && String(s.block) !== block) return false;
    if (courseId !== "ALL") {
      const c = courses.find((x) => x.id === courseId);
      if (!c || !assignedTo(c, s)) return false;
    }
    return true;
  });
  const studentKeys = new Set(scopedStudents.map((s) => s.key));
  const scopedCourses = courses.filter((c) => {
    if (courseId !== "ALL" && c.id !== courseId) return false;
    if (grade !== "ALL" && String(c.grade) !== grade) return false;
    return true;
  });
  const courseIds = new Set(scopedCourses.map((c) => c.id));
  const cutoff = new Date(Date.now() - days * 86400000);
  const scopedAttempts = attempts.filter((a) => studentKeys.has(a.student) && courseIds.has(a.course));
  const periodAttempts = scopedAttempts.filter((a) => !a.at || new Date(a.at) >= cutoff);

  const studentRows = scopedStudents.map((s) => {
    const assignedCourses = scopedCourses.filter((c) => c.status === "published" && assignedTo(c, s));
    const assignedIds = new Set(assignedCourses.map((c) => c.id));
    const allAt = scopedAttempts.filter((a) => a.student === s.key && assignedIds.has(a.course));
    const recentAt = periodAttempts.filter((a) => a.student === s.key && assignedIds.has(a.course));
    const started = assignedCourses.some((c) => {
      const p = progress[pKey(s.key, c.id)] || { done: [] };
      return (p.done || []).length > 0 || allAt.some((a) => a.course === c.id);
    });
    const completed = assignedCourses.some((c) => allAt.some((a) => a.course === c.id && a.passed));
    const avg = recentAt.length ? Math.round(recentAt.reduce((sum, a) => sum + Number(a.pct || 0), 0) / recentAt.length)
      : allAt.length ? Math.round(allAt.reduce((sum, a) => sum + Number(a.pct || 0), 0) / allAt.length) : null;
    const exhausted = assignedCourses.some((c) => {
      const p = progress[pKey(s.key, c.id)] || { cycle: 1 };
      const cycle = p.cycle || 1;
      const tries = allAt.filter((a) => a.course === c.id && a.cycle === cycle).length;
      return tries >= (c.tries || phaseFor(c.grade).tries) && !allAt.some((a) => a.course === c.id && a.passed);
    });
    const detail = recentAt.flatMap((a) => a.detail || []);
    const sm = {};
    detail.forEach((d) => {
      const key = d.sn || "غير مصنّف";
      sm[key] = sm[key] || { c: 0, t: 0 };
      sm[key].t += 1;
      if (d.ok) sm[key].c += 1;
    });
    const weak = Object.entries(sm).map(([k, v]) => ({ k, pct: Math.round(v.c / v.t * 100) })).sort((a, b) => a.pct - b.pct)[0];
    const intervention = exhausted || (avg !== null && avg < 60);
    return { ...s, assignedCount: assignedCourses.length, attemptsCount: recentAt.length, started, completed, avg, exhausted, intervention, weak: weak?.k || "—" };
  });

  const activeRows = studentRows.filter((r) => r.started);
  const completedRows = studentRows.filter((r) => r.completed);
  const interventionRows = studentRows.filter((r) => r.intervention).sort((a, b) => (a.avg ?? 999) - (b.avg ?? 999));
  const avgMastery = periodAttempts.length ? Math.round(periodAttempts.reduce((sum, a) => sum + Number(a.pct || 0), 0) / periodAttempts.length) : null;

  const masteryGroups = [
    { key: "mastered", label: "متقن", count: studentRows.filter((r) => r.avg !== null && r.avg >= 80).length, color: T.green },
    { key: "learning", label: "قيد التعلم", count: studentRows.filter((r) => r.avg !== null && r.avg >= 60 && r.avg < 80).length, color: T.gold },
    { key: "intervention", label: "يحتاج تدخّلًا", count: studentRows.filter((r) => r.avg !== null && r.avg < 60).length, color: T.brick },
    { key: "notStarted", label: "لم يبدأ", count: studentRows.filter((r) => !r.started).length, color: "#AAB8B6" },
  ];
  const masteryTotal = masteryGroups.reduce((s, x) => s + x.count, 0) || 1;
  let angle = 0;
  const donutStops = masteryGroups.map((g) => {
    const start = angle;
    angle += (g.count / masteryTotal) * 360;
    return `${g.color} ${start}deg ${angle}deg`;
  }).join(",");

  const skillMap = {};
  periodAttempts.forEach((a) => (a.detail || []).forEach((d) => {
    const key = d.sn || "غير مصنّف";
    skillMap[key] = skillMap[key] || { c: 0, t: 0 };
    skillMap[key].t += 1;
    if (d.ok) skillMap[key].c += 1;
  }));
  const skillGaps = Object.entries(skillMap)
    .map(([k, v]) => ({ k, pct: Math.round(v.c / v.t * 100), n: v.t }))
    .sort((a, b) => a.pct - b.pct);

  const coursePerformance = scopedCourses.map((c) => {
    const ca = periodAttempts.filter((a) => a.course === c.id);
    const assigned = scopedStudents.filter((s) => assignedTo(c, s));
    const avg = ca.length ? Math.round(ca.reduce((sum, a) => sum + Number(a.pct || 0), 0) / ca.length) : null;
    const passedKeys = new Set(ca.filter((a) => a.passed).map((a) => a.student));
    const completion = assigned.length ? Math.round(passedKeys.size / assigned.length * 100) : 0;
    return { id: c.id, title: c.title, avg, completion, attempts: ca.length, assigned: assigned.length };
  }).filter((x) => x.assigned > 0 || x.attempts > 0).sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));

  const daySeries = [];
  const seriesDays = Math.min(days, 30);
  for (let i = seriesDays - 1; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const da = periodAttempts.filter((a) => { const x = new Date(a.at); return x >= d && x < next; });
    const avg = da.length ? Math.round(da.reduce((s, a) => s + Number(a.pct || 0), 0) / da.length) : null;
    const pass = da.length ? Math.round(da.filter((a) => a.passed).length / da.length * 100) : null;
    const active = scopedStudents.length ? Math.round(new Set(da.map((a) => a.student)).size / scopedStudents.length * 100) : null;
    daySeries.push({ d, avg, pass, active });
  }
  const chartW = 680, chartH = 220, padX = 34, padY = 24;
  const xFor = (i) => padX + (daySeries.length <= 1 ? 0 : i * (chartW - padX * 2) / (daySeries.length - 1));
  const yFor = (v) => chartH - padY - (Math.max(0, Math.min(100, v)) / 100) * (chartH - padY * 2);
  const pathFor = (field) => {
    const pts = daySeries.map((p, i) => p[field] === null ? null : [xFor(i), yFor(p[field])]);
    let path = "", started = false;
    pts.forEach((p) => {
      if (!p) { started = false; return; }
      path += `${started ? " L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`;
      started = true;
    });
    return path;
  };
  const hasTrend = periodAttempts.some((a) => a.at);

  const recent = periodAttempts.slice().sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 7);
  const focusGroup = masteryFocus ? masteryGroups.find((g) => g.key === masteryFocus) : null;
  const focusStudents = !focusGroup ? [] : studentRows.filter((r) => {
    if (masteryFocus === "mastered") return r.avg !== null && r.avg >= 80;
    if (masteryFocus === "learning") return r.avg !== null && r.avg >= 60 && r.avg < 80;
    if (masteryFocus === "intervention") return r.avg !== null && r.avg < 60;
    return !r.started;
  });

  const kpi = (label, value, icon, note, tone, onClick) => (
    <button type="button" onClick={onClick} className="card" style={{ padding: 18, textAlign: "right", cursor: onClick ? "pointer" : "default", background: "#fff", borderColor: tone ? `${tone}55` : T.rule, minHeight: 128, fontFamily: "inherit" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: tone || T.inkSoft }}>{label}</span>
        <span style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: tone ? `${tone}16` : T.greenSoft, fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 31, lineHeight: 1.2, fontWeight: 800, marginTop: 8, color: T.ink }}>{value}</div>
      <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 5 }}>{note}</div>
    </button>
  );

  return <>
    <div className="card" style={{ padding: 14, marginBottom: 16, background: "#fff" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
        <div><label className="lbl">الصف</label><select className="inp" value={grade} onChange={(e) => { setGrade(e.target.value); setCourseId("ALL"); }}><option value="ALL">كل الصفوف</option>{grades.map((g) => <option key={g} value={g}>الصف {g}</option>)}</select></div>
        <div><label className="lbl">البلوك</label><select className="inp" value={block} onChange={(e) => setBlock(e.target.value)}><option value="ALL">كل البلوكات</option>{blocks.map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
        <div><label className="lbl">الكورس</label><select className="inp" value={courseId} onChange={(e) => setCourseId(e.target.value)}><option value="ALL">كل الكورسات</option>{courses.filter((c) => grade === "ALL" || String(c.grade) === grade).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
        <div><label className="lbl">الفترة التحليلية</label><select className="inp" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value={7}>آخر 7 أيام</option><option value={30}>آخر 30 يومًا</option><option value={90}>آخر 90 يومًا</option></select></div>
      </div>
    </div>

    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", marginBottom: 16 }}>
      {kpi("طلابي", studentRows.length, "🎓", "وفق الفلاتر الحالية", T.gold, () => onNavigate("s"))}
      {kpi("بدأوا التعلّم", activeRows.length, "▶", studentRows.length ? `${Math.round(activeRows.length / studentRows.length * 100)}% من الطلاب` : "لا توجد بيانات", T.green, () => onNavigate("s"))}
      {kpi("أكملوا كورسًا", completedRows.length, "✓", studentRows.length ? `${Math.round(completedRows.length / studentRows.length * 100)}% من الطلاب` : "لا توجد بيانات", T.navy, () => onNavigate("res"))}
      {kpi("يحتاجون تدخّلًا", interventionRows.length, "⚠", interventionRows.length ? "أداء أقل من 60% أو محاولات مستنفدة" : "لا توجد حالات عاجلة", T.brick, () => onNavigate("s"))}
      {kpi("متوسط الإتقان", avgMastery === null ? "—" : `${avgMastery}%`, "◎", periodAttempts.length ? `${periodAttempts.length} محاولة في الفترة` : "يظهر بعد أول اختبار", T.green, () => onNavigate("res"))}
    </div>

    <div className="grid" style={{ gridTemplateColumns: "minmax(280px,.9fr) minmax(420px,1.7fr) minmax(280px,.9fr)", marginBottom: 16 }}>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3>خريطة الضعف المهاري</h3><span style={{ fontSize: 11, color: T.inkSoft }}>من الإجابات الفعلية</span></div>
        {skillGaps.length === 0 ? <div style={{ color: T.inkSoft, padding: "34px 0", textAlign: "center" }}>ستظهر بعد أول اختبار ضمن الفترة المحددة.</div> : skillGaps.slice(0, 6).map((g) => <div key={g.k} style={{ marginBottom: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12 }}><span>{g.k}</span><span className="mono" style={{ color: g.pct < 60 ? T.brick : g.pct < 75 ? T.gold : T.green }}>{g.pct}%</span></div>
          <div className="inkbar" title={`${g.n} إجابة`}><i style={{ width: `${g.pct}%`, background: g.pct < 60 ? T.brick : g.pct < 75 ? T.gold : T.green }} /></div>
        </div>)}
        {skillGaps.length > 6 && <button className="btn btn-q" onClick={() => onNavigate("res")}>عرض التحليل الكامل ←</button>}
      </div>

      <div className="card" style={{ padding: 18, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><h3>نبض التعلّم</h3><div style={{ fontSize: 11, color: T.inkSoft }}>النشاط والنتائج والنجاح عبر الزمن</div></div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, flexWrap: "wrap" }}><span style={{ color: T.green }}>● متوسط النتائج</span><span style={{ color: T.navy }}>● نسبة النجاح</span><span style={{ color: T.gold }}>● الطلاب النشطون</span></div></div>
        {!hasTrend ? <div style={{ height: 220, display: "grid", placeItems: "center", color: T.inkSoft }}>لا توجد محاولات مؤرخة في الفترة المحددة.</div> : <div style={{ overflowX: "auto", marginTop: 8 }}>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", minWidth: 520, height: 240 }} role="img" aria-label="رسم نبض التعلم">
            {[0,25,50,75,100].map((v) => <g key={v}><line x1={padX} x2={chartW-padX} y1={yFor(v)} y2={yFor(v)} stroke={T.ruleSoft} strokeWidth="1"/><text x="4" y={yFor(v)+4} fontSize="9" fill={T.inkSoft}>{v}%</text></g>)}
            <path d={pathFor("avg")} fill="none" stroke={T.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathFor("pass")} fill="none" stroke={T.navy} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathFor("active")} fill="none" stroke={T.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {daySeries.map((p,i) => p.avg === null ? null : <circle key={i} cx={xFor(i)} cy={yFor(p.avg)} r="3" fill={T.green}><title>{p.d.toLocaleDateString("ar-AE")} — متوسط {p.avg}%</title></circle>)}
            {daySeries.filter((_,i) => i === 0 || i === daySeries.length-1 || i % Math.max(1,Math.floor(daySeries.length/4)) === 0).map((p) => { const i = daySeries.indexOf(p); return <text key={i} x={xFor(i)} y={chartH-3} textAnchor="middle" fontSize="9" fill={T.inkSoft}>{p.d.toLocaleDateString("ar-AE",{day:"numeric",month:"short"})}</text>; })}
          </svg>
        </div>}
      </div>

      <div className="card" style={{ padding: 18 }}>
        <h3>توزيع مستوى الإتقان</h3>
        <div style={{ display: "grid", placeItems: "center", padding: "16px 0 12px" }}>
          <div style={{ width: 154, height: 154, borderRadius: "50%", background: masteryTotal > 0 ? `conic-gradient(${donutStops})` : T.ruleSoft, display: "grid", placeItems: "center", boxShadow: `inset 0 0 0 1px ${T.ruleSoft}` }}>
            <div style={{ width: 92, height: 92, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1.25 }}><div><strong style={{ fontSize: 25 }}>{studentRows.length}</strong><div style={{ fontSize: 11, color: T.inkSoft }}>طالب</div></div></div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 7 }}>{masteryGroups.map((g) => <button key={g.key} className="btn btn-q" onClick={() => setMasteryFocus(masteryFocus === g.key ? null : g.key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: masteryFocus === g.key ? `${g.color}12` : "transparent", padding: "5px 7px" }}><span><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: g.color, marginLeft: 7 }}/>{g.label}</span><strong>{g.count}</strong></button>)}</div>
        {focusGroup && <div style={{ marginTop: 10, borderTop: `1px solid ${T.ruleSoft}`, paddingTop: 9, fontSize: 11 }}><strong>{focusGroup.label}:</strong> {focusStudents.slice(0,5).map((s) => s.name).join("، ") || "لا أحد"}{focusStudents.length > 5 ? ` +${focusStudents.length-5}` : ""}</div>}
      </div>
    </div>

    <div className="grid" style={{ gridTemplateColumns: "minmax(300px,.85fr) minmax(440px,1.35fr) minmax(300px,.85fr)", marginBottom: 16 }}>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3>آخر نشاط للطلاب</h3><button className="btn btn-q" onClick={() => onNavigate("res")}>كل النشاط</button></div>
        {recent.length === 0 ? <p style={{ color: T.inkSoft }}>لا نشاط في الفترة المحددة.</p> : recent.map((a) => { const s = students.find((x) => x.key === a.student); const c = courses.find((x) => x.id === a.course); return <div key={a.id} style={{ padding: "9px 0", borderBottom: `1px solid ${T.ruleSoft}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}><div><strong style={{ fontSize: 12 }}>{s?.name || a.student}</strong><div style={{ fontSize: 11, color: T.inkSoft }}>{c?.title || a.course} — {a.passed ? "اجتاز الاختبار" : "أنهى محاولة"}</div></div><div style={{ textAlign: "left" }}><span className="mono" style={{ color: a.passed ? T.green : T.brick }}>{a.pct}%</span><div style={{ fontSize: 9, color: T.inkSoft }}>{a.at ? dateAr(a.at) : ""}</div></div></div>; })}
      </div>

      <div className="card" style={{ padding: 18, overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><h3>طلاب يحتاجون تدخّلًا</h3><div style={{ fontSize: 11, color: T.inkSoft }}>يُرتّب تلقائيًا من الأكثر احتياجًا</div></div><button className="btn btn-o" onClick={() => onNavigate("s")}>عرض الطلاب</button></div>
        {interventionRows.length === 0 ? <div style={{ padding: "30px 0", textAlign: "center", color: T.green }}>لا توجد حالات تدخل وفق البيانات الحالية ✓</div> : <table className="tbl" style={{ marginTop: 10 }}><thead><tr><th>الطالب</th><th>المتوسط</th><th>المحاولات</th><th>أضعف مهارة</th><th>الحالة</th></tr></thead><tbody>{interventionRows.slice(0,6).map((r) => <tr key={r.key}><td><strong>{r.name}</strong><div style={{ fontSize: 10, color: T.inkSoft }}>صف {r.grade} · {r.block}</div></td><td className="mono" style={{ color: (r.avg ?? 0) < 60 ? T.brick : T.gold }}>{r.avg === null ? "—" : `${r.avg}%`}</td><td>{r.attemptsCount}</td><td>{r.weak}</td><td><Chip tone="r">{r.exhausted ? "محاولات مستنفدة" : "أداء منخفض"}</Chip></td></tr>)}</tbody></table>}
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3>الأداء حسب الكورس</h3><button className="btn btn-q" onClick={() => onNavigate("c")}>كل الكورسات</button></div>
        {coursePerformance.length === 0 ? <p style={{ color: T.inkSoft }}>لا توجد بيانات أداء للكورسات المحددة.</p> : coursePerformance.slice(0,6).map((c) => <div key={c.id} style={{ marginTop: 12 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 11 }}><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span><span className="mono">{c.avg === null ? "—" : `${c.avg}%`}</span></div><Bar pct={c.avg || 0} tone={c.avg === null ? T.rule : c.avg < 60 ? T.brick : c.avg < 75 ? T.gold : T.green}/><div style={{ fontSize: 9, color: T.inkSoft, marginTop: 2 }}>إكمال {c.completion}% · {c.attempts} محاولة</div></div>)}
      </div>
    </div>

    <div className="card" style={{ padding: 18, background: `linear-gradient(110deg,${T.greenSoft},#fff 55%,${T.goldSoft})`, borderColor: `${T.green}44` }}>
      <div style={{ display: "flex", gap: 16, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 480px" }}><h3>🤖 مساعد المعلم الذكي</h3><div style={{ fontSize: 13, marginTop: 5 }}>
          {interventionRows.length > 0 && skillGaps.length > 0 ? <>تُظهر بياناتك أن <strong>{interventionRows.length}</strong> طالبًا يحتاجون تدخلًا، وأضعف مهارة مشتركة هي <strong>«{skillGaps[0].k}»</strong> بنسبة إتقان <strong>{skillGaps[0].pct}%</strong>.</> :
            skillGaps.length > 0 ? <>أضعف مهارة حاليًا هي <strong>«{skillGaps[0].k}»</strong> بنسبة <strong>{skillGaps[0].pct}%</strong>. لا توجد حالات تدخل عاجلة وفق الفلاتر الحالية.</> : <>أحتاج إلى نتائج اختبارات فعلية حتى أقدّم توصية مبنية على البيانات.</>}
        </div><div style={{ fontSize: 10, color: T.inkSoft, marginTop: 4 }}>هذا الملخص مشتق مباشرة من النتائج المعروضة؛ التحليل التوليدي المتقدم متاح في تبويب المساعد الذكي.</div></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className="btn btn-o" onClick={() => onNavigate("res")}>عرض التحليل التفصيلي</button><button className="btn btn-p" onClick={() => onNavigate("ai")}>فتح المساعد الذكي</button></div>
      </div>
    </div>
  </>;
}


/* ==================== لوحة المعلم الكاملة ==================== */
function TeacherHome({ teacherName, teacherEmail, courses, attempts, progress, students, newsletters = [], onSaveNewsletter, onDeleteNewsletter, onNew, onManual, onPaste, onPublish, onView, onEdit, onAssign, onArchive, onSendReport, onExport, onImportFile, onTemplate, onAddStudent, onRemoveStudent, onEditStudent, onClearStudents, onDuplicateCourse }) {
  const [tab, setTab] = useState("d");
  const [aiProvider, setAiProvider] = useState("claude");
  const [aiBusy, setAiBusy] = useState(null);
  const [aiResult, setAiResult] = useState({});
  const [aiTargetStudent, setAiTargetStudent] = useState("");
  const fileRef = useRef(null);
  const [importMsg, setImportMsg] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", sid: "", grade: 7, block: "A", stream: "A", teacherEmail: normEmail(teacherEmail), email: "", parentEmail: "" });
  const [addErr, setAddErr] = useState("");
  const [editKey, setEditKey] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const mine = courses.filter((c) => c.teacher === teacherName);
  const mineIds = new Set(mine.map((c) => c.id));
  // الطالب يُربط بمعلمه أولًا عبر بريد المعلم المحفوظ في ملف الطلاب.
  // للبيانات القديمة التي لا تحتوي teacherEmail نحافظ على السلوك السابق
  // (الإسناد بحسب كورسات المعلم) حتى لا تختفي سجلات قائمة قبل هذا التحديث.
  const teacherEmailNorm = normEmail(teacherEmail);
  const students2 = students.filter((s) => {
    const linkedByEmail = teacherEmailNorm && normEmail(s.teacherEmail) === teacherEmailNorm;
    const legacyWithoutTeacherEmail = !normEmail(s.teacherEmail) && (s.needsReview || mine.some((c) => assignedTo(c, s)));
    return linkedByEmail || legacyWithoutTeacherEmail;
  });
  const attempts2 = attempts.filter((a) => mineIds.has(a.course));
  const rows = students2.map((s) => {
    const m2 = mine.filter((c) => assignedTo(c, s));
    const at = attempts2.filter((a) => a.student === s.key);
    const started = m2.filter((c) => (progress[pKey(s.key, c.id)] || { done: [] }).done.length > 0).length;
    const stuck = m2.some((c) => { const p = progress[pKey(s.key, c.id)] || { cycle: 1 };
      return at.filter((a) => a.course === c.id && a.cycle === (p.cycle || 1)).length >= (c.tries || phaseFor(c.grade).tries) && !at.some((a) => a.course === c.id && a.passed); });
    return { ...s, assigned: m2.length, started, passed: new Set(at.filter((a) => a.passed).map((a) => a.course)).size, stuck, tries: at.length,
      avg: at.length ? Math.round(at.reduce((x, a) => x + a.pct, 0) / at.length) : null };
  });
  const gm = {}, tm = {};
  attempts2.forEach((a) => a.detail.forEach((d) => { gm[d.sn] = gm[d.sn] || { c: 0, t: 0 }; gm[d.sn].t++; if (d.ok) gm[d.sn].c++;
    tm[d.type] = tm[d.type] || { c: 0, t: 0 }; tm[d.type].t++; if (d.ok) tm[d.type].c++; }));
  const gaps = Object.entries(gm).map(([k, v]) => ({ k, pct: Math.round(v.c / v.t * 100) })).sort((a, b) => a.pct - b.pct);
  const notStarted = rows.filter((r) => r.started === 0 && r.assigned > 0);
  const stuckList = rows.filter((r) => r.stuck);
  const [assignOpen, setAssignOpen] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(null);
  const [publishOpen, setPublishOpen] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(null);
  const [expandStudent, setExpandStudent] = useState(null);

  return (
    <div className="wrap" style={{ paddingBottom: 60 }}>
      <div className="tabs">
        {[["d", "🏠 لوحتي"], ["s", "👨‍🎓 طلابي"], ["c", "📚 كورساتي"], ["nl", "📰 النشرة الأسبوعية"], ["res", "📊 النتائج"], ["ai", "🤖 المساعد الذكي"]].map(([k, l]) => (
          <button key={k} className="tabbtn" onClick={() => setTab(k)} style={{ background: tab === k ? T.ink : T.paper, color: tab === k ? "#fff" : T.inkSoft }}>{l}</button>))}
      </div>

      {tab === "d" && <TeacherDashboard students={students2} courses={mine} attempts={attempts2} progress={progress} onNavigate={setTab} />}

      {tab === "nl" && <NewsletterEditor teacherName={teacherName} teacherEmail={teacherEmail} students={students2} newsletters={newsletters} onSave={onSaveNewsletter} onDelete={onDeleteNewsletter} />}

      {tab === "s" && (<div className="card" style={{ padding: 20, overflowX: "auto" }}>
        <h3 style={{ marginBottom: 12 }}>تحليل الطلاب وتقارير أولياء الأمور</h3>
        <Locked title="بيانات طلابك" note="أسماء ونتائج وبيانات اتصال أولياء الأمور — لا تُعرض إلا بضغطة صريحة منك.">
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-o" onClick={() => setCompareOpen(!compareOpen)}>{compareOpen ? "إخفاء المقارنة" : "مقارنة تقدّم الطلاب"}</button>
            <button className="btn btn-o" onClick={onTemplate}>تنزيل نموذج فارغ</button>
            <button className="btn btn-p" onClick={() => fileRef.current && fileRef.current.click()}>رفع قائمة الطلاب (Excel / CSV)</button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) onImportFile(f, setImportMsg); e.target.value = ""; }} />
            <button className="btn btn-o" onClick={() => { setAddOpen(!addOpen); setAddErr(""); }}>{addOpen ? "إغلاق" : "+ إضافة طالب"}</button>
            <button className="btn btn-o" onClick={onExport}>تنزيل بيانات الطلاب والنتائج (CSV)</button>
            <button className="btn btn-o" style={{ color: T.brick, borderColor: T.brick }} onClick={() => {
              if (!students.length) return;
              const typed = window.prompt(`سيُحذف كل الطلاب المسجَّلين (${students.length}) بلا رجعة — نتائجهم السابقة تبقى في السجل لكنهم لن يستطيعوا الدخول بعدها. للتأكيد، اكتب: مسح`);
              if (typed && typed.trim() === "مسح") onClearStudents();
            }}>مسح جميع الطلاب</button>
          </div>
        </div>
        {compareOpen && <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <h4 style={{ marginBottom: 10 }}>مقارنة تقدّم الطلاب</h4>
          <CompareChart rows={rows} attempts={attempts2} />
        </div>}
        {importMsg && <div className="card" style={{ padding: 10, marginBottom: 12, background: T.greenSoft, borderColor: T.green, fontSize: 13 }}>{importMsg}</div>}
        <p style={{ fontSize: 12, color: T.inkSoft, marginTop: -4, marginBottom: 12 }}>
          ابدأ بـ«تنزيل نموذج فارغ» — ملف Excel بالأعمدة الصحيحة جاهزة، فلا حاجة لتخمين ترتيبها. عبّئه واحفظه ثم ارفعه بالزر المجاور.
          يُطابق كل طالب مسجَّل هنا تلقائيًا بيانات دخوله (الاسم + آخر 6 أرقام + الصف + البلوك)، فلا حاجة لتسجيل يدوي متكرر.
        </p>
        {addOpen && (
          <div className="card" style={{ padding: 16, marginBottom: 14, background: T.paper }}>
            <h4 style={{ marginBottom: 10 }}>إضافة طالب واحد</h4>
            <div className="grid" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
              <div><label className="lbl">الاسم الثلاثي</label><input className="inp" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} /></div>
              <div><label className="lbl">الرقم التعريفي (الكامل)</label><input className="inp mono" value={addForm.sid} onChange={(e) => setAddForm({ ...addForm, sid: e.target.value.replace(/\D/g, "") })} placeholder="الرقم كما هو في سجلات المدرسة" /></div>
              <div><label className="lbl">الصف</label><select className="inp" value={addForm.grade} onChange={(e) => setAddForm({ ...addForm, grade: +e.target.value })}>{Array.from({ length: 13 }, (_, i) => i + 1).map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
              <div><label className="lbl">البلوك</label><select className="inp" value={addForm.block} onChange={(e) => setAddForm({ ...addForm, block: e.target.value })}>{DEFAULT_BLOCKS.map((b) => <option key={b}>{b}</option>)}</select></div>
              <div><label className="lbl">المسار</label><select className="inp" value={addForm.stream} onChange={(e) => setAddForm({ ...addForm, stream: e.target.value })}><option value="A">عربي أ</option><option value="B">عربي ب</option></select></div>
              <div><label className="lbl">بريد المعلم</label><input className="inp mono" type="email" value={addForm.teacherEmail || ""} onChange={(e) => setAddForm({ ...addForm, teacherEmail: e.target.value })} placeholder="teacher@school.ae" /></div>
              <div><label className="lbl">بريد الطالب</label><input className="inp mono" type="email" value={addForm.email || ""} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="student@example.com" /></div>
              <div><label className="lbl">بريد ولي الأمر</label><input className="inp mono" type="email" value={addForm.parentEmail || ""} onChange={(e) => setAddForm({ ...addForm, parentEmail: e.target.value })} placeholder="parent@example.com" /></div>
            </div>
            {addErr && <div style={{ color: T.brick, marginTop: 8, fontSize: 13 }}>{addErr}</div>}
            <button className="btn btn-p" style={{ marginTop: 10 }} onClick={() => {
              const r = onAddStudent(addForm);
              if (!r.ok) return setAddErr(r.msg);
              setAddForm({ name: "", sid: "", grade: addForm.grade, block: addForm.block, stream: addForm.stream, teacherEmail: normEmail(teacherEmail), email: "", parentEmail: "" }); setAddErr("");
            }}>حفظ الطالب</button>
          </div>
        )}
        {rows.length === 0 ? <p style={{ color: T.inkSoft }}>لم يسجّل أي طالب بعد.</p> : (
          <table className="tbl"><thead><tr><th>الطالب</th><th>الرقم التعريفي</th><th>الصف</th><th>البلوك</th><th>مسند</th><th>بدأ</th><th>أتقن</th><th>محاولات</th><th>المتوسط</th><th>الحالة</th><th></th><th></th><th></th></tr></thead>
            <tbody>{rows.map((r) => (<React.Fragment key={r.key}><tr>
              <td style={{ fontWeight: 600 }}>{r.name}{r.needsReview && <span title="بيانات ناقصة — استُورد تلقائيًا وينتظر الإكمال"><Chip tone="a">⚠ ناقص</Chip></span>}</td>
              <td className="mono">{r.schoolId || "—"}</td>
              <td>{r.grade || "؟"}</td><td>{r.block === "؟" ? "؟" : r.block}</td><td>{r.assigned}</td><td>{r.started}</td><td>{r.passed}</td><td>{r.tries}</td>
              <td className="mono">{r.avg === null ? "—" : r.avg + "%"}</td>
              <td>{r.stuck ? <Chip tone="r">تدخّل</Chip> : r.passed ? <Chip tone="g">متقدم</Chip> : r.started ? <Chip tone="a">قيد التعلّم</Chip> : <Chip>لم يبدأ</Chip>}</td>
              <td><button className="btn btn-q" onClick={() => { setExpandStudent(expandStudent === r.key ? null : r.key); setReportOpen(null); }}>{expandStudent === r.key ? "إخفاء" : "تفاصيل"}</button></td>
              <td><button className="btn btn-q" onClick={() => { setEditKey(editKey === r.key ? null : r.key);
                setEditForm({ name: r.name, sid: r.schoolId || (r.key.split("-")[2] && /^\d{6}$/.test(r.key.split("-")[2]) ? r.key.split("-")[2] : ""), grade: r.grade || 7, block: r.block === "؟" ? "A" : r.block, stream: r.stream, teacherEmail: r.teacherEmail || normEmail(teacherEmail), email: r.email || "", parentEmail: r.parentEmail || "" }); }}>
                {editKey === r.key ? "إلغاء" : "تعديل"}</button></td>
              <td><button className="btn btn-q" style={{ color: T.brick }} onClick={() => { if (window.confirm(`حذف ${r.name} من القائمة؟ نتائجه السابقة تبقى في السجل لكنه لن يستطيع الدخول بهذه البيانات بعد الآن.`)) onRemoveStudent(r.key); }}>حذف</button></td>
            </tr>
            {editKey === r.key && <tr><td colSpan={13}>
              <div className="grid" style={{ gridTemplateColumns: "repeat(5,1fr)", padding: 10, background: T.paper }}>
                <div><label className="lbl">الاسم الثلاثي</label><input className="inp" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                <div><label className="lbl">الرقم التعريفي (الكامل)</label><input className="inp mono" value={editForm.sid} onChange={(e) => setEditForm({ ...editForm, sid: e.target.value.replace(/\D/g, "") })} /></div>
                <div><label className="lbl">الصف</label><select className="inp" value={editForm.grade} onChange={(e) => setEditForm({ ...editForm, grade: +e.target.value })}>{Array.from({ length: 13 }, (_, i) => i + 1).map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
                <div><label className="lbl">البلوك</label><select className="inp" value={editForm.block} onChange={(e) => setEditForm({ ...editForm, block: e.target.value })}>{DEFAULT_BLOCKS.map((b) => <option key={b}>{b}</option>)}</select></div>
                <div><label className="lbl">المسار</label><select className="inp" value={editForm.stream} onChange={(e) => setEditForm({ ...editForm, stream: e.target.value })}><option value="A">عربي أ</option><option value="B">عربي ب</option></select></div>
                <div><label className="lbl">بريد المعلم</label><input className="inp mono" type="email" value={editForm.teacherEmail || ""} onChange={(e) => setEditForm({ ...editForm, teacherEmail: e.target.value })} /></div>
                <div><label className="lbl">بريد الطالب</label><input className="inp mono" type="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
                <div><label className="lbl">بريد ولي الأمر</label><input className="inp mono" type="email" value={editForm.parentEmail || ""} onChange={(e) => setEditForm({ ...editForm, parentEmail: e.target.value })} /></div>
                <div style={{ gridColumn: "1/-1" }}>
                  <button className="btn btn-p" onClick={() => { onEditStudent(r.key, editForm); setEditKey(null); }}>حفظ التعديلات</button>
                </div>
              </div>
            </td></tr>}
            {expandStudent === r.key && <tr><td colSpan={13}>
              <div style={{ padding: 10 }}>
                <button className="btn btn-p" onClick={() => setReportOpen(reportOpen === r.key ? null : r.key)}>{reportOpen === r.key ? "إخفاء نموذج التقرير" : "إرسال تقرير إلى ولي الأمر"}</button>
                {reportOpen === r.key && <SendReportModal student={r} courses={mine} progress={progress} attempts={attempts2}
                  onSend={(token, payload) => onSendReport(r, token, payload)} onClose={() => setReportOpen(null)} />}
              </div></td></tr>}
            </React.Fragment>))}</tbody></table>)}
        </Locked>
      </div>)}

      {tab === "c" && (<>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <h3>كورساتك</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className="btn btn-o" onClick={onManual}>إنشاء كورس يدويًا</button><button className="btn btn-o" onClick={onPaste}>الصق كورسًا من ذكاء اصطناعي خارجي</button><button className="btn btn-p" onClick={onNew}>ولّد كورسًا بالذكاء الاصطناعي</button></div>
        </div>
        <div className="grid">{mine.map((c) => {
          const bank = cleanBank(c);
          const prereq = c.prereqId ? mine.find((x) => x.id === c.prereqId) : null;
          const cStudents = students.filter((s) => assignedTo(c, s));
          const cAttempts = attempts2.filter((a) => a.course === c.id);
          const cStarted = cStudents.filter((s) => (progress[pKey(s.key, c.id)] || { done: [] }).done.length > 0);
          const cPassed = new Set(cAttempts.filter((a) => a.passed).map((a) => a.student));
          const cAvg = cAttempts.length ? Math.round(cAttempts.reduce((x, a) => x + a.pct, 0) / cAttempts.length) : null;
          const cNotStarted = cStudents.length - cStarted.length;
          const cNeedsFollowup = rows.filter((r) => r.stuck && cStudents.some((s) => s.key === r.key)).length;
          return (<div key={c.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div><h3>{c.title}</h3>
                <div style={{ fontSize: 13, color: T.inkSoft }}>{DOMAINS[c.domain]} · الصف {c.grade} · {(c.students || []).length ? `${c.students.length} طالب مخصَّص` : (c.blocks || []).join("، ") || "بلا تخصيص"} · {bank.length} سؤالًا</div>
                <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>{[...new Set(bank.map((b) => b.t))].map((t) => <Chip key={t}>{QTYPE[t]}</Chip>)}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: T.inkSoft }}>
                  {c.publishedAt && <span>نُشر في: {dateAr(c.publishedAt)}</span>}
                  {c.dueDate && <span> · الموعد النهائي: {dateAr(c.dueDate)}</span>}
                  {prereq && <span> · يتطلب إكمال «{prereq.title}» أولًا</span>}
                </div>
                {c.status === "published" && (
                  <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", marginTop: 10, gap: 8 }}>
                    <Stat label="الطلاب" value={cStudents.length} />
                    <Stat label="نسبة الإنجاز" value={cStudents.length ? Math.round((cPassed.size / cStudents.length) * 100) + "%" : "—"} />
                    <Stat label="متوسط الدرجات" value={cAvg != null ? cAvg + "%" : "—"} />
                    <Stat label="لم يبدؤوا" value={cNotStarted} tone={cNotStarted ? T.gold : T.ink} />
                    <Stat label="يحتاجون متابعة" value={cNeedsFollowup} tone={cNeedsFollowup ? T.brick : T.ink} />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                {c.status === "published" ? <Chip tone="g">منشور</Chip> : c.status === "archived" ? <Chip>مؤرشف</Chip> : <Chip tone="a">مسودة — غير مرئي لأي طالب</Chip>}
                <button className="btn btn-q" onClick={() => onView(c.id)}>عرض</button>
                <button className="btn btn-q" onClick={() => onEdit(c.id)}>تعديل</button>
                <button className="btn btn-q" onClick={() => onDuplicateCourse && onDuplicateCourse(c.id)}>نسخ</button>
                {c.status === "published" && <button className="btn btn-q" onClick={() => setAssignOpen(assignOpen === c.id ? null : c.id)}>تخصيص</button>}
                {c.status === "published" && <button className="btn btn-q" onClick={() => setScheduleOpen(scheduleOpen === c.id ? null : c.id)}>جدولة</button>}
                {c.status !== "published" && <button className="btn btn-o" onClick={() => setPublishOpen(publishOpen === c.id ? null : c.id)}>{publishOpen === c.id ? "إغلاق" : "انشر"}</button>}
                {c.status === "published" && <button className="btn btn-q" style={{ color: T.brick }} onClick={() => onArchive(c.id)}>أرشفة</button>}
                {c.status === "published" && cAttempts.length > 0 && <button className="btn btn-o" onClick={() => setTab("res")}>عرض النتائج</button>}
              </div>
            </div>
            {assignOpen === c.id && <AssignPanel course={c} students={students} onClose={() => setAssignOpen(null)} onSave={(patch) => { onAssign(c.id, patch); setAssignOpen(null); }} />}
            {scheduleOpen === c.id && <SchedulePanel course={c} otherCourses={mine.filter((x) => x.id !== c.id)} onClose={() => setScheduleOpen(null)} onSave={(patch) => { onAssign(c.id, patch); setScheduleOpen(null); }} />}
            {publishOpen === c.id && <PublishPanel course={c} students={students} onClose={() => setPublishOpen(null)} onPublish={(patch) => { onAssign(c.id, patch); setPublishOpen(null); }} />}
          </div>); })}
          {mine.length === 0 && <div className="card" style={{ padding: 24, textAlign: "center", color: T.inkSoft }}>لم تُنشئ كورسًا بعد.</div>}
        </div>
      </>)}

      {tab === "res" && (() => {
        const weeks = Array.from({ length: 6 }, (_, i) => 5 - i).map((w) => {
          const inWeek = attempts2.filter((a) => { const d = (Date.now() - new Date(a.at)) / 86400000; return d >= w * 7 && d < (w + 1) * 7; });
          return { label: `أ${6 - w}`, v: inWeek.length ? Math.round(inWeek.reduce((s, a) => s + a.pct, 0) / inWeek.length) : null };
        }).filter((p) => p.v != null);
        const buckets = [[0, 59, "أقل من 60"], [60, 69, "60-69"], [70, 79, "70-79"], [80, 89, "80-89"], [90, 100, "90-100"]];
        const dist = buckets.map(([lo, hi, l]) => ({ l, n: attempts2.filter((a) => a.pct >= lo && a.pct <= hi).length }));
        const maxDist = Math.max(1, ...dist.map((d) => d.n));
        const advanced = rows.filter((r) => r.avg != null && r.avg >= 85).sort((a, b) => b.avg - a.avg);
        const struggling = rows.filter((r) => r.stuck || (r.avg != null && r.avg < 60));

        return (
          <div style={{ display: "grid", gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 10 }}>مخطط تطور نتائج الصف — آخر 6 أسابيع فعلية</h3>
              <TrendChart points={weeks} tone={T.green} />
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 10 }}>توزيع الدرجات</h3>
                {dist.map((d) => (
                  <div key={d.l} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{d.l}</span><span className="mono">{d.n}</span></div>
                    <div style={{ height: 10, background: T.ruleSoft, borderRadius: 5, overflow: "hidden" }}><div style={{ width: `${(d.n / maxDist) * 100}%`, height: "100%", background: T.green }} /></div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 10 }}>أكثر المهارات ضعفًا</h3>
                {gaps.slice(0, 5).map((g) => <div key={g.k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.ruleSoft}`, fontSize: 13 }}><span>{g.k}</span><span className="mono" style={{ color: T.brick }}>{g.pct}%</span></div>)}
                {!gaps.length && <p style={{ color: T.inkSoft, fontSize: 13 }}>تظهر بعد أول اختبار.</p>}
              </div>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 10 }}>أكثر المهارات إتقانًا</h3>
                {gaps.slice(-5).reverse().map((g) => <div key={g.k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.ruleSoft}`, fontSize: 13 }}><span>{g.k}</span><span className="mono" style={{ color: T.green }}>{g.pct}%</span></div>)}
                {!gaps.length && <p style={{ color: T.inkSoft, fontSize: 13 }}>تظهر بعد أول اختبار.</p>}
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 10 }}>الطلاب المتقدمون (85%+)</h3>
                {advanced.length === 0 ? <p style={{ color: T.inkSoft, fontSize: 13 }}>لا أحد بعد.</p> : advanced.map((r) => <div key={r.key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.ruleSoft}`, fontSize: 13 }}><span>{r.name}</span><span className="mono" style={{ color: T.green }}>{r.avg}%</span></div>)}
              </div>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 10 }}>الطلاب المتعثرون</h3>
                {struggling.length === 0 ? <p style={{ color: T.inkSoft, fontSize: 13 }}>لا أحد حاليًّا 🎉</p> : struggling.map((r) => <div key={r.key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.ruleSoft}`, fontSize: 13 }}><span>{r.name}</span><span className="mono" style={{ color: T.brick }}>{r.avg != null ? r.avg + "%" : "لم يبدأ"}</span></div>)}
              </div>
            </div>
          </div>
        );
      })()}

      {tab === "ai" && (() => {
        const runAI = async (key, prompt) => {
          setAiBusy(key); setAiResult((p) => ({ ...p, [key]: null }));
          const out = await askText(prompt, aiProvider);
          setAiResult((p) => ({ ...p, [key]: out || "تعذّر الاتصال بمزوّد الذكاء الاصطناعي. تحقّق أن مفتاحه مضبوط في إعدادات الخادم." }));
          setAiBusy(null);
        };
        const weakest = gaps[0];
        const ACTIONS = [
          { key: "follow", label: "📋 الطلاب الذين يحتاجون متابعة", prompt: () => `أنت مساعد تربوي لمعلم لغة عربية. لديه ${stuckList.length} طالبًا استنفدوا محاولاتهم دون نجاح: ${stuckList.map((r) => r.name).join("، ") || "لا أحد"}. و${notStarted.length} لم يبدؤوا كورسًا مُسنَدًا: ${notStarted.map((r) => r.name).join("، ") || "لا أحد"}. اكتب فقرة موجزة (5 أسطر كحدّ أقصى) تُرتّب أولويات المتابعة وتقترح خطوة عملية لكل مجموعة.` },
          { key: "skills", label: "🎯 المهارات التي تحتاج إعادة شرح", prompt: () => `أنت مساعد تربوي. أضعف 5 مهارات لدى طلاب معلم اللغة العربية حسب نتائج الاختبارات الفعلية: ${gaps.slice(0, 5).map((g) => `${g.k} (${g.pct}%)`).join("، ") || "لا بيانات"}. اقترح لكل مهارة طريقة تدريس بديلة موجزة (سطر واحد لكل مهارة).` },
          { key: "lesson", label: "📖 إنشاء درس علاجي", prompt: () => `اكتب خطة درس علاجي قصيرة (10 دقائق) بالعربية الفصحى لمهارة "${weakest?.k || "الإملاء العام"}" لطلاب متعثرين فيها (نسبة إتقانهم الحالية ${weakest?.pct ?? "غير معروفة"}%). اشمل: هدف الدرس، شرحًا مبسّطًا، مثالين تطبيقيين، وسؤال تقييم واحد.` },
          { key: "homework", label: "📝 إنشاء واجب منزلي", prompt: () => `اكتب واجبًا منزليًّا قصيرًا (5 أسئلة) بالعربية الفصحى لتقوية مهارة "${weakest?.k || "الإملاء العام"}"، بمستوى صعوبة متوسط، مع الإجابات النموذجية في النهاية.` },
          { key: "parent", label: "✉️ رسالة لولي أمر", needsStudent: true, prompt: () => { const r = rows.find((x) => x.key === aiTargetStudent); if (!r) return null; return `اكتب رسالة قصيرة ومهذَّبة بالعربية الفصحى من معلم لغة عربية لولي أمر الطالب "${r.name}"، متوسط نتائجه الحالي ${r.avg != null ? r.avg + "%" : "لم يبدأ بعد"}، ${r.stuck ? "ويحتاج متابعة عاجلة لأنه استنفد محاولاته دون نجاح" : "وأداؤه ضمن المتوقَّع"}. اطلب التعاون في المتابعة المنزلية بأسلوب إيجابي وبنّاء.`; } },
          { key: "feedback", label: "💬 تغذية راجعة للطالب", needsStudent: true, prompt: () => { const r = rows.find((x) => x.key === aiTargetStudent); if (!r) return null; return `اكتب تغذية راجعة قصيرة ومشجِّعة بالعربية الفصحى موجَّهة مباشرة للطالب "${r.name}" (متوسط نتائجه ${r.avg != null ? r.avg + "%" : "لم يبدأ بعد"})، تُبرز نقطة قوة واحدة، ونقطة تحتاج تحسينًا واحدة، وخطوة عملية بسيطة يقوم بها هذا الأسبوع.`; } },
        ];
        return (
          <div>
            <div className="card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <label className="lbl" style={{ margin: 0 }}>مزوّد الذكاء الاصطناعي</label>
              <select className="inp" style={{ width: "auto" }} value={aiProvider} onChange={(e) => setAiProvider(e.target.value)}>
                {Object.entries(PROVIDERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <label className="lbl" style={{ margin: 0 }}>طالب مستهدَف (لرسالة ولي الأمر/التغذية الراجعة)</label>
              <select className="inp" style={{ width: "auto" }} value={aiTargetStudent} onChange={(e) => setAiTargetStudent(e.target.value)}>
                <option value="">— اختر طالبًا —</option>
                {rows.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {ACTIONS.map((a) => (
                <div key={a.key} className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: aiResult[a.key] ? 10 : 0 }}>
                    <strong>{a.label}</strong>
                    <button className="btn btn-p" disabled={aiBusy === a.key || (a.needsStudent && !aiTargetStudent)}
                      onClick={() => { const p = a.prompt(); if (!p) return; runAI(a.key, p); }}>
                      {aiBusy === a.key ? "جارٍ التحليل…" : "توليد"}
                    </button>
                  </div>
                  {a.needsStudent && !aiTargetStudent && <p style={{ fontSize: 11, color: T.inkSoft, margin: 0 }}>اختر طالبًا من القائمة أعلاه أولًا.</p>}
                  {aiResult[a.key] && <div style={{ fontSize: 13, whiteSpace: "pre-wrap", background: T.paper, padding: 12, borderRadius: 8, marginTop: 8 }}>{aiResult[a.key]}</div>}
                </div>
              ))}
              <div className="card" style={{ padding: 16, background: T.greenSoft }}>
                <strong>🧪 إنشاء اختبار جديد بالذكاء الاصطناعي</strong>
                <p style={{ fontSize: 12, color: T.inkSoft, margin: "6px 0 10px" }}>يستعمل نفس مولّد الكورسات الحقيقي الموجود أصلًا في تبويب "كورساتي" — لا أداة منفصلة مكرَّرة.</p>
                <button className="btn btn-p" onClick={onNew}>الذهاب لمولّد الكورسات</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ==================== محرر الكورس بالذكاء الاصطناعي لرئيس القسم ==================== */
function AIEditCourse({ course, onSave, onCancel }) {
  const [instruction, setInstruction] = useState("حسّن الشرح والأسئلة مع الحفاظ على مستوى الصف وعدم تكرار أي سؤال.");
  const [provider, setProvider] = useState("auto");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [candidate, setCandidate] = useState(null);
  const before = courseQuality(course);
  const improve = async () => {
    if (!instruction.trim()) return;
    setBusy(true); setNote("جارٍ تحليل الكورس وإعداد نسخة محسّنة…"); setCandidate(null);
    try {
      const compact = { title: course.title, objective: course.objective, domain: course.domain, grade: course.grade, stages: course.stages || [], bank: course.bank || [] };
      const prompt = `أنت خبير مناهج لغة عربية. عدّل الكورس التالي وفق التعليمات، وأعد JSON فقط بلا نص خارجه.
تعليمات رئيس القسم: ${instruction}
شروط إلزامية:
1) حافظ على بنية stages وbank وعلى أنواع الأسئلة mcq/tf/fill/err/match.
2) لا تكرر نص أي سؤال مرتين، ولا تكرر سؤالًا موجودًا داخل الشرح أو checks في بنك الاختبار.
3) اجعل الأسئلة مناسبة للصف ${course.grade} ومتنوعة ومتدرجة.
4) لا تغيّر هوية الكورس أو الصف أو المعلم أو حالة النشر.
5) أعد: {"title":"","objective":"","stages":[],"bank":[]}
الكورس الحالي: ${JSON.stringify(compact)}`;
      const raw = await ask(prompt, provider);
      if (!raw || !Array.isArray(raw.stages) || !Array.isArray(raw.bank)) throw new Error("صيغة غير صالحة");
      const merged = { ...course, title: String(raw.title || course.title), objective: String(raw.objective || course.objective),
        stages: raw.stages, bank: dedupeBank(raw.bank), id: course.id, teacher: course.teacher, grade: course.grade,
        domain: course.domain, status: course.status, blocks: course.blocks, students: course.students };
      merged.bank = cleanBank(merged);
      if (merged.bank.length < 8) throw new Error("عدد الأسئلة الصالحة بعد منع التكرار أقل من الحد الآمن.");
      setCandidate(merged);
      const q = courseQuality(merged);
      setNote(`تم إعداد النسخة المقترحة: جودة ${q.score}/100 · ${q.cleanCount} سؤالًا صالحًا · ${q.duplicateCount} تكرار.`);
    } catch (e) { setNote(`تعذّر إنشاء نسخة آمنة: ${String(e?.message || e)}. لم يتغير الكورس الأصلي.`); }
    finally { setBusy(false); }
  };
  const after = candidate ? courseQuality(candidate) : null;
  return <div className="wrap" style={{paddingBottom:60,maxWidth:950}}><div className="card" style={{padding:22}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}>
      <div><h2>🤖 تحسين الكورس بالذكاء الاصطناعي</h2><p style={{fontSize:12,color:T.inkSoft,margin:"4px 0"}}>{course.title} · الصف {course.grade} · يبقى رقم الكورس {course.id} كما هو لحماية النتائج والشهادات.</p></div>
      <button className="btn btn-q" onClick={onCancel}>عودة</button>
    </div>
    <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",margin:"16px 0"}}>
      <Stat label="الجودة الحالية" value={`${before.score}/100`} tone={before.score>=80?T.green:before.score>=60?T.gold:T.brick}/>
      <Stat label="الأسئلة الصالحة" value={before.cleanCount}/><Stat label="التكرارات" value={before.duplicateCount} tone={before.duplicateCount?T.brick:T.green}/><Stat label="الوحدات" value={before.stageCount}/>
    </div>
    <label className="lbl">ماذا تريد من الذكاء الاصطناعي أن يغيّر؟</label>
    <textarea className="tarea" rows={4} value={instruction} onChange={e=>setInstruction(e.target.value)}/>
    <div className="grid" style={{gridTemplateColumns:"minmax(180px,1fr) auto",marginTop:10}}>
      <select className="inp" value={provider} onChange={e=>setProvider(e.target.value)}><option value="auto">تلقائي — Gemini أولًا</option>{Object.entries(PROVIDERS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
      <button className="btn btn-p" disabled={busy} onClick={improve}>{busy?"جارٍ التحليل…":"إنشاء نسخة محسّنة"}</button>
    </div>
    {note&&<p style={{fontSize:12,color:note.startsWith("تعذّر")?T.brick:T.green,marginTop:10}}>{note}</p>}
    {candidate&&<div style={{marginTop:18}}><h3 style={{marginBottom:10}}>مقارنة قبل الاعتماد</h3>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"}}>
        <div className="card" style={{padding:14,background:T.paper}}><strong>قبل</strong><p>{course.objective}</p><div style={{fontSize:12,color:T.inkSoft}}>جودة {before.score}/100 · {before.cleanCount} سؤالًا</div></div>
        <div className="card" style={{padding:14,background:T.greenSoft}}><strong>بعد</strong><p>{candidate.objective}</p><div style={{fontSize:12,color:T.inkSoft}}>جودة {after.score}/100 · {after.cleanCount} سؤالًا · تكرار {after.duplicateCount}</div></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}><button className="btn btn-p" onClick={()=>onSave(candidate)}>اعتماد التعديل وحفظه</button><button className="btn btn-q" onClick={()=>setCandidate(null)}>رفض النسخة</button></div>
    </div>}
  </div></div>;
}

/* ==================== وحدة الإدارة / رئيس القسم ==================== */
// نموذج خطة تدخل حقيقي — سجلّ كامل يُحفَظ فعليًّا (لا نافذة تأكيد شكلية):
// المشكلة، الإجراء، المسؤول، تاريخ المراجعة. حقل "الإجراء" يشمل خيارات
// تغطّي "إسناد كورس علاجي" و"تحويل الحالة للمعلم" و"تحديد موعد للمراجعة"
// معًا في سجلّ واحد بدل أزرار منفصلة تعِد بآليات لا يدعمها هيكل المنصة.
function InterventionModal({ target, courses, actor, onClose, onSave }) {
  const [problem, setProblem] = useState("");
  const [actionType, setActionType] = useState("كورس علاجي");
  const [remedialCourse, setRemedialCourse] = useState("");
  const [responsible, setResponsible] = useState(actor || "");
  const [reviewDate, setReviewDate] = useState("");

  const ready = problem.trim() && responsible.trim() && reviewDate;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,46,51,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
      <div className="card" style={{ padding: 22, maxWidth: 480, width: "94%" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 4 }}>خطة تدخل — {target.studentName}</h3>
        <p style={{ fontSize: 12, color: T.inkSoft, marginBottom: 14 }}>سجلّ حقيقي يُحفَظ ويظهر لاحقًا في ملف الطالب.</p>

        <label style={{ fontSize: 12, fontWeight: 700 }}>المشكلة</label>
        <textarea className="inp" rows={2} value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="مثال: فشل أربع مرات في مهارة الهمزة المتوسطة" style={{ marginBottom: 10 }} />

        <label style={{ fontSize: 12, fontWeight: 700 }}>نوع الإجراء</label>
        <select className="inp" value={actionType} onChange={(e) => setActionType(e.target.value)} style={{ marginBottom: 10 }}>
          <option>كورس علاجي</option><option>تحويل للمعلم للمتابعة المباشرة</option><option>مراجعة مع رئيس القسم</option><option>تواصل مع ولي الأمر</option>
        </select>

        {actionType === "كورس علاجي" && (
          <>
            <label style={{ fontSize: 12, fontWeight: 700 }}>الكورس العلاجي المقترَح</label>
            <select className="inp" value={remedialCourse} onChange={(e) => setRemedialCourse(e.target.value)} style={{ marginBottom: 10 }}>
              <option value="">— اختر —</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </>
        )}

        <label style={{ fontSize: 12, fontWeight: 700 }}>المسؤول عن التنفيذ</label>
        <input className="inp" value={responsible} onChange={(e) => setResponsible(e.target.value)} style={{ marginBottom: 10 }} />

        <label style={{ fontSize: 12, fontWeight: 700 }}>تاريخ المراجعة</label>
        <input className="inp" type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} style={{ marginBottom: 16 }} />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>إلغاء</button>
          <button className="btn btn-p" disabled={!ready} onClick={() => onSave({ problem, action: actionType + (remedialCourse ? ` — ${courses.find((c) => c.id === remedialCourse)?.title}` : ""), responsible, reviewDate })}>حفظ الخطة</button>
        </div>
      </div>
    </div>
  );
}

function AdminHome({ courses, students, attempts, progress, teachers, blocksAdmin, blockGroups, audit, codes, onUpdateCodes, orgEmail, onUpdateOrgEmail, onSetTeacherEmail, onToggleTeacher, onAddTeacher, onDeleteTeacher, onSetTeacherCode, onAddBlock, onRemoveBlock, onSaveBlockGroup, onDeleteBlockGroup,
  onGenerateCourse, onAIEditCourse, onPublishAny, onPublishWithDetails, onArchiveAny, onDeleteCourse, onExportStudents, onExportAudit, onImportStudents,
  interventions, onAddIntervention, onUpdateIntervention, onReopenAttempt, currentActor }) {
  const [adminPublishOpen, setAdminPublishOpen] = useState(null);
  const [analysisGrade, setAnalysisGrade] = useState("all");
  const [analysisBlock, setAnalysisBlock] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentKey, setSelectedStudentKey] = useState(null);
  const [newOrgEmail, setNewOrgEmail] = useState(orgEmail || ""); const [orgEmailMsg, setOrgEmailMsg] = useState("");
  const [editEmailFor, setEditEmailFor] = useState(null); const [teacherEmailDraft, setTeacherEmailDraft] = useState("");
  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", code: "" });
  const [teacherCodeFor, setTeacherCodeFor] = useState(null); const [teacherCodeDraft, setTeacherCodeDraft] = useState("");
  const [openGradeBlocks, setOpenGradeBlocks] = useState(null);
  const [groupDraft, setGroupDraft] = useState({ grade: 7, name: "", blocks: [] });
  const [simGrade, setSimGrade] = useState(7); const [simThreshold, setSimThreshold] = useState(70); const [simCourseId, setSimCourseId] = useState("");
  const [tab, setTab] = useState("dash");
  const [navGroup, setNavGroup] = useState("lead");
  const [riskFilter, setRiskFilter] = useState("all");
  const [interventionFor, setInterventionFor] = useState(null); // { studentKey, studentName }
  const [noteDraft, setNoteDraft] = useState({});
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [studentProfileKey, setStudentProfileKey] = useState(null);
  const [studentSearch2, setStudentSearch2] = useState("");
  const [teacherSupportDraft, setTeacherSupportDraft] = useState({});
  const [csvText, setCsvText] = useState("");
  const [newTeacherCode, setNewTeacherCode] = useState(""); const [newAdminCode, setNewAdminCode] = useState(""); const [codeMsg, setCodeMsg] = useState("");
  const byGrade = {};
  students.forEach((s) => { byGrade[s.grade] = byGrade[s.grade] || { n: 0, sum: 0, c: 0 }; byGrade[s.grade].n++; });
  attempts.forEach((a) => { const s = students.find((x) => x.key === a.student); if (!s) return;
    byGrade[s.grade] = byGrade[s.grade] || { n: 0, sum: 0, c: 0 }; byGrade[s.grade].sum += a.pct; byGrade[s.grade].c++; });
  const byBlock = {};
  students.forEach((s) => { const k = `${s.grade}-${s.block}`; byBlock[k] = byBlock[k] || { n: 0, sum: 0, c: 0 }; byBlock[k].n++; });
  attempts.forEach((a) => { const s = students.find((x) => x.key === a.student); if (!s) return; const k = `${s.grade}-${s.block}`;
    byBlock[k] = byBlock[k] || { n: 0, sum: 0, c: 0 }; byBlock[k].sum += a.pct; byBlock[k].c++; });
  const byTeacher = {};
  courses.forEach((c) => { byTeacher[c.teacher] = byTeacher[c.teacher] || { courses: 0, attempts: 0, sum: 0 }; byTeacher[c.teacher].courses++; });
  attempts.forEach((a) => { const c = courses.find((x) => x.id === a.course); if (!c) return;
    byTeacher[c.teacher] = byTeacher[c.teacher] || { courses: 0, attempts: 0, sum: 0 }; byTeacher[c.teacher].attempts++; byTeacher[c.teacher].sum += a.pct; });
  const now2 = new Date();
  const studentRows = students.map((s) => {
    const at = attempts.filter((a) => a.student === s.key).slice().sort((x, y) => new Date(x.at) - new Date(y.at));
    const lastAttemptAt = at.length ? at[at.length - 1].at : null;
    const daysSinceLast = lastAttemptAt ? Math.round((now2 - new Date(lastAttemptAt)) / 86400000) : null;
    return { ...s, avg: at.length ? Math.round(at.reduce((x, a) => x + a.pct, 0) / at.length) : null, attemptsCount: at.length, lastAttemptAt, daysSinceLast };
  });
  // تصنيف حقيقي: أخضر يسير وفق الخطة، أصفر يحتاج متابعة، أحمر متعثر، رمادي لم يبدأ
  const classify = (r) => {
    if (!r.attemptsCount) return { c: "رمادي", tone: T.inkSoft, bg: T.ruleSoft };
    if (r.avg != null && r.avg < 70) return { c: "أحمر", tone: T.brick, bg: T.brickSoft };
    if (r.daysSinceLast != null && r.daysSinceLast > 7) return { c: "أصفر", tone: T.gold, bg: T.goldSoft };
    return { c: "أخضر", tone: T.green, bg: T.greenSoft };
  };

  const ADMIN_GROUPS = [
    { k: "lead", icon: "🏠", label: "القيادة", first: "dash", items: [["dash","لوحة القيادة"],["reports","التقارير التنفيذية"],["cmp","المقارنات"],["o","نظرة عامة"]] },
    { k: "students", icon: "👥", label: "الطلاب", first: "students2", items: [["students2","جميع الطلاب"],["risk","الطلاب المتعثرون"],["classes","الصفوف والبلوكات"],["an","تحليل طالب أو صف"],["io","استيراد وتصدير"]] },
    { k: "teachers", icon: "👨‍🏫", label: "المعلمون", first: "teachperf", items: [["teachperf","أداء المعلمين"],["u","إدارة المعلمين والصلاحيات"],["classes","الصفوف المسندة"]] },
    { k: "learning", icon: "📚", label: "الكورسات والمهارات", first: "skills", items: [["skills","تحليل الكورسات والمهارات"],["c","جميع الكورسات"],["b","الصفوف والبلوكات"]] },
    { k: "intervention", icon: "🎯", label: "التدخلات والتحصيل", first: "plans", items: [["plans","الخطط والتدخلات"],["cmp","التقدم والمقارنات"],["reports","تقارير الأثر"],["risk","أولويات التدخل"]] },
    { k: "admin", icon: "⚙️", label: "الإدارة والأمان", first: "u", items: [["u","المستخدمون والصلاحيات"],["b","الصفوف والبلوكات"],["log","سجل النشاط"],["io","البيانات والاستيراد"],["sec","الأمان"]] },
  ];
  const activeGroup = ADMIN_GROUPS.find((g) => g.k === navGroup) || ADMIN_GROUPS[0];
  const goGroup = (g) => { setNavGroup(g.k); setTab(g.first); };

  return (
    <div className="adm-shell">
      <section className="adm-hero">
        <img src={LOGO_URL} alt="" aria-hidden="true" className="adm-lion" />
        <div className="adm-hero-row">
          <div className="adm-brand">
            <div className="logo-chip lg"><img src={LOGO_URL} alt="GEMS Founders School Dubai" /></div>
            <div>
              <div className="adm-hero-title">لوحة قيادة رئيس قسم اللغة العربية</div>
              <div className="adm-hero-sub">رؤية شاملة لأداء القسم • قرارات مبنية على البيانات • متابعة فورية</div>
            </div>
          </div>
          <div className="adm-actor">
            <div className="adm-avatar">{(currentActor || "ر")[0]}</div>
            <div>
              <div style={{fontWeight:800,fontSize:13}}>{currentActor || "رئيس القسم"}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.65)"}}>رئيس قسم اللغة العربية</div>
            </div>
          </div>
        </div>
        <nav className="adm-mainnav" aria-label="مراكز إدارة القسم">
          {ADMIN_GROUPS.map((g) => (
            <button key={g.k} className={`adm-mainbtn ${navGroup===g.k?"on":""}`} onClick={() => goGroup(g)}>
              <span style={{marginLeft:6}}>{g.icon}</span>{g.label}
            </button>
          ))}
        </nav>
      </section>
      <nav className="adm-subnav" aria-label={`خيارات ${activeGroup.label}`}>
        {activeGroup.items.map(([k,l]) => (
          <button key={`${activeGroup.k}-${k}`} className={`adm-subbtn ${tab===k?"on":""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>
      <div className="adm-content">

      {tab === "dash" && (() => {
        const now = new Date();
        const daysAgo = (d) => (now - new Date(d)) / 86400000;
        const attemptsByStudent = {};
        attempts.forEach((a) => { (attemptsByStudent[a.student] = attemptsByStudent[a.student] || []).push(a); });

        const activeThisWeek = new Set(attempts.filter((a) => daysAgo(a.at) <= 7).map((a) => a.student)).size;
        const neverAttempted = students.filter((st) => !attemptsByStudent[st.key]?.length);
        const published = courses.filter((c) => c.status === "published");

        let assignedPairs = 0, startedPairs = 0, completedPairs = 0;
        published.forEach((c) => {
          const targeted = students.filter((st) => +st.grade === +c.grade && (c.blocks || []).includes(st.block));
          assignedPairs += targeted.length;
          targeted.forEach((st) => {
            const pairAttempts = attempts.filter((a) => a.student === st.key && a.course === c.id);
            const p = progress[`${st.key}|${c.id}`];
            if (pairAttempts.length || p?.done?.length) startedPairs++;
            if (pairAttempts.some((a) => a.passed)) completedPairs++;
          });
        });
        const completionPct = assignedPairs ? Math.round((completedPairs / assignedPairs) * 100) : null;
        const avgScore = attempts.length ? Math.round(attempts.reduce((x, a) => x + a.pct, 0) / attempts.length) : null;

        const strugglingKeys = new Set();
        students.forEach((st) => {
          const at = attemptsByStudent[st.key] || [];
          if (at.length && Math.round(at.reduce((x, a) => x + a.pct, 0) / at.length) < 70) strugglingKeys.add(st.key);
          const perCourse = {};
          at.forEach((a) => (perCourse[a.course] = perCourse[a.course] || []).push(a));
          Object.values(perCourse).forEach((arr) => { if (arr.length >= 4 && !arr.some((a) => a.passed)) strugglingKeys.add(st.key); });
        });

        const certificates = attempts.filter((a) => a.passed).length;
        const last7 = attempts.filter((a) => daysAgo(a.at) <= 7);
        const prev7 = attempts.filter((a) => daysAgo(a.at) > 7 && daysAgo(a.at) <= 14);
        const avgOf = (arr) => arr.length ? Math.round(arr.reduce((x, a) => x + a.pct, 0) / arr.length) : null;
        const last7Avg = avgOf(last7), prev7Avg = avgOf(prev7);
        const weekDelta = last7Avg != null && prev7Avg != null ? last7Avg - prev7Avg : null;

        const weeks = Array.from({ length: 6 }, (_, i) => 5 - i).map((w) => {
          const arr = attempts.filter((a) => { const d = daysAgo(a.at); return d >= w * 7 && d < (w + 1) * 7; });
          return { label: w === 0 ? "هذا الأسبوع" : `قبل ${w} أ`, v: arr.length ? Math.round(arr.reduce((x, a) => x + a.pct, 0) / arr.length) : null };
        }).filter((p) => p.v != null);

        const distribution = { high: 0, mid: 0, low: 0, none: 0 };
        studentRows.forEach((r) => {
          if (!r.attemptsCount) distribution.none++;
          else if (r.avg >= 80) distribution.high++;
          else if (r.avg >= 60) distribution.mid++;
          else distribution.low++;
        });
        const measured = distribution.high + distribution.mid + distribution.low;
        const hp = measured ? Math.round(distribution.high * 100 / measured) : 0;
        const mp = measured ? Math.round(distribution.mid * 100 / measured) : 0;
        const lp = measured ? Math.max(0, 100 - hp - mp) : 0;
        const donutBg = measured
          ? `conic-gradient(#2EAD5B 0 ${hp}%, #F1B51C ${hp}% ${hp+mp}%, #E63D3D ${hp+mp}% 100%)`
          : "conic-gradient(#D9DEE8 0 100%)";

        const blockRows = Object.entries(byBlock)
          .map(([k,v]) => ({ k, avg: v.c ? Math.round(v.sum/v.c) : null, n:v.n }))
          .filter((r) => r.avg != null)
          .sort((a,b) => b.avg-a.avg);
        const worstBlock = blockRows.length ? blockRows[blockRows.length-1] : null;

        const coursePerf = courses.map((c) => {
          const arr = attempts.filter((a) => a.course === c.id);
          return { id:c.id, title:c.title, avg:arr.length?Math.round(arr.reduce((x,a)=>x+a.pct,0)/arr.length):null, count:arr.length };
        }).filter((r)=>r.avg!=null).sort((a,b)=>b.count-a.count).slice(0,5);

        const toneFor = (v) => v >= 80 ? "#2EAD5B" : v >= 60 ? "#F1B51C" : "#E63D3D";
        const funnelStages = [
          {label:"تم الإسناد", value:assignedPairs, color:"#284FB8"},
          {label:"بدأ الكورس", value:startedPairs, color:"#19A7A0"},
          {label:"أكمل بنجاح", value:completedPairs, color:"#F1B51C"},
          {label:"حصل على شهادة", value:certificates, color:"#E63D3D"},
        ];
        const funnelMax = Math.max(1,...funnelStages.map((x)=>x.value));

        const priorities = [];
        if (worstBlock) priorities.push({level:worstBlock.avg<60?"عاجل":"متابعة", title:worstBlock.k, detail:`متوسط التحصيل ${worstBlock.avg}%`, value:worstBlock.avg});
        if (strugglingKeys.size) priorities.push({level:"عاجل", title:"طلاب متعثرون", detail:`${strugglingKeys.size} طالب يحتاجون تدخّلًا`, value:Math.max(1,Math.min(59,avgScore||0))});
        if (neverAttempted.length) priorities.push({level:"متابعة", title:"لم يبدؤوا", detail:`${neverAttempted.length} طالب بلا محاولة`, value:65});
        const activityPct = students.length ? Math.round(activeThisWeek * 100 / students.length) : null;
        const safePct = students.length ? Math.round((students.length - strugglingKeys.size) * 100 / students.length) : null;
        const healthParts = [[avgScore, .40], [completionPct, .25], [activityPct, .15], [safePct, .20]].filter(([v]) => v != null);
        const healthWeight = healthParts.reduce((n,[,w])=>n+w,0);
        const healthScore = healthWeight ? Math.round(healthParts.reduce((n,[v,w])=>n+v*w,0)/healthWeight) : null;

        return (
          <div>
            <div className="adm-filterbar">
              <div>
                <div style={{fontSize:19,fontWeight:800,color:"#12294a"}}>مركز قيادة القسم</div>
                <div className="adm-muted">آخر قراءة من البيانات الفعلية المسجّلة في المنصة</div>
              </div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                <button className="adm-subbtn" onClick={()=>setTab("reports")}>📄 تقرير تنفيذي</button>
                <button className="adm-subbtn" onClick={()=>setTab("cmp")}>📊 المقارنات</button>
                <button className="adm-subbtn" onClick={()=>{setNavGroup("intervention");setTab("plans")}}>⚡ إنشاء/متابعة تدخل</button>
              </div>
            </div>

            <div className="adm-kpis">
              {[
                ["❤️","صحة القسم",healthScore!=null?healthScore+"/100":"—",healthScore==null?"تظهر مع توافر البيانات":healthScore>=80?"مستقر وقوي":healthScore>=60?"يحتاج متابعة":"أولوية تدخل"],
                ["👥","إجمالي الطلاب",students.length,"الطلاب المسجّلون فعليًا"],
                ["🎯","متوسط التحصيل",avgScore!=null?avgScore+"%":"—",weekDelta!=null?`${weekDelta>=0?"↑":"↓"} ${Math.abs(weekDelta)} نقطة عن الأسبوع السابق`:"لا مقارنة كافية"],
                ["📗","نسبة الإكمال",completionPct!=null?completionPct+"%":"—",`${completedPairs} من ${assignedPairs||0} إسناد مكتمل`],
                ["⚠️","المعرضون للخطر",strugglingKeys.size,strugglingKeys.size?"يحتاجون متابعة أو تدخل":"لا حالات حالية"],
                ["📚","الكورسات النشطة",published.length,`${courses.length} كورس إجمالًا`],
                ["🏅","الشهادات الصادرة",certificates,"من نتائج النجاح المسجّلة"],
              ].map(([ic,l,v,f])=>(
                <div className="adm-kpi" key={l}>
                  <div className="adm-kpi-top"><span className="adm-kpi-label">{l}</span><span className="adm-kpi-icon">{ic}</span></div>
                  <div className="adm-kpi-value">{v}</div><div className="adm-kpi-foot">{f}</div>
                </div>
              ))}
            </div>

            <div className="adm-grid3">
              <section className="adm-panel">
                <h3>توزيع الطلاب حسب مستوى التحصيل</h3>
                <div className="adm-donut" style={{background:donutBg}}>
                  <div className="adm-donut-center"><div style={{fontSize:28}}>{avgScore!=null?avgScore+"%":"—"}</div><div className="adm-muted">متوسط التحصيل</div></div>
                </div>
                <div className="adm-legend">
                  <div className="adm-legend-row"><span><i className="adm-dot" style={{background:"#2EAD5B"}}/>مرتفع (80%+)</span><b>{distribution.high}</b></div>
                  <div className="adm-legend-row"><span><i className="adm-dot" style={{background:"#F1B51C"}}/>متوسط (60–79%)</span><b>{distribution.mid}</b></div>
                  <div className="adm-legend-row"><span><i className="adm-dot" style={{background:"#E63D3D"}}/>منخفض (أقل من 60%)</span><b>{distribution.low}</b></div>
                  {distribution.none>0 && <div className="adm-legend-row"><span><i className="adm-dot" style={{background:"#B8C0CF"}}/>لا توجد نتيجة بعد</span><b>{distribution.none}</b></div>}
                </div>
              </section>

              <section className="adm-panel">
                <h3>اتجاه متوسط التحصيل خلال آخر 6 أسابيع</h3>
                {weeks.length>1 ? <TrendChart points={weeks} height={185} tone="#2EAD5B"/> :
                  <div style={{padding:"56px 10px",textAlign:"center",color:T.inkSoft}}>لا توجد بيانات زمنية كافية لرسم الاتجاه بعد.</div>}
                <div style={{textAlign:"center",marginTop:4}}><button className="adm-subbtn" onClick={()=>setTab("cmp")}>عرض التحليل الكامل ←</button></div>
              </section>

              <section className="adm-panel">
                <h3>مقارنة الصفوف والبلوكات</h3>
                {blockRows.length ? <div className="adm-bars">
                  {blockRows.slice(0,7).map((r)=>(
                    <div className="adm-bar-row" key={r.k}>
                      <b>{r.k}</b><div className="adm-track"><div className="adm-fill" style={{width:`${r.avg}%`,background:toneFor(r.avg)}}/></div><b>{r.avg}%</b>
                    </div>
                  ))}
                </div> : <div className="adm-muted">ستظهر المقارنة بعد وجود نتائج فعلية لأكثر من صف/بلوك.</div>}
                <div style={{textAlign:"center",marginTop:13}}><button className="adm-subbtn" onClick={()=>{setNavGroup("students");setTab("classes")}}>عرض جميع الصفوف ←</button></div>
              </section>
            </div>

            <div className="adm-grid4">
              <section className="adm-panel">
                <h3>خريطة أداء الكورسات/المهارات</h3>
                {coursePerf.length ? <div className="adm-heat">
                  <div className="adm-heat-row" style={{fontWeight:800,color:"#68758a"}}><span>المهارة/الكورس</span><span>الأداء</span><span>المحاولات</span><span>الحالة</span></div>
                  {coursePerf.map((r)=>(
                    <div className="adm-heat-row" key={r.id}>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={r.title}>{r.title}</span>
                      <span className="adm-heat-cell" style={{background:toneFor(r.avg)}}>{r.avg}%</span>
                      <span style={{textAlign:"center",fontWeight:800}}>{r.count}</span>
                      <span style={{textAlign:"center",color:toneFor(r.avg),fontWeight:800}}>{r.avg>=80?"مرتفع":r.avg>=60?"متوسط":"منخفض"}</span>
                    </div>
                  ))}
                </div> : <div className="adm-muted">لا توجد نتائج كورسات كافية لبناء خريطة الأداء.</div>}
                <div style={{textAlign:"center",marginTop:10}}><button className="adm-subbtn" onClick={()=>{setNavGroup("learning");setTab("skills")}}>خريطة المهارات الكاملة ←</button></div>
              </section>

              <section className="adm-panel">
                <h3>رحلة الطالب في الكورس</h3>
                {assignedPairs ? <div className="adm-funnel">
                  {funnelStages.map((st,i)=>{
                    const w=Math.max(32,Math.round(st.value/funnelMax*100));
                    return <div key={st.label} style={{width:"100%",display:"grid",gridTemplateColumns:"1fr 58px",gap:8,alignItems:"center"}}>
                      <div className="adm-funnel-step" style={{width:`${w}%`,minWidth:90,background:st.color,justifySelf:"center"}}>{st.label}</div>
                      <b>{st.value}</b>
                    </div>
                  })}
                </div>:<div className="adm-muted">لا توجد إسنادات منشورة كافية لبناء رحلة الكورس.</div>}
                <div style={{textAlign:"center",marginTop:10}}><button className="adm-subbtn" onClick={()=>{setNavGroup("learning");setTab("c")}}>عرض جميع الكورسات ←</button></div>
              </section>

              <section className="adm-panel">
                <h3>أعلى أولويات التدخل اليوم</h3>
                <div className="adm-priority">
                  {priorities.length ? priorities.slice(0,4).map((r,i)=>(
                    <div className="adm-priority-item" key={`${r.title}-${i}`}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                        <b>{r.title}</b><span className="chip" style={{background:r.level==="عاجل"?"#FCE8E8":"#FFF3CF",color:r.level==="عاجل"?"#C93434":"#9B6C00"}}>{r.level}</span>
                      </div>
                      <div className="adm-muted">{r.detail}</div>
                    </div>
                  )):<div className="adm-muted">لا توجد حالات تستدعي تدخّلًا حاليًا.</div>}
                </div>
                <div style={{textAlign:"center",marginTop:10}}><button className="adm-subbtn" onClick={()=>{setNavGroup("intervention");setTab("plans")}}>عرض التدخلات ←</button></div>
              </section>

              <section className="adm-panel adm-ai">
                <h3>✨ ملخّص ذكي لرئيس القسم</h3>
                <ul>
                  {weekDelta!=null && <li>أداء القسم {weekDelta>=0?"تحسّن":"انخفض"} بمقدار {Math.abs(weekDelta)} نقطة عن الأسبوع السابق.</li>}
                  {worstBlock && <li>{worstBlock.k} هو الأقل أداءً حاليًا بمتوسط {worstBlock.avg}%.</li>}
                  {strugglingKeys.size>0 && <li>{strugglingKeys.size} طالب يحتاجون تدخلًا أو متابعة مباشرة.</li>}
                  {neverAttempted.length>0 && <li>{neverAttempted.length} طالب لم يسجلوا أي محاولة حتى الآن.</li>}
                  {coursePerf.length>0 && <li>أعلى كورس/مهارة وفق النتائج الحالية: {coursePerf.slice().sort((a,b)=>b.avg-a.avg)[0].title}.</li>}
                  {weekDelta==null && !worstBlock && !strugglingKeys.size && !neverAttempted.length && <li>لا توجد بيانات كافية بعد؛ سيُبنى الملخّص تلقائيًا مع نشاط الطلاب.</li>}
                </ul>
                <button className="adm-subbtn" style={{width:"100%",background:"rgba(255,255,255,.1)",color:"#fff"}} onClick={()=>setTab("reports")}>عرض التحليلات المتقدمة</button>
              </section>
            </div>
          </div>
        );
      })()}

      {tab === "risk" && (() => {
        const now = new Date();
        const attemptsByStudent = {};
        attempts.forEach((a) => { (attemptsByStudent[a.student] = attemptsByStudent[a.student] || []).push(a); });
        const published = courses.filter((c) => c.status === "published");

        const rows = students.map((s) => {
          const at = (attemptsByStudent[s.key] || []).slice().sort((x, y) => new Date(x.at) - new Date(y.at));
          const assigned = published.filter((c) => +s.grade === +c.grade && (c.blocks || []).includes(s.block));
          const reasons = [];

          if (!at.length) reasons.push({ k: "notEntered", label: "لم يدخل المنصة" });
          const startedCourseIds = new Set(Object.keys(progress).filter((k) => k.startsWith(s.key + "|") && (progress[k]?.done?.length > 0)).map((k) => k.split("|")[1]));
          const notStarted = assigned.filter((c) => !startedCourseIds.has(c.id));
          if (at.length && notStarted.length) reasons.push({ k: "notStarted", label: `لم يبدأ ${notStarted.length} كورسًا مُسنَدًا` });

          const avg = at.length ? Math.round(at.reduce((x, a) => x + a.pct, 0) / at.length) : null;
          if (avg != null && avg < 70) reasons.push({ k: "lowScore", label: `متوسط منخفض (${avg}%)` });

          const byCourse = {};
          at.forEach((a) => { (byCourse[a.course] = byCourse[a.course] || []).push(a); });
          const exhaustedCourses = Object.entries(byCourse).filter(([, arr]) => arr.length >= 4 && !arr.some((a) => a.passed)).map(([cid]) => cid);
          if (exhaustedCourses.length) reasons.push({ k: "exhausted", label: `استنفد المحاولات في ${exhaustedCourses.length} كورس`, courseIds: exhaustedCourses });

          if (at.length >= 4) {
            const half = Math.floor(at.length / 2);
            const firstAvg = at.slice(0, half).reduce((x, a) => x + a.pct, 0) / half;
            const lastAvg = at.slice(-half).reduce((x, a) => x + a.pct, 0) / half;
            if (lastAvg < firstAvg - 10) reasons.push({ k: "declining", label: `تراجع الأداء (${Math.round(firstAvg)}%→${Math.round(lastAvg)}%)` });
          }

          const overdueCourses = assigned.filter((c) => c.dueDate && new Date(c.dueDate) < now && !at.some((a) => a.course === c.id && a.passed));
          if (overdueCourses.length) reasons.push({ k: "overdue", label: `تجاوز الموعد النهائي في ${overdueCourses.length} كورس` });

          const riskScore = Math.min(100,
            (!at.length ? 35 : 0) +
            (notStarted.length ? Math.min(20, notStarted.length * 7) : 0) +
            (avg != null && avg < 70 ? Math.min(25, 70 - avg) : 0) +
            (exhaustedCourses.length ? Math.min(25, exhaustedCourses.length * 15) : 0) +
            (reasons.some((x) => x.k === "declining") ? 15 : 0) +
            (overdueCourses.length ? Math.min(15, overdueCourses.length * 5) : 0)
          );
          return { ...s, avg, reasons, exhaustedCourses, riskScore, notes: interventions.filter((i) => i.studentKey === s.key) };
        }).filter((r) => r.reasons.length > 0).sort((a,b)=>b.riskScore-a.riskScore);

        const filtered = riskFilter === "all" ? rows : rows.filter((r) => r.reasons.some((rs) => rs.k === riskFilter));
        const REASON_TYPES = [["all", "الكل"], ["notEntered", "لم يدخلوا"], ["notStarted", "لم يبدؤوا"], ["lowScore", "أداء ضعيف"], ["exhausted", "استنفدوا المحاولات"], ["declining", "تراجع الأداء"], ["overdue", "تجاوزوا الموعد"]];

        return (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {REASON_TYPES.map(([k, l]) => (
                <button key={k} className="tabbtn" onClick={() => setRiskFilter(k)} style={{ background: riskFilter === k ? T.brick : T.paper, color: riskFilter === k ? "#fff" : T.inkSoft, fontSize: 12 }}>{l}</button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: T.inkSoft, marginBottom: 14 }}>{filtered.length} طالبًا يحتاجون متابعة من {students.length} إجمالًا. كل سبب محسوب من بياناتهم الفعلية — لا تصنيف يدوي.</p>

            {filtered.length === 0 && <div className="card" style={{ padding: 30, textAlign: "center", color: T.inkSoft }}>لا طلاب متعثرون حسب هذا الفلتر حاليًّا 🎉</div>}

            <div style={{ display: "grid", gap: 10 }}>
              {filtered.map((r) => (
                <div key={r.key} className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: T.inkSoft }}>الصف {r.grade} — {r.block} {r.avg != null && `— متوسط ${r.avg}%`}</div>
                      <div style={{marginTop:5}}><Chip tone={r.riskScore>=60?"r":r.riskScore>=30?"a":"g"}>مؤشر الخطر {r.riskScore}/100</Chip></div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {r.reasons.map((rs) => <span key={rs.k} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 10, background: T.brickSoft, color: T.brick, fontWeight: 700 }}>{rs.label}</span>)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="btn" style={{ fontSize: 12 }} disabled={!r.parentEmail}
                      onClick={() => notifyEmail(r.parentEmail, `تنبيه أداء — ${r.name}`, `<p>مرحبًا،</p><p>يرجى تنبيه <strong>${r.name}</strong> (الصف ${r.grade} — ${r.block}) لمتابعة أداءه في منصة "بالعربي أحلى" في أقرب وقت.</p>`)}>
                      📧 تنبيه (عبر بريد ولي الأمر — لا بريد مباشر للطالب في المنصة)
                    </button>
                    <button className="btn" style={{ fontSize: 12 }} disabled={!r.parentEmail}
                      onClick={() => notifyEmail(r.parentEmail, `متابعة أداء ${r.name}`, `<p>عزيزي ولي الأمر،</p><p>يحتاج ${r.name} (الصف ${r.grade} — ${r.block}) لمتابعة إضافية في منصة "بالعربي أحلى". يسعدنا التواصل لمزيد من التفاصيل.</p>`)}>
                      👪 رسالة لولي الأمر
                    </button>
                    {r.exhaustedCourses.length > 0 && r.exhaustedCourses.map((cid) => {
                      const c = courses.find((x) => x.id === cid);
                      return <button key={cid} className="btn" style={{ fontSize: 12 }} onClick={() => onReopenAttempt(r.key, cid, currentActor)}>🔄 إعادة فتح «{c?.title || cid}»</button>;
                    })}
                    <button className="btn btn-p" style={{ fontSize: 12 }} onClick={() => setInterventionFor({ studentKey: r.key, studentName: r.name })}>📋 خطة تدخل</button>
                  </div>

                  {r.notes.length > 0 && (
                    <div style={{ marginTop: 10, borderTop: `1px solid ${T.ruleSoft}`, paddingTop: 10 }}>
                      {r.notes.map((n) => (
                        <div key={n.id} style={{ fontSize: 12, color: T.inkSoft, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                          <span>{n.problem || n.action} — {n.responsible} {n.reviewDate && `(مراجعة: ${n.reviewDate})`}</span>
                          <select className="inp" style={{ fontSize: 11, padding: "2px 6px", width: "auto" }} value={n.status} onChange={(e) => onUpdateIntervention(n.id, { status: e.target.value })}>
                            <option>مفتوح</option><option>قيد المتابعة</option><option>مكتمل</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {interventionFor && (
              <InterventionModal target={interventionFor} courses={courses.filter((c) => c.status === "published")} actor={currentActor}
                onClose={() => setInterventionFor(null)}
                onSave={(rec) => { onAddIntervention({ studentKey: interventionFor.studentKey, studentName: interventionFor.studentName, ...rec }); setInterventionFor(null); }} />
            )}
          </div>
        );
      })()}

      {tab === "classes" && (() => {
        const rows = Object.entries(byBlock).map(([k, v]) => {
          const [grade, block] = k.split("-");
          const inClass = studentRows.filter((s) => `${s.grade}-${s.block}` === k);
          const activeCount = inClass.filter((s) => s.attemptsCount > 0).length;
          const struggling = inClass.filter((s) => classify(s).c === "أحمر").length;
          const assigned = courses.filter((c) => c.status === "published" && +c.grade === +grade && (c.blocks || []).includes(block));
          let assignedPairs = 0, completedPairs = 0;
          assigned.forEach((c) => { assignedPairs++; if (inClass.some((s) => attempts.some((a) => a.student === s.key && a.course === c.id && a.passed))) completedPairs++; });
          return { k, grade, block, n: inClass.length, entryPct: inClass.length ? Math.round((activeCount / inClass.length) * 100) : 0,
            completionPct: assignedPairs ? Math.round((completedPairs / assignedPairs) * 100) : null,
            avg: v.c ? Math.round(v.sum / v.c) : null, struggling, students: inClass };
        }).sort((a, b) => a.grade - b.grade || a.block.localeCompare(b.block));

        return (
          <div>
            <p style={{ fontSize: 12, color: T.inkSoft, marginBottom: 12 }}>كل الأرقام محسوبة فعليًّا من محاولات الطلاب الحقيقية. اضغط أي صفّ لعرض تفاصيله.</p>
            <div className="card" style={{ overflow: "auto" }}>
              <table className="tbl">
                <thead><tr><th>الصف</th><th>عدد الطلاب</th><th>نسبة الدخول</th><th>نسبة الإنجاز</th><th>متوسط النتيجة</th><th>المتعثرون</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <React.Fragment key={r.k}>
                      <tr style={{ cursor: "pointer" }} onClick={() => setExpandedBlock(expandedBlock === r.k ? null : r.k)}>
                        <td style={{ fontWeight: 700 }}>{r.grade} — {r.block}</td>
                        <td>{r.n}</td><td className="mono">{r.entryPct}%</td>
                        <td className="mono">{r.completionPct != null ? r.completionPct + "%" : "—"}</td>
                        <td className="mono">{r.avg != null ? r.avg + "%" : "—"}</td>
                        <td style={{ color: r.struggling ? T.brick : T.inkSoft, fontWeight: r.struggling ? 700 : 400 }}>{r.struggling}</td>
                      </tr>
                      {expandedBlock === r.k && (
                        <tr><td colSpan={6} style={{ background: T.paper, padding: 14 }}>
                          <div style={{ display: "grid", gap: 8 }}>
                            {r.students.map((s) => {
                              const cl = classify(s);
                              const sInterventions = interventions.filter((i) => i.studentKey === s.key);
                              return (
                                <div key={s.key} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, padding: 8, background: T.card, borderRadius: 8, border: `1px solid ${T.rule}` }}>
                                  <span style={{ fontWeight: 600, cursor: "pointer" }} onClick={() => { setStudentProfileKey(s.key); setTab("students2"); }}>{s.name}</span>
                                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: cl.bg, color: cl.tone, fontWeight: 700 }}>{cl.c}</span>
                                  <span style={{ fontSize: 12, color: T.inkSoft }}>آخر نشاط: {s.lastAttemptAt ? dateAr(s.lastAttemptAt) : "لا يوجد"}</span>
                                  <span style={{ fontSize: 12, color: T.inkSoft }}>متوسط: {s.avg != null ? s.avg + "%" : "—"}</span>
                                  <span style={{ fontSize: 12, color: T.inkSoft }}>إجراءات مسجَّلة: {sInterventions.length}</span>
                                </div>
                              );
                            })}
                          </div>
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {tab === "students2" && (() => {
        const matches = studentSearch2.trim() ? studentRows.filter((s) => s.name.includes(studentSearch2.trim()) || s.key.includes(studentSearch2.trim())) : [];
        const profile = studentProfileKey ? studentRows.find((s) => s.key === studentProfileKey) : null;
        return (
          <div>
            {!profile ? (
              <>
                <input className="inp" placeholder="ابحث بالاسم أو الرقم التعريفي…" value={studentSearch2} onChange={(e) => setStudentSearch2(e.target.value)} style={{ marginBottom: 14, maxWidth: 340 }} />
                <div style={{ display: "grid", gap: 8 }}>
                  {matches.map((s) => { const cl = classify(s); return (
                    <div key={s.key} className="card" style={{ padding: 12, display: "flex", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setStudentProfileKey(s.key)}>
                      <span style={{ fontWeight: 600 }}>{s.name} <span style={{ fontSize: 12, color: T.inkSoft, fontWeight: 400 }}>— الصف {s.grade} {s.block}</span></span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: cl.bg, color: cl.tone, fontWeight: 700 }}>{cl.c}</span>
                    </div>);
                  })}
                  {studentSearch2.trim() && !matches.length && <p style={{ color: T.inkSoft, fontSize: 13 }}>لا نتائج.</p>}
                </div>
              </>
            ) : (() => {
              const cl = classify(profile);
              const assigned = courses.filter((c) => c.status === "published" && +c.grade === +profile.grade && (c.blocks || []).includes(profile.block));
              const passedIds = new Set(attempts.filter((a) => a.student === profile.key && a.passed).map((a) => a.course));
              const completed = assigned.filter((c) => passedIds.has(c.id));
              const overdue = assigned.filter((c) => c.dueDate && new Date(c.dueDate) < now2 && !passedIds.has(c.id));
              const teacherNames = [...new Set(assigned.map((c) => c.teacher))];
              const at = attempts.filter((a) => a.student === profile.key).slice().sort((x, y) => new Date(x.at) - new Date(y.at));
              const byDomain = {};
              at.forEach((a) => { const c = courses.find((x) => x.id === a.course); if (!c) return; byDomain[c.domain] = byDomain[c.domain] || { sum: 0, n: 0 }; byDomain[c.domain].sum += a.pct; byDomain[c.domain].n++; });
              const weakSkills = Object.entries(byDomain).map(([d, v]) => ({ d, avg: Math.round(v.sum / v.n) })).filter((x) => x.avg < 70).sort((a, b) => a.avg - b.avg);
              const myInterventions = interventions.filter((i) => i.studentKey === profile.key);
              return (
                <div>
                  <button className="btn" style={{ marginBottom: 14 }} onClick={() => setStudentProfileKey(null)}>→ رجوع للبحث</button>
                  <div className="card" style={{ padding: 18, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <h3>{profile.name}</h3>
                      <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 10, background: cl.bg, color: cl.tone, fontWeight: 700 }}>{cl.c}</span>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
                      <Stat label="الصف — البلوك" value={`${profile.grade} — ${profile.block}`} />
                      <Stat label="المعلمون" value={teacherNames.join("، ") || "—"} />
                      <Stat label="كورسات مكتملة" value={`${completed.length} / ${assigned.length}`} />
                      <Stat label="كورسات متأخرة" value={overdue.length} tone={overdue.length ? T.brick : T.green} />
                      <Stat label="عدد المحاولات" value={profile.attemptsCount} />
                      <Stat label="أعلى نتيجة" value={at.length ? Math.max(...at.map((a) => a.pct)) + "%" : "—"} />
                      <Stat label="آخر نتيجة" value={profile.lastAttemptAt ? at[at.length - 1]?.pct + "%" : "—"} />
                      <Stat label="آخر دخول" value={profile.lastAttemptAt ? dateAr(profile.lastAttemptAt) : "لم يدخل"} />
                    </div>
                    {weakSkills.length > 0 && <div style={{ marginTop: 12 }}><div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>مهارات ضعيفة (أقل من 70%)</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{weakSkills.map((w) => <span key={w.d} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: T.brickSoft, color: T.brick }}>{DOMAINS[w.d] || w.d} ({w.avg}%)</span>)}</div>
                    </div>}
                  </div>

                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>التدخلات والملاحظات السابقة ({myInterventions.length})</div>
                    {myInterventions.length === 0 && <p style={{ fontSize: 13, color: T.inkSoft }}>لا سجلّ بعد.</p>}
                    {myInterventions.map((i) => (
                      <div key={i.id} style={{ fontSize: 13, padding: 8, borderBottom: `1px solid ${T.ruleSoft}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{i.problem || i.action}</strong><span style={{ fontSize: 11, color: T.inkSoft }}>{dateAr(i.at)}</span></div>
                        <div style={{ color: T.inkSoft, fontSize: 12 }}>{i.action} — {i.responsible} — {i.status}</div>
                      </div>
                    ))}
                    <button className="btn btn-p" style={{ marginTop: 10 }} onClick={() => setInterventionFor({ studentKey: profile.key, studentName: profile.name })}>📋 إضافة خطة تدخل جديدة</button>
                  </div>
                </div>
              );
            })()}
            {interventionFor && (
              <InterventionModal target={interventionFor} courses={courses.filter((c) => c.status === "published")} actor={currentActor}
                onClose={() => setInterventionFor(null)}
                onSave={(rec) => { onAddIntervention({ studentKey: interventionFor.studentKey, studentName: interventionFor.studentName, ...rec }); setInterventionFor(null); }} />
            )}
          </div>
        );
      })()}

      {tab === "teachperf" && (() => {
        const rows = teachers.map((t) => {
          const myCourses = courses.filter((c) => c.teacher === t.name);
          const myPublished = myCourses.filter((c) => c.status === "published");
          const targetedStudents = new Set();
          myPublished.forEach((c) => students.filter((s) => +s.grade === +c.grade && (c.blocks || []).includes(s.block)).forEach((s) => targetedStudents.add(s.key)));
          const myAttempts = attempts.filter((a) => myCourses.some((c) => c.id === a.course));
          const completedStudents = new Set(myAttempts.filter((a) => a.passed).map((a) => a.student));
          const avgScore = myAttempts.length ? Math.round(myAttempts.reduce((s, a) => s + a.pct, 0) / myAttempts.length) : null;
          const myInterventions = interventions.filter((i) => i.responsible === t.name);
          const support = interventions.find((i) => i.teacherName === t.name);
          const myNewsletters = newsletters.filter((n) => n.teacherName === t.name && n.status === "published").sort((a,b)=>(b.publishedAt||"").localeCompare(a.publishedAt||""));
          const lastNewsletter = myNewsletters[0] || null;
          return { name: t.name, coursesCount: myCourses.length, studentsCount: targetedStudents.size,
            completionPct: targetedStudents.size ? Math.round((completedStudents.size / targetedStudents.size) * 100) : null,
            avgScore, interventionsCount: myInterventions.length, newslettersCount: myNewsletters.length, newsletters: myNewsletters, lastNewsletter, lastUpdate: myCourses.reduce((max, c) => c.publishedAt && (!max || c.publishedAt > max) ? c.publishedAt : max, null), support };
        });
        const avgLoad = rows.length ? Math.round(rows.reduce((n,r)=>n+r.studentsCount,0)/rows.length) : 0;
        return (
          <div>
            <div className="card" style={{padding:14,marginBottom:12,background:T.paper}}>
              <strong>⚖️ موازنة عبء المعلمين</strong>
              <div style={{fontSize:12,color:T.inkSoft,marginTop:4}}>متوسط العبء الحالي {avgLoad} طالبًا لكل معلم. التصنيف يقارن عدد طلاب المعلم بمتوسط القسم ولا ينقل أي طالب تلقائيًا.</div>
            </div>
            <p style={{ fontSize: 12, color: T.inkSoft, marginBottom: 12 }}>كل رقم محسوب من كورسات ومحاولات المعلم فعليًّا — لا تقييمًا يدويًّا.</p>
            <div style={{ display: "grid", gap: 10 }}>
              {rows.map((r) => (
                <div key={r.name} className="card" style={{ padding: 16 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",marginBottom:8 }}>
                    <div style={{ fontWeight: 700 }}>{r.name}</div>
                    <Chip tone={avgLoad && r.studentsCount>avgLoad*1.25?"r":avgLoad && r.studentsCount<avgLoad*.75?"a":"g"}>
                      {avgLoad && r.studentsCount>avgLoad*1.25?"عبء مرتفع":avgLoad && r.studentsCount<avgLoad*.75?"عبء منخفض":"متوازن"}
                    </Chip>
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", marginBottom: 10 }}>
                    <Stat label="الكورسات" value={r.coursesCount} />
                    <Stat label="الطلاب المتابَعون" value={r.studentsCount} />
                    <Stat label="نسبة الإكمال" value={r.completionPct != null ? r.completionPct + "%" : "—"} />
                    <Stat label="متوسط نتائج طلابه" value={r.avgScore != null ? r.avgScore + "%" : "—"} />
                    <Stat label="تدخلات مسجَّلة" value={r.interventionsCount} /><Stat label="النشرات المنشورة" value={r.newslettersCount} />
                  </div>
                  {r.lastNewsletter && <div style={{fontSize:12,color:T.inkSoft,marginBottom:10,padding:"8px 10px",background:T.paper,borderRadius:8}}>📰 آخر نشرة: {new Date(r.lastNewsletter.publishedAt).toLocaleString("ar-AE")} — الصف {r.lastNewsletter.grade} — {(r.lastNewsletter.blocks||[]).join("، ")} — الإرسال: {r.lastNewsletter.sendStats ? `${r.lastNewsletter.sendStats.studentSent}/${r.lastNewsletter.sendStats.studentTotal} طلاب · ${r.lastNewsletter.sendStats.parentSent}/${r.lastNewsletter.sendStats.parentTotal} أولياء أمور` : "—"}</div>}
                  {r.newsletters?.length>0 && <details style={{marginBottom:10}}><summary style={{cursor:"pointer",fontSize:12,fontWeight:700}}>🗂 سجل نشرات المعلم ({r.newsletters.length})</summary><div style={{marginTop:8,display:"grid",gap:6}}>{r.newsletters.slice(0,8).map(n=><div key={n.id} style={{fontSize:12,padding:"7px 9px",background:"#fff",border:`1px solid ${T.ruleSoft}`,borderRadius:8}}><strong>{new Date(n.publishedAt).toLocaleString("ar-AE")}</strong> — الصف {n.grade} — {(n.blocks||[]).join("، ")} <span style={{color:T.inkSoft}}>· الطلاب {n.sendStats?`${n.sendStats.studentSent}/${n.sendStats.studentTotal}`:"—"} · أولياء الأمور {n.sendStats?`${n.sendStats.parentSent}/${n.sendStats.parentTotal}`:"—"}</span></div>)}</div></details>}
                  <label style={{ fontSize: 12, fontWeight: 700 }}>الإجراء الداعم المطلوب من رئيس القسم</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input className="inp" placeholder="مثال: تدريب، موارد إضافية، مراجعة التخطيط، دعم تقني"
                      value={teacherSupportDraft[r.name] ?? r.support?.action ?? ""} onChange={(e) => setTeacherSupportDraft((p) => ({ ...p, [r.name]: e.target.value }))} />
                    <button className="btn" onClick={() => onAddIntervention({ teacherName: r.name, studentName: null, studentKey: null, problem: "دعم معلم", action: teacherSupportDraft[r.name] || "", responsible: currentActor, reviewDate: "" })}>حفظ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {tab === "skills" && (() => {
        const byDomain2 = {};
        courses.forEach((c) => { byDomain2[c.domain] = byDomain2[c.domain] || []; byDomain2[c.domain].push(c); });
        return (
          <div style={{ display: "grid", gap: 18 }}>
            {Object.entries(byDomain2).map(([domain, list]) => (
              <div key={domain}>
                <h3 style={{ marginBottom: 10 }}>{DOMAINS[domain] || domain}</h3>
                <div style={{ display: "grid", gap: 10 }}>
                  {list.map((c) => {
                    const targeted = students.filter((s) => +s.grade === +c.grade && (c.blocks || []).includes(s.block));
                    const cAttempts = attempts.filter((a) => a.course === c.id);
                    const started = new Set(cAttempts.map((a) => a.student)).size;
                    const completed = new Set(cAttempts.filter((a) => a.passed).map((a) => a.student)).size;
                    const avg = cAttempts.length ? Math.round(cAttempts.reduce((s, a) => s + a.pct, 0) / cAttempts.length) : null;
                    const qStats = {};
                    cAttempts.forEach((a) => (a.detail || []).forEach((d) => {
                      const key = d.sn ?? d.q; qStats[key] = qStats[key] || { q: d.q, fail: 0, total: 0 };
                      qStats[key].total++; if (!d.ok) qStats[key].fail++;
                    }));
                    const worstQ = Object.values(qStats).filter((x) => x.total >= 2).sort((a, b) => (b.fail / b.total) - (a.fail / a.total))[0];
                    const byTeacherClass = {};
                    cAttempts.forEach((a) => { const s = students.find((x) => x.key === a.student); if (!s) return;
                      const k = `${s.grade}-${s.block}`; byTeacherClass[k] = byTeacherClass[k] || { sum: 0, n: 0 }; byTeacherClass[k].sum += a.pct; byTeacherClass[k].n++; });
                    return (
                      <div key={c.id} className="card" style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <strong>{c.title}</strong><span style={{ fontSize: 12, color: T.inkSoft }}>{c.teacher} — الصف {c.grade}</span>
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", marginBottom: 8 }}>
                          <Stat label="مستهدَفون" value={targeted.length} />
                          <Stat label="بدأوا" value={started} />
                          <Stat label="أكملوا" value={completed} />
                          <Stat label="متوسط النتائج" value={avg != null ? avg + "%" : "—"} />
                        </div>
                        {worstQ && worstQ.fail > 0 && (
                          <p style={{ fontSize: 12, color: T.brick, marginBottom: 4 }}>⚠️ أكثر سؤال إخفاقًا: «{String(worstQ.q).slice(0, 80)}» — أخفق فيه {worstQ.fail} من {worstQ.total} ({Math.round(worstQ.fail / worstQ.total * 100)}%) — مهارة تحتاج إعادة تدريس.</p>
                        )}
                        {Object.keys(byTeacherClass).length > 0 && (
                          <div style={{ fontSize: 11, color: T.inkSoft }}>أداء كل صف: {Object.entries(byTeacherClass).map(([k, v]) => `${k}: ${Math.round(v.sum / v.n)}%`).join(" · ")}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {tab === "plans" && (() => {
        const rows=interventions.filter(i=>i.studentKey).map(i=>{const before=attempts.filter(a=>a.student===i.studentKey&&new Date(a.at)<new Date(i.at)).slice(-3);const after=attempts.filter(a=>a.student===i.studentKey&&new Date(a.at)>=new Date(i.at));const av=x=>x.length?Math.round(x.reduce((n,a)=>n+a.pct,0)/x.length):null;const beforeAvg=av(before),afterAvg=av(after);return {...i,beforeAvg,afterAvg,delta:beforeAvg!=null&&afterAvg!=null?afterAvg-beforeAvg:null}});
        const simCourse=courses.find(c=>c.id===simCourseId);
        const simTargets=studentRows.filter(st=>+st.grade===+simGrade && st.avg!=null && st.avg<simThreshold && (!simCourse || !attempts.some(a=>a.student===st.key&&a.course===simCourse.id&&a.passed)));
        return <div><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:12}}><div><h3>الخطط والتدخلات وقياس الأثر</h3><p style={{fontSize:12,color:T.inkSoft,margin:"4px 0 0"}}>الأثر محسوب من نتائج الطالب الفعلية: متوسط آخر 3 محاولات قبل التدخل مقابل المحاولات بعده.</p></div><Chip tone="g">{rows.filter(r=>r.delta!=null&&r.delta>0).length} تدخلًا ذا تحسن مقاس</Chip></div>
          <div className="card" style={{padding:16,marginBottom:14,background:T.paper}}>
            <h4 style={{marginBottom:8}}>🧪 محاكي القرار — ماذا لو؟</h4>
            <p style={{fontSize:12,color:T.inkSoft,marginTop:0}}>جرّب الخطة أولًا. لا يتغير أي سجل حتى تضغط «اعتماد التدخلات».</p>
            <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
              <select className="inp" value={simGrade} onChange={e=>setSimGrade(+e.target.value)}>{Array.from({length:13},(_,i)=><option key={i+1} value={i+1}>الصف {i+1}</option>)}</select>
              <select className="inp" value={simThreshold} onChange={e=>setSimThreshold(+e.target.value)}><option value={60}>أقل من 60%</option><option value={70}>أقل من 70%</option><option value={80}>أقل من 80%</option></select>
              <select className="inp" value={simCourseId} onChange={e=>setSimCourseId(e.target.value)}><option value="">بدون كورس محدد</option>{courses.filter(c=>c.status==="published"&&+c.grade===+simGrade).map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select>
              <div className="card" style={{padding:10,background:"#fff"}}><div style={{fontSize:11,color:T.inkSoft}}>الطلاب المستهدفون</div><div style={{fontSize:24,fontWeight:800}}>{simTargets.length}</div></div>
            </div>
            {simTargets.length>0&&<div style={{fontSize:12,color:T.inkSoft,marginTop:8}}>يشمل: {simTargets.slice(0,8).map(x=>x.name).join("، ")}{simTargets.length>8?"…":""}</div>}
            <button className="btn btn-p" style={{marginTop:10}} disabled={!simTargets.length} onClick={()=>{
              if(!window.confirm(`إنشاء خطة تدخل لـ ${simTargets.length} طالبًا؟`)) return;
              const review=new Date(Date.now()+14*86400000).toISOString().slice(0,10);
              simTargets.forEach(st=>onAddIntervention({studentKey:st.key,studentName:st.name,problem:`أداء أقل من ${simThreshold}%`,action:simCourse?`كورس علاجي — ${simCourse.title}`:"متابعة علاجية موجهة",responsible:currentActor,reviewDate:review}));
            }}>اعتماد التدخلات</button>
          </div>
          <div className="card" style={{overflow:"auto"}}><table className="tbl"><thead><tr><th>الطالب</th><th>المشكلة</th><th>الإجراء</th><th>قبل</th><th>بعد</th><th>أثر التدخل</th><th>المراجعة</th><th>الحالة</th></tr></thead><tbody>{rows.map(i=><tr key={i.id}><td>{i.studentName}</td><td>{i.problem}</td><td>{i.action}</td><td className="mono">{i.beforeAvg!=null?i.beforeAvg+"%":"—"}</td><td className="mono">{i.afterAvg!=null?i.afterAvg+"%":"—"}</td><td>{i.delta!=null?<Chip tone={i.delta>0?"g":i.delta<0?"r":"a"}>{i.delta>0?"+":""}{i.delta} نقطة</Chip>:<span style={{color:T.inkSoft}}>بانتظار بيانات بعد التدخل</span>}</td><td className="mono">{i.reviewDate||"—"}</td><td><select className="inp" style={{fontSize:11,padding:"2px 6px",width:"auto"}} value={i.status} onChange={e=>onUpdateIntervention(i.id,{status:e.target.value})}><option>مفتوح</option><option>قيد المتابعة</option><option>مكتمل</option></select></td></tr>)}{!rows.length&&<tr><td colSpan={8} style={{textAlign:"center",color:T.inkSoft,padding:20}}>لا خطط تدخل مسجلة بعد.</td></tr>}</tbody></table></div>
        </div>;
      })()}

      {tab === "reports" && (() => {
        const periodLabel = `${new Date(Date.now() - 7 * 86400000).toLocaleDateString("ar-AE")} — ${new Date().toLocaleDateString("ar-AE")}`;
        const strugglingNow = studentRows.filter((s) => classify(s).c === "أحمر" || classify(s).c === "رمادي");

        const weeklyRows = () => {
          const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.pct, 0) / attempts.length) : 0;
          return [["البند", "القيمة"], ["إجمالي الطلاب", students.length], ["إجمالي المحاولات", attempts.length],
            ["متوسط النتائج", avg + "%"], ["طلاب متعثرون حاليًّا", strugglingNow.length], ["شهادات صادرة", attempts.filter((a) => a.passed).length]];
        };
        const classRows = () => [["الصف — البلوك", "عدد الطلاب", "متوسط النتيجة"], ...Object.entries(byBlock).map(([k, v]) => [k, v.n, v.c ? Math.round(v.sum / v.c) + "%" : "—"])];
        const strugglingRows = () => [["الاسم", "الصف", "البلوك", "التصنيف", "متوسط النتيجة"], ...strugglingNow.map((s) => [s.name, s.grade, s.block, classify(s).c, s.avg != null ? s.avg + "%" : "—"])];
        const teacherRows = () => [["المعلم", "عدد الكورسات", "متوسط نتائج طلابه"], ...Object.entries(byTeacher).map(([t, v]) => [t, v.courses, v.attempts ? Math.round(v.sum / v.attempts) + "%" : "—"])];

        const toHTML = (rows) => `<table><tr>${rows[0].map((h) => `<th>${h}</th>`).join("")}</tr>${rows.slice(1).map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;

        const evidenceRows = () => {
          const avg = attempts.length ? Math.round(attempts.reduce((s,a)=>s+a.pct,0)/attempts.length) : 0;
          const completedInterventions = interventions.filter(i=>i.status==="مكتمل").length;
          return [["دليل القسم","القيمة"],["إجمالي الطلاب",students.length],["المعلمون",teachers.length],["الكورسات",courses.length],["الكورسات المنشورة",courses.filter(c=>c.status==="published").length],["المحاولات",attempts.length],["متوسط التحصيل",avg+"%"],["الشهادات",attempts.filter(a=>a.passed).length],["خطط التدخل",interventions.filter(i=>i.studentKey).length],["تدخلات مكتملة",completedInterventions],["تاريخ التقرير",new Date().toLocaleString("ar-AE")]];
        };
        const REPORTS = [
          { key: "evidence", title: "حزمة أدلة القسم — Evidence Pack", rows: evidenceRows },
          { key: "weekly", title: "تقرير أسبوعي لرئيس القسم", rows: weeklyRows },
          { key: "class", title: "تقرير أداء الصفوف", rows: classRows },
          { key: "struggling", title: "تقرير الطلاب المتعثرين", rows: strugglingRows },
          { key: "teacher", title: "تقرير أداء المعلمين", rows: teacherRows },
        ];

        return (
          <div>
            <p style={{ fontSize: 12, color: T.inkSoft, marginBottom: 14 }}>4 تقارير جاهزة ببيانات حقيقية حيّة. "تنزيل Excel" ملف حقيقي فورًا؛ "طباعة / PDF" يفتح نافذة طباعة — اختر "حفظ كـ PDF" من مربّع الطباعة.</p>
            <div style={{ display: "grid", gap: 10 }}>
              {REPORTS.map((r) => (
                <div key={r.key} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <strong>{r.title}</strong>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" onClick={() => downloadXLSXReport(`${r.title}.xlsx`, r.title, r.rows())}>⬇ تنزيل Excel</button>
                    <button className="btn btn-p" onClick={() => printReport(r.title, periodLabel, toHTML(r.rows()))}>🖨 طباعة / PDF</button>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: T.inkSoft, marginTop: 14 }}>ملاحظة صدق: التقارير هنا 4 من أصل 10 نوع طُلبت — الأكثر استعمالًا يوميًّا. الرسوم البيانية والشعار الرسومي للمدرسة غير مضمَّنين في نسخة الطباعة حاليًّا (نص اسم المدرسة موجود، لا صورة الشعار).</p>
          </div>
        );
      })()}

      {tab === "o" && (<div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
        <Stat label="إجمالي الطلاب" value={students.length} /><Stat label="المعلمون" value={teachers.length} />
        <Stat label="الكورسات" value={courses.length} /><Stat label="المنشورة" value={courses.filter((c) => c.status === "published").length} />
        <Stat label="إجمالي المحاولات" value={attempts.length} />
        <Stat label="نسبة النجاح العامة" value={attempts.length ? Math.round(attempts.filter((a) => a.passed).length / attempts.length * 100) + "%" : "—"} />
      </div>)}

      {tab === "cmp" && (<div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
        <div className="card" style={{ padding: 20 }}><h3 style={{ marginBottom: 10 }}>متوسط الأداء حسب الصف</h3>
          {Object.entries(byGrade).sort((a, b) => +a[0] - +b[0]).map(([g, v]) => (<div key={g} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>الصف {g} ({v.n} طالب)</span><span className="mono">{v.c ? Math.round(v.sum / v.c) + "%" : "—"}</span></div>
            <Bar pct={v.c ? v.sum / v.c : 0} /></div>))}</div>
        <div className="card" style={{ padding: 20 }}><h3 style={{ marginBottom: 10 }}>متوسط الأداء حسب البلوك</h3>
          {Object.entries(byBlock).map(([k, v]) => (<div key={k} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{k.replace("-", " — ")} ({v.n})</span><span className="mono">{v.c ? Math.round(v.sum / v.c) + "%" : "—"}</span></div>
            <Bar pct={v.c ? v.sum / v.c : 0} tone={T.gold} /></div>))}</div>
        <div className="card" style={{ padding: 20 }}><h3 style={{ marginBottom: 10 }}>مقارنة المعلمين</h3>
          {Object.entries(byTeacher).map(([t, v]) => (<div key={t} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{t} — {v.courses} كورس</span><span className="mono">{v.attempts ? Math.round(v.sum / v.attempts) + "%" : "—"}</span></div>
            <Bar pct={v.attempts ? v.sum / v.attempts : 0} tone={T.green} /></div>))}</div>
        <div className="card" style={{ padding: 20, gridColumn: "1 / -1" }}><h3 style={{ marginBottom: 10 }}>مقارنة تقدّم كل طالب وأضعف مهارة لديه</h3>
          <Locked title="مقارنة الطلاب الفردية" note="ترتيب كل طلاب المدرسة بالاسم — بيانات حساسة.">
            <CompareChart rows={studentRows} attempts={attempts} />
          </Locked>
        </div>
      </div>)}

      {tab === "an" && (<Locked title="تحليل صف أو طالب" note="بيانات فردية بالاسم — لا تُعرض إلا بضغطة صريحة.">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))" }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 10 }}>تحليل صف أو بلوك بعد تخصيصه</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              <select className="inp" style={{ maxWidth: 200 }} value={analysisGrade} onChange={(e) => setAnalysisGrade(e.target.value)}>
                <option value="all">كل الصفوف</option>
                {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => <option key={g} value={g}>الصف {g}</option>)}
              </select>
              <select className="inp" style={{ maxWidth: 200 }} value={analysisBlock} onChange={(e) => setAnalysisBlock(e.target.value)}>
                <option value="all">كل البلوكات</option>
                {DEFAULT_BLOCKS.map((b) => <option key={b} value={b}>بلوك {b}</option>)}
              </select>
            </div>
            {(() => {
              const rows = studentRows
                .filter((s) => analysisGrade === "all" || s.grade === +analysisGrade)
                .filter((s) => analysisBlock === "all" || s.block === analysisBlock);
              const classAttempts = attempts.filter((a) => rows.some((s) => s.key === a.student));
              const withAvg = rows.filter((r) => r.avg !== null);
              const classAvg = withAvg.length ? Math.round(withAvg.reduce((x, r) => x + r.avg, 0) / withAvg.length) : null;
              const gm = {};
              classAttempts.forEach((a) => a.detail.forEach((d) => { gm[d.sn] = gm[d.sn] || { c: 0, t: 0 }; gm[d.sn].t++; if (d.ok) gm[d.sn].c++; }));
              const gaps = Object.entries(gm).map(([k, v]) => ({ k, pct: Math.round(v.c / v.t * 100) })).sort((a, b) => a.pct - b.pct);
              return (<>
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", marginBottom: 16 }}>
                  <Stat label="عدد الطلاب" value={rows.length} />
                  <Stat label="متوسط الصف" value={classAvg === null ? "—" : classAvg + "%"} tone={classAvg === null ? T.ink : classAvg < 60 ? T.brick : classAvg < 75 ? T.gold : T.green} />
                  <Stat label="المحاولات" value={classAttempts.length} />
                </div>
                <h4 style={{ marginBottom: 8 }}>أضعف المهارات في هذا الصف</h4>
                {gaps.length === 0 ? <p style={{ color: T.inkSoft, fontSize: 13 }}>لا بيانات كافية بعد.</p> : gaps.slice(0, 6).map((g) => (
                  <div key={g.k} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>{g.k}</span><span className="mono">{g.pct}%</span></div>
                    <Bar pct={g.pct} tone={g.pct < 60 ? T.brick : g.pct < 75 ? T.gold : T.green} /></div>))}
                <h4 style={{ margin: "16px 0 8px" }}>طلاب هذا الصف</h4>
                {rows.map((r) => (<div key={r.key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.ruleSoft}`, fontSize: 13 }}>
                  <span>{r.name} — {r.block}</span><span className="mono">{r.avg === null ? "—" : r.avg + "%"}</span></div>))}
                {analysisGrade !== "all" && (() => {
                  const classCourses = courses.filter((c) => c.status === "published" && c.grade === +analysisGrade);
                  const trackerItems = classCourses.map((c) => {
                    const done = rows.filter((r) => attempts.some((a) => a.student === r.key && a.course === c.id && a.passed)).length;
                    const started = rows.filter((r) => (progress[pKey(r.key, c.id)] || { done: [] }).done.length > 0).length;
                    const pct = rows.length ? Math.round((done / rows.length) * 100) : 0;
                    return { id: c.id, title: c.title, pct, status: done === rows.length && rows.length > 0 ? "done" : started > 0 ? "progress" : "notstarted" };
                  });
                  return (<>
                    <h4 style={{ margin: "16px 0 8px" }}>خط تتبّع كورسات الصف — نسبة إتمام كل كورس</h4>
                    <CourseTracker items={trackerItems} />
                  </>);
                })()}
              </>);
            })()}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 10 }}>تحليل طالب بعد فلترة الاسم</h3>
            <input className="inp" style={{ marginBottom: 10 }} value={studentSearch} onChange={(e) => { setStudentSearch(e.target.value); setSelectedStudentKey(null); }} placeholder="اكتب اسم الطالب أو جزءًا منه" />
            {studentSearch.trim() && (
              <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 14 }}>
                {students.filter((s) => s.name.includes(studentSearch.trim())).map((s) => (
                  <button key={s.key} className="opt" style={{ marginBottom: 4 }} data-on={selectedStudentKey === s.key ? "1" : "0"} onClick={() => setSelectedStudentKey(s.key)}>
                    {s.name} — الصف {s.grade} / {s.block}</button>))}
                {students.filter((s) => s.name.includes(studentSearch.trim())).length === 0 && <p style={{ color: T.inkSoft, fontSize: 13 }}>لا نتائج مطابقة.</p>}
              </div>
            )}
            {selectedStudentKey && (() => {
              const s = students.find((x) => x.key === selectedStudentKey);
              return s ? <StudentDetailCard student={s} courses={courses} progress={progress} attempts={attempts} /> : null;
            })()}
          </div>
        </div>
      </Locked>)}

      {tab === "u" && (<div style={{ display:"grid", gap:16 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:14}}>
            <div><h3>المعلمون والصلاحيات</h3><p style={{margin:"4px 0 0",fontSize:12,color:T.inkSoft}}>إضافة المعلمين، تعديل بياناتهم، تفعيل الحساب، وتخصيص رمز دخول لكل معلم مع بقاء الرمز العام احتياطيًا.</p></div>
            <Chip tone="g">{teachers.filter(t=>t.active).length} مفعّل من {teachers.length}</Chip>
          </div>
          <div className="card" style={{padding:14,background:T.paper,marginBottom:16}}>
            <h4 style={{marginBottom:10}}>➕ إضافة معلم جديد</h4>
            <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))"}}>
              <input className="inp" placeholder="اسم المعلم" value={teacherForm.name} onChange={e=>setTeacherForm({...teacherForm,name:e.target.value})}/>
              <input className="inp mono" type="email" placeholder="البريد الإلكتروني" value={teacherForm.email} onChange={e=>setTeacherForm({...teacherForm,email:e.target.value})}/>
              <input className="inp mono" placeholder="رمز دخول خاص (اختياري)" value={teacherForm.code} onChange={e=>setTeacherForm({...teacherForm,code:e.target.value})}/>
              <button className="btn btn-p" onClick={()=>{ const name=teacherForm.name.trim(); if(!name) return alert("اكتب اسم المعلم."); onAddTeacher({name,email:teacherForm.email.trim(),code:teacherForm.code.trim()}); setTeacherForm({name:"",email:"",code:""}); }}>إضافة المعلم</button>
            </div>
          </div>
          <Locked title="حسابات المعلمين" note="تغيير حالة الحساب أو حذف معلم إجراء إداري حساس.">
          {teachers.length===0?<p style={{color:T.inkSoft}}>لا يوجد معلمون مسجلون بعد.</p>:<div style={{overflowX:"auto"}}><table className="tbl"><thead><tr><th>المعلم</th><th>الكورسات</th><th>البريد</th><th>رمز الدخول</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>
            {teachers.map(t=><tr key={t.name}><td style={{fontWeight:700}}>{t.name}</td><td>{courses.filter(c=>c.teacher===t.name).length}</td>
              <td>{editEmailFor===t.name?<div style={{display:"flex",gap:6}}><input className="inp mono" value={teacherEmailDraft} onChange={e=>setTeacherEmailDraft(e.target.value)}/><button className="btn btn-q" onClick={()=>{onSetTeacherEmail(t.name,teacherEmailDraft.trim());setEditEmailFor(null)}}>حفظ</button></div>:<span style={{display:"flex",gap:6,alignItems:"center"}}>{t.email||"—"}<button className="btn btn-q" onClick={()=>{setEditEmailFor(t.name);setTeacherEmailDraft(t.email||"")}}>تعديل</button></span>}</td>
              <td>{teacherCodeFor===t.name?<div style={{display:"flex",gap:6}}><input className="inp mono" value={teacherCodeDraft} onChange={e=>setTeacherCodeDraft(e.target.value)} placeholder={codes.teacher}/><button className="btn btn-q" onClick={()=>{onSetTeacherCode(t.name,teacherCodeDraft.trim());setTeacherCodeFor(null);setTeacherCodeDraft("")}}>حفظ</button></div>:<button className="btn btn-q" onClick={()=>{setTeacherCodeFor(t.name);setTeacherCodeDraft(t.code||"")}}>{t.code?"تغيير الرمز":"تخصيص رمز"}</button>}</td>
              <td>{t.active?<Chip tone="g">مفعّل</Chip>:<Chip tone="r">معطّل</Chip>}</td>
              <td><div style={{display:"flex",gap:6,alignItems:"center"}}><Switch on={t.active} onClick={()=>onToggleTeacher(t.name)}/><button className="btn btn-q" style={{color:T.brick}} onClick={()=>{const linked=courses.filter(c=>c.teacher===t.name).length; const msg=linked?`لدى هذا المعلم ${linked} كورس/كورسات مرتبطة. الحذف سيزيل حساب المعلم فقط ولن يحذف الكورسات. هل تريد المتابعة؟`:"حذف حساب المعلم؟"; if(window.confirm(msg))onDeleteTeacher(t.name)}}>حذف</button></div></td>
            </tr>)}
          </tbody></table></div>}
          </Locked>
        </div>
      </div>)}

      {tab === "b" && (<div style={{display:"grid",gap:16}}>
        <div className="card" style={{padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:14}}>
            <div><h3>إدارة الصفوف والبلوكات</h3><p style={{margin:"4px 0 0",fontSize:12,color:T.inkSoft}}>اعرض بلوكات أي صف عند الحاجة فقط، وأنشئ مجموعات لاستخدامها لاحقًا في الإسناد والتقارير.</p></div>
            <Chip>{Object.values(blockGroups||{}).reduce((n,a)=>n+(Array.isArray(a)?a.length:0),0)} مجموعة محفوظة</Chip>
          </div>
          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>
            {Array.from({length:13},(_,i)=>i+1).map(g=>{const blocks=blocksAdmin[g]||DEFAULT_BLOCKS;const groups=(blockGroups&&blockGroups[g])||[];const stCount=students.filter(st=>+st.grade===+g).length;return <div key={g} className="card" style={{padding:14,background:"#fff"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><div><strong>الصف {g}</strong><div style={{fontSize:11,color:T.inkSoft}}>{stCount} طالب · {blocks.length} بلوك · {groups.length} مجموعة</div></div><button className="btn btn-q" onClick={()=>setOpenGradeBlocks(openGradeBlocks===g?null:g)}>{openGradeBlocks===g?"إخفاء":"عرض البلوكات"}</button></div>
              {openGradeBlocks===g&&<div style={{marginTop:12}}><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{blocks.map(b=><Chip key={b}>{b} <span style={{cursor:"pointer",marginRight:4}} onClick={()=>onRemoveBlock(g,b)}>×</span></Chip>)}</div>
                <button className="btn btn-q" onClick={()=>{const n=prompt(`اسم البلوك الجديد للصف ${g}`);if(n)onAddBlock(g,n.trim())}}>+ بلوك</button>
                {groups.length>0&&<div style={{marginTop:12,borderTop:`1px solid ${T.ruleSoft}`,paddingTop:10}}><div style={{fontSize:12,fontWeight:700,marginBottom:6}}>مجموعات البلوكات</div>{groups.map(gr=><div key={gr.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"5px 0"}}><span><strong>{gr.name}</strong> · {(gr.blocks||[]).join("، ")}</span><button className="btn btn-q" style={{color:T.brick}} onClick={()=>onDeleteBlockGroup(g,gr.id)}>حذف</button></div>)}</div>}
              </div>}
            </div>})}
          </div>
        </div>
        <div className="card" style={{padding:20}}><h3 style={{marginBottom:10}}>➕ إنشاء مجموعة بلوكات</h3>
          <div className="grid" style={{gridTemplateColumns:"160px minmax(220px,1fr)"}}><select className="inp" value={groupDraft.grade} onChange={e=>setGroupDraft({grade:+e.target.value,name:"",blocks:[]})}>{Array.from({length:13},(_,i)=><option key={i+1} value={i+1}>الصف {i+1}</option>)}</select><input className="inp" placeholder="اسم المجموعة، مثال: A إلى E" value={groupDraft.name} onChange={e=>setGroupDraft({...groupDraft,name:e.target.value})}/></div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",margin:"12px 0"}}>{(blocksAdmin[groupDraft.grade]||DEFAULT_BLOCKS).map(b=>{const on=groupDraft.blocks.includes(b);return <button key={b} className="btn btn-q" style={{background:on?T.greenSoft:T.paper,color:on?T.green:T.inkSoft,border:`1px solid ${on?T.green:T.rule}`}} onClick={()=>setGroupDraft({...groupDraft,blocks:on?groupDraft.blocks.filter(x=>x!==b):[...groupDraft.blocks,b]})}>{on?"✓ ":""}{b}</button>})}</div>
          <button className="btn btn-p" onClick={()=>{if(!groupDraft.name.trim()||groupDraft.blocks.length<2)return alert("اكتب اسم المجموعة واختر بلوكين على الأقل.");onSaveBlockGroup(groupDraft.grade,{id:"bg-"+uid(),name:groupDraft.name.trim(),blocks:groupDraft.blocks});setGroupDraft({...groupDraft,name:"",blocks:[]})}}>حفظ المجموعة</button>
        </div>
      </div>)}

      {tab === "c" && (() => {
        const publishedCount=courses.filter(c=>c.status==="published").length, draftCount=courses.filter(c=>c.status!=="published"&&c.status!=="archived").length, archivedCount=courses.filter(c=>c.status==="archived").length;
        const certCount=attempts.filter(a=>a.passed).length; const byGradeCourses={}; courses.forEach(c=>{byGradeCourses[c.grade]=(byGradeCourses[c.grade]||0)+1}); const maxGradeCount=Math.max(1,...Object.values(byGradeCourses));
        return <div style={{display:"grid",gap:16}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><h3>مركز الكورسات والمهارات</h3><p style={{fontSize:12,color:T.inkSoft,margin:"4px 0 0"}}>إنشاء، مراجعة، تحسين بالذكاء الاصطناعي، نشر وتحليل الكورسات من مكان واحد.</p></div><button className="btn btn-p" onClick={onGenerateCourse}>✨ توليد كورس بالذكاء الاصطناعي</button></div>
          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))"}}><Stat label="إجمالي الكورسات" value={courses.length}/><Stat label="منشورة" value={publishedCount} tone={T.green}/><Stat label="مسودات" value={draftCount} tone={T.gold}/><Stat label="مؤرشفة" value={archivedCount}/><Stat label="شهادات صادرة" value={certCount} tone={T.green}/></div>
          <div className="card" style={{padding:16}}><h4 style={{marginBottom:10}}>توزيع الكورسات حسب الصف</h4>{Object.keys(byGradeCourses).length===0?<p style={{color:T.inkSoft}}>لا توجد كورسات بعد.</p>:<div style={{display:"grid",gap:8}}>{Object.entries(byGradeCourses).sort((a,b)=>+a[0]-+b[0]).map(([g,n])=><div key={g} style={{display:"grid",gridTemplateColumns:"80px 1fr 44px",gap:8,alignItems:"center"}}><span>الصف {g}</span><div className="inkbar"><i style={{width:`${Math.round(n/maxGradeCount*100)}%`,background:n>=maxGradeCount*.66?T.green:n>=maxGradeCount*.33?T.gold:T.brick}}/></div><strong>{n}</strong></div>)}</div>}</div>
          <div className="grid">{courses.map(c=>{const q=courseQuality(c);const cAttempts=attempts.filter(a=>a.course===c.id);const avg=cAttempts.length?Math.round(cAttempts.reduce((n,a)=>n+a.pct,0)/cAttempts.length):null;const passed=new Set(cAttempts.filter(a=>a.passed).map(a=>a.student)).size;return <div key={c.id} className="card" style={{padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div style={{flex:1,minWidth:240}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><h4>{c.title}</h4>{c.status==="published"?<Chip tone="g">منشور</Chip>:c.status==="archived"?<Chip>مؤرشف</Chip>:<Chip tone="a">مسودة</Chip>}<Chip tone={q.score>=80?"g":q.score>=60?"a":"r"}>جودة {q.score}/100</Chip></div>
              <div style={{fontSize:12,color:T.inkSoft,marginTop:4}}>المعلم: {c.teacher} · الصف {c.grade} · {DOMAINS[c.domain]} · {q.cleanCount} سؤالًا صالحًا · {q.stageCount} وحدات</div>
              <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(105px,1fr))",marginTop:10}}><Stat label="المحاولات" value={cAttempts.length}/><Stat label="نجحوا" value={passed}/><Stat label="متوسط النتيجة" value={avg!=null?avg+"%":"—"}/><Stat label="تكرارات مكتشفة" value={q.duplicateCount} tone={q.duplicateCount?T.brick:T.green}/></div>
              {q.duplicateCount>0&&<p style={{fontSize:12,color:T.brick,margin:"8px 0 0"}}>⚠️ بوابة الجودة اكتشفت {q.duplicateCount} سؤالًا مكررًا أو متعارضًا مع سؤال داخل الشرح؛ لن تدخل هذه التكرارات في اختبار الطالب.</p>}
            </div><div style={{display:"flex",gap:6,alignItems:"flex-start",flexWrap:"wrap"}}><button className="btn btn-q" onClick={()=>onAIEditCourse(c.id)}>🤖 تعديل بالذكاء الاصطناعي</button>{c.status!=="published"&&<button className="btn btn-q" onClick={()=>setAdminPublishOpen(adminPublishOpen===c.id?null:c.id)}>{adminPublishOpen===c.id?"إغلاق":"نشر"}</button>}{c.status==="published"&&<button className="btn btn-q" onClick={()=>onArchiveAny(c.id)}>أرشفة</button>}<button className="btn btn-q" style={{color:T.brick}} onClick={()=>onDeleteCourse(c.id)}>حذف</button></div></div>
            {adminPublishOpen===c.id&&<PublishPanel course={c} students={students} onClose={()=>setAdminPublishOpen(null)} onPublish={patch=>{onPublishWithDetails(c.id,patch);setAdminPublishOpen(null)}}/>}
          </div>})}</div>
        </div>
      })()}

      {tab === "log" && (<div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 12 }}>سجل العمليات</h3>
        <Locked title="سجل النشاط" note="من فعل ماذا ومتى — بيانات تخصّ حسابات المعلمين والإدارة.">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}><button className="btn btn-o" onClick={onExportAudit}>تصدير السجل CSV</button></div>
        {audit.length === 0 ? <p style={{ color: T.inkSoft }}>لا عمليات مسجَّلة بعد.</p> : (
          <table className="tbl"><thead><tr><th>الوقت</th><th>الفاعل</th><th>العملية</th><th>التفاصيل</th></tr></thead>
            <tbody>{[...audit].reverse().slice(0, 100).map((a, i) => (<tr key={i}><td style={{ fontSize: 12, color: T.inkSoft }}>{dateAr(a.at)}</td><td>{a.actor}</td><td>{a.action}</td><td style={{ fontSize: 12 }}>{a.detail}</td></tr>))}</tbody></table>)}
        </Locked>
      </div>)}

      {tab === "io" && (<div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
        <Locked title="استيراد وتصدير بيانات الطلاب" note="ملفات تحتوي أسماء وأرقامًا تعريفية لجميع الطلاب.">
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 10 }}>تصدير بيانات الطلاب والنتائج</h3>
          <button className="btn btn-p" onClick={onExportStudents}>تنزيل CSV كامل</button>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 10 }}>استيراد قائمة طلاب</h3>
          <p style={{ fontSize: 12, color: T.inkSoft }}>الصق بيانات CSV بالأعمدة: name,school_id,grade,block,stream,teacher_email,student_email,parent_email — سطر لكل طالب.</p>
          <textarea className="tarea" rows={5} value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="سالم أحمد الكعبي,123456,7,A,A,teacher@school.ae,student@school.ae,parent@example.com" />
          <button className="btn btn-o" style={{ marginTop: 8 }} onClick={() => onImportStudents(csvText)}>استيراد</button>
        </div>
        </Locked>
      </div>)}

      {tab === "sec" && (<div className="card" style={{ padding: 20, maxWidth: 520 }}>
        <h3 style={{ marginBottom: 6 }}>رمزا الدخول</h3>
        <p style={{ fontSize: 13, color: T.inkSoft, marginTop: 0 }}>
          أنت وحدك من يحدّد من يدخل كمعلم أو كإدارة. غيّر الرمزين هنا وأبلغ من تثق بهم فقط —
          لا حاجة لأي تعديل في الكود، والتغيير يسري فورًا على كل من يفتح المنصة بعده.
        </p>
        <Locked title="تغيير رمزَي الدخول" note="إجراء حسّاس: يغيّر من يستطيع الدخول كمعلم أو كإدارة فورًا.">
        <div className="grid">
          <div><label className="lbl">رمز دخول المعلم الجديد</label>
            <input className="inp mono" value={newTeacherCode} onChange={(e) => setNewTeacherCode(e.target.value)} placeholder={codes.teacher} /></div>
          <div><label className="lbl">رمز دخول الإدارة الجديد</label>
            <input className="inp mono" value={newAdminCode} onChange={(e) => setNewAdminCode(e.target.value)} placeholder={codes.admin} /></div>
          {codeMsg && <div style={{ color: T.green, fontSize: 13 }}>{codeMsg}</div>}
          <button className="btn btn-p" onClick={() => {
            const next = { teacher: newTeacherCode.trim() || codes.teacher, admin: newAdminCode.trim() || codes.admin };
            onUpdateCodes(next); setNewTeacherCode(""); setNewAdminCode(""); setCodeMsg("تم تحديث الرمزين. أبلغ المعلمين المعنيين بالرمز الجديد يدويًا.");
          }}>حفظ الرمزين الجديدين</button>
        </div>
        </Locked>
        <p style={{ fontSize: 12, color: T.inkSoft, marginTop: 16 }}>
          هذا يضبط <strong>من يدخل وظائف المنصة</strong> (لوحة المعلم ووحدة الإدارة). أما <strong>مصدر برمجة المنصة</strong> نفسه (كود React) فيُتحكَّم فيه من إعدادات المشاركة في Claude.ai — عند نشر هذا كمُصنَّف (Artifact) اختر مشاركة رابط "عرض" لا رابط "نسخ" أو "تعديل"، فلا يستطيع أحد غيرك فتح الكود المصدري أو تحويره، مهما دخل المنصة بنفسه.
        </p>
      </div>)}

      {tab === "sec" && (<div className="card" style={{ padding: 20, maxWidth: 520, marginTop: 16 }}>
        <h3 style={{ marginBottom: 6 }}>بريد رئيس القسم للإشعارات التلقائية</h3>
        <p style={{ fontSize: 13, color: T.inkSoft, marginTop: 0 }}>
          يصل إلى هذا البريد إشعار عند نشر أي كورس جديد، وعند إتمام أي طالب لكورس بنجاح.
        </p>
        <div className="grid">
          <input className="inp" type="email" value={newOrgEmail} onChange={(e) => setNewOrgEmail(e.target.value)} placeholder="head@school.ae" />
          {orgEmailMsg && <div style={{ color: T.green, fontSize: 13 }}>{orgEmailMsg}</div>}
          <button className="btn btn-p" onClick={() => { onUpdateOrgEmail(newOrgEmail.trim()); setOrgEmailMsg("تم الحفظ."); }}>حفظ البريد</button>
        </div>
        <p style={{ fontSize: 12, color: T.inkSoft, marginTop: 12 }}>
          الإرسال الفعلي يتطلب ضبط <span className="mono">RESEND_API_KEY</span> في متغيرات بيئة الخادم — راجع README. بلا هذا المفتاح، كل شيء آخر في المنصة يعمل بلا تأثر.
        </p>
      </div>)}
      </div>
      <footer className="adm-footer">
        <div style={{position:"relative",zIndex:1,fontSize:11}}>آخر تحديث: {new Date().toLocaleString("ar-AE")}</div>
        <div className="adm-footer-main">
          <div className="adm-footer-tag">نزدهر • ننجح • ننمو</div>
          <div style={{opacity:.72}}>GEMS Founders School Dubai — Inspiring Minds, Empowering Futures</div>
        </div>
        <div style={{position:"relative",zIndex:1,fontSize:11}}>لوحة قيادة قسم اللغة العربية</div>
      </footer>
    </div>
  );
}

/* ==================== بوابة ولي الأمر ==================== */
function ParentPortal({ report, newsletters = [], onBack, orgEmail = "" }) {
  if (!report) return null;
  const { student, rows = [] } = report;
  const [tab, setTab] = useState("overview");
  const [contactSubject, setContactSubject] = useState("متابعة تقدم ابني");
  const [contactMessage, setContactMessage] = useState("");
  const [supportType, setSupportType] = useState("ضعف أكاديمي");
  const [supportNote, setSupportNote] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const allHistory = rows.flatMap((r) => (r.history || []).map((h) => ({ ...h, title: r.title })))
    .filter((x) => x.at).sort((a, b) => new Date(a.at) - new Date(b.at));
  const scored = rows.filter((r) => r.bestScore != null);
  const avg = scored.length ? Math.round(scored.reduce((sum, r) => sum + r.bestScore, 0) / scored.length) : null;
  const completed = rows.filter((r) => r.completed).length;
  const started = rows.filter((r) => r.started).length;
  const certificates = rows.filter((r) => r.certificateToken).length;
  const completionPct = rows.length ? Math.round(completed / rows.length * 100) : 0;
  const latestActivity = [...allHistory].sort((a, b) => new Date(b.at) - new Date(a.at));
  const allStrong = rows.flatMap((r) => r.strong || []);
  const allWeak = rows.flatMap((r) => r.weak || []);
  const rankSkills = (arr) => Object.entries(arr.reduce((m, x) => { m[x] = (m[x] || 0) + 1; return m; }, {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));
  const strongSkills = rankSkills(allStrong), weakSkills = rankSkills(allWeak);
  const status = avg == null ? { label: "بانتظار بيانات", color: T.inkSoft, bg: T.paper } : avg >= 80 ? { label: "مستقر ومتقدم", color: T.green, bg: T.greenSoft } : avg >= 60 ? { label: "يحتاج متابعة", color: T.gold, bg: T.goldSoft } : { label: "يحتاج تدخل", color: T.brick, bg: T.brickSoft };
  const trendPoints = allHistory.slice(-8).map((h) => ({ v: h.pct, label: new Date(h.at).toLocaleDateString("ar-AE", { day: "numeric", month: "numeric" }) }));
  const teacherEmail = normEmail(student.teacherEmail || "");
  const parentNews = newsletters.filter(n=>n.status==="published" && +n.grade===+student.grade && (n.blocks||[]).includes(student.block)).sort((a,b)=>(b.publishedAt||"").localeCompare(a.publishedAt||""));
  const [parentNewsId,setParentNewsId]=useState(parentNews[0]?.id||null);
  const activeParentNews=parentNews.find(n=>n.id===parentNewsId)||parentNews[0]||null;

  const sendContact = async (kind) => {
    const note = kind === "support" ? supportNote.trim() : contactMessage.trim();
    if (!note) return setMsg("اكتب الرسالة أولًا.");
    const recipients = [teacherEmail, normEmail(orgEmail)].filter(Boolean);
    if (!recipients.length) return setMsg("لا يوجد بريد للمعلم أو رئيس القسم مسجل حاليًا.");
    setSending(true); setMsg("");
    const subject = kind === "support" ? `طلب دعم للطالب ${student.name} — ${supportType}` : `${contactSubject} — ${student.name}`;
    const body = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9"><p>السلام عليكم،</p><p>رسالة من ولي أمر الطالب <strong>${student.name}</strong> (الصف ${student.grade} — ${student.block}).</p>${kind === "support" ? `<p><strong>نوع طلب الدعم:</strong> ${supportType}</p>` : ""}<p>${note.replace(/\n/g, "<br>")}</p><p style="font-size:12px;color:#667085">أُرسلت هذه الرسالة من بوابة متابعة ولي الأمر في منصة بالعربي أحلى.</p></div>`;
    try {
      await notifyEmail(recipients, subject, body);
      const entry = { at: new Date().toISOString(), actor: `ولي أمر — ${student.name}`, action: kind === "support" ? "طلب دعم" : "تواصل مع المعلم", detail: `${supportType}${kind === "support" ? " — " : ""}${note}` };
      await putRecord(REC.audit, `${entry.at}-${uid()}`, entry);
      setMsg(kind === "support" ? "✅ تم إرسال طلب الدعم للمعلم ورئيس القسم." : "✅ تم إرسال رسالتك للمعلم.");
      if (kind === "support") setSupportNote(""); else setContactMessage("");
    } catch (e) { setMsg("تعذّر الإرسال الآن. حاول مرة أخرى لاحقًا."); }
    setSending(false);
  };

  const tabs = [["overview", "🏠 نظرة عامة"], ["newsletter", "📰 النشرة الأسبوعية"], ["courses", "📚 الكورسات"], ["skills", "🎯 نقاط القوة والدعم"], ["activity", "🕘 آخر النشاط"], ["contact", "✉️ التواصل والدعم"]];

  return (
    <div className="gfs"><style>{CSS}</style>
      <section className="adm-hero">
        <img src={LOGO_URL} alt="" aria-hidden="true" className="adm-lion" />
        <div className="adm-hero-row">
          <div className="adm-brand">
            <div className="logo-chip lg"><img src={LOGO_URL} alt="GEMS Founders School" /></div>
            <div><div className="adm-hero-title">بوابة متابعة تقدم الطالب</div><div className="adm-hero-sub">بالعربي أحلى — قسم اللغة العربية | متابعة واضحة، تواصل مباشر، ودعم مبكر</div></div>
          </div>
          <div className="adm-actor"><div className="adm-avatar">👨‍👩‍👧</div><div><strong>ولي الأمر</strong><div className="adm-hero-sub">متابعة {student.name}</div></div></div>
        </div>
        <nav className="adm-mainnav noprint" style={{ marginTop: 16 }}>
          {tabs.map(([k, l]) => <button key={k} className={`adm-mainbtn ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{l}</button>)}
          <button className="adm-mainbtn" onClick={onBack}>↩ عودة</button>
        </nav>
      </section>

      <main className="adm-content" style={{ maxWidth: 1500, margin: "0 auto" }}>
        <div className="card" style={{ padding: 18, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div><h2 style={{ fontSize: 24 }}>{student.name}</h2><div style={{ color: T.inkSoft, fontSize: 13 }}>الصف {student.grade} — البلوك {student.block} {student.stream ? `— المسار ${student.stream}` : ""}</div></div>
          <span className="chip" style={{ background: status.bg, color: status.color, padding: "7px 14px", fontSize: 12 }}>{status.label}</span>
        </div>

        {tab === "overview" && <>
          <div className="adm-kpis">
            <div className="adm-kpi"><div className="adm-kpi-label">متوسط الأداء</div><div className="adm-kpi-value" style={{ color: status.color }}>{avg == null ? "—" : `${avg}%`}</div><div className="adm-kpi-foot">من أفضل نتائج الكورسات</div></div>
            <div className="adm-kpi"><div className="adm-kpi-label">إكمال الكورسات</div><div className="adm-kpi-value">{completionPct}%</div><div className="adm-kpi-foot">{completed} من {rows.length} كورسات</div></div>
            <div className="adm-kpi"><div className="adm-kpi-label">بدأ التعلم</div><div className="adm-kpi-value">{started}</div><div className="adm-kpi-foot">من {rows.length} كورسات مسندة</div></div>
            <div className="adm-kpi"><div className="adm-kpi-label">الشهادات</div><div className="adm-kpi-value">{certificates}</div><div className="adm-kpi-foot">شهادات إتمام متاحة</div></div>
          </div>
          <div className="adm-grid3">
            <section className="adm-panel">
              <h3>مستوى التقدم الحالي</h3>
              <div className="adm-donut" style={{ background: `conic-gradient(${T.green} 0 ${completionPct}%, ${T.gold} ${completionPct}% ${Math.min(100, completionPct + Math.max(0, started - completed) / Math.max(1, rows.length) * 100)}%, ${T.brick} 0)` }}>
                <div className="adm-donut-center"><div style={{ fontSize: 28 }}>{completionPct}%</div><div className="adm-muted">إكمال</div></div>
              </div>
              <div className="adm-legend"><div className="adm-legend-row"><span><i className="adm-dot" style={{ background: T.green }} />مكتمل</span><strong>{completed}</strong></div><div className="adm-legend-row"><span><i className="adm-dot" style={{ background: T.gold }} />قيد التعلم</span><strong>{Math.max(0, started-completed)}</strong></div><div className="adm-legend-row"><span><i className="adm-dot" style={{ background: T.brick }} />لم يبدأ</span><strong>{Math.max(0, rows.length-started)}</strong></div></div>
            </section>
            <section className="adm-panel"><h3>اتجاه الأداء</h3><TrendChart points={trendPoints} height={170} tone={status.color} /><div className="adm-muted">يعتمد على آخر محاولات الطالب الفعلية.</div></section>
            <section className="adm-panel adm-ai"><h3>✨ توصية المتابعة</h3><ul>
              {avg == null && <li>لم تتوافر نتائج كافية بعد. شجّع الطالب على بدء الكورس المسند.</li>}
              {avg != null && avg >= 80 && <li>الأداء جيد. استمروا في المتابعة والمحافظة على انتظام التدريب.</li>}
              {avg != null && avg >= 60 && avg < 80 && <li>الأداء مقبول ويحتاج متابعة مركزة في المهارات الظاهرة ضمن «تحتاج دعمًا».</li>}
              {avg != null && avg < 60 && <li>يوصى بطلب دعم من المعلم ووضع متابعة قصيرة للمهارات الأضعف.</li>}
              {weakSkills[0] && <li>أولوية التدريب الحالية: <strong>{weakSkills[0].name}</strong>.</li>}
              {rows.some((r) => !r.started) && <li>يوجد كورس مسند لم يبدأه الطالب بعد.</li>}
            </ul><button className="btn" style={{ width: "100%", background: "#fff", color: "#102d68" }} onClick={() => setTab("contact")}>اطلب دعمًا لابني</button></section>
          </div>
        </>}


        {tab === "newsletter" && <div><div style={{marginBottom:12}}><h2>📰 النشرة الأسبوعية</h2><div className="adm-muted">تظهر هنا النشرة نفسها التي نشرها المعلم، مع أرشيفها بالتاريخ.</div></div><NewsletterViewer newsletter={activeParentNews} archive={parentNews} onSelect={setParentNewsId}/></div>}

        {tab === "courses" && <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))" }}>
          {rows.length === 0 ? <div className="card" style={{ padding: 22 }}>لا توجد كورسات مسندة للطالب حاليًا.</div> : rows.map((r) => <article className="card" key={r.id || r.title} style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}><h3>{r.title}</h3>{r.completed ? <Chip tone="g">مكتمل</Chip> : r.started ? <Chip tone="a">قيد التعلم</Chip> : <Chip>لم يبدأ</Chip>}</div>
            <div style={{ height: 9, background: T.ruleSoft, borderRadius: 999, overflow: "hidden", margin: "16px 0 6px" }}><div style={{ width: `${Math.max(0, Math.min(100, r.pct))}%`, height: "100%", background: r.completed ? T.green : r.started ? T.gold : T.rule }} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.inkSoft }}><span>الإنجاز {Math.round(r.pct)}%</span><span>أفضل نتيجة {r.bestScore == null ? "—" : `${r.bestScore}%`}</span></div>
            <div style={{ marginTop: 10, fontSize: 12, color: T.inkSoft }}>المحاولات: {r.attempts}{r.lastAt ? ` — آخر نشاط ${dateAr(r.lastAt)}` : ""}</div>
            {r.certificateToken && <a className="btn btn-p" style={{ display: "inline-block", marginTop: 12, textDecoration: "none" }} href={`/api/send-email?certificate=${encodeURIComponent(r.certificateToken)}`} target="_blank" rel="noreferrer">🏆 فتح الشهادة</a>}
          </article>)}
        </div>}

        {tab === "skills" && <div className="adm-grid3">
          <section className="adm-panel"><h3>💪 نقاط القوة</h3>{strongSkills.length ? strongSkills.map((x) => <div key={x.name} style={{ padding: "9px 0", borderBottom: `1px solid ${T.ruleSoft}`, display: "flex", justifyContent: "space-between" }}><span>{x.name}</span><Chip tone="g">قوة</Chip></div>) : <p className="adm-muted">ستظهر نقاط القوة بعد وجود محاولات كافية.</p>}</section>
          <section className="adm-panel"><h3>🎯 تحتاج دعمًا</h3>{weakSkills.length ? weakSkills.map((x) => <div key={x.name} style={{ padding: "9px 0", borderBottom: `1px solid ${T.ruleSoft}`, display: "flex", justifyContent: "space-between" }}><span>{x.name}</span><span className="chip" style={{ background: T.brickSoft, color: T.brick }}>متابعة</span></div>) : <p className="adm-muted">لا توجد مهارات ضعيفة متكررة في البيانات الحالية.</p>}</section>
          <section className="adm-panel"><h3>كيف يمكنني مساعدته في المنزل؟</h3><p style={{ fontSize: 13, color: T.inkSoft }}>ركزوا على مهارة واحدة في كل مرة، واطلبوا من الطالب شرح القاعدة بصوته ثم تطبيقها على مثال جديد. تجنبوا إعادة الاختبار نفسه؛ الهدف هو فهم المهارة.</p>{weakSkills[0] && <div className="viz-callout" style={{ marginTop: 10 }}>ابدؤوا هذا الأسبوع بمهارة: <strong>{weakSkills[0].name}</strong></div>}</section>
        </div>}

        {tab === "activity" && <section className="adm-panel"><h3>آخر ما حدث</h3>{latestActivity.length === 0 ? <p className="adm-muted">لا يوجد نشاط بعد.</p> : latestActivity.slice(0, 12).map((a, i) => <div key={`${a.at}-${i}`} style={{ display: "grid", gridTemplateColumns: "110px 1fr auto", gap: 12, alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.ruleSoft}` }}><span className="adm-muted">{dateAr(a.at)}</span><span>أجرى محاولة في <strong>{a.title}</strong></span><span className="chip" style={{ background: a.passed ? T.greenSoft : a.pct >= 60 ? T.goldSoft : T.brickSoft, color: a.passed ? T.green : a.pct >= 60 ? T.gold : T.brick }}>{a.pct}%</span></div>)}</section>}

        {tab === "contact" && <div className="adm-grid3">
          <section className="adm-panel" style={{ gridColumn: "span 2" }}><h3>✉️ تواصل مع المعلم</h3><label className="lbl">الموضوع</label><select className="inp" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)}><option>متابعة تقدم ابني</option><option>استفسار عن كورس</option><option>استفسار عن نتيجة</option><option>طلب موعد للتواصل</option></select><label className="lbl" style={{ marginTop: 10 }}>رسالتك</label><textarea className="tarea" rows={5} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="اكتب رسالتك للمعلم..."/><button className="btn btn-p" disabled={sending} style={{ marginTop: 10 }} onClick={() => sendContact("contact")}>{sending ? "جارٍ الإرسال…" : "إرسال إلى المعلم"}</button></section>
          <section className="adm-panel"><h3>🆘 اطلب دعمًا لابني</h3><label className="lbl">نوع الدعم</label><select className="inp" value={supportType} onChange={(e) => setSupportType(e.target.value)}><option>ضعف أكاديمي</option><option>صعوبة في كورس</option><option>لم يفهم المهارة</option><option>تكرار المحاولات دون تحسن</option><option>أحتاج التواصل مع المعلم</option></select><label className="lbl" style={{ marginTop: 10 }}>تفاصيل مختصرة</label><textarea className="tarea" rows={4} value={supportNote} onChange={(e) => setSupportNote(e.target.value)} placeholder="صف ما يحتاجه الطالب..."/><button className="btn btn-d" disabled={sending} style={{ marginTop: 10 }} onClick={() => sendContact("support")}>إرسال طلب الدعم</button></section>
          {msg && <div className="card" aria-live="polite" style={{ gridColumn: "1/-1", padding: 14, background: msg.startsWith("✅") ? T.greenSoft : T.goldSoft, color: msg.startsWith("✅") ? T.green : T.ink }}>{msg}</div>}
        </div>}
      </main>

      <footer className="adm-footer">
        <div style={{ position: "relative", zIndex: 1, fontSize: 11 }}>تقرير ديناميكي — آخر فتح: {new Date().toLocaleString("ar-AE")}</div>
        <div className="adm-footer-main"><div className="adm-footer-tag">نزدهر • ننجح • ننمو</div><div style={{ opacity: .72 }}>GEMS Founders School Dubai — Inspiring Minds, Empowering Futures</div></div>
        <div style={{ position: "relative", zIndex: 1, fontSize: 11 }}>بوابة ولي الأمر — قسم اللغة العربية</div>
      </footer>
    </div>
  );
}
/* ============================ التطبيق ============================ */
export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState({ n: "home" });
  const [hist, setHist] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [progress, setProgress] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [blocksAdmin, setBlocksAdmin] = useState({});
  const [blockGroups, setBlockGroups] = useState({});
  const [codes, setCodes] = useState({ teacher: "GFS-2026", admin: "GFS-ADMIN-2026" });
  const [orgEmail, setOrgEmail] = useState("");
  const [audit, setAudit] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [parentTokens, setParentTokens] = useState({});
  const [newsletters, setNewsletters] = useState([]);
  const [parentReport, setParentReport] = useState(null);
  const [exam, setExam] = useState(null);
  const seq = useRef(0);

  useEffect(() => { (async () => {
    // كل مجموعة تُقرأ أولًا كسجلّات منفردة؛ وإن كانت فارغة (أول تشغيل بعد هذا
    // الإصدار) تُهاجَر من التخزين المجمَّع القديم مرة واحدة فتُحفظ سجلًّا سجلًّا.
    let courseList = await listRecords(REC.course);
    if (!courseList.length) {
      const legacy = await readKey(K.courses, null);
      courseList = legacy && legacy.length ? legacy : SEED_COURSES;
      await Promise.all(courseList.map((x) => putRecord(REC.course, x.id, x)));
    }
    setCourses(courseList);

    let studentList = await listRecords(REC.student);
    if (!studentList.length) {
      const legacy = await readKey(K.students, []);
      if (legacy.length) { await Promise.all(legacy.map((x) => putRecord(REC.student, x.key, x))); studentList = legacy; }
    }
    setStudents(studentList);

    let attemptList = await listRecords(REC.attempt);
    if (!attemptList.length) {
      const legacy = await readKey(K.attempts, []);
      if (legacy.length) { await Promise.all(legacy.map((x) => putRecord(REC.attempt, x.id, x))); attemptList = legacy; }
    }
    setAttempts(attemptList); seq.current = attemptList.length;

    let progressList = await listRecords(REC.progress);
    let progressObj = {};
    if (progressList.length) progressList.forEach((p) => { if (p && p.__key) progressObj[p.__key] = p.__val; });
    else {
      const legacy = await readKey(K.progress, {});
      progressObj = legacy;
      await Promise.all(Object.entries(legacy).map(([k, v]) => putRecord(REC.progress, k, { __key: k, __val: v })));
    }
    setProgress(progressObj);

    let ptokList = await listRecords(REC.parentTok);
    let ptokObj = {};
    if (ptokList.length) ptokList.forEach((p) => { if (p && p.__key) ptokObj[p.__key] = p.__val; });
    else {
      const legacy = await readKey(K.parentTok, {});
      ptokObj = legacy;
      await Promise.all(Object.entries(legacy).map(([k, v]) => putRecord(REC.parentTok, k, { __key: k, __val: v })));
    }
    setParentTokens(ptokObj);

    let auditList = await listRecords(REC.audit);
    if (!auditList.length) {
      const legacy = await readKey(K.audit, []);
      if (legacy.length) { await Promise.all(legacy.map((x, i) => putRecord(REC.audit, `${x.at}-${i}`, x))); auditList = legacy; }
    }
    auditList.sort((a, b) => (a.at || "").localeCompare(b.at || ""));
    setAudit(auditList);

    const interventionList = await listRecords(REC.intervention);
    interventionList.sort((a, b) => (b.at || "").localeCompare(a.at || ""));
    setInterventions(interventionList);

    setTeachers(await readKey(K.teachers, []));
    setCodes(await readKey(K.codes, { teacher: "GFS-2026", admin: "GFS-ADMIN-2026" }));
    setOrgEmail(await readKey(K.orgEmail, ""));
    setBlocksAdmin(await readKey(K.blocksAdmin, {}));
    setBlockGroups(await readKey(K.blockGroups, {}));
    const newsletterList = await listRecords(REC.newsletter);
    newsletterList.sort((a,b)=>(b.publishedAt||b.createdAt||"").localeCompare(a.publishedAt||a.createdAt||""));
    setNewsletters(newsletterList);
    setReady(true);
  })(); }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("parent");
    if (!token || !students.length) return;
    (async () => {
      const normalized = token.trim().toUpperCase();
      let rec = parentTokens[normalized];
      if (!rec) {
        const stored = await readRecord(REC.parentTok, normalized);
        rec = stored && (stored.__val || stored);
      }
      if (!rec) return;
      const student = students.find((s) => s.key === rec.studentKey);
      if (!student) return;
      setParentReport({ student, rows: buildReport(student, courses, progress, attempts) });
    })();
  }, [students, courses, attempts, progress, parentTokens]);

  // كل دالة هنا تكتب سجلّها الخاص فقط، لا نسخة كاملة من المجموعة — فمعلمان
  // ينشران كورسين مختلفين في اللحظة نفسها لا يمحو أحدهما عمل الآخر.
  const patchCourse = (id, patch) => {
    setCourses((prev) => {
      const next = prev.map((c2) => {
        if (c2.id !== id) return c2;
        const merged = { ...c2, ...patch };
        const isFirstPublish = patch.status === "published" && !c2.publishedAt;
        if (isFirstPublish) merged.publishedAt = new Date().toISOString();
        if (isFirstPublish) {
          const teacherEmail = (teachers.find((t) => t.name === merged.teacher) || {}).email;
          const dueLine = merged.dueDate ? `<p>الموعد النهائي لإتمامه: <strong>${dateAr(merged.dueDate)}</strong></p>` : "";
          const html = `<p>نُشر كورس جديد: <strong>${merged.title}</strong> (${DOMAINS[merged.domain]} — الصف ${merged.grade}).</p>${dueLine}<p>المعلم: ${merged.teacher}</p>`;
          notifyEmail([orgEmail, teacherEmail], `تم نشر كورس جديد: ${merged.title}`, html);
        }
        return merged;
      });
      const updated = next.find((c2) => c2.id === id);
      if (updated) putRecord(REC.course, id, updated);
      return next;
    });
  };
  const addCourse = (c2) => { setCourses((prev) => [...prev, c2]); putRecord(REC.course, c2.id, c2); };
  const replaceCourse = (c2) => { setCourses((prev) => prev.map((x) => x.id === c2.id ? c2 : x)); putRecord(REC.course, c2.id, c2); };
  const deleteCourseRec = (id) => { setCourses((prev) => prev.filter((c2) => c2.id !== id)); deleteRecord(REC.course, id); };
  const saveProgress = (k, val) => { setProgress((prev) => ({ ...prev, [k]: val })); putRecord(REC.progress, k, { __key: k, __val: val }); };
  const log = (actor, action, detail) => {
    const entry = { at: new Date().toISOString(), actor, action, detail };
    setAudit((prev) => [...prev, entry]); putRecord(REC.audit, `${entry.at}-${uid()}`, entry);
  };
  const addIntervention = (rec) => {
    const entry = { id: uid(), at: new Date().toISOString(), status: "مفتوح", ...rec };
    setInterventions((prev) => [entry, ...prev]); putRecord(REC.intervention, entry.id, entry);
    log(user?.name || "رئيس القسم", "خطة تدخل", `${rec.studentName} — ${rec.problem || rec.action}`);
  };
  const updateIntervention = (id, patch) => {
    setInterventions((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));
    const cur = interventions.find((i) => i.id === id);
    if (cur) putRecord(REC.intervention, id, { ...cur, ...patch });
  };
  // إعادة فتح المحاولة: ترفع دورة التقدّم (cycle) لهذا الطالب على هذا
  // الكورس تحديدًا، فتُحسَب محاولاته القادمة كدورة جديدة — نفس الآلية
  // المستعملة أصلًا في حساب رقم المحاولة، لا اختراعًا جديدًا خارج هيكل المنصة.
  const reopenAttempt = (studentKey, courseId, actorName) => {
    const k = pKey(studentKey, courseId);
    const cur = progress[k] || { done: [], cycle: 1 };
    const next = { ...cur, cycle: (cur.cycle || 1) + 1, done: [] };
    setProgress((prev) => ({ ...prev, [k]: next })); putRecord(REC.progress, k, { __key: k, __val: next });
    log(actorName, "إعادة فتح محاولة", `${studentKey} — ${courseId}`);
  };
  const ensureTeacher = (name, email = "") => {
    const normalizedEmail = normEmail(email);
    const existing = teachers.find((t) => t.name === name);
    if (!existing) {
      const v = [...teachers, { name, email: normalizedEmail, active: true }]; setTeachers(v); writeKey(K.teachers, v);
    } else if (normalizedEmail && normEmail(existing.email) !== normalizedEmail) {
      const v = teachers.map((t) => t.name === name ? { ...t, email: normalizedEmail } : t); setTeachers(v); writeKey(K.teachers, v);
    }
  };
  // رمزا الدخول يُغيّرهما رئيس القسم فقط، من داخل وحدة الإدارة — هذا هو
  // الضابط الفعلي لمن يستطيع دخول لوحتي المعلم والإدارة، لا رقمًا ثابتًا في الكود.
  const updateCodes = (next, actor) => { setCodes(next); writeKey(K.codes, next); log(actor, "تغيير رموز الدخول", "تم تحديث رمز المعلم و/أو رمز الإدارة"); };
  const updateOrgEmail = (email, actor) => { setOrgEmail(email); writeKey(K.orgEmail, email); log(actor, "تحديث بريد رئيس القسم", email || "(أُزيل)"); };
  const setTeacherEmail = (name, email, actor) => {
    const normalized = normEmail(email);
    const v = teachers.map((t) => t.name === name ? { ...t, email: normalized } : t);
    setTeachers(v); writeKey(K.teachers, v); log(actor, "تسجيل بريد معلم", `${name} — ${normalized}`);
  };
  const addTeacherAdmin = (rec, actor) => {
    const name = String(rec?.name || "").trim(), email = normEmail(rec?.email);
    if (!name) return;
    if (teachers.some((t) => t.name === name || (email && normEmail(t.email) === email))) return alert("هذا المعلم أو البريد مسجل بالفعل.");
    const next = [...teachers, { name, email, code: String(rec?.code || "").trim(), active: true }];
    setTeachers(next); writeKey(K.teachers, next); log(actor, "إضافة معلم", `${name} — ${email || "بلا بريد"}`);
  };
  const deleteTeacherAdmin = (name, actor) => { const next=teachers.filter(t=>t.name!==name); setTeachers(next); writeKey(K.teachers,next); log(actor,"حذف حساب معلم",name); };
  const setTeacherCodeAdmin = (name, code, actor) => { const next=teachers.map(t=>t.name===name?{...t,code:String(code||"").trim()}:t); setTeachers(next); writeKey(K.teachers,next); log(actor,"تغيير رمز معلم",name); };

  // كل انتقال بين الشاشات يمرّ عبر nav فيُحفظ مكان الوصول السابق تلقائيًا،
  // فزر "رجوع" الظاهر في كل صفحة يعيد المستخدم بالضبط إلى ما قبل الخطأ.
  const nav = (v) => { setHist((h) => [...h, view]); setView(v); };
  const goBack = () => {
    if (hist.length) { const prev = hist[hist.length - 1]; setHist(hist.slice(0, -1)); setView(prev); }
    else { setUser(null); setView({ n: "home" }); }
  };

  const startExam = (cid) => {
    const c = courses.find((x) => x.id === cid);
    const bank = cleanBank(c);
    const n = Math.min(c.q || phaseFor(c.grade).q, bank.length);
    const byType = {}; bank.forEach((b) => { (byType[b.t] = byType[b.t] || []).push(b); });
    const pools = Object.values(byType).map(shuffle);
    const picked = []; let i = 0;
    while (picked.length < n && pools.some((p) => p.length)) { const p = pools[i % pools.length]; if (p.length) picked.push(p.shift()); i++; }
    const items = shuffle(picked).map((b) => {
      if (b.t === "mcq") { const o = shuffle(b.o.map((t, k) => ({ t, k }))); return { ...b, o: o.map((x) => x.t), a: o.findIndex((x) => x.k === b.a) }; }
      if (b.t === "match") return { ...b, pairs: shuffle(b.pairs), _opts: shuffle(b.pairs.map((p) => p[1])) };
      return { ...b };
    });
    setExam({ course: c, items }); nav({ n: "exam" });
  };
  const submitExam = (ans) => {
    const { course: c, items } = exam;
    const ph = phaseFor(c.grade), pass = c.pass || ph.pass;
    const p = progress[pKey(user.key, c.id)] || { done: [], cycle: 1 };
    const cyc = p.cycle || 1;
    const no = attempts.filter((a) => a.student === user.key && a.course === c.id && a.cycle === cyc).length + 1;
    const detail = items.map((it, i) => ({ q: it.q, sn: it.sn, e: it.e, type: it.t, ok: grade(it, ans[i]), picked: answerText(it, ans[i]), correct: correctText(it) }));
    const raw = detail.filter((d) => d.ok).length, pct = Math.round(raw / detail.length * 100);
    seq.current += 1;
    const a = { id: uid(), student: user.key, course: c.id, cycle: cyc, no, raw, pct, pass, passed: pct >= pass,
      at: new Date().toISOString(), detail, serial: `GFS-2026-${String(seq.current).padStart(4, "0")}`, token: uid().toUpperCase() };
    setAttempts((prev) => [...prev, a]); putRecord(REC.attempt, a.id, a);
    if (a.passed) {
      const teacherEmail = (teachers.find((t) => t.name === c.teacher) || {}).email;
      const studentRec = students.find((s) => s.key === user.key) || {};

      const reportToken = "PR-" + uid().toUpperCase();
      const reportRows = buildReport(studentRec.key ? studentRec : user, courses, progress, [...attempts, a]);
      const reportRec = { studentKey: user.key, rows: reportRows, at: new Date().toISOString() };
      setParentTokens((prev) => ({ ...prev, [reportToken]: reportRec }));
      putRecord(REC.parentTok, reportToken, { __key: reportToken, __val: reportRec });
      const reportUrl = `${window.location.origin}/?parent=${encodeURIComponent(reportToken)}`;

      notifyEmail([orgEmail, teacherEmail],
        `إتمام كورس: ${user.name} — ${c.title}`,
        `<p>أنهى الطالب <strong>${user.name}</strong> (الصف ${user.grade} — ${user.block}) كورس <strong>${c.title}</strong> بنجاح.</p><p>الدرجة: ${a.pct}% — المحاولة ${a.no} من الدورة ${a.cycle}.</p>`);

      const parentTo = normEmail(studentRec.parentEmail || user.parentEmail);
      if (parentTo) {
        notifyEmail(parentTo, `شهادة إتقان — ${c.title}`,
          `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9">
             <p>عزيزي ولي الأمر،</p>
             <p>يسعدنا أن نهنئكم بأن ابنكم/ابنتكم <strong>${user.name}</strong> قد اجتاز كورس <strong>«${c.title}»</strong> بنجاح، وحصل على درجة <strong>${a.pct}%</strong> بتاريخ ${dateAr(a.at)}.</p>
             <p>رقم الشهادة: <strong>${a.serial}</strong> — رمز التحقق: <strong>${a.token}</strong></p>
             <p><a href="${reportUrl}" target="_blank" style="display:inline-block;background:#14746F;color:white;text-decoration:none;padding:11px 18px;border-radius:9px;font-weight:700">📊 متابعة تقدم الطالب</a></p>
             <p style="font-size:12px;color:#667085">ستجدون أيضًا زر فتح شهادة الإتمام في هذه الرسالة.</p>
           </div>`);
      }

      const studentTo = normEmail(studentRec.email || user.email);
      if (studentTo) {
        notifyEmail(studentTo, `تهانينا — أتممت «${c.title}» بنجاح`,
          `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9">
             <p>مرحبًا <strong>${user.name}</strong>،</p>
             <p>تهانينا! أتممت كورس <strong>«${c.title}»</strong> بنجاح وحصلت على درجة <strong>${a.pct}%</strong> بتاريخ ${dateAr(a.at)}.</p>
             <p>رقم الشهادة: <strong>${a.serial}</strong> — رمز التحقق: <strong>${a.token}</strong></p>
             <p>ستجد زر <strong>🏆 فتح شهادة الإتمام</strong> في هذه الرسالة لعرض الشهادة مباشرة وطباعتها أو حفظها PDF.</p>
           </div>`);
      }
    }
    setExam(null); nav({ n: "result", id: a.id });
  };

  if (!ready) return <div className="gfs"><style>{CSS}</style><div className="wrap" style={{ padding: 60, color: T.inkSoft }}>جارٍ فتح المنصة…</div></div>;

  if (parentReport) return <ParentPortal report={parentReport} newsletters={newsletters} orgEmail={orgEmail} onBack={() => { setParentReport(null); }} />;

  if (!user) return <Login
    teachers={teachers}
    onStudent={(u) => { setUser(u); setHist([]); setView({ n: "home" });
      const existing = students.find((s) => s.key === u.key);
      if (!existing) { const rec = { key: u.key, name: u.name, grade: u.grade, block: u.block, stream: u.stream, teacherEmail: normEmail(u.teacherEmail), email: normEmail(u.email), parentEmail: normEmail(u.parentEmail) }; setStudents((prev) => [...prev, rec]); putRecord(REC.student, rec.key, rec); }
      else {
        const rec = { ...existing, teacherEmail: normEmail(existing.teacherEmail || u.teacherEmail), email: normEmail(existing.email || u.email), parentEmail: normEmail(existing.parentEmail || u.parentEmail) };
        if (JSON.stringify(rec) !== JSON.stringify(existing)) { setStudents((prev) => prev.map((s) => s.key === u.key ? rec : s)); putRecord(REC.student, rec.key, rec); }
      } }}
    onTeacher={(name, email) => { ensureTeacher(name, email); setUser({ role: "teacher", name, email: normEmail(email) }); setHist([]); setView({ n: "home" }); }}
    onAdmin={() => { setUser({ role: "admin", name: "رئيس القسم" }); setHist([]); setView({ n: "home" }); }}
    onParent={async (tok, setErr) => {
      const normalized = String(tok || "").trim().toUpperCase();
      let rec = parentTokens[normalized];
      if (!rec) {
        const stored = await readRecord(REC.parentTok, normalized);
        rec = stored && (stored.__val || stored);
      }
      if (!rec) return setErr("رمز غير صحيح أو منتهي.");
      const student = students.find((s) => s.key === rec.studentKey);
      if (!student) return setErr("تعذّر العثور على بيانات الطالب.");
      setParentReport({ student, rows: buildReport(student, courses, progress, attempts) });
    }} codes={codes} students={students} courses={courses} attempts={attempts} />;

  const course = view.id && courses.find((c) => c.id === view.id);
  const attempt = (view.n === "result" || view.n === "cert") ? attempts.find((a) => a.id === view.id) : null;
  const attCourse = attempt && courses.find((c) => c.id === attempt.course);

  const exportStudentsCSV = () => {
    const rows = students.map((s) => {
      const at = attempts.filter((a) => a.student === s.key);
      const passedCourses = new Set(at.filter((a) => a.passed).map((a) => a.course)).size;
      const avg = at.length ? Math.round(at.reduce((x, a) => x + a.pct, 0) / at.length) : "";
      return { name: s.name, school_id_full: s.schoolId || "", school_key: s.key, grade: s.grade, block: s.block, stream: s.stream,
        teacher_email: s.teacherEmail || "", student_email: s.email || "", parent_email: s.parentEmail || "",
        assigned: courses.filter((c) => assignedTo(c, s)).length, attempts: at.length, passed_courses: passedCourses, average_pct: avg };
    });
    downloadText("gfs_students_results.csv", toCSV(rows, ["name", "school_id_full", "school_key", "grade", "block", "stream", "teacher_email", "student_email", "parent_email", "assigned", "attempts", "passed_courses", "average_pct"]));
    log(user.name, "تصدير بيانات الطلاب", `${rows.length} سجلًا`);
  };
  const exportAuditCSV = () => {
    downloadText("gfs_audit_log.csv", toCSV(audit.map((a) => ({ at: dateAr(a.at), actor: a.actor, action: a.action, detail: a.detail })), ["at", "actor", "action", "detail"]));
  };
  // Column names accepted in either Arabic or English, in any order, from a
  // pasted CSV textarea or an uploaded Excel/CSV file — same normalized key
  // as student self-registration at login, so rosters match automatically.
  const HEADER_MAP = {
    name: ["name", "الاسم", "الاسم الثلاثي", "اسم الطالب"], school_id: ["school_id", "id", "الرقم", "الرقم التعريفي", "الرقم المدرسي", "الرقم الوطني"],
    grade: ["grade", "year", "الصف", "المستوى"], block: ["block", "البلوك", "الشعبة"], stream: ["stream", "المسار"],
    teacherEmail: ["teacher_email", "teacher email", "بريد المعلم", "ايميل المعلم", "إيميل المعلم"],
    email: ["student_email", "student email", "بريد الطالب", "ايميل الطالب", "إيميل الطالب"],
    parentEmail: ["parent_email", "parent email", "بريد ولي الأمر", "بريد ولي الامر", "ايميل ولي الأمر", "إيميل ولي الأمر"],
  };
  const norm = (s) => String(s || "").replace(/[（(].*?[)）]/g, "").trim().toLowerCase();
  function countHeaderMatches(row) {
    const seen = new Set();
    (row || []).forEach((cell) => {
      const c = norm(cell);
      if (!c) return;
      Object.entries(HEADER_MAP).forEach(([field, names]) => { if (names.some((n) => c.includes(n.toLowerCase()))) seen.add(field); });
    });
    return seen.size;
  }
  // نشترط تطابق حقلين مختلفين على الأقل، لا مجرد كلمة واحدة — وإلا فصفّ
  // عنوان كبير مثل «قائمة طلاب الصف الثاني عشر» (يحتوي كلمة «الصف» وحدها)
  // كان سيُعامَل خطأً كصفّ عناوين فيُخفي صفّ الأعمدة الحقيقي تحته.
  const isHeaderRow = (arr) => countHeaderMatches(arr) >= 2;
  // يبني خريطة أعمدة {name:0, school_id:1, ...} من صف العناوين الفعلي —
  // بصرف النظر عن ترتيبها في الملف. إن لم يوجد صف عناوين معروف، يعود
  // للترتيب الافتراضي (اسم، رقم، صف، بلوك، مسار، بريد المعلم، بريد الطالب، بريد ولي الأمر) كخطة بديلة.
  function mapColumns(headerRow) {
    const idx = {};
    (headerRow || []).forEach((cell, i) => {
      const c = norm(cell);
      if (!c) return;
      Object.entries(HEADER_MAP).forEach(([field, names]) => {
        if (idx[field] === undefined && names.some((n) => c.includes(n.toLowerCase()))) idx[field] = i;
      });
    });
    if (Object.keys(idx).length >= 2) return idx;
    return { name: 0, school_id: 1, grade: 2, block: 3, stream: 4, teacherEmail: 5, email: 6, parentEmail: 7 };
  }
  // يبحث عن صف العناوين الحقيقي ضمن أول 5 صفوف — بعض الملفات تضع صفًّا
  // عنوانًا كبيرًا (مثل «قائمة طلاب الصف الثاني عشر») فوق صف الأعمدة
  // الفعلي، فلا يكفي فحص الصف الأول فقط.
  function splitHeaderAndData(rows) {
    const scanLimit = Math.min(rows.length, 5);
    for (let i = 0; i < scanLimit; i++) {
      if (isHeaderRow(rows[i])) return { colIdx: mapColumns(rows[i]), data: rows.slice(i + 1) };
    }
    return { colIdx: mapColumns(null), data: rows };
  }
  // الصف قد يُكتب رقمًا (12) أو نصًّا عربيًا (الصف الثاني عشر) — نحاول
  // الرقم أولًا، ثم نطابق الترتيب العربي الشائع من الأول حتى الثالث عشر.
  const GRADE_WORDS = ["الحادي عشر", "الثاني عشر", "الثالث عشر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];
  const GRADE_WORD_NUM = { "الأول": 1, "الثاني": 2, "الثالث": 3, "الرابع": 4, "الخامس": 5, "السادس": 6, "السابع": 7, "الثامن": 8, "التاسع": 9, "العاشر": 10, "الحادي عشر": 11, "الثاني عشر": 12, "الثالث عشر": 13 };
  function parseGrade(raw) {
    const s = String(raw || "").trim();
    const numMatch = s.match(/\d+/);
    if (numMatch) return +numMatch[0];
    const found = GRADE_WORDS.find((w) => s.includes(w));
    return found ? GRADE_WORD_NUM[found] : 0; // 0 = لم يُحدَّد بعد (يحتاج مراجعة المعلم)
  }

  function mergeStudentRows(rows, colIdx, actor) {
    const existingKeys = new Set(students.map((s) => s.key));
    const added = []; const dups = []; const bad = []; let placeholderSeq = 0;
    rows.forEach((r) => {
      const parts = (Array.isArray(r) ? r : []).map((x) => (x === undefined || x === null ? "" : String(x).trim()));
      const get = (field, fallbackIdx) => parts[colIdx[field] !== undefined ? colIdx[field] : fallbackIdx] || "";
      const name = get("name", 0);
      if (!name) return bad.push(parts.join(","));
      const sidDigits = get("school_id", 1).replace(/\D/g, "");
      const g = parseGrade(get("grade", 2));
      const block = get("block", 3) || "؟";
      const streamRaw = get("stream", 4);
      const teacherEmailRaw = normEmail(get("teacherEmail", 5));
      const studentEmailRaw = normEmail(get("email", 6));
      const parentEmailRaw = normEmail(get("parentEmail", 7));
      // نقبل الرقم التعريفي كاملًا مهما كان طوله (لا قيد 4-8 أرقام) —
      // ونحتفظ به كاملًا في السجل، لكن مفتاح الطالب (وتطابق دخوله لاحقًا)
      // يبقى دومًا آخر 6 أرقام منه، تمامًا كما يكتبها الطالب بنفسه عند الدخول.
      // نقبل الطالب حتى لو كانت بياناته ناقصة — بدل رفضه بالكامل — ونمنحه
      // معرّفًا مؤقتًا فريدًا فقط إن لم يوجد أي رقم على الإطلاق؛ يُعلَّم
      // السجل «يحتاج مراجعة» ليكمله المعلم لاحقًا من شاشة «طلابي».
      const needsReview = !sidDigits || !g || block === "؟" || !teacherEmailRaw || !studentEmailRaw || !parentEmailRaw;
      const sid = sidDigits ? sidDigits.slice(-6) : `TMP${(Date.now() + placeholderSeq++).toString().slice(-6)}`;
      const key = `${g || 0}-${block}-${sid}`;
      if (existingKeys.has(key)) return dups.push(key);
      added.push({ key, name, grade: g, block, stream: streamRaw.toUpperCase() === "B" ? "B" : "A", teacherEmail: teacherEmailRaw, email: studentEmailRaw, parentEmail: parentEmailRaw, schoolId: sidDigits, needsReview });
      existingKeys.add(key);
    });
    if (added.length) {
      setStudents((prev) => [...prev, ...added]);
      Promise.all(added.map((s) => putRecord(REC.student, s.key, s)));
    }
    const review = added.filter((s) => s.needsReview).length;
    log(actor, "استيراد طلاب", `أُضيف ${added.length} (منهم ${review} يحتاج مراجعة)، تكرار ${dups.length}، غير صالح ${bad.length}`);
    return { added: added.length, dups: dups.length, bad: bad.length, review };
  }

  const importStudentsCSV = (txt) => {
    const lines = txt.split("\n").map((l) => l.trim()).filter(Boolean);
    const rows = lines.map((l) => l.split(","));
    const { colIdx, data } = splitHeaderAndData(rows);
    const r = mergeStudentRows(data, colIdx, "رئيس القسم");
    alert(`تم استيراد ${r.added} طالبًا (منهم ${r.review} يحتاج إكمال بيانات). مكرر: ${r.dups}. غير صالح: ${r.bad}.`);
  };

  // Teacher-facing upload: accepts a real .xlsx/.xls workbook or a .csv file,
  // parsed client-side with SheetJS — no server round-trip needed.
  const importStudentsFile = (file, setMsg) => {
    const reader = new FileReader();
    reader.onerror = () => setMsg("تعذّر قراءة الملف. تأكد أنه Excel أو CSV صالح.");
    reader.onload = async (e) => {
      try {
        const XLSX = await loadXLSX();
        const wb = XLSX.read(e.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })
          .filter((r) => r.some((c) => String(c).trim() !== ""));
        const { colIdx, data } = splitHeaderAndData(rows);
        const r = mergeStudentRows(data, colIdx, user.name);
        if (r.added === 0 && r.bad > 0) {
          setMsg(`من ملف «${file.name}»: لم يُقبل أي طالب (${r.bad} صف بلا اسم واضح). تأكد أن عمود الاسم يحتوي أسماء الطلاب فعليًا، أو استخدم «تنزيل نموذج فارغ» كأساس.`);
        } else {
          setMsg(`من ملف «${file.name}»: أُضيف ${r.added} طالبًا (منهم ${r.review} يحتاج إكمال بيانات)، تكرار ${r.dups}، غير صالح ${r.bad}.`);
        }
      } catch (err) {
        setMsg("تعذّر تحليل الملف. تأكد أنه يحتوي عمودًا للاسم على الأقل.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // تعديل بيانات طالب موجود (لاستكمال ما نقص بعد الاستيراد التلقائي، أو
  // تصحيح أي حقل يدويًا). إن تغيّر الصف/البلوك/الرقم يُعاد بناء المفتاح
  // فيتطابق الطالب مع دخوله لاحقًا بالبيانات المصحَّحة.
  const editStudent = (oldKey, fields, actor) => {
    const existing = students.find((s) => s.key === oldKey);
    if (!existing) return;
    const g = +fields.grade || existing.grade;
    const block = (fields.block || existing.block || "").trim();
    const sidDigits = (fields.sid || "").replace(/\D/g, "") || existing.schoolId || "";
    const sid = sidDigits ? sidDigits.slice(-6) : (existing.key.split("-")[2] || "");
    const newKey = `${g}-${block}-${sid}`;
    const needsReview = !/^\d{6}$/.test(sid) || !g || !block || block === "؟";
    const teacherEmail = fields.teacherEmail !== undefined ? normEmail(fields.teacherEmail) : normEmail(existing.teacherEmail);
    const studentEmail = fields.email !== undefined ? normEmail(fields.email) : normEmail(existing.email);
    const parentEmail = fields.parentEmail !== undefined ? normEmail(fields.parentEmail) : normEmail(existing.parentEmail);
    const needsReview2 = needsReview || !teacherEmail || !studentEmail || !parentEmail;
    const rec = { key: newKey, name: (fields.name || existing.name).trim(), grade: g, block, stream: fields.stream || existing.stream,
      teacherEmail, email: studentEmail, parentEmail, schoolId: sidDigits, needsReview: needsReview2 };
    setStudents((prev) => prev.map((s) => s.key === oldKey ? rec : s));
    putRecord(REC.student, newKey, rec);
    if (newKey !== oldKey) deleteRecord(REC.student, oldKey);
    log(actor, "تعديل بيانات طالب", `${rec.name} — ${oldKey} → ${newKey}`);
  };

  // A ready-to-fill workbook — the columns are locked in, so whatever the
  // teacher types matches the importer with zero guesswork.
  const downloadStudentTemplate = () => {
    downloadXLSX("قائمة_الطلاب_نموذج.xlsx", [
      ["الاسم الثلاثي", "الرقم التعريفي", "الصف", "البلوك", "المسار", "بريد المعلم", "بريد الطالب", "بريد ولي الأمر"],
      ["سالم أحمد الكعبي", "123456", "7", "A", "A", "teacher1@gemsedu.com", "student1@example.com", "parent1@example.com"],
      ["ليان محمد النعيمي", "654321", "7", "B", "A", "teacher1@gemsedu.com", "student2@example.com", "parent2@example.com"],
    ]);
  };

  const addStudentManual = (data, actor) => {
    const g = +data.grade; const sidDigits = (data.sid || "").replace(/\D/g, "");
    if (!data.name.trim() || !sidDigits || !g || !data.block) return { ok: false, msg: "تحقّق من الاسم والرقم (أرقام فقط) والصف والبلوك." };
    const key = `${g}-${data.block}-${sidDigits.slice(-6)}`;
    if (students.some((s) => s.key === key)) return { ok: false, msg: "طالب بهذه البيانات مسجَّل أصلًا." };
    const teacherEmail = normEmail(data.teacherEmail); const studentEmail = normEmail(data.email); const parentEmail = normEmail(data.parentEmail);
    if (!teacherEmail || !studentEmail || !parentEmail) return { ok: false, msg: "أدخل بريد المعلم وبريد الطالب وبريد ولي الأمر لإكمال الربط وإرسال الشهادات." };
    const rec = { key, name: data.name.trim(), grade: g, block: data.block, stream: data.stream === "B" ? "B" : "A", teacherEmail, email: studentEmail, parentEmail, schoolId: sidDigits, needsReview: false };
    setStudents((prev) => [...prev, rec]); putRecord(REC.student, rec.key, rec);
    log(actor, "إضافة طالب يدويًا", `${data.name.trim()} — ${key}`);
    return { ok: true };
  };
  const removeStudent = (key, actor) => {
    const s = students.find((x) => x.key === key);
    setStudents((prev) => prev.filter((x) => x.key !== key)); deleteRecord(REC.student, key);
    log(actor, "حذف طالب من القائمة", s ? `${s.name} — ${key}` : key);
  };
  const saveNewsletter = async (rec) => {
    const publishedAt = rec.status === "published" ? new Date().toISOString() : null;
    let next = { ...rec, publishedAt };
    await putRecord(REC.newsletter, next.id, next);
    setNewsletters(prev => [next, ...prev.filter(x=>x.id!==next.id)]);
    if (rec.status !== "published") { log(user?.name||"معلم", "حفظ مسودة نشرة أسبوعية", `الصف ${rec.grade}`); return next; }
    const targets = students.filter(s => +s.grade===+rec.grade && (rec.blocks||[]).includes(s.block) && (!rec.teacherEmail || !s.teacherEmail || normEmail(s.teacherEmail)===normEmail(rec.teacherEmail)));
    let studentSent=0,parentSent=0,failed=0;
    const tasks = [];
    targets.forEach((st) => {
      if (normEmail(st.email)) tasks.push(async()=>({kind:"student",result:await sendEmailTracked(st.email, `النشرة الأسبوعية — ${st.name} — اللغة العربية`, newsletterEmailHtml(next, st.name, false))}));
      if (normEmail(st.parentEmail)) tasks.push(async()=>({kind:"parent",result:await sendEmailTracked(st.parentEmail, `النشرة الأسبوعية لابنكم ${st.name} — اللغة العربية`, newsletterEmailHtml(next, st.name, true))}));
    });
    const sendResults = await runEmailTasks(tasks, 8);
    sendResults.forEach(({kind,result})=>{ if(result?.ok){ if(kind==="student") studentSent++; else parentSent++; } else failed++; });
    next = { ...next, sendStats: { studentTotal: targets.filter(s=>normEmail(s.email)).length, studentSent, parentTotal: targets.filter(s=>normEmail(s.parentEmail)).length, parentSent, failed, at: new Date().toISOString() } };
    await putRecord(REC.newsletter, next.id, next);
    setNewsletters(prev => [next, ...prev.filter(x=>x.id!==next.id)]);
    log(rec.teacherName||user?.name||"معلم", "نشر النشرة الأسبوعية", `الصف ${rec.grade} — ${(rec.blocks||[]).join("، ")} — الطلاب ${studentSent} — أولياء الأمور ${parentSent}`);
    return next;
  };

  const deleteNewsletter = async (id, rec = null) => {
    await deleteRecord(REC.newsletter, id);
    setNewsletters(prev => prev.filter(x => x.id !== id));
    log(rec?.teacherName || user?.name || "معلم", "حذف نشرة أسبوعية", rec ? `الصف ${rec.grade} — ${(rec.blocks||[]).join("، ")}` : id);
    return { ok: true };
  };

  // مسح كامل لقائمة الطلاب دفعة واحدة — للتراجع عن استيراد خاطئ بالكامل
  // بدل حذف كل طالب يدويًا واحدًا تلو الآخر.
  const clearAllStudents = (actor) => {
    const count = students.length;
    Promise.all(students.map((s) => deleteRecord(REC.student, s.key)));
    setStudents([]);
    log(actor, "مسح جميع الطلاب", `${count} سجلًا`);
  };

  return (
    <div className="gfs"><style>{CSS}</style>
      <div className="noprint topbar" style={{ padding: "12px 0", marginBottom: 22 }}>
        <div className="wrap topbar-inner" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div onClick={() => nav({ n: "home" })} className="brand-row" style={{ cursor: "pointer", flex: 1, minWidth: 180 }}>
            <div className="logo-chip"><img src={LOGO_URL} alt="GEMS Founders School" /></div>
            <div><h2 className="brand-title" style={{ color: "#fff", fontSize: 19 }}>بالعربي أحلى</h2>
              <div className="brand-tagline">ننمو — ننجح — نزدهر</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "left" }}><div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "#9DBDBB" }}>{user.role === "teacher" ? "لوحة المعلم" : user.role === "admin" ? "وحدة إدارة القسم" : `الصف ${user.grade} — ${user.block}`}</div></div>
            <button className="btn btn-q" style={{ color: "#9DBDBB" }} onClick={() => { setUser(null); setHist([]); setView({ n: "home" }); }}>خروج</button>
            {(hist.length > 0 || view.n !== "home") && <button className="btn btn-q" style={{ color: "#9DBDBB", border: "1px solid #33565A" }} onClick={goBack}>→ رجوع</button>}</div>
        </div>
      </div>

      {user.role === "admin" ? (
        view.n === "admin-gen" ? <Generator teacherName={user.name} onCancel={()=>setView({n:"home"})} onSave={d=>{addCourse(d);log(user.name,"توليد كورس بالذكاء الاصطناعي",d.title);setView({n:"home"})}} />
        : view.n === "admin-ai-edit" && course ? <AIEditCourse course={course} onCancel={()=>setView({n:"home"})} onSave={d=>{replaceCourse(d);log(user.name,"تحسين كورس بالذكاء الاصطناعي",d.title);setView({n:"home"})}} />
        : <AdminHome courses={courses} students={students} attempts={attempts} progress={progress} teachers={teachers} newsletters={newsletters} blocksAdmin={blocksAdmin} blockGroups={blockGroups} audit={audit}
          interventions={interventions} onAddIntervention={addIntervention} onUpdateIntervention={updateIntervention} onReopenAttempt={reopenAttempt} currentActor={user?.name||"رئيس القسم"}
          codes={codes} onUpdateCodes={next=>updateCodes(next,user.name)} orgEmail={orgEmail} onUpdateOrgEmail={email=>updateOrgEmail(email,user.name)}
          onSetTeacherEmail={(name,email)=>setTeacherEmail(name,email,user.name)} onAddTeacher={rec=>addTeacherAdmin(rec,user.name)} onDeleteTeacher={name=>deleteTeacherAdmin(name,user.name)} onSetTeacherCode={(name,code)=>setTeacherCodeAdmin(name,code,user.name)}
          onToggleTeacher={name=>{const v=teachers.map(t=>t.name===name?{...t,active:!t.active}:t);setTeachers(v);writeKey(K.teachers,v);log(user.name,"تبديل حالة معلم",name)}}
          onAddBlock={(g,b)=>{const list=[...(blocksAdmin[g]||DEFAULT_BLOCKS)];if(list.includes(b))return;const v={...blocksAdmin,[g]:[...list,b]};setBlocksAdmin(v);writeKey(K.blocksAdmin,v);log(user.name,"إضافة بلوك",`الصف ${g} — ${b}`)}}
          onRemoveBlock={(g,b)=>{const v={...blocksAdmin,[g]:(blocksAdmin[g]||DEFAULT_BLOCKS).filter(x=>x!==b)};setBlocksAdmin(v);writeKey(K.blocksAdmin,v);log(user.name,"حذف بلوك",`الصف ${g} — ${b}`)}}
          onSaveBlockGroup={(g,rec)=>{const next={...blockGroups,[g]:[...((blockGroups&&blockGroups[g])||[]),rec]};setBlockGroups(next);writeKey(K.blockGroups,next);log(user.name,"إضافة مجموعة بلوكات",`الصف ${g} — ${rec.name}`)}}
          onDeleteBlockGroup={(g,id)=>{const next={...blockGroups,[g]:((blockGroups&&blockGroups[g])||[]).filter(x=>x.id!==id)};setBlockGroups(next);writeKey(K.blockGroups,next);log(user.name,"حذف مجموعة بلوكات",`الصف ${g}`)}}
          onGenerateCourse={()=>setView({n:"admin-gen"})} onAIEditCourse={id=>setView({n:"admin-ai-edit",id})}
          onPublishAny={id=>{patchCourse(id,{status:"published"});log(user.name,"نشر كورس",id)}} onPublishWithDetails={(id,patch)=>{patchCourse(id,patch);log(user.name,"نشر كورس بتفاصيل كاملة",`${id} — الصف ${patch.grade} — الموعد ${patch.dueDate}`)}} onArchiveAny={id=>{patchCourse(id,{status:"archived"});log(user.name,"أرشفة كورس",id)}}
          onDeleteCourse={id=>{if(window.confirm("حذف الكورس نهائيًا؟")){deleteCourseRec(id);log(user.name,"حذف كورس",id)}}} onExportStudents={exportStudentsCSV} onExportAudit={exportAuditCSV} onImportStudents={importStudentsCSV} />
      ) : user.role === "teacher" ? (
        view.n === "gen" ? <Generator teacherName={user.name} onCancel={() => nav({ n: "home" })}
          onSave={(d) => { addCourse(d); log(user.name, "توليد كورس بالذكاء الاصطناعي", d.title); nav({ n: "home" }); }} />
        : view.n === "paste" ? <PasteReorganizer teacherName={user.name} onCancel={() => nav({ n: "home" })}
          onSave={(d) => { addCourse(d); log(user.name, "إعادة تنظيم كورس ملصوق", d.title); nav({ n: "home" }); }} />
        : view.n === "manual" ? <CourseBuilder teacherName={user.name} initial={view.edit ? course : null}
          onCancel={() => nav({ n: "home" })}
          onSave={(d) => { const exists = courses.some((c) => c.id === d.id); if (exists) replaceCourse(d); else addCourse(d); log(user.name, exists ? "تعديل كورس" : "إنشاء كورس يدوي", d.title); nav({ n: "home" }); }} />
        : view.n === "course" && course ? (
          <div className="wrap" style={{ paddingBottom: 60 }}>
            <button className="btn btn-q" onClick={goBack}>→ رجوع</button>
            <div className="card" style={{ padding: 24, marginTop: 10 }}>
              <h2>{course.title}</h2><p style={{ color: T.inkSoft }}>{course.objective}</p>
              {course.stages.map((s, i) => (<details key={i} style={{ borderTop: `1px solid ${T.ruleSoft}`, padding: "8px 0" }}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>{s.title}</summary><div style={{ marginTop: 8 }}><StageBody s={s} /></div></details>))}
              <h3 style={{ marginTop: 18 }}>بنك الاختبار ({cleanBank(course).length})</h3>
              {cleanBank(course).map((b, i) => (<div key={i} style={{ padding: "10px 0", borderTop: `1px solid ${T.ruleSoft}`, fontSize: 14 }}>
                <div style={{ fontWeight: 600 }}>{i + 1}. {b.q} <Chip>{QTYPE[b.t]}</Chip></div><div style={{ color: T.green }}>الصواب: {correctText(b)}</div><div style={{ color: T.inkSoft }}>{b.e}</div></div>))}
            </div>
          </div>
        ) : <TeacherHome teacherName={user.name} teacherEmail={user.email} courses={courses} attempts={attempts} progress={progress} students={students} newsletters={newsletters} onSaveNewsletter={saveNewsletter} onDeleteNewsletter={deleteNewsletter}
              onNew={() => nav({ n: "gen" })} onManual={() => nav({ n: "manual" })} onPaste={() => nav({ n: "paste" })}
              onView={(id) => nav({ n: "course", id })} onEdit={(id) => nav({ n: "manual", id, edit: true })}
              onPublish={(id) => { patchCourse(id, { status: "published" }); log(user.name, "نشر كورس", id); }}
              onArchive={(id) => { patchCourse(id, { status: "archived" }); log(user.name, "أرشفة كورس", id); }}
              onAssign={(id, patch) => { patchCourse(id, patch); log(user.name, "تخصيص كورس", id); }}
              onDuplicateCourse={(id) => {
                const src = courses.find((c) => c.id === id); if (!src) return;
                const copy = { ...src, id: uid(), title: src.title + " (نسخة)", status: "draft", students: [], publishedAt: null, dueDate: null, createdAt: new Date().toISOString() };
                addCourse(copy); log(user.name, "نسخ كورس", id);
              }}
              onSendReport={(student, token, payload) => {
                const rows = buildReport(student, courses, progress, attempts);
                const rec = { studentKey: student.key, rows, at: new Date().toISOString() };
                setParentTokens((prev) => ({ ...prev, [token]: rec }));
                putRecord(REC.parentTok, token, { __key: token, __val: rec });
                const reportUrl = `${window.location.origin}/?parent=${encodeURIComponent(token)}`;
                if (payload.email) {
                  notifyEmail(payload.email, `متابعة تقدم ${student.name} — بالعربي أحلى`,
                    `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9">
                       <p>عزيزي ولي الأمر،</p>
                       <p>يمكنكم متابعة أحدث تقدم للطالب <strong>${student.name}</strong> من خلال الرابط الآمن التالي:</p>
                       <p><a href="${reportUrl}" target="_blank" style="display:inline-block;background:#14746F;color:white;text-decoration:none;padding:11px 18px;border-radius:9px;font-weight:700">📊 فتح تقرير التقدم</a></p>
                       <p style="font-size:12px;color:#667085">رمز التقرير: ${token}</p>
                     </div>`);
                }
                log(user.name, "إرسال تقرير لولي أمر", `${student.name} — ${token}`);
              }}
              onExport={exportStudentsCSV} onImportFile={importStudentsFile}
              onTemplate={downloadStudentTemplate}
              onAddStudent={(data) => addStudentManual(data, user.name)}
              onRemoveStudent={(key) => removeStudent(key, user.name)} onEditStudent={(key, fields) => editStudent(key, fields, user.name)}
              onClearStudents={() => clearAllStudents(user.name)} />
      ) : view.n === "exam" && exam ? (
        <Exam course={exam.course} items={exam.items} onSubmit={submitExam} onCancel={() => { const id = exam.course.id; setExam(null); goBack(); }} />
      ) : view.n === "result" && attempt ? (
        <Result attempt={attempt} course={attCourse} onBack={goBack}
          onCert={(id) => nav({ n: "cert", id })} onRetry={() => startExam(attempt.course)}
          canRetry={attempts.filter((a) => a.student === user.key && a.course === attempt.course && a.cycle === attempt.cycle).length < ((attCourse && attCourse.tries) || phaseFor(attCourse.grade).tries)} />
      ) : view.n === "cert" && attempt ? (
        <Certificate attempt={attempt} course={attCourse} user={user} onBack={goBack} />
      ) : view.n === "course" && course ? (<>
        <div className="wrap noprint"><button className="btn btn-q" onClick={goBack}>→ رجوع</button></div>
        <CourseView user={user} course={course} progress={progress} attempts={attempts} onProgress={saveProgress} onStartExam={startExam} onCert={(id) => nav({ n: "cert", id })} />
      </>) : (
        <StudentHome user={user} courses={courses} progress={progress} attempts={attempts} newsletters={newsletters} onOpen={(id) => nav({ n: "course", id })} onCert={(id) => nav({ n: "cert", id })} />
      )}
    </div>
  );
}
