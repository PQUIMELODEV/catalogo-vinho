import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { CartItem, CartLine, PurchaseKind, Wine } from '../models/wine.model';
import { WineService } from './wine.service';
import { AuthService } from '../../pages/auth/services/auth.service';

const STORAGE_PREFIX = 'adega_cart_v1';

/** Resultado de add(): quando adicionado < solicitado, o estoque não cobriu o pedido inteiro. */
export interface CartAddResult {
  adicionado: number;
  solicitado: number;
}

/**
 * Carrinho persistente baseado em signals.
 * O estado é salvo no localStorage automaticamente (sobrevive a refresh / PWA),
 * numa chave por usuário — trocar de conta (login/logout) troca de carrinho junto.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly wineService = inject(WineService);
  private readonly authService = inject(AuthService);

  /** itens crus (id + tipo + quantidade) */
  private readonly _items = signal<CartItem[]>([]);

  /** índice de vinhos por id, alimentado pelos dados reais do catálogo */
  private readonly _wineMap = signal(new Map<string, Wine>());

  /** chave de storage do usuário atualmente carregado em _items (evita recarregar à toa) */
  private loadedStorageKey: string | null = null;

  /** linhas detalhadas (com vinho, preço unitário e total da linha) */
  readonly lines = computed<CartLine[]>(() => {
    const wineMap = this._wineMap();
    return this._items()
      .map((it) => {
        const wine = wineMap.get(it.id);
        if (!wine) return null;

        // Agrupamento/preço por caixa depende de Wine.boxQty/priceBox, que ainda não existem no back-end (Vinho). Reative quando houver esse dado real.
        // if (it.kind === 'unit' && it.qty >= wine.boxQty) {
        //   const boxes      = Math.floor(it.qty / wine.boxQty);
        //   const remaining  = it.qty % wine.boxQty;
        //   const lineTotal  = boxes * wine.priceBox + remaining * wine.priceUnit;
        //   // preço médio por unidade para exibição
        //   const unitPrice  = lineTotal / it.qty;
        //   return { ...it, wine, unitPrice, lineTotal } as CartLine;
        // }

        const unitPrice = it.kind === 'box' ? wine.priceBox : wine.priceUnit;
        return { ...it, wine, unitPrice, lineTotal: unitPrice * it.qty } as CartLine;
      })
      .filter((l): l is CartLine => l !== null);
  });

  /** quantidade total de itens (badge do topbar) */
  readonly count = computed(() => this._items().reduce((s, it) => s + it.qty, 0));

  /** total de garrafas (caixa conta boxQty unidades) */
  readonly bottleCount = computed(() =>
    this.lines().reduce((s, l) => s + (l.kind === 'box' ? l.qty * l.wine.boxQty : l.qty), 0),
  );

  /** subtotal em R$ */
  readonly subtotal = computed(() => this.lines().reduce((s, l) => s + l.lineTotal, 0));

  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    // carrega o índice de vinhos a partir dos dados reais do catálogo
    this.wineService.getWines().subscribe((wines) => {
      this._wineMap.set(new Map(wines.map((w) => [w.id, w])));
    });

    // troca de usuário (login/logout/troca de conta) → troca de carrinho
    effect(() => {
      const key = this.storageKeyFor(this.authService.currentUser()?.id);
      if (key === this.loadedStorageKey) return;
      this.loadedStorageKey = key;
      this._items.set(this.restore(key));
    });

    // persiste a cada mudança, na chave do usuário atual
    effect(() => {
      const data = JSON.stringify(this._items());
      const key = this.loadedStorageKey;
      if (!key) return;
      try {
        localStorage.setItem(key, data);
      } catch {
        /* ignore */
      }
    });
  }

  /**
   * Adiciona ao carrinho respeitando o estoque (compartilhado entre avulso e caixa fechada
   * do mesmo vinho). Se o estoque não cobrir a quantidade pedida, adiciona o que der e avisa.
   */
  add(wine: Wine, kind: PurchaseKind = 'unit', qty = 1): CartAddResult {
    const garrafasPorUnidade = kind === 'box' ? wine.boxQty : 1;
    const jaNoCarrinho = this.garrafasNoCarrinho(wine.id);
    const disponivel = Math.max(0, wine.stock - jaNoCarrinho);
    const maxUnidades = Math.floor(disponivel / garrafasPorUnidade);
    const quantidadeAdicionada = Math.min(qty, maxUnidades);

    if (quantidadeAdicionada > 0) {
      this._items.update((items) => {
        const idx = items.findIndex((it) => it.id === wine.id && it.kind === kind);
        if (idx >= 0) {
          const copy = [...items];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + quantidadeAdicionada };
          return copy;
        }
        return [...items, { id: wine.id, kind, qty: quantidadeAdicionada }];
      });
    }

    return { adicionado: quantidadeAdicionada, solicitado: qty };
  }

  setQty(id: string, kind: PurchaseKind, qty: number): void {
    if (qty <= 0) return this.remove(id, kind);

    const wine = this._wineMap().get(id);
    if (wine) {
      const garrafasPorUnidade = kind === 'box' ? wine.boxQty : 1;
      const outrasLinhas = this._items()
        .filter((it) => it.id === id && it.kind !== kind)
        .reduce((soma, it) => soma + it.qty * (it.kind === 'box' ? wine.boxQty : 1), 0);
      const maxUnidades = Math.floor(Math.max(0, wine.stock - outrasLinhas) / garrafasPorUnidade);
      qty = Math.min(qty, maxUnidades);
      if (qty <= 0) return this.remove(id, kind);
    }

    this._items.update((items) =>
      items.map((it) => (it.id === id && it.kind === kind ? { ...it, qty } : it)),
    );
  }

  /** true quando essa linha já atingiu o máximo permitido pelo estoque (usado para desabilitar o "+"). */
  atingiuLimiteEstoque(id: string, kind: PurchaseKind): boolean {
    const wine = this._wineMap().get(id);
    if (!wine) return false;
    return this.garrafasNoCarrinho(id) >= wine.stock;
  }

  private garrafasNoCarrinho(wineId: string): number {
    const wine = this._wineMap().get(wineId);
    return this._items()
      .filter((it) => it.id === wineId)
      .reduce((soma, it) => soma + it.qty * (it.kind === 'box' && wine ? wine.boxQty : 1), 0);
  }

  remove(id: string, kind: PurchaseKind): void {
    this._items.update((items) => items.filter((it) => !(it.id === id && it.kind === kind)));
  }

  clear(): void {
    this._items.set([]);
  }

  private storageKeyFor(userId: number | undefined): string {
    return `${STORAGE_PREFIX}_${userId ?? 'anon'}`;
  }

  private restore(key: string): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(key) ?? '[]') as CartItem[];
    } catch {
      return [];
    }
  }
}
