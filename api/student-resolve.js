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
  if (a.length < 2 || b.length < a.length) return false;
  return a.every((part, i) => part === b[i]);
}

function parseRecord(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return null; }
}

function lastSix(rec, key = "") {
  const raw = String(rec?.schoolId ?? rec?.sid ?? rec?.studentId ?? rec?.key ?? key ?? "");
  const digits = raw.replace(/\D/g, "");
  return digits.slice(-6).padStart(6, "0");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }

  try {
    const name = String(req.body?.name || "").trim();
    const sid = String(req.body?.sid || "").replace(/\D/g, "").slice(-6).padStart(6, "0");
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

    // Do not depend on the Redis key format. Read all student records and
    // compare the last six digits of the stored ID with the entered ID.
    const keys = await redis.keys("gfs:rec:student:*");
    for (const key of keys || []) {
      const rec = parseRecord(await redis.get(key));
      if (!rec || !rec.name) continue;
      if (lastSix(rec, key) !== sid) continue;
      if (!nameMatches(name, rec.name)) continue;
      const unique = rec.key || `${rec.name}-${sid}`;
      if (!seen.has(unique)) { seen.add(unique); candidates.push(rec); }
    }

    // Legacy combined students array fallback.
    if (!candidates.length) {
      const legacy = parseRecord(await redis.get("gfs:students:v5"));
      if (Array.isArray(legacy)) {
        for (const rec of legacy) {
          if (!rec?.name || lastSix(rec) !== sid || !nameMatches(name, rec.name)) continue;
          const unique = rec.key || `${rec.name}-${sid}`;
          if (!seen.has(unique)) { seen.add(unique); candidates.push(rec); }
        }
      }
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
