import { getRedis } from "./_redis.js";

function parseValue(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
}

async function loadRecords(prefix, legacyKey) {
  const redis = getRedis();
  const keys = await redis.keys(`${prefix}*`);
  if (keys?.length) {
    const vals = await Promise.all(keys.map((k) => redis.get(k)));
    return vals.map(parseValue).filter(Boolean);
  }
  if (legacyKey) {
    const legacy = parseValue(await redis.get(legacyKey));
    if (Array.isArray(legacy)) return legacy;
  }
  return [];
}

function assignedTo(course, student) {
  if (!course || !student || course.status !== "published") return false;
  if (+course.grade !== +student.grade || String(course.stream || "A") !== String(student.stream || "A")) return false;
  if (Array.isArray(course.students) && course.students.length) return course.students.includes(student.key);
  const blocks = Array.isArray(course.blocks) ? course.blocks : [];
  return blocks.includes("ALL") || blocks.includes(student.block);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method not allowed" });
  }
  try {
    const [students, courses, attempts] = await Promise.all([
      loadRecords("gfs:rec:student:", "gfs:students:v5"),
      loadRecords("gfs:rec:course:", "gfs:courses:v5"),
      loadRecords("gfs:rec:attempt:", "gfs:attempts:v5"),
    ]);

    const published = courses.filter((c) => c?.status === "published");
    const passed = attempts.filter((a) => a?.passed);
    const certificates = new Set(passed.map((a) => a.serial || `${a.student || "?"}|${a.course || "?"}`)).size;

    // External dashboard must represent ALL registered students.
    // A student with no assigned course yet is included with 0% progress,
    // so the three tier counts always add up to the real student total.
    let studentsWithAssignedCourses = 0;
    const rows = students.map((s) => {
      const assigned = published.filter((c) => assignedTo(c, s));
      if (!assigned.length) return { pct: 0, assigned: 0 };

      studentsWithAssignedCourses += 1;
      const studentAttempts = attempts.filter((a) => a?.student === s.key);
      const passedCourses = new Set(
        studentAttempts.filter((a) => a.passed).map((a) => a.course)
      ).size;
      const pct = Math.round((passedCourses / assigned.length) * 100);
      return { pct, assigned: assigned.length };
    });

    const advanced = rows.filter((r) => r.pct >= 90).length;
    const progressing = rows.filter((r) => r.pct >= 70 && r.pct < 90).length;
    const support = rows.filter((r) => r.pct < 70).length;
    const total = students.length;
    const pct = (n) => total ? Math.round((n / total) * 100) : 0;

    const activeCutoff = Date.now() - 15 * 60 * 1000;
    const activeNow = new Set(
      attempts.filter((a) => new Date(a?.at || a?.createdAt || 0).getTime() >= activeCutoff)
        .map((a) => a.student).filter(Boolean)
    ).size;

    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({
      students: students.length,
      courses: courses.length,
      publishedCourses: published.length,
      attempts: attempts.length,
      certificates,
      activeNow,
      studentsWithAssignedCourses,
      studentsWithoutAssignedCourses: Math.max(0, students.length - studentsWithAssignedCourses),
      tiersTotal: total,
      tiers: {
        advanced: { count: advanced, pct: pct(advanced) },
        progressing: { count: progressing, pct: pct(progressing) },
        support: { count: support, pct: pct(support) },
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
