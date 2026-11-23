/* Stripe avisa aqui quando um pagamento fica concluído: o atelier recebe a ordem de impressão. */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { avisarAtelier } from '@/lib/email';

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY; const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) return NextResponse.json({ ok: false, erro: 'Stripe não configurada' }, { status: 503 });
  const stripe = new Stripe(key);
  const raw = await req.text(); const sig = req.headers.get('stripe-signature') || '';
  let ev: Stripe.Event;
  try { ev = stripe.webhooks.constructEvent(raw, sig, secret); } catch { return NextResponse.json({ erro: 'assinatura inválida' }, { status: 400 }); }
  if (ev.type === 'checkout.session.completed') {
    const s = ev.data.object as Stripe.Checkout.Session;
    const items = await stripe.checkout.sessions.listLineItems(s.id, { limit: 50, expand: ['data.price.product'] });
    const linhas = items.data.map((i) => { const p = i.price?.product as Stripe.Product | undefined; const m = p?.metadata || {};
      return `• ${i.quantity}× ${i.description} — cor ${m.cor || '-'}${m.texto ? `, texto «${m.texto}»` : ''}${m.medida ? `, medida ${m.medida} cm` : ''}${m.logo ? ', LOGÓTIPO: pedir ficheiro' : ''}`; });
    const ship = (s as unknown as { collected_information?: { shipping_details?: { name?: string; address?: Stripe.Address } } }).collected_information?.shipping_details;
    const a = ship?.address;
    await avisarAtelier(`Nova encomenda STRATO · ${((s.amount_total ?? 0) / 100).toFixed(2)} €`,
      `${linhas.join('\n')}\n\nEnvio: ${s.metadata?.envio}\nCliente: ${ship?.name ?? ''} · ${s.customer_details?.email ?? ''} · ${s.customer_details?.phone ?? ''}\nMorada: ${a ? [a.line1, a.line2, a.postal_code, a.city, a.country].filter(Boolean).join(', ') : '-'}\nSessão: ${s.id}`);
  }
  return NextResponse.json({ ok: true });
}
