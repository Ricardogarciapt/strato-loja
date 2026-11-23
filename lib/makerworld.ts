/* Lê UM modelo do MakerWorld a pedido do atelier (sem varrimentos em massa) e decide se pode entrar na loja. */
import type { LicencaOk } from './comunidade';

export type Leitura = {
  ok: boolean; motivo?: string;
  id?: string; titulo?: string; criador?: string; perfil?: string; imagem?: string; url?: string;
  licencaTexto?: string; licenca?: LicencaOk | null;
};

const meta = (html: string, prop: string) => {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
  return (html.match(re) || html.match(re2))?.[1];
};
const limpa = (s?: string) => s?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s*\|\s*MakerWorld.*$/i, '').trim();

/** Normaliza o texto de licença e diz se permite vender impressões. */
export function classificarLicenca(txt: string, comercialPago: boolean): LicencaOk | null {
  const t = txt.toUpperCase().replace(/[-_ ]+/g, ' ');
  if (/\bNC\b|NON ?COMMERCIAL|NONCOMMERCIAL/.test(t)) return comercialPago ? 'Comercial MakerWorld' : null;
  if (/\bND\b|NO ?DERIV/.test(t)) return comercialPago ? 'Comercial MakerWorld' : null;
  if (/CC ?0|PUBLIC DOMAIN/.test(t)) return 'CC0';
  if (/CC BY SA|BY SA/.test(t)) return 'CC BY-SA';
  if (/CC BY\b|ATTRIBUTION/.test(t)) return 'CC BY';
  // Licença padrão do MakerWorld (uso pessoal) ou desconhecida: só com licença comercial paga
  return comercialPago ? 'Comercial MakerWorld' : null;
}

export async function lerModelo(raw: string, comercialPago = false): Promise<Leitura> {
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return { ok: false, motivo: 'link inválido' }; }
  if (!/(^|\.)makerworld\.com$/.test(u.hostname)) return { ok: false, motivo: 'o link tem de ser do makerworld.com' };
  const m = u.pathname.match(/\/models\/(\d+)/); if (!m) return { ok: false, motivo: 'não é a página de um modelo' };
  const url = `https://makerworld.com/en/models/${m[1]}`;
  let html = '';
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (STRATO curadoria)', 'accept-language': 'en' }, cache: 'no-store' });
    if (!r.ok) return { ok: false, motivo: `o MakerWorld respondeu ${r.status}`, url };
    html = await r.text();
  } catch { return { ok: false, motivo: 'não foi possível abrir o MakerWorld', url }; }

  const titulo = limpa(meta(html, 'og:title') || html.match(/<title>([^<]+)/)?.[1]);
  const imagem = meta(html, 'og:image');
  // licença: procura no JSON da página e, em último caso, no texto
  const lic = html.match(/"license"\s*:\s*"([^"]{2,60})"/i)?.[1]
    || html.match(/(CC0[^<"]{0,20}|CC[ -]BY[^<"]{0,20}|Standard Digital File License)/i)?.[1] || '';
  const criador = html.match(/"designCreator"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/)?.[1]
    || html.match(/"creatorName"\s*:\s*"([^"]+)"/)?.[1] || meta(html, 'author');
  const handle = html.match(/"designCreator"\s*:\s*\{[^}]*"handle"\s*:\s*"([^"]+)"/)?.[1];
  const perfil = handle ? `https://makerworld.com/en/@${handle}` : url;
  const licenca = classificarLicenca(lic, comercialPago);
  return {
    ok: !!licenca && !!titulo, motivo: !titulo ? 'não consegui ler o modelo' : !licenca ? `licença «${lic || 'desconhecida'}» não permite vender impressões` : undefined,
    id: `mw-${m[1]}`, titulo, criador: criador ?? 'criador MakerWorld', perfil, imagem, url, licencaTexto: lic, licenca,
  };
}
