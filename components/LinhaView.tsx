/* Uma linha de encomenda (carrinho, resumo do checkout, página de obrigado). */
import { cor, eur, pack, produto, type Lang, type Linha } from '@/lib/catalog';
import { tr } from '@/lib/i18n';

export function descLinha(l: Linha, lang: Lang) {
  const t = tr(lang); const p = l.id ? produto(l.id) : undefined; if (!p) return '';
  const bits = [cor(l.cor ?? '')?.nome[lang] ?? ''];
  if (p.var) bits.push(p.var[l.v ?? 0].nome[lang]);
  if (p.pers && l.txt?.trim()) bits.push(`«${l.txt}»`);
  if (l.logo) bits.push(t('bd_logo'));
  if (p.pers?.medida && l.med != null) bits.push(`${String(l.med).replace('.', ',')} ${p.pers.medida.un}`);
  return bits.filter(Boolean).join(' · ');
}

export function LinhaView({ l, lang, total, onRemove }: { l: Linha; lang: Lang; total: number; onRemove?: () => void }) {
  const t = tr(lang);
  const pk = l.pack ? pack(l.pack) : undefined; const p = l.id ? produto(l.id) : undefined;
  const img = pk ? pk.itens[0] : p?.id;
  const nome = pk ? pk.nome[lang] : p?.nome[lang];
  const sub = pk ? `${pk.itens.length} · ${t('total_pack')}` : descLinha(l, lang);
  return (
    <div className="li">
      <img src={`/img/${img}.jpg`} alt="" width={64} height={64} />
      <div>
        <div className="t">{nome} × {l.q}</div>
        <div className="v">{sub}</div>
        {onRemove && <button className="rm" onClick={onRemove}>{t('remover')}</button>}
      </div>
      <span className="price">{eur(total, lang)}</span>
    </div>
  );
}
