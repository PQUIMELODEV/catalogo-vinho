# Deploy do front (Vercel)

Pré-requisito: API já publicada no Render — ver `DEPLOY.md` do repositório
do back-end (guia completo de todos os serviços).

1. Edite `src/environments/environment.ts` e troque `apiUrl` pela URL
   pública da API no Render (mantendo o sufixo `/api`):

   ```ts
   apiUrl: 'https://catalogo-vinho-api.onrender.com/api',
   ```

   Commit e push.

2. Em https://vercel.com: **Add New → Project** → importe este repositório.
   - Framework preset: **Angular** (detectado automaticamente);
   - Build command: `npm run build`;
   - Output directory: `dist/sakai-ng/browser`.

3. Deploy. Anote a URL gerada (ex.: `https://adega-serra-azul.vercel.app`)
   e preencha a variável `Cors__AllowedOrigins` no Render com ela.

4. Teste no celular: catálogo, login, fotos e carrinho.

O `vercel.json` na raiz garante que rotas do Angular (ex.: `/catalogo`)
funcionem em acesso direto/refresh (rewrite de tudo para `index.html`).
