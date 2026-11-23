# STRATO · loja online do Ruben Pereira

Objetos de secretária personalizados (nome, logótipo, medida) impressos em 3D em França. PT e FR.

## O que tem

| Parte | Onde |
|---|---|
| Catálogo, cores, packs, projetos e **regras de preço** (fonte única) | `lib/catalog.ts` |
| Textos PT/FR | `lib/i18n.ts` |
| Modelos 3D paramétricos próprios (os mesmos dos renders e dos STL) | `lib/three/strato3d.js` |
| Luz realista: HDRI Poly Haven, CC0 (via `@pmndrs/assets`) | `public/hdri/`, `lib/three/env.ts` |
| Realidade aumentada: GLB gerado na hora com a configuração do cliente | `lib/three/exportar.ts`, `components/ARModal.tsx` |
| Entrada em CGI (impressão ao vivo) | `components/HeroPrint.tsx` |
| Página de produto: visualizador 3D + configurador | `components/Configurator.tsx` |
| Carrinho (localStorage), gaveta, oferta de clips | `lib/cart.tsx`, `components/CartDrawer.tsx` |
| Checkout Stripe (preço recalculado no servidor) | `app/api/checkout/route.ts`, `components/Checkout.tsx` |
| Ordem de impressão por email quando o pagamento entra | `app/api/webhook/stripe/route.ts` |
| Pedido de orçamento B2B | `app/api/orcamento/route.ts`, `components/B2BForm.tsx` |
| Páginas | `app/[lang]/…` (início, loja, produto/[slug], projetos, packs, empresas, sobre, ajuda, legal, checkout, obrigado) |
| SEO | metadados por página, `hreflang`, JSON-LD Product e FAQ, `sitemap.xml`, `robots.txt` |
| Ficheiros STL prontos a imprimir | fora deste repositório público (guardados à parte) |

## Designs da comunidade (MakerWorld, com curadoria)

Página do atelier: `/pt/importar` (não aparece no Google). Cola-se o link de um modelo do MakerWorld e a loja lê a licença.

- Entram só licenças que permitem vender impressões: **CC0, CC BY, CC BY-SA**. Licença padrão do MakerWorld, NC ou ND ficam de fora, a não ser que o atelier tenha a **licença comercial paga** do MakerWorld para esse criador (caixa a marcar).
- A montra mostra sempre o criador, a licença e o link original. O ficheiro STL/3MF nunca é vendido nem publicado: vende-se só a peça impressa.
- Um link de cada vez, a pedido (nada de varrimentos automáticos do MakerWorld, que as regras deles proíbem).
- Ficheiros: `lib/makerworld.ts` (leitura e licença), `app/api/importar/route.ts`, `components/Importador.tsx`, `components/Comunidade.tsx`, dados em `data/comunidade.json`.
- Variáveis: `IMPORT_TOKEN` (código de acesso da página). Opcional `GITHUB_TOKEN` (token fino com permissão *Contents: write* só neste repositório): com ele, «Publicar» grava `data/comunidade.json` no GitHub e o Vercel republica sozinho. Sem ele, a página mostra o JSON para colar à mão.
- Quando a peça estiver impressa, troca-se a imagem do MakerWorld por uma foto própria (campo `imagem`).

## Correr localmente

```bash
npm install
cp .env.example .env.local   # sem chaves Stripe o checkout corre em modo demonstração
npm run dev                  # http://localhost:3000 → /fr ou /pt
```

## Publicar (Vercel, ~10 min)

1. Criar um repositório GitHub com esta pasta e importá-lo em vercel.com (framework Next.js, sem configuração extra).
2. Variáveis de ambiente: `NEXT_PUBLIC_SITE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, opcional `RESEND_API_KEY` + `ATELIER_EMAIL`.
3. Stripe → Developers → Webhooks → endpoint `https://<domínio>/api/webhook/stripe`, evento `checkout.session.completed`.
4. Ligar o domínio (ex.: `strato-desk.fr`, por verificar) e ativar MB WAY, PayPal e Apple Pay em Stripe → Payment methods.

## Antes de abrir ao público (Ruben)

- Preencher em `app/[lang]/legal/page.tsx`: forma jurídica, SIRET, morada do atelier, TVA, mediador do consumo, email.
- Trocar renders por fotos reais quando as peças estiverem impressas (mesmos nomes em `public/img/`).
- Verificar a marca «STRATO» no INPI/EUIPO.
- Logótipos carregados pelos clientes: o ficheiro fica no browser; o atelier recebe «LOGÓTIPO: pedir ficheiro» e pede-o por email. Para receber o ficheiro automaticamente, ligar um armazenamento (ex.: Vercel Blob).

## Licenças

Modelos 3D, código e textos: originais da STRATO. HDRI: Poly Haven, CC0. Bibliotecas: Next.js (MIT), three.js (MIT), model-viewer (Apache-2.0), qrcode-generator (MIT), Stripe (MIT).
