/* Blocos de página sem estado (servidor): cartões, packs, garantias, processo, atelier, projetos. */
import Link from 'next/link';
import Image from 'next/image';
import { PRODUTOS, eur, produto, type Lang, type Pack, type Produto, type Projeto } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { href } from '@/lib/site';
import { AddPack } from './client-bits';

export function ProductCard({ p, lang }: { p: Produto; lang: Lang }) {
  const t = tr(lang);
  return (
    <Link className="pc" href={href(lang, `produto/${p.id}`)}>
      <div className="ph">
        <Image src={`/img/${p.id}.jpg`} alt={p.nome[lang]} width={900} height={900} sizes="(max-width:720px) 50vw, 25vw" />
        {p.tag && <span className="tag">{p.tag[lang]}</span>}
      </div>
      <div className="nm">{p.nome[lang]}</div>
      <div className="meta">
        <span className="price">{p.var || p.pers?.medida ? t('desde') + ' ' : ''}{eur(p.preco, lang)}</span>
        {p.pers && <span className="opts">{t(p.pers.medida ? 'pers_med' : p.pers.logo ? 'pers_logo' : 'pers_txt')}</span>}
      </div>
    </Link>
  );
}

export function PackCard({ pk, lang }: { pk: Pack; lang: Lang }) {
  const t = tr(lang);
  const soma = pk.itens.reduce((s, i) => s + (produto(i)?.preco ?? 0), 0);
  return (
    <div className="pk">
      <div className="imgs">{pk.itens.slice(0, 3).map((i) => <Image key={i} src={`/img/${i}.jpg`} alt={produto(i)!.nome[lang]} width={300} height={300} />)}</div>
      <h3>{pk.nome[lang]}</h3>
      <p className="mut" style={{ margin: 0 }}>{pk.txt[lang]}</p>
      <div className="small"><b>{t('inclui')}:</b><ul>{pk.itens.map((i) => <li key={i}>{produto(i)!.nome[lang]}</li>)}</ul></div>
      <div className="pr"><b>{eur(pk.preco, lang)}</b><s>{eur(soma, lang)}</s><span className="save">{t('poupas', { x: eur(soma - pk.preco, lang) })}</span></div>
      <p className="base">{t('pack_base')}</p>
      <AddPack id={pk.id} label={t('add_pack')} ok={t('added')} />
    </div>
  );
}

import { PayBadges } from './blocos-client';
export { PayBadges };

const IC = [
  'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5zM12 14v3', // cadeado
  'M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4', // devolução
  'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z', // escudo
  'M4 12h16M7 8l-3 4 3 4M17 8l3 4-3 4', // medida
  'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-.1M17 19a2 2 0 1 0 0-.1', // camião
  'M4 5h16v11H8l-4 4z', // conversa
];
export function Guarantees({ lang }: { lang: Lang }) {
  const t = tr(lang);
  return (
    <section id="garantias"><div className="wrap">
      <div className="head"><div><span className="eyebrow">{t('gar_eb')}</span><h2>{t('gar_t')}</h2></div><PayBadges /></div>
      <div className="guar">{([1, 2, 3, 4, 5, 6] as const).map((i) => (
        <div key={i}><span className="ic" aria-hidden><svg viewBox="0 0 24 24"><path d={IC[i - 1]} /></svg></span><b>{t(`g${i}t`)}</b><p>{t(`g${i}`)}</p></div>
      ))}</div>
    </div></section>
  );
}

export function Process({ lang }: { lang: Lang }) {
  const t = tr(lang);
  return (
    <section style={{ borderTop: '1px solid var(--line)' }}><div className="wrap">
      <div className="head"><h2>{t('proc_t')}</h2></div>
      <div className="steps">{([1, 2, 3, 4] as const).map((i) => <div key={i}><h3>{t(`s${i}t`)}</h3><p>{t(`s${i}`)}</p></div>)}</div>
    </div></section>
  );
}

export function Atelier({ lang }: { lang: Lang }) {
  const t = tr(lang);
  return (
    <section style={{ borderTop: '1px solid var(--line)' }}><div className="wrap ruben">
      <Image src="/img/ruben.jpg" alt="Ruben Pereira" width={760} height={912} sizes="(max-width:880px) 380px, 40vw" />
      <div style={{ display: 'grid', gap: 16 }}>
        <span className="eyebrow">{t('rub_eb')}</span>
        <div className="quote">«{t('rub_q')}»</div>
        <p className="lead">{t('rub_p1')}</p><p className="lead">{t('rub_p2')}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn gold" href={href(lang, 'loja')}>{t('ver_tudo')}</Link>
          <Link className="btn ghost" href={href(lang, 'empresas')}>{t('nav_pers')}</Link>
        </div>
      </div>
    </div></section>
  );
}

export function CaseStudy({ c, lang }: { c: Projeto; lang: Lang }) {
  const t = tr(lang);
  return (
    <article className="case" id={c.id}>
      <div className="ci"><Image src={c.img} alt={c.nome[lang]} width={1400} height={900} sizes="(max-width:880px) 100vw, 58vw" /></div>
      <div className="cb">
        <span className="concept">{t('conceito')}</span>
        <h3 style={{ fontSize: 30 }}>{c.nome[lang]}</h3>
        <p>{c.txt[lang]}</p>
        <div className="small"><b>{t('pecas')}:</b><ul>{c.pecas.map((i) => <li key={i}><Link href={href(lang, `produto/${i}`)}>{produto(i)!.nome[lang]}</Link></li>)}</ul></div>
        <div className="small mut">{t('desde_pf')}: <span className="price" style={{ color: 'var(--fg)' }}>{c.valor[lang]}</span></div>
        <div><Link className="btn ghost sm" href={href(lang, 'empresas')}>{t('pf_pedir')}</Link></div>
      </div>
    </article>
  );
}

export function Related({ p, lang }: { p: Produto; lang: Lang }) {
  const t = tr(lang);
  const list = p.with.map((i) => produto(i)!).concat(PRODUTOS.filter((x) => x.id !== p.id && !p.with.includes(x.id)).slice(0, 4 - p.with.length));
  return (
    <section style={{ paddingTop: 10 }}>
      <h3 style={{ marginBottom: 16 }}>{t('combina')}</h3>
      <div className="grid">{list.map((x) => <ProductCard key={x.id} p={x} lang={lang} />)}</div>
    </section>
  );
}
