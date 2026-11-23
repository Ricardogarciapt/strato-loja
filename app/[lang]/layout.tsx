import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../globals.css';
import { CartProvider } from '@/lib/cart';
import { LANGS, type Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { SITE_URL, href, isLang } from '@/lib/site';
import { CartButton, LangSwitch, NavMenu, Toast } from '@/components/client-bits';
import { CartDrawer } from '@/components/CartDrawer';
import { PayBadges } from '@/components/blocos';

export const generateStaticParams = () => LANGS.map((lang) => ({ lang }));
export const viewport: Viewport = { themeColor: '#0c0a08', colorScheme: 'dark', viewportFit: 'cover' };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; if (!isLang(lang)) return {};
  const fr = lang === 'fr';
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: fr ? 'STRATO · Objets de bureau personnalisés imprimés en 3D' : 'STRATO · Objetos de secretária personalizados impressos em 3D', template: '%s · STRATO' },
    description: fr
      ? 'Supports de casque, plaques à ton nom et rangement de câbles, dessinés par Ruben Pereira et imprimés en 3D à la commande en France.'
      : 'Suportes de auscultadores, placas com o teu nome e arrumação de cabos, desenhados pelo Ruben Pereira e impressos em 3D por encomenda em França.',
    alternates: { canonical: `/${lang}`, languages: { pt: '/pt', fr: '/fr' } },
    openGraph: { type: 'website', siteName: 'STRATO', locale: fr ? 'fr_FR' : 'pt_PT', images: ['/img/hero.jpg'] },
    icons: { icon: '/favicon.svg' },
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang: l } = await params; if (!isLang(l)) notFound();
  const lang: Lang = l; const t = tr(lang);
  const nav = [
    { r: 'loja', label: t('nav_loja') }, { r: 'projetos', label: t('nav_proj') }, { r: 'packs', label: t('nav_packs') },
    { r: 'empresas', label: t('nav_pers') }, { r: 'sobre', label: t('nav_sobre') }, { r: 'ajuda', label: t('nav_ajuda') },
  ];
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" />
      </head>
      <body>
        <CartProvider>
          <a className="skip" href="#conteudo">{lang === 'fr' ? 'Aller au contenu' : 'Saltar para o conteúdo'}</a>
          <div className="trustbar"><div className="wrap"><span>{t('tb1')}</span><span>{t('tb2')}</span><span>{t('tb3')}</span><span>{t('tb4')}</span></div></div>
          <header>
            <div className="wrap">
              <Link className="logo" href={href(lang)}><span>STRAT<b>O</b></span> <small>by Ruben Pereira</small></Link>
              <NavMenu lang={lang} items={nav} />
              <div className="spacer" />
              <LangSwitch lang={lang} />
              <CartButton label={t('carrinho')} />
            </div>
          </header>
          <main id="conteudo">{children}</main>
          <footer>
            <div className="wrap">
              <div className="cols">
                <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                  <b style={{ fontFamily: 'var(--display)', fontSize: 22, color: 'var(--fg)', letterSpacing: '.07em' }}>STRATO</b>
                  <span>{t('foot1')}</span><PayBadges />
                </div>
                <div><h4>{t('f_loja')}</h4><Link href={href(lang, 'loja')}>{t('nav_loja')}</Link><Link href={href(lang, 'packs')}>{t('nav_packs')}</Link><Link href={href(lang, 'projetos')}>{t('nav_proj')}</Link><Link href={href(lang, 'empresas')}>{t('nav_pers')}</Link></div>
                <div><h4>{t('f_ajuda')}</h4><Link href={href(lang, 'ajuda')}>{t('nav_ajuda')}</Link><Link href={href(lang, 'sobre') + '#garantias'}>{t('f_gar')}</Link><Link href={href(lang, 'sobre')}>{t('nav_sobre')}</Link></div>
                <div><h4>{t('f_legal')}</h4><Link href={href(lang, 'legal') + '#termos'}>{t('f_termos')}</Link><Link href={href(lang, 'legal') + '#privacidade'}>{t('f_priv')}</Link><Link href={href(lang, 'legal') + '#mentions'}>{t('f_mentions')}</Link></div>
              </div>
              <p className="small" style={{ margin: '28px 0 0', color: 'var(--mut2)' }}>© {new Date().getFullYear()} STRATO · Ruben Pereira. {lang === 'fr' ? 'Modèles 3D originaux. Éclairage : HDRI Poly Haven (CC0).' : 'Modelos 3D originais. Iluminação: HDRI Poly Haven (CC0).'}</p>
            </div>
          </footer>
          <CartDrawer lang={lang} />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
