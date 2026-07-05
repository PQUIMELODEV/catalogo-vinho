import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { CartItem, CartLine, PurchaseKind, Wine } from '../models/wine.model';
import { WineService } from './wine.service';

const STORAGE_KEY = 'adega_cart_v1';

/**
 * Carrinho persistente baseado em signals.
 * O estado é salvo no localStorage automaticamente (sobrevive a refresh / PWA).
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly wineService = inject(WineService);

  /** itens crus (id + tipo + quantidade) */
  private readonly _items = signal<CartItem[]>(this.restore());

  /** índice de vinhos por id, alimentado pelos dados reais do catálogo */
  private readonly _wineMap = signal(new Map<string, Wine>());

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
