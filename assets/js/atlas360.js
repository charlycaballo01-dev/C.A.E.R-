/* Atlas anatómico 360° · hero C.A.E.R.
   Cada modelo (4 capas × hombre/mujer) es un giro de 24 fotogramas renderizados desde modelos 3D reales (BodyParts3D),
   cada uno con su mapa de piezas por píxel: el hover sabe qué estructura hay debajo en cualquier ángulo.
   - Arrastrar: gira. Botones: girar y Frente/Espalda. Flechas ← →: girar. Enter: capa siguiente.
   - Clic (sin arrastrar) en el cuerpo: capa siguiente. Con el dedo: tocar muestra el nombre; deslizar gira.
   - Hover: la estructura se ilumina en dorado, el resto se oscurece y aparece su nombre con línea de referencia.
   - 5 s sin interacción: gira solo y se detiene adelante y atrás mostrando estructuras. */
(function () {
  const LAYERS = [['esqueleto', 'Esqueleto'], ['musculos', 'Músculos'], ['circulatorio', 'Circulatorio'], ['organos', 'Órganos']];
  const BASE = window.ATLAS_BASE || 'spin/', N = 24, FW = 720, FH = 1440, IW = 360, IH = 720, PX_PER_FRAME = 16;
  const host = document.getElementById('atlas'), tip = document.getElementById('atlasTip'), lead = document.getElementById('atlasLead');
  const cvs = [document.getElementById('atlasA'), document.getElementById('atlasB')], over = document.getElementById('atlasOver'), octx = over.getContext('2d');
  const tabs = [...document.querySelectorAll('[data-layer]')], sexBtns = [...document.querySelectorAll('[data-sex]')];
  const prog = document.getElementById('atlasProg'), sideLbl = document.getElementById('atlasSide');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sex = 'm', li = 0, fi = 0, frontC = 0, active = 0, t = 0, lastInput = -99;
  const views = {};                                    // key → {data, imgs[], ids[]}
  const key = () => `${LAYERS[li][0]}-${sex}`;
  const nn = f => String(f).padStart(2, '0');
  const hl = document.createElement('canvas'); hl.width = IW; hl.height = IH; const hctx = hl.getContext('2d');

  function view(k) {
    if (views[k]) return views[k];
    const v = views[k] = { imgs: new Array(N), ids: new Array(N), loaded: 0 };
    v.ready = fetch(BASE + k + '/data.json').then(r => r.json()).then(d => { v.data = d; });
    v.img = f => v.imgs[f] || (v.imgs[f] = new Promise(res => { const im = new Image(); im.decoding = 'async'; im.onload = () => { v.loaded++; res(im); }; im.onerror = () => res(null); im.src = `${BASE}${k}/${nn(f)}.webp`; }));
    v.id = f => v.ids[f] || (v.ids[f] = new Promise(res => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = IW; c.height = IH; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, IW, IH).data, p = new Uint16Array(IW * IH); for (let i = 0, j = 0; i < p.length; i++, j += 4) p[i] = (d[j] << 8) | d[j + 1]; res(p); }; im.onerror = () => res(null); im.src = `${BASE}${k}/${nn(f)}-id.png`; }));
    return v;
  }
  function preload(k) {                                 // del frente hacia atrás, alternando lados
    const v = view(k), order = [0]; for (let s = 1; s <= N / 2; s++) { order.push(s % N); if (N - s !== s) order.push(N - s); }
    order.forEach(f => v.img(f).then(() => { if (k === key()) prog.textContent = v.loaded < N ? `Cargando giro… ${Math.round(v.loaded / N * 100)} %` : ''; }));
  }
  function geom() { const r = host.getBoundingClientRect(), s = Math.min(r.width / FW, r.height / FH), nar = r.width < 420; return { r, s, ox: (r.width - FW * s) * (nar ? 0.5 : 0.22), oy: (r.height - FH * s) / 2, nar }; }
  function fit(c) { const g = geom(), dpr = Math.min(devicePixelRatio || 1, 2); const w = Math.round(g.r.width * dpr), h = Math.round(g.r.height * dpr); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; c.style.width = g.r.width + 'px'; c.style.height = g.r.height + 'px'; } const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return [x, g]; }

  let drawTok = 0;
  async function draw(crossfade = false) {
    const tok = ++drawTok, k = key(), v = view(k);
    let im = await v.img(fi);
    if (tok !== drawTok) return;
    if (!im) return;
    const target = crossfade && !reduce ? 1 - frontC : frontC;
    const [x, g] = fit(cvs[target]); x.clearRect(0, 0, g.r.width, g.r.height); x.drawImage(im, g.ox, g.oy, FW * g.s, FH * g.s);
    if (target !== frontC) { cvs[target].classList.add('show'); cvs[frontC].classList.remove('show'); frontC = target; }
    else cvs.forEach((c, i) => c.classList.toggle('show', i === frontC));
    const deg = Math.round(fi * 360 / N); sideLbl.textContent = fi === 0 ? 'Vista anterior' : fi === N / 2 ? 'Vista posterior' : (fi < N / 2 ? `Girado ${deg}°` : `Girado ${360 - deg}°`);
  }
  function setFrame(f) { fi = ((f % N) + N) % N; hide(); return draw(); }
  async function setLayer(i) { li = (i + LAYERS.length) % LAYERS.length; hide(); await view(key()).ready; preload(key()); await draw(true); syncUI(); }
  async function setSex(s) { if (s === sex) return; sex = s; hide(); await view(key()).ready; preload(key()); await draw(true); syncUI(); }
  function syncUI() {
    tabs.forEach((b, i) => b.setAttribute('aria-pressed', String(i === li)));
    sexBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sex === sex)));
    document.getElementById('atlasStatus').textContent = `Capa: ${LAYERS[li][1]} · ${sex === 'm' ? 'Hombre' : 'Mujer'}`;
  }
  // giro animado hasta un fotograma (por el camino más corto)
  let spinTok = 0;
  async function spinTo(target, stepMs = 45) {
    const tok = ++spinTok; let d = ((target - fi) % N + N) % N; if (d > N / 2) d -= N;
    const dir = Math.sign(d);
    for (let s = 0; s < Math.abs(d); s++) { if (tok !== spinTok) return; fi = (fi + dir + N) % N; await draw(); await new Promise(r => setTimeout(r, stepMs)); }
  }

  // ---------- hover ----------
  async function pidAt(cx, cy) { const g = geom(), x = (cx - g.r.left - g.ox) / (g.s * 2), y = (cy - g.r.top - g.oy) / (g.s * 2); if (x < 0 || y < 0 || x >= IW || y >= IH) return 0; const p = await view(key()).id(fi); return p ? p[Math.floor(y) * IW + Math.floor(x)] : 0; }
  async function show(pid) {
    const k = key(), v = view(k); await v.ready; const info = v.data.names[pid], pt = v.data.frames[fi][pid];
    if (!info || !pt) return hide();
    const map = await v.id(fi); if (!map) return;
    if (active !== pid + ':' + fi + k) {
      active = pid + ':' + fi + k;
      const img = hctx.createImageData(IW, IH), d = img.data;
      for (let i = 0, o = 0; i < map.length; i++, o += 4) { const p = map[i]; if (p === pid) { d[o] = 240; d[o + 1] = 192; d[o + 2] = 64; d[o + 3] = 135; } else if (p) { d[o] = 2; d[o + 1] = 14; d[o + 2] = 8; d[o + 3] = 80; } }
      hctx.putImageData(img, 0, 0);
      tip.querySelector('.n').textContent = info.n; tip.querySelector('.t').textContent = info.t; tip.querySelector('.i').textContent = info.i;
    }
    const [x, g] = fit(over); x.clearRect(0, 0, g.r.width, g.r.height); x.imageSmoothingEnabled = true; x.drawImage(hl, g.ox, g.oy, FW * g.s, FH * g.s);
    const px = g.ox + pt[0] * FW * g.s, py = g.oy + pt[1] * FH * g.s, ax = g.ox + FW * g.s * 0.93, ay = Math.max(40, Math.min(g.r.height - 40, py));
    lead.setAttribute('viewBox', `0 0 ${g.r.width} ${g.r.height}`);
    lead.innerHTML = g.nar ? `<circle cx="${px}" cy="${py}" r="4"/>` : `<polyline points="${px},${py} ${ax - 18},${ay} ${ax},${ay}"/><circle cx="${px}" cy="${py}" r="4"/><circle cx="${ax}" cy="${ay}" r="2.6"/>`;
    lead.classList.add('on'); tip.style.setProperty('--x', ax + 'px'); tip.style.setProperty('--y', ay + 'px');
    tip.classList.toggle('narrow', g.nar); tip.classList.add('on'); over.classList.add('on');
  }
  function hide() { active = 0; tip.classList.remove('on'); lead.classList.remove('on'); over.classList.remove('on'); }
  async function pointer(cx, cy) { lastInput = t; const p = await pidAt(cx, cy); p ? show(p) : hide(); }

  // ---------- arrastre / clic ----------
  let drag = null;
  host.addEventListener('pointerdown', e => { lastInput = t; spinTok++; drag = { x: e.clientX, f: fi, moved: false, id: e.pointerId, type: e.pointerType }; host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', e => {
    if (window.__sim) return;
    if (drag && drag.id === e.pointerId) {
      const dx = e.clientX - drag.x; if (Math.abs(dx) > 6) drag.moved = true;
      if (drag.moved) { hide(); host.classList.add('dragging'); const f = drag.f - Math.round(dx / PX_PER_FRAME); if (((f % N) + N) % N !== fi) setFrame(f); return; }
    }
    if (e.pointerType === 'mouse' && !drag) pointer(e.clientX, e.clientY);
  });
  host.addEventListener('pointerup', async e => {
    if (!drag || drag.id !== e.pointerId) return; const d = drag; drag = null; host.classList.remove('dragging'); lastInput = t;
    if (d.moved) { if (d.type === 'mouse') pointer(e.clientX, e.clientY); return; }
    const p = await pidAt(e.clientX, e.clientY); if (!p) return;
    if (d.type === 'touch' || d.type === 'pen') return pointer(e.clientX, e.clientY);
    await setLayer(li + 1); pointer(e.clientX, e.clientY);
  });
  host.addEventListener('pointerleave', () => { if (!drag) hide(); });
  host.addEventListener('keydown', e => {
    lastInput = t;
    if (e.key === 'ArrowRight') { e.preventDefault(); spinTok++; setFrame(fi + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); spinTok++; setFrame(fi - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLayer(li + 1); }
  });
  document.getElementById('rotL').addEventListener('click', () => { lastInput = t; spinTo(fi - 3); });
  document.getElementById('rotR').addEventListener('click', () => { lastInput = t; spinTo(fi + 3); });
  document.getElementById('rotFB').addEventListener('click', () => { lastInput = t; spinTo(fi < N / 4 || fi > N * 3 / 4 ? N / 2 : 0); });
  tabs.forEach((b, i) => b.addEventListener('click', () => { lastInput = t; setLayer(i); }));
  sexBtns.forEach(b => b.addEventListener('click', () => { lastInput = t; setSex(b.dataset.sex); }));
  addEventListener('resize', () => { draw(); if (active) { const a = String(active).split(':')[0]; active = 0; show(+a); } });

  // ---------- inactividad: gira solo; frena adelante y atrás para mostrar estructuras ----------
  let idleNext = 0, idleHold = 0, turns = 0, tourK = 0, busy = false;
  async function tick(dt) {
    t += dt;
    if (reduce || busy || drag || t - lastInput < 5) return;
    if (t < idleNext) return;
    busy = true;
    try {
      if ((fi === 0 || fi === N / 2) && idleHold < 2) {          // pausa: mostrar 2 estructuras visibles de este lado
        const v = view(key()); await v.ready; const vis = v.data.tour.filter(p => v.data.frames[fi][p] && v.data.frames[fi][p][2] > 150);
        if (vis.length) { await show(vis[(tourK++) % vis.length]); idleHold++; idleNext = t + 2.0; return; }
      }
      if (idleHold) { hide(); }
      idleHold = 0; fi = (fi + 1) % N; await draw(); idleNext = t + 0.16;
      if (fi === 0 && ++turns % 1 === 0) { await setLayer(li + 1); }
    } finally { busy = false; }
  }
  window.__atlasTick = tick; window.__atlasPointer = pointer; window.__atlasSex = setSex; window.__atlasLayer = setLayer; window.__atlasFrame = setFrame; window.__atlasSpinTo = spinTo;
  window.__atlasClick = async (x, y) => { lastInput = t; const p = await pidAt(x, y); if (p) { await setLayer(li + 1); pointer(x, y); } };
  window.__atlasFind = async (prefix) => { const v = view(key()); await v.ready; const g = geom(); let best = null; for (const [pid, pt] of Object.entries(v.data.frames[fi])) { const n = v.data.names[pid]; if (n && n.n.startsWith(prefix) && (!best || pt[2] > best[2])) best = pt; } return best ? [g.r.left + g.ox + best[0] * FW * g.s, g.r.top + g.oy + best[1] * FH * g.s] : null; };
  window.__atlasBtn = id => { const r = document.getElementById(id).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; };
  window.__atlasSexBtns = () => sexBtns.map(b => { const r = b.getBoundingClientRect(); return [b.dataset.sex, r.x + r.width / 2, r.y + r.height / 2]; });
  window.__atlasLoaded = () => view(key()).loaded;
  (async () => {
    await view(key()).ready; preload(key()); await draw(); syncUI();
    // precarga liviana del frente de las otras vistas
    setTimeout(() => LAYERS.forEach(([l]) => ['m', 'f'].forEach(s => { const k = `${l}-${s}`; if (k !== key()) view(k).img(0); })), 800);
    if (!window.__sim) { let last = performance.now(); const loop = ms => { tick(Math.min(.1, (ms - last) / 1000)); last = ms; requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    window.__ready = true;
  })();
})();
