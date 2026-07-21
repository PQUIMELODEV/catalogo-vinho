import { ChangeDetectionStrategy, Component, inject, input, model, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CartService } from '../services/cart.service';
import { BottleArtComponent } from './bottle-art.component';
// import { Wine } from '../models/wine.model'; // usado apenas por upgradeToBox, desabilitado abaixo

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DrawerModule, ButtonModule, TooltipModule, BottleArtComponent],
  template: `
    <p-drawer [(visible)]="visible" position="right" styleClass="cart-sidebar" [style]="{ width: '420px' }">
      <ng-template pTemplate="header">
        <h2 class="cart__title"><i class="pi pi-shopping-cart"></i> Seu pedido</h2>
      </ng-template>

      <div class="cart__body">
        @if (cart.isEmpty()) {
          <div class="cart__empty">
            <span class="cart__empty-ico"><i class="pi pi-shopping-bag"></i></span>
            <p>Seu carrinho está vazio.</p>
            <span>Explore o catálogo e adicione seus rótulos favoritos.</span>
          </div>
        } @else {
          @for (line of cart.lines(); track line.id + line.kind) {
            <div class="cart-item">
              <div class="cart-item__thumb"><app-bottle-art [wine]="line.wine" /></div>
              <div class="cart-item__info">
                <div class="cart-item__top">
                  <div>
                    <h4>{{ line.wine.name }}</h4>
                    <span class="cart-item__kind">
                      <!-- Agrupamento por caixa depende de Wine.boxQty/priceBox, que ainda não existem no back-end (Vinho). Reative quando houver esse dado real.
                      @if (line.kind === 'box') {
                        Caixa · {{ line.wine.boxQty }} un
                      } @else if (line.qty >= line.wine.boxQty) {
                        {{ Math.floor(line.qty / line.wine.boxQty) }} caixa{{ Math.floor(line.qty / line.wine.boxQty) > 1 ? 's' : '' }}
                        @if (line.qty % line.wine.boxQty > 0) {
                          + {{ line.qty % line.wine.boxQty }} avulso{{ line.qty % line.wine.boxQty > 1 ? 's' : '' }}
                        }
                        <span class="kind-badge">preço caixa aplicado</span>
                      } @else {
                        Unidade avulsa
                      }
                      -->
                      Unidade avulsa
                    </span>
                  </div>
                  <button type="button" class="link-danger" (click)="cart.remove(line.id, line.kind)" aria-label="Remover">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <div class="cart-item__bottom">
                  <div class="stepper">
                    <button type="button" class="stepper__btn" [disabled]="line.qty <= 1" (click)="cart.setQty(line.id, line.kind, line.qty - 1)">
                      <i class="pi pi-minus"></i>
                    </button>
                    <span class="stepper__val">{{ line.qty }}</span>
                    <button type="button" class="stepper__btn" [disabled]="cart.atingiuLimiteEstoque(line.id, line.kind)"
                        [pTooltip]="cart.atingiuLimiteEstoque(line.id, line.kind) ? 'Estoque máximo atingido' : ''"
                        (click)="cart.setQty(line.id, line.kind, line.qty + 1)">
                      <i class="pi pi-plus"></i>
                    </button>
                  </div>
                  <strong>{{ line.lineTotal | currency: 'BRL' : 'symbol' : '1.0-0' }}</strong>
                </div>

              </div>
            </div>
          }
        }
      </div>

      <ng-template pTemplate="footer">
        @if (!cart.isEmpty()) {
          <div class="cart__foot">
            <div class="cart__summary">
              <span>{{ cart.bottleCount() }} garrafa{{ cart.bottleCount() !== 1 ? 's' : '' }}</span>
              <div class="cart__total">
                <span>Subtotal</span>
                <strong>{{ cart.subtotal() | currency: 'BRL' : 'symbol' : '1.0-0' }}</strong>
              </div>
            </div>
            <p class="cart__note">
              <i class="pi pi-info-circle"></i>
              O pagamento é combinado direto com o vendedor (PIX, transferência ou dinheiro).
            </p>
            <button
              pButton
              type="button"
              class="w-full btn-wa"
              label="Finalizar pelo WhatsApp"
              icon="pi pi-whatsapp"
              [loading]="loading()"
              [disabled]="loading()"
              (click)="checkout.emit()"
            ></button>
          </div>
        }
      </ng-template>
    </p-drawer>
  `,
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
  readonly visible = model(false);
  readonly loading = input(false);
  readonly checkout = output<void>();
  readonly Math = Math;

  // Conversão para caixa depende de Wine.boxQty, que ainda não existe no back-end (Vinho). Reative quando houver esse dado real.
  // upgradeToBox(id: string, wine: Wine): void {
  //   const unitLine = this.cart.lines().find(l => l.id === id && l.kind === 'unit');
  //   if (!unitLine) return;
  //   const boxes = Math.floor(unitLine.qty / wine.boxQty);
  //   const remaining = unitLine.qty % wine.boxQty;
  //   this.cart.remove(id, 'unit');
  //   if (boxes > 0) this.cart.add(wine, 'box', boxes);
  //   if (remaining > 0) this.cart.add(wine, 'unit', remaining);
  // }
}
