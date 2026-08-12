import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const LANDING_REFINE_CSS = `
.lh-wrap:has(.lx) .lx-actions,
.lh-wrap:has(.lx) .lx-appbox,
.lh-wrap:has(.lx) .lx-live{display:none!important}
.lh-wrap:has(.lx) .lx-arrow{display:none!important}

.lh-wrap:has(.lx){
  min-height:100vh!important;height:auto!important;overflow-x:hidden!important;overflow-y:auto!important;
  background:
    radial-gradient(circle at 9% 15%,rgba(156,25,54,.12),transparent 28%),
    radial-gradient(circle at 88% 22%,rgba(16,65,154,.10),transparent 30%),
    linear-gradient(180deg,#fff 0%,#fbfcff 58%,#f6f8fc 100%)!important
}
.lh-wrap:has(.lx) .lh-bg{
  background:
    radial-gradient(circle at 8% 17%,rgba(145,27,54,.10),transparent 29%),
    radial-gradient(circle at 87% 19%,rgba(27,75,168,.08),transparent 28%),
    linear-gradient(180deg,#fff 0%,#fbfcff 58%,#f6f8fc 100%)!important
}
.lh-wrap .wrap.lh-shell:has(.lx){
  max-width:none!important;width:100%!important;min-height:100vh!important;height:auto!important;
  padding:14px 18px 0!important;margin:0!important;overflow:visible!important
}
.lh-wrap:has(.lx) .lx{
  display:grid!important;grid-template-columns:1fr!important;grid-template-rows:auto auto 38px!important;
  min-height:calc(100vh - 14px)!important;height:auto!important;gap:8px!important;overflow:visible!important
}
.lh-wrap:has(.lx) .lx-main{
  width:min(1220px,96vw)!important;margin:0 auto!important;display:grid!important;
  grid-template-rows:74px 160px 215px 220px!important;min-height:0!important;align-content:start!important;direction:rtl!important
}
.lh-wrap:has(.lx) .lx-top{
  display:flex!important;justify-content:flex-start!important;align-items:flex-start!important;direction:ltr!important
}
.lh-wrap:has(.lx) .lx-logo{
  width:210px!important;height:70px!important;border-radius:16px!important;background:#fff!important;
  padding:7px 12px!important;box-shadow:0 12px 30px -24px rgba(10,35,82,.42)!important;border:1px solid #eef1f7!important
}
.lh-wrap:has(.lx) .lx-logo img{height:47px!important;max-width:100%!important;object-fit:contain!important}

.lh-wrap:has(.lx) .lx-lion{
  left:2%!important;top:54px!important;width:min(420px,31vw)!important;height:520px!important;
  object-fit:contain!important;object-position:center!important;opacity:.075!important;
  filter:grayscale(1) brightness(.72) sepia(.05)!important;mix-blend-mode:multiply!important;transform:none!important
}
.lh-wrap:has(.lx) .lx-crown{display:none!important}

.lh-wrap:has(.lx) .lx-hero{width:min(760px,88vw)!important;margin:0 auto!important;align-self:center!important;text-align:center!important}
.lh-wrap:has(.lx) .lx-hello{color:#18376f!important;font-size:18px!important;font-weight:900!important}
.lh-wrap:has(.lx) .lx-hero h1{color:#0f2f6f!important;font-size:44px!important;line-height:1.15!important;margin:5px 0!important;text-shadow:none!important}
.lh-wrap:has(.lx) .lx-dept{color:#6f7890!important;font-size:17px!important;margin-bottom:5px!important}
.lh-wrap:has(.lx) .lx-vision{font-size:22px!important;gap:14px!important}
.lh-wrap:has(.lx) .lx-glow{opacity:.65!important}

.lh-wrap:has(.lx) .lx-roles{
  width:min(820px,90%)!important;margin:0 auto 12px!important;display:grid!important;
  grid-template-columns:repeat(3,1fr)!important;gap:18px!important;align-items:stretch!important
}
.lh-wrap:has(.lx) .lx-role{
  height:205px!important;min-height:205px!important;padding:14px 14px 12px!important;border-radius:20px!important;
  background:#fff!important;box-shadow:0 18px 38px -28px rgba(16,45,105,.46)!important;border:1px solid #e6eaf3!important;color:#0f2f6f!important
}
.lh-wrap:has(.lx) .lx-role.parent{border-bottom:4px solid #a8203d!important}
.lh-wrap:has(.lx) .lx-role.student{border-bottom:4px solid #2263da!important}
.lh-wrap:has(.lx) .lx-role:not(.parent):not(.student){border-bottom:4px solid #123783!important}
.lh-wrap:has(.lx) .lx-role:hover{transform:translateY(-3px)!important;box-shadow:0 22px 46px -28px rgba(16,45,105,.58)!important}
.lh-wrap:has(.lx) .lx-role-icon{width:52px!important;height:52px!important;margin-bottom:7px!important;filter:none!important}
.lh-wrap:has(.lx) .lx-role-icon svg{width:50px!important;height:50px!important}
.lh-wrap:has(.lx) .lx-role b{color:#0f2f6f!important;font-size:22px!important;margin-bottom:4px!important}
.lh-wrap:has(.lx) .lx-role small{color:#5f6c86!important;font-size:12.5px!important;line-height:1.65!important;min-height:auto!important}

.lh-wrap:has(.lx) .lx-active{display:none!important}
.lh-wrap:has(.lx) .lx-data{width:min(760px,88vw)!important;margin:0 auto!important;display:block!important;align-self:start!important;position:relative!important}
.lh-wrap:has(.lx) .lx-tiers{
  width:100%!important;height:auto!important;min-height:190px!important;display:grid!important;
  grid-template-columns:repeat(3,1fr)!important;gap:18px!important;border:0!important;background:transparent!important;
  box-shadow:none!important;overflow:visible!important
}
.lh-wrap:has(.lx) .lx-tier{
  direction:rtl!important;min-height:190px!important;padding:15px 12px 12px!important;border:1px solid #e7ebf3!important;
  border-radius:20px!important;background:#fff!important;box-shadow:0 18px 36px -28px rgba(16,45,105,.48)!important;
  display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important
}
.lh-wrap:has(.lx) .lx-tier+.lx-tier:before{display:none!important}
.lh-wrap:has(.lx) .lx-tier .lx-ring{
  order:1!important;width:100px!important;height:100px!important;margin:0 auto 8px!important;box-shadow:none!important
}
.lh-wrap:has(.lx) .lx-tier .lx-ring:after{
  width:72px!important;height:72px!important;background:#fff!important;box-shadow:inset 0 0 0 1px #eef1f6!important
}
.lh-wrap:has(.lx) .lx-tier .lx-ring strong{color:#0f2f6f!important;font-size:24px!important}
.lh-wrap:has(.lx) .lx-tier .lx-ring small{color:#748097!important;font-size:10px!important}
.lh-wrap:has(.lx) .lx-tier-title{order:2!important;font-size:17px!important;font-weight:950!important;margin-top:2px!important}
.lh-wrap:has(.lx) .lx-tier-cut{order:3!important;color:#69758d!important;font-size:11px!important;margin:2px 0 0!important}
.lh-wrap:has(.lx) .lx-data:after{
  content:"";position:absolute;left:50%;transform:translateX(-50%);bottom:-40px;width:58px;height:58px;
  background:radial-gradient(circle,rgba(20,55,130,.07),rgba(20,55,130,0) 68%);border-radius:50%;pointer-events:none
}

.lh-wrap:has(.lx) .lx-side{display:none!important}

.lh-wrap:has(.lx) .lx-trust{
  grid-column:1!important;width:100%!important;height:38px!important;min-height:38px!important;margin-top:6px!important;
  padding:0 22px!important;border-radius:0!important;border:0!important;border-top:3px solid transparent!important;
  border-image:linear-gradient(90deg,#9b1d3b,#223b86,#113f92) 1!important;background:#fff!important;box-shadow:none!important;
  display:grid!important;grid-template-columns:repeat(3,1fr)!important;align-items:center!important
}
.lh-wrap:has(.lx) .lx-trust::before{display:none!important}
.lh-wrap:has(.lx) .lx-trust-item{
  min-height:auto!important;height:34px!important;padding:0 10px!important;color:#24406f!important;border-left:1px solid #edf0f5!important
}
.lh-wrap:has(.lx) .lx-trust-item:first-child{border-left:0!important}
.lh-wrap:has(.lx) .lx-trust-icon{width:22px!important;height:22px!important}
.lh-wrap:has(.lx) .lx-trust-icon svg{width:22px!important;height:22px!important}
.lh-wrap:has(.lx) .lx-trust-item b{color:#24406f!important;font-size:11px!important}
.lh-wrap:has(.lx) .lx-trust-item small{display:none!important}

.lh-wrap:has(.lx) .lx-copy{
  grid-column:1!important;width:100%!important;height:18px!important;min-height:18px!important;margin:0!important;padding:0!important;
  border:0!important;border-radius:0!important;background:#fff!important;color:#8a94a8!important;font-size:9px!important;
  display:flex!important;align-items:center!important;justify-content:center!important
}

@media(max-width:900px){
  .lh-wrap:has(.lx) .lx-main{grid-template-rows:auto!important}
  .lh-wrap:has(.lx) .lx-logo{width:190px!important;height:64px!important}
  .lh-wrap:has(.lx) .lx-logo img{height:43px!important}
  .lh-wrap:has(.lx) .lx-hero{margin:18px auto 14px!important}
  .lh-wrap:has(.lx) .lx-hero h1{font-size:36px!important}
  .lh-wrap:has(.lx) .lx-roles{width:100%!important}
}
@media(max-width:700px){
  .lh-wrap:has(.lx) .lx-roles,.lh-wrap:has(.lx) .lx-tiers{grid-template-columns:1fr!important}
  .lh-wrap:has(.lx) .lx-role{height:178px!important;min-height:178px!important}
  .lh-wrap:has(.lx) .lx-data{width:100%!important}
  .lh-wrap:has(.lx) .lx-lion{width:340px!important;max-width:85vw!important;opacity:.05!important}
  .lh-wrap:has(.lx) .lx-trust{grid-template-columns:1fr!important;height:auto!important}
}

/* ===== FINAL GEMS HERO + EXACT ORIGINAL LION ===== */

/* thin GEMS hero identity strip */
.lh-wrap:has(.lx)::before{
  content:"";
  position:absolute;
  z-index:5;
  top:0;left:0;right:0;
  height:14px;
  background:linear-gradient(90deg,#a51d3d 0%,#7d2145 31%,#303277 63%,#103b8d 100%);
  pointer-events:none;
}

/* hide the generated lion from App.jsx */
.lh-wrap:has(.lx) .lx-lion{
  display:none!important;
}

/* use the user's original GEMS lion exactly as supplied */
.lh-wrap:has(.lx) .lx-main::before{
  content:"";
  position:absolute;
  z-index:0;
  left:1.5%;
  top:108px;
  width:310px;
  height:410px;
  background-image:url("data:image/png;base64,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");
  background-repeat:no-repeat;
  background-position:center;
  background-size:contain;
  opacity:.105;
  filter:saturate(.88) contrast(.96);
  pointer-events:none;
}

/* original lion again below the analytics cards */
.lh-wrap:has(.lx) .lx-data::after{
  content:""!important;
  position:absolute!important;
  left:50%!important;
  transform:translateX(-50%)!important;
  bottom:-47px!important;
  width:34px!important;
  height:45px!important;
  background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAxCAYAAABd2WCOAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAArISURBVFhHzZhpeBXVGYDfM3O33NwlewgYQojGRAKEgCBhpxS0Rdq69LEV9VFrLVVxgWIX2wbFhW5aWmtdumjdcCmKdUFBBCxhE6yyBbJASMhmEu5N7j4zpz8SbhbvzaL90fdf7jlz5p3vfN83ZyKeKx4v+T9D6f/D/wNDlhKqimq1ghD9hz6HarNhTkxEMZmGNL83OsoQpYTAnZfHrN/8joS0dBIyMhCqqf+sKK7ROUy95xeUPvAQ7rFjhywmEexXC1EvH5FZ1n8wFlogwMRbl3POvHkIodB+9AiGFgFAMZlxnJNN2OtFtdnIWXQJaROLSUhP59zLLie1qIhgayuBlmaQsVNYR+GAWsCLzEUMKdGFYNSs2YyaNZuDTz5BuMOLfUQWjlEjMSXYySqdQcbkyWz5/vfwNzWRc/HFnDleSaitFVtKKpPuWkFKYSEV61/k8FNPYmhan+W7IlTAeuYQlJahS6UUXoCnuopxN36P3MWX0l5RQeq4ImwpKSAlwbZW3l92M57qalSrFT0UikbFlJDA9PvuJ3PqNMrv+Sn1O7ZHx3QU9qmFvMRcwlKFISe6lLQdPsS4629g3PU3olqtRDwebMnJIASntr7PG0suxVtTA1KiB4N9tkkLBNj7wBpUs5lpvyhDKF23lQiOmsaynnlRIYYshSAhPZ3MqdNAUbAlp5B76RKEquJvbGDPvasxO51MvG159Ib9CXd0cKbyONbkZLLnfwUUhV1qEX+Ri4jIvtfEXqEfQlG4aPV9NO7Z3ROB7oqyp2cw8dbbKF5+B8HWNmScREYIzE4XACnFk/mP6XxeYRaRXhE6y8BSQiAUBaEqWNxu8pZ8E3G2vKVED4eIBAJ01NWxq+znHH3uH7GrSwhSxxXhGDkSEFSYcnlWfoWwjN1WBpYCchZdTGLWSDpOnCAhMzMaISkle+9fw7vXXk3zvr1YXG6EomBNSsKZnY0zJwdXzhhcOTmkjZ/ApDtXoJhMSOD9I+E+OdSfgatPCM697HLG37yMSGcHrjG5fRqhHgqhB4P4P2vh40cepmDpNbhyx6JaLQjR87yqxYJqswHg7YxQdMnz+PxdPS4WA0sBrjFjmP/YE9h7Rak/Ute7xoRA0JNv/WluDbB89XY27zwVc5fPMqiUUBSco3NY8NRfsKak9uTUIEhpYEQ09IjGGb9k/VtVPPK3j/H6IhjGgLccXApACEFS/vnMeWTdgBE7ix4Mcuzll6jbto0tDW6eaSkkbIgBo9ObQROd7qT2njxB27EK9FAIf2MDWiDQewJhjwekRPP72X1fGc0f7aPo+8sovOEmNKkMWYihSgGY7Haa9+5h6y3L2HTNUloPfhot/47aWrbe+kOC7W0oZjMld61k9u8eIXNKSXeu9V9tYOJKKRYLrtxcUgovwJk9mlB7OxXPPUvzgf2Y7AnYMzIJnTlD465yPvzJKrwnagh+9hmKyYQtNQ2hKEgENae8w4oSMXNKCFSzmTnrHiU5Px+hqhiaxqktm/no179C6hqKyYQ1ORkkhLwe9FAIs93OwqefxZ2XF11K0wwW3/Qm+z5tGpZYzEhlTLmQtPFFmBLtmB0OrElu0idNYuHfnyFz6jQMTcPf1IS/uQk9GEQASefl48jOjq5hGJK3t50cthDxpIxIhOOvvIzv9Gma9u3DU1VN5SuvsONHK5i84ke4xozpMz9x5Cjm/uFRVIsl+lvlSQ93rNkxbCEg9snT39REx8kTRPx+UvLz+fDuVYQ7PHhragi2t5L/7auo3fweAGaHg5m/+jWu0TnRVnH4eBs/uOcDTjX4+q08NGJGSuoanfX1HHvxBTbfdCO+xgZaDx5EGgad9fUkZo1EMZtRrTZKH1hLevEkEAJDSj7YVc+Vt73Docq+JwZ7gom500b1uU88Yr+mu5G63vUK6UYoCqNmzyXk9WDoBrJkIekXTu2qNCl5+a0qfvbbciwWlVuWjqd0chZHKtuoOeVlwYxssrMcJLmsbNpeSyisY8TZ289X3wC4c8dS+uBDlD/4EG8fMtAXXse6e+dhUhU0zeCHv9yGzx/hT/fOxe3sya/eSCnZ/Z8mrrr9XTo6w/2HId72xcLiTmL+409SueGfvHcowsvMROt1uaIIJhSk0dDsA+I/pxCCaRNHsHRJPooSu6sOSUqoKiV3raB22zb+/mYdL8jZaFKltT2Iphldc4Rg6TfySXLbKFu3l8YWf/T62tMdbNxSg653yQoBX501+otLCUUhq3QmznPzefK3r/NqYGL3EVZS19hJKHxWCtwuKw//bCY7P2rgzjU76PRFOHisjflLX2fNo/v6JH5Dsy/u0XlQKYvbTfGdd/HMhmM8q82OnqmlhLpGH6Fwr0IAckY5eXT1HI5UtXPDj7fw3Ts20ekP853F5yGEQErJiTovv3nqQNwjzKBSrtyxmFMzeHyLl4jRN9wuhxk1xhbs+riRrIxEtuyso77JxyWzc7hq8XnohmTPJ81ctXwTJ+rivxMHlJIIfGl5nGoJ0eYN9RlThGDBjGzsdhOHK9v6jKWnJLD/YEv07z2fNNHuCbHigQ+54pa3qaz1xBViICkNle3qJDaEJ5OSlIAz0RI92ymKYMqEdO6+uYQNm6q5c82HRCJd2+gPaLS0BZFIhICsjET+WDaH3z/9CS+9WYk/oA0oRDwpA8E+tZDX5XR2H2wjHNZZfftUrBYVm1Vl3kWj+NvaBZQfaGTV2p18WtEarbaK6naeWn8Yw+iSX7tqOpOL0vEHIsycksXMKVlkZzmwmNW41fe55qmjsF0tZqMsRUNBCMjOcnL3zSVcOCEDX0CjtT3A+n9V8tp71UQ0A5fDwt7XriQ1KYGd+xu4bNnbaLqB2aRQ9cG1WC0K3Z8UZ78vOFbj4dqV71F50tP79l1zekvpqHykFvC8nI8+xOOiEHD9FYWsXVUKQNm6PTz23EEMo2v7CvKSyRvtxueL4HJauPob+ZwzwsmGd6vYf6iFLTvr+i/ZI2Ug2KaWsFFO79OpB6MgL5mNT3wdl8PC068eZfUf9hAIaNGe3pWHPVGymBUWzMjG2xmmfH8jke7m2xsFIIKJf6vFvCEvGpYQgMcbwmE38893qrjn4V0Egj1CdPczKSVSSgxDEgzpvLX1JDv2no4pBKAYCMrV8WyQpUSI/ykdj3ZvGE0z8AUiRCLGoJUFYEg54Dxlm1rCBjnjCwl1IRFCMH/6OXGrabgorw8zh/pjNimoqiAlyUZ2lmOw79QhoehfQgjAalXZub8RVRUku60oivjSYkqcf7wNmfwxSUyfNAJdlzy4cjobH/86UydkkmAzfWE5deJFV5a1eXre9MNleskITKpCfWMnyW4b4/JT+daiseTnJrG1vJ5wJHaFxcOkgnjtjfflQ3+t43htaMCKGCojMxLZ8OevMSLdzmvvVnP7fTv6T4mLosCSOUmoP/nxyrJxY80cONKB1ze8p4pFKGygGwYNzX7e2V5Lda23/5SYqCpcsziNKxZmIMLhsDxeWUXNySYee6mB3Z92YnxJN1URjMxM5HSzL3oEjocQ4EhQ+M4laSyamUb+ubkIKaXUdZ2jFcdobGrlj8+fovwTP5omBzj+/29QBDgTVVZel0VxYTKFBeeTlOTukgIwDIO6unqqak6yubyNZ95oIRAauPN+GRQFplxg59pLMynISyUvLw+n04EQgv8CgkF8ZGHzKCMAAAAASUVORK5CYII=")!important;
  background-repeat:no-repeat!important;
  background-position:center!important;
  background-size:contain!important;
  opacity:.26!important;
  border-radius:0!important;
  pointer-events:none!important;
}

/* GEMS footer — slim, two-brand-colour identity */
.lh-wrap:has(.lx) .lx-trust{
  height:42px!important;
  min-height:42px!important;
  padding:0 28px!important;
  border:0!important;
  border-radius:16px 16px 0 0!important;
  background:linear-gradient(100deg,#991d3b 0%,#6f2347 27%,#2e2f73 61%,#0d3b86 100%)!important;
  box-shadow:0 -10px 28px -26px rgba(24,54,120,.48)!important;
}
.lh-wrap:has(.lx) .lx-trust-item{
  height:38px!important;
  color:#fff!important;
  border-left:1px solid rgba(255,255,255,.20)!important;
}
.lh-wrap:has(.lx) .lx-trust-item b{
  color:#fff!important;
  font-size:11px!important;
}
.lh-wrap:has(.lx) .lx-trust-icon svg *{
  stroke:#fff!important;
}
.lh-wrap:has(.lx) .lx-copy{
  height:20px!important;
  min-height:20px!important;
  background:linear-gradient(90deg,#991d3b 0%,#2e2f73 56%,#0d3b86 100%)!important;
  color:rgba(255,255,255,.82)!important;
  font-size:9px!important;
}

/* keep all central content above lion watermark */
.lh-wrap:has(.lx) .lx-top,
.lh-wrap:has(.lx) .lx-hero,
.lh-wrap:has(.lx) .lx-roles,
.lh-wrap:has(.lx) .lx-data{
  position:relative!important;
  z-index:2!important;
}

/* subtle two-colour GEMS accent around white canvas */
.lh-wrap:has(.lx) .lx-role.parent{
  border-bottom-color:#a51d3d!important;
}
.lh-wrap:has(.lx) .lx-role.student{
  border-bottom-color:#2367db!important;
}
.lh-wrap:has(.lx) .lx-role:not(.parent):not(.student){
  border-bottom-color:#103b86!important;
}

@media(max-width:900px){
  .lh-wrap:has(.lx) .lx-main::before{
    width:250px;
    height:330px;
    top:125px;
    opacity:.075;
  }
}
@media(max-width:700px){
  .lh-wrap:has(.lx) .lx-main::before{
    width:210px;
    height:280px;
    left:-30px;
    top:150px;
    opacity:.055;
  }
}

`;

const landingStyle = document.createElement("style");
landingStyle.id = "gfs-landing-final-exact-lion";
landingStyle.textContent = LANDING_REFINE_CSS;
document.head.appendChild(landingStyle);

const API = "/api/storage";

window.storage = {
  async get(key) {
    const r = await fetch(`${API}?key=${encodeURIComponent(key)}`);
    if (!r.ok) throw new Error("not found");
    return r.json();
  },
  async set(key, value) {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!r.ok) throw new Error("write failed");
    return r.json();
  },
  async delete(key) {
    const r = await fetch(`${API}?key=${encodeURIComponent(key)}`, { method: "DELETE" });
    if (!r.ok) throw new Error("delete failed");
    return r.json();
  },
  async list(prefix) {
    const r = await fetch(`${API}?action=list&prefix=${encodeURIComponent(prefix || "")}`);
    if (!r.ok) throw new Error("list failed");
    return r.json();
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
