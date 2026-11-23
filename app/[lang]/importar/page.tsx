import type { Metadata } from 'next';
import { Importador } from '@/components/Importador';
import { COMUNIDADE } from '@/lib/comunidade';

export const metadata: Metadata = { title: 'Curadoria MakerWorld', robots: { index: false, follow: false } };

export default function Importar() {
  return <div className="wrap" style={{ padding: '32px 16px 80px', maxWidth: 760 }}><Importador atuais={COMUNIDADE.map((m) => `${m.titulo.pt} · ${m.criador} · ${m.licenca}`)} /></div>;
}
