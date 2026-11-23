import type { Metadata } from 'next';
import { PRODUTOS, type Categoria, type Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { Guarantees, ProductCard } from '@/components/blocos';
import { Filtros } from './Filtros';
import { MontraComunidade } from '@/components/Comunidade';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang; return { title: tr(lang)('loja_t'), alternates: { canonical: `/${lang}/loja`, languages: { pt: '/pt/loja', fr: '/fr/loja' } } };
}

export default async function Loja({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ cat?: string }> }) {
  const lang = (await params).lang as Lang; const t = tr(lang); const cat = (await searchParams).cat as Categoria | undefined;
  const list = PRODUTOS.filter((p) => !cat || p.cat === cat);
  return (
    <>
      <section><div className="wrap">
        <div className="head"><h1 style={{ fontSize: 'clamp(32px,4.2vw,50px)' }}>{t('loja_t')}</h1><Filtros lang={lang} atual={cat ?? 'todos'} /></div>
        <div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} lang={lang} />)}</div>
      </div></section>
      {!cat && <MontraComunidade lang={lang} />}
      <Guarantees lang={lang} />
    </>
  );
}
