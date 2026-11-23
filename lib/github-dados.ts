/* Grava data/comunidade.json no repositório (o Vercel volta a publicar sozinho). Só corre com GITHUB_TOKEN. */
import type { ModeloComunidade } from './comunidade';

const REPO = process.env.GITHUB_REPO || 'Ricardogarciapt/strato-loja';
const FICH = 'data/comunidade.json';

export async function guardarModelo(m: ModeloComunidade): Promise<{ ok: boolean; motivo?: string }> {
  const token = process.env.GITHUB_TOKEN; if (!token) return { ok: false, motivo: 'sem GITHUB_TOKEN: copia o JSON para data/comunidade.json' };
  const h = { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'strato-loja' };
  const api = `https://api.github.com/repos/${REPO}/contents/${FICH}`;
  const r = await fetch(api, { headers: h, cache: 'no-store' }); if (!r.ok) return { ok: false, motivo: `GitHub ${r.status}` };
  const j = await r.json() as { sha: string; content: string };
  const lista: ModeloComunidade[] = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8'));
  const nova = [...lista.filter((x) => x.id !== m.id), m];
  const w = await fetch(api, { method: 'PUT', headers: h, body: JSON.stringify({
    message: `comunidade: ${m.titulo.pt} (${m.licenca}, ${m.criador})`,
    content: Buffer.from(JSON.stringify(nova, null, 2) + '\n').toString('base64'), sha: j.sha,
  }) });
  return w.ok ? { ok: true } : { ok: false, motivo: `GitHub ${w.status}` };
}
