var g;g||(g=typeof Module !== 'undefined' ? Module : {});var aa=Object.assign({},g),ba=[],ca="./this.program",da=(a,b)=>{throw b;},ea="object"==typeof window,k="function"==typeof importScripts,fa="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,m="",ha,ia,ja;
if(fa){var fs=require("fs"),ka=require("path");m=k?ka.dirname(m)+"/":__dirname+"/";ha=(a,b)=>{a=la(a)?new URL(a):ka.normalize(a);return fs.readFileSync(a,b?void 0:"utf8")};ja=a=>{a=ha(a,!0);a.buffer||(a=new Uint8Array(a));return a};ia=(a,b,c,d=!0)=>{a=la(a)?new URL(a):ka.normalize(a);fs.readFile(a,d?void 0:"utf8",(e,h)=>{e?c(e):b(d?h.buffer:h)})};!g.thisProgram&&1<process.argv.length&&(ca=process.argv[1].replace(/\\/g,"/"));ba=process.argv.slice(2);"undefined"!=typeof module&&(module.exports=g);process.on("uncaughtException",
a=>{if(!("unwind"===a||a instanceof ma||a.context instanceof ma))throw a;});da=(a,b)=>{process.exitCode=a;throw b;};g.inspect=()=>"[Emscripten Module object]"}else if(ea||k)k?m=self.location.href:"undefined"!=typeof document&&document.currentScript&&(m=document.currentScript.src),m=0!==m.indexOf("blob:")?m.substr(0,m.replace(/[?#].*/,"").lastIndexOf("/")+1):"",ha=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},k&&(ja=a=>{var b=new XMLHttpRequest;b.open("GET",a,
!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),ia=(a,b,c)=>{var d=new XMLHttpRequest;d.open("GET",a,!0);d.responseType="arraybuffer";d.onload=()=>{200==d.status||0==d.status&&d.response?b(d.response):c()};d.onerror=c;d.send(null)};var na=g.print||console.log.bind(console),q=g.printErr||console.error.bind(console);Object.assign(g,aa);aa=null;g.arguments&&(ba=g.arguments);g.thisProgram&&(ca=g.thisProgram);g.quit&&(da=g.quit);var r;g.wasmBinary&&(r=g.wasmBinary);
"object"!=typeof WebAssembly&&oa("no native wasm support detected");var pa,qa=!1,ra,u,sa,ta,v,x,y,z;function ua(){var a=pa.buffer;g.HEAP8=ra=new Int8Array(a);g.HEAP16=sa=new Int16Array(a);g.HEAPU8=u=new Uint8Array(a);g.HEAPU16=ta=new Uint16Array(a);g.HEAP32=v=new Int32Array(a);g.HEAPU32=x=new Uint32Array(a);g.HEAPF32=y=new Float32Array(a);g.HEAPF64=z=new Float64Array(a)}var va=[],wa=[],xa=[],ya=[],za=[];function Aa(){var a=g.preRun.shift();va.unshift(a)}var A=0,Ba=null,B=null;
function oa(a){if(g.onAbort)g.onAbort(a);a="Aborted("+a+")";q(a);qa=!0;throw new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");}var Ca=a=>a.startsWith("data:application/octet-stream;base64,"),la=a=>a.startsWith("file://"),C;C="kc853-ui.wasm";if(!Ca(C)){var Da=C;C=g.locateFile?g.locateFile(Da,m):m+Da}function Ea(a){if(a==C&&r)return new Uint8Array(r);if(ja)return ja(a);throw"both async and sync fetching of the wasm failed";}
function Fa(a){if(!r&&(ea||k)){if("function"==typeof fetch&&!la(a))return fetch(a,{credentials:"same-origin"}).then(b=>{if(!b.ok)throw"failed to load wasm binary file at '"+a+"'";return b.arrayBuffer()}).catch(()=>Ea(a));if(ia)return new Promise((b,c)=>{ia(a,d=>b(new Uint8Array(d)),c)})}return Promise.resolve().then(()=>Ea(a))}function Ga(a,b,c){return Fa(a).then(d=>WebAssembly.instantiate(d,b)).then(d=>d).then(c,d=>{q(`failed to asynchronously prepare wasm: ${d}`);oa(d)})}
function Ha(a,b){var c=C;r||"function"!=typeof WebAssembly.instantiateStreaming||Ca(c)||la(c)||fa||"function"!=typeof fetch?Ga(c,a,b):fetch(c,{credentials:"same-origin"}).then(d=>WebAssembly.instantiateStreaming(d,a).then(b,function(e){q(`wasm streaming compile failed: ${e}`);q("falling back to ArrayBuffer instantiation");return Ga(c,a,b)}))}function ma(a){this.name="ExitStatus";this.message=`Program terminated with exit(${a})`;this.status=a}
var Ia=a=>{for(;0<a.length;)a.shift()(g)},Ja=g.noExitRuntime||!0,Ka="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0,D=(a,b,c)=>{var d=b+c;for(c=b;a[c]&&!(c>=d);)++c;if(16<c-b&&a.buffer&&Ka)return Ka.decode(a.subarray(b,c));for(d="";b<c;){var e=a[b++];if(e&128){var h=a[b++]&63;if(192==(e&224))d+=String.fromCharCode((e&31)<<6|h);else{var f=a[b++]&63;e=224==(e&240)?(e&15)<<12|h<<6|f:(e&7)<<18|h<<12|f<<6|a[b++]&63;65536>e?d+=String.fromCharCode(e):(e-=65536,d+=String.fromCharCode(55296|
e>>10,56320|e&1023))}}else d+=String.fromCharCode(e)}return d},Na=a=>{var b=La();a();Ma(b)},Oa=0;function Pa(){for(var a=E.length-1;0<=a;--a)Qa(a);E=[];Ra=[]}var Ra=[];function Sa(){if(navigator.userActivation?navigator.userActivation.isActive:Oa&&Ta.Pc)for(var a=0;a<Ra.length;++a){var b=Ra[a];Ra.splice(a,1);--a;b.Bd.apply(null,b.td)}}var E=[];function Qa(a){var b=E[a];b.target.removeEventListener(b.Gc,b.od,b.Hc);E.splice(a,1)}
function F(a){function b(d){++Oa;Ta=a;Sa();a.Jc(d);Sa();--Oa}if(!a.target)return-4;if(a.Ic)a.od=b,a.target.addEventListener(a.Gc,b,a.Hc),E.push(a),Ua||(ya.push(Pa),Ua=!0);else for(var c=0;c<E.length;++c)E[c].target==a.target&&E[c].Gc==a.Gc&&Qa(c--);return 0}function Va(a){return a?a==window?"#window":a==screen?"#screen":a&&a.nodeName?a.nodeName:"":""}
var Ua,Ta,Wa,Xa,Ya,Za,$a,ab,bb,cb=[0,"undefined"!=typeof document?document:0,"undefined"!=typeof window?window:0],G=a=>{a=2<a?a?D(u,a):"":a;return cb[a]||("undefined"!=typeof document?document.querySelector(a):void 0)},db=a=>0>cb.indexOf(a)?a.getBoundingClientRect():{left:0,top:0},eb=[],fb,H=a=>{var b=eb[a];b||(a>=eb.length&&(eb.length=a+1),eb[a]=b=fb.get(a));return b},I=(a,b,c)=>{var d=u;if(!(0<c))return 0;var e=b;c=b+c-1;for(var h=0;h<a.length;++h){var f=a.charCodeAt(h);if(55296<=f&&57343>=f){var l=
a.charCodeAt(++h);f=65536+((f&1023)<<10)|l&1023}if(127>=f){if(b>=c)break;d[b++]=f}else{if(2047>=f){if(b+1>=c)break;d[b++]=192|f>>6}else{if(65535>=f){if(b+2>=c)break;d[b++]=224|f>>12}else{if(b+3>=c)break;d[b++]=240|f>>18;d[b++]=128|f>>12&63}d[b++]=128|f>>6&63}d[b++]=128|f&63}}d[b]=0;return b-e},gb=(a,b,c,d,e,h)=>{Wa||(Wa=J(256));a={target:G(a),Gc:h,Ic:d,Jc:(f=event)=>{var l=f.target.id?f.target.id:"",n=Wa;I(Va(f.target),n+0,128);I(l,n+128,128);H(d)(e,n,b)&&f.preventDefault()},Hc:c};return F(a)},hb=
(a,b,c,d,e,h)=>{Xa||(Xa=J(176));a={target:G(a),Pc:!0,Gc:h,Ic:d,Jc:f=>{var l=Xa;z[l>>3]=f.timeStamp;var n=l>>2;v[n+2]=f.location;v[n+3]=f.ctrlKey;v[n+4]=f.shiftKey;v[n+5]=f.altKey;v[n+6]=f.metaKey;v[n+7]=f.repeat;v[n+8]=f.charCode;v[n+9]=f.keyCode;v[n+10]=f.which;I(f.key||"",l+44,32);I(f.code||"",l+76,32);I(f.char||"",l+108,32);I(f.locale||"",l+140,32);H(d)(e,l,b)&&f.preventDefault()},Hc:c};return F(a)},ib=(a,b,c)=>{z[a>>3]=b.timeStamp;a>>=2;v[a+2]=b.screenX;v[a+3]=b.screenY;v[a+4]=b.clientX;v[a+5]=
b.clientY;v[a+6]=b.ctrlKey;v[a+7]=b.shiftKey;v[a+8]=b.altKey;v[a+9]=b.metaKey;sa[2*a+20]=b.button;sa[2*a+21]=b.buttons;v[a+11]=b.movementX;v[a+12]=b.movementY;c=db(c);v[a+13]=b.clientX-c.left;v[a+14]=b.clientY-c.top},K=(a,b,c,d,e,h)=>{Ya||(Ya=J(72));a=G(a);return F({target:a,Pc:"mousemove"!=h&&"mouseenter"!=h&&"mouseleave"!=h,Gc:h,Ic:d,Jc:(f=event)=>{ib(Ya,f,a);H(d)(e,Ya,b)&&f.preventDefault()},Hc:c})},jb=(a,b,c,d,e)=>{Za||(Za=J(260));return F({target:a,Gc:e,Ic:d,Jc:(h=event)=>{var f=Za,l=document.pointerLockElement||
document.Nc||document.Wc||document.Vc;v[f>>2]=!!l;var n=l&&l.id?l.id:"";I(Va(l),f+4,128);I(n,f+132,128);H(d)(20,f,b)&&h.preventDefault()},Hc:c})},kb=(a,b,c,d,e)=>F({target:a,Gc:e,Ic:d,Jc:(h=event)=>{H(d)(38,0,b)&&h.preventDefault()},Hc:c}),lb=(a,b,c,d)=>{$a||($a=J(36));a=G(a);return F({target:a,Gc:"resize",Ic:d,Jc:(e=event)=>{if(e.target==a){var h=document.body;if(h){var f=$a;v[f>>2]=e.detail;v[f+4>>2]=h.clientWidth;v[f+8>>2]=h.clientHeight;v[f+12>>2]=innerWidth;v[f+16>>2]=innerHeight;v[f+20>>2]=
outerWidth;v[f+24>>2]=outerHeight;v[f+28>>2]=pageXOffset;v[f+32>>2]=pageYOffset;H(d)(10,f,b)&&e.preventDefault()}}},Hc:c})},mb=(a,b,c,d,e,h)=>{ab||(ab=J(1696));a=G(a);return F({target:a,Pc:"touchstart"==h||"touchend"==h,Gc:h,Ic:d,Jc:f=>{for(var l,n={},p=f.touches,t=0;t<p.length;++t)l=p[t],l.$c=l.bd=0,n[l.identifier]=l;for(t=0;t<f.changedTouches.length;++t)l=f.changedTouches[t],l.$c=1,n[l.identifier]=l;for(t=0;t<f.targetTouches.length;++t)n[f.targetTouches[t].identifier].bd=1;p=ab;z[p>>3]=f.timeStamp;
var w=p>>2;v[w+3]=f.ctrlKey;v[w+4]=f.shiftKey;v[w+5]=f.altKey;v[w+6]=f.metaKey;w+=7;var qb=db(a),rb=0;for(t in n)if(l=n[t],v[w]=l.identifier,v[w+1]=l.screenX,v[w+2]=l.screenY,v[w+3]=l.clientX,v[w+4]=l.clientY,v[w+5]=l.pageX,v[w+6]=l.pageY,v[w+7]=l.$c,v[w+8]=l.bd,v[w+9]=l.clientX-qb.left,v[w+10]=l.clientY-qb.top,w+=13,31<++rb)break;v[p+8>>2]=rb;H(d)(e,p,b)&&f.preventDefault()},Hc:c})},nb=a=>{var b=a.getExtension("ANGLE_instanced_arrays");b&&(a.vertexAttribDivisor=(c,d)=>b.vertexAttribDivisorANGLE(c,
d),a.drawArraysInstanced=(c,d,e,h)=>b.drawArraysInstancedANGLE(c,d,e,h),a.drawElementsInstanced=(c,d,e,h,f)=>b.drawElementsInstancedANGLE(c,d,e,h,f))},ob=a=>{var b=a.getExtension("OES_vertex_array_object");b&&(a.createVertexArray=()=>b.createVertexArrayOES(),a.deleteVertexArray=c=>b.deleteVertexArrayOES(c),a.bindVertexArray=c=>b.bindVertexArrayOES(c),a.isVertexArray=c=>b.isVertexArrayOES(c))},pb=a=>{var b=a.getExtension("WEBGL_draw_buffers");b&&(a.drawBuffers=(c,d)=>b.drawBuffersWEBGL(c,d))},sb=a=>
{a.vd=a.getExtension("WEBGL_draw_instanced_base_vertex_base_instance")},tb=a=>{a.wd=a.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance")},ub=1,vb=[],L=[],wb=[],M=[],N=[],O=[],xb=[],yb=[],P=[],zb={},Ab=4;function Q(a){Bb||(Bb=a)}
for(var Cb=a=>{for(var b=ub++,c=a.length;c<b;c++)a[c]=null;return b},Eb=(a,b)=>{a.Nc||(a.Nc=a.getContext,a.getContext=function(d,e){e=a.Nc(d,e);return"webgl"==d==e instanceof WebGLRenderingContext?e:null});var c=1<b.ad?a.getContext("webgl2",b):a.getContext("webgl",b);return c?Db(c,b):0},Db=(a,b)=>{var c=Cb(yb),d={handle:c,attributes:b,version:b.ad,Tc:a};a.canvas&&(a.canvas.sd=d);yb[c]=d;("undefined"==typeof b.Zc||b.Zc)&&Fb(d);return c},Fb=a=>{a||(a=R);if(!a.qd){a.qd=!0;var b=a.Tc;nb(b);ob(b);pb(b);
sb(b);tb(b);2<=a.version&&(b.Yc=b.getExtension("EXT_disjoint_timer_query_webgl2"));if(2>a.version||!b.Yc)b.Yc=b.getExtension("EXT_disjoint_timer_query");b.rd=b.getExtension("WEBGL_multi_draw");(b.getSupportedExtensions()||[]).forEach(c=>{c.includes("lose_context")||c.includes("debug")||b.getExtension(c)})}},Bb,R,Gb=(a,b,c,d,e,h)=>{a={target:G(a),Gc:h,Ic:d,Jc:(f=event)=>{H(d)(e,0,b)&&f.preventDefault()},Hc:c};F(a)},Hb=(a,b,c,d)=>{bb||(bb=J(104));return F({target:a,Pc:!0,Gc:"wheel",Ic:d,Jc:(e=event)=>
{var h=bb;ib(h,e,a);z[h+72>>3]=e.deltaX;z[h+80>>3]=e.deltaY;z[h+88>>3]=e.deltaZ;v[h+96>>2]=e.deltaMode;H(d)(9,h,b)&&e.preventDefault()},Hc:c})},Ib=["default","low-power","high-performance"],Jb=[null,[],[]],Kb=[],T=(a,b,c,d)=>{for(var e=0;e<a;e++){var h=S[c](),f=h&&Cb(d);h?(h.name=f,d[f]=h):Q(1282);v[b+4*e>>2]=f}},Lb=(a,b)=>{if(b){var c=void 0;switch(a){case 36346:c=1;break;case 36344:return;case 34814:case 36345:c=0;break;case 34466:var d=S.getParameter(34467);c=d?d.length:0;break;case 33309:if(2>
R.version){Q(1282);return}c=2*(S.getSupportedExtensions()||[]).length;break;case 33307:case 33308:if(2>R.version){Q(1280);return}c=33307==a?3:0}if(void 0===c)switch(d=S.getParameter(a),typeof d){case "number":c=d;break;case "boolean":c=d?1:0;break;case "string":Q(1280);return;case "object":if(null===d)switch(a){case 34964:case 35725:case 34965:case 36006:case 36007:case 32873:case 34229:case 36662:case 36663:case 35053:case 35055:case 36010:case 35097:case 35869:case 32874:case 36389:case 35983:case 35368:case 34068:c=
0;break;default:Q(1280);return}else{if(d instanceof Float32Array||d instanceof Uint32Array||d instanceof Int32Array||d instanceof Array){for(a=0;a<d.length;++a)v[b+4*a>>2]=d[a];return}try{c=d.name|0}catch(e){Q(1280);q("GL_INVALID_ENUM in glGet0v: Unknown object returned from WebGL getParameter("+a+")! (error: "+e+")");return}}break;default:Q(1280);q("GL_INVALID_ENUM in glGet0v: Native code calling glGet0v("+a+") and it returns "+d+" of type "+typeof d+"!");return}v[b>>2]=c}else Q(1281)},Mb=a=>{for(var b=
0,c=0;c<a.length;++c){var d=a.charCodeAt(c);127>=d?b++:2047>=d?b+=2:55296<=d&&57343>=d?(b+=4,++c):b+=3}return b},Nb=a=>"]"==a.slice(-1)&&a.lastIndexOf("["),U=a=>{a-=5120;return 0==a?ra:1==a?u:2==a?sa:4==a?v:6==a?y:5==a||28922==a||28520==a||30779==a||30782==a?x:ta},Ob=(a,b,c,d,e)=>{a=U(a);var h=31-Math.clz32(a.BYTES_PER_ELEMENT),f=Ab;return a.subarray(e>>h,e+d*(c*({5:3,6:4,8:2,29502:3,29504:4,26917:2,26918:2,29846:3,29847:4}[b-6402]||1)*(1<<h)+f-1&-f)>>h)},V=a=>{var b=S.nd;if(b){var c=b.Oc[a];"number"==
typeof c&&(b.Oc[a]=c=S.getUniformLocation(b,b.ld[a]+(0<c?"["+c+"]":"")));return c}Q(1282)},W=[],X=[],Pb=a=>{if(!Ja){if(g.onExit)g.onExit(a);qa=!0}da(a,new ma(a))},Rb=a=>{var b=Mb(a)+1,c=Qb(b);I(a,c,b);return c},S,Y=0;32>Y;++Y)Kb.push(Array(Y));var Sb=new Float32Array(288);for(Y=0;288>Y;++Y)W[Y]=Sb.subarray(0,Y+1);var Tb=new Int32Array(288);for(Y=0;288>Y;++Y)X[Y]=Tb.subarray(0,Y+1);
var ic={oa:function(){return 0},nb:function(){return 0},ob:function(){},j:()=>{oa("")},ia:()=>"number"==typeof devicePixelRatio&&devicePixelRatio||1,ja:(a,b,c)=>{a=G(a);if(!a)return-4;a=db(a);z[b>>3]=a.width;z[c>>3]=a.height;return 0},B:()=>performance.now(),jb:(a,b,c)=>u.copyWithin(a,b,b+c),Ya:(a,b)=>{function c(d){H(a)(d,b)&&requestAnimationFrame(c)}return requestAnimationFrame(c)},ib:a=>{var b=u.length;a>>>=0;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);
var e=Math;d=Math.max(a,d);a:{e=(e.min.call(e,2147483648,d+(65536-d%65536)%65536)-pa.buffer.byteLength+65535)/65536;try{pa.grow(e);ua();var h=1;break a}catch(f){}h=void 0}if(h)return!0}return!1},S:(a,b,c,d)=>gb(a,b,c,d,12,"blur"),ha:(a,b,c)=>{a=G(a);if(!a)return-4;a.width=b;a.height=c;return 0},T:(a,b,c,d)=>gb(a,b,c,d,13,"focus"),aa:(a,b,c,d)=>hb(a,b,c,d,2,"keydown"),_:(a,b,c,d)=>hb(a,b,c,d,1,"keypress"),$:(a,b,c,d)=>hb(a,b,c,d,3,"keyup"),ga:(a,b,c,d)=>K(a,b,c,d,5,"mousedown"),da:(a,b,c,d)=>K(a,b,
c,d,33,"mouseenter"),ca:(a,b,c,d)=>K(a,b,c,d,34,"mouseleave"),ea:(a,b,c,d)=>K(a,b,c,d,8,"mousemove"),fa:(a,b,c,d)=>K(a,b,c,d,6,"mouseup"),V:(a,b,c,d)=>{if(!document||!document.body||!(document.body.requestPointerLock||document.body.Nc||document.body.Wc||document.body.Vc))return-1;a=G(a);if(!a)return-4;jb(a,b,c,d,"mozpointerlockchange");jb(a,b,c,d,"webkitpointerlockchange");jb(a,b,c,d,"mspointerlockchange");return jb(a,b,c,d,"pointerlockchange")},U:(a,b,c,d)=>{if(!document||!(document.body.requestPointerLock||
document.body.Nc||document.body.Wc||document.body.Vc))return-1;a=G(a);if(!a)return-4;kb(a,b,c,d,"mozpointerlockerror");kb(a,b,c,d,"webkitpointerlockerror");kb(a,b,c,d,"mspointerlockerror");return kb(a,b,c,d,"pointerlockerror")},Za:(a,b,c,d)=>lb(a,b,c,d),W:(a,b,c,d)=>mb(a,b,c,d,25,"touchcancel"),X:(a,b,c,d)=>mb(a,b,c,d,23,"touchend"),Y:(a,b,c,d)=>mb(a,b,c,d,24,"touchmove"),Z:(a,b,c,d)=>mb(a,b,c,d,22,"touchstart"),R:(a,b,c,d)=>{Gb(a,b,c,d,31,"webglcontextlost");return 0},Q:(a,b,c,d)=>{Gb(a,b,c,d,32,
"webglcontextrestored");return 0},ba:(a,b,c,d)=>(a=G(a))?"undefined"!=typeof a.onwheel?Hb(a,b,c,d):-1:-4,Wa:(a,b)=>{b>>=2;b={alpha:!!v[b],depth:!!v[b+1],stencil:!!v[b+2],antialias:!!v[b+3],premultipliedAlpha:!!v[b+4],preserveDrawingBuffer:!!v[b+5],powerPreference:Ib[v[b+6]],failIfMajorPerformanceCaveat:!!v[b+7],ad:v[b+8],xd:v[b+9],Zc:v[b+10],pd:v[b+11],yd:v[b+12],zd:v[b+13]};a=G(a);return!a||b.pd?0:Eb(a,b)},Ua:(a,b)=>{a=yb[a];b=b?D(u,b):"";b.startsWith("GL_")&&(b=b.substr(3));"ANGLE_instanced_arrays"==
b&&nb(S);"OES_vertex_array_object"==b&&ob(S);"WEBGL_draw_buffers"==b&&pb(S);"WEBGL_draw_instanced_base_vertex_base_instance"==b&&sb(S);"WEBGL_multi_draw_instanced_base_vertex_base_instance"==b&&tb(S);"WEBGL_multi_draw"==b&&(S.rd=S.getExtension("WEBGL_multi_draw"));return!!a.Tc.getExtension(b)},Xa:a=>{a>>=2;for(var b=0;14>b;++b)v[a+b]=0;v[a]=v[a+1]=v[a+3]=v[a+4]=v[a+8]=v[a+10]=1},Va:a=>{R=yb[a];g.ud=S=R&&R.Tc;return!a||S?0:-5},na:()=>52,mb:()=>52,hb:function(){return 70},lb:(a,b,c,d)=>{for(var e=0,
h=0;h<c;h++){var f=x[b>>2],l=x[b+4>>2];b+=8;for(var n=0;n<l;n++){var p=u[f+n],t=Jb[a];0===p||10===p?((1===a?na:q)(D(t,0)),t.length=0):t.push(p)}e+=l}x[d>>2]=e;return 0},h:function(a,b,c){const d=a?D(u,a):"";console.log("fs_js_load_snapshot: called with",d,b);let e;try{e=window.indexedDB.open("chips",1)}catch(h){console.log("fs_js_load_snapshot: failed to open IndexedDB with "+h)}e.onupgradeneeded=()=>{console.log("fs_js_load_snapshot: creating db");e.result.createObjectStore("store")};e.onsuccess=
()=>{var h=e.result;let f;try{f=h.transaction(["store"],"readwrite")}catch(p){console.log("fs_js_load_snapshot: db.transaction failed with",p);return}h=f.objectStore("store");let l=d+"_"+b,n=h.get(l);n.onsuccess=()=>{if(void 0!==n.result){let p=n.result.length;console.log("fs_js_load_snapshot:",l,"successfully loaded",p,"bytes");let t=Ub(p);u.set(n.result,t);Vb(c,t,p)}else console.log("fs_js_load_snapshot:",l,"does not exist"),Vb(c,0,0)};n.onerror=()=>{console.log("fs_js_load_snapshot: FAILED loading",
l)};f.onerror=()=>{console.log("fs_js_load_snapshot: transaction onerror")}};e.onerror=()=>{console.log("fs_js_load_snapshot: open_request onerror")}},eb:function(a,b,c,d){const e=a?D(u,a):"";console.log("fs_js_save_snapshot: called with",e,b);let h;try{h=window.indexedDB.open("chips",1)}catch(f){console.log("fs_js_save_snapshot: failed to open IndexedDB with "+f);return}h.onupgradeneeded=()=>{console.log("fs_js_save_snapshot: creating db");h.result.createObjectStore("store")};h.onsuccess=()=>{console.log("fs_js_save_snapshot: onsuccess");
let f=h.result.transaction(["store"],"readwrite");var l=f.objectStore("store");let n=e+"_"+b;l=l.put(u.subarray(c,c+d),n);l.onsuccess=()=>{console.log("fs_js_save_snapshot:",n,"successfully stored")};l.onerror=()=>{console.log("fs_js_save_snapshot: FAILED to store",n)};f.onerror=()=>{console.log("fs_js_save_snapshot: transaction onerror")}};h.onerror=()=>{console.log("fs_js_save_snapshot: open_request onerror")}},l:function(a){S.activeTexture(a)},za:(a,b)=>{S.attachShader(L[a],O[b])},a:(a,b)=>{35051==
a?S.Xc=b:35052==a&&(S.Lc=b);S.bindBuffer(a,vb[b])},i:(a,b)=>{S.bindFramebuffer(a,wb[b])},Ga:(a,b)=>{S.bindRenderbuffer(a,M[b])},m:(a,b)=>{S.bindSampler(a,P[b])},c:(a,b)=>{S.bindTexture(a,N[b])},M:a=>{S.bindVertexArray(xb[a])},I:function(a,b,c,d){S.blendColor(a,b,c,d)},J:function(a,b){S.blendEquationSeparate(a,b)},K:function(a,b,c,d){S.blendFuncSeparate(a,b,c,d)},sb:function(a,b,c,d,e,h,f,l,n,p){S.blitFramebuffer(a,b,c,d,e,h,f,l,n,p)},Ia:(a,b,c,d)=>{2<=R.version?c&&b?S.bufferData(a,u,d,c,b):S.bufferData(a,
b,d):S.bufferData(a,c?u.subarray(c,c+b):b,d)},r:(a,b,c,d)=>{2<=R.version?c&&S.bufferSubData(a,b,u,d,c):S.bufferSubData(a,b,u.subarray(d,d+c))},ta:function(a){return S.checkFramebufferStatus(a)},Nb:function(a,b,c,d){S.clearBufferfi(a,b,c,d)},ra:(a,b,c)=>{S.clearBufferfv(a,b,y,c>>2)},Mb:(a,b,c)=>{S.clearBufferiv(a,b,v,c>>2)},o:(a,b,c,d)=>{S.colorMask(!!a,!!b,!!c,!!d)},Sb:a=>{S.compileShader(O[a])},Ca:(a,b,c,d,e,h,f,l)=>{2<=R.version?S.Lc||!f?S.compressedTexImage2D(a,b,c,d,e,h,f,l):S.compressedTexImage2D(a,
b,c,d,e,h,u,l,f):S.compressedTexImage2D(a,b,c,d,e,h,l?u.subarray(l,l+f):null)},$b:(a,b,c,d,e,h,f,l,n)=>{S.Lc?S.compressedTexImage3D(a,b,c,d,e,h,f,l,n):S.compressedTexImage3D(a,b,c,d,e,h,f,u,n,l)},Yb:()=>{var a=Cb(L),b=S.createProgram();b.name=a;b.Sc=b.Qc=b.Rc=0;b.Uc=1;L[a]=b;return a},Ub:a=>{var b=Cb(O);O[b]=S.createShader(a);return b},F:function(a){S.cullFace(a)},Sa:(a,b)=>{for(var c=0;c<a;c++){var d=v[b+4*c>>2],e=vb[d];e&&(S.deleteBuffer(e),e.name=0,vb[d]=null,d==S.Xc&&(S.Xc=0),d==S.Lc&&(S.Lc=0))}},
e:(a,b)=>{for(var c=0;c<a;++c){var d=v[b+4*c>>2],e=wb[d];e&&(S.deleteFramebuffer(e),e.name=0,wb[d]=null)}},z:a=>{if(a){var b=L[a];b?(S.deleteProgram(b),b.name=0,L[a]=null):Q(1281)}},O:(a,b)=>{for(var c=0;c<a;c++){var d=v[b+4*c>>2],e=M[d];e&&(S.deleteRenderbuffer(e),e.name=0,M[d]=null)}},N:(a,b)=>{for(var c=0;c<a;c++){var d=v[b+4*c>>2],e=P[d];e&&(S.deleteSampler(e),e.name=0,P[d]=null)}},E:a=>{if(a){var b=O[a];b?(S.deleteShader(b),O[a]=null):Q(1281)}},P:(a,b)=>{for(var c=0;c<a;c++){var d=v[b+4*c>>2],
e=N[d];e&&(S.deleteTexture(e),e.name=0,N[d]=null)}},Qa:(a,b)=>{for(var c=0;c<a;c++){var d=v[b+4*c>>2];S.deleteVertexArray(xb[d]);xb[d]=null}},y:function(a){S.depthFunc(a)},x:a=>{S.depthMask(!!a)},d:function(a){S.disable(a)},L:a=>{S.disableVertexAttribArray(a)},vb:(a,b,c)=>{S.drawArrays(a,b,c)},wb:(a,b,c,d)=>{S.drawArraysInstanced(a,b,c,d)},sa:(a,b)=>{for(var c=Kb[a],d=0;d<a;d++)c[d]=v[b+4*d>>2];S.drawBuffers(c)},xb:(a,b,c,d)=>{S.drawElements(a,b,c,d)},yb:(a,b,c,d,e)=>{S.drawElementsInstanced(a,b,
c,d,e)},g:function(a){S.enable(a)},Jb:a=>{S.enableVertexAttribArray(a)},ua:(a,b,c,d)=>{S.framebufferRenderbuffer(a,b,c,M[d])},n:(a,b,c,d,e)=>{S.framebufferTexture2D(a,b,c,N[d],e)},D:(a,b,c,d,e)=>{S.framebufferTextureLayer(a,b,N[c],d,e)},G:function(a){S.frontFace(a)},Ja:(a,b)=>{T(a,b,"createBuffer",vb)},va:(a,b)=>{T(a,b,"createFramebuffer",wb)},Ha:(a,b)=>{T(a,b,"createRenderbuffer",M)},Zb:(a,b)=>{T(a,b,"createSampler",P)},Ea:(a,b)=>{T(a,b,"createTexture",N)},Pa:function(a,b){T(a,b,"createVertexArray",
xb)},Qb:(a,b)=>S.getAttribLocation(L[a],b?D(u,b):""),b:(a,b)=>{Lb(a,b)},Vb:(a,b,c,d)=>{a=S.getProgramInfoLog(L[a]);null===a&&(a="(unknown error)");b=0<b&&d?I(a,d,b):0;c&&(v[c>>2]=b)},ya:(a,b,c)=>{if(c)if(a>=ub)Q(1281);else if(a=L[a],35716==b)a=S.getProgramInfoLog(a),null===a&&(a="(unknown error)"),v[c>>2]=a.length+1;else if(35719==b){if(!a.Sc)for(b=0;b<S.getProgramParameter(a,35718);++b)a.Sc=Math.max(a.Sc,S.getActiveUniform(a,b).name.length+1);v[c>>2]=a.Sc}else if(35722==b){if(!a.Qc)for(b=0;b<S.getProgramParameter(a,
35721);++b)a.Qc=Math.max(a.Qc,S.getActiveAttrib(a,b).name.length+1);v[c>>2]=a.Qc}else if(35381==b){if(!a.Rc)for(b=0;b<S.getProgramParameter(a,35382);++b)a.Rc=Math.max(a.Rc,S.getActiveUniformBlockName(a,b).length+1);v[c>>2]=a.Rc}else v[c>>2]=S.getProgramParameter(a,b);else Q(1281)},Rb:(a,b,c,d)=>{a=S.getShaderInfoLog(O[a]);null===a&&(a="(unknown error)");b=0<b&&d?I(a,d,b):0;c&&(v[c>>2]=b)},wa:(a,b,c)=>{c?35716==b?(a=S.getShaderInfoLog(O[a]),null===a&&(a="(unknown error)"),v[c>>2]=a?a.length+1:0):35720==
b?(a=S.getShaderSource(O[a]),v[c>>2]=a?a.length+1:0):v[c>>2]=S.getShaderParameter(O[a],b):Q(1281)},Ta:(a,b)=>{if(2>R.version)return Q(1282),0;var c=zb[a];if(c)return 0>b||b>=c.length?(Q(1281),0):c[b];switch(a){case 7939:return c=S.getSupportedExtensions()||[],c=c.concat(c.map(function(d){return"GL_"+d})),c=c.map(function(d){var e=Mb(d)+1,h=J(e);h&&I(d,h,e);return h}),c=zb[a]=c,0>b||b>=c.length?(Q(1281),0):c[b];default:return Q(1280),0}},v:(a,b)=>{b=b?D(u,b):"";if(a=L[a]){var c=a,d=c.Oc,e=c.md,h;if(!d)for(c.Oc=
d={},c.ld={},h=0;h<S.getProgramParameter(c,35718);++h){var f=S.getActiveUniform(c,h);var l=f.name;f=f.size;var n=Nb(l);n=0<n?l.slice(0,n):l;var p=c.Uc;c.Uc+=f;e[n]=[f,p];for(l=0;l<f;++l)d[p]=l,c.ld[p++]=n}c=a.Oc;d=0;e=b;h=Nb(b);0<h&&(d=parseInt(b.slice(h+1))>>>0,e=b.slice(0,h));if((e=a.md[e])&&d<e[0]&&(d+=e[1],c[d]=c[d]||S.getUniformLocation(a,b)))return d}else Q(1281);return-1},rb:(a,b,c)=>{for(var d=Kb[b],e=0;e<b;e++)d[e]=v[c+4*e>>2];S.invalidateFramebuffer(a,d)},Xb:a=>{a=L[a];S.linkProgram(a);
a.Oc=0;a.md={}},Oa:(a,b)=>{3317==a&&(Ab=b);S.pixelStorei(a,b)},H:function(a,b){S.polygonOffset(a,b)},tb:function(a){S.readBuffer(a)},Fa:function(a,b,c,d,e){S.renderbufferStorageMultisample(a,b,c,d,e)},Aa:(a,b,c)=>{S.samplerParameterf(P[a],b,c)},f:(a,b,c)=>{S.samplerParameteri(P[a],b,c)},q:function(a,b,c,d){S.scissor(a,b,c,d)},Tb:(a,b,c,d)=>{for(var e="",h=0;h<b;++h){var f=d?v[d+4*h>>2]:-1,l=v[c+4*h>>2];f=l?D(u,l,0>f?void 0:f):"";e+=f}S.shaderSource(O[a],e)},Ma:function(a,b,c){S.stencilFunc(a,b,c)},
qa:function(a,b,c,d){S.stencilFuncSeparate(a,b,c,d)},w:function(a){S.stencilMask(a)},La:function(a,b,c){S.stencilOp(a,b,c)},pa:function(a,b,c,d){S.stencilOpSeparate(a,b,c,d)},ac:(a,b,c,d,e,h,f,l,n)=>{if(2<=R.version)if(S.Lc)S.texImage2D(a,b,c,d,e,h,f,l,n);else if(n){var p=U(l);S.texImage2D(a,b,c,d,e,h,f,l,p,n>>31-Math.clz32(p.BYTES_PER_ELEMENT))}else S.texImage2D(a,b,c,d,e,h,f,l,null);else S.texImage2D(a,b,c,d,e,h,f,l,n?Ob(l,f,d,e,n):null)},_b:(a,b,c,d,e,h,f,l,n,p)=>{if(S.Lc)S.texImage3D(a,b,c,d,
e,h,f,l,n,p);else if(p){var t=U(n);S.texImage3D(a,b,c,d,e,h,f,l,n,t,p>>31-Math.clz32(t.BYTES_PER_ELEMENT))}else S.texImage3D(a,b,c,d,e,h,f,l,n,null)},Da:function(a,b,c){S.texParameteri(a,b,c)},qb:(a,b,c,d,e,h,f,l,n)=>{if(2<=R.version)if(S.Lc)S.texSubImage2D(a,b,c,d,e,h,f,l,n);else if(n){var p=U(l);S.texSubImage2D(a,b,c,d,e,h,f,l,p,n>>31-Math.clz32(p.BYTES_PER_ELEMENT))}else S.texSubImage2D(a,b,c,d,e,h,f,l,null);else p=null,n&&(p=Ob(l,f,e,h,n)),S.texSubImage2D(a,b,c,d,e,h,f,l,p)},pb:(a,b,c,d,e,h,f,
l,n,p,t)=>{if(S.Lc)S.texSubImage3D(a,b,c,d,e,h,f,l,n,p,t);else if(t){var w=U(p);S.texSubImage3D(a,b,c,d,e,h,f,l,n,p,w,t>>31-Math.clz32(w.BYTES_PER_ELEMENT))}else S.texSubImage3D(a,b,c,d,e,h,f,l,n,p,null)},Ib:(a,b,c)=>{if(2<=R.version)b&&S.uniform1fv(V(a),y,c>>2,b);else{if(288>=b)for(var d=W[b-1],e=0;e<b;++e)d[e]=y[c+4*e>>2];else d=y.subarray(c>>2,c+4*b>>2);S.uniform1fv(V(a),d)}},xa:(a,b)=>{S.uniform1i(V(a),b)},Db:(a,b,c)=>{if(2<=R.version)b&&S.uniform1iv(V(a),v,c>>2,b);else{if(288>=b)for(var d=X[b-
1],e=0;e<b;++e)d[e]=v[c+4*e>>2];else d=v.subarray(c>>2,c+4*b>>2);S.uniform1iv(V(a),d)}},Hb:(a,b,c)=>{if(2<=R.version)b&&S.uniform2fv(V(a),y,c>>2,2*b);else{if(144>=b)for(var d=W[2*b-1],e=0;e<2*b;e+=2)d[e]=y[c+4*e>>2],d[e+1]=y[c+(4*e+4)>>2];else d=y.subarray(c>>2,c+8*b>>2);S.uniform2fv(V(a),d)}},Cb:(a,b,c)=>{if(2<=R.version)b&&S.uniform2iv(V(a),v,c>>2,2*b);else{if(144>=b)for(var d=X[2*b-1],e=0;e<2*b;e+=2)d[e]=v[c+4*e>>2],d[e+1]=v[c+(4*e+4)>>2];else d=v.subarray(c>>2,c+8*b>>2);S.uniform2iv(V(a),d)}},
Gb:(a,b,c)=>{if(2<=R.version)b&&S.uniform3fv(V(a),y,c>>2,3*b);else{if(96>=b)for(var d=W[3*b-1],e=0;e<3*b;e+=3)d[e]=y[c+4*e>>2],d[e+1]=y[c+(4*e+4)>>2],d[e+2]=y[c+(4*e+8)>>2];else d=y.subarray(c>>2,c+12*b>>2);S.uniform3fv(V(a),d)}},Bb:(a,b,c)=>{if(2<=R.version)b&&S.uniform3iv(V(a),v,c>>2,3*b);else{if(96>=b)for(var d=X[3*b-1],e=0;e<3*b;e+=3)d[e]=v[c+4*e>>2],d[e+1]=v[c+(4*e+4)>>2],d[e+2]=v[c+(4*e+8)>>2];else d=v.subarray(c>>2,c+12*b>>2);S.uniform3iv(V(a),d)}},Eb:(a,b,c)=>{if(2<=R.version)b&&S.uniform4fv(V(a),
y,c>>2,4*b);else{if(72>=b){var d=W[4*b-1],e=y;c>>=2;for(var h=0;h<4*b;h+=4){var f=c+h;d[h]=e[f];d[h+1]=e[f+1];d[h+2]=e[f+2];d[h+3]=e[f+3]}}else d=y.subarray(c>>2,c+16*b>>2);S.uniform4fv(V(a),d)}},Ab:(a,b,c)=>{if(2<=R.version)b&&S.uniform4iv(V(a),v,c>>2,4*b);else{if(72>=b)for(var d=X[4*b-1],e=0;e<4*b;e+=4)d[e]=v[c+4*e>>2],d[e+1]=v[c+(4*e+4)>>2],d[e+2]=v[c+(4*e+8)>>2],d[e+3]=v[c+(4*e+12)>>2];else d=v.subarray(c>>2,c+16*b>>2);S.uniform4iv(V(a),d)}},zb:(a,b,c,d)=>{if(2<=R.version)b&&S.uniformMatrix4fv(V(a),
!!c,y,d>>2,16*b);else{if(18>=b){var e=W[16*b-1],h=y;d>>=2;for(var f=0;f<16*b;f+=16){var l=d+f;e[f]=h[l];e[f+1]=h[l+1];e[f+2]=h[l+2];e[f+3]=h[l+3];e[f+4]=h[l+4];e[f+5]=h[l+5];e[f+6]=h[l+6];e[f+7]=h[l+7];e[f+8]=h[l+8];e[f+9]=h[l+9];e[f+10]=h[l+10];e[f+11]=h[l+11];e[f+12]=h[l+12];e[f+13]=h[l+13];e[f+14]=h[l+14];e[f+15]=h[l+15]}}else e=y.subarray(d>>2,d+64*b>>2);S.uniformMatrix4fv(V(a),!!c,e)}},p:a=>{a=L[a];S.useProgram(a);S.nd=a},Kb:(a,b)=>{S.vertexAttribDivisor(a,b)},Lb:(a,b,c,d,e,h)=>{S.vertexAttribPointer(a,
b,c,!!d,e,h)},k:function(a,b,c,d){S.viewport(a,b,c,d)},Ra:function(){g.cd=a=>{0!=Wb()&&(a.preventDefault(),a.returnValue=" ")};window.addEventListener("beforeunload",g.cd)},Ka:function(){g.kd=a=>{const b=a.clipboardData.getData("text");Na(()=>{const c=Rb(b);Xb(c)})};window.addEventListener("paste",g.kd)},Pb:function(a){g.Ad=[];a=a?D(u,a):"";a=document.getElementById(a);g.dd=b=>{b.stopPropagation();b.preventDefault()};g.ed=b=>{b.stopPropagation();b.preventDefault()};g.gd=b=>{b.stopPropagation();b.preventDefault()};
g.hd=b=>{b.stopPropagation();b.preventDefault();const c=b.dataTransfer.files;g.jd=c;Yb(c.length);for(let e=0;e<c.length;e++)Na(()=>{const h=Rb(c[e].name);Zb(e,h)});let d=0;b.shiftKey&&(d|=1);b.ctrlKey&&(d|=2);b.altKey&&(d|=4);b.metaKey&&(d|=8);$b(b.clientX,b.clientY,d)};a.addEventListener("dragenter",g.dd,!1);a.addEventListener("dragleave",g.ed,!1);a.addEventListener("dragover",g.gd,!1);a.addEventListener("drop",g.hd,!1)},fb:function(){const a=document.getElementById("sokol-app-favicon");a&&document.head.removeChild(a)},
u:function(){const a=document.createElement("input");a.type="text";a.id="_sokol_app_input_element";a.autocapitalize="none";a.addEventListener("focusout",function(){ac()});document.body.append(a)},Ob:function(a){const b=g.jd;return 0>a||a>=b.length?0:b[a].size},Fb:function(a,b,c,d,e){const h=new FileReader;h.onload=f=>{f=f.target.result;f.byteLength>d?bc(a,0,1,b,0,c,d,e):(u.set(new Uint8Array(f),c),bc(a,1,0,b,f.byteLength,c,d,e))};h.onerror=()=>{bc(a,0,2,b,0,c,d,e)};h.readAsArrayBuffer(g.jd[a])},t:function(){document.getElementById("_sokol_app_input_element").focus()},
kb:function(a){a=a?D(u,a):"";g.Mc=document.getElementById(a);g.Mc||console.log("sokol_app.h: invalid target:"+a);g.Mc.requestPointerLock||console.log("sokol_app.h: target doesn't support requestPointerLock:"+a)},Na:function(){window.removeEventListener("beforeunload",g.cd)},bc:function(){window.removeEventListener("paste",g.kd)},ub:function(a){a=a?D(u,a):"";a=document.getElementById(a);a.removeEventListener("dragenter",g.dd);a.removeEventListener("dragleave",g.ed);a.removeEventListener("dragover",
g.gd);a.removeEventListener("drop",g.hd)},C:function(){g.Mc&&g.Mc.requestPointerLock&&g.Mc.requestPointerLock()},gb:function(a,b){if(g.Mc){if(0===b)a="none";else switch(a){case 0:a="auto";break;case 1:a="default";break;case 2:a="text";break;case 3:a="crosshair";break;case 4:a="pointer";break;case 5:a="ew-resize";break;case 6:a="ns-resize";break;case 7:a="nwse-resize";break;case 8:a="nesw-resize";break;case 9:a="all-scroll";break;case 10:a="not-allowed";break;default:a="auto"}g.Mc.style.cursor=a}},
db:function(a,b,c){const d=document.createElement("canvas");d.width=a;d.height=b;const e=d.getContext("2d"),h=e.createImageData(a,b);h.data.set(u.subarray(c,c+a*b*4));e.putImageData(h,0,0);a=document.createElement("link");a.id="sokol-app-favicon";a.rel="shortcut icon";a.href=d.toDataURL();document.head.appendChild(a)},s:function(){document.getElementById("_sokol_app_input_element").blur()},Wb:function(a){a=a?D(u,a):"";const b=document.createElement("textarea");b.setAttribute("autocomplete","off");
b.setAttribute("autocorrect","off");b.setAttribute("autocapitalize","off");b.setAttribute("spellcheck","false");b.style.left="-100px";b.style.top="-100px";b.style.height=1;b.style.width=1;b.value=a;document.body.appendChild(b);b.select();document.execCommand("copy");document.body.removeChild(b)},_a:function(){const a=(new URLSearchParams(window.location.search)).entries();for(let b=a.next();!b.done;b=a.next()){const c=b.value[0],d=b.value[1];Na(()=>{const e=Rb(c),h=Rb(d);cc(e,h)})}},ab:function(){return g.Kc?
g.Kc.bufferSize:0},cb:function(a,b,c){g.Fc=null;g.Kc=null;"undefined"!==typeof AudioContext?g.Fc=new AudioContext({sampleRate:a,latencyHint:"interactive"}):(g.Fc=null,console.log("sokol_audio.h: no WebAudio support"));return g.Fc?(console.log("sokol_audio.h: sample rate ",g.Fc.sampleRate),g.Kc=g.Fc.createScriptProcessor(c,0,b),g.Kc.onaudioprocess=d=>{const e=d.outputBuffer.length,h=dc(e);if(h){const f=d.outputBuffer.numberOfChannels;for(let l=0;l<f;l++){const n=d.outputBuffer.getChannelData(l);for(let p=
0;p<e;p++)n[p]=y[(h>>2)+(f*p+l)]}}},g.Kc.connect(g.Fc.destination),a=()=>{g.Fc&&"suspended"===g.Fc.state&&g.Fc.resume()},document.addEventListener("click",a,{once:!0}),document.addEventListener("touchend",a,{once:!0}),document.addEventListener("keydown",a,{once:!0}),1):0},bb:function(){return g.Fc?g.Fc.sampleRate:0},ma:function(){const a=g.Fc;null!==a&&(g.Kc&&g.Kc.disconnect(),a.close(),g.Fc=null,g.Kc=null)},$a:function(){if(g.Fc)return"suspended"===g.Fc.state?1:0},A:function(a,b,c,d,e,h){b=b?D(u,
b):"";const f=new XMLHttpRequest;f.open("GET",b);f.responseType="arraybuffer";const l=0<d;l&&f.setRequestHeader("Range","bytes="+c+"-"+(c+d-1));f.onreadystatechange=function(){if(f.readyState==XMLHttpRequest.DONE)if(206==f.status||200==f.status&&!l){const n=new Uint8Array(f.response),p=n.length;p<=h?(u.set(n,e),ec(a,d,p)):fc(a)}else gc(a,f.status)};f.send()},la:function(a,b){b=b?D(u,b):"";const c=new XMLHttpRequest;c.open("HEAD",b);c.onreadystatechange=function(){if(c.readyState==XMLHttpRequest.DONE)if(200==
c.status){const d=c.getResponseHeader("Content-Length");hc(a,d)}else gc(a,c.status)};c.send()},Ba:function(){return navigator.userAgent.includes("Macintosh")?1:0},ka:function(a,b){b=b?D(u,b):"";switch(a){case 0:console.error(b);break;case 1:console.error(b);break;case 2:console.warn(b);break;default:console.info(b)}}},Z=function(){function a(c){Z=c.exports;pa=Z.cc;ua();fb=Z.Bc;wa.unshift(Z.dc);A--;g.monitorRunDependencies&&g.monitorRunDependencies(A);0==A&&(null!==Ba&&(clearInterval(Ba),Ba=null),
B&&(c=B,B=null,c()));return Z}var b={a:ic};A++;g.monitorRunDependencies&&g.monitorRunDependencies(A);if(g.instantiateWasm)try{return g.instantiateWasm(b,a)}catch(c){return q(`Module.instantiateWasm callback failed with error: ${c}`),!1}Ha(b,function(c){a(c.instance)});return{}}(),J=a=>(J=Z.ec)(a),Ub=g._fs_emsc_alloc=a=>(Ub=g._fs_emsc_alloc=Z.fc)(a),Vb=g._fs_emsc_load_snapshot_callback=(a,b,c)=>(Vb=g._fs_emsc_load_snapshot_callback=Z.gc)(a,b,c);g._webapi_alloc=a=>(g._webapi_alloc=Z.hc)(a);
g._webapi_free=a=>(g._webapi_free=Z.ic)(a);g._webapi_boot=()=>(g._webapi_boot=Z.jc)();g._webapi_reset=()=>(g._webapi_reset=Z.kc)();g._webapi_quickload=(a,b,c,d)=>(g._webapi_quickload=Z.lc)(a,b,c,d);g._webapi_disable_speaker_icon=()=>(g._webapi_disable_speaker_icon=Z.mc)();
var ac=g.__sapp_emsc_notify_keyboard_hidden=()=>(ac=g.__sapp_emsc_notify_keyboard_hidden=Z.nc)(),Xb=g.__sapp_emsc_onpaste=a=>(Xb=g.__sapp_emsc_onpaste=Z.oc)(a),Wb=g.__sapp_html5_get_ask_leave_site=()=>(Wb=g.__sapp_html5_get_ask_leave_site=Z.pc)(),Yb=g.__sapp_emsc_begin_drop=a=>(Yb=g.__sapp_emsc_begin_drop=Z.qc)(a),Zb=g.__sapp_emsc_drop=(a,b)=>(Zb=g.__sapp_emsc_drop=Z.rc)(a,b),$b=g.__sapp_emsc_end_drop=(a,b,c)=>($b=g.__sapp_emsc_end_drop=Z.sc)(a,b,c),bc=g.__sapp_emsc_invoke_fetch_cb=(a,b,c,d,e,h,f,
l)=>(bc=g.__sapp_emsc_invoke_fetch_cb=Z.tc)(a,b,c,d,e,h,f,l),jc=g._main=(a,b)=>(jc=g._main=Z.uc)(a,b),dc=g.__saudio_emsc_pull=a=>(dc=g.__saudio_emsc_pull=Z.vc)(a),cc=g.__sargs_add_kvp=(a,b)=>(cc=g.__sargs_add_kvp=Z.wc)(a,b),hc=g.__sfetch_emsc_head_response=(a,b)=>(hc=g.__sfetch_emsc_head_response=Z.xc)(a,b),ec=g.__sfetch_emsc_get_response=(a,b,c)=>(ec=g.__sfetch_emsc_get_response=Z.yc)(a,b,c),gc=g.__sfetch_emsc_failed_http_status=(a,b)=>(gc=g.__sfetch_emsc_failed_http_status=Z.zc)(a,b),fc=g.__sfetch_emsc_failed_buffer_too_small=
a=>(fc=g.__sfetch_emsc_failed_buffer_too_small=Z.Ac)(a),La=()=>(La=Z.Cc)(),Ma=a=>(Ma=Z.Dc)(a),Qb=a=>(Qb=Z.Ec)(a);g.___start_em_js=64036;g.___stop_em_js=77180;var kc;B=function lc(){kc||mc();kc||(B=lc)};function nc(a=[]){var b=jc;a.unshift(ca);var c=a.length,d=Qb(4*(c+1)),e=d;a.forEach(f=>{x[e>>2]=Rb(f);e+=4});x[e>>2]=0;try{var h=b(c,d);Pb(h)}catch(f){f instanceof ma||"unwind"==f||da(1,f)}}
function mc(){var a=ba;function b(){if(!kc&&(kc=!0,g.calledRun=!0,!qa)){Ia(wa);Ia(xa);if(g.onRuntimeInitialized)g.onRuntimeInitialized();oc&&nc(a);if(g.postRun)for("function"==typeof g.postRun&&(g.postRun=[g.postRun]);g.postRun.length;){var c=g.postRun.shift();za.unshift(c)}Ia(za)}}if(!(0<A)){if(g.preRun)for("function"==typeof g.preRun&&(g.preRun=[g.preRun]);g.preRun.length;)Aa();Ia(va);0<A||(g.setStatus?(g.setStatus("Running..."),setTimeout(function(){setTimeout(function(){g.setStatus("")},1);b()},
1)):b())}}if(g.preInit)for("function"==typeof g.preInit&&(g.preInit=[g.preInit]);0<g.preInit.length;)g.preInit.pop()();var oc=!0;g.noInitialRun&&(oc=!1);mc();
