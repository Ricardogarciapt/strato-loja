/* Pedido de orçamento B2B. Campo «site» escondido apanha robôs. */
import { NextResponse } from 'next/server';
import { avisarAtelier } from '@/lib/email';

export async function POST(req: Request) {
  let b: Record<string, string>;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (b.site) return NextResponse.json({ ok: true });
  const s = (k: string, n = 200) => String(b[k] ?? '').slice(0, n).trim();
  if (!s('nome') || !/.+@.+\..+/.test(s('email'))) return NextResponse.json({ ok: false }, { status: 400 });
  await avisarAtelier(`Pedido de orçamento STRATO · ${s('tipo')}`, `Nome: ${s('nome')}\nEmail: ${s('email')}\nQuantidade: ${s('quantidade', 40)}\nLíngua: ${s('lang', 4)}\n\n${s('mensagem', 3000)}`);
  return NextResponse.json({ ok: true });
}
