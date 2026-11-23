'use client';
/* Pedido de orçamento para empresas, equipas e criadores. */
import { useState } from 'react';
import type { Lang } from '@/lib/catalog';
import { tr } from '@/lib/i18n';

export function B2BForm({ lang }: { lang: Lang }) {
  const t = tr(lang); const fr = lang === 'fr';
  const [estado, setEstado] = useState<'idle' | 'envia' | 'ok' | 'erro'>('idle');
  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const body = Object.fromEntries(f.entries());
    if (!String(body.nome || '').trim() || !/.+@.+\..+/.test(String(body.email || ''))) { setEstado('erro'); return; }
    setEstado('envia');
    try { const r = await fetch('/api/orcamento', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, lang }) }); setEstado(r.ok ? 'ok' : 'erro'); }
    catch { setEstado('erro'); }
  }
  if (estado === 'ok') return <p className="note" role="status">{fr ? 'Merci ! Ruben te répond sous 24 h ouvrées avec un rendu 3D et un devis.' : 'Obrigado! O Ruben responde em 24 h úteis com um render 3D e o orçamento.'}</p>;
  return (
    <form className="formb2b" onSubmit={enviar} noValidate>
      <div className="opt"><label htmlFor="b-tipo">{t('f_tipo')}</label><select id="b-tipo" name="tipo">{([1, 2, 3, 4] as const).map((i) => <option key={i}>{t(`t${i}`)}</option>)}</select></div>
      <div className="two">
        <div className="opt"><label htmlFor="b-nome">{t('nome')}</label><input id="b-nome" name="nome" type="text" autoComplete="name" required /></div>
        <div className="opt"><label htmlFor="b-qt">{t('f_qt')}</label><input id="b-qt" name="quantidade" type="text" inputMode="numeric" /></div>
      </div>
      <div className="opt"><label htmlFor="b-email">{t('email')}</label><input id="b-email" name="email" type="email" autoComplete="email" required /></div>
      <div className="opt"><label htmlFor="b-msg">{t('f_msg')}</label><textarea id="b-msg" name="mensagem" rows={5} placeholder={fr ? '12 plaques avec le prénom de chaque membre de l’équipe, couleur graphite, logo à gauche…' : '12 placas com o nome de cada pessoa da equipa, cor grafite, logótipo à esquerda…'} /></div>
      <input type="text" name="site" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: -9999 }} aria-hidden="true" />
      {estado === 'erro' && <p className="err" role="alert">{fr ? 'Indique ton nom et un e-mail valide.' : 'Indica o teu nome e um email válido.'}</p>}
      <button className="btn gold" type="submit" disabled={estado === 'envia'}>{estado === 'envia' ? '…' : t('f_env')}</button>
      <p className="small mut" style={{ margin: 0 }}>{fr ? 'Tes données servent uniquement à répondre à ta demande.' : 'Os teus dados servem apenas para responder ao pedido.'}</p>
    </form>
  );
}
