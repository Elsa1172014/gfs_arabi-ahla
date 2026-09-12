import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Student login compatibility:
// - accept any registered name beginning with at least two matching name parts
// - validate against the real student record + last six ID digits
// - derive the student's real grade/block from the stored record
function studentLoginCompatibility() {
  return {
    name: "student-login-compatibility",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("/src/App.jsx") && !id.endsWith("\\src\\App.jsx")) return null;
      let next = code;

      const oldGo = `  const go = () => {
    if (f.name.trim().split(/\\s+/).length < 3) return setErr("اكتب الاسم الثلاثي كاملًا.");
    if (!/^\\d{6}$/.test(f.sid)) return setErr("أدخل آخر ستة أرقام من الرقم المدرسي.");
    const key = \`\${f.grade}-\${f.block}-\${f.sid}\`;
    const existing = (students || []).find((s) => s.key === key);
    if (!existing) return setErr("هذه البيانات غير مسجَّلة في قائمة الطلاب. راجع معلمك للتأكّد من تسجيلك في القائمة.");
    const normalize = (n) => n.trim().replace(/\\s+/g, " ").toLowerCase();
    if (normalize(existing.name) !== normalize(f.name)) return setErr("الاسم المُدخَل لا يطابق الاسم المسجَّل لهذا الرقم التعريفي. تحقّق من كتابة اسمك كما هو مسجَّل بالضبط.");
    setErr(""); setWelcomeName(existing.name);
    setTimeout(() => onStudent({ ...f, name: existing.name, role: "student", key,
      email: existing.email || f.email || "", parentEmail: existing.parentEmail || "", teacherEmail: existing.teacherEmail || "" }), 900);
  };`;

      const newGo = `  const go = () => {
    const normalize = (n) => String(n || "").trim().replace(/\\s+/g, " ").toLowerCase();
    const enteredParts = normalize(f.name).split(" ").filter(Boolean);
    if (enteredParts.length < 2) return setErr("اكتب اسم الطالب من كلمتين على الأقل كما هو مسجّل في المنصة.");
    const sid = String(f.sid || "").replace(/\\D/g, "").slice(-6).padStart(6, "0");
    if (!/^\\d{6}$/.test(sid)) return setErr("أدخل آخر ستة أرقام من الرقم المدرسي.");
    const lastSix = (s) => String(s?.schoolId ?? s?.sid ?? s?.studentId ?? s?.key ?? "").replace(/\\D/g, "").slice(-6).padStart(6, "0");
    const matches = (students || []).filter((s) => {
      if (!s?.name || lastSix(s) !== sid) return false;
      const storedParts = normalize(s.name).split(" ").filter(Boolean);
      return storedParts.length >= enteredParts.length && enteredParts.every((part, i) => part === storedParts[i]);
    });
    if (!matches.length) return setErr("الاسم أو آخر ستة أرقام من الرقم المدرسي لا يطابقان بيانات طالب مسجّل في المنصة.");
    if (matches.length > 1) return setErr("وجدنا أكثر من سجل مطابق. راجع معلمك للتأكد من بيانات الطالب.");
    const existing = matches[0];
    const key = existing.key || \`\${existing.grade}-\${existing.block}-\${sid}\`;
    setErr(""); setWelcomeName(existing.name);
    setTimeout(() => onStudent({ ...f, grade: existing.grade ?? f.grade, block: existing.block ?? f.block, stream: existing.stream || f.stream || "A", name: existing.name, sid, role: "student", key,
      email: existing.email || f.email || "", parentEmail: existing.parentEmail || "", teacherEmail: existing.teacherEmail || "" }), 900);
  };`;

      if (next.includes(oldGo)) next = next.replace(oldGo, newGo);
      else next = next.replaceAll('f.name.trim().split(/\\s+/).length < 3','f.name.trim().split(/\\s+/).length < 2');

      next = next.replaceAll('الاسم الثلاثي', 'اسم الطالب');
      next = next.replaceAll('placeholder="سالم أحمد الكعبي"', 'placeholder="اكتب الاسم كما هو مسجّل في المنصة"');
      return next === code ? null : { code: next, map: null };
    },
  };
}

function multiGradePublishing() {
  return {
    name: "multi-grade-publishing",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("/src/App.jsx") && !id.endsWith("\\src\\App.jsx")) return null;
      let next = code;
      next = next.replace('function TeacherHome({ teacherName, teacherEmail, courses, attempts, progress, students, newsletters = [], onSaveNewsletter, onDeleteNewsletter, onNew, onManual, onPaste, onPublish, onView, onEdit, onAssign, onArchive, onSendReport, onExport, onImportFile, onTemplate, onAddStudent, onRemoveStudent, onEditStudent, onClearStudents, onDuplicateCourse })','function TeacherHome({ teacherName, teacherEmail, courses, attempts, progress, students, newsletters = [], onSaveNewsletter, onDeleteNewsletter, onNew, onManual, onPaste, onPublish, onView, onEdit, onAssign, onArchive, onSendReport, onExport, onImportFile, onTemplate, onAddStudent, onRemoveStudent, onEditStudent, onClearStudents, onDuplicateCourse, onRepublishCourse })');
      next = next.replace('{c.status !== "published" && <button className="btn btn-o" onClick={() => setPublishOpen(publishOpen === c.id ? null : c.id)}>{publishOpen === c.id ? "إغلاق" : "انشر"}</button>}','{c.status !== "published" && <button className="btn btn-o" onClick={() => setPublishOpen(publishOpen === c.id ? null : c.id)}>{publishOpen === c.id ? "إغلاق" : "انشر"}</button>}{c.status === "published" && <button className="btn btn-o" onClick={() => setPublishOpen(publishOpen === c.id ? null : c.id)}>{publishOpen === c.id ? "إغلاق" : "نشر لصف آخر"}</button>}');
      next = next.replace('{publishOpen === c.id && <PublishPanel course={c} students={students} onClose={() => setPublishOpen(null)} onPublish={(patch) => { onAssign(c.id, patch); setPublishOpen(null); }} />}','{publishOpen === c.id && <PublishPanel course={c} students={students} onClose={() => setPublishOpen(null)} onPublish={(patch) => { if (c.status === "published" && onRepublishCourse) onRepublishCourse(c.id, patch); else onAssign(c.id, patch); setPublishOpen(null); }} />}');
      next = next.replace('              onDuplicateCourse={(id) => {','              onRepublishCourse={(id, patch) => {\n                const src = courses.find((c) => c.id === id); if (!src) return;\n                const now = new Date().toISOString();\n                const copy = { ...src, ...patch, id: uid(), sourceCourseId: src.sourceCourseId || src.id, title: src.title, status: "published", publishedAt: now, createdAt: now };\n                addCourse(copy); log(user.name, "نشر الكورس لصف آخر", `${src.title} — الصف ${patch.grade}`);\n              }}\n              onDuplicateCourse={(id) => {');
      next = next.replace('  onGenerateCourse, onAIEditCourse, onPublishAny, onPublishWithDetails, onArchiveAny, onDeleteCourse, onExportStudents, onExportAudit, onImportStudents,','  onGenerateCourse, onAIEditCourse, onPublishAny, onPublishWithDetails, onRepublishAny, onArchiveAny, onDeleteCourse, onExportStudents, onExportAudit, onImportStudents,');
      next = next.replace('{c.status!=="published"&&<button className="btn btn-q" onClick={()=>setAdminPublishOpen(adminPublishOpen===c.id?null:c.id)}>{adminPublishOpen===c.id?"إغلاق":"نشر"}</button>}','{c.status!=="published"&&<button className="btn btn-q" onClick={()=>setAdminPublishOpen(adminPublishOpen===c.id?null:c.id)}>{adminPublishOpen===c.id?"إغلاق":"نشر"}</button>}{c.status==="published"&&<button className="btn btn-q" onClick={()=>setAdminPublishOpen(adminPublishOpen===c.id?null:c.id)}>{adminPublishOpen===c.id?"إغلاق":"نشر لصف آخر"}</button>}');
      next = next.replace('{adminPublishOpen===c.id&&<PublishPanel course={c} students={students} onClose={()=>setAdminPublishOpen(null)} onPublish={patch=>{onPublishWithDetails(c.id,patch);setAdminPublishOpen(null)}}/>}','{adminPublishOpen===c.id&&<PublishPanel course={c} students={students} onClose={()=>setAdminPublishOpen(null)} onPublish={patch=>{if(c.status==="published"&&onRepublishAny)onRepublishAny(c.id,patch);else onPublishWithDetails(c.id,patch);setAdminPublishOpen(null)}}/>}');
      next = next.replace('onPublishAny={id=>{patchCourse(id,{status:"published"});log(user.name,"نشر كورس",id)}} onPublishWithDetails={(id,patch)=>{patchCourse(id,patch);log(user.name,"نشر كورس بتفاصيل كاملة",`${id} — الصف ${patch.grade} — الموعد ${patch.dueDate}`)}} onArchiveAny=','onPublishAny={id=>{patchCourse(id,{status:"published"});log(user.name,"نشر كورس",id)}} onPublishWithDetails={(id,patch)=>{patchCourse(id,patch);log(user.name,"نشر كورس بتفاصيل كاملة",`${id} — الصف ${patch.grade} — الموعد ${patch.dueDate}`)}} onRepublishAny={(id,patch)=>{const src=courses.find(c=>c.id===id);if(!src)return;const now=new Date().toISOString();const copy={...src,...patch,id:uid(),sourceCourseId:src.sourceCourseId||src.id,title:src.title,status:"published",publishedAt:now,createdAt:now};addCourse(copy);log(user.name,"نشر الكورس لصف آخر",`${src.title} — الصف ${patch.grade}`)}} onArchiveAny=');
      return next === code ? null : { code: next, map: null };
    },
  };
}

export default defineConfig({ plugins: [studentLoginCompatibility(), multiGradePublishing(), react()] });
