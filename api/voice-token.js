import { GoogleGenAI } from "@google/genai";
const MODEL=process.env.GEMINI_LIVE_MODEL||"gemini-2.5-flash-native-audio-preview-12-2025";
const buckets=new Map();
function limited(ip){const n=Date.now(),a=(buckets.get(ip)||[]).filter(t=>n-t<60000);if(a.length>=8){buckets.set(ip,a);return true}a.push(n);buckets.set(ip,a);return false}
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"method_not_allowed"});
 const ip=String(req.headers["x-forwarded-for"]||req.socket?.remoteAddress||"visitor").split(",")[0];
 if(limited(ip))return res.status(429).json({error:"too_many_requests"});
 if(!process.env.GEMINI_API_KEY)return res.status(503).json({error:"GEMINI_API_KEY غير مضبوط على الخادم"});
 try{const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY,httpOptions:{apiVersion:"v1beta"}});const expireTime=new Date(Date.now()+30*60*1000).toISOString();const token=await ai.authTokens.create({config:{uses:1,expireTime,newSessionExpireTime:expireTime,httpOptions:{apiVersion:"v1beta"}}});return res.status(200).json({token:token.name,model:MODEL,expireTime})}
 catch(e){console.error("voice token error",e?.message||e);return res.status(502).json({error:"تعذر بدء المحادثة الصوتية"})}
}
