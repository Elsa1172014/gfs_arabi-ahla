import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Keep the student login source aligned with the platform requirement:
// accept a two-part or three-part entered name. The registered full name is
// still resolved against the stored student record before final entry.
function studentLoginCompatibility() {
  return {
    name: "student-login-compatibility",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("/src/App.jsx") && !id.endsWith("\\src\\App.jsx")) return null;
      let next = code;
      next = next.replaceAll(
        'f.name.trim().split(/\\s+/).length < 3',
        'f.name.trim().split(/\\s+/).length < 2'
      );
      next = next.replaceAll('الاسم الثلاثي', 'اسم الطالب (ثنائي أو ثلاثي)');
      next = next.replaceAll('placeholder="سالم أحمد الكعبي"', 'placeholder="مثال: أحمد محمد أو أحمد محمد علي"');
      return next === code ? null : { code: next, map: null };
    },
  };
}

export default defineConfig({
  plugins: [studentLoginCompatibility(), react()],
});
