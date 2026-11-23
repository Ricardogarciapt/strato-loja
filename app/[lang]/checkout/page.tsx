import type { Metadata } from 'next';
import type { Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { Checkout } from '@/components/Checkout';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang; return { title: tr(lang)('co_t'), robots: { index: false } };
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <Checkout lang={(await params).lang as Lang} />;
}
