import type { Metadata } from 'next';
import { PROJETOS, type Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { CaseStudy } from '@/components/blocos';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang; return { title: tr(lang)('pf_t'), alternates: { canonical: `/${lang}/projetos` } };
}
export default async function Projetos({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang; const t = tr(lang);
  return (
    <section><div className="wrap">
      <div className="head"><div><span className="eyebrow">{t('pf_eb')}</span><h1 style={{ fontSize: 'clamp(32px,4.2vw,50px)' }}>{t('pf_t')}</h1><p className="mut" style={{ maxWidth: '62ch' }}>{t('pf_s')}</p></div></div>
      <div className="pf">{PROJETOS.map((c) => <CaseStudy key={c.id} c={c} lang={lang} />)}</div>
    </div></section>
  );
}
