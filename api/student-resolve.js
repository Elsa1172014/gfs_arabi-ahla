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
  // الطالب يستطيع كتابة أول اسمين، أول ثلاثة أسماء، أو الاسم الكامل المسجل.
  if (a.length < 2 || b.length < a.length) return false;
  return a.every((part, i) => part === b[i]);
}

function parseRecord(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }

  try {
    const name = String(req.body?.name || "").trim();
    const sid = String(req.body?.sid || "").replace(/\D/g, "");
    if (!name || !/^\d{6}$/.test(sid)) {
      return res.status(400).json({ ok: false, error: "invalid input" });
    }

    const parts = normalizeName(name).split(" ").filter(Boolean);
    if (parts.length < 2) {
      return res.status(400).json({ ok: false, error: "name must contain at least 2 parts" });
    }

    const redis = getRedis();
    const keys = await redis.keys(`gfs:rec:student:*-${sid}`);
    const candidates = [];

    for (const key of keys || []) {
      const rec = parseRecord(await redis.get(key));
      if (rec && rec.name && nameMatches(name, rec.name)) candidates.push(rec);
    }

    // Fallback for older deployments that still keep the combined students array.
    if (!candidates.length) {
      const legacy = parseRecord(await redis.get("gfs:students:v5"));
      if (Array.isArray(legacy)) {
        for (const rec of legacy) {
          const recSid = String(rec?.schoolId || rec?.key?.split("-")?.pop() || "").replace(/\D/g, "").slice(-6);
          if (recSid === sid && rec?.name && nameMatches(name, rec.name)) candidates.push(rec);
        }
      }
    }

    if (candidates.length === 1) {
      return res.status(200).json({ ok: true, fullName: candidates[0].name });
    }
    if (candidates.length > 1) {
      return res.status(409).json({ ok: false, error: "ambiguous" });
    }
    return res.status(404).json({ ok: false, error: "not found" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
