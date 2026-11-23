import type { Metadata } from 'next';
import Image from 'next/image';
import { PROJETOS, type Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { CaseStudy } from '@/components/blocos';
import { B2BForm } from '@/components/B2BForm';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang; return { title: tr(lang)('emp_t'), alternates: { canonical: `/${lang}/empresas` } };
}
export default async function Empresas({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang; const t = tr(lang);
  return (
    <>
      <section><div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: 40, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <span className="eyebrow">{t('emp_eb')}</span><h1 style={{ fontSize: 'clamp(32px,4.2vw,50px)' }}>{t('emp_t')}</h1><p className="lead">{t('emp_p')}</p>
          <div className="assure">{([1, 2, 3, 4] as const).map((i) => <div key={i}>{t(`emp_l${i}`)}</div>)}</div>
          <Image src="/img/proj/equipa.jpg" alt="" width={1400} height={900} style={{ borderRadius: 18, maxWidth: '100%', height: 'auto' }} />
        </div>
        <B2BForm lang={lang} />
      </div></section>
      <section style={{ paddingTop: 0 }}><div className="wrap"><CaseStudy c={PROJETOS[2]} lang={lang} /></div></section>
    </>
  );
}
