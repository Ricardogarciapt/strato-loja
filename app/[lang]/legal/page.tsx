import type { Metadata } from 'next';
import type { Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang; return { title: tr(lang)('lg_t'), robots: { index: false } };
}
const Ph = ({ c }: { c: string }) => <span className="ph">{c}</span>;
export default async function Legal({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang; const t = tr(lang); const fr = lang === 'fr';
  return (
    <section><div className="wrap legal">
      <h1 style={{ fontSize: 'clamp(32px,4.2vw,50px)' }}>{t('lg_t')}</h1>
      <p className="note">{t('lg_ph')}: <Ph c="[…]" /></p>
      <h3 id="mentions">{t('f_mentions')}</h3>
      <p>STRATO · <Ph c="[forme juridique : micro-entreprise]" /> · Ruben Pereira · SIRET <Ph c="[à compléter]" /> · <Ph c="[adresse de l'atelier]" /> · TVA <Ph c="[n° ou « TVA non applicable, art. 293 B du CGI »]" /> · {fr ? 'Hébergeur' : 'Alojamento'}: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.</p>
      <h3 id="termos">{t('f_termos')}</h3>
      <ul>
        <li>{fr ? 'Prix en euros TTC. Les pièces sont fabriquées à la commande après paiement.' : 'Preços em euros com IVA. As peças são fabricadas por encomenda após o pagamento.'}</li>
        <li>{fr ? 'Droit de rétractation de 14 jours pour les pièces non personnalisées (art. L221-18 Code de la consommation). Exclu pour les pièces personnalisées (art. L221-28 3°).' : 'Direito de livre resolução de 14 dias para peças sem personalização. Excluído para peças personalizadas, conforme a Diretiva 2011/83/UE.'}</li>
        <li>{fr ? 'Garantie légale de conformité de 2 ans et garantie des vices cachés.' : 'Garantia legal de conformidade de 2 anos.'}</li>
        <li>{fr ? 'Garantie d’ajustement STRATO : si la pince ne correspond pas à la cote indiquée, la pièce est réimprimée gratuitement.' : 'Garantia de encaixe STRATO: se o grampo não servir na medida indicada, a peça é reimpressa sem custo.'}</li>
        <li>{fr ? 'Médiateur de la consommation :' : 'Resolução alternativa de litígios:'} <Ph c="[nom du médiateur]" /></li>
      </ul>
      <h3 id="privacidade">{t('f_priv')}</h3>
      <p>{fr ? 'Données utilisées uniquement pour traiter la commande et la livraison (RGPD). Paiement traité par Stripe ; aucune donnée de carte n’est stockée par STRATO. Le panier est gardé dans ton navigateur. Pas de cookies publicitaires. Contact :' : 'Dados usados apenas para processar a encomenda e o envio (RGPD). Pagamento processado pela Stripe; a STRATO não guarda dados de cartão. O carrinho fica guardado no teu browser. Sem cookies de publicidade. Contacto:'} <Ph c="[email do atelier]" /></p>
      <h3>{fr ? 'Modèles 3D et visuels' : 'Modelos 3D e imagens'}</h3>
      <p>{fr ? 'Tous les modèles STRATO sont des créations originales. Éclairage des rendus : HDRI de Poly Haven sous licence CC0.' : 'Todos os modelos STRATO são criações originais. Iluminação dos renders: HDRI da Poly Haven com licença CC0.'}</p>
    </div></section>
  );
}
