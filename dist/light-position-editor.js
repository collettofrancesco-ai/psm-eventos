(function(){
  'use strict';
  var stage=document.querySelector('.stage-preview');
  if(!stage)return;
  var canvas=stage.querySelector('.stage-canvas');
  var lamps=Array.from(stage.querySelectorAll('.stage-fixtures i,.stage-movers b,.stage-strobes b,.stage-strobes-side b'));
  var key='psm-light-positions-v2', positions={};
  try{positions=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(e){}
  lamps.forEach(function(el,i){el.dataset.positionId='light-'+i;apply(el);});
  function apply(el){var p=positions[el.dataset.positionId];if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))el.style.translate=p.x+'px '+p.y+'px';}
  if(new URLSearchParams(location.search).get('editLights')!=='1')return;
  stage.classList.add('editing-lights');
  var panel=document.createElement('div');panel.className='light-position-panel';
  panel.innerHTML='<strong>Posiziona le luci</strong><span>Trascina un faro. Frecce: 1 pixel · Maiusc + frecce: 10 pixel.</span><output>Seleziona un faro</output><div><button type="button" data-action="reset">Ripristina</button><button type="button" data-action="save">Salva e chiudi</button></div><small>Le posizioni restano in questo browser. Salva il file per applicarle al sito.</small>';
  document.body.appendChild(panel);
  var selected=null,drag=null;
  function scale(){return canvas.getBoundingClientRect().width/canvas.offsetWidth||1;}
  function select(el){if(selected)selected.classList.remove('position-selected');selected=el;el.classList.add('position-selected');update();}
  function update(){var p=positions[selected.dataset.positionId]||{x:0,y:0};panel.querySelector('output').textContent=selected.dataset.positionId+' · X: '+p.x.toFixed(1)+' · Y: '+p.y.toFixed(1);}
  function move(el,x,y){positions[el.dataset.positionId]={x:Math.round(x*100)/100,y:Math.round(y*100)/100};apply(el);update();}
  function persist(){try{localStorage.setItem(key,JSON.stringify(positions));}catch(e){}}
  lamps.forEach(function(el){
    el.addEventListener('pointerdown',function(e){
      e.preventDefault();e.stopImmediatePropagation();select(el);
      var p=positions[el.dataset.positionId]||{x:0,y:0};drag={el:el,x:e.clientX,y:e.clientY,px:p.x,py:p.y,scale:scale()};el.setPointerCapture(e.pointerId);
    },true);
    el.addEventListener('pointermove',function(e){if(!drag||drag.el!==el)return;e.preventDefault();move(el,drag.px+(e.clientX-drag.x)/drag.scale,drag.py+(e.clientY-drag.y)/drag.scale);});
    el.addEventListener('pointerup',function(){drag=null;persist();});
    el.addEventListener('pointercancel',function(){drag=null;persist();});
    el.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();},true);
  });
  function keyboard(e){
    if(!selected||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    var directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},d=directions[e.key];if(!d)return;
    e.preventDefault();var p=positions[selected.dataset.positionId]||{x:0,y:0},step=(e.shiftKey?10:1)/scale();move(selected,p.x+d[0]*step,p.y+d[1]*step);persist();
  }
  document.addEventListener('keydown',keyboard);
  panel.querySelector('[data-action="reset"]').addEventListener('click',function(){positions={};lamps.forEach(function(el){el.style.translate='';});persist();if(selected)update();});
  panel.querySelector('[data-action="save"]').addEventListener('click',function(){
    persist();var blob=new Blob([JSON.stringify(positions,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='psm-light-positions.json';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);
    stage.classList.remove('editing-lights');if(selected)selected.classList.remove('position-selected');panel.remove();document.removeEventListener('keydown',keyboard);
    var u=new URL(location.href);u.searchParams.delete('editLights');history.replaceState(null,'',u.href);
    // Reload removes the editing event handlers while restoring the saved positions.
    location.reload();
  });
})();
