// PSM stage: one video drives every LED surface; the music drives the spectrum.
(function(){
  'use strict';
  var stage = document.querySelector('.stage-preview');
  if (!stage) return;
  // On phones the canvas is the desktop stage (820x700) scaled to fit the preview,
  // so it looks identical to the PC; the light cones reach the deck at every size.
  var canvas = (stage.querySelector && stage.querySelector('.stage-canvas')) || stage;
  function sizeLightCones(){
    var width = stage.clientWidth, height = stage.clientHeight;
    if (!height) return;
    var scale = Math.min(width / 820, height / 700);
    stage.style.setProperty('--stage-scale', scale.toFixed(4));
    stage.style.setProperty('--stage-x', ((width - 820 * scale) / 2).toFixed(1) + 'px');
    stage.style.setProperty('--stage-y', ((height - 700 * scale) / 2).toFixed(1) + 'px');
    stage.style.setProperty('--beam-reach', Math.round(canvas.clientHeight * .64) + 'px');
  }
  sizeLightCones();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(sizeLightCones).observe(stage);
  var experience = document.getElementById('stage-experience');
  var music = document.getElementById('stage-music');
  var video = document.getElementById('stage-led-video');
  var buttons = Array.from(document.querySelectorAll('[data-stage]'));
  var status = document.getElementById('stage-status');
  var allButton = document.getElementById('stage-all');
  var showButton = document.getElementById('stage-show');
  var fullButton = document.getElementById('stage-fullscreen');
  var effect = document.getElementById('light-effect');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function psmLang(){ return window.PSM_LANG || 'es'; }
  function ST(key, fallback){
    try {
      var D = window.PSM_DYN && window.PSM_DYN.stage[psmLang()];
      if (D && D[key] !== undefined) return D[key];
    } catch(e){}
    return fallback;
  }

  var state = {sound:false, lights:false, led:false};
  var showRunning = false, intro = false, timers = [], showCycle = null;
  var context = null, analyser = null, frequencies = null;
  var inView = true, frame = 0, previousFrame = 0;
  var bars = Array.from(stage.querySelectorAll('.stage-equalizer i'));
  var surfaces = Array.from(stage.querySelectorAll('canvas')).map(function(canvas){
    return {canvas:canvas, painter:canvas.getContext('2d'), reflection:canvas.classList.contains('stage-reflection')};
  });
  music.volume = .45;
  video.muted = true;

  function connectAudio(){
    if (context) { if (context.state === 'suspended') context.resume().catch(function(){}); return; }
    var AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    try {
      context = new AudioEngine();
      analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = .65;
      var source = context.createMediaElementSource(music);
      source.connect(analyser);
      analyser.connect(context.destination);
      frequencies = new Uint8Array(analyser.frequencyBinCount);
      stage.classList.add('audio-reactive');
      context.resume().catch(function(){});
    } catch(error) { analyser = null; }
  }
  function startMusic(){
    connectAudio();
    if (!music.paused) { scheduleFrame(); return; }
    music.play().catch(function(error){
      if (error.name === 'AbortError' || (!state.sound && !intro)) return;
      cancelShow(); state.sound = false; render();
      status.textContent = ST('musicErr', 'Pulsa Sonido para volver a iniciar la música.');
    });
  }
  var presets = Array.from(document.querySelectorAll('[data-preset]'));
  function applyPreset(name){
    if (!name) return;
    stage.dataset.preset = name;
    presets.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.preset === name)); });
  }
  presets.forEach(function(b){
    b.addEventListener('click', function(){ cancelShow(); applyPreset(b.dataset.preset); render(); });
  });
  var tracks = Array.from(document.querySelectorAll('[data-track]'));
  tracks.forEach(function(tb){
    tb.addEventListener('click', function(){
      manualTrack = true;
      selectTrackFile(tb.dataset.track);
    });
  });
  var wallTracks = ['assets/wall-mobile/intro.m4a','assets/stage-track-1.m4a','assets/stage-track-2-thank-you.m4a','assets/stage-track-3.m4a','assets/stage-track-4-desire.m4a'];
  var ledPlaylist = [1,2,3,4,5].map(function(n){ return 'assets/wall-mobile/clip-' + n + '.mp4'; });
  var ledIndex = 0, manualTrack = false, videoWaiting = false, stallTimer = null;
  var wallState = document.getElementById('wall-playback-status');
  var retryButton = document.getElementById('wall-retry');
  function alignMusic(){
    if (!state.led || !Number.isFinite(music.duration) || music.duration <= 0) return;
    var target = video.currentTime % music.duration;
    if (Math.abs(music.currentTime - target) > .75) music.currentTime = target;
  }
  function selectTrackFile(file){
    tracks.forEach(function(x){ x.setAttribute('aria-pressed', String(x.dataset.track === file)); });
    if (music.getAttribute('src') !== file) { music.pause(); music.setAttribute('src', file); music.load(); }
    if ((state.sound || intro) && (!state.led || !videoWaiting)) { alignMusic(); startMusic(); }
  }
  function setClip(index){
    ledIndex = (index + ledPlaylist.length) % ledPlaylist.length;
    manualTrack = false;
    music.pause();
    videoWaiting = true;
    clearTimeout(stallTimer);
    retryButton.hidden = true;
    stage.classList.remove('led-surfaces-ready','led-fallback','led-playing');
    wallMessage(ST('loadingVideo','Cargando video…'));
    video.muted = true;
    video.src = ledPlaylist[ledIndex];
    video.load();
    selectTrackFile(wallTracks[ledIndex]);
    if (state.led) startVideo();
  }
  function wallMessage(text){ wallState.textContent = text; }
  video.addEventListener('ended', function(){ setClip(ledIndex + 1); });
  video.addEventListener('waiting', function(){
    stage.classList.remove('led-playing');
    videoWaiting = true;
    if (state.led) music.pause();
    wallMessage(ST('loadingVideo','Cargando video…'));
    clearTimeout(stallTimer);
    stallTimer = setTimeout(function(){ if (state.led && videoWaiting) retryButton.hidden = false; },8000);
  });
  video.addEventListener('error', function(){
    videoWaiting = true; music.pause(); retryButton.hidden = false;
    wallMessage(ST('videoErr','No se pudo cargar el video. Pulsa Reintentar.'));
  });
  video.addEventListener('playing', function(){
    videoWaiting = false; clearTimeout(stallTimer); retryButton.hidden = true;
    wallMessage((ledIndex + 1) + ' / 5');
    if (state.sound || intro) { if (!manualTrack) selectTrackFile(wallTracks[ledIndex]); else startMusic(); alignMusic(); }
  });
  video.addEventListener('timeupdate', alignMusic);
  video.addEventListener('seeked', alignMusic);
  music.addEventListener('loadedmetadata', alignMusic);
  retryButton.addEventListener('click', function(){
    var position = video.currentTime;
    video.addEventListener('loadedmetadata', function restore(){ video.currentTime = position; }, {once:true});
    video.load(); startVideo();
  });
  document.getElementById('wall-next').addEventListener('click', function(){
    state.led = true; setClip(ledIndex + 1); render();
  });
  function startVideo(){
    video.muted = true;
    if (!video.paused) { scheduleFrame(); return; }
    video.play().catch(function(error){
      if (error.name === 'AbortError' || !state.led) return;
      retryButton.hidden = false;
      wallMessage(ST('videoErr','Pulsa Reintentar para iniciar el video.'));
    });
  }
  function render(){
    var labels = {sound:ST('music','Música'), lights:ST('lights','Luces'), led:ST('led','Video LED')}, active = [];
    buttons.forEach(function(button){
      var key = button.dataset.stage;
      button.setAttribute('aria-pressed', String(state[key]));
      stage.classList.toggle(key + '-on', state[key]);
      if (state[key]) active.push(labels[key]);
    });
    status.textContent = active.length ? active.join(' + ') + ' · ' + (showRunning ? ST('live','Show en vivo.') : ST('action','Escenario en acción.')) : (showRunning ? ST('preparing','Preparando tu show…') : ST('off','Todo apagado. Enciende tu escenario.'));
    allButton.firstChild.textContent = buttons.every(function(button){return state[button.dataset.stage];}) ? ST('allOff','Apagar todo ') : ST('allOn','Encender todo ');
    showButton.firstChild.textContent = showRunning ? ST('stopShow','Detener show ') : ST('startShow','Iniciar show ');
    stage.classList.toggle('show-running', showRunning);
    if (state.led && !manualTrack) selectTrackFile(wallTracks[ledIndex]);
    if (state.sound) { music.volume = .45; if (!state.led || !videoWaiting) startMusic(); }
    else if (!intro) { music.pause(); music.currentTime = 0; }
    if (state.led) startVideo();
    else { video.pause(); clearTimeout(stallTimer); retryButton.hidden = true; wallMessage(''); stage.classList.remove('led-fallback'); }
    if (state.sound || state.lights || state.led) endIntro();
    scheduleFrame();
    scheduleBeat();
  }
  function cancelShow(){
    timers.forEach(clearTimeout); timers = [];
    clearInterval(showCycle); showCycle = null;
    showRunning = false; intro = false;
    music.volume = .45;
    stage.classList.remove('finale');
    if (confetti) confetti.innerHTML = '';
  }
  buttons.forEach(function(button){
    button.addEventListener('click',function(){cancelShow();state[button.dataset.stage] = !state[button.dataset.stage];render();});
  });
  allButton.addEventListener('click',function(){
    cancelShow();var next = !Object.keys(state).every(function(key){return state[key];});
    Object.keys(state).forEach(function(key){state[key]=next;});render();
  });
  effect.addEventListener('change',function(){cancelShow();stage.dataset.lightEffect=effect.value;state.lights=true;render();});
  showButton.addEventListener('click',function(){
    if (showRunning) {cancelShow();state={sound:false,lights:false,led:false};render();return;}
    // Video and its track start once, together, inside the tap: iOS ignores
    // audio.volume, so a muted warm-up would be heard as repeated restarts.
    cancelShow();manualTrack=false;showRunning=true;finaleDone=false;showStart=Date.now();
    state={sound:true,lights:false,led:true};render();
    timers.push(setTimeout(function(){
      showMode=0;state.lights=true;stage.dataset.lightEffect='cross';effect.value='cross';render();
      // Tracks with a beat map change effect on the music (fireBeat); others on a timer.
      if (trackBeats()) return;
      var modes=['cross','color','sweep','pulse'], index=0;
      showCycle=setInterval(function(){index=(index+1)%modes.length;stage.dataset.lightEffect=modes[index];effect.value=modes[index];},8000);
    },1000));
  });

  function scheduleFrame(){
    if (!frame && inView && !document.hidden && ((state.sound && !music.paused) || (state.led && !video.paused))) frame=requestAnimationFrame(paint);
  }
  function paint(time){
    frame=0;
    if (!inView || document.hidden) return;
    if (time-previousFrame>=(matchMedia('(pointer: coarse)').matches ? 66 : 33)) {
      previousFrame=time;
      if (analyser && state.sound && !music.paused && !reduced.matches) {
        analyser.getByteFrequencyData(frequencies);
        var bass=0;
        for(var b=1;b<8;b++) bass+=frequencies[b]/255;
        stage.style.setProperty('--bass',(bass/7).toFixed(3));
        bars.forEach(function(bar,index){
          var bin=1+Math.floor(Math.pow(index/(bars.length-1),1.6)*(frequencies.length-2));
          bar.style.setProperty('--level-live',Math.max(.04,frequencies[bin]/255).toFixed(3));
        });
      }
      if (state.led && video.readyState>=2 && video.videoWidth) {
        surfaces.forEach(function(surface,index){
          var c=surface.canvas, ctx=surface.painter;
          if (!ctx) return;
          var ratio=surface.reflection ? 4/3 : c.width/c.height;
          var sourceHeight=Math.min(video.videoHeight,video.videoWidth/ratio);
          var sourceWidth=sourceHeight*ratio;
          var offset=(video.videoWidth-sourceWidth)*(index===0?.2:.8);
          ctx.drawImage(video,offset,(video.videoHeight-sourceHeight)/2,sourceWidth,sourceHeight,0,0,c.width,c.height);
        });
        stage.classList.add('led-surfaces-ready');
      }
    }
    scheduleFrame();
  }
  music.addEventListener('playing',function(){stage.classList.add('music-playing');scheduleFrame();});
  music.addEventListener('pause',function(){stage.classList.remove('music-playing');stage.style.setProperty('--bass','0');});
  video.addEventListener('playing',function(){stage.classList.add('led-playing');stage.classList.remove('led-fallback');scheduleFrame();});
  video.addEventListener('pause',function(){stage.classList.remove('led-playing');});
  reduced.addEventListener('change',function(){if(reduced.matches)stage.style.setProperty('--bass','0');scheduleFrame();});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries){inView=entries[0].isIntersecting;if(inView)scheduleFrame();else{cancelAnimationFrame(frame);frame=0;}}).observe(stage);
  }
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){cancelShow();state.sound=false;render();video.pause();}
    else if(state.led)startVideo();
  });
  addEventListener('pagehide',function(){cancelShow();music.pause();video.pause();cancelAnimationFrame(frame);});
  window.psmStage={stopSound:function(){cancelShow();state.sound=false;render();},finale:finale};

  // Intro: the first time the stage scrolls into view the rig wakes up once:
  // deck LED, top strobes left to right, side strobes upwards, cones, then the logo.
  var introDone = false, introTimer = 0;
  Array.from(stage.querySelectorAll('.stage-strobes b, .stage-strobes-side b, .stage-fixtures i')).forEach(function(el){
    el.style.setProperty('--i', Array.prototype.indexOf.call(el.parentNode.children, el));
  });
  function endIntro(){ clearTimeout(introTimer); stage.classList.remove('stage-intro'); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries, observer){
      if (introDone || !entries[0].isIntersecting) return;
      introDone = true; observer.disconnect();
      if (reduced.matches || state.sound || state.lights || state.led) return;
      stage.classList.add('stage-intro');
      introTimer = setTimeout(endIntro, 3900);
    }, {threshold:.5}).observe(stage);
  }

  // Finale: once per show, on the song's big moment, flames on the deck and confetti from the truss.
  var confetti = stage.querySelector ? stage.querySelector('.stage-confetti') : null;
  var finaleDone = false, showStart = 0;
  var confettiColors = ['#5eebff','#c79cff','#ffffff','#ffd66b','#ff7db8'];
  function finale(){
    finaleDone = true;
    if (!confetti || reduced.matches) return;
    var pieces = '';
    for (var n = 0; n < 80; n++) {
      pieces += '<i style="--x:' + (Math.random() * 100).toFixed(1) + '%;--dx:' + Math.round(Math.random() * 120 - 60) + 'px;--r:' + Math.round(Math.random() * 900 - 450) + 'deg;--s:' + (2.6 + Math.random() * 1.8).toFixed(2) + 's;--d:' + (Math.random() * .7).toFixed(2) + 's;--c:' + confettiColors[n % confettiColors.length] + '"></i>';
    }
    confetti.innerHTML = pieces;
    stage.classList.add('finale');
    timers.push(setTimeout(function(){ stage.classList.remove('finale'); confetti.innerHTML = ''; }, 5600));
  }

  // Beat sync: the lights hit on the beats precomputed by scripts/analyze-beats.py,
  // timed from music.currentTime so phones stay on the beat at any frame rate.
  var beatMap = null, beatTimer = 0, lastBeat = -1, beatParity = false, lastEnergy = 0, showMode = 0, jumpBeats = 0;
  var showModes = ['cross','color','sweep','pulse'];
  var strobes = Array.from(stage.querySelectorAll('.stage-strobes b'));
  var sideStrobes = Array.from(stage.querySelectorAll('.stage-strobes-side b'));
  function trackBeats(){ return beatMap && beatMap[music.getAttribute('src')]; }
  function lit(list, on){
    list.forEach(function(el, n){
      el.classList.remove('hit-a','hit-b');
      if (on(n)) el.classList.add(beatParity ? 'hit-a' : 'hit-b');
    });
  }
  function none(){ return false; }
  function all(){ return true; }
  function stopBeats(){
    clearTimeout(beatTimer); beatTimer = 0;
    stage.classList.remove('beat-sync');
    lit(strobes, none); lit(sideStrobes, none);
    stage.classList.remove('crowd-hype','crowd-jump');
    jumpBeats = 0;
  }
  function scheduleBeat(){
    clearTimeout(beatTimer); beatTimer = 0;
    var map = trackBeats();
    if (!map || music.paused || reduced.matches || document.hidden) { stopBeats(); return; } // lights rules also need .lights-on; the crowd moves with music alone
    stage.classList.add('beat-sync');
    stage.style.setProperty('--beat-len', (60 / map.bpm).toFixed(3) + 's');
    var now = music.currentTime, beats = map.beats;
    if (lastBeat >= beats.length || (lastBeat >= 0 && now < beats[lastBeat] - 1)) lastBeat = -1; // looped; small sync nudges keep the count
    var next = lastBeat + 1;
    while (next < beats.length && beats[next] < now - .05) next++;
    if (next >= beats.length) { beatTimer = setTimeout(scheduleBeat, 100); return; } // wait for the loop
    beatTimer = setTimeout(function(){ lastBeat = next; fireBeat(map, next); scheduleBeat(); }, Math.max(0, (beats[next] - now) * 1000));
  }
  function fireBeat(map, i){
    beatParity = !beatParity;
    var fromDown = i - map.downbeat, inBar = ((fromDown % 4) + 4) % 4, bar = Math.floor(fromDown / 4);
    var energy = map.bars[Math.min(map.bars.length - 1, Math.max(0, bar))];
    stage.style.setProperty('--energy', energy);
    stage.classList.remove('hit-a','hit-b','flash-a','flash-b');
    stage.classList.add(beatParity ? 'hit-a' : 'hit-b');
    // The crowd bobs on every beat, raises its hands when the song is up and jumps on the drop.
    stage.classList.toggle('crowd-hype', energy > .5);
    if (jumpBeats > 0) jumpBeats--;
    stage.classList.toggle('crowd-jump', jumpBeats > 0);
    if (inBar === 0) {
      stage.dataset.bar = ((bar % 4) + 4) % 4;
      if (energy > .7 && lastEnergy < .4) { jumpBeats = 8; stage.classList.add('crowd-jump'); }
      if (showRunning && !finaleDone && bar >= 8 && (energy >= .9 || (Date.now() - showStart > 45000 && energy > .6))) finale();
      // During the show the effect changes with the song: every 8 bars or when it drops.
      if (showRunning && bar > 0 && (bar % 8 === 0 || (energy > .7 && lastEnergy < .4))) {
        showMode = (showMode + 1) % showModes.length;
        stage.dataset.lightEffect = effect.value = showModes[showMode];
      }
      lastEnergy = energy;
    }
    if (energy < .35) { lit(strobes, none); lit(sideStrobes, none); return; }
    var peak = energy > .7;
    if (peak && inBar === 0 && map.strength[i] > .5) {
      stage.classList.add(beatParity ? 'flash-a' : 'flash-b');
      lit(strobes, all); lit(sideStrobes, all);
      return;
    }
    lit(strobes, function(n){ return peak ? n % 2 === i % 2 : n % 4 === inBar; });
    lit(sideStrobes, function(n){ return n % 3 === i % 3; });
  }
  if (window.fetch) fetch('assets/beats.json').then(function(r){ return r.ok ? r.json() : null; }).then(function(map){ beatMap = map; scheduleBeat(); }).catch(function(){});
  music.addEventListener('loadstart', function(){ lastBeat = -1; });
  ['playing','pause','seeked'].forEach(function(name){ music.addEventListener(name, scheduleBeat); });
  reduced.addEventListener('change', scheduleBeat);

  // Event name: typed in the console, lit on the LED wall and scrolling on the LED wings,
  // then sent with the chosen scene in the WhatsApp request.
  var nameInput = document.getElementById('stage-event-name');
  var nameSend = document.getElementById('stage-name-send');
  var ledTitle = stage.querySelector ? stage.querySelector('.led-title span') : null;
  var wingTitles = Array.from(stage.querySelectorAll('.wing-title span'));
  function eventName(){ return nameInput.value.replace(/\s+/g, ' ').trim(); }
  function updateSend(){
    var preset = document.querySelector('[data-preset][aria-pressed="true"]');
    var text = ST('waIntro', 'Hola, PSM. Quiero este escenario para mi evento') + ': "' + eventName() + '". ' +
      ST('waScene', 'Escena') + ': ' + (preset ? preset.textContent.trim() : '') + '. ' +
      ST('waLights', 'Luces') + ': ' + effect.options[effect.selectedIndex].text + '.';
    nameSend.href = 'https://wa.me/59170067767?text=' + encodeURIComponent(text);
  }
  function showName(){
    var name = eventName(), length = Math.max(name.length, 4);
    stage.classList.toggle('has-title', !!name);
    ledTitle.textContent = name;
    // One line up to 12 letters, then two balanced lines; size in canvas widths (cqw).
    stage.style.setProperty('--title-fit', (length <= 12 ? Math.min(8, 76 / length) : Math.max(3.4, Math.min(6, 140 / length))).toFixed(2));
    var loop = name ? Array(5).join(name + '   ·   ') : '';
    wingTitles.forEach(function(el){ el.textContent = loop + loop; });
    nameSend.hidden = !name;
    if (name) updateSend();
    try { localStorage.setItem('psm-event-name', name); } catch(e){}
  }
  if (nameInput && nameSend && ledTitle) {
    try { nameInput.value = localStorage.getItem('psm-event-name') || ''; } catch(e){}
    nameInput.addEventListener('input', showName);
    nameInput.addEventListener('keydown', function(event){ if (event.key === 'Enter') nameInput.blur(); });
    nameSend.addEventListener('click', updateSend);
    showName();
  }

  var dayBtn = document.getElementById('stage-daynight');
  function renderDay(){
    if (!dayBtn) return;
    var day = stage.dataset.mode === 'day';
    dayBtn.firstChild.textContent = day ? ST('nightBtn', 'Ver de noche ') : ST('dayBtn', 'Ver de día ');
  }
  if (dayBtn) dayBtn.addEventListener('click', function(){ stage.dataset.mode = stage.dataset.mode === 'day' ? 'night' : 'day'; renderDay(); });
  function fullLabel(){
    var expanded=document.fullscreenElement===experience || experience.classList.contains('stage-expanded');
    fullButton.firstChild.textContent=expanded?ST('exitFs','Salir de pantalla completa '):ST('enterFs','Pantalla completa ');
    fullButton.setAttribute('aria-label',expanded?ST('exitFsAria','Salir de pantalla completa'):ST('viewFsAria','Ver escenario a pantalla completa'));
  }
  function closeExpanded(){experience.classList.remove('stage-expanded');document.body.classList.remove('stage-fullscreen-open');fullLabel();}
  fullButton.addEventListener('click',function(){
    if(document.fullscreenElement){document.exitFullscreen();return;}
    if(experience.classList.contains('stage-expanded')){closeExpanded();return;}
    if(experience.requestFullscreen)experience.requestFullscreen().catch(function(){experience.classList.add('stage-expanded');document.body.classList.add('stage-fullscreen-open');fullLabel();});
    else{experience.classList.add('stage-expanded');document.body.classList.add('stage-fullscreen-open');fullLabel();}
  });
  document.addEventListener('fullscreenchange',fullLabel);
  document.addEventListener('keydown',function(event){if(event.key==='Escape')closeExpanded();});
  render();
  renderDay();
  document.addEventListener('psm-lang',function(){render();renderDay();});
})();
