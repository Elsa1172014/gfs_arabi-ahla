import { getRedis } from "./_redis.js";

function normalizeName(value = "") {
  return String(value)
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function nameMatches(entered, stored) {
  const a = normalizeName(entered).split(" ").filter(Boolean);
  const b = normalizeName(stored).split(" ").filter(Boolean);
  if (a.length < 2 || b.length < 2) return false;

  // Accept the full name, the first two/three names, or a short form such as
  // first name + family name (e.g. "Sham Ezzi") as long as every entered
  // name part exists in the registered name. The six-digit school ID remains
  // the primary unique identifier.
  if (a.join(" ") === b.join(" ")) return true;
  if (a.length <= b.length && a.every((part, i) => part === b[i])) return true;
  return a.every(part => b.includes(part));
}

function parseRecord(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return null; }
}

function digits6(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? digits.slice(-6).padStart(6, "0") : "";
}

function lastSix(rec, key = "") {
  const possible = [
    rec?.schoolId,
    rec?.schoolID,
    rec?.sid,
    rec?.studentId,
    rec?.studentID,
    rec?.student_id,
    rec?.id,
    rec?.admissionNo,
    rec?.admissionNumber,
    rec?.studentNumber,
    rec?.number,
    rec?.key,
    key
  ];
  for (const value of possible) {
    const d = digits6(value);
    if (d) return d;
  }
  return "";
}

function pushIfMatch(list, seen, rec, key, name, sid) {
  if (!rec || !rec.name) return;
  if (lastSix(rec, key) !== sid) return;
  if (!nameMatches(name, rec.name)) return;
  const unique = rec.key || key || `${rec.name}-${sid}`;
  if (!seen.has(unique)) {
    seen.add(unique);
    list.push(rec);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }

  try {
    const name = String(req.body?.name || "").trim();
    const sid = digits6(req.body?.sid);
    if (!name || !/^\d{6}$/.test(sid)) {
      return res.status(400).json({ ok: false, error: "invalid input" });
    }

    const parts = normalizeName(name).split(" ").filter(Boolean);
    if (parts.length < 2) {
      return res.status(400).json({ ok: false, error: "name must contain at least 2 parts" });
    }

    const redis = getRedis();
    const candidates = [];
    const seen = new Set();

    // Current per-student records.
    const keys = await redis.keys("gfs:rec:student:*");
    for (const key of keys || []) {
      const rec = parseRecord(await redis.get(key));
      pushIfMatch(candidates, seen, rec, key, name, sid);
    }

    // Legacy combined arrays used by older platform versions.
    const legacyKeys = ["gfs:students:v5", "gfs:students:v4", "gfs:students:v3", "gfs:students"];
    for (const legacyKey of legacyKeys) {
      const legacy = parseRecord(await redis.get(legacyKey));
      if (!Array.isArray(legacy)) continue;
      for (const rec of legacy) pushIfMatch(candidates, seen, rec, "", name, sid);
    }

    if (candidates.length === 1) {
      const s = candidates[0];
      return res.status(200).json({
        ok: true,
        fullName: s.name,
        student: {
          key: s.key || "",
          name: s.name,
          grade: s.grade,
          block: s.block,
          stream: s.stream || "A",
          email: s.email || "",
          parentEmail: s.parentEmail || "",
          teacherEmail: s.teacherEmail || ""
        }
      });
    }
    if (candidates.length > 1) {
      return res.status(409).json({ ok: false, error: "ambiguous" });
    }
    return res.status(404).json({ ok: false, error: "not found" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
