import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { PurchaseKind, Wine } from '../models/wine.model';
import { BottleArtComponent } from './bottle-art.component';

@Component({
  selector: 'app-wine-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, FormsModule, DialogModule, ButtonModule, TagModule, InputNumberModule, BottleArtComponent],
  template: `
    <p-dialog
      [visible]="!!wine()"
      (visibleChange)="!$event && close.emit()"
      [modal]="true"
      [draggable]="false"
      [dismissableMask]="true"
      [style]="{ width: '880px', maxWidth: '94vw' }"
      [breakpoints]="{ '760px': '100vw' }"
      styleClass="wine-dialog"
      appendTo="body"
    >
      @if (wine(); as w) {
        <div class="dialog__grid">
          <div class="dialog__media">
            <div class="dialog__tags">
              @if (isOut()) {
                <p-tag severity="danger" value="Esgotado" />
              } @else if (w.stock <= 5) {
                <p-tag severity="warn" value="Últimas unidades" />
              }
              <!-- "Destaque" depende de Wine.featured, que ainda não existe no back-end (Vinho). Reative quando houver esse dado real.
              @if (w.featured && !isOut()) {
                <p-tag styleClass="tag-feature" icon="pi pi-star-fill" value="Destaque" />
              }
              -->
            </div>
            @if (w.photos.length) {
              <div class="dialog__carousel" tabindex="0" (keydown.arrowleft)="fotoAnterior()" (keydown.arrowright)="fotoProxima()">
                <img class="dialog__photo" [src]="w.photos[fotoAtivaIndex()]" [alt]="w.name" />
                @if (w.photos.length > 1) {
                  <button type="button" class="dialog__nav dialog__nav--prev" (click)="fotoAnterior()" aria-label="Foto anterior">
                    <i class="pi pi-chevron-left"></i>
                  </button>
                  <button type="button" class="dialog__nav dialog__nav--next" (click)="fotoProxima()" aria-label="Próxima foto">
                    <i class="pi pi-chevron-right"></i>
                  </button>
                  <div class="dialog__dots">
                    @for (foto of w.photos; track foto; let i = $index) {
                      <button type="button" class="dialog__dot" [class.is-active]="i === fotoAtivaIndex()" (click)="fotoAtivaIndex.set(i)" [attr.aria-label]="'Ir para foto ' + (i + 1)"></button>
                    }
                  </div>
                }
              </div>
            } @else {
              <app-bottle-art [wine]="w" [big]="true" />
            }
          </div>

          <div class="dialog__content">
            <span class="dialog__cat">{{ w.category }} · {{ w.country }}</span>
            <h2 class="dialog__title">{{ w.name }}</h2>
            <!-- Produtor e região ainda não existem no back-end (Vinho). Reative quando houver esse dado real.
            <p class="dialog__producer">{{ w.producer }} — {{ w.region }}</p>
            -->
            <p class="dialog__desc">{{ w.description }}</p>

            <div class="spec-grid">
              <!-- Uva ainda não existe no back-end (Vinho). Reative quando houver esse dado real.
              <div class="spec"><span>Uva</span><strong>{{ w.grape }}</strong></div>
              -->
              <div class="spec"><span>Safra</span><strong>{{ w.year }}</strong></div>
              <div class="spec"><span>Teor alcoólico</span><strong>{{ w.abv }}</strong></div>
              <!-- Corpo e temperatura de serviço ainda não existem no back-end (Vinho). Reative quando houver esse dado real.
              <div class="spec"><span>Corpo</span><strong>{{ w.body }}</strong></div>
              <div class="spec"><span>Servir a</span><strong>{{ w.serve }}</strong></div>
              -->
              <div class="spec"><span>Estoque</span><strong>{{ isOut() ? 'Esgotado' : w.stock + ' un' }}</strong></div>
            </div>

            <!-- Harmonização ainda não existe no back-end (Vinho). Reative quando houver esse dado real.
            <div class="harmon">
              <h4><i class="pi pi-apple"></i> Harmonização</h4>
              <div class="harmon__tags">
                @for (p of w.pairing; track p) {
                  <span class="pill">{{ p }}</span>
                }
              </div>
            </div>
            -->

            <!-- Tabela nutricional ainda não existe no back-end (Vinho). Reative quando houver esse dado real.
            <details class="nutri">
              <summary>Tabela nutricional <span>(porção 100 ml)</span></summary>
              <table>
                <tbody>
                  <tr><td>Valor energético</td><td>{{ w.nutrition.energia }}</td></tr>
                  <tr><td>Carboidratos</td><td>{{ w.nutrition.carboidratos }}</td></tr>
                  <tr><td>Açúcares</td><td>{{ w.nutrition.acucares }}</td></tr>
                  <tr><td>Sódio</td><td>{{ w.nutrition.sodio }}</td></tr>
                </tbody>
              </table>
            </details>
            -->

            <div class="dialog__buy">
              @if (hasBox()) {
                <div class="kind-toggle">
                  <button type="button" class="kind-toggle__opt" [class.is-active]="kind() === 'unit'" (click)="kind.set('unit')">
                    <span class="kt-label">Avulso</span>
                    <span class="kt-price">{{ w.priceUnit | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
                  </button>
                  <button type="button" class="kind-toggle__opt" [class.is-active]="kind() === 'box'" (click)="kind.set('box')">
                    <span class="kt-label">Caixa fechada · {{ w.boxQty }} un</span>
                    <span class="kt-price">{{ w.priceBox | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
                    <span class="kt-sub">Unidade na caixa: {{ boxUnitPrice() | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
                  </button>
                </div>
              }
              <div class="dialog__buy-row">
                <p-inputNumber
                  [(ngModel)]="qtyModel"
                  [showButtons]="true"
                  buttonLayout="horizontal"
                  [min]="1"
                  [max]="kind() === 'box' ? 99 : w.stock"
                  decrementButtonClass="p-button-secondary"
                  incrementButtonClass="p-button-secondary"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  inputStyleClass="qty-input"
                />
                <button
                  pButton
                  type="button"
                  class="flex-1"
                  [label]="isOut() ? 'Esgotado' : ('Adicionar — ' + (totalPrice() | currency: 'BRL' : 'symbol' : '1.2-2'))"
                  icon="pi pi-shopping-cart"
                  [disabled]="isOut()"
                  (click)="confirm()"
                ></button>
              </div>
            </div>
          </div>
        </div>
      }
    </p-dialog>
  `,
})
export class WineDetailDialogComponent {
  /** vinho selecionado (null = fechado) */
  readonly wine = input<Wine | null>(null);
  readonly close = output<void>();
  readonly addToCart = output<{ wine: Wine; kind: PurchaseKind; qty: number }>();

  readonly kind = signal<PurchaseKind>('unit');
  readonly qtyModel = signal(1);
  readonly fotoAtivaIndex = signal(0);

  constructor() {
    effect(() => {
      this.wine();
      this.fotoAtivaIndex.set(0);
      this.kind.set('unit');
    });
  }

  readonly hasBox = computed(() => {
    const w = this.wine();
    return !!w && w.boxQty > 0 && w.priceBox > 0;
  });
  readonly boxUnitPrice = computed(() => {
    const w = this.wine();
    return w && this.hasBox() ? w.priceBox / w.boxQty : 0;
  });

  fotoAnterior(): void {
    const total = this.wine()?.photos.length ?? 0;
    if (!total) return;
    this.fotoAtivaIndex.update((i) => (i - 1 + total) % total);
  }

  fotoProxima(): void {
    const total = this.wine()?.photos.length ?? 0;
    if (!total) return;
    this.fotoAtivaIndex.update((i) => (i + 1) % total);
  }

  readonly isOut = computed(() => (this.wine()?.stock ?? 0) === 0);
  readonly totalPrice = computed(() => {
    const w = this.wine();
    if (!w) return 0;
    const unit = this.kind() === 'box' ? w.priceBox : w.priceUnit;
    return unit * this.qtyModel();
  });

  confirm(): void {
    const w = this.wine();
    if (!w) return;
    this.addToCart.emit({ wine: w, kind: this.kind(), qty: this.qtyModel() });
    this.kind.set('unit');
    this.qtyModel.set(1);
    this.close.emit();
  }
}
