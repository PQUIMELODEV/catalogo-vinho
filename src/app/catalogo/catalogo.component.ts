import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { PurchaseKind, Wine, WineCategory } from './models/wine.model';
import { WineService } from './services/wine.service';
import { CartService } from './services/cart.service';
import { WineCardComponent } from './components/wine-card.component';
import { WineDetailDialogComponent } from './components/wine-detail-dialog.component';
import { CartDrawerComponent } from './components/cart-drawer.component';
import { BottleArtComponent } from './components/bottle-art.component';
import { AuthService } from '../pages/auth/services/auth.service';
import { LayoutService } from '../layout/service/layout.service';
import { FontSizeService } from '../shared/services/font-size.service';
import { PedidoService } from '../shared/services/pedido.service';
import { CheckoutItem } from '../shared/models/pedido.model';

type SortKey = 'rel' | 'price-asc' | 'price-desc' | 'name';

/** Número do vendedor para receber o pedido via WhatsApp (somente dígitos, com DDI). */
const WHATSAPP_NUMBER = '12812369747';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
  imports: [
    FormsModule, RouterModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule,
    SelectButtonModule, SelectModule, ToastModule, TooltipModule,
    WineCardComponent, WineDetailDialogComponent, CartDrawerComponent, BottleArtComponent,
  ],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent implements OnInit {
  private readonly wineService = inject(WineService);
  private readonly messages = inject(MessageService);
  private readonly pedidoService = inject(PedidoService);
  readonly authService = inject(AuthService);
  readonly layoutService = inject(LayoutService);
  readonly cart = inject(CartService);
  readonly fontSize = inject(FontSizeService);

  readonly checkingOut = signal(false);

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

  logout(): void {
    this.authService.logout();
  }

  toggleDarkMode(): void {
    this.layoutService.layoutConfig.update(state => ({ ...state, darkTheme: !state.darkTheme }));
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Grava o pedido no servidor (usando o cliente vinculado ao usuário logado) e, só
   * depois de confirmado, monta a mensagem e abre o WhatsApp do vendedor (link wa.me).
   */
  checkout(): void {
    const lines = this.cart.lines();
    if (lines.length === 0 || this.checkingOut()) return;

    const itens: CheckoutItem[] = lines.map((l) => ({
      vinhoId: l.id,
      kind: l.kind,
      quantidade: l.qty,
    }));

    this.checkingOut.set(true);
    this.pedidoService.checkout(itens).subscribe({
      next: (pedido) => {
        this.checkingOut.set(false);

        const fmt = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        const body = pedido.itens
          .map((i) => `• ${i.quantidade}x ${i.vinhoNome} — ${fmt(i.subtotal ?? i.quantidade * i.precoUnitario)}`)
          .join('\n');

        const msg =
          `*Novo pedido #${pedido.id} — Adega Serra Azul*\n\n` +
          `Cliente: ${pedido.clienteNome ?? ''}${pedido.clienteTelefone ? ' - ' + pedido.clienteTelefone : ''}\n\n` +
          (pedido.enderecoResumo ? `Endereço de entrega:\n${pedido.enderecoResumo}\n\n` : '') +
          `${body}\n\n` +
          `*Total: ${fmt(pedido.valorTotal)}*\n\n` +
          `Gostaria de combinar o pagamento e a entrega.`;

        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
        this.cart.clear();
        this.cartOpen.set(false);
        this.messages.add({
          severity: 'success',
          summary: 'Pedido registrado!',
          detail: 'Abrindo o WhatsApp para combinar pagamento e entrega…',
          life: 3200,
        });
      },
      error: (err: Error) => {
        this.checkingOut.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'Não foi possível finalizar o pedido',
          detail: err.message || 'Tente novamente ou fale com o vendedor.',
          life: 5000,
        });
      },
    });
  }
}
