/* Curadoria MakerWorld: analisar um link e, se a licença o permitir, publicar na montra. Protegido por IMPORT_TOKEN. */
import { NextResponse } from 'next/server';
import { lerModelo } from '@/lib/makerworld';
import { guardarModelo } from '@/lib/github-dados';
import { cor } from '@/lib/catalog';
import type { ModeloComunidade } from '@/lib/comunidade';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})) as { url?: string; token?: string; comercialPago?: boolean; publicar?: boolean; preco?: number; cor?: string; tituloFr?: string; tituloPt?: string };
  const tk = process.env.IMPORT_TOKEN;
  if (!tk || b.token !== tk) return NextResponse.json({ ok: false, motivo: tk ? 'código de acesso errado' : 'IMPORT_TOKEN não configurado no servidor' }, { status: 401 });
  const l = await lerModelo(String(b.url ?? ''), !!b.comercialPago);
  if (!l.ok || !b.publicar) return NextResponse.json(l);
  const preco = Number(b.preco); if (!(preco >= 3 && preco <= 300)) return NextResponse.json({ ...l, ok: false, motivo: 'preço entre 3 € e 300 €' });
  const m: ModeloComunidade = {
    id: l.id!, titulo: { pt: (b.tituloPt || l.titulo!).slice(0, 80), fr: (b.tituloFr || l.titulo!).slice(0, 80) },
    criador: l.criador!, perfil: l.perfil!, url: l.url!, licenca: l.licenca!, imagem: l.imagem ?? '/img/hero.jpg',
    preco: Math.round(preco * 100) / 100, cor: cor(b.cor ?? '') ? b.cor! : 'grafite', importado: new Date().toISOString().slice(0, 10),
  };
  const g = await guardarModelo(m);
  return NextResponse.json({ ...l, publicado: g.ok, motivo: g.motivo, modelo: m });
}
