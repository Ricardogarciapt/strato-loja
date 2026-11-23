'use client';
/* Entrada em CGI: as peças imprimem-se ao vivo, camada a camada, numa mesa de impressão com a marca. */
import { useEffect, useRef, useState } from 'react';
import { produto, type Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { getStrato3D } from '@/lib/three/strato3d';
import { aplicarHDRI } from '@/lib/three/env';

const fmt = (s: number) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`; };
const segundos = (tempo: string) => { const tm = tempo.replace(/2 × /, ''); const h = tm.match(/(\d+) h/), m = tm.match(/(\d+) min/); return (h ? +h[1] * 3600 : 0) + (m ? +m[1] * 60 : 0); };

export function HeroPrint({ lang, children }: { lang: Lang; children?: React.ReactNode }) {
  const t = tr(lang);
  const stage = useRef<HTMLDivElement>(null);
  const [hud, setHud] = useState<{ nome: string; l: number; tot: number; resta: string; p: number } | null>(null);
  const [vivo, setVivo] = useState(false);

  useEffect(() => {
    const st = stage.current; if (!st) return;
    let ok = true; try { const c = document.createElement('canvas'); ok = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { ok = false; }
    if (!ok) return;
    const S = getStrato3D(); const T = S.T;
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); st.insertBefore(cv, st.children[1] ?? null);
    const ctx = S.setupScene(cv, { pixelRatio: Math.min(devicePixelRatio || 1, 1.5) });
    // mesa de impressão com grelha e a marca
    const bc = document.createElement('canvas'); bc.width = bc.height = 512; const g = bc.getContext('2d')!;
    g.fillStyle = '#1d1a16'; g.fillRect(0, 0, 512, 512); g.strokeStyle = 'rgba(243,207,115,.13)'; g.lineWidth = 2;
    for (let i = 0; i <= 512; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
    g.fillStyle = 'rgba(243,207,115,.35)'; g.font = 'bold 30px Anton, Impact, sans-serif'; g.fillText('STRATO', 24, 490);
    const bt = new T.CanvasTexture(bc); bt.encoding = T.sRGBEncoding; bt.anisotropy = ctx.renderer.capabilities.getMaxAnisotropy();
    ctx.scene.fog = new T.Fog(0x14110e, 60, 140);
    const bed = new T.Mesh(new T.BoxGeometry(34, 0.8, 34), new T.MeshStandardMaterial({ map: bt, roughness: 0.5, metalness: 0.3 }));
    bed.position.y = -0.4; bed.receiveShadow = true; ctx.scene.add(bed);
    const sc = ctx.key.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.updateProjectionMatrix(); ctx.key.position.set(25, 50, 30);
    aplicarHDRI(ctx.renderer, ctx.scene, '/hdri/studio.exr', 0.6, [ctx.ground]);

    const seq = [
      { id: 'placa-nome', cor: 'grafite', o: { texto: lang === 'fr' ? 'TON NOM' : 'O TEU NOME' } },
      { id: 'base-auscultadores', cor: 'areia', o: { texto: 'LUNA' } },
      { id: 'suporte-comandos', cor: 'terracota', o: { texto: 'PLAYER 2' } },
      { id: 'gancho-grampo', cor: 'salvia', o: { espessura: 3.2 } },
    ];
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let i = 0, obj: any = null, sim: any = null, t0 = 0, fase = 0, az = 0.9, raf = 0, last = performance.now(), visivel = true, dist = 40, secs = 0, cur = seq[0];
    const alvo = new T.Vector3();
    const wide = () => st.clientWidth > 760;
    const vw = () => { const w = st.clientWidth, h = st.clientHeight; ctx.renderer.setSize(w, h, false); ctx.cam.aspect = w / h; ctx.cam.updateProjectionMatrix(); };
    const proxima = () => {
      if (obj) ctx.scene.remove(obj);
      cur = seq[i % seq.length]; obj = S.build(cur.id, cur.cor, cur.o); if (cur.id === 'base-auscultadores') obj.scale.setScalar(0.85); ctx.scene.add(obj);
      if (ctx.scene.environment) aplicarHDRI(ctx.renderer, ctx.scene, '/hdri/studio.exr', 0.6, [ctx.ground]);
      const box = new T.Box3().setFromObject(obj); const sz = box.getSize(new T.Vector3()); box.getCenter(alvo);
      dist = Math.max(sz.x, sz.y, sz.z) * 2.1 + 9;
      if (wide()) alvo.x -= dist * 0.32; else alvo.y -= dist * 0.22;
      sim = S.printSim(ctx.scene, obj); const pr = produto(cur.id)!;
      sim.layers = Math.round(sim.height / (parseFloat(pr.sp.cam.replace(',', '.')) / 10)); secs = segundos(pr.sp.tempo);
      t0 = 0; fase = 0; i++;
      if (RM) { sim.set(1, 0); sim.dispose(); fase = 1; t0 = -1e9; }
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop); if (!visivel) { last = now; return; }
      const dt = Math.min(0.1, (now - last) / 1000); last = now; t0 += dt; if (!RM) az += dt * 0.18;
      if (fase === 0) {
        const p = Math.min(1, t0 / 7); sim.set(p, t0);
        setHud({ nome: produto(cur.id)!.nome[lang], l: Math.round(p * sim.layers), tot: sim.layers, resta: fmt(secs * (1 - p)), p });
        if (p >= 1) { sim.dispose(); fase = 1; t0 = 0; }
      } else if (t0 > 3.2) proxima();
      const el = 0.34; const off = wide() ? dist * 0.32 : 0;
      ctx.cam.position.set(alvo.x + dist * Math.cos(el) * Math.sin(az) + off, alvo.y + dist * Math.sin(el), alvo.z + dist * Math.cos(el) * Math.cos(az));
      ctx.cam.lookAt(alvo); ctx.renderer.render(ctx.scene, ctx.cam);
    };
    vw(); addEventListener('resize', vw); proxima();
    const io = new IntersectionObserver((es) => { visivel = es[0].isIntersecting; }); io.observe(st);
    setVivo(true); raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', vw); ctx.renderer.dispose(); cv.remove(); };
  }, [lang]);

  return (
    <div className="stage" ref={stage}>
      <img className="poster" src="/img/hero.jpg" alt="" style={{ opacity: vivo ? 0 : 1, transition: 'opacity .8s' }} />
      <div className="over" />
      {children}
      {hud && (
        <div className="printhud" aria-live="off">
          <div>{t('hud_a')}: <b>{hud.nome}</b></div>
          <div className="bar"><i style={{ width: `${hud.p * 100}%` }} /></div>
          <div>{t('hud_c')} <b>{hud.l}</b>/{hud.tot} · {t('hud_t')} <b>{hud.resta}</b></div>
        </div>
      )}
    </div>
  );
}
