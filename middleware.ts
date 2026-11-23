import { NextResponse, type NextRequest } from 'next/server';

/* Envia quem chega à raiz para /pt ou /fr conforme a língua do browser (França por omissão). */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/') {
    const al = (req.headers.get('accept-language') || '').toLowerCase();
    const lang = al.startsWith('pt') ? 'pt' : 'fr';
    return NextResponse.redirect(new URL(`/${lang}`, req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/'] };
