// PSM multipagina — seguro en todas las páginas
(function(){
  document.documentElement.classList.add('js');
  // NUMERO WHATSAPP DEL PROPRIETARIO — sostituire con quello reale (formato internazionale senza +)
  var WHATSAPP_NUMBER = '59170067767';
  function waLink(msg){ return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg); }
  document.querySelectorAll('[data-wa]').forEach(function(a){ a.href = waLink(a.getAttribute('data-wa')); a.setAttribute('target','_blank'); a.setAttribute('rel','noopener'); });
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
      document.querySelectorAll('.video-card video').forEach(function(other){ if (other !== video) other.pause(); });
      cover.hidden = true;
      video.hidden = false;
      video.focus();
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
