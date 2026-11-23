/* Catálogo, cores, packs, projetos e regras de preço da STRATO.
   É a única fonte de preços: o cliente mostra-os, o servidor volta a calculá-los no checkout. */

import { modeloCom } from './comunidade';

export type Lang = 'pt' | 'fr';
export const LANGS: Lang[] = ['pt', 'fr'];
export type L10n = Record<Lang, string>;

export type Cor = { id: string; nome: L10n; hex: string; swatch: string; extra?: number };
export const CORES: Cor[] = [
  { id: 'grafite', nome: { pt: 'Grafite', fr: 'Graphite' }, hex: '#2a2a2c', swatch: '#2a2a2c' },
  { id: 'gesso', nome: { pt: 'Gesso', fr: 'Plâtre' }, hex: '#ebe7df', swatch: '#ebe7df' },
  { id: 'betao', nome: { pt: 'Betão', fr: 'Béton' }, hex: '#8c8b86', swatch: '#8c8b86' },
  { id: 'areia', nome: { pt: 'Areia', fr: 'Sable' }, hex: '#cfb994', swatch: '#cfb994' },
  { id: 'salvia', nome: { pt: 'Sálvia', fr: 'Sauge' }, hex: '#8ea489', swatch: '#8ea489' },
  { id: 'terracota', nome: { pt: 'Terracota', fr: 'Terracotta' }, hex: '#b8684a', swatch: '#b8684a' },
  { id: 'ouro', nome: { pt: 'Ouro seda', fr: 'Or soie' }, hex: '#b8913f', swatch: 'linear-gradient(135deg,#8f6d2c,#e6c26a,#9c7a33)', extra: 3 },
  { id: 'marmore', nome: { pt: 'Mármore', fr: 'Marbre' }, hex: '#ece8e1', swatch: 'repeating-linear-gradient(120deg,#ece8e1 0 6px,#cfcac2 6px 7px,#ece8e1 7px 13px)', extra: 3 },
];

export const PRECO_TEXTO = 4;
export const PRECO_LOGO = 6;
export const FRETE_GRATIS = 39;
export const ENVIOS = {
  mr: { preco: 3.9, nome: { pt: 'Ponto Mondial Relay', fr: 'Point Mondial Relay' }, prazo: { pt: '3 a 5 dias úteis', fr: '3 à 5 jours ouvrés' } },
  col: { preco: 4.9, nome: { pt: 'Colissimo ao domicílio', fr: 'Colissimo à domicile' }, prazo: { pt: '2 a 4 dias úteis', fr: '2 à 4 jours ouvrés' } },
  ctt: { preco: 4.5, nome: { pt: 'CTT Expresso (Portugal)', fr: 'CTT Expresso (Portugal)' }, prazo: { pt: '3 a 6 dias úteis', fr: '3 à 6 jours ouvrés' } },
} as const;
export type EnvioId = keyof typeof ENVIOS;

export type Categoria = 'pers' | 'audio' | 'cabos' | 'secretaria' | 'gaming';
export type Medida = { k: 'espessura' | 'largura'; min: number; max: number; step: number; def: number; un: string };
export type Personalizacao = { texto: 'inc' | 'fee'; def?: string; max?: number; logo?: boolean; medida?: Medida };
export type Variante = { nome: L10n; d: number };
export type Produto = {
  id: string; cat: Categoria; preco: number; cor: string; tag?: L10n;
  nome: L10n; desc: L10n; pers?: Personalizacao; var?: Variante[];
  sp: { mat: string; cam: string; peso: string; tempo: string; med: string };
  with: string[];
};

export const PRODUTOS: Produto[] = [
  { id: 'placa-nome', cat: 'pers', preco: 16.9, cor: 'grafite', tag: { pt: 'O mais personalizável', fr: 'Le plus personnalisable' }, pers: { texto: 'inc', logo: true, def: 'RUBEN', max: 14 },
    nome: { pt: 'Placa de secretária com nome', fr: 'Plaque de bureau à ton nom' },
    desc: { pt: 'Placa inclinada de 17 cm com o teu nome, o do teu canal ou o da tua empresa, em letras douradas sobre a cor que escolheres. Junta o teu logótipo e fica pronta para a câmara.', fr: 'Plaque inclinée de 17 cm avec ton nom, celui de ta chaîne ou de ton entreprise, en lettres dorées sur la couleur de ton choix. Ajoute ton logo, elle est prête pour la caméra.' },
    sp: { mat: 'PLA', cam: '0,12 mm', peso: '62 g', tempo: '3 h 40 min', med: '20 × 5,5 × 5,2 cm' }, with: ['suporte-telemovel', 'base-auscultadores'] },
  { id: 'gancho-grampo', cat: 'audio', preco: 14.9, cor: 'areia', tag: { pt: 'Ajusta-se ao teu tampo', fr: "S'adapte à ton plateau" }, pers: { texto: 'fee', max: 6, medida: { k: 'espessura', min: 1.2, max: 4.5, step: 0.1, def: 2.5, un: 'cm' } },
    nome: { pt: 'Gancho de auscultadores com grampo', fr: 'Crochet de casque à pince' },
    desc: { pt: 'Aperta na borda da secretária sem parafusos nem furos. Indicas a espessura do tampo e imprimimos o grampo à medida. A curva larga apoia o arco e o lábio na ponta segura os auscultadores.', fr: "Se serre sur le bord du bureau, sans vis ni perçage. Tu indiques l'épaisseur du plateau et on imprime la pince à la cote. La courbe large soutient l'arceau et la lèvre retient le casque." },
    sp: { mat: 'PETG', cam: '0,2 mm', peso: '46 g', tempo: '2 h 50 min', med: '10 × 3,2 × 13 cm' }, with: ['clips-cabo', 'calha-cabos'] },
  { id: 'base-auscultadores', cat: 'audio', preco: 24.9, cor: 'gesso', pers: { texto: 'fee', max: 10 },
    nome: { pt: 'Base para auscultadores', fr: 'Support de casque' },
    desc: { pt: 'Base pesada, coluna hexagonal com o teu nome gravado na vertical e aro para enrolar o cabo. O apoio do topo é largo e tem rebordo nas pontas.', fr: "Base lestée, colonne hexagonale avec ton nom gravé à la verticale et anneau pour enrouler le câble. L'appui du haut est large et a des rebords." },
    sp: { mat: 'PLA', cam: '0,2 mm', peso: '138 g', tempo: '7 h 10 min', med: '11 × 11 × 24 cm' }, with: ['gancho-grampo', 'suporte-comandos'] },
  { id: 'suporte-comandos', cat: 'gaming', preco: 18.9, cor: 'grafite', pers: { texto: 'fee', max: 12 },
    nome: { pt: 'Suporte duplo para comandos', fr: 'Support double pour manettes' },
    desc: { pt: 'Dois apoios para comandos de PlayStation, Xbox ou Switch Pro, com a tua gamertag na frente.', fr: "Deux appuis pour manettes PlayStation, Xbox ou Switch Pro, avec ton gamertag à l'avant." },
    sp: { mat: 'PLA', cam: '0,2 mm', peso: '98 g', tempo: '4 h 50 min', med: '15 × 8 × 10 cm' }, with: ['base-auscultadores', 'gancho-duplo'] },
  { id: 'prateleira-monitor', cat: 'secretaria', preco: 59, cor: 'grafite', pers: { texto: 'fee', max: 14, medida: { k: 'largura', min: 40, max: 100, step: 1, def: 54, un: 'cm' } },
    nome: { pt: 'Prateleira de monitor à medida', fr: "Réhausseur d'écran sur mesure" },
    desc: { pt: 'Dois pés impressos com passagem de cabo e um tampo de contraplacado de bétula cortado à largura que escolheres, de 40 a 100 cm. Sobe o ecrã 11 cm para a altura dos olhos.', fr: "Deux pieds imprimés avec passe-câble et un plateau en contreplaqué de bouleau coupé à la largeur de ton choix, de 40 à 100 cm. Remonte l'écran de 11 cm à hauteur des yeux." },
    sp: { mat: 'PLA + bétula', cam: '0,28 mm', peso: '2 × 210 g', tempo: '2 × 9 h', med: '40–100 × 25 × 11 cm' }, with: ['organizador', 'suporte-telemovel'] },
  { id: 'suporte-telemovel', cat: 'secretaria', preco: 12.9, cor: 'ouro', pers: { texto: 'fee', max: 8 },
    nome: { pt: 'Suporte de telemóvel inclinado', fr: 'Support de téléphone incliné' },
    desc: { pt: 'Inclinação de 65° para ver notificações sem pegar no telemóvel, furo para o cabo e o teu nome no rebordo. Serve em telemóveis com capa até 1,4 cm.', fr: "Inclinaison de 65° pour voir les notifications sans prendre le téléphone, passage pour le câble et ton nom sur le rebord. Convient aux téléphones avec coque jusqu'à 1,4 cm." },
    sp: { mat: 'PLA', cam: '0,2 mm', peso: '41 g', tempo: '2 h 05 min', med: '9,4 × 7,6 × 11 cm' }, with: ['placa-nome', 'organizador'] },
  { id: 'organizador', cat: 'secretaria', preco: 22.9, cor: 'salvia', pers: { texto: 'fee', max: 10 },
    nome: { pt: 'Organizador de secretária hexagonal', fr: 'Organiseur de bureau hexagonal' },
    desc: { pt: 'Copo hexagonal para canetas e um tabuleiro com duas divisões, com o teu nome gravado na frente.', fr: "Pot hexagonal pour stylos et plateau à deux compartiments, avec ton nom gravé à l'avant." },
    sp: { mat: 'PLA', cam: '0,2 mm', peso: '124 g', tempo: '6 h 15 min', med: '20 × 10 × 11 cm' }, with: ['suporte-telemovel', 'placa-nome'] },
  { id: 'gancho-duplo', cat: 'audio', preco: 17.9, cor: 'grafite',
    nome: { pt: 'Gancho duplo sob a secretária', fr: 'Double crochet sous le bureau' },
    desc: { pt: 'Dois apoios lado a lado, aparafusados por baixo do tampo. Para quem tem auscultadores de trabalho e de jogo.', fr: 'Deux supports côte à côte, vissés sous le plateau. Pour un casque de travail et un casque de jeu.' },
    sp: { mat: 'PETG', cam: '0,2 mm', peso: '58 g', tempo: '3 h 30 min', med: '12 × 5 × 9 cm' }, with: ['base-auscultadores', 'clips-cabo'] },
  { id: 'stand-portatil', cat: 'secretaria', preco: 24.9, cor: 'betao',
    nome: { pt: 'Stand vertical duplo para portátil e tablet', fr: 'Support vertical double ordinateur et tablette' },
    desc: { pt: 'Guarda o portátil fechado e o tablet de pé, ocupando 14 cm de secretária. As ranhuras têm almofada de borracha.', fr: "Range l'ordinateur fermé et la tablette debout, sur 14 cm de bureau. Les fentes ont un patin en caoutchouc." },
    sp: { mat: 'PLA', cam: '0,2 mm', peso: '112 g', tempo: '5 h 40 min', med: '14 × 8 × 7,5 cm' }, with: ['prateleira-monitor', 'calha-cabos'] },
  { id: 'calha-cabos', cat: 'cabos', preco: 16.9, cor: 'gesso', var: [{ nome: { pt: '1 calha · 30 cm', fr: '1 goulotte · 30 cm' }, d: 0 }, { nome: { pt: '2 calhas · 60 cm', fr: '2 goulottes · 60 cm' }, d: 13 }],
    nome: { pt: 'Calha de cabos sob a secretária', fr: 'Goulotte de câbles sous le bureau' },
    desc: { pt: 'Calha aberta de 30 cm que se aparafusa debaixo do tampo e esconde a extensão e os carregadores. Encaixa topo a topo.', fr: "Goulotte ouverte de 30 cm à visser sous le plateau pour cacher multiprise et chargeurs. S'emboîte bout à bout." },
    sp: { mat: 'PETG', cam: '0,28 mm', peso: '96 g', tempo: '4 h 20 min', med: '30 × 7,2 × 5,2 cm' }, with: ['clips-cabo', 'gancho-duplo'] },
  { id: 'clips-cabo', cat: 'cabos', preco: 8.9, cor: 'terracota', var: [{ nome: { pt: 'Pack de 10', fr: 'Lot de 10' }, d: 0 }, { nome: { pt: 'Pack de 20', fr: 'Lot de 20' }, d: 6 }],
    nome: { pt: 'Clips de cabo', fr: 'Clips de câble' },
    desc: { pt: 'Clips adesivos em três tamanhos para segurar cabos à borda da secretária. Vêm com fita 3M.', fr: 'Clips adhésifs en trois tailles pour tenir les câbles au bord du bureau. Fournis avec adhésif 3M.' },
    sp: { mat: 'PETG', cam: '0,2 mm', peso: '10 × 4 g', tempo: '1 h 40 min', med: '2,2 a 3 cm' }, with: ['calha-cabos', 'gancho-grampo'] },
];

export type Pack = { id: string; nome: L10n; itens: string[]; preco: number; txt: L10n };
export const PACKS: Pack[] = [
  { id: 'pack-limpo', nome: { pt: 'Setup Limpo', fr: 'Setup Net' }, itens: ['calha-cabos', 'clips-cabo', 'gancho-grampo'], preco: 34.9, txt: { pt: 'Tira os cabos do chão e os auscultadores da mesa numa tarde.', fr: "Sors les câbles du sol et le casque du bureau en un après-midi." } },
  { id: 'pack-gamer', nome: { pt: 'Setup Gamer', fr: 'Setup Gamer' }, itens: ['suporte-comandos', 'base-auscultadores', 'placa-nome'], preco: 52.9, txt: { pt: 'Comandos, auscultadores e a tua gamertag na secretária.', fr: 'Manettes, casque et ton gamertag sur le bureau.' } },
  { id: 'pack-completo', nome: { pt: 'Setup Completo', fr: 'Setup Complet' }, itens: ['prateleira-monitor', 'stand-portatil', 'suporte-telemovel', 'organizador', 'clips-cabo'], preco: 109, txt: { pt: 'Ecrã à altura dos olhos e tudo o resto arrumado à volta.', fr: 'Écran à hauteur des yeux et tout le reste rangé autour.' } },
];

export type Projeto = { id: string; img: string; nome: L10n; txt: L10n; pecas: string[]; valor: L10n };
export const PROJETOS: Projeto[] = [
  { id: 'streamer', img: '/img/proj/streamer.jpg', nome: { pt: 'Setup de streaming', fr: 'Setup de streaming' },
    txt: { pt: 'Para uma criadora com o canal «Luna Live»: placa à frente da câmara, base de auscultadores com o nome na coluna, suporte de comandos com «Player 2» para o convidado e cabos presos.', fr: "Pour une créatrice avec la chaîne « Luna Live » : plaque face caméra, support de casque avec le nom sur la colonne, support de manettes « Player 2 » pour l'invité et câbles tenus." },
    pecas: ['placa-nome', 'base-auscultadores', 'suporte-comandos', 'suporte-telemovel', 'clips-cabo'], valor: { pt: '≈ 95 €', fr: '≈ 95 €' } },
  { id: 'equipa', img: '/img/proj/equipa.jpg', nome: { pt: 'Kit de boas-vindas para equipa', fr: "Kit d'accueil pour équipe" },
    txt: { pt: 'Uma placa por pessoa, cada uma na sua cor, para o primeiro dia num escritório partilhado. Encomenda única com desconto de volume e entrega num só envio.', fr: 'Une plaque par personne, chacune dans sa couleur, pour le premier jour dans un bureau partagé. Commande unique avec remise de volume et livraison en un seul envoi.' },
    pecas: ['placa-nome'], valor: { pt: '6 × 15,20 € (−10 %)', fr: '6 × 15,20 € (−10 %)' } },
  { id: 'cowork', img: '/img/proj/cowork.jpg', nome: { pt: 'Marca num espaço de coworking', fr: 'Une marque dans un coworking' },
    txt: { pt: 'Para uma marca fictícia, «Orbita»: placa de receção com logótipo e suportes de telemóvel gravados para cada posto de trabalho, nas cores do espaço.', fr: "Pour une marque fictive, « Orbita » : plaque d'accueil avec logo et supports de téléphone gravés pour chaque poste, aux couleurs de l'espace." },
    pecas: ['placa-nome', 'suporte-telemovel'], valor: { pt: '≈ 90 € / 5 peças', fr: '≈ 90 € / 5 pièces' } },
  { id: 'medidas', img: '/img/proj/medidas.jpg', nome: { pt: 'A medida certa', fr: 'La bonne cote' },
    txt: { pt: 'O mesmo gancho para três secretárias diferentes: tampos de 1,5, 3 e 4,5 cm. O grampo é gerado a partir da medida que o cliente indica.', fr: 'Le même crochet pour trois bureaux différents : plateaux de 1,5, 3 et 4,5 cm. La pince est générée à partir de la cote indiquée par le client.' },
    pecas: ['gancho-grampo'], valor: { pt: '14,90–16,90 €', fr: '14,90–16,90 €' } },
];

export const produto = (id: string) => PRODUTOS.find((p) => p.id === id);
export const pack = (id: string) => PACKS.find((p) => p.id === id);
export const cor = (id: string) => CORES.find((c) => c.id === id);

/* ---------- linhas de carrinho e preço ---------- */
export type Linha = {
  key: string; q: number;
  id?: string; cor?: string; v?: number; txt?: string; med?: number | null; logo?: boolean;
  pack?: string; oferta?: 'bump-clips' | 'upsell-placa';
  com?: string; // design da comunidade (MakerWorld, licença comercial)
};
export const OFERTAS = { 'bump-clips': 5.9, 'upsell-placa': 9.9 } as const;

export function taxaMedida(p: Produto, v: number | null | undefined) {
  const m = p.pers?.medida; if (!m || v == null) return 0;
  if (m.k === 'espessura') return v > 3 ? 2 : 0;
  return Math.max(0, Math.round((v - m.def) * 0.4));
}

export type Parcela = { k: 'base' | 'cor' | 'var' | 'txt' | 'logo' | 'med'; v: number };
export function parcelas(l: Linha): Parcela[] {
  const p = l.id ? produto(l.id) : undefined; if (!p) return [];
  const out: Parcela[] = [{ k: 'base', v: p.preco }];
  const c = l.cor ? cor(l.cor) : undefined; if (c?.extra) out.push({ k: 'cor', v: c.extra });
  const va = p.var?.[l.v ?? 0]; if (va?.d) out.push({ k: 'var', v: va.d });
  if (p.pers) {
    if (p.pers.texto === 'fee' && l.txt?.trim()) out.push({ k: 'txt', v: PRECO_TEXTO });
    if (p.pers.logo && l.logo) out.push({ k: 'logo', v: PRECO_LOGO });
    const f = taxaMedida(p, l.med); if (f) out.push({ k: 'med', v: f });
  }
  return out;
}
export function precoUnit(l: Linha): number {
  if (l.com) { const m = modeloCom(l.com); if (!m) return 0; return m.preco + (cor(l.cor ?? '')?.extra ?? 0); }
  if (l.pack) return pack(l.pack)?.preco ?? 0;
  if (l.oferta) return OFERTAS[l.oferta];
  return parcelas(l).reduce((s, x) => s + x.v, 0);
}
export const subtotal = (ls: Linha[]) => ls.reduce((s, l) => s + precoUnit(l) * l.q, 0);
export const custoEnvio = (sub: number, e: EnvioId) => (sub >= FRETE_GRATIS ? 0 : ENVIOS[e].preco);
export const chaveLinha = (l: Omit<Linha, 'key' | 'q'>) => JSON.stringify([l.id, l.cor, l.v, l.txt, l.med, !!l.logo, l.pack, l.oferta, l.com]);

/** Valida uma linha vinda do browser. Devolve null se algo não bater certo com o catálogo. */
export function validarLinha(l: Linha): Linha | null {
  const q = Math.floor(Number(l.q)); if (!(q >= 1 && q <= 50)) return null;
  if (l.pack) return pack(l.pack) ? { key: l.key, q, pack: l.pack } : null;
  if (l.com) return modeloCom(l.com) && cor(l.cor ?? '') ? { key: l.key, q, com: l.com, cor: l.cor } : null;
  const p = l.id ? produto(l.id) : undefined; if (!p) return null;
  if (l.oferta && !(l.oferta in OFERTAS)) return null;
  if (!cor(l.cor ?? '')) return null;
  const v = Math.floor(Number(l.v ?? 0)); if (v < 0 || v >= (p.var?.length ?? 1)) return null;
  const max = p.pers?.max ?? 14;
  const txt = p.pers ? String(l.txt ?? '').replace(/[^\p{L}\p{N} .&'\-]/gu, '').slice(0, max).trim() : '';
  let med: number | null = null;
  const m = p.pers?.medida;
  if (m) { med = Number(l.med); if (!(med >= m.min && med <= m.max)) return null; }
  return { key: l.key, q, id: p.id, cor: l.cor, v, txt, med, logo: !!(p.pers?.logo && l.logo), oferta: l.oferta };
}

export const eur = (n: number, lang: Lang = 'pt') =>
  new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
