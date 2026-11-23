import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { sessao } from '@/lib/auth';
import { Entrar } from '@/components/painel/Entrar';

export const metadata: Metadata = { title: 'Backoffice', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function Pagina({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (await sessao()) redirect(`/${lang}/painel`);
  return <Entrar lang={lang} />;
}
