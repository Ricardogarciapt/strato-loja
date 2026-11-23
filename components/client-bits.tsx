'use client';
/* Pequenas peças interativas: botão de pack, contador do carrinho, troca de língua, menu, aviso. */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { CORES, type Lang } from '@/lib/catalog';

export function Cadeado() {
  return <svg className="ico" viewBox="0 0 24 24" aria-hidden><path d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z" /></svg>;
}

export function AddPack({ id, label, ok, nome, lang, lbCor, lbNome, ph }: { id: string; label: string; ok: string; nome: boolean; lang: Lang; lbCor: string; lbNome: string; ph: string }) {
  const c = useCart(); const [cr, setCr] = useState('grafite'); const [txt, setTxt] = useState('');
  const cores = CORES.filter((x) => !x.extra);
  return (
    <div className="pkcfg">
      <div className="pkrow"><span>{lbCor}: <b>{cores.find((x) => x.id === cr)?.nome[lang]}</b></span>
        <div className="sw">{cores.map((x) => <button key={x.id} type="button" className={x.id === cr ? 'on' : ''} style={{ background: x.swatch }} aria-label={x.nome[lang]} aria-pressed={x.id === cr} onClick={() => setCr(x.id)} />)}</div>
      </div>
      {nome && <label className="pkrow"><span>{lbNome}</span><input type="text" maxLength={14} placeholder={ph} value={txt} onChange={(e) => setTxt(e.target.value)} /></label>}
      <button className="btn gold" onClick={() => { c.add({ pack: id, q: 1, cor: cr, txt: txt.trim() }); c.aviso(ok); c.abrir(); }}>{label}</button>
    </div>
  );
}

export function CartButton({ label }: { label: string }) {
  const c = useCart();
  return (
    <button className="cartbtn" onClick={c.abrir} aria-label={`${label} (${c.n})`}>
      <em style={{ fontStyle: 'normal' }}>{label}</em> <span id="cc">{c.n}</span>
    </button>
  );
}

export function LangSwitch({ lang }: { lang: Lang }) {
  const path = usePathname() || `/${lang}`;
  const to = (l: Lang) => path.replace(/^\/(pt|fr)/, `/${l}`);
  return (
    <div className="lang">
      <Link href={to('pt')} className={lang === 'pt' ? 'on' : ''} hrefLang="pt" style={{ padding: '5px 11px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>PT</Link>
      <Link href={to('fr')} className={lang === 'fr' ? 'on' : ''} hrefLang="fr" style={{ padding: '5px 11px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>FR</Link>
    </div>
  );
}

export function NavMenu({ lang, items }: { lang: Lang; items: { r: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const path = usePathname() || '';
  return (
    <>
      <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      <nav className={`main ${open ? 'open' : ''}`} aria-label="Principal">
        {items.map((i) => {
          const h = `/${lang}/${i.r}`; const on = path.startsWith(h) || (i.r === 'loja' && path.includes('/produto/'));
          return <Link key={i.r} href={h} className={on ? 'on' : ''} onClick={() => setOpen(false)}>{i.label}</Link>;
        })}
      </nav>
    </>
  );
}

export function Toast() {
  const c = useCart();
  return c.avisoMsg && !c.aberto ? <div className="toast" role="status">{c.avisoMsg}</div> : null;
}
