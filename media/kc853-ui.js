var f;f||=typeof Module !== 'undefined' ? Module : {};var aa=Object.assign({},f),ba=[],ca="./this.program",da=(a,b)=>{throw b;},ea="object"==typeof window,k="function"==typeof importScripts,fa="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,m="",ha,ia,ja;
if(fa){var fs=require("fs"),ka=require("path");m=k?ka.dirname(m)+"/":__dirname+"/";ha=(a,b)=>{a=la(a)?new URL(a):ka.normalize(a);return fs.readFileSync(a,b?void 0:"utf8")};ja=a=>{a=ha(a,!0);a.buffer||(a=new Uint8Array(a));return a};ia=(a,b,c,d=!0)=>{a=la(a)?new URL(a):ka.normalize(a);fs.readFile(a,d?void 0:"utf8",(e,h)=>{e?c(e):b(d?h.buffer:h)})};!f.thisProgram&&1<process.argv.length&&(ca=process.argv[1].replace(/\\/g,"/"));ba=process.argv.slice(2);"undefined"!=typeof module&&(module.exports=f);process.on("uncaughtException",
a=>{if(!("unwind"===a||a instanceof ma||a.context instanceof ma))throw a;});da=(a,b)=>{process.exitCode=a;throw b;};f.inspect=()=>"[Emscripten Module object]"}else if(ea||k)k?m=self.location.href:"undefined"!=typeof document&&document.currentScript&&(m=document.currentScript.src),m=0!==m.indexOf("blob:")?m.substr(0,m.replace(/[?#].*/,"").lastIndexOf("/")+1):"",ha=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},k&&(ja=a=>{var b=new XMLHttpRequest;b.open("GET",a,
!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),ia=(a,b,c)=>{var d=new XMLHttpRequest;d.open("GET",a,!0);d.responseType="arraybuffer";d.onload=()=>{200==d.status||0==d.status&&d.response?b(d.response):c()};d.onerror=c;d.send(null)};var na=f.print||console.log.bind(console),q=f.printErr||console.error.bind(console);Object.assign(f,aa);aa=null;f.arguments&&(ba=f.arguments);f.thisProgram&&(ca=f.thisProgram);f.quit&&(da=f.quit);var r;f.wasmBinary&&(r=f.wasmBinary);
"object"!=typeof WebAssembly&&oa("no native wasm support detected");var pa,qa=!1,ra,u,sa,ta,v,x,y,z;function ua(){var a=pa.buffer;f.HEAP8=ra=new Int8Array(a);f.HEAP16=sa=new Int16Array(a);f.HEAPU8=u=new Uint8Array(a);f.HEAPU16=ta=new Uint16Array(a);f.HEAP32=v=new Int32Array(a);f.HEAPU32=x=new Uint32Array(a);f.HEAPF32=y=new Float32Array(a);f.HEAPF64=z=new Float64Array(a)}var va=[],wa=[],xa=[],ya=[],za=[];function Aa(){var a=f.preRun.shift();va.unshift(a)}var A=0,Ba=null,B=null;
function oa(a){if(f.onAbort)f.onAbort(a);a="Aborted("+a+")";q(a);qa=!0;throw new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");}var Ca=a=>a.startsWith("data:application/octet-stream;base64,"),la=a=>a.startsWith("file://"),C;C="kc853-ui.wasm";if(!Ca(C)){var Da=C;C=f.locateFile?f.locateFile(Da,m):m+Da}function Ea(a){if(a==C&&r)return new Uint8Array(r);if(ja)return ja(a);throw"both async and sync fetching of the wasm failed";}
function Fa(a){if(!r&&(ea||k)){if("function"==typeof fetch&&!la(a))return fetch(a,{credentials:"same-origin"}).then(b=>{if(!b.ok)throw"failed to load wasm binary file at '"+a+"'";return b.arrayBuffer()}).catch(()=>Ea(a));if(ia)return new Promise((b,c)=>{ia(a,d=>b(new Uint8Array(d)),c)})}return Promise.resolve().then(()=>Ea(a))}function Ga(a,b,c){return Fa(a).then(d=>WebAssembly.instantiate(d,b)).then(d=>d).then(c,d=>{q(`failed to asynchronously prepare wasm: ${d}`);oa(d)})}
function Ha(a,b){var c=C;r||"function"!=typeof WebAssembly.instantiateStreaming||Ca(c)||la(c)||fa||"function"!=typeof fetch?Ga(c,a,b):fetch(c,{credentials:"same-origin"}).then(d=>WebAssembly.instantiateStreaming(d,a).then(b,function(e){q(`wasm streaming compile failed: ${e}`);q("falling back to ArrayBuffer instantiation");return Ga(c,a,b)}))}function ma(a){this.name="ExitStatus";this.message=`Program terminated with exit(${a})`;this.status=a}
var Ia=a=>{for(;0<a.length;)a.shift()(f)},Ja=f.noExitRuntime||!0,Ka="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0,D=(a,b,c)=>{var d=b+c;for(c=b;a[c]&&!(c>=d);)++c;if(16<c-b&&a.buffer&&Ka)return Ka.decode(a.subarray(b,c));for(d="";b<c;){var e=a[b++];if(e&128){var h=a[b++]&63;if(192==(e&224))d+=String.fromCharCode((e&31)<<6|h);else{var g=a[b++]&63;e=224==(e&240)?(e&15)<<12|h<<6|g:(e&7)<<18|h<<12|g<<6|a[b++]&63;65536>e?d+=String.fromCharCode(e):(e-=65536,d+=String.fromCharCode(55296|
e>>10,56320|e&1023))}}else d+=String.fromCharCode(e)}return d},Na=a=>{var b=La();a();Ma(b)},Oa=0;function Pa(){for(var a=E.length-1;0<=a;--a)Qa(a);E=[];Ra=[]}var Ra=[];function Sa(){if(navigator.userActivation?navigator.userActivation.isActive:Oa&&Ta.$c)for(var a=0;a<Ra.length;++a){var b=Ra[a];Ra.splice(a,1);--a;b.Md.apply(null,b.Ed)}}var E=[];function Qa(a){var b=E[a];b.target.removeEventListener(b.Rc,b.zd,b.Sc);E.splice(a,1)}
function F(a){function b(d){++Oa;Ta=a;Sa();a.Uc(d);Sa();--Oa}if(!a.target)return-4;if(a.Tc)a.zd=b,a.target.addEventListener(a.Rc,b,a.Sc),E.push(a),Ua||(ya.push(Pa),Ua=!0);else for(var c=0;c<E.length;++c)E[c].target==a.target&&E[c].Rc==a.Rc&&Qa(c--);return 0}function Va(a){return a?a==window?"#window":a==screen?"#screen":a&&a.nodeName?a.nodeName:"":""}
var Ua,Ta,Wa,Xa,Ya,Za,$a,ab,bb,cb=[0,"undefined"!=typeof document?document:0,"undefined"!=typeof window?window:0],G=a=>{a=2<a?a?D(u,a):"":a;return cb[a]||("undefined"!=typeof document?document.querySelector(a):void 0)},db=a=>0>cb.indexOf(a)?a.getBoundingClientRect():{left:0,top:0},eb=[],fb,H=a=>{var b=eb[a];b||(a>=eb.length&&(eb.length=a+1),eb[a]=b=fb.get(a));return b},I=(a,b,c)=>{var d=u;if(!(0<c))return 0;var e=b;c=b+c-1;for(var h=0;h<a.length;++h){var g=a.charCodeAt(h);if(55296<=g&&57343>=g){var l=
a.charCodeAt(++h);g=65536+((g&1023)<<10)|l&1023}if(127>=g){if(b>=c)break;d[b++]=g}else{if(2047>=g){if(b+1>=c)break;d[b++]=192|g>>6}else{if(65535>=g){if(b+2>=c)break;d[b++]=224|g>>12}else{if(b+3>=c)break;d[b++]=240|g>>18;d[b++]=128|g>>12&63}d[b++]=128|g>>6&63}d[b++]=128|g&63}}d[b]=0;return b-e},gb=(a,b,c,d,e,h)=>{Wa||=J(256);a={target:G(a),Rc:h,Tc:d,Uc:(g=event)=>{var l=g.target.id?g.target.id:"",n=Wa;I(Va(g.target),n+0,128);I(l,n+128,128);H(d)(e,n,b)&&g.preventDefault()},Sc:c};return F(a)},hb=(a,
b,c,d,e,h)=>{Xa||=J(176);a={target:G(a),$c:!0,Rc:h,Tc:d,Uc:g=>{var l=Xa;z[l>>3]=g.timeStamp;var n=l>>2;v[n+2]=g.location;v[n+3]=g.ctrlKey;v[n+4]=g.shiftKey;v[n+5]=g.altKey;v[n+6]=g.metaKey;v[n+7]=g.repeat;v[n+8]=g.charCode;v[n+9]=g.keyCode;v[n+10]=g.which;I(g.key||"",l+44,32);I(g.code||"",l+76,32);I(g.char||"",l+108,32);I(g.locale||"",l+140,32);H(d)(e,l,b)&&g.preventDefault()},Sc:c};return F(a)},ib=(a,b,c)=>{z[a>>3]=b.timeStamp;a>>=2;v[a+2]=b.screenX;v[a+3]=b.screenY;v[a+4]=b.clientX;v[a+5]=b.clientY;
v[a+6]=b.ctrlKey;v[a+7]=b.shiftKey;v[a+8]=b.altKey;v[a+9]=b.metaKey;sa[2*a+20]=b.button;sa[2*a+21]=b.buttons;v[a+11]=b.movementX;v[a+12]=b.movementY;c=db(c);v[a+13]=b.clientX-c.left;v[a+14]=b.clientY-c.top},K=(a,b,c,d,e,h)=>{Ya||=J(72);a=G(a);return F({target:a,$c:"mousemove"!=h&&"mouseenter"!=h&&"mouseleave"!=h,Rc:h,Tc:d,Uc:(g=event)=>{ib(Ya,g,a);H(d)(e,Ya,b)&&g.preventDefault()},Sc:c})},jb=(a,b,c,d,e)=>{Za||=J(260);return F({target:a,Rc:e,Tc:d,Uc:(h=event)=>{var g=Za,l=document.pointerLockElement||
document.Yc||document.hd||document.gd;v[g>>2]=!!l;var n=l&&l.id?l.id:"";I(Va(l),g+4,128);I(n,g+132,128);H(d)(20,g,b)&&h.preventDefault()},Sc:c})},kb=(a,b,c,d,e)=>F({target:a,Rc:e,Tc:d,Uc:(h=event)=>{H(d)(38,0,b)&&h.preventDefault()},Sc:c}),lb=(a,b,c,d)=>{$a||=J(36);a=G(a);return F({target:a,Rc:"resize",Tc:d,Uc:(e=event)=>{if(e.target==a){var h=document.body;if(h){var g=$a;v[g>>2]=e.detail;v[g+4>>2]=h.clientWidth;v[g+8>>2]=h.clientHeight;v[g+12>>2]=innerWidth;v[g+16>>2]=innerHeight;v[g+20>>2]=outerWidth;
v[g+24>>2]=outerHeight;v[g+28>>2]=pageXOffset;v[g+32>>2]=pageYOffset;H(d)(10,g,b)&&e.preventDefault()}}},Sc:c})},mb=(a,b,c,d,e,h)=>{ab||=J(1696);a=G(a);return F({target:a,$c:"touchstart"==h||"touchend"==h,Rc:h,Tc:d,Uc:g=>{for(var l,n={},p=g.touches,t=0;t<p.length;++t)l=p[t],l.md=l.od=0,n[l.identifier]=l;for(t=0;t<g.changedTouches.length;++t)l=g.changedTouches[t],l.md=1,n[l.identifier]=l;for(t=0;t<g.targetTouches.length;++t)n[g.targetTouches[t].identifier].od=1;p=ab;z[p>>3]=g.timeStamp;var w=p>>2;
v[w+3]=g.ctrlKey;v[w+4]=g.shiftKey;v[w+5]=g.altKey;v[w+6]=g.metaKey;w+=7;var qb=db(a),rb=0;for(t in n)if(l=n[t],v[w]=l.identifier,v[w+1]=l.screenX,v[w+2]=l.screenY,v[w+3]=l.clientX,v[w+4]=l.clientY,v[w+5]=l.pageX,v[w+6]=l.pageY,v[w+7]=l.md,v[w+8]=l.od,v[w+9]=l.clientX-qb.left,v[w+10]=l.clientY-qb.top,w+=13,31<++rb)break;v[p+8>>2]=rb;H(d)(e,p,b)&&g.preventDefault()},Sc:c})},nb=a=>{var b=a.getExtension("ANGLE_instanced_arrays");b&&(a.vertexAttribDivisor=(c,d)=>b.vertexAttribDivisorANGLE(c,d),a.drawArraysInstanced=
(c,d,e,h)=>b.drawArraysInstancedANGLE(c,d,e,h),a.drawElementsInstanced=(c,d,e,h,g)=>b.drawElementsInstancedANGLE(c,d,e,h,g))},ob=a=>{var b=a.getExtension("OES_vertex_array_object");b&&(a.createVertexArray=()=>b.createVertexArrayOES(),a.deleteVertexArray=c=>b.deleteVertexArrayOES(c),a.bindVertexArray=c=>b.bindVertexArrayOES(c),a.isVertexArray=c=>b.isVertexArrayOES(c))},pb=a=>{var b=a.getExtension("WEBGL_draw_buffers");b&&(a.drawBuffers=(c,d)=>b.drawBuffersWEBGL(c,d))},sb=a=>{a.Gd=a.getExtension("WEBGL_draw_instanced_base_vertex_base_instance")},
tb=a=>{a.Hd=a.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance")},ub=1,vb=[],L=[],wb=[],M=[],N=[],O=[],xb=[],yb=[],P=[],zb={},Ab=4;function Q(a){Bb||=a}
var Cb=a=>{for(var b=ub++,c=a.length;c<b;c++)a[c]=null;return b},Eb=(a,b)=>{a.Yc||(a.Yc=a.getContext,a.getContext=function(d,e){e=a.Yc(d,e);return"webgl"==d==e instanceof WebGLRenderingContext?e:null});var c=1<b.nd?a.getContext("webgl2",b):a.getContext("webgl",b);return c?Db(c,b):0},Db=(a,b)=>{var c=Cb(yb),d={handle:c,attributes:b,version:b.nd,dd:a};a.canvas&&(a.canvas.Dd=d);yb[c]=d;("undefined"==typeof b.ld||b.ld)&&Fb(d);return c},Fb=a=>{a||=R;if(!a.Bd){a.Bd=!0;var b=a.dd;nb(b);ob(b);pb(b);sb(b);
tb(b);2<=a.version&&(b.kd=b.getExtension("EXT_disjoint_timer_query_webgl2"));if(2>a.version||!b.kd)b.kd=b.getExtension("EXT_disjoint_timer_query");b.Cd=b.getExtension("WEBGL_multi_draw");(b.getSupportedExtensions()||[]).forEach(c=>{c.includes("lose_context")||c.includes("debug")||b.getExtension(c)})}};function Gb(){var a=S.getSupportedExtensions()||[];return a=a.concat(a.map(b=>"GL_"+b))}
for(var Bb,R,Hb=(a,b,c,d,e,h)=>{a={target:G(a),Rc:h,Tc:d,Uc:(g=event)=>{H(d)(e,0,b)&&g.preventDefault()},Sc:c};F(a)},Ib=(a,b,c,d)=>{bb||=J(104);return F({target:a,$c:!0,Rc:"wheel",Tc:d,Uc:(e=event)=>{var h=bb;ib(h,e,a);z[h+72>>3]=e.deltaX;z[h+80>>3]=e.deltaY;z[h+88>>3]=e.deltaZ;v[h+96>>2]=e.deltaMode;H(d)(9,h,b)&&e.preventDefault()},Sc:c})},Jb=["default","low-power","high-performance"],Kb=[null,[],[]],Lb=[],T=(a,b,c,d)=>{for(var e=0;e<a;e++){var h=S[c](),g=h&&Cb(d);h?(h.name=g,d[g]=h):Q(1282);v[b+
4*e>>2]=g}},Mb=(a,b)=>{if(b){var c=void 0;switch(a){case 36346:c=1;break;case 36344:return;case 34814:case 36345:c=0;break;case 34466:var d=S.getParameter(34467);c=d?d.length:0;break;case 33309:if(2>R.version){Q(1282);return}c=2*(S.getSupportedExtensions()||[]).length;break;case 33307:case 33308:if(2>R.version){Q(1280);return}c=33307==a?3:0}if(void 0===c)switch(d=S.getParameter(a),typeof d){case "number":c=d;break;case "boolean":c=d?1:0;break;case "string":Q(1280);return;case "object":if(null===d)switch(a){case 34964:case 35725:case 34965:case 36006:case 36007:case 32873:case 34229:case 36662:case 36663:case 35053:case 35055:case 36010:case 35097:case 35869:case 32874:case 36389:case 35983:case 35368:case 34068:c=
0;break;default:Q(1280);return}else{if(d instanceof Float32Array||d instanceof Uint32Array||d instanceof Int32Array||d instanceof Array){for(a=0;a<d.length;++a)v[b+4*a>>2]=d[a];return}try{c=d.name|0}catch(e){Q(1280);q(`GL_INVALID_ENUM in glGet${0}v: Unknown object returned from WebGL getParameter(${a})! (error: ${e})`);return}}break;default:Q(1280);q(`GL_INVALID_ENUM in glGet${0}v: Native code calling glGet${0}v(${a}) and it returns ${d} of type ${typeof d}!`);return}v[b>>2]=c}else Q(1281)},Nb=a=>
{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);127>=d?b++:2047>=d?b+=2:55296<=d&&57343>=d?(b+=4,++c):b+=3}return b},Ob=a=>"]"==a.slice(-1)&&a.lastIndexOf("["),U=a=>{a-=5120;return 0==a?ra:1==a?u:2==a?sa:4==a?v:6==a?y:5==a||28922==a||28520==a||30779==a||30782==a?x:ta},Pb=(a,b,c,d,e)=>{a=U(a);var h=31-Math.clz32(a.BYTES_PER_ELEMENT),g=Ab;return a.subarray(e>>h,e+d*(c*({5:3,6:4,8:2,29502:3,29504:4,26917:2,26918:2,29846:3,29847:4}[b-6402]||1)*(1<<h)+g-1&-g)>>h)},V=a=>{var b=S.yd;if(b){var c=b.Zc[a];
"number"==typeof c&&(b.Zc[a]=c=S.getUniformLocation(b,b.wd[a]+(0<c?`[${c}]`:"")));return c}Q(1282)},W=[],X=[],Qb=a=>{if(!Ja){if(f.onExit)f.onExit(a);qa=!0}da(a,new ma(a))},Sb=a=>{var b=Nb(a)+1,c=Rb(b);I(a,c,b);return c},S,Y=0;32>Y;++Y)Lb.push(Array(Y));var Tb=new Float32Array(288);for(Y=0;288>Y;++Y)W[Y]=Tb.subarray(0,Y+1);var Ub=new Int32Array(288);for(Y=0;288>Y;++Y)X[Y]=Ub.subarray(0,Y+1);
var ic={la:function(){return 0},nb:function(){return 0},ob:function(){},g:()=>{oa("")},fa:()=>"number"==typeof devicePixelRatio&&devicePixelRatio||1,ga:(a,b,c)=>{a=G(a);if(!a)return-4;a=db(a);z[b>>3]=a.width;z[c>>3]=a.height;return 0},y:()=>performance.now(),jb:(a,b,c)=>u.copyWithin(a,b,b+c),Xa:(a,b)=>{function c(d){H(a)(d,b)&&requestAnimationFrame(c)}return requestAnimationFrame(c)},ib:a=>{var b=u.length;a>>>=0;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);
var e=Math;d=Math.max(a,d);a:{e=(e.min.call(e,2147483648,d+(65536-d%65536)%65536)-pa.buffer.byteLength+65535)/65536;try{pa.grow(e);ua();var h=1;break a}catch(g){}h=void 0}if(h)return!0}return!1},P:(a,b,c,d)=>gb(a,b,c,d,12,"blur"),ea:(a,b,c)=>{a=G(a);if(!a)return-4;a.width=b;a.height=c;return 0},Q:(a,b,c,d)=>gb(a,b,c,d,13,"focus"),Z:(a,b,c,d)=>hb(a,b,c,d,2,"keydown"),X:(a,b,c,d)=>hb(a,b,c,d,1,"keypress"),Y:(a,b,c,d)=>hb(a,b,c,d,3,"keyup"),da:(a,b,c,d)=>K(a,b,c,d,5,"mousedown"),aa:(a,b,c,d)=>K(a,b,
c,d,33,"mouseenter"),$:(a,b,c,d)=>K(a,b,c,d,34,"mouseleave"),ba:(a,b,c,d)=>K(a,b,c,d,8,"mousemove"),ca:(a,b,c,d)=>K(a,b,c,d,6,"mouseup"),S:(a,b,c,d)=>{if(!document||!document.body||!(document.body.requestPointerLock||document.body.Yc||document.body.hd||document.body.gd))return-1;a=G(a);if(!a)return-4;jb(a,b,c,d,"mozpointerlockchange");jb(a,b,c,d,"webkitpointerlockchange");jb(a,b,c,d,"mspointerlockchange");return jb(a,b,c,d,"pointerlockchange")},R:(a,b,c,d)=>{if(!document||!(document.body.requestPointerLock||
document.body.Yc||document.body.hd||document.body.gd))return-1;a=G(a);if(!a)return-4;kb(a,b,c,d,"mozpointerlockerror");kb(a,b,c,d,"webkitpointerlockerror");kb(a,b,c,d,"mspointerlockerror");return kb(a,b,c,d,"pointerlockerror")},Ya:(a,b,c,d)=>lb(a,b,c,d),T:(a,b,c,d)=>mb(a,b,c,d,25,"touchcancel"),U:(a,b,c,d)=>mb(a,b,c,d,23,"touchend"),V:(a,b,c,d)=>mb(a,b,c,d,24,"touchmove"),W:(a,b,c,d)=>mb(a,b,c,d,22,"touchstart"),O:(a,b,c,d)=>{Hb(a,b,c,d,31,"webglcontextlost");return 0},N:(a,b,c,d)=>{Hb(a,b,c,d,32,
"webglcontextrestored");return 0},_:(a,b,c,d)=>(a=G(a))?"undefined"!=typeof a.onwheel?Ib(a,b,c,d):-1:-4,Va:(a,b)=>{b>>=2;b={alpha:!!v[b],depth:!!v[b+1],stencil:!!v[b+2],antialias:!!v[b+3],premultipliedAlpha:!!v[b+4],preserveDrawingBuffer:!!v[b+5],powerPreference:Jb[v[b+6]],failIfMajorPerformanceCaveat:!!v[b+7],nd:v[b+8],Id:v[b+9],ld:v[b+10],Ad:v[b+11],Jd:v[b+12],Kd:v[b+13]};a=G(a);return!a||b.Ad?0:Eb(a,b)},Sa:(a,b)=>{a=yb[a];b=b?D(u,b):"";b.startsWith("GL_")&&(b=b.substr(3));"ANGLE_instanced_arrays"==
b&&nb(S);"OES_vertex_array_object"==b&&ob(S);"WEBGL_draw_buffers"==b&&pb(S);"WEBGL_draw_instanced_base_vertex_base_instance"==b&&sb(S);"WEBGL_multi_draw_instanced_base_vertex_base_instance"==b&&tb(S);"WEBGL_multi_draw"==b&&(S.Cd=S.getExtension("WEBGL_multi_draw"));return!!a.dd.getExtension(b)},Wa:a=>{a>>=2;for(var b=0;14>b;++b)v[a+b]=0;v[a]=v[a+1]=v[a+3]=v[a+4]=v[a+8]=v[a+10]=1},Ua:a=>{R=yb[a];f.Fd=S=R&&R.dd;return!a||S?0:-5},ka:()=>52,mb:()=>52,hb:function(){return 70},kb:(a,b,c,d)=>{for(var e=0,
h=0;h<c;h++){var g=x[b>>2],l=x[b+4>>2];b+=8;for(var n=0;n<l;n++){var p=u[g+n],t=Kb[a];0===p||10===p?((1===a?na:q)(D(t,0)),t.length=0):t.push(p)}e+=l}x[d>>2]=e;return 0},i:function(a,b,c){const d=a?D(u,a):"";let e;try{e=window.indexedDB.open("chips",1)}catch(h){console.log("fs_js_load_snapshot: failed to open IndexedDB with "+h)}e.onupgradeneeded=()=>{console.log("fs_js_load_snapshot: creating db");e.result.createObjectStore("store")};e.onsuccess=()=>{var h=e.result;let g;try{g=h.transaction(["store"],
"readwrite")}catch(p){console.log("fs_js_load_snapshot: db.transaction failed with",p);return}h=g.objectStore("store");let l=d+"_"+b,n=h.get(l);n.onsuccess=()=>{if(void 0!==n.result){let p=n.result.length;console.log("fs_js_load_snapshot:",l,"successfully loaded",p,"bytes");let t=Vb(p);u.set(n.result,t);Wb(c,t,p)}else Wb(c,0,0)};n.onerror=()=>{console.log("fs_js_load_snapshot: FAILED loading",l)};g.onerror=()=>{console.log("fs_js_load_snapshot: transaction onerror")}};e.onerror=()=>{console.log("fs_js_load_snapshot: open_request onerror")}},
eb:function(a,b,c,d){const e=a?D(u,a):"";console.log("fs_js_save_snapshot: called with",e,b);let h;try{h=window.indexedDB.open("chips",1)}catch(g){console.log("fs_js_save_snapshot: failed to open IndexedDB with "+g);return}h.onupgradeneeded=()=>{console.log("fs_js_save_snapshot: creating db");h.result.createObjectStore("store")};h.onsuccess=()=>{console.log("fs_js_save_snapshot: onsuccess");let g=h.result.transaction(["store"],"readwrite");var l=g.objectStore("store");let n=e+"_"+b;l=l.put(u.subarray(c,
c+d),n);l.onsuccess=()=>{console.log("fs_js_save_snapshot:",n,"successfully stored")};l.onerror=()=>{console.log("fs_js_save_snapshot: FAILED to store",n)};g.onerror=()=>{console.log("fs_js_save_snapshot: transaction onerror")}};h.onerror=()=>{console.log("fs_js_save_snapshot: open_request onerror")}},l:function(a){S.activeTexture(a)},wa:(a,b)=>{S.attachShader(L[a],O[b])},a:(a,b)=>{35051==a?S.jd=b:35052==a&&(S.Wc=b);S.bindBuffer(a,vb[b])},j:(a,b)=>{S.bindFramebuffer(a,wb[b])},Ca:(a,b)=>{S.bindRenderbuffer(a,
M[b])},m:(a,b)=>{S.bindSampler(a,P[b])},c:(a,b)=>{S.bindTexture(a,N[b])},J:a=>{S.bindVertexArray(xb[a])},F:function(a,b,c,d){S.blendColor(a,b,c,d)},G:function(a,b){S.blendEquationSeparate(a,b)},H:function(a,b,c,d){S.blendFuncSeparate(a,b,c,d)},sb:function(a,b,c,d,e,h,g,l,n,p){S.blitFramebuffer(a,b,c,d,e,h,g,l,n,p)},Ea:(a,b,c,d)=>{2<=R.version?c&&b?S.bufferData(a,u,d,c,b):S.bufferData(a,b,d):S.bufferData(a,c?u.subarray(c,c+b):b,d)},r:(a,b,c,d)=>{2<=R.version?c&&S.bufferSubData(a,b,u,d,c):S.bufferSubData(a,
b,u.subarray(d,d+c))},qa:function(a){return S.checkFramebufferStatus(a)},Nb:function(a,b,c,d){S.clearBufferfi(a,b,c,d)},oa:(a,b,c)=>{S.clearBufferfv(a,b,y,c>>2)},Mb:(a,b,c)=>{S.clearBufferiv(a,b,v,c>>2)},o:(a,b,c,d)=>{S.colorMask(!!a,!!b,!!c,!!d)},Sb:a=>{S.compileShader(O[a])},bc:(a,b,c,d,e,h,g,l)=>{2<=R.version?S.Wc||!g?S.compressedTexImage2D(a,b,c,d,e,h,g,l):S.compressedTexImage2D(a,b,c,d,e,h,u,l,g):S.compressedTexImage2D(a,b,c,d,e,h,l?u.subarray(l,l+g):null)},$b:(a,b,c,d,e,h,g,l,n)=>{S.Wc?S.compressedTexImage3D(a,
b,c,d,e,h,g,l,n):S.compressedTexImage3D(a,b,c,d,e,h,g,u,n,l)},Yb:()=>{var a=Cb(L),b=S.createProgram();b.name=a;b.cd=b.ad=b.bd=0;b.ed=1;L[a]=b;return a},Ub:a=>{var b=Cb(O);O[b]=S.createShader(a);return b},C:function(a){S.cullFace(a)},Oa:(a,b)=>{for(var c=0;c<a;c++){var d=v[b+4*c>>2],e=vb[d];e&&(S.deleteBuffer(e),e.name=0,vb[d]=null,d==S.jd&&(S.jd=0),d==S.Wc&&(S.Wc=0))}},e:(a,b)=>{for(var c=0;c<a;++c){var d=v[b+4*c>>2],e=wb[d];e&&(S.deleteFramebuffer(e),e.name=0,wb[d]=null)}},w:a=>{if(a){var b=L[a];
b?(S.deleteProgram(b),b.name=0,L[a]=null):Q(1281)}},L:(a,b)=>{for(var c=0;c<a;c++){var d=v[b+4*c>>2],e=M[d];e&&(S.deleteRenderbuffer(e),e.name=0,M[d]=null)}},K:(a,b)=>{for(var c=0;c<a;c++){var d=v[b+4*c>>2],e=P[d];e&&(S.deleteSampler(e),e.name=0,P[d]=null)}},B:a=>{if(a){var b=O[a];b?(S.deleteShader(b),O[a]=null):Q(1281)}},M:(a,b)=>{for(var c=0;c<a;c++){var d=v[b+4*c>>2],e=N[d];e&&(S.deleteTexture(e),e.name=0,N[d]=null)}},Ma:(a,b)=>{for(var c=0;c<a;c++){var d=v[b+4*c>>2];S.deleteVertexArray(xb[d]);
xb[d]=null}},v:function(a){S.depthFunc(a)},u:a=>{S.depthMask(!!a)},d:function(a){S.disable(a)},I:a=>{S.disableVertexAttribArray(a)},ub:(a,b,c)=>{S.drawArrays(a,b,c)},wb:(a,b,c,d)=>{S.drawArraysInstanced(a,b,c,d)},pa:(a,b)=>{for(var c=Lb[a],d=0;d<a;d++)c[d]=v[b+4*d>>2];S.drawBuffers(c)},xb:(a,b,c,d)=>{S.drawElements(a,b,c,d)},yb:(a,b,c,d,e)=>{S.drawElementsInstanced(a,b,c,d,e)},h:function(a){S.enable(a)},Jb:a=>{S.enableVertexAttribArray(a)},ra:(a,b,c,d)=>{S.framebufferRenderbuffer(a,b,c,M[d])},n:(a,
b,c,d,e)=>{S.framebufferTexture2D(a,b,c,N[d],e)},A:(a,b,c,d,e)=>{S.framebufferTextureLayer(a,b,N[c],d,e)},D:function(a){S.frontFace(a)},Fa:(a,b)=>{T(a,b,"createBuffer",vb)},sa:(a,b)=>{T(a,b,"createFramebuffer",wb)},Da:(a,b)=>{T(a,b,"createRenderbuffer",M)},Zb:(a,b)=>{T(a,b,"createSampler",P)},Aa:(a,b)=>{T(a,b,"createTexture",N)},La:function(a,b){T(a,b,"createVertexArray",xb)},Pb:(a,b)=>S.getAttribLocation(L[a],b?D(u,b):""),b:(a,b)=>Mb(a,b),Vb:(a,b,c,d)=>{a=S.getProgramInfoLog(L[a]);null===a&&(a="(unknown error)");
b=0<b&&d?I(a,d,b):0;c&&(v[c>>2]=b)},va:(a,b,c)=>{if(c)if(a>=ub)Q(1281);else if(a=L[a],35716==b)a=S.getProgramInfoLog(a),null===a&&(a="(unknown error)"),v[c>>2]=a.length+1;else if(35719==b){if(!a.cd)for(b=0;b<S.getProgramParameter(a,35718);++b)a.cd=Math.max(a.cd,S.getActiveUniform(a,b).name.length+1);v[c>>2]=a.cd}else if(35722==b){if(!a.ad)for(b=0;b<S.getProgramParameter(a,35721);++b)a.ad=Math.max(a.ad,S.getActiveAttrib(a,b).name.length+1);v[c>>2]=a.ad}else if(35381==b){if(!a.bd)for(b=0;b<S.getProgramParameter(a,
35382);++b)a.bd=Math.max(a.bd,S.getActiveUniformBlockName(a,b).length+1);v[c>>2]=a.bd}else v[c>>2]=S.getProgramParameter(a,b);else Q(1281)},Rb:(a,b,c,d)=>{a=S.getShaderInfoLog(O[a]);null===a&&(a="(unknown error)");b=0<b&&d?I(a,d,b):0;c&&(v[c>>2]=b)},ta:(a,b,c)=>{c?35716==b?(a=S.getShaderInfoLog(O[a]),null===a&&(a="(unknown error)"),v[c>>2]=a?a.length+1:0):35720==b?(a=S.getShaderSource(O[a]),v[c>>2]=a?a.length+1:0):v[c>>2]=S.getShaderParameter(O[a],b):Q(1281)},Pa:(a,b)=>{if(2>R.version)return Q(1282),
0;var c=zb[a];if(c)return 0>b||b>=c.length?(Q(1281),0):c[b];switch(a){case 7939:return c=Gb().map(d=>{var e=Nb(d)+1,h=J(e);h&&I(d,h,e);return h}),c=zb[a]=c,0>b||b>=c.length?(Q(1281),0):c[b];default:return Q(1280),0}},s:(a,b)=>{b=b?D(u,b):"";if(a=L[a]){var c=a,d=c.Zc,e=c.xd,h;if(!d)for(c.Zc=d={},c.wd={},h=0;h<S.getProgramParameter(c,35718);++h){var g=S.getActiveUniform(c,h);var l=g.name;g=g.size;var n=Ob(l);n=0<n?l.slice(0,n):l;var p=c.ed;c.ed+=g;e[n]=[g,p];for(l=0;l<g;++l)d[p]=l,c.wd[p++]=n}c=a.Zc;
d=0;e=b;h=Ob(b);0<h&&(d=parseInt(b.slice(h+1))>>>0,e=b.slice(0,h));if((e=a.xd[e])&&d<e[0]&&(d+=e[1],c[d]=c[d]||S.getUniformLocation(a,b)))return d}else Q(1281);return-1},rb:(a,b,c)=>{for(var d=Lb[b],e=0;e<b;e++)d[e]=v[c+4*e>>2];S.invalidateFramebuffer(a,d)},Xb:a=>{a=L[a];S.linkProgram(a);a.Zc=0;a.xd={}},Ka:(a,b)=>{3317==a&&(Ab=b);S.pixelStorei(a,b)},E:function(a,b){S.polygonOffset(a,b)},tb:function(a){S.readBuffer(a)},Ba:function(a,b,c,d,e){S.renderbufferStorageMultisample(a,b,c,d,e)},xa:(a,b,c)=>
{S.samplerParameterf(P[a],b,c)},f:(a,b,c)=>{S.samplerParameteri(P[a],b,c)},q:function(a,b,c,d){S.scissor(a,b,c,d)},Tb:(a,b,c,d)=>{for(var e="",h=0;h<b;++h){var g=d?v[d+4*h>>2]:-1,l=v[c+4*h>>2];g=l?D(u,l,0>g?void 0:g):"";e+=g}S.shaderSource(O[a],e)},Ia:function(a,b,c){S.stencilFunc(a,b,c)},na:function(a,b,c,d){S.stencilFuncSeparate(a,b,c,d)},t:function(a){S.stencilMask(a)},Ha:function(a,b,c){S.stencilOp(a,b,c)},ma:function(a,b,c,d){S.stencilOpSeparate(a,b,c,d)},ac:(a,b,c,d,e,h,g,l,n)=>{if(2<=R.version)if(S.Wc)S.texImage2D(a,
b,c,d,e,h,g,l,n);else if(n){var p=U(l);S.texImage2D(a,b,c,d,e,h,g,l,p,n>>31-Math.clz32(p.BYTES_PER_ELEMENT))}else S.texImage2D(a,b,c,d,e,h,g,l,null);else S.texImage2D(a,b,c,d,e,h,g,l,n?Pb(l,g,d,e,n):null)},_b:(a,b,c,d,e,h,g,l,n,p)=>{if(S.Wc)S.texImage3D(a,b,c,d,e,h,g,l,n,p);else if(p){var t=U(n);S.texImage3D(a,b,c,d,e,h,g,l,n,t,p>>31-Math.clz32(t.BYTES_PER_ELEMENT))}else S.texImage3D(a,b,c,d,e,h,g,l,n,null)},za:function(a,b,c){S.texParameteri(a,b,c)},qb:(a,b,c,d,e,h,g,l,n)=>{if(2<=R.version)if(S.Wc)S.texSubImage2D(a,
b,c,d,e,h,g,l,n);else if(n){var p=U(l);S.texSubImage2D(a,b,c,d,e,h,g,l,p,n>>31-Math.clz32(p.BYTES_PER_ELEMENT))}else S.texSubImage2D(a,b,c,d,e,h,g,l,null);else p=null,n&&(p=Pb(l,g,e,h,n)),S.texSubImage2D(a,b,c,d,e,h,g,l,p)},pb:(a,b,c,d,e,h,g,l,n,p,t)=>{if(S.Wc)S.texSubImage3D(a,b,c,d,e,h,g,l,n,p,t);else if(t){var w=U(p);S.texSubImage3D(a,b,c,d,e,h,g,l,n,p,w,t>>31-Math.clz32(w.BYTES_PER_ELEMENT))}else S.texSubImage3D(a,b,c,d,e,h,g,l,n,p,null)},Ib:(a,b,c)=>{if(2<=R.version)b&&S.uniform1fv(V(a),y,c>>
2,b);else{if(288>=b)for(var d=W[b-1],e=0;e<b;++e)d[e]=y[c+4*e>>2];else d=y.subarray(c>>2,c+4*b>>2);S.uniform1fv(V(a),d)}},ua:(a,b)=>{S.uniform1i(V(a),b)},Db:(a,b,c)=>{if(2<=R.version)b&&S.uniform1iv(V(a),v,c>>2,b);else{if(288>=b)for(var d=X[b-1],e=0;e<b;++e)d[e]=v[c+4*e>>2];else d=v.subarray(c>>2,c+4*b>>2);S.uniform1iv(V(a),d)}},Hb:(a,b,c)=>{if(2<=R.version)b&&S.uniform2fv(V(a),y,c>>2,2*b);else{if(144>=b)for(var d=W[2*b-1],e=0;e<2*b;e+=2)d[e]=y[c+4*e>>2],d[e+1]=y[c+(4*e+4)>>2];else d=y.subarray(c>>
2,c+8*b>>2);S.uniform2fv(V(a),d)}},Cb:(a,b,c)=>{if(2<=R.version)b&&S.uniform2iv(V(a),v,c>>2,2*b);else{if(144>=b)for(var d=X[2*b-1],e=0;e<2*b;e+=2)d[e]=v[c+4*e>>2],d[e+1]=v[c+(4*e+4)>>2];else d=v.subarray(c>>2,c+8*b>>2);S.uniform2iv(V(a),d)}},Fb:(a,b,c)=>{if(2<=R.version)b&&S.uniform3fv(V(a),y,c>>2,3*b);else{if(96>=b)for(var d=W[3*b-1],e=0;e<3*b;e+=3)d[e]=y[c+4*e>>2],d[e+1]=y[c+(4*e+4)>>2],d[e+2]=y[c+(4*e+8)>>2];else d=y.subarray(c>>2,c+12*b>>2);S.uniform3fv(V(a),d)}},Bb:(a,b,c)=>{if(2<=R.version)b&&
S.uniform3iv(V(a),v,c>>2,3*b);else{if(96>=b)for(var d=X[3*b-1],e=0;e<3*b;e+=3)d[e]=v[c+4*e>>2],d[e+1]=v[c+(4*e+4)>>2],d[e+2]=v[c+(4*e+8)>>2];else d=v.subarray(c>>2,c+12*b>>2);S.uniform3iv(V(a),d)}},Eb:(a,b,c)=>{if(2<=R.version)b&&S.uniform4fv(V(a),y,c>>2,4*b);else{if(72>=b){var d=W[4*b-1],e=y;c>>=2;for(var h=0;h<4*b;h+=4){var g=c+h;d[h]=e[g];d[h+1]=e[g+1];d[h+2]=e[g+2];d[h+3]=e[g+3]}}else d=y.subarray(c>>2,c+16*b>>2);S.uniform4fv(V(a),d)}},Ab:(a,b,c)=>{if(2<=R.version)b&&S.uniform4iv(V(a),v,c>>2,
4*b);else{if(72>=b)for(var d=X[4*b-1],e=0;e<4*b;e+=4)d[e]=v[c+4*e>>2],d[e+1]=v[c+(4*e+4)>>2],d[e+2]=v[c+(4*e+8)>>2],d[e+3]=v[c+(4*e+12)>>2];else d=v.subarray(c>>2,c+16*b>>2);S.uniform4iv(V(a),d)}},zb:(a,b,c,d)=>{if(2<=R.version)b&&S.uniformMatrix4fv(V(a),!!c,y,d>>2,16*b);else{if(18>=b){var e=W[16*b-1],h=y;d>>=2;for(var g=0;g<16*b;g+=16){var l=d+g;e[g]=h[l];e[g+1]=h[l+1];e[g+2]=h[l+2];e[g+3]=h[l+3];e[g+4]=h[l+4];e[g+5]=h[l+5];e[g+6]=h[l+6];e[g+7]=h[l+7];e[g+8]=h[l+8];e[g+9]=h[l+9];e[g+10]=h[l+10];
e[g+11]=h[l+11];e[g+12]=h[l+12];e[g+13]=h[l+13];e[g+14]=h[l+14];e[g+15]=h[l+15]}}else e=y.subarray(d>>2,d+64*b>>2);S.uniformMatrix4fv(V(a),!!c,e)}},p:a=>{a=L[a];S.useProgram(a);S.yd=a},Kb:(a,b)=>{S.vertexAttribDivisor(a,b)},Lb:(a,b,c,d,e,h)=>{S.vertexAttribPointer(a,b,c,!!d,e,h)},k:function(a,b,c,d){S.viewport(a,b,c,d)},Ja:function(){f.pd=a=>{0!=Xb()&&(a.preventDefault(),a.returnValue=" ")};window.addEventListener("beforeunload",f.pd)},cc:function(){f.vd=a=>{const b=a.clipboardData.getData("text");
Na(()=>{const c=Sb(b);Yb(c)})};window.addEventListener("paste",f.vd)},Ob:function(a){f.Ld=[];a=a?D(u,a):"";a=document.getElementById(a);f.qd=b=>{b.stopPropagation();b.preventDefault()};f.rd=b=>{b.stopPropagation();b.preventDefault()};f.sd=b=>{b.stopPropagation();b.preventDefault()};f.td=b=>{b.stopPropagation();b.preventDefault();const c=b.dataTransfer.files;f.ud=c;Zb(c.length);for(let e=0;e<c.length;e++)Na(()=>{const h=Sb(c[e].name);$b(e,h)});let d=0;b.shiftKey&&(d|=1);b.ctrlKey&&(d|=2);b.altKey&&
(d|=4);b.metaKey&&(d|=8);ac(b.clientX,b.clientY,d)};a.addEventListener("dragenter",f.qd,!1);a.addEventListener("dragleave",f.rd,!1);a.addEventListener("dragover",f.sd,!1);a.addEventListener("drop",f.td,!1)},db:function(){const a=document.getElementById("sokol-app-favicon");a&&document.head.removeChild(a)},Gb:function(a){const b=f.ud;return 0>a||a>=b.length?0:b[a].size},vb:function(a,b,c,d,e){const h=new FileReader;h.onload=g=>{g=g.target.result;g.byteLength>d?bc(a,0,1,b,0,c,d,e):(u.set(new Uint8Array(g),
c),bc(a,1,0,b,g.byteLength,c,d,e))};h.onerror=()=>{bc(a,0,2,b,0,c,d,e)};h.readAsArrayBuffer(f.ud[a])},gb:function(a){a=a?D(u,a):"";f.Xc=document.getElementById(a);f.Xc||console.log("sokol_app.h: invalid target:"+a);f.Xc.requestPointerLock||console.log("sokol_app.h: target doesn't support requestPointerLock:"+a)},Ga:function(){window.removeEventListener("beforeunload",f.pd)},Wb:function(){window.removeEventListener("paste",f.vd)},lb:function(a){a=a?D(u,a):"";a=document.getElementById(a);a.removeEventListener("dragenter",
f.qd);a.removeEventListener("dragleave",f.rd);a.removeEventListener("dragover",f.sd);a.removeEventListener("drop",f.td)},z:function(){f.Xc&&f.Xc.requestPointerLock&&f.Xc.requestPointerLock()},fb:function(a,b){if(f.Xc){if(0===b)a="none";else switch(a){case 0:a="auto";break;case 1:a="default";break;case 2:a="text";break;case 3:a="crosshair";break;case 4:a="pointer";break;case 5:a="ew-resize";break;case 6:a="ns-resize";break;case 7:a="nwse-resize";break;case 8:a="nesw-resize";break;case 9:a="all-scroll";
break;case 10:a="not-allowed";break;default:a="auto"}f.Xc.style.cursor=a}},cb:function(a,b,c){const d=document.createElement("canvas");d.width=a;d.height=b;const e=d.getContext("2d"),h=e.createImageData(a,b);h.data.set(u.subarray(c,c+a*b*4));e.putImageData(h,0,0);a=document.createElement("link");a.id="sokol-app-favicon";a.rel="shortcut icon";a.href=d.toDataURL();document.head.appendChild(a)},Qb:function(a){a=a?D(u,a):"";const b=document.createElement("textarea");b.setAttribute("autocomplete","off");
b.setAttribute("autocorrect","off");b.setAttribute("autocapitalize","off");b.setAttribute("spellcheck","false");b.style.left="-100px";b.style.top="-100px";b.style.height=1;b.style.width=1;b.value=a;document.body.appendChild(b);b.select();document.execCommand("copy");document.body.removeChild(b)},Za:function(){const a=(new URLSearchParams(window.location.search)).entries();for(let b=a.next();!b.done;b=a.next()){const c=b.value[0],d=b.value[1];Na(()=>{const e=Sb(c),h=Sb(d);cc(e,h)})}},$a:function(){return f.Vc?
f.Vc.bufferSize:0},bb:function(a,b,c){f.Qc=null;f.Vc=null;"undefined"!==typeof AudioContext?f.Qc=new AudioContext({sampleRate:a,latencyHint:"interactive"}):(f.Qc=null,console.log("sokol_audio.h: no WebAudio support"));return f.Qc?(console.log("sokol_audio.h: sample rate ",f.Qc.sampleRate),f.Vc=f.Qc.createScriptProcessor(c,0,b),f.Vc.onaudioprocess=d=>{const e=d.outputBuffer.length,h=dc(e);if(h){const g=d.outputBuffer.numberOfChannels;for(let l=0;l<g;l++){const n=d.outputBuffer.getChannelData(l);for(let p=
0;p<e;p++)n[p]=y[(h>>2)+(g*p+l)]}}},f.Vc.connect(f.Qc.destination),a=()=>{f.Qc&&"suspended"===f.Qc.state&&f.Qc.resume()},document.addEventListener("click",a,{once:!0}),document.addEventListener("touchend",a,{once:!0}),document.addEventListener("keydown",a,{once:!0}),1):0},ab:function(){return f.Qc?f.Qc.sampleRate:0},ja:function(){const a=f.Qc;null!==a&&(f.Vc&&f.Vc.disconnect(),a.close(),f.Qc=null,f.Vc=null)},_a:function(){if(f.Qc)return"suspended"===f.Qc.state?1:0},x:function(a,b,c,d,e,h){b=b?D(u,
b):"";const g=new XMLHttpRequest;g.open("GET",b);g.responseType="arraybuffer";const l=0<d;l&&g.setRequestHeader("Range","bytes="+c+"-"+(c+d-1));g.onreadystatechange=function(){if(g.readyState==XMLHttpRequest.DONE)if(206==g.status||200==g.status&&!l){const n=new Uint8Array(g.response),p=n.length;p<=h?(u.set(n,e),ec(a,d,p)):fc(a)}else gc(a,g.status)};g.send()},ia:function(a,b){b=b?D(u,b):"";const c=new XMLHttpRequest;c.open("HEAD",b);c.onreadystatechange=function(){if(c.readyState==XMLHttpRequest.DONE)if(200==
c.status){const d=c.getResponseHeader("Content-Length");hc(a,d)}else gc(a,c.status)};c.send()},ya:function(){return navigator.userAgent.includes("Macintosh")?1:0},ha:function(a,b){b=b?D(u,b):"";switch(a){case 0:console.error(b);break;case 1:console.error(b);break;case 2:console.warn(b);break;default:console.info(b)}},Ra:function(){console.log("webapi_js_event_continued()");f.webapi_onContinued?f.webapi_onContinued():console.log("no Module.webapi_onContinued function")},Qa:function(){console.log("webapi_js_event_reboot()");
f.webapi_onReboot?f.webapi_onReboot():console.log("no Module.webapi_onReboot function")},Na:function(){console.log("webapi_js_event_reset()");f.webapi_onReset?f.webapi_onReset():console.log("no Module.webapi_onReset function")},Ta:function(a,b){console.log("webapi_js_event_stopped()");f.webapi_onStopped?f.webapi_onStopped(a,b):console.log("no Module.webapi_onStopped function")}},Z=function(){function a(c){Z=c.exports;pa=Z.dc;ua();fb=Z.Mc;wa.unshift(Z.ec);A--;f.monitorRunDependencies&&f.monitorRunDependencies(A);
0==A&&(null!==Ba&&(clearInterval(Ba),Ba=null),B&&(c=B,B=null,c()));return Z}var b={a:ic};A++;f.monitorRunDependencies&&f.monitorRunDependencies(A);if(f.instantiateWasm)try{return f.instantiateWasm(b,a)}catch(c){return q(`Module.instantiateWasm callback failed with error: ${c}`),!1}Ha(b,function(c){a(c.instance)});return{}}(),J=a=>(J=Z.fc)(a),Vb=f._fs_emsc_alloc=a=>(Vb=f._fs_emsc_alloc=Z.gc)(a),Wb=f._fs_emsc_load_snapshot_callback=(a,b,c)=>(Wb=f._fs_emsc_load_snapshot_callback=Z.hc)(a,b,c);
f._webapi_dbg_connect=()=>(f._webapi_dbg_connect=Z.ic)();f._webapi_dbg_disconnect=()=>(f._webapi_dbg_disconnect=Z.jc)();f._webapi_alloc=a=>(f._webapi_alloc=Z.kc)(a);f._webapi_free=a=>(f._webapi_free=Z.lc)(a);f._webapi_boot=()=>(f._webapi_boot=Z.mc)();f._webapi_reset=()=>(f._webapi_reset=Z.nc)();f._webapi_ready=()=>(f._webapi_ready=Z.oc)();f._webapi_quickload=(a,b,c,d)=>(f._webapi_quickload=Z.pc)(a,b,c,d);f._webapi_dbg_add_breakpoint=a=>(f._webapi_dbg_add_breakpoint=Z.qc)(a);
f._webapi_dbg_remove_breakpoint=a=>(f._webapi_dbg_remove_breakpoint=Z.rc)(a);f._webapi_dbg_break=()=>(f._webapi_dbg_break=Z.sc)();f._webapi_dbg_continue=()=>(f._webapi_dbg_continue=Z.tc)();f._webapi_dbg_step_next=()=>(f._webapi_dbg_step_next=Z.uc)();f._webapi_dbg_step_into=()=>(f._webapi_dbg_step_into=Z.vc)();f._webapi_dbg_cpu_state=()=>(f._webapi_dbg_cpu_state=Z.wc)();f._webapi_dbg_request_disassembly=(a,b,c)=>(f._webapi_dbg_request_disassembly=Z.xc)(a,b,c);
f._webapi_dbg_read_memory=(a,b)=>(f._webapi_dbg_read_memory=Z.yc)(a,b);
var Yb=f.__sapp_emsc_onpaste=a=>(Yb=f.__sapp_emsc_onpaste=Z.zc)(a),Xb=f.__sapp_html5_get_ask_leave_site=()=>(Xb=f.__sapp_html5_get_ask_leave_site=Z.Ac)(),Zb=f.__sapp_emsc_begin_drop=a=>(Zb=f.__sapp_emsc_begin_drop=Z.Bc)(a),$b=f.__sapp_emsc_drop=(a,b)=>($b=f.__sapp_emsc_drop=Z.Cc)(a,b),ac=f.__sapp_emsc_end_drop=(a,b,c)=>(ac=f.__sapp_emsc_end_drop=Z.Dc)(a,b,c),bc=f.__sapp_emsc_invoke_fetch_cb=(a,b,c,d,e,h,g,l)=>(bc=f.__sapp_emsc_invoke_fetch_cb=Z.Ec)(a,b,c,d,e,h,g,l),jc=f._main=(a,b)=>(jc=f._main=Z.Fc)(a,
b),dc=f.__saudio_emsc_pull=a=>(dc=f.__saudio_emsc_pull=Z.Gc)(a),cc=f.__sargs_add_kvp=(a,b)=>(cc=f.__sargs_add_kvp=Z.Hc)(a,b),hc=f.__sfetch_emsc_head_response=(a,b)=>(hc=f.__sfetch_emsc_head_response=Z.Ic)(a,b),ec=f.__sfetch_emsc_get_response=(a,b,c)=>(ec=f.__sfetch_emsc_get_response=Z.Jc)(a,b,c),gc=f.__sfetch_emsc_failed_http_status=(a,b)=>(gc=f.__sfetch_emsc_failed_http_status=Z.Kc)(a,b),fc=f.__sfetch_emsc_failed_buffer_too_small=a=>(fc=f.__sfetch_emsc_failed_buffer_too_small=Z.Lc)(a),La=()=>(La=
Z.Nc)(),Ma=a=>(Ma=Z.Oc)(a),Rb=a=>(Rb=Z.Pc)(a);f.___start_em_js=63892;f.___stop_em_js=77203;var kc;B=function lc(){kc||mc();kc||(B=lc)};function nc(a=[]){var b=jc;a.unshift(ca);var c=a.length,d=Rb(4*(c+1)),e=d;a.forEach(g=>{x[e>>2]=Sb(g);e+=4});x[e>>2]=0;try{var h=b(c,d);Qb(h)}catch(g){g instanceof ma||"unwind"==g||da(1,g)}}
function mc(){var a=ba;function b(){if(!kc&&(kc=!0,f.calledRun=!0,!qa)){Ia(wa);Ia(xa);if(f.onRuntimeInitialized)f.onRuntimeInitialized();oc&&nc(a);if(f.postRun)for("function"==typeof f.postRun&&(f.postRun=[f.postRun]);f.postRun.length;){var c=f.postRun.shift();za.unshift(c)}Ia(za)}}if(!(0<A)){if(f.preRun)for("function"==typeof f.preRun&&(f.preRun=[f.preRun]);f.preRun.length;)Aa();Ia(va);0<A||(f.setStatus?(f.setStatus("Running..."),setTimeout(function(){setTimeout(function(){f.setStatus("")},1);b()},
1)):b())}}if(f.preInit)for("function"==typeof f.preInit&&(f.preInit=[f.preInit]);0<f.preInit.length;)f.preInit.pop()();var oc=!0;f.noInitialRun&&(oc=!1);mc();
