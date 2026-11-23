/* Cria a sessão de pagamento. O preço é SEMPRE recalculado aqui a partir do catálogo. */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ENVIOS, cor, custoEnvio, pack, precoUnit, produto, subtotal, validarLinha, type EnvioId, type Lang, type Linha } from '@/lib/catalog';
import { modeloCom } from '@/lib/comunidade';
import { descLinha } from '@/components/LinhaView';
import { SITE_URL } from '@/lib/site';

export async function POST(req: Request) {
  let body: { linhas?: Linha[]; envio?: string; lang?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ erro: 'pedido inválido' }, { status: 400 }); }
  const lang: Lang = body.lang === 'fr' ? 'fr' : 'pt';
  const envio = (body.envio && body.envio in ENVIOS ? body.envio : 'mr') as EnvioId;
  const brutas = Array.isArray(body.linhas) ? body.linhas.slice(0, 40) : [];
  const linhas = brutas.map(validarLinha).filter((l): l is Linha => !!l);
  if (!linhas.length || linhas.length !== brutas.length) return NextResponse.json({ erro: 'carrinho inválido' }, { status: 400 });

  const sub = subtotal(linhas); const frete = custoEnvio(sub, envio);
  const nomeDe = (l: Linha) => (l.com ? modeloCom(l.com)!.titulo[lang] : l.pack ? pack(l.pack)!.nome[lang] : produto(l.id!)!.nome[lang]);
  const resumo = linhas.map((l) => `${l.q}× ${nomeDe(l)}${l.pack ? '' : ` (${descLinha(l, lang)})`}`).join('\n');

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // modo demonstração: sem cobrança
    const n = 'ST-' + String(Date.now()).slice(-6);
    return NextResponse.json({ demo: true, encomenda: { n, linhas: linhas.map((l) => ({ ...l, total: precoUnit(l) * l.q })), total: sub + frete } });
  }

  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment', locale: lang,
    line_items: linhas.map((l) => ({
      quantity: l.q,
      price_data: {
        currency: 'eur', unit_amount: Math.round(precoUnit(l) * 100),
        product_data: {
          name: nomeDe(l),
          description: l.pack ? undefined : descLinha(l, lang) || undefined,
          images: [l.com ? modeloCom(l.com)!.imagem : `${SITE_URL}/img/${l.pack ? pack(l.pack)!.itens[0] : l.id}.jpg`],
          metadata: { id: l.id ?? l.pack ?? l.com ?? '', licenca: l.com ? `${modeloCom(l.com)!.licenca} · ${modeloCom(l.com)!.url}` : '', cor: cor(l.cor ?? '')?.id ?? '', texto: l.txt ?? '', medida: l.med != null ? String(l.med) : '', logo: l.logo ? 'sim (pedir ficheiro ao cliente)' : '' },
        },
      },
    })),
    shipping_address_collection: { allowed_countries: ['FR', 'PT', 'BE', 'ES', 'LU'] },
    shipping_options: [{ shipping_rate_data: { type: 'fixed_amount', display_name: ENVIOS[envio].nome[lang], fixed_amount: { amount: Math.round(frete * 100), currency: 'eur' } } }],
    phone_number_collection: { enabled: true },
    consent_collection: { terms_of_service: 'required' },
    custom_text: { terms_of_service_acceptance: { message: lang === 'fr' ? `J'accepte les [CGV](${SITE_URL}/fr/legal#termos).` : `Aceito os [termos e condições](${SITE_URL}/pt/legal#termos).` } },
    metadata: { resumo: resumo.slice(0, 480), envio },
    success_url: `${SITE_URL}/${lang}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/${lang}/checkout`,
  });
  return NextResponse.json({ url: session.url });
}
