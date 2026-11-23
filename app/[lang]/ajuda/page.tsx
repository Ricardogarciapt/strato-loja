import type { Metadata } from 'next';
import { ENVIOS, FRETE_GRATIS, eur, type Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang; return { title: tr(lang)('aj_t'), alternates: { canonical: `/${lang}/ajuda` } };
}
export default async function Ajuda({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang; const t = tr(lang);
  const qs = [1, 2, 3, 4, 5, 6] as const;
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qs.map((i) => ({ '@type': 'Question', name: t(`q${i}`), acceptedAnswer: { '@type': 'Answer', text: t(`a${i}`) } })) };
  return (
    <section><div className="wrap" style={{ maxWidth: 820 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 style={{ fontSize: 'clamp(32px,4.2vw,50px)', marginBottom: 18 }}>{t('aj_t')}</h1>
      <dl className="specs" style={{ marginBottom: 22 }}>
        {Object.values(ENVIOS).map((e) => <div key={e.nome.pt}><dt>{e.nome[lang]}</dt><dd>{eur(e.preco, lang)} · {e.prazo[lang]}</dd></div>)}
        <div><dt>{t('p3t')}</dt><dd>≥ {eur(FRETE_GRATIS, lang)}</dd></div>
      </dl>
      {qs.map((i) => <details key={i} open={i === 1}><summary>{t(`q${i}`)}</summary><p>{t(`a${i}`)}</p></details>)}
    </div></section>
  );
}
