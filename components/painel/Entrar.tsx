'use client';
import { useState } from 'react';

export function Entrar({ lang }: { lang: string }) {
  const fr = lang === 'fr';
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [erro, setErro] = useState(''); const [a, setA] = useState(false);
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault(); setA(true); setErro('');
    const r = await fetch('/api/painel/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: pw }) });
    const j = await r.json().catch(() => ({ ok: false, motivo: 'Erro' }));
    if (j.ok) location.href = `/${lang}/painel`; else { setErro(j.motivo); setA(false); }
  };
  return (
    <div className="wrap" style={{ maxWidth: 440, padding: '64px 16px 96px' }}>
      <form onSubmit={enviar} className="step" style={{ display: 'grid', gap: 14 }}>
        <h1 style={{ fontSize: 32 }}>Backoffice</h1>
        <p className="mut" style={{ margin: 0 }}>{fr ? 'Connecte-toi avec ton compte morethanmoney.pt.' : 'Entra com a tua conta do morethanmoney.pt.'}</p>
        <div className="opt"><label htmlFor="em">Email</label><input id="em" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="opt"><label htmlFor="pw">{fr ? 'Mot de passe' : 'Palavra-passe'}</label><input id="pw" type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        {erro && <p role="alert" style={{ color: '#e07a5f', margin: 0 }}>{erro}</p>}
        <button className="btn gold" disabled={a}>{a ? '…' : fr ? 'Entrer' : 'Entrar'}</button>
        <p className="small mut" style={{ margin: 0 }}>{fr ? 'Mot de passe oublié ? Réinitialise-le sur morethanmoney.pt.' : 'Esqueceste a palavra-passe? Recupera-a em morethanmoney.pt.'}</p>
      </form>
    </div>
  );
}
