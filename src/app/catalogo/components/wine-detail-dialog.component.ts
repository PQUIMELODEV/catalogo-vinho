import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
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
              @if (w.featured && !isOut()) {
                <p-tag styleClass="tag-feature" icon="pi pi-star-fill" value="Destaque" />
              }
            </div>
            <app-bottle-art [wine]="w" [big]="true" />
          </div>

          <div class="dialog__content">
            <span class="dialog__cat">{{ w.category }} · {{ w.country }}</span>
            <h2 class="dialog__title">{{ w.name }}</h2>
            <p class="dialog__producer">{{ w.producer }} — {{ w.region }}</p>
            <p class="dialog__desc">{{ w.description }}</p>

            <div class="spec-grid">
              <div class="spec"><span>Uva</span><strong>{{ w.grape }}</strong></div>
              <div class="spec"><span>Safra</span><strong>{{ w.year }}</strong></div>
              <div class="spec"><span>Teor alcoólico</span><strong>{{ w.abv }}</strong></div>
              <div class="spec"><span>Corpo</span><strong>{{ w.body }}</strong></div>
              <div class="spec"><span>Servir a</span><strong>{{ w.serve }}</strong></div>
              <div class="spec"><span>Estoque</span><strong>{{ isOut() ? 'Esgotado' : w.stock + ' un' }}</strong></div>
            </div>

            <div class="harmon">
              <h4><i class="pi pi-apple"></i> Harmonização</h4>
              <div class="harmon__tags">
                @for (p of w.pairing; track p) {
                  <span class="pill">{{ p }}</span>
                }
              </div>
            </div>

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

            <div class="dialog__buy">
              <div class="kind-toggle">
                <button type="button" class="kind-toggle__opt" [class.is-active]="kind() === 'unit'" (click)="kind.set('unit')">
                  <span class="kt-label">Avulso</span>
                  <span class="kt-price">{{ w.priceUnit | currency: 'BRL' : 'symbol' : '1.0-0' }}</span>
                </button>
                <button type="button" class="kind-toggle__opt" [class.is-active]="kind() === 'box'" (click)="kind.set('box')">
                  <span class="kt-label">Caixa · {{ w.boxQty }} un</span>
                  <span class="kt-price">{{ w.priceBox | currency: 'BRL' : 'symbol' : '1.0-0' }}</span>
                </button>
              </div>
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
                  [label]="isOut() ? 'Esgotado' : ('Adicionar — ' + (totalPrice() | currency: 'BRL' : 'symbol' : '1.0-0'))"
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
