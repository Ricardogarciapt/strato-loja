'use client';
/* Gaveta do carrinho: barra de envio grátis, linhas com a personalização, oferta de clips, total. */
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '@/lib/cart';
import { FRETE_GRATIS, eur, totalLinha, type Lang } from '@/lib/catalog';
import { Cadeado } from './client-bits';
import { tr } from '@/lib/i18n';
import { href } from '@/lib/site';
import { LinhaView } from './LinhaView';

export function CartDrawer({ lang }: { lang: Lang }) {
  const c = useCart(); const t = tr(lang);
  useEffect(() => {
    if (!c.aberto) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && c.fechar();
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [c.aberto, c]);
  if (!c.aberto) return null;
  const falta = Math.max(0, FRETE_GRATIS - c.sub);
  const temClips = c.linhas.some((l) => l.id === 'clips-cabo');
  return (
    <>
      <div className="scrim" onClick={c.fechar} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t('cart_t')}>
        <div className="top"><h3>{t('cart_t')}</h3><button onClick={c.fechar} aria-label={t('ar_close')}>×</button></div>
        <div className="body">
          {c.linhas.length ? (
            <>
              <div className="ship"><span>{falta > 0 ? t('falta', { x: eur(falta, lang) }) : t('gratis')}</span><div className="bar"><i style={{ width: `${Math.min(100, (c.sub / FRETE_GRATIS) * 100)}%` }} /></div></div>
              {c.linhas.map((l) => <LinhaView key={l.key} l={l} lang={lang} onRemove={() => c.remover(l.key)} total={totalLinha(l, c.vol)} />)}
              {!temClips && (
                <label className="bump">
                  <input type="checkbox" onChange={(e) => e.target.checked && c.add({ id: 'clips-cabo', cor: 'grafite', v: 0, q: 1, oferta: 'bump-clips' })} />
                  <img src="/img/clips-cabo.jpg" alt="" /><span>{t('bump')}</span>
                </label>
              )}
            </>
          ) : <p className="mut">{t('vazio')}</p>}
        </div>
        <div className="foot">
          {c.linhas.length > 0 && (
            <>
              {c.vol > 0 && <div className="sumrow vol"><span>{t('vol_ap', { x: Math.round(c.vol * 100) })}</span></div>}
              <div className="tot"><span>{t('subtotal')}</span><span className="price">{eur(c.sub, lang)}</span></div>
              <Link className="btn gold full" href={href(lang, 'checkout')} onClick={c.fechar}>{t('finalizar')}</Link>
              <div className="lock"><Cadeado /> {t('lock')}</div>
            </>
          )}
          <button className="btn ghost full" onClick={c.fechar}>{t('continuar')}</button>
        </div>
      </aside>
    </>
  );
}
