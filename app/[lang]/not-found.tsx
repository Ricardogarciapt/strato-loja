import Link from 'next/link';
export default function NotFound() {
  return <section><div className="wrap" style={{ display: 'grid', gap: 16 }}><h1 style={{ fontSize: 60 }}>404</h1><p className="lead">Página não encontrada · Page introuvable</p><Link className="btn gold" href="/">STRATO</Link></div></section>;
}
