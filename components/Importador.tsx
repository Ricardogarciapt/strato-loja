'use client';
/* Curadoria MakerWorld (só para o atelier). Cola um link → a loja lê a licença → se permitir venda, publica com crédito. */
import { useState } from 'react';
import { CORES } from '@/lib/catalog';

type R = { ok: boolean; motivo?: string; titulo?: string; criador?: string; licenca?: string | null; licencaTexto?: string; imagem?: string; url?: string; publicado?: boolean; modelo?: unknown };

export function Importador({ atuais, sessao = false }: { atuais: string[]; sessao?: boolean }) {
  const [url, setUrl] = useState(''); const [token, setToken] = useState(''); const [pago, setPago] = useState(false);
  const [preco, setPreco] = useState('14.90'); const [corSel, setCor] = useState('grafite'); const [tPt, setTPt] = useState(''); const [tFr, setTFr] = useState('');
  const [r, setR] = useState<R | null>(null); const [aOcupar, setOc] = useState(false);
  const pedir = async (publicar: boolean) => {
    setOc(true);
    const res = await fetch('/api/importar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url, token, comercialPago: pago, publicar, preco: Number(preco.replace(',', '.')), cor: corSel, tituloPt: tPt, tituloFr: tFr }) });
    const j = await res.json().catch(() => ({ ok: false, motivo: 'erro' })); setR(j); setOc(false);
    if (j.titulo && !tPt) { setTPt(j.titulo); setTFr(j.titulo); }
  };
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ fontSize: 28 }}>Curadoria MakerWorld</h2>
      <p className="mut">Só entram modelos com licença que permite vender impressões (CC0, CC BY, CC BY-SA) ou de criadores com quem tens licença comercial paga do MakerWorld. A montra mostra sempre o crédito. O ficheiro nunca é vendido nem publicado.</p>
      <div className="opt"><label htmlFor="mw">Link do modelo</label><input id="mw" type="url" placeholder="https://makerworld.com/pt/models/123456" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
      {!sessao && <div className="opt"><label htmlFor="tk">Código de acesso</label><input id="tk" type="password" value={token} onChange={(e) => setToken(e.target.value)} /></div>}
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}><input type="checkbox" checked={pago} onChange={(e) => setPago(e.target.checked)} /> Tenho licença comercial paga do MakerWorld para este criador</label>
      <button className="btn" disabled={aOcupar || !url} onClick={() => pedir(false)}>Analisar licença</button>
      {r && (
        <div className="step" style={{ display: 'grid', gap: 10 }}>
          {r.imagem && <img src={r.imagem} alt="" referrerPolicy="no-referrer" style={{ width: 180, borderRadius: 12 }} />}
          <div><b>{r.titulo ?? '—'}</b>{r.criador ? ` · ${r.criador}` : ''}</div>
          <div>Licença lida: <b>{r.licencaTexto || 'desconhecida'}</b> → {r.ok ? <span style={{ color: 'var(--gold)' }}>pode entrar ({r.licenca})</span> : <span style={{ color: '#e07a5f' }}>{r.motivo}</span>}</div>
          {r.ok && !r.publicado && (<>
            <div className="opt"><label>Nome (PT)</label><input value={tPt} onChange={(e) => setTPt(e.target.value)} /></div>
            <div className="opt"><label>Nom (FR)</label><input value={tFr} onChange={(e) => setTFr(e.target.value)} /></div>
            <div className="opt"><label>Preço da peça impressa (€)</label><input value={preco} onChange={(e) => setPreco(e.target.value)} inputMode="decimal" /></div>
            <div className="opt"><label>Cor sugerida</label><select value={corSel} onChange={(e) => setCor(e.target.value)}>{CORES.map((c) => <option key={c.id} value={c.id}>{c.nome.pt}</option>)}</select></div>
            <button className="btn gold" disabled={aOcupar} onClick={() => pedir(true)}>Publicar na montra</button>
          </>)}
          {r.publicado && <div style={{ color: 'var(--gold)' }}>Publicado. A loja volta a ser publicada sozinha em 1 a 2 minutos.</div>}
          {r.modelo != null && !r.publicado && <details><summary>JSON para data/comunidade.json</summary><pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(r.modelo, null, 2)}</pre></details>}
        </div>
      )}
      <div><h3 style={{ fontSize: 20 }}>Na montra ({atuais.length})</h3><ul className="mut">{atuais.map((a) => <li key={a}>{a}</li>)}</ul></div>
    </div>
  );
}
