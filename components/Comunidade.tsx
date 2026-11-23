/* Montra «Designs da comunidade»: modelos MakerWorld com licença comercial, sempre com crédito ao criador. */
import Link from 'next/link';
import { eur, type Lang } from '@/lib/catalog';
import { COMUNIDADE, type ModeloComunidade } from '@/lib/comunidade';
import { href } from '@/lib/site';

export const TXT_COM = {
  pt: { t: 'Designs da comunidade', p: 'Modelos de criadores do MakerWorld com licença que permite a venda, impressos por nós no atelier. O crédito é sempre do criador; vendemos só a peça impressa, nunca o ficheiro.', por: 'Design de', lic: 'Licença', ver: 'Ver o modelo original', add: 'Adicionar ao carrinho', ok: 'Adicionado ao carrinho', cor: 'Cor', nota: 'Impressa por encomenda no atelier STRATO em França. Sem personalização de nome nesta peça.' },
  fr: { t: 'Designs de la communauté', p: 'Des modèles de créateurs MakerWorld sous licence autorisant la vente, imprimés par nos soins à l’atelier. Le crédit revient toujours au créateur ; nous vendons uniquement la pièce imprimée, jamais le fichier.', por: 'Design de', lic: 'Licence', ver: 'Voir le modèle original', add: 'Ajouter au panier', ok: 'Ajouté au panier', cor: 'Couleur', nota: 'Imprimée à la commande à l’atelier STRATO en France. Pas de personnalisation de nom sur cette pièce.' },
} as const;

export function CartaoComunidade({ m, lang }: { m: ModeloComunidade; lang: Lang }) {
  const T = TXT_COM[lang];
  return (
    <Link className="pc" href={href(lang, `comunidade/${m.id}`)}>
      <div className="ph"><img src={m.imagem} alt={m.titulo[lang]} loading="lazy" referrerPolicy="no-referrer" /><span className="tag">{m.licenca}</span></div>
      <div className="nm">{m.titulo[lang]}</div>
      <div className="meta"><span className="price">{eur(m.preco, lang)}</span><span className="opts">{T.por} {m.criador}</span></div>
    </Link>
  );
}

export function MontraComunidade({ lang }: { lang: Lang }) {
  if (!COMUNIDADE.length) return null;
  const T = TXT_COM[lang];
  return (
    <section id="comunidade"><div className="wrap">
      <div className="head"><div><h2>{T.t}</h2><p className="mut" style={{ maxWidth: 640, margin: '8px 0 0' }}>{T.p}</p></div></div>
      <div className="grid">{COMUNIDADE.map((m) => <CartaoComunidade key={m.id} m={m} lang={lang} />)}</div>
    </div></section>
  );
}
