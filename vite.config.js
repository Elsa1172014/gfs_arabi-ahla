import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Student login hardening:
// - accept only a two-part or three-part entered name
// - require an exact registered student key (grade + block + six-digit ID)
// - compare the entered 2/3 name parts with the beginning of the stored full name
// - never create or admit an unregistered student from the login form
function studentLoginCompatibility() {
  return {
    name: "student-login-compatibility",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("/src/App.jsx") && !id.endsWith("\\src\\App.jsx")) return null;
      let next = code;

      next = next.replaceAll(
        'f.name.trim().split(/\\s+/).length < 3',
        '(f.name.trim().split(/\\s+/).length < 2 || f.name.trim().split(/\\s+/).length > 3)'
      );

      next = next.replace(
        'if (normalize(existing.name) !== normalize(f.name)) return setErr("الاسم المُدخَل لا يطابق الاسم المسجَّل لهذا الرقم التعريفي. تحقّق من كتابة اسمك كما هو مسجَّل بالضبط.");',
        'const enteredParts = normalize(f.name).split(" ").filter(Boolean); const storedParts = normalize(existing.name).split(" ").filter(Boolean); if ((enteredParts.length !== 2 && enteredParts.length !== 3) || storedParts.length < enteredParts.length || enteredParts.some((part, i) => part !== storedParts[i])) return setErr("الاسم المُدخَل لا يطابق الاسم المسجَّل لهذا الرقم التعريفي. اكتب أول اسمين أو أول ثلاثة أسماء كما هي في قائمة الطلاب.");'
      );

      next = next.replaceAll('الاسم الثلاثي', 'اسم الطالب (ثنائي أو ثلاثي)');
      next = next.replaceAll('placeholder="سالم أحمد الكعبي"', 'placeholder="مثال: أحمد محمد أو أحمد محمد علي"');
      return next === code ? null : { code: next, map: null };
    },
  };
}

// Publishing compatibility: a published course can be published again for a
// different grade/blocks without mutating or deleting the original publication.
// The new audience gets a new course id, so attempts/results remain separated.
function multiGradePublishing() {
  return {
    name: "multi-grade-publishing",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("/src/App.jsx") && !id.endsWith("\\src\\App.jsx")) return null;
      let next = code;

      next = next.replace(
        'function TeacherHome({ teacherName, teacherEmail, courses, attempts, progress, students, newsletters = [], onSaveNewsletter, onDeleteNewsletter, onNew, onManual, onPaste, onPublish, onView, onEdit, onAssign, onArchive, onSendReport, onExport, onImportFile, onTemplate, onAddStudent, onRemoveStudent, onEditStudent, onClearStudents, onDuplicateCourse })',
        'function TeacherHome({ teacherName, teacherEmail, courses, attempts, progress, students, newsletters = [], onSaveNewsletter, onDeleteNewsletter, onNew, onManual, onPaste, onPublish, onView, onEdit, onAssign, onArchive, onSendReport, onExport, onImportFile, onTemplate, onAddStudent, onRemoveStudent, onEditStudent, onClearStudents, onDuplicateCourse, onRepublishCourse })'
      );

      next = next.replace(
        '{c.status !== "published" && <button className="btn btn-o" onClick={() => setPublishOpen(publishOpen === c.id ? null : c.id)}>{publishOpen === c.id ? "إغلاق" : "انشر"}</button>}',
        '{c.status !== "published" && <button className="btn btn-o" onClick={() => setPublishOpen(publishOpen === c.id ? null : c.id)}>{publishOpen === c.id ? "إغلاق" : "انشر"}</button>}{c.status === "published" && <button className="btn btn-o" onClick={() => setPublishOpen(publishOpen === c.id ? null : c.id)}>{publishOpen === c.id ? "إغلاق" : "نشر لصف آخر"}</button>}'
      );

      next = next.replace(
        '{publishOpen === c.id && <PublishPanel course={c} students={students} onClose={() => setPublishOpen(null)} onPublish={(patch) => { onAssign(c.id, patch); setPublishOpen(null); }} />}',
        '{publishOpen === c.id && <PublishPanel course={c} students={students} onClose={() => setPublishOpen(null)} onPublish={(patch) => { if (c.status === "published" && onRepublishCourse) onRepublishCourse(c.id, patch); else onAssign(c.id, patch); setPublishOpen(null); }} />}'
      );

      next = next.replace(
        '              onDuplicateCourse={(id) => {',
        '              onRepublishCourse={(id, patch) => {\n                const src = courses.find((c) => c.id === id); if (!src) return;\n                const now = new Date().toISOString();\n                const copy = { ...src, ...patch, id: uid(), sourceCourseId: src.sourceCourseId || src.id, title: src.title, status: "published", publishedAt: now, createdAt: now };\n                addCourse(copy); log(user.name, "نشر الكورس لصف آخر", `${src.title} — الصف ${patch.grade}`);\n              }}\n              onDuplicateCourse={(id) => {'
      );

      next = next.replace(
        '  onGenerateCourse, onAIEditCourse, onPublishAny, onPublishWithDetails, onArchiveAny, onDeleteCourse, onExportStudents, onExportAudit, onImportStudents,',
        '  onGenerateCourse, onAIEditCourse, onPublishAny, onPublishWithDetails, onRepublishAny, onArchiveAny, onDeleteCourse, onExportStudents, onExportAudit, onImportStudents,'
      );

      next = next.replace(
        '{c.status!=="published"&&<button className="btn btn-q" onClick={()=>setAdminPublishOpen(adminPublishOpen===c.id?null:c.id)}>{adminPublishOpen===c.id?"إغلاق":"نشر"}</button>}',
        '{c.status!=="published"&&<button className="btn btn-q" onClick={()=>setAdminPublishOpen(adminPublishOpen===c.id?null:c.id)}>{adminPublishOpen===c.id?"إغلاق":"نشر"}</button>}{c.status==="published"&&<button className="btn btn-q" onClick={()=>setAdminPublishOpen(adminPublishOpen===c.id?null:c.id)}>{adminPublishOpen===c.id?"إغلاق":"نشر لصف آخر"}</button>}'
      );

      next = next.replace(
        '{adminPublishOpen===c.id&&<PublishPanel course={c} students={students} onClose={()=>setAdminPublishOpen(null)} onPublish={patch=>{onPublishWithDetails(c.id,patch);setAdminPublishOpen(null)}}/>}',
        '{adminPublishOpen===c.id&&<PublishPanel course={c} students={students} onClose={()=>setAdminPublishOpen(null)} onPublish={patch=>{if(c.status==="published"&&onRepublishAny)onRepublishAny(c.id,patch);else onPublishWithDetails(c.id,patch);setAdminPublishOpen(null)}}/>}'
      );

      next = next.replace(
        'onPublishAny={id=>{patchCourse(id,{status:"published"});log(user.name,"نشر كورس",id)}} onPublishWithDetails={(id,patch)=>{patchCourse(id,patch);log(user.name,"نشر كورس بتفاصيل كاملة",`${id} — الصف ${patch.grade} — الموعد ${patch.dueDate}`)}} onArchiveAny=',
        'onPublishAny={id=>{patchCourse(id,{status:"published"});log(user.name,"نشر كورس",id)}} onPublishWithDetails={(id,patch)=>{patchCourse(id,patch);log(user.name,"نشر كورس بتفاصيل كاملة",`${id} — الصف ${patch.grade} — الموعد ${patch.dueDate}`)}} onRepublishAny={(id,patch)=>{const src=courses.find(c=>c.id===id);if(!src)return;const now=new Date().toISOString();const copy={...src,...patch,id:uid(),sourceCourseId:src.sourceCourseId||src.id,title:src.title,status:"published",publishedAt:now,createdAt:now};addCourse(copy);log(user.name,"نشر الكورس لصف آخر",`${src.title} — الصف ${patch.grade}`)}} onArchiveAny='
      );

      return next === code ? null : { code: next, map: null };
    },
  };
}

export default defineConfig({
  plugins: [studentLoginCompatibility(), multiGradePublishing(), react()],
});
