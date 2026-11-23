'use client';
/* Pequenas peças interativas: botão de pack, contador do carrinho, troca de língua, menu, aviso. */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import type { Lang } from '@/lib/catalog';

export function AddPack({ id, label, ok }: { id: string; label: string; ok: string }) {
  const c = useCart();
  return <button className="btn gold" onClick={() => { c.add({ pack: id, q: 1 }); c.aviso(ok); c.abrir(); }}>{label}</button>;
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
