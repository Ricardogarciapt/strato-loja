import Link from 'next/link';
import Image from 'next/image';
import { CORES, PACKS, PROJETOS, produto, type Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { href } from '@/lib/site';
import { HeroPrint } from '@/components/HeroPrint';
import { MontraComunidade } from '@/components/Comunidade';
import { Atelier, Guarantees, PackCard, Process, ProductCard } from '@/components/blocos';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang; const t = tr(lang);
  const best = ['placa-nome', 'gancho-grampo', 'base-auscultadores', 'prateleira-monitor'].map((i) => produto(i)!);
  return (
    <>
      <div className="hero">
        <HeroPrint lang={lang}>
          <div className="txt"><div className="wrap"><div className="inner">
            <span className="eyebrow">{t('h_eb')}</span>
            <h1>{t('h1a')} <em>{t('h1b')}</em></h1>
            <p className="lead" style={{ color: '#d9d1c2' }}>{t('h_lead')}</p>
            <div className="row">
              <Link className="btn gold" href={href(lang, 'produto/placa-nome')}>{t('h_cta')}</Link>
              <Link className="btn ghost" href={href(lang, 'projetos')}>{t('h_cta2')}</Link>
            </div>
          </div></div></div>
        </HeroPrint>
      </div>
      <div className="props">{([1, 2, 3, 4] as const).map((i) => <div key={i}><b>{t(`p${i}t`)}</b><span>{t(`p${i}s`)}</span></div>)}</div>

      <section><div className="wrap">
        <div className="head"><div><span className="eyebrow">{t('how_eb')}</span><h2>{t('how_t')}</h2></div></div>
        <div className="how">
          <article>
            <div className="swrow">{CORES.map((c) => <i key={c.id} style={{ background: c.swatch }} />)}</div>
            <Image src="/img/suporte-telemovel.jpg" alt="" width={900} height={514} style={{ objectFit: 'cover' }} />
            <div className="b"><h3>{t('how1t')}</h3><p>{t('how1')}</p></div>
          </article>
          <article><Image src="/img/proj/logo.jpg" alt="" width={900} height={579} /><div className="b"><h3>{t('how2t')}</h3><p>{t('how2')}</p></div></article>
          <article><Image src="/img/proj/medidas.jpg" alt="" width={900} height={579} /><div className="b"><h3>{t('how3t')}</h3><p>{t('how3')}</p></div></article>
        </div>
      </div></section>

      <section style={{ background: 'var(--bg2)', borderBlock: '1px solid var(--line)' }}><div className="wrap">
        <div className="head"><div><h2>{t('best')}</h2><p className="mut">{t('best_s')}</p></div><Link className="btn ghost" href={href(lang, 'loja')}>{t('ver_tudo')}</Link></div>
        <div className="grid">{best.map((p) => <ProductCard key={p.id} p={p} lang={lang} />)}</div>
      </div></section>

      <section><div className="wrap">
        <div className="head"><div><span className="eyebrow">{t('pf_eb')}</span><h2>{t('pf_t')}</h2><p className="mut" style={{ maxWidth: '60ch' }}>{t('pf_s')}</p></div><Link className="btn ghost" href={href(lang, 'projetos')}>{t('pf_ver')}</Link></div>
        <div className="pfgrid">{PROJETOS.map((c) => <Link key={c.id} href={href(lang, `projetos#${c.id}`)}><Image src={c.img} alt="" width={600} height={600} /><span>{c.nome[lang]}</span></Link>)}</div>
      </div></section>

      <section style={{ background: 'var(--bg2)', borderBlock: '1px solid var(--line)' }}><div className="wrap">
        <div className="head"><div><h2>{t('packs_t')}</h2><p className="mut">{t('packs_s')}</p></div></div>
        <div className="packs">{PACKS.map((pk) => <PackCard key={pk.id} pk={pk} lang={lang} />)}</div>
      </div></section>
      <MontraComunidade lang={lang} />
      <Guarantees lang={lang} /><Process lang={lang} /><Atelier lang={lang} />
    </>
  );
}
