// @ts-nocheck
/* STRATO · modelos 3D procedurais (unidades em cm), desenho próprio.
   Os mesmos modelos servem para os renders do catálogo, os ficheiros STL e o visualizador da loja. */
import * as THREE from 'three';

let cache = null;
export function getStrato3D() {
  if (cache) return cache;
  const T = THREE;
  if (T.ColorManagement) T.ColorManagement.legacyMode = false;

  // ---------- texturas ----------
  function layerTexture() {
    const c = document.createElement('canvas'); c.width = 4; c.height = 32;
    const g = c.getContext('2d');
    for (let y = 0; y < 32; y++) { const v = 128 + Math.round(70 * Math.sin((y / 32) * Math.PI * 2)); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(0, y, 4, 1); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1, 18); return t;
  }
  function marbleTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    g.fillStyle = '#ece8e1'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = `rgba(60,58,55,${0.08 + Math.random() * 0.25})`; g.lineWidth = 0.6 + Math.random() * 2.4;
      g.beginPath(); let x = Math.random() * 512, y = 0; g.moveTo(x, y);
      while (y < 512) { x += (Math.random() - 0.5) * 40; y += 12 + Math.random() * 20; g.lineTo(x, y); } g.stroke();
    }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(0.08, 0.08); return t;
  }
  function woodTexture() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#c9a77a'; g.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * 256; g.strokeStyle = `rgba(${110 + Math.random() * 30},${70 + Math.random() * 20},40,${0.12 + Math.random() * 0.2})`;
      g.lineWidth = 0.5 + Math.random() * 2; g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x / 90 + i) * 3); g.stroke();
    }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
  }
  let _layer, _marble, _wood;
  const layer = () => (_layer = _layer || layerTexture());

  // ---------- cores (filamentos) ----------
  const CORES = {
    grafite: { hex: '#1a1a1c', extra: 0 },
    gesso: { hex: '#ebe7df', extra: 0 },
    betao: { hex: '#8c8b86', extra: 0 },
    areia: { hex: '#cfb994', extra: 0 },
    salvia: { hex: '#8ea489', extra: 0 },
    terracota: { hex: '#b8684a', extra: 0 },
    ouro: { hex: '#b8913f', extra: 3, seda: true },
    marmore: { hex: '#ece8e1', extra: 3, marmore: true },
  };

  function printMat(cor) {
    const c = CORES[cor] || CORES.grafite;
    const m = new T.MeshStandardMaterial({ color: c.hex, roughness: c.seda ? 0.32 : 0.85, metalness: c.seda ? 0.45 : 0.0, bumpMap: layer(), bumpScale: 0.012 });
    if (c.marmore) { m.map = (_marble = _marble || marbleTexture()); m.map.encoding = T.sRGBEncoding; m.color.set('#ffffff'); }
    m.userData.print = true; return m;
  }
  const darkMat = () => new T.MeshStandardMaterial({ color: '#141414', roughness: 0.5 });
  const metalMat = () => new T.MeshStandardMaterial({ color: '#9a9ea3', roughness: 0.3, metalness: 0.9 });
  const woodMat = () => { const t = (_wood = _wood || woodTexture()); t.encoding = T.sRGBEncoding; return new T.MeshStandardMaterial({ map: t, roughness: 0.7 }); };
  const rubberMat = () => new T.MeshStandardMaterial({ color: '#1d1d1d', roughness: 0.95 });

  // ---------- geometria ----------
  function roundedRectShape(w, h, r) {
    r = Math.min(r, w / 2, h / 2); const s = new T.Shape(); const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function extrude(shape, depth, bevel = 0.12) {
    const g = new T.ExtrudeGeometry(shape, { depth: Math.max(0.01, depth - 2 * bevel), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 24 });
    g.translate(0, 0, -(depth - 2 * bevel) / 2); g.computeVertexNormals(); return g;
  }
  function rbox(w, h, d, mat, r = 0.25) { return new T.Mesh(extrude(roundedRectShape(w - 0.24, h - 0.24, r), d), mat); }
  function halfRing(rOut, rIn, depth, mat) {
    const s = new T.Shape(); s.absarc(0, 0, rOut, Math.PI, Math.PI * 2, false); s.absarc(0, 0, rIn, Math.PI * 2, Math.PI, true); s.closePath();
    return new T.Mesh(extrude(s, depth, 0.15), mat);
  }
  function polyShape(pts) { const s = new T.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; }
  const at = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };

  // cradle de auscultadores: braço + meia-argola + lábio, curva para -x
  function cradle(mat, depth, armLen) {
    const g = new T.Group();
    g.add(at(rbox(0.9, armLen, depth, mat), 0, -armLen / 2, 0));
    g.add(at(halfRing(2.7, 1.85, depth, mat), -2.27, -armLen, 0));
    g.add(at(rbox(0.9, 1.6, depth, mat), -4.55, -armLen + 0.55, 0));
    return g;
  }

  const B = {};

  B['gancho-grampo'] = (m, o = {}) => {
    const g = new T.Group(); const esp = Math.max(1.2, Math.min(4.5, +o.espessura || 2.5)); const gap = esp + 0.5;
    const topY = 4.0, botY = topY - 0.9 - gap; const spH = topY - botY + 0.9;
    g.add(at(rbox(0.9, spH, 3.2, m), 0, (topY + botY) / 2, 0));
    g.add(at(rbox(6.2, 0.9, 3.2, m), 2.65, topY, 0));
    g.add(at(rbox(4.6, 0.9, 3.2, m), 1.85, botY, 0));
    const scr = new T.Mesh(new T.CylinderGeometry(0.35, 0.35, gap + 1.4, 20), metalMat()); g.add(at(scr, 3.2, botY + (gap) / 2 - 0.2, 0));
    const knob = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 0.8, 8), m); g.add(at(knob, 3.2, botY - 0.9, 0));
    const pad = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 0.25, 24), rubberMat()); g.add(at(pad, 3.2, botY + gap * 0.55, 0));
    const c = cradle(m, 3.2, 5.2); c.position.set(0, botY, 0); g.add(c);
    if (o.texto) gravar(g, o.texto, 2.9, 0.62, -2.27, botY - 5.2 - 2.27, 1.63, 0, 0, 0, o.corTexto);
    return g;
  };

  B['gancho-duplo'] = (m) => {
    const g = new T.Group();
    g.add(at(rbox(12, 0.7, 5, m), 0, 0, 0));
    for (const x of [-3.2, 3.2]) {
      const hole = new T.Mesh(new T.CylinderGeometry(0.32, 0.18, 0.75, 16), darkMat()); g.add(at(hole, x, 0.02, -1.2));
      const c = cradle(m, 3.4, 4.2); c.position.set(x, -0.2, 1.0); c.rotation.y = -Math.PI / 2; g.add(c);
    }
    return g;
  };

  B['base-auscultadores'] = (m, o = {}) => {
    const g = new T.Group();
    const base = new T.Mesh(extrude(roundedRectShape(11, 11, 5.4), 1.4, 0.3), m); g.add(at(base, 0, 0.7, 0, -Math.PI / 2));
    const pole = new T.Mesh(new T.CylinderGeometry(0.85, 1.1, 21, 6), m); g.add(at(pole, 0, 11.5, 0, 0, Math.PI / 6));
    if (o.texto) gravar(g, o.texto, 15, 0.95, 0, 12, 0.9, -0.012, 0, Math.PI / 2, o.corTexto);
    g.add(at(rbox(2.6, 1.3, 12, m, 0.6), 0, 22.4, 0));
    for (const z of [-5.6, 5.6]) g.add(at(rbox(2.6, 1.8, 0.9, m, 0.4), 0, 23.2, z));
    g.add(at(rbox(1.8, 2.2, 3.2, m, 0.5), 0, 21.2, 0));
    const ring = new T.Mesh(new T.TorusGeometry(1.25, 0.18, 10, 32), darkMat()); g.add(at(ring, 0, 4.2, 0, Math.PI / 2));
    return g;
  };

  B['prateleira-monitor'] = (m, o = {}) => {
    const g = new T.Group(); const L = Math.max(40, Math.min(100, +o.largura || 54));
    const leg = polyShape([[-4, 0], [4, 0], [3, 8.4], [-3, 8.4]]);
    for (const x of [-(L / 2 - 5), L / 2 - 5]) {
      const l = new T.Mesh(extrude(leg, 23, 0.35), m); g.add(at(l, x, 0, 0));
      const notch = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 0.2, 24), darkMat()); g.add(at(notch, x, 4.2, 11.6, Math.PI / 2));
    }
    const top = new T.Mesh(new T.BoxGeometry(L, 1.8, 25), woodMat()); g.add(at(top, 0, 9.3, 0));
    if (o.texto) gravar(g, o.texto, 14, 1.2, 0, 9.3, 12.53, 0, 0, 0, o.corTexto || '#3a2a18');
    return g;
  };

  B['stand-portatil'] = (m) => {
    const g = new T.Group();
    g.add(at(rbox(14, 1.4, 8, m, 0.6), 0, 0.7, 0));
    for (const x of [-3.1, -0.4, 3.0]) {
      const fin = new T.Mesh(extrude(polyShape([[-3.6, 0], [3.6, 0], [2.6, 6.2], [-2.0, 6.2]]), 1.1, 0.3), m);
      g.add(at(fin, x, 1.3, 0, 0, Math.PI / 2));
    }
    for (const x of [-1.75, 1.3]) { const pad = new T.Mesh(new T.BoxGeometry(1.5, 0.1, 6.2), rubberMat()); g.add(at(pad, x, 1.42, 0)); }
    return g;
  };

  B['suporte-telemovel'] = (m, o = {}) => {
    const g = new T.Group();
    const prof = polyShape([[0, 0], [9.4, 0], [9.4, 1.9], [8.5, 1.9], [8.5, 0.9], [6.7, 0.9], [2.3, 11], [1.3, 10.6], [5.3, 0.9], [0, 0.9]]);
    const body = new T.Mesh(extrude(prof, 7.6, 0.18), m); g.add(at(body, -4.7, 0, 0));
    const strut = new T.Mesh(extrude(polyShape([[0.4, 0.9], [3.2, 0.9], [2.4, 6.4], [1.5, 6.4]]), 1.2, 0.15), m); g.add(at(strut, -4.7, 0, 0));
    const hole = new T.Mesh(new T.CylinderGeometry(0.75, 0.75, 1.4, 24), darkMat()); g.add(at(hole, 2.85, 0.9, 0, 0, 0, Math.PI / 2));
    if (o.texto) gravar(g, o.texto, 6.8, 1.3, 4.91, 0.95, 0, 0, Math.PI / 2, 0, o.corTexto);
    return g;
  };

  B['clips-cabo'] = (m) => {
    const g = new T.Group();
    const clip = (size) => {
      const s = roundedRectShape(size, size, size * 0.3); const h = new T.Path(); h.absarc(0, 0.05 * size, size * 0.27, 0, Math.PI * 2, true); s.holes.push(h);
      const mesh = new T.Mesh(extrude(s, 1.3, 0.12), m); return mesh;
    };
    const sizes = [2.6, 2.6, 2.2, 2.2, 3.0];
    sizes.forEach((sz, i) => { const c = clip(sz); g.add(at(c, -6 + i * 3.1, sz / 2, 0)); });
    const cab = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 18, 16), darkMat()); g.add(at(cab, 0, 1.4, 0, 0, 0, Math.PI / 2));
    const cab2 = new T.Mesh(new T.CylinderGeometry(0.32, 0.32, 14, 16), new T.MeshStandardMaterial({ color: '#e8e4dc', roughness: 0.6 }));
    g.add(at(cab2, 2, 0.35, 3.2, 0, 0.3, Math.PI / 2));
    return g;
  };

  B['calha-cabos'] = (m) => {
    const g = new T.Group();
    const prof = polyShape([[-3.6, 0], [3.6, 0], [3.6, 5.2], [3.0, 5.2], [3.0, 0.6], [-3.0, 0.6], [-3.0, 5.2], [-3.6, 5.2]]);
    const tray = new T.Mesh(extrude(prof, 30, 0.12), m); g.add(at(tray, 0, 0, 0, 0, Math.PI / 2));
    for (const x of [-13, 13]) {
      const tab = rbox(3, 0.6, 2.6, m); g.add(at(tab, x, 5.0, -4.6));
      const hole = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.65, 14), darkMat()); g.add(at(hole, x, 5.02, -4.6));
    }
    const c1 = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 33, 16), darkMat()); g.add(at(c1, 0, 1.2, -1.2, 0, 0, Math.PI / 2));
    const c2 = new T.Mesh(new T.CylinderGeometry(0.4, 0.4, 33, 16), new T.MeshStandardMaterial({ color: '#e8e4dc', roughness: 0.6 }));
    g.add(at(c2, 0, 1.0, 0.8, 0, 0, Math.PI / 2));
    const plug = rbox(3.6, 1.6, 2.6, darkMat()); g.add(at(plug, 6, 1.6, 0.1));
    return g;
  };

  B['suporte-comandos'] = (m, o = {}) => {
    const g = new T.Group();
    g.add(at(rbox(15, 1.4, 8, m, 0.7), 0, 0.7, 0));
    for (const x of [-3.8, 3.8]) {
      const p = new T.Mesh(extrude(polyShape([[-1.3, 0], [1.3, 0], [1.0, 7.4], [-1.0, 7.4]]), 1.8, 0.4), m);
      g.add(at(p, x, 1.2, -0.6, -0.14));
      const tip = new T.Mesh(new T.SphereGeometry(1.15, 24, 16), m); tip.scale.set(1, 0.6, 0.9); g.add(at(tip, x, 8.5, -1.65));
    }
    g.add(at(rbox(15, 1.6, 1.0, m), 0, 1.9, 3.4));
    if (o.texto) gravar(g, o.texto, 13, 1.25, 0, 1.95, 3.92, 0, 0, 0, o.corTexto);
    return g;
  };

  B['organizador'] = (m, o = {}) => {
    const g = new T.Group();
    g.add(at(rbox(20, 1.0, 10, m, 0.8), 0, 0.5, 0));
    const hex = new T.Shape(); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; i ? hex.lineTo(3.4 * Math.cos(a), 3.4 * Math.sin(a)) : hex.moveTo(3.4 * Math.cos(a), 3.4 * Math.sin(a)); }
    const hh = new T.Path(); for (let i = 5; i >= 0; i--) { const a = (i / 6) * Math.PI * 2; i === 5 ? hh.moveTo(2.8 * Math.cos(a), 2.8 * Math.sin(a)) : hh.lineTo(2.8 * Math.cos(a), 2.8 * Math.sin(a)); }
    hex.holes.push(hh);
    const cup = new T.Mesh(extrude(hex, 10, 0.12), m); g.add(at(cup, -6, 5.9, 0, Math.PI / 2));
    const tray = roundedRectShape(11, 8, 1.2); 
    tray.holes = [shift(roundedRectShape(4.6, 6.8, 0.8), -2.7, 0), shift(roundedRectShape(4.6, 6.8, 0.8), 2.7, 0)];
    const walls = new T.Mesh(extrude(tray, 3.2, 0.12), m); g.add(at(walls, 3.6, 2.6, 0, Math.PI / 2));
    if (o.texto) gravar(g, o.texto, 9.6, 2.0, 3.6, 2.6, 4.16, 0, 0, 0, o.corTexto);
    // canetas
    const pen = (c, x, z, r) => { const p = new T.Mesh(new T.CylinderGeometry(0.4, 0.4, 14, 12), new T.MeshStandardMaterial({ color: c, roughness: 0.4 })); g.add(at(p, -6 + x, 8.5, z, r, 0, r * 0.6)); };
    pen('#111111', -0.6, 0.4, 0.12); pen('#d2a63c', 0.7, -0.5, -0.15);
    return g;
  };
  function shift(shape, dx, dy) { const p = new T.Path(); const pts = shape.getPoints(); pts.reverse().forEach((pt, i) => i ? p.lineTo(pt.x + dx, pt.y + dy) : p.moveTo(pt.x + dx, pt.y + dy)); return p; }

  function nameTexture(text, cor, logo) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d');
    g.clearRect(0, 0, 1024, 256); g.fillStyle = cor; g.textAlign = 'center'; g.textBaseline = 'middle';
    let x0 = 512, maxW = 940;
    if (logo) { const s = 210, r = Math.min(s / logo.width, s / logo.height); const w = logo.width * r, h = logo.height * r; g.drawImage(logo, 40 + (s - w) / 2, 128 - h / 2, w, h); x0 = 620; maxW = 720; }
    let size = 128; g.font = `${size}px Anton, Impact, "Arial Black", sans-serif`;
    while (g.measureText(text).width > maxW && size > 30) { size -= 6; g.font = `${size}px Anton, Impact, "Arial Black", sans-serif`; }
    g.fillText(text, x0, 132);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  }
  function gravar(g, text, w, h, x, y, z, rx, ry, rz, cor) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = Math.max(64, Math.round(1024 * h / w)); const k = c.getContext('2d');
    const txt = String(text).toUpperCase().slice(0, 16); k.fillStyle = cor || '#e2b54a'; k.textAlign = 'center'; k.textBaseline = 'middle';
    let size = c.height * 0.82; k.font = `${size}px Anton, Impact, "Arial Black", sans-serif`;
    while (k.measureText(txt).width > 960 && size > 10) { size -= 4; k.font = `${size}px Anton, Impact, "Arial Black", sans-serif`; }
    k.fillText(txt, 512, c.height * 0.54);
    const tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
    const pl = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.35, metalness: 0.35, polygonOffset: true, polygonOffsetFactor: -2 }));
    pl.position.set(x, y, z); pl.rotation.set(rx, ry, rz); pl.name = 'texto'; pl.userData.texto = true; g.add(pl); return pl;
  }
  B['placa-nome'] = (m, opts = {}) => {
    const g = new T.Group();
    const wedge = new T.Mesh(extrude(polyShape([[0, 0], [5.5, 0], [5.5, 0.8], [1.7, 5.2], [0, 5.2]]), 20, 0.25), m);
    g.add(at(wedge, -2.75, 0, 0, 0, Math.PI / 2));
    const txt = (opts.texto || 'RUBEN').toUpperCase().slice(0, 14);
    const cor = opts.corTexto || '#d2a63c';
    const plane = new T.Mesh(new T.PlaneGeometry(17, 4.25), new T.MeshStandardMaterial({ map: nameTexture(txt, cor, opts.logo), transparent: true, roughness: 0.35, metalness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 }));
    const ang = Math.atan2(4.4, 3.8);
    plane.position.set(0, 2.95, 0.9); plane.rotation.x = -(Math.PI / 2 - ang); plane.translateZ(0.06); plane.name = 'texto';
    g.add(plane);
    return g;
  };

  // ---------- montagem ----------
  function build(slug, cor = 'grafite', opts = {}) {
    const m = printMat(cor); const fn = B[slug]; if (!fn) return new T.Group();
    if (!opts.corTexto) opts = Object.assign({}, opts, { corTexto: ['ouro', 'areia', 'gesso', 'marmore', 'salvia'].includes(cor) ? '#1a1612' : '#e2b54a' });
    const g = fn(m, opts);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    // pousa no chão e centra
    const box = new T.Box3().setFromObject(g); const c = box.getCenter(new T.Vector3());
    g.position.x -= c.x; g.position.z -= c.z; g.position.y -= box.min.y;
    const wrap = new T.Group(); wrap.add(g); wrap.userData.slug = slug; return wrap;
  }
  function recolor(obj, cor) {
    const nm = printMat(cor);
    obj.traverse(o => { if (o.isMesh && o.material && o.material.userData && o.material.userData.print) o.material = nm; });
  }

  function setupScene(canvas, opts = {}) {
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: !!opts.preserve, alpha: false });
    renderer.setPixelRatio(opts.pixelRatio || Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.localClippingEnabled = true; renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    const scene = new T.Scene(); const bg = new T.Color(opts.bg || '#14110e'); scene.background = bg;
    const cam = new T.PerspectiveCamera(30, 1, 0.1, 2000);
    scene.add(new T.HemisphereLight('#fff6e6', '#2a241d', 0.6));
    const key = new T.DirectionalLight('#ffe9c4', 1.5); key.position.set(30, 60, 40); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.bias = -0.0005; scene.add(key);
    const rim = new T.DirectionalLight('#f3cf73', 0.6); rim.position.set(-50, 25, -40); scene.add(rim);
    const fill = new T.DirectionalLight('#c8d4ff', 0.45); fill.position.set(-30, 10, 50); scene.add(fill);
    const ground = new T.Mesh(new T.PlaneGeometry(2000, 2000), new T.MeshStandardMaterial({ color: opts.ground || '#0d0b09', roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    return { renderer, scene, cam, key, ground };
  }
  function frame(ctx, obj, az = 0.65, el = 0.32, pad = 1.25) {
    const box = new T.Box3().setFromObject(obj); const size = box.getSize(new T.Vector3()); const c = box.getCenter(new T.Vector3());
    const r = size.length() / 2 * pad; const d = r / Math.sin((ctx.cam.fov * Math.PI / 180) / 2);
    ctx.cam.position.set(c.x + d * Math.cos(el) * Math.sin(az), c.y + d * Math.sin(el), c.z + d * Math.cos(el) * Math.cos(az));
    ctx.cam.lookAt(c); ctx.cam.near = d / 50; ctx.cam.far = d * 10; ctx.cam.updateProjectionMatrix();
    const s = Math.max(size.x, size.z, size.y) * 1.6; const sc = ctx.key.shadow.camera;
    sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s; sc.near = 1; sc.far = 400; sc.updateProjectionMatrix();
    ctx.key.target.position.copy(c); ctx.key.position.set(c.x + 30, c.y + 60, c.z + 40); ctx.scene.add(ctx.key.target);
    return { c, d };
  }

  // impressão camada a camada: corta a peça acima de y e mostra o bico
  function printSim(scene, obj) {
    const plane = new T.Plane(new T.Vector3(0, -1, 0), 0);
    obj.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.clippingPlanes = [plane]; o.material.side = T.DoubleSide; o.material.clipShadows = true; } });
    const box = new T.Box3().setFromObject(obj); const size = box.getSize(new T.Vector3());
    const noz = new T.Group();
    const block = new T.Mesh(new T.BoxGeometry(3.2, 2.2, 3.2), new T.MeshStandardMaterial({ color: '#2b2b2e', roughness: 0.4, metalness: 0.6 })); block.position.y = 2.6; noz.add(block);
    const fan = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 0.3, 24), new T.MeshStandardMaterial({ color: '#d9a93a', roughness: 0.4 })); fan.rotation.x = Math.PI / 2; fan.position.set(0, 2.6, 1.65); noz.add(fan);
    const tip = new T.Mesh(new T.ConeGeometry(0.55, 1.2, 20), new T.MeshStandardMaterial({ color: '#c79a3a', roughness: 0.3, metalness: 0.9 })); tip.rotation.x = Math.PI; tip.position.y = 0.95; noz.add(tip);
    const glow = new T.PointLight('#ffb347', 1.6, 12, 2); glow.position.y = 0.2; noz.add(glow);
    const dot = new T.Mesh(new T.SphereGeometry(0.22, 12, 8), new T.MeshBasicMaterial({ color: '#ffd27a' })); dot.position.y = 0.25; noz.add(dot);
    scene.add(noz);
    const ring = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(size.x * 1.04, 0.001, size.z * 1.04)), new T.LineBasicMaterial({ color: '#f3cf73', transparent: true, opacity: 0.55 }));
    scene.add(ring);
    return {
      height: size.y, box,
      set(p, t) { // p 0..1
        const y = box.min.y + size.y * p; plane.constant = y + 0.0001;
        const k = t * 3.1; noz.position.set(box.min.x + size.x * (0.5 + 0.45 * Math.sin(k)), y, box.min.z + size.z * (0.5 + 0.45 * Math.sin(k * 1.7 + 1)));
        ring.position.set((box.min.x + box.max.x) / 2, y, (box.min.z + box.max.z) / 2);
        noz.visible = ring.visible = p < 0.999;
      },
      dispose() { scene.remove(noz); scene.remove(ring); plane.constant = 1e6; }
    };
  }

  cache = { printSim, gravar, T, CORES, build, recolor, setupScene, frame, printMat, woodMat, darkMat, rbox, at, nameTexture };
  return cache;
}
