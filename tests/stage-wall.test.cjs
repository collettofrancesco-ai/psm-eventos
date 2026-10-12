const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(){
 class Element{
  constructor(attrs={}){this.attrs={...attrs};this.dataset={};this.listeners={};this.style={setProperty(){}};this.textContent='';this.firstChild={textContent:''};this.hidden=false;this.classes=new Set();this.classList={add:(...a)=>a.forEach(x=>this.classes.add(x)),remove:(...a)=>a.forEach(x=>this.classes.delete(x)),contains:x=>this.classes.has(x),toggle:(x,on)=>{if(on===undefined)on=!this.classes.has(x);on?this.classes.add(x):this.classes.delete(x);return on;}};}
  getAttribute(k){return this.attrs[k]??null;} setAttribute(k,v){this.attrs[k]=String(v);}
  addEventListener(k,f,options){(this.listeners[k]??=[]).push({f,once:options?.once});}
  emit(k){for(const h of [...this.listeners[k]??[]]){h.f({target:this});if(h.once)this.listeners[k]=this.listeners[k].filter(x=>x!==h);}}
 }
 class Media extends Element{
  constructor(src){super({src});this.currentTime=0;this.duration=30;this.paused=true;this.muted=true;this.readyState=4;this.videoWidth=432;this.videoHeight=768;}
  play(){this.paused=false;this.emit('playing');return Promise.resolve();} pause(){if(!this.paused){this.paused=true;this.emit('pause');}} load(){this.paused=true;this.currentTime=0;this.emit('loadedmetadata');}
 }
 const elements={};
 for(const id of ['stage-experience','stage-status','stage-all','stage-show','stage-fullscreen','light-effect','wall-playback-status','wall-retry','wall-next','stage-daynight'])elements[id]=new Element();
 const stage=new Element();stage.querySelectorAll=()=>[];
 const video=elements['stage-led-video']=new Media('assets/wall-mobile/clip-1.mp4');
 const music=elements['stage-music']=new Media('assets/stage-track-1.m4a');
 const buttons=['sound','lights','led'].map(key=>{const b=new Element();b.dataset.stage=key;return b;});
 const tracks=[1,2,3,4].map(n=>{const b=new Element();b.dataset.track='assets/stage-track-'+n+(n===4?'-desire':'')+'.m4a';return b;});
 const presets=['concierto','corporativo','boda'].map(name=>{const b=new Element();b.dataset.preset=name;return b;});
 const doc=new Element();doc.hidden=false;doc.body=new Element();doc.getElementById=id=>elements[id];doc.querySelector=q=>q==='.stage-preview'?stage:null;
 doc.querySelectorAll=q=>({'[data-stage]':buttons,'[data-track]':tracks,'[data-preset]':presets}[q]||[]);
 let timerId=0;const timers=new Map();
 const context={document:doc,window:{},matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:f=>{timers.set(++timerId,f);return timerId;},clearTimeout:id=>timers.delete(id),setInterval:()=>++timerId,clearInterval(){},console};
 vm.runInNewContext(fs.readFileSync('dist/stage-show.js','utf8'),context);
 return {stage,video,music,buttons,tracks,presets,elements,timers,click:e=>e.emit('click')};
}
test('LED starts without ReferenceError and all five compact clips loop muted',()=>{
 const s=setup();s.click(s.buttons[2]);assert.equal(s.video.paused,false);
 for(let n=0;n<6;n++){assert.equal(s.video.muted,true);s.video.emit('ended');assert.equal(s.video.src,`assets/wall-mobile/clip-${(n+1)%5+1}.mp4`);}
});
test('rendering never duplicates track, preset or timeupdate handlers',()=>{
 const s=setup();for(let n=0;n<20;n++)s.click(s.buttons[1]);
 for(const e of [...s.tracks,...s.presets])assert.equal(e.listeners.click.length,1);
 assert.equal(s.video.listeners.timeupdate.length,1);
});
test('switching tracks or clips cannot start music when sound is disabled',()=>{
 const s=setup();s.click(s.buttons[2]);s.click(s.tracks[1]);s.video.emit('ended');assert.equal(s.music.paused,true);
 s.click(s.buttons[0]);assert.equal(s.music.paused,false);s.click(s.buttons[0]);s.video.emit('ended');assert.equal(s.music.paused,true);
});
test('manual music selection survives render; next clip restores its paired track',()=>{
 const s=setup();s.click(s.buttons[2]);s.click(s.buttons[0]);s.click(s.tracks[2]);s.click(s.presets[1]);
 assert.equal(s.music.getAttribute('src'),'assets/stage-track-3.m4a');
 s.video.emit('ended');assert.equal(s.music.getAttribute('src'),'assets/stage-track-1.m4a');
});
test('buffering pauses music, playing resumes it in step with the video',()=>{
 const s=setup();s.click(s.buttons[2]);s.click(s.buttons[0]);s.video.currentTime=8;
 s.video.emit('waiting');assert.equal(s.music.paused,true);
 s.video.emit('playing');assert.equal(s.music.paused,false);assert.equal(s.music.currentTime,8);
});
test('stopping show clears delayed starts',()=>{
 const s=setup();s.click(s.elements['stage-show']);s.click(s.elements['stage-show']);
 assert.equal(s.timers.size,0);assert.equal(s.music.paused,true);assert.equal(s.video.paused,true);
});

test('the production page provides every wall control and the first small clip',()=>{
 const html=fs.readFileSync('dist/index.html','utf8');
 for(const id of ['wall-playback-status','wall-next','wall-retry'])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(html.includes('src="assets/wall-mobile/clip-1.mp4"'));
});
