import type { Metadata } from 'next';
import type { Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { Obrigado } from '@/components/Obrigado';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang; return { title: tr(lang)('ok_t'), robots: { index: false } };
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <Obrigado lang={(await params).lang as Lang} />;
}
