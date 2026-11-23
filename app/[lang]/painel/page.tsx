import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { sessao } from '@/lib/auth';
import { CORES, PACKS, PRODUTOS, eur, type Lang } from '@/lib/catalog';
import { COMUNIDADE } from '@/lib/comunidade';
import { Importador } from '@/components/Importador';
import { Sair } from '@/components/painel/Sair';

export const metadata: Metadata = { title: 'Backoffice', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const TABS = [['resumo', 'Resumo'], ['encomendas', 'Encomendas'], ['curadoria', 'Curadoria MakerWorld'], ['catalogo', 'Catálogo']] as const;

async function encomendas() {
  const key = process.env.STRIPE_SECRET_KEY; if (!key) return null;
  try {
    const s = new Stripe(key);
    const l = await s.checkout.sessions.list({ limit: 30, expand: ['data.line_items'] });
    return l.data.filter((x) => x.payment_status === 'paid');
  } catch { return []; }
}

export default async function Painel({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { lang } = await params; const l = lang as Lang;
  const s = await sessao(); if (!s) redirect(`/${lang}/painel/entrar`);
  const tab = (await searchParams).tab ?? 'resumo';
  const enc = tab === 'encomendas' || tab === 'resumo' ? await encomendas() : null;
  const estado = [
    ['Pagamentos Stripe', !!process.env.STRIPE_SECRET_KEY, 'STRIPE_SECRET_KEY no Vercel'],
    ['Webhook de encomendas', !!process.env.STRIPE_WEBHOOK_SECRET, 'STRIPE_WEBHOOK_SECRET'],
    ['Email ao atelier', !!process.env.RESEND_API_KEY && !!process.env.ATELIER_EMAIL, 'RESEND_API_KEY + ATELIER_EMAIL'],
    ['Publicar curadoria sozinho', !!process.env.GITHUB_TOKEN, 'GITHUB_TOKEN (só escrita neste repositório)'],
  ] as const;
  return (
    <div className="wrap" style={{ padding: '28px 16px 96px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div><h1 style={{ fontSize: 36 }}>Backoffice</h1><p className="mut" style={{ margin: 0 }}>Olá, {s.nome.split(' ')[0]}.</p></div>
        <Sair lang={lang} />
      </div>
      <nav className="seg" style={{ margin: '20px 0', flexWrap: 'wrap' }}>
        {TABS.map(([k, n]) => <Link key={k} href={`/${lang}/painel?tab=${k}`} className={k === tab ? 'on' : ''} style={{ padding: '8px 14px', textDecoration: 'none' }}>{n}</Link>)}
      </nav>

      {tab === 'resumo' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
            <div className="step"><div className="mut small">Encomendas pagas (últimas 30)</div><div style={{ fontSize: 30, fontWeight: 800 }}>{enc ? enc.length : '—'}</div></div>
            <div className="step"><div className="mut small">Faturado nessas encomendas</div><div style={{ fontSize: 30, fontWeight: 800 }}>{enc ? eur(enc.reduce((a, x) => a + (x.amount_total ?? 0), 0) / 100, l) : '—'}</div></div>
            <div className="step"><div className="mut small">Produtos próprios</div><div style={{ fontSize: 30, fontWeight: 800 }}>{PRODUTOS.length}</div></div>
            <div className="step"><div className="mut small">Designs da comunidade</div><div style={{ fontSize: 30, fontWeight: 800 }}>{COMUNIDADE.length}</div></div>
          </div>
          <div className="step"><h3 style={{ fontSize: 20 }}>Estado da loja</h3>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>{estado.map(([n, ok, falta]) => <li key={n}>{ok ? '✅' : '⚪'} {n}{ok ? '' : <span className="mut"> · falta {falta}</span>}</li>)}</ul>
            {!process.env.STRIPE_SECRET_KEY && <p className="mut small">Sem Stripe a loja funciona em modo demonstração: as encomendas não são cobradas.</p>}
          </div>
        </div>
      )}

      {tab === 'encomendas' && (
        enc === null ? <p className="mut">Liga o Stripe (STRIPE_SECRET_KEY) para veres aqui as encomendas pagas, com a personalização de cada peça.</p>
        : enc.length === 0 ? <p className="mut">Ainda não há encomendas pagas.</p>
        : <div style={{ display: 'grid', gap: 12 }}>{enc.map((x) => (
          <div key={x.id} className="step" style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}><b>{x.customer_details?.name ?? '—'}</b><span className="price">{eur((x.amount_total ?? 0) / 100, l)}</span></div>
            <div className="mut small">{new Date(x.created * 1000).toLocaleString('pt-PT')} · {x.customer_details?.email} · {x.customer_details?.address?.city}, {x.customer_details?.address?.country}</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>{x.line_items?.data.map((li) => <li key={li.id}>{li.quantity}× {li.description}</li>)}</ul>
            {x.metadata?.resumo && <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, margin: 0 }}>{x.metadata.resumo}</pre>}
          </div>
        ))}</div>
      )}

      {tab === 'curadoria' && <Importador atuais={COMUNIDADE.map((m) => `${m.titulo.pt} · ${m.criador} · ${m.licenca}`)} sessao />}

      {tab === 'catalogo' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="step" style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr style={{ textAlign: 'left' }}><th>Produto</th><th>Preço</th><th>Material</th><th>Tempo</th><th>Peso</th></tr></thead>
            <tbody>{PRODUTOS.map((p) => <tr key={p.id} style={{ borderTop: '1px solid var(--line)' }}><td><Link href={`/${lang}/produto/${p.id}`}>{p.nome[l]}</Link></td><td className="price">{eur(p.preco, l)}</td><td>{p.sp.mat}</td><td>{p.sp.tempo}</td><td>{p.sp.peso}</td></tr>)}</tbody>
          </table></div>
          <div className="step"><b>Packs:</b> {PACKS.map((p) => `${p.nome[l]} (${eur(p.preco, l)})`).join(' · ')}</div>
          <div className="step"><b>Cores:</b> {CORES.map((c) => c.nome[l] + (c.extra ? ` (+${c.extra} €)` : '')).join(' · ')}</div>
          <p className="mut small">Preços e produtos mudam-se em lib/catalog.ts (é a fonte única: o checkout recalcula tudo no servidor).</p>
        </div>
      )}
    </div>
  );
}
