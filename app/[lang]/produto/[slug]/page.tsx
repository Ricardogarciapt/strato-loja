import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LANGS, PRODUTOS, cor, produto, type Lang } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site';
import { Configurator } from '@/components/Configurator';
import { Related } from '@/components/blocos';

export const generateStaticParams = () => LANGS.flatMap((lang) => PRODUTOS.map((p) => ({ lang, slug: p.id })));

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params; const p = produto(slug); if (!p) return {};
  const l = lang as Lang;
  return {
    title: p.nome[l], description: p.desc[l],
    alternates: { canonical: `/${l}/produto/${p.id}`, languages: { pt: `/pt/produto/${p.id}`, fr: `/fr/produto/${p.id}` } },
    openGraph: { title: p.nome[l], description: p.desc[l], images: [`/img/${p.id}.jpg`] },
  };
}

export default async function Produto({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params; const p = produto(slug); if (!p) notFound();
  const l = lang as Lang;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.nome[l], description: p.desc[l],
    image: `${SITE_URL}/img/${p.id}.jpg`, brand: { '@type': 'Brand', name: 'STRATO' }, material: p.sp.mat,
    color: cor(p.cor)?.nome[l], sku: `STRATO-${p.id}`,
    offers: { '@type': 'Offer', priceCurrency: 'EUR', price: p.preco.toFixed(2), availability: 'https://schema.org/MadeToOrder', url: `${SITE_URL}/${l}/produto/${p.id}` },
  };
  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Configurator id={p.id} lang={l} />
      <Related p={p} lang={l} />
    </div>
  );
}
