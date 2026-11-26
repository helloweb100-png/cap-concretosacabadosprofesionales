/* =========================================================
   CAP · Concretos y Acabados Profesionales — script.js
   Vanilla JS. anime.js 3.2.2 es opcional (solo contador de Facebook).
   ========================================================= */

/* Único lugar con el número de WhatsApp (formato wa.me/52XXXXXXXXXX). */
const WHATSAPP_NUMERO = "524521332326";

(function () {
  'use strict';
  const root = document.documentElement;
  root.dataset.ready = '1';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const mqDesk = window.matchMedia('(min-width: 768px)');
  const mqWide = window.matchMedia('(min-width: 1024px)');
  let vw = innerWidth, vh = innerHeight;

  /* ---------- WhatsApp ---------- */
  const waUrl = (msg) => 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(msg);
  function setWA(el) {
    el.href = waUrl(el.dataset.msg || 'Hola CAP, vengo de su página web y quiero cotizar.');
    el.target = '_blank'; el.rel = 'noopener';
  }
  if (!WHATSAPP_NUMERO) {
    root.classList.add('wa-off');
    $$('[data-wa]').forEach(e => e.style.display = 'none');
    const wrap = $('#wa-wrap'); if (wrap) wrap.style.display = 'none';
    const send = $('#f-send'); if (send) send.style.display = 'none';
  } else {
    $$('[data-wa]').forEach(setWA);
  }

  /* ---------- Cargador ---------- */
  const loader = $('#loader');
  const ldCount = $('#ld-count');
  const at = (ms, fn) => setTimeout(fn, Math.max(0, ms - performance.now()));
  if (loader) {
    if (!reduce) {
      const start = performance.now();
      (function tick(now) {
        const p = clamp((now - start) / 1700);
        ldCount.textContent = String(Math.round(p * 100)).padStart(3, '0');
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    } else { ldCount.textContent = '100'; }
    at(reduce ? 400 : 1750, () => loader.classList.add('out'));
    at(reduce ? 500 : 1950, () => root.classList.add('hero-in', 'loaded'));
    at(reduce ? 800 : 2300, () => loader.classList.add('gone'));
  } else { root.classList.add('hero-in'); }

  /* ---------- Partición de textos ---------- */
  $$('[data-split]').forEach(el => {
    const txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.textContent = '';
    let i = 0;
    txt.split(' ').forEach((word, wi, arr) => {
      const w = document.createElement('span'); w.className = 'wd'; w.setAttribute('aria-hidden', 'true');
      Array.from(word).forEach(c => {
        const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c; w.appendChild(s);
      });
      el.appendChild(w);
      if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Revelados: IO + respaldo por geometría ---------- */
  const REV = '.rv,.rv-clip,.dr,.eq-grid,.board,.split';
  const revealEls = $$(REV);
  const onReveal = (el) => {
    el.classList.add('in');
    if (el.id === 'board') rollDigits();
    if (el.matches('.ub-btns')) fbCount();
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { onReveal(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.05, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  }
  function revealByGeometry() {
    revealEls.forEach(el => {
      if (el.classList.contains('in')) return;
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh * 0.96 && r.right > 0 && r.left < vw * 0.96) onReveal(el);
    });
  }

  /* ---------- Cabecera, menú, progreso ---------- */
  const hdr = $('#hdr'), bar = $('#progress i');
  const menu = $('#menu'), menuBtn = $('#menu-btn');
  let lastY = scrollY;
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });
  const navLinks = $$('.nav a');
  const navSecs = navLinks.map(a => $(a.getAttribute('href')));

  /* ---------- Cursor ---------- */
  if (fine && !reduce) {
    const cur = $('#cursor'); let cx = -100, cy = -100, tx = -100, ty = -100;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', e => { cur.classList.toggle('big', !!(e.target.closest && e.target.closest('[data-cursor="ver"]'))); });
  }

  /* ---------- Hero: canvas de agregado ---------- */
  const hero = $('#inicio');
  const cv = $('#hero-canvas');
  let heroVisible = true;
  (function heroCanvas() {
    const ctx = cv.getContext('2d'); if (!ctx) return;
    let W = 0, H = 0, dpr = 1, parts = [], mx = -999, my = -999, running = false;
    const rnd = (a, b) => a + Math.random() * (b - a);
    function make(initial) {
      const t = Math.random();
      return {
        x: rnd(0, W + H * 0.3), y: initial ? rnd(0, H) : rnd(-40, -4), s: rnd(1, 4), vy: rnd(0.3, 1.4),
        rect: Math.random() < 0.45, c: t < 0.6 ? 'rgba(255,255,255,.55)' : t < 0.85 ? 'rgba(122,82,255,.7)' : 'rgba(232,81,42,.75)'
      };
    }
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = vw < 768 ? 70 : 150;
      parts = Array.from({ length: n }, () => make(true));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        if (!reduce) {
          p.y += p.vy; p.x -= 0.28 * p.vy;
          const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
          if (d < 120 && d > 0) { const f = (120 - d) / 120; p.x += dx / d * f * 3; p.y += dy / d * f * 3; }
          if (p.y > H + 6 || p.x < -10) { Object.assign(p, make(false)); }
        }
        ctx.fillStyle = p.c;
        if (p.rect) ctx.fillRect(p.x, p.y, p.s * 1.4, p.s); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s / 2, 0, 6.2832); ctx.fill(); }
      }
    }
    function loop() { if (!running) return; draw(); requestAnimationFrame(loop); }
    function go() { if (reduce) { draw(); return; } const should = heroVisible && !document.hidden; if (should && !running) { running = true; loop(); } else if (!should) running = false; }
    size();
    if (reduce) { draw(); } else {
      if ('IntersectionObserver' in window) new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; go(); }).observe(hero);
      document.addEventListener('visibilitychange', go);
      go();
    }
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); if (reduce) draw(); }, 200); });
    if (fine) hero.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true });
    hero.addEventListener('pointerleave', () => { mx = my = -999; });
  })();

  /* Inclinación 3D del marco del hero */
  (function tilt() {
    const fw = $('#hero-frame'); if (!fw || !fine || reduce) return;
    hero.addEventListener('pointermove', e => {
      if (!mqWide.matches) return;
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      fw.style.transform = 'rotateY(' + (nx * 12) + 'deg) rotateX(' + (-ny * 8) + 'deg)';
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { fw.style.transform = ''; });
  })();

  /* ---------- Elementos de los efectos de scroll ---------- */
  const mf = $('#manifiesto'), mfWords = $$('.w', mf), mfBadges = $('#mf-badges');
  const sv = $('#servicios'), svTrack = $('#sv-track'), svMarks = $$('#sv-bar i');
  let svMax = 0;
  const es = $('#estampado'), esClip = $('#es-clip'), esImg = $('#es-img'), esWord = $('#es-word'), esText = $('#es-text'), esThumb = $('#es-thumb'), esShade = $('.es-shade');
  const pr = $('#proceso'), slab = $('#slab'), layers = $$('.layer', slab), legend = $$('#slab-legend li'), steps = $$('.step'), prRight = $('#pr-steps'), prPath = $('#pr-path');
  const pqCards = $$('.pq-card');
  const ct = $('#contacto'), capFill = $('#cap-fill');
  const parallax = $$('img[data-speed]');
  let activeStep = -1;

  function layoutSv() {
    if (reduce || !mqDesk.matches) { sv.style.height = ''; svTrack.style.transform = ''; return; }
    svMax = Math.max(0, svTrack.scrollWidth - vw);
    sv.style.height = (svMax + vh) + 'px';
  }

  function frame() {
    ticking = false;
    const y = scrollY;
    /* progreso global */
    const docH = root.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (docH > 0 ? clamp(y / docH) : 0) + ')';
    /* cabecera */
    hdr.classList.toggle('solid', y > 40);
    if (!menu.classList.contains('open')) hdr.classList.toggle('hide', y > lastY + 4 && y > 240 ? true : (y < lastY - 4 ? false : hdr.classList.contains('hide')));
    lastY = y;
    /* enlace activo */
    navSecs.forEach((s, i) => { if (!s) return; const r = s.getBoundingClientRect(); navLinks[i].classList.toggle('act', r.top <= vh * .4 && r.bottom > vh * .4); });

    if (!reduce) {
      /* Manifiesto */
      let r = mf.getBoundingClientRect();
      let p = clamp(-r.top / (r.height - vh));
      const N = mfWords.length;
      mfWords.forEach((w, i) => w.classList.toggle('on', p * N * 1.15 > i));
      mfBadges.classList.toggle('show', p > .85);

      /* Servicios: pin horizontal */
      if (mqDesk.matches) {
        r = sv.getBoundingClientRect();
        p = clamp(-r.top / Math.max(1, r.height - vh));
        svTrack.style.transform = 'translate3d(' + (-p * svMax) + 'px,0,0)';
        svMarks.forEach((m, i) => m.classList.toggle('on', p >= i / (svMarks.length - 1) - 0.001 && (i === 0 ? r.top < vh * .8 : true)));
      } else {
        const sl = svTrack.scrollLeft, mx = Math.max(1, svTrack.scrollWidth - svTrack.clientWidth);
        svMarks.forEach((m, i) => m.classList.toggle('on', sl / mx >= i / (svMarks.length - 1) - 0.001));
      }

      /* Estampado: la foto se abre */
      r = es.getBoundingClientRect();
      p = clamp(-r.top / (r.height - vh));
      const q = clamp(p / .8), e = 1 - q, a = e * 18, sl2 = e * 8;
      esClip.style.clipPath = 'polygon(' + (a + sl2) + '% ' + a + '%,' + (100 - a) + '% ' + a + '%,' + (100 - a - sl2) + '% ' + (100 - a) + '%,' + a + '% ' + (100 - a) + '%)';
      esImg.style.transform = 'scale(' + (1.25 - .25 * q) + ')';
      esWord.style.opacity = String(1 - q);
      const t = clamp((p - .55) / .2);
      esText.style.opacity = String(t); esText.style.transform = 'translateY(' + ((1 - t) * 34) + 'px)';
      esShade.style.opacity = String(t);
      if (esThumb) { const t2 = clamp((p - .8) / .15); esThumb.style.opacity = String(t2); esThumb.firstElementChild.style.transform = 'translateY(' + (-(p - .8) * 160) + 'px)'; esThumb.style.transform = 'translateY(' + ((1 - t2) * 40) + 'px)'; }

      /* Parallax de galería */
      parallax.forEach(img => {
        const box = img.parentElement.getBoundingClientRect();
        if (box.bottom < -vh * .3 || box.top > vh * 1.3) return;
        const d = box.top + box.height / 2 - vh / 2, lim = box.height * .075;
        img.style.setProperty('--py', clamp(-d * parseFloat(img.dataset.speed), -lim, lim) + 'px');
      });

      /* Proceso: losa 3D */
      r = pr.getBoundingClientRect();
      const ex = clamp((vh - r.top) / (vh * 1.2));
      const ease = 1 - Math.pow(1 - ex, 3);
      slab.style.setProperty('--gap', (6 + (mqDesk.matches ? 64 : 34) * ease) + 'px');
      let best = -1, bd = 1e9;
      steps.forEach((s, i) => { const sr = s.getBoundingClientRect(); const c = Math.abs(sr.top + sr.height / 2 - vh * .55); if (sr.bottom > 0 && sr.top < vh && c < bd) { bd = c; best = i; } });
      if (best !== activeStep && best > -1) {
        activeStep = best;
        steps.forEach((s, i) => s.classList.toggle('on', i === best));
        const act = best === 3 ? [3, 4] : [best];
        layers.forEach((l, i) => { const on = act.includes(i); l.classList.toggle('on', on); l.style.setProperty('--lift', on ? '12px' : '0px'); });
        legend.forEach((li, i) => li.classList.toggle('on', act.includes(4 - i)));
      }
      const pr2 = prRight.getBoundingClientRect();
      prPath.classList.add('draw');
      prPath.style.strokeDashoffset = String(1 - clamp((vh * .6 - pr2.top) / pr2.height));

      /* Por qué CAP: tarjetas apiladas */
      pqCards.forEach((c, i) => {
        const next = pqCards[i + 1]; if (!next) return;
        const nt = next.getBoundingClientRect().top, st = 84 + i * 18, h = c.offsetHeight;
        const k = clamp(1 - (nt - st) / h);
        c.style.transform = 'scale(' + (1 - .06 * k) + ')';
        c.style.filter = 'brightness(' + (1 - .35 * k) + ')';
      });

      /* Contacto: relleno de CAP */
      r = ct.getBoundingClientRect();
      p = clamp((vh - r.top) / (vh + r.height * .3));
      capFill.style.clipPath = 'inset(' + ((1 - p) * 100) + '% 0 0 0)';
    }
  }
  let ticking = false;
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(() => { frame(); revealByGeometry(); }); } }
  addEventListener('scroll', request, { passive: true });
  svTrack.addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { vw = innerWidth; vh = innerHeight; layoutSv(); request(); });
  addEventListener('load', () => { layoutSv(); request(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layoutSv(); request(); });
  layoutSv(); frame(); revealByGeometry();
  setTimeout(() => { layoutSv(); frame(); revealByGeometry(); }, 2000);
  setTimeout(revealByGeometry, 3500);

  /* Inclinación de la losa con el puntero */
  if (fine && !reduce) {
    const stage = $('#slab-stage');
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      slab.style.setProperty('--tx', (-ny * 16) + 'deg'); slab.style.setProperty('--tz', (nx * 16) + 'deg');
    }, { passive: true });
    stage.addEventListener('pointerleave', () => { slab.style.setProperty('--tx', '0deg'); slab.style.setProperty('--tz', '0deg'); });
  }

  /* ---------- Galería + lightbox ---------- */
  const items = $$('.ob-item');
  const lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  let cur = 0, opener = null;
  function showLb(i) {
    cur = (i + items.length) % items.length;
    const img = $('img', items[cur]);
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    lbCap.textContent = ($('figcaption', items[cur]) || {}).textContent || '';
  }
  items.forEach((it, i) => $('button', it).addEventListener('click', e => {
    opener = e.currentTarget; showLb(i);
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
  }));
  const closeLb = () => { if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open'); if (opener) opener.focus(); };
  $('.lb-x').addEventListener('click', closeLb);
  $('.lb-p').addEventListener('click', () => showLb(cur - 1));
  $('.lb-n').addEventListener('click', () => showLb(cur + 1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'FIGURE') closeLb(); });
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') showLb(cur - 1); if (e.key === 'ArrowRight') showLb(cur + 1); });
  lb.addEventListener('close', () => { if (opener) opener.focus(); });

  /* ---------- Aditivos ---------- */
  const adBtns = $$('#ad-list button'), adBody = $('#ad-body');
  let adIdx = 0, adTimer = null;
  function adSet(i, user) {
    if (user) { clearInterval(adTimer); adTimer = null; }
    if (i === adIdx && !user) return;
    adIdx = i;
    adBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    const b = adBtns[i];
    adBody.classList.add('out');
    setTimeout(() => {
      $('#ad-name').textContent = b.dataset.t;
      $('#ad-desc').textContent = b.dataset.d;
      $('#ad-num').textContent = String(i + 1).padStart(2, '0');
      const br = $('#ad-brands'); br.textContent = '';
      b.dataset.b.split('·').forEach(s => { const sp = document.createElement('span'); sp.textContent = s.trim(); br.appendChild(sp); });
      const cta = $('#ad-cta'); cta.dataset.msg = 'Hola CAP, quiero información sobre ' + b.dataset.t + '.'; if (WHATSAPP_NUMERO) setWA(cta);
      adBody.classList.remove('out');
    }, reduce ? 0 : 260);
  }
  adBtns.forEach((b, i) => b.addEventListener('click', () => adSet(i, true)));
  if (!reduce) adTimer = setInterval(() => { if (!document.hidden) adSet((adIdx + 1) % adBtns.length, false); }, 5000);

  /* ---------- Equipo ---------- */
  const eqBtns = $$('.eq-t'), tray = $('#eq-tray');
  eqBtns.forEach(b => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    const sel = eqBtns.filter(x => x.getAttribute('aria-pressed') === 'true').map(x => x.dataset.name);
    tray.hidden = sel.length === 0;
    $('#eq-count').textContent = sel.length + (sel.length === 1 ? ' equipo' : ' equipos');
    const cta = $('#eq-cta'); cta.dataset.msg = 'Hola CAP, quiero cotizar este equipo: ' + sel.join(', ') + '.';
    if (WHATSAPP_NUMERO) setWA(cta);
  }));

  /* ---------- Horarios ---------- */
  (function hours() {
    let wd = 'Mon', h = 0, m = 0;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
        .formatToParts(new Date()).forEach(p => { if (p.type === 'weekday') wd = p.value; if (p.type === 'hour') h = parseInt(p.value, 10) % 24; if (p.type === 'minute') m = parseInt(p.value, 10); });
    } catch (e) { return; }
    const num = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[wd];
    const mins = h * 60 + m;
    const open = (num >= 1 && num <= 5 && mins >= 480 && mins < 1080) || (num === 6 && mins >= 480 && mins < 840);
    $('#open-badge').textContent = open ? 'Abierto ahora' : 'Cerrado ahora';
    $('#board').classList.toggle('closed', !open);
    $$('#board .row[data-days]').forEach(r => r.classList.toggle('today', r.dataset.days.split(',').map(Number).includes(num)));
  })();
  let rolled = false;
  function rollDigits() {
    if (rolled || reduce) return; rolled = true;
    $$('[data-roll]').forEach(el => {
      const fin = el.textContent, t0 = performance.now();
      (function step(now) {
        const p = clamp((now - t0) / 1000);
        let out = '', k = 0;
        for (const ch of fin) { if (/\d/.test(ch)) { out += (k / 4 < p * 1.3) ? ch : Math.floor(Math.random() * 10); k++; } else out += ch; }
        el.textContent = out;
        if (p < 1) setTimeout(() => step(performance.now()), 55); else el.textContent = fin;
      })(t0);
    });
  }
  let fbDone = false;
  function fbCount() {
    if (fbDone) return; fbDone = true;
    const el = $('#fb-n'); if (!el || reduce) return;
    if (window.anime) { const o = { v: 0 }; window.anime({ targets: o, v: 5, round: 1, duration: 1400, easing: 'easeOutExpo', update: () => { el.textContent = o.v; } }); }
    else { const t0 = performance.now(); (function s(n) { const p = clamp((n - t0) / 1200); el.textContent = Math.round(p * 5); if (p < 1) requestAnimationFrame(s); })(t0); }
  }
  const ubBtns = $('.ub-btns');
  if (ubBtns && 'IntersectionObserver' in window) { const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { fbCount(); o.disconnect(); } }); o.observe(ubBtns); }

  /* ---------- Formulario → WhatsApp ---------- */
  const form = $('#form');
  const fields = [['f-nombre', 'e-nombre', 'Escribe tu nombre.'], ['f-serv', 'e-serv', 'Elige qué necesitas.'], ['f-donde', 'e-donde', 'Dinos dónde es la obra.']];
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    let ok = true;
    fields.forEach(([id, eid, msg]) => {
      const f = $('#' + id), er = $('#' + eid), bad = !f.value.trim();
      f.closest('.fld').classList.toggle('bad', bad); f.setAttribute('aria-invalid', String(bad));
      er.textContent = bad ? msg : ''; if (bad) ok = false;
    });
    if (!ok) { const first = $('.fld.bad input,.fld.bad select', form); if (first) first.focus(); return; }
    if (!WHATSAPP_NUMERO) return;
    const nombre = $('#f-nombre').value.trim(), serv = $('#f-serv').value, donde = $('#f-donde').value.trim(), msg = $('#f-msg').value.trim();
    const text = 'Hola CAP, soy ' + nombre + '. Me interesa ' + serv + '. Mi obra está en ' + donde + '.' + (msg ? ' ' + msg : '');
    const url = waUrl(text);
    $('#f-back').href = url; $('#f-ok').hidden = false;
    window.open(url, '_blank', 'noopener');
  });
  fields.forEach(([id]) => $('#' + id).addEventListener('input', e => { const f = e.target; if (f.value.trim()) { f.closest('.fld').classList.remove('bad'); f.setAttribute('aria-invalid', 'false'); } }));

  /* ---------- Burbuja de WhatsApp (una sola vez) ---------- */
  const bubble = $('#wa-bubble');
  if (bubble && WHATSAPP_NUMERO) { setTimeout(() => { bubble.classList.add('show'); setTimeout(() => bubble.classList.remove('show'), 6000); }, 4000); }
})();
