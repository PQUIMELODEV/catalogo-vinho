import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Wine } from '../models/wine.model';
import { BottleArtComponent } from './bottle-art.component';

@Component({
  selector: 'app-wine-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, ButtonModule, TagModule, BottleArtComponent],
  template: `
    <article class="wine-card" [class.is-out]="isOut()">
      <button type="button" class="wine-card__media" (click)="open.emit(wine())" [attr.aria-label]="'Ver ' + wine().name">
        <div class="wine-card__tags">
          @if (isOut()) {
            <p-tag severity="danger" value="Esgotado" />
          } @else if (wine().stock <= 5) {
            <p-tag severity="warn" value="Últimas unidades" />
          }
          @if (wine().featured && !isOut()) {
            <p-tag styleClass="tag-feature" icon="pi pi-star-fill" value="Destaque" />
          }
        </div>
        <app-bottle-art [wine]="wine()" />
        <span class="wine-card__cat">{{ wine().category }}</span>
      </button>

      <div class="wine-card__body">
        <div>
          <h3 class="wine-card__name" (click)="open.emit(wine())">{{ wine().name }}</h3>
          <p class="wine-card__producer">{{ wine().producer }}</p>
        </div>
        <p class="wine-card__meta">
          <i class="pi pi-map-marker"></i> {{ wine().region }}
          <span class="dot">·</span> {{ wine().grape }}
        </p>
        <div class="wine-card__prices">
          <div class="price">
            <span class="price__label">Avulso</span>
            <span class="price__val">{{ wine().priceUnit | currency: 'BRL' : 'symbol' : '1.0-0' }}</span>
          </div>
          <div class="price price--box">
            <span class="price__label">Caixa ({{ wine().boxQty }})</span>
            <span class="price__val">{{ wine().priceBox | currency: 'BRL' : 'symbol' : '1.0-0' }}</span>
          </div>
        </div>
        <div class="wine-card__actions">
          <button pButton type="button" label="Detalhes" severity="secondary" [outlined]="true" size="small" (click)="open.emit(wine())"></button>
          <button
            pButton
            type="button"
            [label]="isOut() ? 'Esgotado' : 'Adicionar'"
            icon="pi pi-shopping-cart"
            size="small"
            [disabled]="isOut()"
            (click)="add.emit(wine())"
          ></button>
        </div>
      </div>
    </article>
  `,
})
export class WineCardComponent {
  readonly wine = input.required<Wine>();
  readonly open = output<Wine>();
  readonly add = output<Wine>();

  readonly isOut = computed(() => this.wine().stock === 0);
}
