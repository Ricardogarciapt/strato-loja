import { NextResponse } from 'next/server';
import { COOKIE, entrar, opcoesCookie } from '@/lib/auth';

export const runtime = 'nodejs';
const tentativas = new Map<string, { n: number; t: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'x';
  const a = tentativas.get(ip); const agora = Date.now();
  if (a && agora - a.t < 15 * 60_000 && a.n >= 8) return NextResponse.json({ ok: false, motivo: 'Demasiadas tentativas. Espera 15 minutos.' }, { status: 429 });
  const b = await req.json().catch(() => ({})) as { email?: string; password?: string };
  const email = String(b.email ?? '').trim().slice(0, 200); const password = String(b.password ?? '').slice(0, 200);
  if (!email || !password) return NextResponse.json({ ok: false, motivo: 'Preenche o email e a palavra-passe.' }, { status: 400 });
  const r = await entrar(email, password);
  if (!r.ok) { tentativas.set(ip, { n: (a && agora - a.t < 15 * 60_000 ? a.n : 0) + 1, t: a && agora - a.t < 15 * 60_000 ? a.t : agora }); return NextResponse.json(r, { status: 401 }); }
  tentativas.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, JSON.stringify({ t: r.token, r: r.refresh }), opcoesCookie());
  return res;
}
