/* Designs da comunidade importados do MakerWorld, um a um e com curadoria.
   Regras (não negociáveis):
   - só entram modelos cuja licença permite vender impressões (CC0, CC BY, CC BY-SA)
     ou de criadores com quem o atelier tem licença comercial paga do MakerWorld;
   - a montra mostra sempre o crédito ao criador e a licença;
   - o ficheiro (STL/3MF) nunca é vendido nem publicado aqui: vende-se só a peça impressa. */
import dados from '@/data/comunidade.json';
import type { L10n } from './catalog';

export type LicencaOk = 'CC0' | 'CC BY' | 'CC BY-SA' | 'Comercial MakerWorld';
export const LICENCAS_OK: LicencaOk[] = ['CC0', 'CC BY', 'CC BY-SA', 'Comercial MakerWorld'];

export type ModeloComunidade = {
  id: string;            // ex.: mw-123456
  titulo: L10n;
  criador: string;
  perfil: string;        // URL do perfil do criador
  url: string;           // URL do modelo no MakerWorld
  licenca: LicencaOk;
  imagem: string;        // imagem de capa (do MakerWorld até haver foto própria da peça impressa)
  preco: number;         // preço da peça impressa, definido pelo atelier
  cor: string;           // cor sugerida
  importado: string;     // data ISO
};

export const COMUNIDADE: ModeloComunidade[] = (dados as ModeloComunidade[]).filter((m) => LICENCAS_OK.includes(m.licenca));
export const modeloCom = (id: string) => COMUNIDADE.find((m) => m.id === id);
