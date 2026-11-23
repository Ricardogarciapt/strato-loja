'use client';
/* Página depois do pagamento: número da encomenda, linha do tempo, oferta da placa com nome. */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart';
import { eur, type Lang, type Linha } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { href } from '@/lib/site';
import { LinhaView } from './LinhaView';

type Encomenda = { n: string; linhas: (Linha & { total: number })[]; total: number };

export function Obrigado({ lang }: { lang: Lang }) {
  const t = tr(lang); const c = useCart();
  const [enc, setEnc] = useState<Encomenda | null>(null);
  const [n, setN] = useState('');
  const [up, setUp] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const sid = q.get('session_id');
    if (sid) { setN(sid.slice(-8).toUpperCase()); c.limpar(); return; }
    try { const e = JSON.parse(sessionStorage.getItem('strato_ultima') || 'null') as Encomenda | null; if (e) { setEnc(e); setN(e.n); } } catch { /* nada */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="wrap"><div className="done">
      {n && <span className="ordernum">#{n}</span>}
      <h1 style={{ fontSize: 'clamp(40px,6vw,76px)' }}>{t('ok_t')}</h1>
      <p className="lead">{t('ok_p', { n: '' }).replace(', .', '.').replace(' ,', ',')}</p>
      <div className="timeline"><div className="on">{t('tl1')}</div><div>{t('tl2')}</div><div>{t('tl3')}</div><div>{t('tl4')}</div></div>
      {!up && (
        <div className="upsell">
          <img src="/img/placa-nome.jpg" alt="" />
          <div style={{ display: 'grid', gap: 8 }}>
            <h3>{t('up_t')}</h3><p className="mut" style={{ margin: 0 }}>{t('up_p')}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn gold" onClick={() => { c.add({ id: 'placa-nome', cor: 'grafite', v: 0, q: 1, txt: 'RUBEN', oferta: 'upsell-placa' }); setUp(true); c.abrir(); }}>{t('up_b')}</button>
              <button className="btn ghost" onClick={() => setUp(true)}>{t('up_n')}</button>
            </div>
          </div>
        </div>
      )}
      {enc && (
        <div style={{ width: '100%', display: 'grid', gap: 10 }}>
          {enc.linhas.map((l) => <LinhaView key={l.key} l={l} lang={lang} total={l.total} />)}
          <div className="tot" style={{ marginTop: 6 }}><span>{t('total')}</span><span className="price">{eur(enc.total, lang)}</span></div>
        </div>
      )}
      <Link className="btn ghost" href={href(lang, 'loja')}>{t('voltar')}</Link>
    </div></div>
  );
}
