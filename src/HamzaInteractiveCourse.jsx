import React, { useMemo, useState } from "react";

const strength = { "ِ": 4, "ُ": 3, "َ": 2, "ْ": 1 };
const seat = { 4: "ئ", 3: "ؤ", 2: "أ", 1: "ء" };

const Q = [
  {type:"mcq",p:"في كلمة «سُئِلَ»، ما الحركة الأقوى التي حكمت كتابة الهمزة؟",o:["الكسرة","الضمة","الفتحة","السكون"],a:0,why:"الهمزة مكسورة وما قبلها مضموم؛ والكسرة أقوى من الضمة."},
  {type:"mcq",p:"اختر الكتابة الصحيحة للكلمة التي تعني: شخص يصدق ويطمئن قلبه.",o:["مُأْمِن","مُؤْمِن","مُئْمِن","مُءْمِن"],a:1,why:"الهمزة ساكنة وما قبلها مضموم؛ الضمة أقوى فتكتب على الواو."},
  {type:"mcq",p:"أي كلمة كُتبت همزتها المتوسطة على الألف لأن الفتحة هي الأقوى؟",o:["سَأَلَ","بِئْر","رُؤْية","فِئَة"],a:0,why:"في «سأل» الهمزة مفتوحة وما قبلها مفتوح، فناسب الألف."},
  {type:"mcq",p:"أنت محرر صحيفة المدرسة. أي تصحيح تعتمد للجملة: «قرأتُ مسألةً صعبة»؟",o:["مسئلة","مسؤلة","مسألة","مسءلة"],a:2,why:"الهمزة مفتوحة وما قبلها ساكن؛ الفتحة أقوى من السكون فتكتب على الألف."},
  {type:"mcq",p:"في «فِئَة»، قارن حركة الهمزة بحركة الحرف السابق. ما القرار؟",o:["الفتحة أقوى → أ","الكسرة أقوى → ئ","الضمة أقوى → ؤ","السكون أقوى → ء"],a:1,why:"ما قبل الهمزة مكسور والهمزة مفتوحة؛ الكسرة أقوى فتكتب على نبرة."},
  {type:"mcq",p:"اختر الكلمة التي تنتمي إلى مجموعة «همزة على الواو».",o:["رَأْس","ذِئْب","رُؤْيَة","سَائِل"],a:2,why:"في «رؤية» تناسب الضمة كرسي الواو."},
  {type:"mcq",p:"أي تفسير أدق لكتابة الهمزة في «بِئْر»؟",o:["لأن الهمزة مفتوحة","لأن ما قبلها مكسور والكسرة أقوى","لأن ما قبلها مضموم","لأن الهمزة في أول الكلمة"],a:1,why:"الهمزة ساكنة وما قبلها مكسور؛ الكسرة أقوى الحركات."},
  {type:"mcq",p:"أكمل: يَـ...ـس. اختر الشكل الصحيح للهمزة.",o:["أ","ؤ","ئ","ء"],a:0,why:"الكلمة «يَأْس»: الهمزة ساكنة وما قبلها مفتوح؛ الفتحة أقوى فتناسب الألف."},
  {type:"mcq",p:"وجدت على لوحة الصف كلمة «مُئَذِّن». ما التصحيح؟",o:["مُؤَذِّن","مُأَذِّن","مُءَذِّن","مِئَذِّن"],a:0,why:"الهمزة مفتوحة وما قبلها مضموم؛ الضمة أقوى فتكتب على الواو."},
  {type:"mcq",p:"أي زوج يشترك في كتابة الهمزة على نبرة؟",o:["بئر – فئة","رأس – مأمن","رؤية – مؤمن","سأل – يأكل"],a:0,why:"في الكلمتين غلبت الكسرة فناسبتها النبرة."},
  {type:"mcq",p:"رتّب التفكير الصحيح قبل رسم الهمزة المتوسطة.",o:["أختار الكرسي ثم أبحث عن الحركة","أحدد حركة الهمزة وما قبلها ثم أقارن القوة ثم أختار الكرسي","أنظر إلى آخر الكلمة فقط","أختار الشكل الأكثر شيوعًا"],a:1,why:"القرار الصحيح يبدأ بالحركتين ثم المقارنة ثم الكرسي."},
  {type:"mcq",p:"في كلمة «مَسْأَلَة»، ما الحركة التي هزمت السكون؟",o:["الكسرة","الضمة","الفتحة","لا توجد حركة"],a:2,why:"الهمزة مفتوحة وما قبلها ساكن؛ الفتحة أقوى."},
  {type:"mcq",p:"اختر الجملة الخالية من خطأ في الهمزة المتوسطة.",o:["رأيتُ ذءبًا بعيدًا.","هذه فأة نشيطة.","سُئِلَ الطالبُ عن رأيه.","المأمنُ يقرءُ الدرس."],a:2,why:"«سُئِل» صحيحة: كسرة الهمزة أقوى من ضمة ما قبلها."},
  {type:"mcq",p:"إذا كانت الهمزة مضمومة وما قبلها مفتوحًا، فأي كرسي تتوقع؟",o:["الألف","الواو","النبرة","السطر"],a:1,why:"الضمة أقوى من الفتحة، والواو تناسب الضمة."},
  {type:"mcq",p:"إذا كانت الهمزة مفتوحة وما قبلها مكسورًا، فما القرار؟",o:["أ","ؤ","ئ","ء"],a:2,why:"الكسرة أقوى من الفتحة، فتكتب الهمزة على نبرة."},
  {type:"mcq",p:"اختر الكلمة الدخيلة في مجموعة الكلمات المكتوبة على الألف.",o:["سأل","رأس","مأمن","بئر"],a:3,why:"«بئر» همزتها على نبرة، أما البقية فعلى الألف."},
  {type:"mcq",p:"طالب قال: «أنظر إلى حركة الهمزة فقط». ما ردك العلمي؟",o:["صحيح دائمًا","خطأ؛ نقارن حركة الهمزة بحركة ما قبلها","صحيح إذا كانت الكلمة طويلة","لا توجد قاعدة"],a:1,why:"القاعدة العامة تقوم على مقارنة الحركتين واختيار الأقوى."},
  {type:"mcq",p:"ما الكرسي المناسب للحركة الأقوى «الكسرة»؟",o:["واو","ألف","نبرة/ياء","السطر"],a:2,why:"الكسرة تناسب النبرة (ئ)."},
  {type:"mcq",p:"ما الكرسي المناسب للحركة الأقوى «الضمة»؟",o:["ؤ","أ","ئ","ء"],a:0,why:"الضمة تناسب الواو."},
  {type:"mcq",p:"ما الكرسي المناسب للحركة الأقوى «الفتحة» في القاعدة العامة؟",o:["ئ","ؤ","أ","ء"],a:2,why:"الفتحة تناسب الألف."},
  {type:"mcq",p:"في تحدي السرعة: همزة ساكنة + حرف سابق مكسور. اختر النتيجة.",o:["ئ","ؤ","أ","ء"],a:0,why:"الكسرة أقوى من السكون، فتكتب على نبرة."},
  {type:"mcq",p:"همزة ساكنة + حرف سابق مضموم. اختر النتيجة.",o:["أ","ئ","ؤ","ء"],a:2,why:"الضمة أقوى من السكون، فتكتب على الواو."},
  {type:"mcq",p:"همزة ساكنة + حرف سابق مفتوح. اختر النتيجة.",o:["أ","ؤ","ئ","ء"],a:0,why:"الفتحة أقوى من السكون، فتكتب على الألف."},
  {type:"mcq",p:"أي عبارة تلخص «ميزان الهمزة» بأقل كلمات؟",o:["الأطول يفوز","الأقوى حركةً يحدد الكرسي","الهمزة دائمًا على ألف","الحرف الأخير يحدد الكرسي"],a:1,why:"هذه هي الفكرة المركزية للقاعدة العامة."},
  {type:"mcq",p:"مهمة الخبير: أي كلمة تصلح مثالًا نهائيًا على تغلب الكسرة على الضمة؟",o:["سُئِلَ","سَأَلَ","مُؤْمِن","رَأْس"],a:0,why:"في «سُئِل» الهمزة مكسورة وما قبلها مضموم؛ الكسرة أقوى."}
];

const stages = ["انطلق","شاهد","اكتشف","مختبر الحركات","الخريطة","تدرّب","المحاكاة","التحدي النهائي"];

export default function HamzaInteractiveCourse({ initialAttempt = 1, maxAttempts = 4, onFinish }) {
  const [stage,setStage]=useState(0); const [attempt,setAttempt]=useState(initialAttempt);
  const [videoDone,setVideoDone]=useState(false); const [answers,setAnswers]=useState({}); const [submitted,setSubmitted]=useState(false);
  const [hamzaMove,setHamzaMove]=useState("ْ"); const [prevMove,setPrevMove]=useState("ُ");
  const progress=Math.round((stage/(stages.length-1))*100);
  const score=useMemo(()=>Q.reduce((n,q,i)=>n+(answers[i]===q.a?1:0),0),[answers]);
  const pct=Math.round(score/Q.length*100);
  const strongest=Math.max(strength[hamzaMove],strength[prevMove]);
  const resetAttempt=()=>{ if(attempt>=maxAttempts)return; setAttempt(x=>x+1);setAnswers({});setSubmitted(false);setStage(1); };
  const finish=()=>{setSubmitted(true);onFinish?.({score,total:Q.length,percentage:pct,attempt});};
  const go=n=>setStage(Math.max(0,Math.min(stages.length-1,n)));
  return <div dir="rtl" style={{fontFamily:'"Noto Sans Arabic","Segoe UI",sans-serif',background:"#f5f7f6",minHeight:"100vh",color:"#123"}}>
    <style>{`.hc{max-width:1080px;margin:auto;padding:22px}.hero{background:linear-gradient(135deg,#102a43,#126e68);color:white;border-radius:24px;padding:26px;box-shadow:0 18px 50px #0002}.glass{background:#ffffff12;border:1px solid #ffffff30;border-radius:16px;padding:14px}.bar{height:12px;background:#ffffff2b;border-radius:20px;overflow:hidden}.bar i{display:block;height:100%;background:#ffd166;transition:.4s}.cardx{background:white;border:1px solid #dfe8e5;border-radius:20px;padding:22px;margin-top:18px;box-shadow:0 10px 28px #1231}.navx{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.pill{border:1px solid #cddbd7;background:white;border-radius:999px;padding:8px 12px}.pill.on{background:#126e68;color:white}.big{font-size:clamp(28px,5vw,56px);font-weight:900}.moves{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.move{padding:16px;border:2px solid #dce7e4;border-radius:16px;background:white;font-size:24px;cursor:pointer}.move.on{border-color:#126e68;background:#e7f5f2}.concept{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.concept>div{padding:18px;border-radius:18px;text-align:center;background:#eef6f4}.q{padding:18px;border:1px solid #dfe8e5;border-radius:16px;margin:12px 0}.op{display:block;width:100%;text-align:right;padding:11px;margin:7px 0;border:1px solid #dbe4e1;border-radius:12px;background:white;cursor:pointer}.op.sel{border-color:#126e68;background:#e8f6f3}.feedback{padding:10px;border-radius:10px;background:#f5f7f6;margin-top:8px}.cta{border:0;border-radius:13px;padding:11px 18px;background:#126e68;color:white;font-weight:800;cursor:pointer}.cta:disabled{opacity:.4}.secondary{background:#e8efed;color:#123}@media(max-width:700px){.concept,.moves{grid-template-columns:1fr 1fr}.hc{padding:12px}}`}</style>
    <main className="hc">
      <section className="hero"><div style={{display:"flex",justifyContent:"space-between",gap:18,flexWrap:"wrap"}}><div><div>مختبر العربية التفاعلي</div><h1 className="big">الهمزة المتوسطة</h1><p>شاهد • اكتشف • حاكِ • طبّق • أتقن</p></div><div className="glass" style={{minWidth:240}}><b>الإنجاز {progress}%</b><div className="bar"><i style={{width:`${progress}%`}}/></div><div style={{marginTop:10}}>المحاولة <b>{attempt}</b> من <b>{maxAttempts}</b></div></div></div>
      <div className="navx">{stages.map((s,i)=><span key={s} className={`pill ${i===stage?'on':''}`}>{i+1}. {s}</span>)}</div></section>

      {stage===0&&<section className="cardx"><h2>⚡ تحدّي البداية</h2><p>تأمل: <b>سُئِلَ — سَأَلَ — بِئْر — مُؤْمِن</b></p><p>لماذا تغيّر كرسي الهمزة؟ في هذا المختبر لن تحفظ الإجابة؛ ستكتشفها بنفسك.</p><button className="cta" onClick={()=>go(1)}>ابدأ الرحلة</button></section>}

      {stage===1&&<section className="cardx"><h2>🎬 شاهد واكتشف</h2><div style={{aspectRatio:"16/9",background:"#0b1720",borderRadius:18,overflow:"hidden"}}><iframe title="شرح الهمزة المتوسطة" width="100%" height="100%" src="https://www.youtube.com/embed/N99RtSaAEj4" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><p>بعد مشاهدة الشرح، أكد أنك أكملت الفيديو لتفتح مرحلة الاكتشاف. في النسخة المدمجة مع المنصة يمكن ربط هذا بزر التقدم عبر YouTube Player API.</p><label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" checked={videoDone} onChange={e=>setVideoDone(e.target.checked)}/> أكملت مشاهدة الفيديو</label><br/><button className="cta" disabled={!videoDone} onClick={()=>go(2)}>افتح الاكتشاف</button></section>}

      {stage===2&&<section className="cardx"><h2>👁️ اكتشف النمط</h2><div className="concept"><div><div className="big">ئ</div><b>بِئْر</b><p>الكسرة تتصدر</p></div><div><div className="big">ؤ</div><b>مُؤْمِن</b><p>الضمة تتصدر</p></div><div><div className="big">أ</div><b>سَأَلَ</b><p>الفتحة تتصدر</p></div><div><div className="big">ء</div><b>قراءة</b><p>حالات خاصة على السطر</p></div></div><p>الفكرة: نقارن <b>حركة الهمزة</b> و<b>حركة الحرف السابق</b>، ثم نجعل الحركة الأقوى تقود القرار.</p><button className="cta" onClick={()=>go(3)}>ادخل مختبر الحركات</button></section>}

      {stage===3&&<section className="cardx"><h2>🔬 مختبر الحركات</h2><p>اختر حركة الهمزة وحركة الحرف الذي قبلها، وشاهد القرار يتكوّن أمامك.</p><h3>حركة الهمزة</h3><div className="moves">{Object.keys(strength).map(m=><button className={`move ${hamzaMove===m?'on':''}`} onClick={()=>setHamzaMove(m)} key={m}>{m}</button>)}</div><h3>حركة ما قبل الهمزة</h3><div className="moves">{Object.keys(strength).map(m=><button className={`move ${prevMove===m?'on':''}`} onClick={()=>setPrevMove(m)} key={m}>{m}</button>)}</div><div className="glass" style={{background:"#e8f6f3",marginTop:18,color:"#123"}}><div>الحركة الأقوى درجتها: <b>{strongest}</b></div><div className="big">الكرسي المتوقع: {seat[strongest]}</div></div><button className="cta" style={{marginTop:14}} onClick={()=>go(4)}>افتح خريطة القوة</button></section>}

      {stage===4&&<section className="cardx"><h2>🗺️ خريطة قوة الحركات</h2><div className="concept"><div><div className="big">ِ</div><b>1 — الكسرة</b><p>تناسبها ئ</p></div><div><div className="big">ُ</div><b>2 — الضمة</b><p>تناسبها ؤ</p></div><div><div className="big">َ</div><b>3 — الفتحة</b><p>تناسبها أ</p></div><div><div className="big">ْ</div><b>4 — السكون</b><p>الأضعف</p></div></div><p><b>خوارزمية القرار:</b> حدّد الحركتين ← قارن القوة ← اختر كرسي الحركة الأقوى ← راجع الحالات الخاصة.</p><button className="cta" onClick={()=>go(5)}>تدرّب</button></section>}

      {stage===5&&<section className="cardx"><h2>🧩 ابنِ الكلمة</h2><p>مثال: في <b>مُؤْمِن</b> الهمزة ساكنة وما قبلها مضموم. الضمة أقوى من السكون، لذلك جلست الهمزة على الواو.</p><p>وفي <b>سُئِلَ</b> الهمزة مكسورة وما قبلها مضموم. الكسرة أقوى، لذلك جلست على النبرة.</p><div className="glass" style={{background:"#fff8e8",color:"#123"}}>💡 لا تحفظ شكل الكلمة وحده. اسأل دائمًا: ما حركة الهمزة؟ ما حركة ما قبلها؟ أيهما أقوى؟</div><button className="cta" style={{marginTop:14}} onClick={()=>go(6)}>شغّل المحاكاة</button></section>}

      {stage===6&&<section className="cardx"><h2>🎮 محاكاة «ميزان الهمزة»</h2><p>غيّر الحركات في المختبر السابق وجرّب جميع التركيبات. الهدف أن تتنبأ بالكرسي قبل ظهوره.</p><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:18,fontSize:30,flexWrap:"wrap"}}><span>حركة ما قبلها {prevMove}</span><b>⚖️</b><span>حركة الهمزة {hamzaMove}</span><b>→ {seat[strongest]}</b></div><button className="cta" style={{marginTop:18}} onClick={()=>go(7)}>ابدأ 25 تحديًا</button></section>}

      {stage===7&&<section className="cardx"><h2>🏆 تحدّي الإتقان — 25 مهمة</h2><p>لا توجد نسخ مكررة للسؤال نفسه؛ تتغير زاوية التفكير والسياق والمهمة.</p>{Q.map((q,i)=><div className="q" key={i}><b>{i+1}. {q.p}</b>{q.o.map((o,j)=><button disabled={submitted} key={o} className={`op ${answers[i]===j?'sel':''}`} onClick={()=>setAnswers(a=>({...a,[i]:j}))}>{o}</button>)}{submitted&&<div className="feedback">{answers[i]===q.a?'✅ أحسنت':'❌ راجع قرارك'} — {q.why}</div>}</div>)}
      {!submitted?<button className="cta" disabled={Object.keys(answers).length<Q.length} onClick={finish}>إنهاء المحاولة</button>:<div className="glass" style={{background:pct>=70?'#e8f6f3':'#fff1ee',color:"#123"}}><h2>نتيجتك: {score}/{Q.length} — {pct}%</h2><p>{pct>=70?'🎉 أتقنت المهارة.':'تحتاج إلى جولة تعلم أخرى. اقرأ التغذية الراجعة ثم حاول من جديد.'}</p>{attempt<maxAttempts&&<button className="cta" onClick={resetAttempt}>محاولة جديدة ({maxAttempts-attempt} متبقية)</button>}{attempt>=maxAttempts&&<p><b>استخدمت المحاولات الأربع.</b></p>}</div>}</section>}
    </main>
  </div>;
}
