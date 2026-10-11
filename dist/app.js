// PSM multipagina — seguro en todas las páginas
(function(){
  document.documentElement.classList.add('js');
  // NUMERO WHATSAPP DEL PROPRIETARIO — sostituire con quello reale (formato internazionale senza +)
  var WHATSAPP_NUMBER = '59170067767';
  function waLink(msg){ return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg); }
  document.querySelectorAll('[data-wa]').forEach(function(a){ a.href = waLink(a.getAttribute('data-wa')); a.setAttribute('target','_blank'); a.setAttribute('rel','noopener'); });
  // Selettore lingua ES/EN/IT/PT via Google Translate (traduce tutta la pagina)
  function getLang(){
    var m = document.cookie.match(/(?:^|;)\s*googtrans=\/es\/(\w+)/);
    return m ? m[1] : 'es';
  }
  window.googleTranslateElementInit = function(){
    try { new google.translate.TranslateElement({ pageLanguage: 'es', autoDisplay: false }, 'google_translate_element'); } catch(e){}
  };
  (function(){
    var d = document.createElement('div');
    d.id = 'google_translate_element';
    d.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(d);
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  })();
  document.querySelectorAll('.lang-switch button').forEach(function(b){
    if (b.getAttribute('data-lang') === getLang()) {
      document.querySelectorAll('.lang-switch button').forEach(function(x){ x.classList.toggle('active', x === b); });
    }
    b.addEventListener('click', function(){
      var lang = b.getAttribute('data-lang');
      var host = location.hostname;
      var base = 'googtrans=/es/' + lang + '; path=/;';
      if (lang === 'es') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + host;
      } else {
        document.cookie = base;
        document.cookie = base + ' domain=' + host;
      }
      location.reload();
    });
  });

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Menú móvil
  var menu = document.querySelector('nav');
  var toggle = document.getElementById('menu-toggle');
  if (menu && toggle) {
    toggle.addEventListener('click', function(){
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      });
    });
  }

  // Activo automático según página (refuerzo)
  try {
    var page = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
    if (!page) page = 'index.html';
    document.querySelectorAll('nav a.nav-link').forEach(function(a){
      var href = a.getAttribute('href');
      if (href === page) a.classList.add('active');
      else if (page === '' && href === 'index.html') a.classList.add('active');
    });
  } catch(e){}

  // Slider hero (solo home)
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-photo'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.slide-dot'));
  if (slides.length && dots.length) {
    var idx = 0, timer = null;
    function setSlide(n){
      idx = (n + slides.length) % slides.length;
      slides.forEach(function(s,i){ s.classList.toggle('active', i===idx); });
      dots.forEach(function(d,i){
        d.classList.toggle('active', i===idx);
        d.setAttribute('aria-pressed', String(i===idx));
      });
    }
    dots.forEach(function(d){
      d.addEventListener('click', function(){
        setSlide(Number(d.dataset.slide)); if (timer) clearInterval(timer);
      });
    });
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = setInterval(function(){ if(!document.hidden) setSlide(idx+1); }, 6000);
    }
  }

  // Acordeón servicios (solo servicios.html)
  var headlines = ['La energía<br>también se escucha.','La luz cambia<br>todo.','Tu mensaje.<br>A otra escala.','El espacio para<br>tu gran momento.','Aquí empieza<br>el espectáculo.'];
  var images = ['assets/evento-2.jpg','assets/cliente-2.jpg','assets/stage.jpg','assets/cliente-1.jpg','assets/cliente-5.jpg'];
  var imageDescriptions = ['Consola de sonido profesional','Focos y haces de luz sobre un escenario','Pantallas LED en un escenario PSM','Tarimas y montaje del escenario','Escenario y estructura al aire libre'];
  var toggles = document.querySelectorAll('.service-toggle');
  if (toggles.length) {
    toggles.forEach(function(btn, i){
      btn.addEventListener('click', function(){
        document.querySelectorAll('.service').forEach(function(s, j){
          var active = i === j;
          s.classList.toggle('active', active);
          var b = s.querySelector('button'); if (b) b.setAttribute('aria-expanded', String(active));
          var ic = s.querySelector('.service-icon'); if (ic) ic.textContent = active ? '−' : '+';
          var det = s.querySelector('.service-detail'); if (det) det.hidden = !active;
        });
        var h = document.getElementById('service-headline'); if (h) h.innerHTML = headlines[i] || '';
        var n = document.getElementById('service-number'); if (n) n.textContent = '0'+(i+1)+' / 05';
        var img = document.getElementById('service-image'); if (img && images[i]) { img.src = images[i]; img.alt = imageDescriptions[i]; }
      });
    });
  }

  // Preselección tipo evento desde ?tipo= (eventos -> contacto)
  try {
    var params = new URLSearchParams(location.search);
    var tipo = params.get('tipo');
    if (tipo) {
      var map = { corporativo: 'Evento corporativo', concierto: 'Concierto', social: 'Evento social' };
      var name = map[tipo.toLowerCase()];
      if (name) selectEvent(name);
    }
  } catch(e){}

  function selectEvent(name){
    document.querySelectorAll('[data-choice]').forEach(function(b){
      var active = b.dataset.choice === name;
      b.classList.toggle('selected', active);
      b.setAttribute('aria-pressed', String(active));
    });
    updateQuote();
    var st = document.getElementById('copy-status'); if (st) st.textContent = '';
  }
  document.querySelectorAll('[data-choice]').forEach(function(b){
    b.addEventListener('click', function(){ selectEvent(b.dataset.choice); });
  });

  function updateQuote(){
    var prev = document.getElementById('message-preview');
    var wbtn = document.getElementById('whatsapp-btn');
    if (!prev || !wbtn) return;
    var choice = document.querySelector('[data-choice].selected');
    var name = choice ? choice.dataset.choice : 'Otro evento';
    var lines = ['Hola, PSM. Quiero pedir una cotización para ' + (name === 'Otro evento' ? 'un evento' : 'un ' + name.toLowerCase()) + ' en Bolivia.'];
    var date = document.getElementById('event-date');
    var city = document.getElementById('event-city');
    var guests = document.getElementById('event-guests');
    if (date && date.value) lines.push('Fecha: ' + date.value.split('-').reverse().join('/'));
    if (city && city.value.trim()) lines.push('Ciudad o lugar: ' + city.value.trim());
    if (guests && guests.value && guests.validity.valid) lines.push('Participantes: ' + guests.value);
    var services = Array.prototype.map.call(document.querySelectorAll('.quote-services input:checked'), function(input){ return input.value; });
    if (services.length) lines.push('Servicios: ' + services.join(', '));
    var message = lines.join('\n');
    prev.textContent = message;
    wbtn.href = waLink(message);
  }
  var quoteDetails = document.getElementById('quote-details');
  if (quoteDetails) {
    quoteDetails.addEventListener('input', updateQuote);
    quoteDetails.addEventListener('change', updateQuote);
    updateQuote();
  }

  var copyBtn = document.getElementById('copy-message');
  if (copyBtn) {
    copyBtn.addEventListener('click', async function(){
      var text = document.getElementById('message-preview').textContent;
      var st = document.getElementById('copy-status');
      try { await navigator.clipboard.writeText(text); st.textContent = 'Mensaje copiado. Pégalo en la conversación de Facebook.'; }
      catch(e){ st.textContent = 'Selecciona el mensaje de arriba y cópialo para enviarlo por Facebook.'; }
    });
  }

  // Lightbox (home + galería)
  var modal = document.getElementById('lightbox');
  if (modal) {
    document.querySelectorAll('[data-photo]').forEach(function(b){
      b.addEventListener('click', function(){
        modal.querySelector('img').src = b.dataset.photo;
        modal.querySelector('img').alt = b.dataset.caption || 'Foto PSM';
        modal.querySelector('p').textContent = b.dataset.caption || '';
        if (modal.showModal) modal.showModal();
      });
    });
    var c = modal.querySelector('.close');
    if (c) c.addEventListener('click', function(){ modal.close(); });
    modal.addEventListener('click', function(e){
      if (e.target === modal) modal.close();
    });
  }

  // Filtri galleria (solo galeria.html)
  var filters = document.querySelectorAll('.filter-bar button');
  if (filters.length) {
    filters.forEach(function(f){
      f.addEventListener('click', function(){
        filters.forEach(function(x){ x.classList.toggle('active', x === f); });
        var cat = f.getAttribute('data-filter');
        document.querySelectorAll('.gallery-item').forEach(function(it){
          var show = cat === 'todas' || it.getAttribute('data-cat') === cat;
          it.classList.toggle('hide', !show);
        });
      });
    });
  }

  var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)');
  function syncMotion(){
    document.documentElement.classList.toggle('motion-ok', !reducedMotion.matches);
    if (reducedMotion.matches) {
      document.querySelectorAll('.hero,.gallery-item,.tilt-card').forEach(function(el){
        ['--parallax-y','--beam-shift','--tilt-x','--tilt-y'].forEach(function(prop){ el.style.removeProperty(prop); });
      });
    }
  }
  syncMotion();
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', syncMotion);

  // Motion runs only while its section is visible.
  if ('IntersectionObserver' in window) {
    var effectsObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ entry.target.classList.toggle('effects-in-view', entry.isIntersecting); });
    });
    document.querySelectorAll('.hero,.stage-preview').forEach(function(el){ effectsObserver.observe(el); });
  } else document.querySelectorAll('.hero,.stage-preview').forEach(function(el){ el.classList.add('effects-in-view'); });

  var hero = document.querySelector('.hero');
  // Gentle depth in the hero and gallery photographs, desktop only.
  var depthPhotos = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var depthFrame = 0;
  function updateDepth(){
    depthFrame = 0;
    if (reducedMotion.matches || !finePointer.matches) return;
    depthPhotos.forEach(function(el){
      var rect = el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        var offset = Math.max(-12, Math.min(12, (innerHeight / 2 - rect.top - rect.height / 2) * .035));
        el.style.setProperty('--parallax-y', offset.toFixed(2) + 'px');
      }
    });
  }
  function scheduleDepth(){ if (!depthFrame) depthFrame = requestAnimationFrame(updateDepth); }
  addEventListener('scroll', scheduleDepth, { passive: true });
  addEventListener('resize', function(){
    if (!finePointer.matches) document.querySelectorAll('.hero,.gallery-item,.tilt-card').forEach(function(el){
      ['--parallax-y','--beam-shift','--tilt-x','--tilt-y'].forEach(function(prop){ el.style.removeProperty(prop); });
    });
    scheduleDepth();
  }, { passive: true });
  scheduleDepth();

  document.querySelectorAll('.event-card,.pro-card,.video-card').forEach(function(card){
    card.classList.add('tilt-card');
    var tiltFrame = 0;
    card.addEventListener('pointermove', function(event){
      if (reducedMotion.matches || !finePointer.matches) return;
      var rect = card.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width;
      var y = (event.clientY - rect.top) / rect.height;
      cancelAnimationFrame(tiltFrame);
      tiltFrame = requestAnimationFrame(function(){
        card.style.setProperty('--tilt-x', ((.5 - y) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--tilt-y', ((x - .5) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--glow-x', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--glow-y', (y * 100).toFixed(1) + '%');
      });
    });
    card.addEventListener('pointerleave', function(){
      cancelAnimationFrame(tiltFrame);
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });

  var stopStageSound = function(){ if (window.psmStage) window.psmStage.stopSound(); };

  // Shared cinema dialog; the same video returns to its card after closing.
  var cinema = null, cinemaVideo = null, cinemaFrame = null, cinemaTrigger = null;
  if (document.querySelector('.video-card') && typeof HTMLDialogElement !== 'undefined') {
    cinema = document.createElement('dialog');
    cinema.className = 'cinema-dialog';
    cinema.setAttribute('aria-labelledby', 'cinema-title');
    cinema.innerHTML = '<div class="cinema-top"><div><span class="eyebrow">PSM EN VIVO</span><h2 id="cinema-title"></h2></div><button type="button" class="cinema-close" aria-label="Cerrar video">✕</button></div><div class="cinema-screen"></div>';
    document.body.appendChild(cinema);
    cinema.querySelector('.cinema-close').addEventListener('click', function(){ cinema.close(); });
    cinema.addEventListener('click', function(event){ if (event.target === cinema) cinema.close(); });
    cinema.addEventListener('close', function(){
      if (cinemaVideo) { cinemaVideo.pause(); cinemaVideo.hidden = true; cinemaFrame.insertBefore(cinemaVideo, cinemaFrame.firstChild); }
      document.body.classList.remove('cinema-open');
      if (cinemaTrigger) cinemaTrigger.focus({ preventScroll: true });
      cinemaVideo = null;
    });
  }

  // Cover first; native controls become visible when the visitor starts the video.
  document.querySelectorAll('.video-card').forEach(function(card){
    var video = card.querySelector('video');
    var frame = card.querySelector('.video-frame');
    var title = card.querySelector('h3');
    if (!video || !frame || !title) return;
    var cover = document.createElement('button');
    cover.type = 'button';
    cover.className = 'video-cover';
    cover.setAttribute('aria-label', 'Reproducir video: ' + title.textContent);
    var poster = document.createElement('img');
    poster.src = video.poster;
    poster.alt = '';
    poster.loading = 'lazy';
    var play = document.createElement('span');
    play.className = 'video-play';
    play.setAttribute('aria-hidden', 'true');
    play.textContent = '▶';
    var caption = document.createElement('span');
    caption.className = 'video-cover-caption';
    caption.textContent = 'VER VIDEO · ' + title.textContent;
    cover.appendChild(poster);
    cover.appendChild(play);
    cover.appendChild(caption);
    frame.appendChild(cover);
    video.hidden = true;
    cover.addEventListener('click', function(){
      stopStageSound();
      document.querySelectorAll('.video-card video').forEach(function(other){ if (other !== video) other.pause(); });
      video.hidden = false;
      if (cinema && cinema.showModal) {
        cinemaVideo = video;
        cinemaFrame = frame;
        cinemaTrigger = cover;
        cinema.querySelector('#cinema-title').textContent = title.textContent;
        cinema.querySelector('.cinema-screen').appendChild(video);
        cinema.showModal();
        document.body.classList.add('cinema-open');
      } else {
        cover.hidden = true;
        video.focus();
      }
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function(){ /* Native controls remain available to retry. */ });
    });
  });

  // Reveal on scroll
  var rev = document.querySelectorAll('.reveal');
  if (rev.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: .12 });
    rev.forEach(function(el){ io.observe(el); });
  } else {
    rev.forEach(function(el){ el.classList.add('visible'); });
  }
})();
