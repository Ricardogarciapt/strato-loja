import type { Lang } from './catalog';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const isLang = (x: string): x is Lang => x === 'pt' || x === 'fr';
export const href = (lang: Lang, p = '') => `/${lang}${p ? '/' + p.replace(/^\//, '') : ''}`;
