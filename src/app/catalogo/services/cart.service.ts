import { computed, effect, Injectable, signal } from '@angular/core';
import { CartItem, CartLine, PurchaseKind, Wine } from '../models/wine.model';
import { WINES } from '../data/wines.data';

const STORAGE_KEY = 'adega_cart_v1';

/**
 * Carrinho persistente baseado em signals.
 * O estado é salvo no localStorage automaticamente (sobrevive a refresh / PWA).
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  /** itens crus (id + tipo + quantidade) */
  private readonly _items = signal<CartItem[]>(this.restore());

  /** índice de vinhos por id — troque por dados da API se necessário */
  private readonly wineMap = new Map<string, Wine>(WINES.map((w) => [w.id, w]));

  /** linhas detalhadas (com vinho, preço unitário e total da linha) */
  readonly lines = computed<CartLine[]>(() =>
    this._items()
      .map((it) => {
        const wine = this.wineMap.get(it.id);
        if (!wine) return null;
        const unitPrice = it.kind === 'box' ? wine.priceBox : wine.priceUnit;
        return { ...it, wine, unitPrice, lineTotal: unitPrice * it.qty } as CartLine;
      })
      .filter((l): l is CartLine => l !== null),
  );

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
    // persiste a cada mudança
    effect(() => {
      const data = JSON.stringify(this._items());
      try {
        localStorage.setItem(STORAGE_KEY, data);
      } catch {
        /* ignore */
      }
    });
  }

  add(wine: Wine, kind: PurchaseKind = 'unit', qty = 1): void {
    this._items.update((items) => {
      const idx = items.findIndex((it) => it.id === wine.id && it.kind === kind);
      if (idx >= 0) {
        const copy = [...items];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...items, { id: wine.id, kind, qty }];
    });
  }

  setQty(id: string, kind: PurchaseKind, qty: number): void {
    if (qty <= 0) return this.remove(id, kind);
    this._items.update((items) =>
      items.map((it) => (it.id === id && it.kind === kind ? { ...it, qty } : it)),
    );
  }

  remove(id: string, kind: PurchaseKind): void {
    this._items.update((items) => items.filter((it) => !(it.id === id && it.kind === kind)));
  }

  clear(): void {
    this._items.set([]);
  }

  private restore(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartItem[];
    } catch {
      return [];
    }
  }
}
