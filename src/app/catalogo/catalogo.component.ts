import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { PurchaseKind, Wine } from './models/wine.model';
import { WineService } from './services/wine.service';
import { CartService } from './services/cart.service';
import { WineCardComponent } from './components/wine-card.component';
import { WineDetailDialogComponent } from './components/wine-detail-dialog.component';
import { CartDrawerComponent } from './components/cart-drawer.component';
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
    CurrencyPipe, FormsModule, RouterModule, ButtonModule, DialogModule, InputNumberModule, InputTextModule, IconFieldModule, InputIconModule,
    SelectButtonModule, SelectModule, ToastModule, TooltipModule,
    WineCardComponent, WineDetailDialogComponent, CartDrawerComponent,
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
  readonly activeCategory = signal<string>('Todos');
  readonly sort = signal<SortKey>('rel');

  readonly cartOpen = signal(false);
  readonly selectedWine = signal<Wine | null>(null);
  /** menu sanduíche da topbar no mobile (fonte, tema, admin, sair) */
  readonly menuOpen = signal(false);

  /** opções de filtro de categoria (p-selectButton) */
  readonly categoryOptions = signal<{ label: string; value: string }[]>([]);

  readonly sortOptions = [
    { label: 'Em destaque', value: 'rel' as SortKey },
    { label: 'Menor preço', value: 'price-asc' as SortKey },
    { label: 'Maior preço', value: 'price-desc' as SortKey },
    { label: 'Nome (A–Z)', value: 'name' as SortKey },
  ];

  /** lista filtrada + ordenada */
  readonly filtered = computed<Wine[]>(() => {
    let list = this.wines().slice();
    const cat = this.activeCategory();
    if (cat !== 'Todos') list = list.filter((w) => w.categorias.some((c) => c.nome === cat));

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

  /** Vinho aguardando escolha de UN/CX no modal de adição (null = fechado). */
  readonly addWine = signal<Wine | null>(null);
  readonly addKind = signal<PurchaseKind>('unit');
  readonly addQty = signal(1);

  /** Máximo respeitando o estoque (caixa fechada consome boxQty garrafas por unidade). */
  readonly addMax = computed(() => {
    const w = this.addWine();
    if (!w) return 1;
    if (this.addKind() === 'box') return w.boxQty > 0 ? Math.max(1, Math.floor(w.stock / w.boxQty)) : 1;
    return Math.max(1, w.stock);
  });

  readonly addTotal = computed(() => {
    const w = this.addWine();
    if (!w) return 0;
    return (this.addKind() === 'box' ? w.priceBox : w.priceUnit) * this.addQty();
  });

  /** Clique em "Adicionar" no card: abre o modal para escolher UN/CX quando há caixa; senão adiciona avulso direto. */
  promptAdd(wine: Wine): void {
    const temCaixa = wine.boxQty > 0 && wine.priceBox > 0;
    if (!temCaixa) { this.addToCart(wine, 'unit', 1); return; }
    this.addKind.set('unit');
    this.addQty.set(1);
    this.addWine.set(wine);
  }

  setAddKind(kind: PurchaseKind): void {
    this.addKind.set(kind);
    this.addQty.set(1);
  }

  confirmAdd(): void {
    const w = this.addWine();
    if (!w) return;
    this.addToCart(w, this.addKind(), this.addQty());
    this.addWine.set(null);
  }

  addToCart(wine: Wine, kind: PurchaseKind = 'unit', qty = 1): void {
    const { adicionado, solicitado } = this.cart.add(wine, kind, qty);

    if (adicionado === 0) {
      this.messages.add({
        severity: 'error',
        summary: 'Sem estoque disponível',
        detail: `${wine.name} não tem mais unidades disponíveis para adicionar.`,
        life: 3600,
      });
      return;
    }

    if (adicionado < solicitado) {
      this.messages.add({
        severity: 'warn',
        summary: 'Estoque limitado',
        detail: `Só havia ${adicionado} ${kind === 'box' ? 'caixa(s)' : 'unidade(s)'} de ${wine.name} disponível — adicionamos o que tinha.`,
        life: 4200,
      });
      return;
    }

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
        // "gf" = garrafa avulsa · "cx" = caixa fechada — deixa claro pro vendedor a unidade de cada linha.
        const unidadeLabel = (tipo?: string) => (tipo === 'caixa' ? 'cx' : 'gf');
        const body = pedido.itens
          .map((i) => `• ${i.quantidade} ${unidadeLabel(i.tipo)} ${i.vinhoNome} — ${fmt(i.subtotal ?? i.quantidade * i.precoUnitario)}`)
          .join('\n');

        const msg =
          `*Novo pedido #${pedido.id} — JP Vinhos*\n\n` +
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
