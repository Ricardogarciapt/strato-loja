'use client';
/* Checkout: revê a encomenda, escolhe o envio e segue para o pagamento seguro da Stripe
   (morada e email são pedidos pela Stripe). Sem chaves Stripe, corre em modo demonstração. */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { ENVIOS, custoEnvio, eur, totalLinha, type EnvioId, type Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';
import { href } from '@/lib/site';
import { LinhaView } from './LinhaView';
import { PayBadges } from './blocos-client';

export function Checkout({ lang }: { lang: Lang }) {
  const t = tr(lang); const c = useCart(); const router = useRouter();
  const [envio, setEnvio] = useState<EnvioId>('mr');
  const [aceito, setAceito] = useState(false);
  const [estado, setEstado] = useState<'idle' | 'aguarda' | 'erro'>('idle');
  const [erro, setErro] = useState('');
  const fr = lang === 'fr';

  if (!c.linhas.length) {
    return <section><div className="wrap"><h1 style={{ fontSize: 40 }}>{t('cart_t')}</h1><p className="mut">{t('vazio')}</p><Link className="btn gold" href={href(lang, 'loja')}>{t('voltar')}</Link></div></section>;
  }
  const sh = custoEnvio(c.sub, envio); const tot = c.sub + sh;
  const temPers = c.linhas.some((l) => l.txt || l.logo || l.med != null);

  async function pagar(e: React.FormEvent) {
    e.preventDefault();
    if (!aceito) { setErro(fr ? 'Accepte les conditions générales pour continuer.' : 'Aceita os termos e condições para continuar.'); setEstado('erro'); return; }
    setEstado('aguarda'); setErro('');
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ linhas: c.linhas, envio, lang }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'erro');
      if (j.url) { window.location.href = j.url; return; }
      try { sessionStorage.setItem('strato_ultima', JSON.stringify(j.encomenda)); } catch { /* sem armazenamento */ }
      c.limpar(); router.push(href(lang, `obrigado?demo=${j.encomenda.n}`));
    } catch {
      setEstado('erro'); setErro(fr ? 'Le paiement n’a pas pu démarrer. Réessaie dans un instant.' : 'Não foi possível iniciar o pagamento. Tenta de novo daqui a pouco.');
    }
  }

  return (
    <div className="wrap"><div className="co">
      <form onSubmit={pagar} noValidate>
        <h1 style={{ fontSize: 'clamp(32px,4.2vw,50px)' }}>{t('co_t')}</h1>
        <div className="costeps"><b>1 {t('co_env')}</b>›<span>2 {t('co_pag')} (Stripe)</span>›<span>3 {t('tl1')}</span></div>
        <fieldset><legend>{t('co_env')}</legend>
          {(Object.keys(ENVIOS) as EnvioId[]).map((k) => (
            <label key={k} className="radio">
              <input type="radio" name="env" value={k} checked={envio === k} onChange={() => setEnvio(k)} />
              <span className="grow"><b>{ENVIOS[k].nome[lang]}</b><br /><span className="small mut">{ENVIOS[k].prazo[lang]}</span></span>
              <span className="price">{custoEnvio(c.sub, k) ? eur(ENVIOS[k].preco, lang) : t('gratis_l')}</span>
            </label>
          ))}
        </fieldset>
        <fieldset><legend>{t('co_pag')}</legend>
          <PayBadges />
          <p className="small mut" style={{ margin: 0 }}>{fr ? 'Tu saisis ton adresse et ton paiement sur la page sécurisée de Stripe. Aucune donnée de carte ne passe par STRATO.' : 'Indicas a morada e o pagamento na página segura da Stripe. Nenhum dado de cartão passa pela STRATO.'}</p>
          {temPers && <p className="note">{fr ? 'Ta commande contient des pièces personnalisées : elles sont fabriquées pour toi et ne sont pas reprises pour rétractation. La garantie légale et la garantie d’ajustement s’appliquent toujours.' : 'A tua encomenda tem peças personalizadas: são feitas só para ti e não têm devolução por arrependimento. A garantia legal e a garantia de encaixe aplicam-se sempre.'}</p>}
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
            <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--gold)' }} />
            <span>{fr ? 'J’accepte les ' : 'Aceito os '}<Link href={href(lang, 'legal') + '#termos'} target="_blank">{t('f_termos').toLowerCase()}</Link>{fr ? ' et la politique de confidentialité.' : ' e a política de privacidade.'}</span>
          </label>
        </fieldset>
        {estado === 'erro' && <p className="err" role="alert">{erro}</p>}
        <button className="btn gold full" type="submit" disabled={estado === 'aguarda'}>
          {estado === 'aguarda' ? '…' : (fr ? `Payer ${eur(tot, lang)} en toute sécurité` : `Pagar ${eur(tot, lang)} com segurança`)}
        </button>
        <div className="lock">🔒 {t('lock')}</div>
      </form>
      <aside className="summary">
        <h3>{t('resumo')}</h3>
        {c.linhas.map((l) => <LinhaView key={l.key} l={l} lang={lang} total={totalLinha(l, c.vol)} />)}
        {c.vol > 0 && <div className="sumrow vol"><span>{t('vol_ap', { x: Math.round(c.vol * 100) })}</span></div>}
        <div className="sumrow"><span>{t('subtotal')}</span><span className="price">{eur(c.sub, lang)}</span></div>
        <div className="sumrow"><span>{t('envio')}</span><span className="price">{sh ? eur(sh, lang) : t('gratis_l')}</span></div>
        <div className="tot"><span>{t('total')}</span><span className="price">{eur(tot, lang)}</span></div>
        <div className="assure small">{(['as1', 'as2', 'as3'] as const).map((k) => <div key={k}>{t(k)}</div>)}</div>
      </aside>
    </div></div>
  );
}
