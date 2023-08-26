/**
 * @version 9.1.7
 *
 * @license
 * Copyright (C) Alexander Elias
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @module
 */

var Oe=Object.defineProperty;var Se=(e,n,t)=>n in e?Oe(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var A=(e,n,t)=>(Se(e,typeof n!="symbol"?n+"":n,t),t),re=(e,n,t)=>{if(!n.has(e))throw TypeError("Cannot "+t)};var h=(e,n,t)=>(re(e,n,"read from private field"),t?t.call(e):n.get(e)),w=(e,n,t)=>{if(n.has(e))throw TypeError("Cannot add the same private member more than once");n instanceof WeakSet?n.add(e):n.set(e,t)},m=(e,n,t,o)=>(re(e,n,"write to private field"),o?o.call(e,t):n.set(e,t),t);var b=(e,n,t)=>new Promise((o,s)=>{var i=c=>{try{d(t.next(c))}catch(f){s(f)}},l=c=>{try{d(t.throw(c))}catch(f){s(f)}},d=c=>c.done?o(c.value):Promise.resolve(c.value).then(i,l);d((t=t.apply(e,n)).next())});var ke=["src","href","data","action","srcdoc","xlink:href","cite","formaction","ping","poster","background","classid","codebase","longdesc","profile","usemap","icon","manifest","archive"],$e=["hidden","allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","formnovalidate","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],q=function(e){return e&&typeof e=="string"?ke.indexOf(e)!==-1:!1},K=function(e){return e&&typeof e=="string"?$e.indexOf(e)!==-1:!1},He=/^value$/i,U=function(e){return e&&typeof e=="string"?He.test(e):!1},De=/^on/i,I=function(e){return e&&typeof e=="string"?De.test(e):!1},W=function(e){var n;return e&&typeof e=="string"?(n=e==null?void 0:e.toLowerCase())==null?void 0:n.slice(2):""},ce=function(e,n){return e&&typeof e=="string"?e.toLowerCase()===n.toLowerCase():!1},$=function(e,n){return e&&typeof e=="string"?e.toLowerCase().indexOf(n.toLowerCase())!==-1:!1};var Xe=/^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i,_=function(e){return e===""||typeof e!="string"?!1:!Xe.test(e)},z=function(e,n){var o;let t=n.previousSibling;for(;t!==e;)(o=t==null?void 0:t.parentNode)==null||o.removeChild(t),t=n.previousSibling};function O(e){switch(`${e}`){case"NaN":return"";case"null":return"";case"undefined":return""}switch(typeof e){case"string":return e;case"number":return`${e}`;case"bigint":return`${e}`;case"boolean":return`${e}`;case"function":return`${e()}`;case"symbol":return String(e);case"object":return JSON.stringify(e)}throw new Error("XElement - display type not handled")}var ae=()=>Math.floor(Math.random()*Date.now());var Z=function(e,...n){for(;e.lastChild;)e.removeChild(e.lastChild);if(n!=null&&n.length)for(let t of n)e.appendChild(typeof t=="string"?e.ownerDocument.createTextNode(t):t)},le="trustedTypes"in window?window.trustedTypes.createPolicy("x-element",{createHTML:e=>e}):void 0,de=function(e){return le?le.createHTML(e):e};var H=Symbol("html"),he=new WeakMap;function D(e,...n){let t=he.get(e);if(t){let[o,s]=t;return{strings:e,template:o,expressions:n,symbol:H,marker:s}}else{let o=`x-${ae()}-x`,s="",i=e.length-1;for(let d=0;d<i;d++)s+=`${e[d]}${o}`;s+=e[i];let l=document.createElement("template");return l.innerHTML=de(s),he.set(e,[l,o]),{strings:e,template:l,expressions:n,symbol:H,marker:o}}}var je=1+4,ue=3,pe=1,fe=function(e,n){var t,o,s,i,l,d,c,f,v,T,r,p;if((n==null?void 0:n.symbol)===H)if(e=e!=null?e:{},n=n!=null?n:{},e.strings===n.strings){let a=this.actions.length;for(let u=0;u<a;u++)this.actions[u](e.expressions[u],n.expressions[u])}else{this.actions.length=0;let a=n.template.content.cloneNode(!0);me(a,this.actions,n.marker);let u=this.actions.length;for(let g=0;g<u;g++)this.actions[g]((t=e.expressions)==null?void 0:t[g],n.expressions[g]);document.adoptNode(a),z(this.start,this.end),(o=this.end.parentNode)==null||o.insertBefore(a,this.end)}else if((n==null?void 0:n.constructor)===Array){e=e!=null?e:[],n=n!=null?n:[];let a=e.length,u=n.length,g=Math.min(a,u);for(let E=0;E<g;E++)this.actions[E](e[E],n[E]);if(a<u){let E=document.createElement("template");for(let P=a;P<u;P++){let V=document.createTextNode(""),ie=document.createTextNode(""),se=fe.bind({start:V,end:ie,actions:[]});E.content.appendChild(V),E.content.appendChild(ie),this.actions.push(se),se(e[P],n[P])}(s=this.end.parentNode)==null||s.insertBefore(E.content,this.end)}else if(a>u){for(let E=a-1;E>u-1;E--)if(((i=e[E])==null?void 0:i.symbol)===H){let{template:P}=e[E],V=P.content.childNodes.length+2;for(;V--;)(l=this.end.parentNode)==null||l.removeChild(this.end.previousSibling)}else(d=this.end.parentNode)==null||d.removeChild(this.end.previousSibling),(c=this.end.parentNode)==null||c.removeChild(this.end.previousSibling),(f=this.end.parentNode)==null||f.removeChild(this.end.previousSibling);this.actions.length=u}}else{if(e===n)return;this.end.previousSibling===this.start?(v=this.end.parentNode)==null||v.insertBefore(document.createTextNode(O(n)),this.end):((T=this.end.previousSibling)==null?void 0:T.nodeType)===ue&&((r=this.end.previousSibling)==null?void 0:r.previousSibling)===this.start?this.end.previousSibling.textContent=O(n):(z(this.start,this.end),(p=this.end.parentNode)==null||p.insertBefore(document.createTextNode(O(n)),this.end))}},Be=function(e,n){e!==n&&(U(e)?(this.element.removeAttribute(e),Reflect.set(this.element,e,null)):I(e)?typeof this.value=="function"&&this.element.removeEventListener(W(e),this.value,!0):q(e)?this.element.removeAttribute(e):K(e)?this.element.removeAttribute(e):e&&(this.element.removeAttribute(e),Reflect.deleteProperty(this.element,e)),this.name=(n==null?void 0:n.toLowerCase())||"",K(this.name)&&(this.element.setAttribute(this.name,""),Reflect.set(this.element,this.name,!0)))},Ve=function(e,n){if(e!==n)if(U(this.name)){if(this.value=O(n),!this.name)return;this.element.setAttribute(this.name,this.value),Reflect.set(this.element,this.name,this.value)}else if(I(this.name)){if(!this.name)return;if(typeof this.value=="function"&&this.element.removeEventListener(W(this.name),this.value,!0),typeof n!="function")return console.warn(`XElement - attribute name "${this.name}" and value "${this.value}" not allowed`);this.value=function(){return n.call(this,...arguments)},this.element.addEventListener(W(this.name),this.value,!0)}else if(q(this.name)){if(this.value=encodeURI(n),!this.name)return;if(_(this.value)){this.element.removeAttribute(this.name),console.warn(`XElement - attribute name "${this.name}" and value "${this.value}" not allowed`);return}this.element.setAttribute(this.name,this.value)}else{if(this.value=n,!this.name)return;this.element.setAttribute(this.name,this.value),Reflect.set(this.element,this.name,this.value)}},qe=function(e,n){var o,s,i,l;if(e===n)return;let t=this.element;if(n){(o=t.parentNode)==null||o.removeChild(t);let d=document.createElement(n);for(;t.firstChild;)d.appendChild(t.firstChild);if(t.nodeType===pe){let c=t.getAttributeNames();for(let f of c){let v=(s=t.getAttribute(f))!=null?s:"";d.setAttribute(f,v)}}(i=this.holder.parentNode)==null||i.insertBefore(d,this.holder),this.element=d}else(l=t.parentNode)==null||l.removeChild(t),this.element=t},me=function(e,n,t){var l,d,c,f,v,T;let o=new WeakSet,s=document.createTreeWalker(e,je,null);s.currentNode=e;let i=e.firstChild;for(;i=s.nextNode();)if(o.has(i.previousSibling)&&(o.delete(i.previousSibling),n.push(()=>{})),i.nodeType===ue){let r=(d=(l=i.nodeValue)==null?void 0:l.indexOf(t))!=null?d:-1;if(r===-1)continue;r!==0&&(i.splitText(r),i=s.nextNode());let p=t.length;p!==((c=i.nodeValue)==null?void 0:c.length)&&i.splitText(p);let a=document.createTextNode(""),u=i;u.textContent="",(f=u.parentNode)==null||f.insertBefore(a,u),n.push(fe.bind({marker:t,start:a,end:u,actions:[]}))}else if(i.nodeType===pe){(i.nodeName==="SCRIPT"||i.nodeName==="STYLE")&&s.nextSibling();let r={element:i};ce(i.nodeName,t)&&(o.add(i),r.holder=document.createTextNode(""),(v=i.parentNode)==null||v.insertBefore(r.holder,i),n.push(qe.bind(r)));let p=i.getAttributeNames();for(let a of p){let u=(T=i.getAttribute(a))!=null?T:"";if($(a,t)||$(u,t)){let g={name:a,value:u,previous:void 0,get element(){return r.element}};$(a,t)&&(i.removeAttribute(a),n.push(Be.bind(g))),$(u,t)&&(i.removeAttribute(a),n.push(Ve.bind(g)))}else q(a)?_(u)&&(i.removeAttribute(a),console.warn(`XElement - attribute name "${a}" and value "${u}" not allowed`)):I(a)&&(i.removeAttribute(a),console.warn(`XElement - attribute name "${a}" not allowed`))}}else console.warn(`XElement - node type "${i.nodeType}" not handled`)},ye=me;var Ee=function(e,n,t,o,s){if(typeof t=="symbol")return Reflect.set(n,t,o,s);let i=Reflect.get(n,t,s);return i===o||Number.isNaN(i)&&Number.isNaN(o)||(Reflect.set(n,t,o,s),e()),!0},xe=function(e,n,t,o){if(typeof t=="symbol")return Reflect.get(n,t,o);let s=Reflect.get(n,t,o);if(s){if(s.constructor===Function)return new Proxy(s,{apply(i,l,d){return Reflect.apply(i,o,d)}});if(s.constructor===Object||s.constructor===Array)return new Proxy(s,{get:xe.bind(null,e),set:Ee.bind(null,e),deleteProperty:ve.bind(null,e)})}return s},ve=function(e,n,t){return typeof t=="symbol"?Reflect.deleteProperty(n,t):(Reflect.deleteProperty(n,t),e(),!0)},Ie=function(e,n){return new Proxy(e,{get:xe.bind(null,n),set:Ee.bind(null,n),deleteProperty:ve.bind(null,n)})},be=Ie;function L(e){return e=e.replace(/([a-zA-Z])([A-Z])/g,"$1-$2"),e=e.toLowerCase(),e=e.includes("-")?e:`x-${e}`,e}var ge=new Event("adopted"),we=new Event("adopting"),ct=new Event("upgraded"),at=new Event("upgrading"),Ce=new Event("creating"),Ne=new Event("created"),Te=new Event("rendering"),Re=new Event("rendered"),G=new Event("connected"),J=new Event("connecting"),Ae=new Event("attributed"),Le=new Event("attributing"),Me=new Event("disconnected"),Pe=new Event("disconnecting");var S=Symbol("Task"),F=Symbol("Update"),Y=Symbol("Create"),We=()=>Promise.resolve(),y,X,j,R,k,C,N,M,B,Fe,x=class extends HTMLElement{constructor(){var s;super();w(this,y,{});w(this,X,void 0);w(this,j,"");w(this,R,[]);w(this,k,[]);w(this,C,!1);w(this,N,!1);w(this,M,!1);w(this,B,!1);A(this,Fe,Promise.resolve());let t=this.constructor;if(t.shadow&&!this.shadowRoot){let i=t.mode||"open";this.attachShadow({mode:i})}m(this,X,(s=this.shadowRoot)!=null?s:this)}static define(t=(o=>(o=this.tag)!=null?o:this.name)()){return t=L(t),customElements.get(t)!==this&&customElements.define(t,this),this}static create(t){var s;t=L((s=this.tag)!=null?s:this.name),customElements.get(t)!==this&&customElements.define(t,this);let o=document.createElement(t);return customElements.upgrade&&customElements.upgrade(o),o}static upgrade(t){return b(this,null,function*(){var s;t=L((s=this.tag)!=null?s:this.name),customElements.get(t)!==this&&customElements.define(t,this);let o=document.createElement(t);return yield o[Y](),customElements.upgrade&&customElements.upgrade(o),o})}attributeChangedCallback(t,o,s){return b(this,null,function*(){var i,l;this.dispatchEvent(Le),yield(l=(i=this.attribute)==null?void 0:i.call(this,t,o,s))==null?void 0:l.catch(console.error),this.dispatchEvent(Ae)})}adoptedCallback(){return b(this,null,function*(){var t,o;this.dispatchEvent(we),yield(o=(t=this.adopted)==null?void 0:t.call(this,h(this,y)))==null?void 0:o.catch(console.error),this.dispatchEvent(ge)})}connectedCallback(){return b(this,null,function*(){var t,o;h(this,B)?(this.dispatchEvent(J),yield(o=(t=this.connected)==null?void 0:t.call(this,h(this,y)))==null?void 0:o.catch(console.error),this.dispatchEvent(G)):yield this[Y]()})}disconnectedCallback(){return b(this,null,function*(){var t,o;this.dispatchEvent(Pe),yield(o=(t=this.disconnected)==null?void 0:t.call(this,h(this,y)))==null?void 0:o.catch(console.error),this.dispatchEvent(Me)})}[(Fe=S,Y)](){return b(this,null,function*(){var d,c,f,v,T;m(this,B,!0),m(this,C,!0),m(this,N,!0);let o=this.constructor.observedProperties,s=Object.getPrototypeOf(this),i=o?o!=null?o:[]:[...Object.getOwnPropertyNames(this),...Object.getOwnPropertyNames(s)];for(let r of i){if(r==="attributeChangedCallback"||r==="disconnectedCallback"||r==="connectedCallback"||r==="adoptedCallback"||r==="constructor"||r==="disconnected"||r==="attribute"||r==="connected"||r==="rendered"||r==="created"||r==="adopted"||r==="render"||r==="setup")continue;let p=(d=Object.getOwnPropertyDescriptor(this,r))!=null?d:Object.getOwnPropertyDescriptor(s,r);p&&p.configurable&&(typeof p.value=="function"&&(p.value=p.value.bind(this)),typeof p.get=="function"&&(p.get=p.get.bind(this)),typeof p.set=="function"&&(p.set=p.set.bind(this)),Object.defineProperty(h(this,y),r,p),Object.defineProperty(this,r,{configurable:!1,enumerable:p.enumerable,get(){return h(this,y)[r]},set(a){h(this,y)[r]=a,this[F]()}}))}m(this,y,be(h(this,y),this[F].bind(this)));let l=yield(c=this.render)==null?void 0:c.call(this,h(this,y));if(l){let r=l.template.content.cloneNode(!0);m(this,j,l.marker),m(this,k,l.expressions),ye(r,h(this,R),h(this,j));for(let p=0;p<h(this,R).length;p++){let a=l.expressions[p];try{h(this,R)[p](void 0,a)}catch(u){console.error(u)}}document.adoptNode(r),h(this,X).appendChild(r)}this.dispatchEvent(Ce),yield(f=this.created)==null?void 0:f.call(this,h(this,y)),this.dispatchEvent(Ne),this.dispatchEvent(J),yield(T=(v=this.connected)==null?void 0:v.call(this,h(this,y)))==null?void 0:T.catch(console.error),this.dispatchEvent(G),m(this,C,!1),m(this,N,!1),m(this,M,!1),yield this[F]()})}[F](){return b(this,null,function*(){return h(this,C)&&!h(this,N)?this[S]:h(this,C)&&h(this,N)?(m(this,M,!0),this[S]):(m(this,C,!0),this[S]=this[S].then(()=>b(this,null,function*(){var o,s;this.dispatchEvent(Te);let t=yield(o=this.render)==null?void 0:o.call(this,h(this,y));if(m(this,N,!0),t)for(let i=0;i<h(this,R).length;i++){if(h(this,M)){yield We(),i=-1,m(this,M,!1);continue}let l=t.expressions[i],d=h(this,k)[i];try{h(this,R)[i](d,l)}catch(c){console.error(c)}h(this,k)[i]=t.expressions[i]}m(this,C,!1),m(this,N,!1),yield(s=this.rendered)==null?void 0:s.call(this,h(this,y)),this.dispatchEvent(Re)})).catch(console.error),this[S])})}};y=new WeakMap,X=new WeakMap,j=new WeakMap,R=new WeakMap,k=new WeakMap,C=new WeakMap,N=new WeakMap,M=new WeakMap,B=new WeakMap,A(x,"html",D),A(x,"tag"),A(x,"shadow"),A(x,"mode"),A(x,"observedProperties");function Q(e,n){customElements.get(e)!==n&&customElements.define(e,n)}var te=[],ne=[],ee=function(e){return b(this,null,function*(){var n;if(e.instance)Z(e.root,e.instance);else{let t=yield e.handler();if((t==null?void 0:t.prototype)instanceof HTMLElement)e.construct=t;else if(((n=t==null?void 0:t.default)==null?void 0:n.prototype)instanceof HTMLElement)e.construct=t.default;else throw new Error("XElement - router handler requires a CustomElementConstructor");e.construct.prototype instanceof x?e.instance=yield e.construct.upgrade():(e.tag=L(e.construct.name),Q(e.tag,e.construct),e.instance=document.createElement(e.tag)),Z(e.root,e.instance)}})},Ke=function(e){var i,l,d;if(e&&"canIntercept"in e&&e.canIntercept===!1||e&&"canTransition"in e&&e.canTransition===!1)return;let n=new URL((i=e==null?void 0:e.destination.url)!=null?i:location.href),t=new URL((d=(l=document.querySelector("base"))==null?void 0:l.href)!=null?d:location.origin);t.hash="",t.search="",n.hash="",n.search="";let o=n.href.replace(t.href,"/"),s=[];for(let c of ne)c.path===o&&s.push(c);for(let c of te){let f=!1;for(let v of s)if(v.root===c.root){f=!0;break}f||s.push(c)}if(e!=null&&e.intercept)return e.intercept({handler:()=>s.map(c=>ee(c))});if(e!=null&&e.transitionWhile)return e.transitionWhile(s.map(c=>ee(c)));s.map(c=>ee(c))},Ue=function(e,n,t){if(!e)throw new Error("XElement - router path required");if(!t)throw new Error("XElement - router handler required");if(!n)throw new Error("XElement - router root required");if(e==="/*"){for(let o of te)if(o.path===e&&o.root===n)throw new Error("XElement - router duplicate path on root");te.push({path:e,root:n,handler:t})}else{for(let o of ne)if(o.path===e&&o.root===n)throw new Error("XElement - router duplicate path on root");ne.push({path:e,root:n,handler:t,instance:void 0})}Reflect.get(window,"navigation").addEventListener("navigate",Ke)},oe=Ue;var At={Component:x,component:x,Router:oe,router:oe,html:D};export{x as Component,oe as Router,x as component,At as default,D as html,oe as router};
//# sourceMappingURL=x-element.js.map
