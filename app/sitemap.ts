import type { MetadataRoute } from 'next';
import { LANGS, PRODUTOS } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const paginas = ['', 'loja', 'projetos', 'packs', 'empresas', 'sobre', 'ajuda', ...PRODUTOS.map((p) => `produto/${p.id}`)];
  return paginas.flatMap((p) => LANGS.map((l) => ({
    url: `${SITE_URL}/${l}${p ? '/' + p : ''}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : p.startsWith('produto') ? 0.8 : 0.6,
    alternates: { languages: Object.fromEntries(LANGS.map((x) => [x, `${SITE_URL}/${x}${p ? '/' + p : ''}`])) },
  })));
}
