'use client';
import { useState } from 'react';
import { CORES, cor, eur, type Lang } from '@/lib/catalog';
import { useCart } from '@/lib/cart';

export function ComAdd({ id, preco, corDef, lang, T }: { id: string; preco: number; corDef: string; lang: Lang; T: { add: string; ok: string; cor: string } }) {
  const c = useCart(); const [sel, setSel] = useState(corDef);
  const total = preco + (cor(sel)?.extra ?? 0);
  return (
    <>
      <div className="step"><div className="sh"><b>{T.cor}</b><span>{cor(sel)?.nome[lang]}</span></div>
        <div className="sw">{CORES.map((k) => (
          <button key={k.id} className={k.id === sel ? 'on' : ''} style={{ background: k.swatch }} aria-label={k.nome[lang]} title={k.nome[lang]} onClick={() => setSel(k.id)}>{k.extra ? <span className="x">+{k.extra}</span> : null}</button>
        ))}</div></div>
      <div className="addrow"><span className="price" style={{ fontSize: 22 }}>{eur(total, lang)}</span>
        <button className="btn gold" onClick={() => { c.add({ com: id, cor: sel, q: 1 }); c.aviso(T.ok); c.abrir(); }}>{T.add}</button></div>
    </>
  );
}
