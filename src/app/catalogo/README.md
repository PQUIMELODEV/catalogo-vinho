# Catálogo de Vinhos — feature Angular (Sakai + PrimeNG)

Portal do cliente do projeto **Catálogo Digital de Vinhos**: grade de cards, busca,
filtro por categoria, ordenação, detalhe do vinho, carrinho persistente e finalização
de pedido via WhatsApp (`wa.me`).

> 💡 Existe também um **protótipo navegável** em `Catálogo de Vinhos.html` (na raiz do
> projeto) que mostra o visual exato ao vivo — útil para validar o design antes de integrar.

## Estrutura

```
catalogo/
├─ models/wine.model.ts            # interfaces Wine, CartItem, CartLine
├─ data/wines.data.ts              # dados mock + tints por tipo (trocar pela API)
├─ services/
│  ├─ wine.service.ts             # fonte de dados (HttpClient quando integrar)
│  └─ cart.service.ts             # carrinho com signals + localStorage
├─ components/
│  ├─ bottle-art.component.ts     # rótulo ilustrado (placeholder até fotos reais)
│  ├─ wine-card.component.ts      # card do catálogo
│  ├─ wine-detail-dialog.component.ts
│  └─ cart-drawer.component.ts    # p-sidebar
├─ catalogo.component.{ts,html,scss}   # página principal
├─ catalogo.routes.ts
└─ _catalogo-overlays.scss        # ⚠️ estilos GLOBAIS dos overlays (importar no styles.scss)
```

Tudo é **standalone** + **signals** (Angular 17/18) — sem NgModules.

## Como integrar no Sakai

1. **Copie a pasta** `catalogo/` para `src/app/` do seu projeto Sakai.

2. **Registre a rota** em `app.routes.ts` (dentro do layout do Sakai, se quiser sidebar/topbar do template, ou fora dele para tela cheia de cliente):
   ```ts
   { path: 'catalogo',
     loadChildren: () => import('./catalogo/catalogo.routes').then(m => m.CATALOGO_ROUTES) }
   ```

3. **Importe os estilos globais dos overlays** no seu `src/styles.scss`
   (dialog, sidebar e toast são renderizados em `body`, fora do escopo do componente):
   ```scss
   @import 'app/catalogo/catalogo-overlays';
   ```

4. **PrimeNG**: o projeto usa `Button`, `InputText`, `IconField`/`InputIcon`,
   `SelectButton`, `Dropdown`, `Dialog`, `Sidebar`, `InputNumber`, `Tag`, `Toast`.
   O `MessageService` já é provido pelo componente. Se usar PrimeNG global, garanta
   que `<p-toast>` funcione (ele já está no template).

## Pontos de configuração

| O quê | Onde | Observação |
|------|------|-----------|
| **Número do WhatsApp** | `catalogo.component.ts` → `WHATSAPP_NUMBER` | só dígitos com DDI (ex.: `1XXXXXXXXXX`) |
| **Dados reais (API)** | `wine.service.ts` | troque os `of(...)` por `http.get<Wine[]>('/api/wines')` |
| **Fotos dos vinhos** | `bottle-art.component.ts` | substitua o SVG por `<img [src]="wine().imageUrl">` quando tiver as fotos |
| **Cor primária** | tema do Sakai | o SCSS usa `--primary-color`; troque o preset do Sakai para mudar |

## Tema (claro/escuro)

O SCSS **não fixa cores** — herda dos tokens do Sakai (`--surface-*`, `--primary-color`,
`--text-color`). Assim o catálogo acompanha automaticamente o seletor de tema do layout
Sakai (claro/escuro) sem nenhum código extra.

## Compatibilidade de versão (PrimeNG)

- `p-tag severity="warn"` → PrimeNG **18+**. Em PrimeNG 17 use `severity="warning"`.
- `p-sidebar` → em PrimeNG 18 foi renomeado para `p-drawer` (a API é equivalente).
- `IconField`/`InputIcon` → PrimeNG **17.6+**. Em versões anteriores, troque por
  `<span class="p-input-icon-left"><i class="pi pi-search"></i><input pInputText/></span>`.

Ajuste esses 3 pontos conforme a versão do PrimeNG do seu Sakai.
