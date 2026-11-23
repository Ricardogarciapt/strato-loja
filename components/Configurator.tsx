'use client';
/* Página de produto interativa: visualizador 3D (rodar, ver a impressão, RA) + configurador em 3 passos. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CORES, PROJETOS, eur, parcelas, precoUnit, produto, type Lang, type Linha } from '@/lib/catalog';
import { tr, type Chave } from '@/lib/i18n';
import { href } from '@/lib/site';
import { useCart } from '@/lib/cart';
import { getStrato3D } from '@/lib/three/strato3d';
import { aplicarHDRI } from '@/lib/three/env';
import { ARModal } from './ARModal';

type Sel = { cor: string; v: number; q: number; txt: string; med: number | null; logo: HTMLImageElement | null };
type ViewerApi = { rebuild: () => void; print: () => void };

const BD: Record<string, Chave> = { base: 'bd_base', cor: 'bd_cor', var: 'bd_var', txt: 'bd_txt', logo: 'bd_logo', med: 'bd_med' };

export function Configurator({ id, lang }: { id: string; lang: Lang }) {
  const p = produto(id)!; const t = useMemo(() => tr(lang), [lang]); const cart = useCart();
  const [sel, setSel] = useState<Sel>(() => ({ cor: p.cor, v: 0, q: 1, txt: p.pers?.def ?? '', med: p.pers?.medida?.def ?? null, logo: null }));
  const [modo, setModo] = useState<'3d' | 'foto'>('3d');
  const [hud, setHud] = useState<{ l: number; tot: number } | null>(null);
  const [ar, setAr] = useState(false);
  const [sem3d, setSem3d] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<ViewerApi | null>(null);
  const selRef = useRef(sel); selRef.current = sel;

  // configuração partilhada por link (?cor=&txt=&med=), usada pelo QR da RA
  useEffect(() => {
    const q = new URLSearchParams(location.search); const s: Partial<Sel> = {};
    const c = q.get('cor'); if (c && CORES.some((x) => x.id === c)) s.cor = c;
    const tx = q.get('txt'); if (tx && p.pers) s.txt = tx.slice(0, p.pers.max ?? 14);
    const m = Number(q.get('med')); const mm = p.pers?.medida; if (mm && m >= mm.min && m <= mm.max) s.med = m;
    if (Object.keys(s).length) { selRef.current = { ...selRef.current, ...s }; setSel((x) => ({ ...x, ...s })); }
  }, [p]);

  const opts = useCallback(() => {
    const s = selRef.current; const o: Record<string, unknown> = {};
    if (p.pers) {
      if (s.txt) o.texto = s.txt; else if (p.pers.texto === 'inc') o.texto = t('txt_demo');
      if (s.logo) o.logo = s.logo;
      if (p.pers.medida && s.med != null) o[p.pers.medida.k] = s.med;
    }
    return o;
  }, [p, t]);

  // visualizador 3D
  useEffect(() => {
    const el = host.current; if (!el) return;
    let ok = true; try { const c = document.createElement('canvas'); ok = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { ok = false; }
    if (!ok) { setSem3d(true); return; }
    const S = getStrato3D(); const cv = document.createElement('canvas'); el.prepend(cv);
    const ctx = S.setupScene(cv, {});
    let obj = S.build(p.id, selRef.current.cor, opts()); ctx.scene.add(obj);
    let fr = S.frame(ctx, obj, 0.65, 0.3, 1.2);
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let az = p.id === 'placa-nome' ? 0.35 : 0.65, el2 = 0.3, auto = !RM, raf = 0, last = performance.now(), simT = 0;
    const az0 = az; let osc = 0;
    let drag: null | { x: number; y: number; az: number; el: number } = null;
    let sim: null | { set: (p: number, t: number) => void; dispose: () => void; height: number; layers?: number } = null;
    const size = () => { const w = el.clientWidth; ctx.renderer.setSize(w, w, false); ctx.cam.aspect = 1; ctx.cam.updateProjectionMatrix(); };
    const place = () => { const { c, d } = fr; ctx.cam.position.set(c.x + d * Math.cos(el2) * Math.sin(az), c.y + d * Math.sin(el2), c.z + d * Math.cos(el2) * Math.cos(az)); ctx.cam.lookAt(c); };
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (auto && !drag) { osc += dt * 0.5; az = az0 + Math.sin(osc) * 0.7; }
      if (sim) {
        simT += dt; const pr = Math.min(1, simT / 6); sim.set(pr, simT);
        setHud({ l: Math.round(pr * (sim.layers ?? 0)), tot: sim.layers ?? 0 });
        if (pr >= 1) { sim.dispose(); sim = null; setTimeout(() => setHud(null), 900); }
      }
      place(); ctx.renderer.render(ctx.scene, ctx.cam); raf = requestAnimationFrame(loop);
    };
    const down = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, az, el: el2 }; cv.setPointerCapture(e.pointerId); auto = false; };
    const move = (e: PointerEvent) => { if (!drag) return; az = drag.az - (e.clientX - drag.x) * 0.01; el2 = Math.max(0.05, Math.min(1.2, drag.el + (e.clientY - drag.y) * 0.006)); };
    const up = () => { drag = null; };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up);
    size(); addEventListener('resize', size); raf = requestAnimationFrame(loop);
    aplicarHDRI(ctx.renderer, ctx.scene, undefined, undefined, [ctx.ground]);
    const rebuild = () => {
      if (sim) { sim.dispose(); sim = null; setHud(null); }
      ctx.scene.remove(obj); obj = S.build(p.id, selRef.current.cor, opts()); ctx.scene.add(obj); fr = S.frame(ctx, obj, az, el2, 1.2);
      if (ctx.scene.environment) aplicarHDRI(ctx.renderer, ctx.scene, undefined, undefined, [ctx.ground]);
    };
    api.current = {
      rebuild,
      print() {
        if (sim) return; rebuild(); sim = S.printSim(ctx.scene, obj);
        const lh = parseFloat(p.sp.cam.replace(',', '.')) / 10 || 0.02; sim!.layers = Math.round(sim!.height / lh); simT = 0;
      },
    };
    const tm = 0; // começa com a peça acabada; a impressão vê-se no botão «Ver a impressão»
    return () => {
      clearTimeout(tm); cancelAnimationFrame(raf); removeEventListener('resize', size);
      ctx.renderer.dispose(); cv.remove(); api.current = null;
    };
  }, [p, opts]);

  const reb = useRef<number>(0);
  const upd = (s: Partial<Sel>, rebuild: 'now' | 'debounce' | 'no' = 'now') => {
    setSel((x) => { const n = { ...x, ...s }; selRef.current = n; return n; });
    if (rebuild === 'now') api.current?.rebuild();
    if (rebuild === 'debounce') { clearTimeout(reb.current); reb.current = window.setTimeout(() => api.current?.rebuild(), 140); }
  };

  const linha: Omit<Linha, 'key'> = { id: p.id, cor: sel.cor, v: sel.v, q: sel.q, txt: p.pers ? sel.txt.trim() : '', med: sel.med, logo: !!sel.logo };
  const unit = precoUnit({ ...linha, key: '' }); const parts = parcelas({ ...linha, key: '' });
  const [errTxt, setErrTxt] = useState(false);
  const add = () => {
    if (p.pers?.texto === 'inc' && !sel.txt.trim()) { setErrTxt(true); const el = document.getElementById('ptxt'); el?.scrollIntoView({ block: 'center', behavior: 'smooth' }); el?.focus({ preventScroll: true }); return; }
    cart.add(linha); cart.aviso(t('added')); cart.abrir();
  };
  // barra fixa só quando o botão principal sai do ecrã
  const addRef = useRef<HTMLDivElement>(null); const [fixa, setFixa] = useState(false);
  useEffect(() => {
    const el = addRef.current; if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setFixa(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el); return () => io.disconnect();
  }, []);
  // data estimada de chegada (dias úteis: 2 no atelier + transporte)
  const [chega, setChega] = useState<[string, string] | null>(null);
  useEffect(() => {
    const util = (n: number) => { const d = new Date(); while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n--; } return d; };
    const f = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });
    setChega([f.format(util(4)), f.format(util(7))]);
  }, [lang]);
  const m = p.pers?.medida; let n = 0;
  const StepH = ({ lb, extra }: { lb: string; extra?: React.ReactNode }) => <div className="sh"><b><i>0{++n}</i>{lb}</b>{extra != null && <span>{extra}</span>}</div>;
  const corSel = CORES.find((c) => c.id === sel.cor)!;
  const partilha = typeof window !== 'undefined'
    ? `${location.origin}${href(lang, `produto/${p.id}`)}?cor=${sel.cor}${sel.txt ? `&txt=${encodeURIComponent(sel.txt)}` : ''}${sel.med != null ? `&med=${sel.med}` : ''}` : '';

  return (
    <div className="pd">
      <div className="vcol">
        <div className="crumbs"><Link href={href(lang, 'loja')}>{t('loja_t')}</Link> / {t(`cat_${p.cat}` as Chave)}</div>
        <div className="viewer" ref={host}>
          {(modo === 'foto' || sem3d) && <img className="still" src={`/img/${p.id}.jpg`} alt={p.nome[lang]} />}
          {hud && <div className="phud"><div>{t('hud_c')} <b>{hud.l}</b>/{hud.tot}</div><div className="bar"><i style={{ width: `${(hud.l / Math.max(1, hud.tot)) * 100}%` }} /></div></div>}
          {!sem3d && (
            <div className="modes">
              <button onClick={() => { setModo('3d'); api.current?.print(); }}>{t('mprint')}</button>
              <button className={modo === '3d' ? 'on' : ''} onClick={() => setModo('3d')}>{t('m3d')}</button>
              <button className={modo === 'foto' ? 'on' : ''} onClick={() => setModo('foto')}>{t('mfoto')}</button>
            </div>
          )}
          {!sem3d && <button className="arbtn" onClick={() => setAr(true)}><span aria-hidden>◎</span> {t('ar_btn')}</button>}
          {!sem3d && <span className="hint">{t('hint')}</span>}
        </div>
        <div className="thumbs">
          {PROJETOS.filter((c) => c.pecas.includes(p.id)).map((c) => (
            <Link key={c.id} href={href(lang, `projetos#${c.id}`)} title={c.nome[lang]}><img src={c.img} alt={c.nome[lang]} /></Link>
          ))}
        </div>
      </div>

      <div className="buy">
        <div className="ptop">
          <h1 style={{ fontSize: 'clamp(30px,3.4vw,44px)' }}>{p.nome[lang]}</h1>
          <div className="p price">{eur(unit, lang)}</div>
          <div className="envinfo">{t('envio_info')}</div>
          <p className="desc">{p.desc[lang]}</p>
        </div>

        <div className="step">
          <StepH lb={t('st1')} extra={corSel.nome[lang]} />
          <div className="sw">
            {CORES.map((c) => (
              <button key={c.id} className={c.id === sel.cor ? 'on' : ''} style={{ background: c.swatch }} aria-label={c.nome[lang]} aria-pressed={c.id === sel.cor} title={c.nome[lang]} onClick={() => upd({ cor: c.id })}>
                {c.extra ? <span className="x">+{c.extra}</span> : null}
              </button>
            ))}
          </div>
          <span className="small mut">{t('nota_cor')}</span>
        </div>

        {p.pers && (
          <div className="step">
            <StepH lb={t('st2')} extra={p.pers.texto === 'inc' ? t('txt_inc') : t('txt_fee')} />
            <div className="opt">
              <label htmlFor="ptxt">{t('txt_lb')}</label>
              <input id="ptxt" type="text" maxLength={p.pers.max ?? 14} placeholder={t('txt_ph')} value={sel.txt} aria-invalid={errTxt || undefined} aria-describedby="ptxt-h" className={errTxt ? 'bad' : undefined} onChange={(e) => { if (errTxt && e.target.value.trim()) setErrTxt(false); upd({ txt: e.target.value }, 'debounce'); }} />
              <span id="ptxt-h" className={errTxt ? 'fhint err' : 'fhint'}>{errTxt ? t('txt_req') : t('txt_max', { n: p.pers.max ?? 14 })}</span>
            </div>
            {p.pers.logo && (
              <div className="opt">
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{t('logo_lb')}</span>
                <div className="upl">
                  <label htmlFor="plogo">{t('logo_btn')}</label>
                  <input id="plogo" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(e) => {
                    const f = e.target.files?.[0]; if (!f) return; const r = new FileReader();
                    r.onload = () => { const im = new Image(); im.onload = () => { upd({ logo: im }); cart.aviso(t('logo_ok')); }; im.src = String(r.result); };
                    r.readAsDataURL(f);
                  }} />
                  {sel.logo && <button className="btn ghost sm" onClick={() => upd({ logo: null })}>{t('logo_rm')}</button>}
                </div>
                <span className="fhint">{t('logo_spec')}</span>
              </div>
            )}
          </div>
        )}

        {m && (
          <div className="step">
            <StepH lb={t('st3')} />
            <div className="opt">
              <label htmlFor="pmed">{t(m.k === 'espessura' ? 'esp_lb' : 'larg_lb')}</label>
              <input type="range" id="pmed" min={m.min} max={m.max} step={m.step} value={sel.med ?? m.def} onChange={(e) => upd({ med: Number(e.target.value) }, 'debounce')} />
              <div className="rangeval"><span>{m.min} {m.un}</span><b>{String(sel.med).replace('.', ',')} {m.un}</b><span>{m.max} {m.un}</span></div>
            </div>
          </div>
        )}

        {p.var && (
          <div className="step">
            <StepH lb={t('st_v')} />
            <div className="seg">{p.var.map((v, i) => (
              <button key={i} className={i === sel.v ? 'on' : ''} onClick={() => upd({ v: i }, 'no')}>{v.nome[lang]}{v.d ? ` · +${eur(v.d, lang)}` : ''}</button>
            ))}</div>
          </div>
        )}

        {parts.length > 1 && (
          <div className="breakdown">
            {parts.map((x) => <div key={x.k}><span>{t(BD[x.k])}</span><span className="price">{eur(x.v, lang)}</span></div>)}
            <div className="tt"><span>{t('bd_tot')}</span><span className="price">{eur(unit, lang)}</span></div>
          </div>
        )}

        <div className="addrow" ref={addRef}>
          <div className="qty">
            <button aria-label="−" onClick={() => upd({ q: Math.max(1, sel.q - 1) }, 'no')}>−</button>
            <span>{sel.q}</span>
            <button aria-label="+" onClick={() => upd({ q: Math.min(50, sel.q + 1) }, 'no')}>+</button>
          </div>
          <button className="btn gold" onClick={add}>{t('add')}</button>
        </div>
        {chega && <div className="eta">{t('chega', { a: chega[0], b: chega[1], e: 'Colissimo / Mondial Relay' })}</div>}
        <div className="assure">{(['as1', 'as2', 'as3'] as const).map((k) => <div key={k}>{t(k)}</div>)}<div>{t('vol_info')}</div></div>
        <dl className="specs">
          {([['sp_mod', t('modelo')], ['sp_mat', p.sp.mat], ['sp_cam', p.sp.cam], ['sp_peso', p.sp.peso], ['sp_tempo', p.sp.tempo], ['sp_med', p.sp.med], ['sp_prazo', t('prazo')]] as [Chave, string][]).map(([k, v]) => (
            <div key={k}><dt>{t(k)}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>

      <div className={fixa ? 'stickybuy show' : 'stickybuy'}><span className="price">{eur(unit, lang)}</span><button className="btn gold" onClick={add}>{t('add')}</button></div>
      {ar && <ARModal id={p.id} cor={sel.cor} opts={opts()} nome={p.nome[lang]} t={t} partilha={partilha} onClose={() => setAr(false)} />}
    </div>
  );
}
