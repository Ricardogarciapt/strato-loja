import type { Metadata } from 'next';
import type { Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { Atelier, Guarantees, Process } from '@/components/blocos';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang; return { title: tr(lang)('nav_sobre'), alternates: { canonical: `/${lang}/sobre` } };
}
export default async function Sobre({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  return <><Atelier lang={lang} /><Process lang={lang} /><Guarantees lang={lang} /></>;
}
