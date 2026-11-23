/* Backoffice: login com a conta do Ruben no morethanmoney.pt (Supabase Auth da MTM).
   A STRATO nunca guarda palavras-passe: pede o token à Supabase e guarda-o num cookie httpOnly.
   Cada pedido volta a validar o token na Supabase e confirma que é uma conta autorizada. */
import { cookies } from 'next/headers';

export const SB_URL = process.env.MTM_SUPABASE_URL || 'https://iwscxotvmtkphajmasof.supabase.co';
// chave pública (anon) da Supabase da MTM: é pública por natureza; a segurança vem das regras da Supabase
export const SB_ANON = process.env.MTM_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3c2N4b3R2bXRrcGhham1hc29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NDIzNjMsImV4cCI6MjA2NTIxODM2M30._FbOwT_oVoDWWlWCZphNnwLckL1A0AzkEUSdJZkOecg';
// contas autorizadas (ids de utilizador na MTM). Por omissão: Ruben Pereira, educador.
export const AUTORIZADOS = (process.env.BACKOFFICE_USER_IDS || '1ea8d497-6cf3-40b1-b2aa-826f16091391').split(',').map((s) => s.trim()).filter(Boolean);
export const COOKIE = 'strato_sessao';

export type Sessao = { id: string; email: string; nome: string };

export async function entrar(email: string, password: string): Promise<{ ok: true; token: string; refresh: string; expira: number } | { ok: false; motivo: string }> {
  let r: Response;
  try {
    r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: { apikey: SB_ANON, 'content-type': 'application/json' }, body: JSON.stringify({ email, password }), cache: 'no-store',
    });
  } catch { return { ok: false, motivo: 'Não foi possível contactar o morethanmoney.pt. Tenta daqui a pouco.' }; }
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) return { ok: false, motivo: 'Email ou palavra-passe errados.' };
  if (!AUTORIZADOS.includes(j.user?.id)) return { ok: false, motivo: 'Esta conta não tem acesso ao backoffice da STRATO.' };
  return { ok: true, token: j.access_token, refresh: j.refresh_token, expira: j.expires_in ?? 3600 };
}

async function utilizador(token: string): Promise<Sessao | null> {
  const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_ANON, authorization: `Bearer ${token}` }, cache: 'no-store' }).catch(() => null);
  if (!r?.ok) return null;
  const u = await r.json();
  if (!AUTORIZADOS.includes(u.id)) return null;
  return { id: u.id, email: u.email, nome: u.user_metadata?.full_name || u.user_metadata?.name || 'Ruben' };
}

/** Sessão atual (ou null). Se o token expirou, renova-o com o refresh token. */
export async function sessao(): Promise<Sessao | null> {
  const jar = await cookies(); const raw = jar.get(COOKIE)?.value; if (!raw) return null;
  let c: { t: string; r: string };
  try { c = JSON.parse(raw); } catch { return null; }
  const s = await utilizador(c.t); if (s) return s;
  const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST', headers: { apikey: SB_ANON, 'content-type': 'application/json' }, body: JSON.stringify({ refresh_token: c.r }), cache: 'no-store',
  }).catch(() => null);
  if (!r?.ok) return null;
  const j = await r.json();
  try { jar.set(COOKIE, JSON.stringify({ t: j.access_token, r: j.refresh_token }), opcoesCookie()); } catch { /* em páginas não se pode escrever cookies: fica para o próximo pedido */ }
  return utilizador(j.access_token);
}

export const opcoesCookie = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 * 14 });
