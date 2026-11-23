import Link from 'next/link';
import type { Lang } from '@/lib/catalog';
import { tr, type Chave } from '@/lib/i18n';

const CATS = ['todos', 'pers', 'audio', 'cabos', 'secretaria', 'gaming'] as const;
export function Filtros({ lang, atual }: { lang: Lang; atual: string }) {
  const t = tr(lang);
  return (
    <div className="filters">
      {CATS.map((c) => (
        <Link key={c} className={`chip ${c === atual ? 'on' : ''}`} style={{ textDecoration: 'none' }} href={c === 'todos' ? `/${lang}/loja` : `/${lang}/loja?cat=${c}`} scroll={false}>
          {t(c === 'todos' ? 'todos' : (`cat_${c}` as Chave))}
        </Link>
      ))}
    </div>
  );
}
