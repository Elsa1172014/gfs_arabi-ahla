import { GoogleGenAI, Modality } from "@google/genai";
const IN_RATE=16000, OUT_RATE=24000;
const b64=(buf)=>{let s="",u=new Uint8Array(buf);for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode(...u.subarray(i,i+0x8000));return btoa(s)};
const pcm=(a)=>{const o=new Int16Array(a.length);for(let i=0;i<a.length;i++){const x=Math.max(-1,Math.min(1,a[i]));o[i]=x<0?x*32768:x*32767}return o};
const arr=(s)=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer};
export class PlatformLiveVoice{
 constructor({instruction,onStatus,onUserText,onAgentText,onError,onLevel}){Object.assign(this,{instruction,onStatus,onUserText,onAgentText,onError,onLevel});this.sources=[];this.next=0;this.closed=false;this.userSpeaking=false;this.lastVoice=0;this.turnEnded=false}
 async connect(){
  this.closed=false;this.onStatus?.("connecting");
  this.playCtx=new AudioContext({sampleRate:OUT_RATE,latencyHint:"interactive"});await this.playCtx.resume();
  const micPromise=this.prepareMic();
  const r=await fetch("/api/voice-token",{method:"POST"});const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر بدء المحادثة");
  this.ai=new GoogleGenAI({apiKey:d.token,httpOptions:{apiVersion:"v1beta"}});
  this.session=await this.ai.live.connect({model:d.model,config:{responseModalities:[Modality.AUDIO],systemInstruction:{parts:[{text:this.instruction}]},inputAudioTranscription:{},outputAudioTranscription:{},realtimeInputConfig:{automaticActivityDetection:{disabled:false,prefixPaddingMs:40,silenceDurationMs:300}},contextWindowCompression:{slidingWindow:{}}},callbacks:{
   onopen:()=>this.onStatus?.("listening"),
   onmessage:(m)=>this.msg(m),
   onerror:(e)=>{if(!this.closed)this.onError?.("تعذر استمرار الاتصال الصوتي: "+(e?.message||"خطأ غير معروف"))},
   onclose:(e)=>{if(!this.closed)this.onError?.("انتهى الاتصال الصوتي"+(e?.reason?": "+e.reason:""))}
  }});
  await micPromise;this.attachMic();
 }
 async prepareMic(){this.stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});this.ctx=new AudioContext({sampleRate:IN_RATE,latencyHint:"interactive"});await this.ctx.resume()}
 attachMic(){const src=this.ctx.createMediaStreamSource(this.stream);this.node=this.ctx.createScriptProcessor(512,1,1);this.node.onaudioprocess=e=>{if(this.closed||!this.session)return;const input=e.inputBuffer.getChannelData(0);let sum=0;for(let i=0;i<input.length;i++)sum+=input[i]*input[i];const rms=Math.sqrt(sum/input.length);this.onLevel?.(Math.min(1,rms*9),"input");const now=performance.now();if(rms>.018){this.userSpeaking=true;this.turnEnded=false;this.lastVoice=now;this.onStatus?.("listening")}else if(this.userSpeaking&&!this.turnEnded&&now-this.lastVoice>650){this.turnEnded=true;this.userSpeaking=false;try{this.session.sendRealtimeInput({audioStreamEnd:true})}catch{}}const p=pcm(input);try{this.session.sendRealtimeInput({audio:{data:b64(p.buffer),mimeType:"audio/pcm;rate=16000"}})}catch{}};src.connect(this.node);const g=this.ctx.createGain();g.gain.value=0;this.node.connect(g);g.connect(this.ctx.destination)}
 msg(m){const c=m.serverContent;if(c?.interrupted){this.flush();this.onStatus?.("listening")}const it=c?.inputTranscription?.text;if(it)this.onUserText?.(it,!!c.turnComplete);const ot=c?.outputTranscription?.text;if(ot)this.onAgentText?.(ot,!!c.turnComplete);const a=c?.modelTurn?.parts?.find(p=>p.inlineData?.mimeType?.startsWith("audio/"));if(a?.inlineData?.data){this.onStatus?.("speaking");this.play(a.inlineData.data)}if(c?.turnComplete&&this.sources.length===0)this.onStatus?.("listening")}
 play(data){this.onLevel?.(.7,"output");if(!this.playCtx)this.playCtx=new AudioContext({sampleRate:OUT_RATE,latencyHint:"interactive"});if(this.playCtx.state==="suspended")this.playCtx.resume().catch(()=>{});const p=new Int16Array(arr(data)),f=new Float32Array(p.length);for(let i=0;i<p.length;i++)f[i]=p[i]/32768;const b=this.playCtx.createBuffer(1,f.length,OUT_RATE);b.copyToChannel(f,0);const s=this.playCtx.createBufferSource();s.buffer=b;s.connect(this.playCtx.destination);const t=Math.max(this.next,this.playCtx.currentTime+.005);s.start(t);this.next=t+b.duration;this.sources.push(s);s.onended=()=>{this.sources=this.sources.filter(x=>x!==s);if(!this.sources.length)this.onLevel?.(0,"output")}}
 flush(){this.sources.forEach(s=>{try{s.stop()}catch{}});this.sources=[];if(this.playCtx)this.next=this.playCtx.currentTime}
 sendText(text){this.session?.sendClientContent({turns:[{role:"user",parts:[{text}]}],turnComplete:true})}
 close(){this.closed=true;this.flush();try{this.session?.close()}catch{};this.node?.disconnect();this.stream?.getTracks().forEach(t=>t.stop());this.ctx?.close();this.playCtx?.close();this.onStatus?.("idle")}
}
