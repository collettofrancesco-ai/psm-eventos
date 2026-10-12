// PSM stage: one video drives every LED surface; the music drives the spectrum.
(function(){
  'use strict';
  var stage = document.querySelector('.stage-preview');
  if (!stage) return;
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
  var ledPlaylist = ['assets/videos/video-1.mp4','assets/videos/video-2.mp4','assets/videos/video-3.mp4','assets/videos/video-4.mp4'];
  var ledIndex = 0;
  video.addEventListener('ended', function(){
    ledIndex = (ledIndex + 1) % ledPlaylist.length;
    try { video.src = ledPlaylist[ledIndex]; video.load(); if (state.led) video.play().catch(function(){}); } catch(e){}
  });
  function startVideo(){
    if (!video.paused) { scheduleFrame(); return; }
    video.play().catch(function(error){
      if (error.name !== 'AbortError' && state.led) stage.classList.add('led-fallback');
    });
  }
  function render(){
    var labels = {sound:ST('music','Música'), lights:ST('lights','Luces'), led:ST('led','Video LED')}, active = [];
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
      var idx = wallTracks.indexOf(tb.dataset.track);
      if (idx !== -1) wallTrackIdx = idx;
      selectTrackFile(tb.dataset.track);
    });
  });
  var wallChapters = [0, 30.25, 53.96, 77.04, 95.79, 127.2];
  var wallTracks = ['assets/stage-track-1.wav','assets/stage-track-2.wav','assets/stage-track-3.wav','assets/stage-track-4-desire.wav','assets/stage-track-5.wav'];
  var wallTrackIdx = 0;
  function wallChapter(t){
    for (var k = 0; k < 5; k++) { if (t < wallChapters[k + 1]) return k; }
    return 4;
  }
  function selectTrackFile(file){
    tracks.forEach(function(x){ x.setAttribute('aria-pressed', String(x.dataset.track === file)); });
    if (music.getAttribute('src') === file) return;
    var wasPlaying = !music.paused;
    music.setAttribute('src', file);
    music.load();
    if (state.sound) { music.currentTime = 0; startMusic(); }
    else if (wasPlaying) { music.currentTime = 0; music.play().catch(function(){}); }
  }
  video.addEventListener('timeupdate', function(){
    var idx = wallChapter(video.currentTime || 0);
    if (idx === wallTrackIdx) return;
    wallTrackIdx = idx;
    selectTrackFile(wallTracks[idx]);
  });
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
    if (state.sound) { music.volume = .45; startMusic(); }
    else if (!intro) { music.pause(); music.currentTime = 0; }
    if (state.led) startVideo();
    else { video.pause(); stage.classList.remove('led-fallback'); }
    scheduleFrame();
  }
  function cancelShow(){
    timers.forEach(clearTimeout); timers = [];
    clearInterval(showCycle); showCycle = null;
    showRunning = false; intro = false;
    music.volume = .45;
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
    cancelShow();state={sound:false,lights:false,led:false};render();
    showRunning=true;intro=true;music.volume=0;startMusic();render();
    timers.push(setTimeout(function(){state.led=true;render();},500));
    timers.push(setTimeout(function(){intro=false;state.sound=true;music.currentTime=0;render();},1400));
    timers.push(setTimeout(function(){
      state.lights=true;stage.dataset.lightEffect='cross';effect.value='cross';render();
      var modes=['cross','color','sweep','pulse'], index=0;
      showCycle=setInterval(function(){index=(index+1)%modes.length;stage.dataset.lightEffect=modes[index];effect.value=modes[index];},8000);
    },2400));
  });

  function scheduleFrame(){
    if (!frame && inView && !document.hidden && ((state.sound && !music.paused) || (state.led && !video.paused))) frame=requestAnimationFrame(paint);
  }
  function paint(time){
    frame=0;
    if (!inView || document.hidden) return;
    if (time-previousFrame>=33) {
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
  window.psmStage={stopSound:function(){cancelShow();state.sound=false;render();}};

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
