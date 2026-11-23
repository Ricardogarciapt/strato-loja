'use client';
export function Sair({ lang }: { lang: string }) {
  return <button className="btn ghost sm" onClick={async () => { await fetch('/api/painel/sair', { method: 'POST' }); location.href = `/${lang}/painel/entrar`; }}>Sair</button>;
}
