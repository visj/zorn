var h;function k(a){var b=l,c=m,d=n;if(0===a.length)var e=b;else{e=new p;null!==b&&b.H(e);var f=function(){e.M()}}n=null;l=m=e;try{a(f)}finally{l=b,m=c,n=d}}function q(a){a=new r(a);var b=m,c=n;null!==b&&b.H(a);m=n=a;if(0===t){u();t=1;try{a.j=a.I(a.j,a.J),(0<v.h||0<w.h)&&x()}finally{t=0,m=n=null}}else a.j=a.I(a.j,a.J);m=b;n=c}function y(){this.j=[];this.h=this.l=0}function z(a){for(;a.l<a.h;a.l++){var b=a.j[a.l];b.g&2&&b.G();b.g&=-3099;a.j[a.l]=null}a.h=a.l=0}
var A={},B=1,t=0,w=new y,v=new y,D=new y,E=new y,l=null,m=null,n=null;function u(){w.h=v.h=D.h=E.h=0}function F(a){var b=n,c=-1,d=null===b.u?-1:null===b.o?0:b.o.length;null===a.s?(a.s=b,a.F=d,a.g|=64):(null===a.l?(c=0,a.l=[b],a.v=[d]):(c=a.l.length,a.l[c]=b,a.v[c]=d),a.g|=128);null===b.u?(b.u=a,b.K=c,b.g|=256):(null===b.o?(b.o=[a],b.B=[c]):(b.o[d]=a,b.B[d]=c),b.g|=512)}
function x(){for(var a=0;0!==v.h||0!==w.h||0!==D.h||0!==E.h;){B++;if(0!==w.h){t=2;for(var b=w;b.l<b.h;b.l++)b.j[b.l].A(),b.j[b.l]=null;b.h=b.l=0}0!==v.h&&(t=3,z(v));0!==D.h&&(t=4,z(D));0!==E.h&&(t=5,z(E));if(1E5<a++)throw Error("cycle detected");}}function G(){0===(this.g&5)&&(0===t?this.A():w.j[w.h++]=this)}function H(a){var b=0,c,d=a.g;if(d&32){var e=a.h;for(c=e.length;b<c;b++)e[b].A();a.h=null}if(d&16384){d=a.C;b=0;for(c=d.length;b<c;b++)d[b](!0);a.C=null}}
function I(a){this.g|=32;null===this.h?this.h=[a]:this.h[this.h.length]=a}function p(){this.g=0;this.h=[];this.C=null}p.prototype.M=G;p.prototype.A=function(){H(this);this.g=4};p.prototype.H=I;function J(a){var b=a.g;b&64&&(K(a.s,a.F),a.s=null);if(b&128)for(b=a.l.length;0<b--;)K(a.l[b],a.v[b]);a.D=a.l=a.v=null}function L(a,b){if(4!==a.g)if(-1===b)a.s=null,a.g&=-65;else{var c=a.l,d=a.v,e=c.pop(),f=d.pop(),g=c.length;b!==g&&(c[b]=e,d[b]=f,-1===f?e.K=b:e.B[f]=b);0===g&&(a.g&=-129)}}
function K(a,b){if(4!==a.g)if(-1===b)a.u=null,a.g&=-257;else{var c=a.o,d=a.B,e=c.pop(),f=d.pop(),g=c.length;b!==g&&(c[b]=e,d[b]=f,-1===f?e.F=b:e.v[f]=b);0===g&&(a.g&=-513)}}function M(a,b){var c=a.g,d=a.s;c&64&&(d.m<b&&(d.m=b,d.g&=-3099),0===(d.g&3)&&N(d));if(c&128){a=a.l;c=a.length;for(var e=0;e<c;e++)d=a[e],d.m<b&&(d.m=b,d.g&=-3099),0===(d.g&3)&&N(d)}}
function O(a){var b=B,c=a.g,d=a.s;c&64&&(d.m<b&&(d.m=b,d.g&=-3099),0===(d.g&11)&&P(d));if(c&128){a=a.l;c=a.length;for(var e=0;e<c;e++)d=a[e],d.m<b&&(d.m=b,d.g&=-3099),0===(d.g&11)&&P(d)}}function Q(a){for(var b=B,c=a.h,d=0,e=c.length;d<e;d++){var f=c[d];f.m<b&&(f.m=b,f.g&=-3099);0!==(f.g&192)&&0!==(f.g&768)&&0===(f.g&21)&&(f.L=a,f.g|=16,32===(f.g&40)&&Q(f))}}function R(a){for(var b=a.length,c=0;c<b;c++){var d=a[c];0===(d.g&5)&&d.N()}}
function S(a){this.g=0;this.j=a;this.D=void 0;this.s=null;this.F=-1;this.v=this.l=null;this.h=A;null!==m&&m.H(this)}h=S.prototype;h.M=G;h.i=function(){null!==n&&0===(this.g&5)&&F(this);return this.j};h.update=function(a){var b=this.g;if(0===(b&5)&&(0!==(b&4096)||(0===(b&8192)?a!==this.j:!this.D(a,this.j))))if(0===t){u();this.j=a;M(this,B+1);a=m;b=n;try{x()}finally{t=0,m=a,n=b}}else{if(this.h!==A&&a!==this.h)throw Error("conflicting values");this.h=a;this.g|=2;v.j[v.h++]=this}};
h.A=function(){J(this);this.j=this.h=null;this.g=4};h.G=function(){this.j=this.h;this.h=A;M(this,B)};h.N=function(){this.g=1};function aa(a){var b=a.g;b&256&&(L(a.u,a.K),a.u=null);if(b&512)for(b=a.o.length;0<b--;)L(a.o.pop(),a.B.pop());a.g&=-769}function r(a){this.g=0;this.D=this.j=void 0;this.s=null;this.F=-1;this.v=this.l=null;this.I=a;this.L=this.C=this.h=null;this.m=0;this.u=null;this.K=0;this.B=this.o=null;this.J=void 0}h=r.prototype;h.M=G;h.H=I;
h.i=function(){var a=this.g;if(0===(a&5)){var b=B,c=t;0!==c&&this.m===b&&(a&2?a&16?T(this,b):a&2&&this.G():4===c&&a&24&&T(this,b));null!==n&&0===(this.g&5)&&F(this)}return this.j};h.A=function(){H(this);J(this);aa(this);this.j=this.I=this.J=this.o=this.B=null;this.g=4};
h.G=function(){var a=0,b,c=m,d=n;m=n=null;var e=this.g;if(e&32){var f=this.h;for(b=f.length;a<b;a++)f[a].A();f.length=0;this.g&=-33}if(e&16384){f=this.C;b=f.length;for(a=0;a<b;a++)f[a](!1);f.length=0;this.g&=-16385}m=this;e&32768&&(aa(this),n=this);a=this.j;this.g|=1024;this.j=this.I(a,this.J);0===(e&192)||0!==(e&4096)||(0===(e&8192)?a===this.j:this.D(a,this.j))||M(this,B);m=c;n=d};h.N=function(){var a=this.g;this.g=(a|1)&-3;32===(a&34)&&R(this.h)};
function P(a){var b=a.g;a.g|=8;32===(b&48)&&Q(a);0!==(b&192)&&O(a)}function N(a){var b=a.g;a.g|=2;b&32&&R(a.h);0!==(b&192)&&0===(b&4096)?(D.j[D.h++]=a,0===(b&8)&&O(a)):(E.j[E.h++]=a,0!==(b&192)&&M(a,B))}
function T(a,b){if(0!==(a.g&2048))throw Error("cyclic dependency");a.g|=2048;0!==(a.g&16)&&(T(a.L,b),a.L=null);a:if(8===(a.g&13)){if(a.g&256){var c=a.u;if(c.m===b&&c.g&8&&(T(a.u,b),0!==(a.g&3)))break a}if(a.g&512)for(var d=a.o,e=d.length,f=0;f<e;f++)if(c=d[f],c.m===b&&c.g&8&&(T(c,b),0!==(a.g&3)))break a}a.g&=-2073;if(0!==(a.g&2)){if(0!==(a.g&1024))throw Error("cyclic dependency");a.G()}};var U=[],V;V=0+W(X,1E6,1E6);V+=W(ba,1E6,0);V+=W(ca,1E6,1E6);V+=W(da,5E5,1E6);V+=W(ea,25E4,1E6);V+=W(fa,1E3,1E6);V+=W(ha,1E6,5E5);V+=W(ia,1E6,25E4);V+=W(ja,1E6,125E3);V+=W(ka,1E6,1E3);U.push("---");var Y;Y=0+W(la,4E6,1);Y+=W(ma,2E6,2);Y+=W(na,1E6,4);Y+=W(oa,1E4,1E3);Y+=W(pa,4E6,1);Y+=W(qa,4E6,1);Y+=W(ra,4E6,1);U.push("---");U.push(`create total: ${V.toFixed(0)}`);U.push(`update total: ${Y.toFixed(0)}`);U.push(`total: ${(V+Y).toFixed(0)}`);console.log(U.join("\n"));
function W(a,b,c){b=sa(a,b,c);U.push(`${a.name.padEnd(30)} ${b.toFixed(1).padStart(5)} ${(0).toFixed(0).padStart(10)}`);return b}function sa(a,b,c){var d,e;k(function(f){var g=X(c,[]);a(b/100,g);g=X(c,[]);a(b/100,g);g=X(c,[]);a(b/100,g);g=X(c,[]);for(var C=0;C<c;C++)g[C].i(),g[C].i(),g[C].i();f()});k(function(f){var g=X(c,[]);d=performance.now();a(b,g);e=performance.now();f()});return e-d}function X(a,b){for(var c=0;c<a;c++){var d=c;var e=new S(c);b[d]=e}return b}
function ba(a){for(var b=0;b<a;b++)ta(b)}function ka(a,b){for(var c=0;c<a/1E3;c++)for(var d=0;1E3>d;d++)Z(b[c])}function ja(a,b){for(var c=0;c<a/8;c++)Z(b[c]),Z(b[c]),Z(b[c]),Z(b[c]),Z(b[c]),Z(b[c]),Z(b[c]),Z(b[c])}function ia(a,b){for(var c=0;c<a/4;c++)Z(b[c]),Z(b[c]),Z(b[c]),Z(b[c])}function ha(a,b){for(var c=0;c<a/2;c++)Z(b[c]),Z(b[c])}function ca(a,b){for(var c=0;c<a;c++)Z(b[c])}function da(a,b){for(var c=0;c<a;c++)ua(b[2*c],b[2*c+1])}
function ea(a,b){for(var c=0;c<a;c++)va(b[4*c],b[4*c+1],b[4*c+2],b[4*c+3])}function fa(a,b){for(var c=0;c<a;c++)wa(b,1E3*c)}function ta(a){q(function(){return a})}function Z(a){q(function(){return a.i()})}function ua(a,b){q(function(){return a.i()+b.i()})}function va(a,b,c,d){q(function(){return a.i()+b.i()+c.i()+d.i()})}function wa(a,b){q(function(){for(var c=0,d=0;1E3>d;d++)c+=a[b+d].i();return c})}function la(a,b){var c=b[0];q(function(){return c.i()});for(b=0;b<a;b++)c.update(b)}
function ma(a,b){var c=b[0],d=b[1];q(function(){return c.i()+d.i()});for(b=0;b<a;b++)c.update(b)}function na(a,b){var c=b[0],d=b[1],e=b[2],f=b[3];q(function(){return c.i()+d.i()+e.i()+f.i()});for(b=0;b<a;b++)c.update(b)}function oa(a,b){var c=b[0];q(function(){for(var e=0,f=0;1E3>f;f++)e+=b[f].i();return e});for(var d=0;d<a;d++)c.update(d)}function pa(a,b){var c=b[0];q(function(){return c.i()});q(function(){return c.i()});for(b=0;b<a/2;b++)c.update(b)}
function qa(a,b){var c=b[0];q(function(){return c.i()});q(function(){return c.i()});q(function(){return c.i()});q(function(){return c.i()});for(b=0;b<a/4;b++)c.update(b)}function ra(a,b){var c=b[0];for(b=0;1E3>b;b++)q(function(){return c.i()});for(b=0;b<a/1E3;b++)c.update(b)};