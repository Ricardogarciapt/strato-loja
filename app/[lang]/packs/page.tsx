import type { Metadata } from 'next';
import { PACKS, type Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { Guarantees, PackCard } from '@/components/blocos';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang; return { title: tr(lang)('nav_packs'), alternates: { canonical: `/${lang}/packs` } };
}
export default async function Packs({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang; const t = tr(lang);
  return (
    <>
      <section><div className="wrap">
        <div className="head"><div><h1 style={{ fontSize: 'clamp(32px,4.2vw,50px)' }}>{t('packs_t')}</h1><p className="mut">{t('packs_s')}</p></div></div>
        <div className="packs">{PACKS.map((pk) => <PackCard key={pk.id} pk={pk} lang={lang} />)}</div>
      </div></section>
      <Guarantees lang={lang} />
    </>
  );
}
