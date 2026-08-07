// اتصال Redis مرن: تكامل Vercel Marketplace مع بادئة مخصَّصة (مثل
// gfs_arabi_ahla) يُنشئ متغيّرات بيئة بأسماء مسبوقة بالبادئة، لا بالاسمين
// القياسيين اللذين يتوقّعهما Redis.fromEnv() افتراضيًا
// (UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN). هذه الدالة تبحث عن
// أي متغيّر بيئة ينتهي بالاسم المناسب، أيًّا كانت بادئته، فتعمل بلا حاجة
// لضبط يدوي مهما كانت البادئة التي اخترتها عند الربط.
import { Redis } from "@upstash/redis";

function findEnv(suffixes) {
  for (const key of Object.keys(process.env)) {
    for (const suf of suffixes) {
      if (key.toUpperCase().endsWith(suf) && process.env[key]) return process.env[key];
    }
  }
  return undefined;
}

let _redis = null;
export function getRedis() {
  if (_redis) return _redis;
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    findEnv(["_KV_REST_API_URL", "_REDIS_REST_API_URL", "_REDIS_REST_URL"]);
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    findEnv(["_KV_REST_API_TOKEN", "_REDIS_REST_API_TOKEN", "_REDIS_REST_TOKEN"]);
  if (!url || !token) {
    throw new Error(
      "تعذّر العثور على متغيّرات اتصال Redis (REST URL/TOKEN) في بيئة Vercel. " +
      "افتح Settings → Environment Variables وتحقّق من الأسماء الفعلية، ثم قارنها بهذا الملف."
    );
  }
  _redis = new Redis({ url, token });
  return _redis;
}
