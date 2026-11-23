import { redirect } from 'next/navigation';
export default async function Importar({ params }: { params: Promise<{ lang: string }> }) { redirect(`/${(await params).lang}/painel?tab=curadoria`); }
