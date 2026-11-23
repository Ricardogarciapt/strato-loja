import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LANGS, type Lang } from '@/lib/catalog';
import { COMUNIDADE, modeloCom } from '@/lib/comunidade';
import { ComAdd } from '@/components/ComAdd';
import { TXT_COM } from '@/components/Comunidade';

export const generateStaticParams = () => LANGS.flatMap((lang) => COMUNIDADE.map((m) => ({ lang, id: m.id })));
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang, id } = await params; const m = modeloCom(id); if (!m) return {};
  return { title: m.titulo[lang as Lang], description: `${TXT_COM[lang as Lang].por} ${m.criador} · ${m.licenca}` };
}

export default async function PecaComunidade({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params; const m = modeloCom(id); if (!m) notFound();
  const l = lang as Lang; const T = TXT_COM[l];
  return (
    <div className="wrap"><div className="pd" style={{ paddingTop: 24 }}>
      <div className="vcol"><div className="viewer" style={{ display: 'grid', placeItems: 'center' }}>
        <img src={m.imagem} alt={m.titulo[l]} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div></div>
      <div className="buy">
        <div className="ptop"><h1 style={{ fontSize: 'clamp(30px,3.4vw,44px)' }}>{m.titulo[l]}</h1>
          <p className="desc">{T.por} <a href={m.perfil} target="_blank" rel="noopener noreferrer">{m.criador}</a> · {T.lic} <b>{m.licenca}</b> · <a href={m.url} target="_blank" rel="noopener noreferrer">{T.ver}</a></p>
          <p className="small mut">{T.nota}</p></div>
        <ComAdd id={m.id} preco={m.preco} corDef={m.cor} lang={l} T={T} />
      </div>
    </div></div>
  );
}
