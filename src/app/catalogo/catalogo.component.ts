import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PurchaseKind, Wine, WineCategory } from './models/wine.model';
import { WineService } from './services/wine.service';
import { CartService } from './services/cart.service';
import { WineCardComponent } from './components/wine-card.component';
import { WineDetailDialogComponent } from './components/wine-detail-dialog.component';
import { CartDrawerComponent } from './components/cart-drawer.component';
import { BottleArtComponent } from './components/bottle-art.component';

type SortKey = 'rel' | 'price-asc' | 'price-desc' | 'name';

/** Número americano do vendedor (somente dígitos, com DDI). */
const WHATSAPP_NUMBER = '1XXXXXXXXXX';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
  imports: [
    FormsModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule,
    SelectButtonModule, SelectModule, ToastModule,
    WineCardComponent, WineDetailDialogComponent, CartDrawerComponent, BottleArtComponent,
  ],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent implements OnInit {
  private readonly wineService = inject(WineService);
  private readonly messages = inject(MessageService);
  readonly cart = inject(CartService);

  readonly wines = signal<Wine[]>([]);
  readonly search = signal('');
  readonly activeCategory = signal<WineCategory | 'Todos'>('Todos');
  readonly sort = signal<SortKey>('rel');

  readonly cartOpen = signal(false);
  readonly selectedWine = signal<Wine | null>(null);

  /** opções de filtro de categoria (p-selectButton) */
  readonly categoryOptions = signal<{ label: string; value: WineCategory | 'Todos' }[]>([]);

  readonly sortOptions = [
    { label: 'Em destaque', value: 'rel' as SortKey },
    { label: 'Menor preço', value: 'price-asc' as SortKey },
    { label: 'Maior preço', value: 'price-desc' as SortKey },
    { label: 'Nome (A–Z)', value: 'name' as SortKey },
  ];

  /**
   * Vinhos em destaque para o hero. Wine.featured ainda não existe no back-end
   * (Vinho), então por ora cai para os primeiros da lista real.
   */
  readonly heroBottles = computed(() => {
    const featured = this.wines().filter((w) => w.featured);
    return (featured.length ? featured : this.wines()).slice(0, 4);
  });

  /** lista filtrada + ordenada */
  readonly filtered = computed<Wine[]>(() => {
    let list = this.wines().slice();
    const cat = this.activeCategory();
    if (cat !== 'Todos') list = list.filter((w) => w.category === cat);

    const q = this.search().trim().toLowerCase();
    if (q) {
      list = list.filter((w) =>
        `${w.name} ${w.grape} ${w.producer} ${w.region}`.toLowerCase().includes(q),
      );
    }

    switch (this.sort()) {
      case 'price-asc': list.sort((a, b) => a.priceUnit - b.priceUnit); break;
      case 'price-desc': list.sort((a, b) => b.priceUnit - a.priceUnit); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.stock > 0) - Number(a.stock > 0));
    }
    return list;
  });

  ngOnInit(): void {
    this.wineService.getWines().subscribe((w) => this.wines.set(w));
    this.wineService.getCategories().subscribe((cats) =>
      this.categoryOptions.set([
        { label: 'Todos', value: 'Todos' },
        ...cats.map((c) => ({ label: c, value: c })),
      ]),
    );
  }

  openWine(wine: Wine): void {
    this.selectedWine.set(wine);
  }

  addToCart(wine: Wine, kind: PurchaseKind = 'unit', qty = 1): void {
    this.cart.add(wine, kind, qty);
    this.messages.add({
      severity: 'success',
      summary: 'Adicionado ao carrinho',
      detail: `${wine.name} · ${kind === 'box' ? 'caixa' : 'avulso'}`,
      life: 2600,
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.activeCategory.set('Todos');
  }

  /** Monta a mensagem do pedido e abre o WhatsApp do vendedor (link wa.me). */
  checkout(): void {
    const lines = this.cart.lines();
    if (lines.length === 0) return;

    const fmt = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
    const body = lines
      .map((l) => {
        const label = l.kind === 'box' ? `caixa (${l.wine.boxQty} un)` : 'avulso';
        return `• ${l.qty}x ${l.wine.name} ${l.wine.year} — ${label} — ${fmt(l.lineTotal)}`;
      })
      .join('\n');

    const msg =
      `*Novo pedido — Adega Serra Azul*\n\n${body}\n\n` +
      `*Total: ${fmt(this.cart.subtotal())}*\n\n` +
      `Gostaria de combinar o pagamento e a entrega.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    this.messages.add({
      severity: 'info',
      summary: 'Abrindo o WhatsApp…',
      detail: 'Combine o pagamento com o vendedor',
      life: 2600,
    });
  }
}
