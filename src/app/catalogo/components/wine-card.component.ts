import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
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
  styles: [`
    :host { display: contents; }

    .wine-card {
      background: var(--p-content-background);
      border: 1px solid var(--p-content-border-color);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform .18s, box-shadow .18s, border-color .18s;
      cursor: default;
    }
    .wine-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px -8px rgba(0,0,0,.22);
      border-color: var(--p-primary-color);
    }
    .wine-card.is-out { opacity: .75; }

    /* --- Área da imagem / carrossel --- */
    .wine-card__media {
      position: relative;
      width: 100%;
      height: 220px;
      cursor: pointer;
      background: radial-gradient(ellipse at 50% 20%, var(--p-surface-100, #f1f5f9), var(--p-content-hover-background, #eef1f6));
      display: grid;
      place-items: center;
      padding: 0;
      border: none;
      border-bottom: 1px solid var(--p-content-border-color);
    }
    .wine-card__photo {
      /* posicionado em vez de depender do stretch do grid (place-items: center
         não estica os itens), senão fotos em retrato ficam com a altura
         "auto" baseada na proporção natural da imagem e vazam do container */
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .wine-card__nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: none;
      background: rgba(0, 0, 0, .45);
      color: #fff;
      display: grid;
      place-items: center;
      cursor: pointer;
      z-index: 2;
      opacity: 0;
      transition: opacity .15s, background .15s;
    }
    .wine-card__media:hover .wine-card__nav { opacity: 1; }
    .wine-card__nav:hover { background: rgba(0, 0, 0, .7); }
    .wine-card__nav--prev { left: 8px; }
    .wine-card__nav--next { right: 8px; }
    .wine-card__nav .pi { font-size: calc(11px * var(--app-font-scale, 1)); }
    .wine-card__dots {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      z-index: 1;
    }
    .wine-card__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, .55);
      border: none;
      padding: 0;
      cursor: pointer;
    }
    .wine-card__dot.is-active { background: #fff; }
    .wine-card__tags {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: flex-start;
      z-index: 1;
    }
    .wine-card__cat {
      position: absolute;
      bottom: 10px;
      right: 10px;
      font-size: calc(10px * var(--app-font-scale, 1));
      font-weight: 700;
      letter-spacing: .07em;
      text-transform: uppercase;
      color: var(--p-text-muted-color);
      background: var(--p-content-background);
      border: 1px solid var(--p-content-border-color);
      padding: 3px 8px;
      border-radius: 6px;
    }

    /* --- Corpo --- */
    .wine-card__body {
      padding: 14px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }
    .wine-card__name {
      font-size: calc(15.5px * var(--app-font-scale, 1));
      font-weight: 700;
      letter-spacing: -.15px;
      margin: 0 0 3px;
      color: var(--p-text-color);
      cursor: pointer;
      line-height: 1.3;
    }
    .wine-card__name:hover { color: var(--p-primary-color); }
    .wine-card__producer {
      margin: 0;
      font-size: calc(12.5px * var(--app-font-scale, 1));
      color: var(--p-text-muted-color);
      font-weight: 500;
    }
    .wine-card__meta {
      margin: 0;
      font-size: calc(12px * var(--app-font-scale, 1));
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 5px;
      flex-wrap: wrap;
    }
    .wine-card__meta .pi { font-size: calc(11px * var(--app-font-scale, 1)); }
    .dot { opacity: .4; }

    /* --- Preços --- */
    .wine-card__prices {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }
    .price {
      flex: 1;
      border: 1px solid var(--p-content-border-color);
      border-radius: 8px;
      padding: 8px 10px;
      background: var(--p-content-hover-background);
    }
    .price--box {
      background: color-mix(in srgb, var(--p-primary-color) 10%, transparent);
      border-color: color-mix(in srgb, var(--p-primary-color) 30%, transparent);
    }
    .price__label {
      display: block;
      font-size: calc(10px * var(--app-font-scale, 1));
      font-weight: 700;
      letter-spacing: .05em;
      text-transform: uppercase;
      color: var(--p-text-muted-color);
      margin-bottom: 3px;
    }
    .price--box .price__label { color: var(--p-primary-color); }
    .price__val {
      display: block;
      font-size: calc(15.5px * var(--app-font-scale, 1));
      font-weight: 800;
      letter-spacing: -.3px;
      color: var(--p-text-color);
    }
    .price__val--strike {
      font-size: calc(12px * var(--app-font-scale, 1));
      font-weight: 600;
      text-decoration: line-through;
      opacity: .55;
    }
    .price__val--promo {
      color: var(--p-red-500, #ef4444);
    }
    .price__sub {
      display: block;
      font-size: calc(10.5px * var(--app-font-scale, 1));
      font-weight: 600;
      color: var(--p-primary-color);
      margin-top: 2px;
    }

    /* --- Ações --- */
    .wine-card__actions {
      display: flex;
      gap: 8px;
    }
    .wine-card__actions ::ng-deep .p-button { flex: 1; justify-content: center; }
  `],
  template: `
    <article class="wine-card" [class.is-out]="isOut()">
      <div
        class="wine-card__media"
        role="button"
        tabindex="0"
        [attr.aria-label]="'Ver ' + wine().name"
        (click)="open.emit(wine())"
        (keyup.enter)="open.emit(wine())"
      >
        <div class="wine-card__tags">
          @if (isOut()) {
            <p-tag severity="danger" value="Esgotado" />
          } @else if (wine().stock <= 5) {
            <p-tag severity="warn" value="Últimas unidades" />
          }
          <!-- "Destaque" depende de Wine.featured, que ainda não existe no back-end (Vinho). Reative quando houver esse dado real.
          @if (wine().featured && !isOut()) {
            <p-tag styleClass="tag-feature" icon="pi pi-star-fill" value="Destaque" />
          }
          -->
        </div>
        @if (wine().photos.length) {
          <img class="wine-card__photo" [src]="wine().photos[fotoIndex()]" [alt]="wine().name" />
          @if (wine().photos.length > 1) {
            <button type="button" class="wine-card__nav wine-card__nav--prev" (click)="fotoAnterior($event)" aria-label="Foto anterior">
              <i class="pi pi-chevron-left"></i>
            </button>
            <button type="button" class="wine-card__nav wine-card__nav--next" (click)="fotoProxima($event)" aria-label="Próxima foto">
              <i class="pi pi-chevron-right"></i>
            </button>
            <div class="wine-card__dots">
              @for (foto of wine().photos; track foto; let i = $index) {
                <button type="button" class="wine-card__dot" [class.is-active]="i === fotoIndex()" (click)="irParaFoto($event, i)" [attr.aria-label]="'Ir para foto ' + (i + 1)"></button>
              }
            </div>
          }
        } @else {
          <app-bottle-art [wine]="wine()" />
        }
        <span class="wine-card__cat">{{ wine().category }}</span>
      </div>

      <div class="wine-card__body">
        <div>
          <h3 class="wine-card__name" (click)="open.emit(wine())">{{ wine().name }}</h3>
          <!-- Produtor ainda não existe no back-end (Vinho). Reative quando houver esse dado real.
          <p class="wine-card__producer">{{ wine().producer }}</p>
          -->
        </div>
        <!-- Região e uva ainda não existem no back-end (Vinho). Reative quando houver esse dado real.
        <p class="wine-card__meta">
          <i class="pi pi-map-marker"></i> {{ wine().region }}
          <span class="dot">·</span> {{ wine().grape }}
        </p>
        -->
        <div class="wine-card__prices">
          <div class="price">
            <span class="price__label">Avulso</span>
            @if (hasPromo()) {
              <span class="price__val price__val--strike">{{ wine().priceUnit | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
              <span class="price__val price__val--promo">{{ wine().pricePromo | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
            } @else {
              <span class="price__val">{{ wine().priceUnit | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
            }
          </div>
          @if (hasBox()) {
            <div class="price price--box">
              <span class="price__label">Caixa fechada · {{ wine().boxQty }} un</span>
              <span class="price__val">{{ wine().priceBox | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
              <span class="price__sub">Unidade na caixa: {{ boxUnitPrice() | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
            </div>
          }
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
  readonly fotoIndex = signal(0);

  readonly hasBox = computed(() => this.wine().boxQty > 0 && this.wine().priceBox > 0);
  readonly boxUnitPrice = computed(() => {
    const w = this.wine();
    return this.hasBox() ? w.priceBox / w.boxQty : 0;
  });
  readonly hasPromo = computed(() => {
    const w = this.wine();
    return w.pricePromo != null && w.pricePromo < w.priceUnit;
  });

  fotoAnterior(event: Event): void {
    event.stopPropagation();
    const total = this.wine().photos.length;
    this.fotoIndex.update((i) => (i - 1 + total) % total);
  }

  fotoProxima(event: Event): void {
    event.stopPropagation();
    const total = this.wine().photos.length;
    this.fotoIndex.update((i) => (i + 1) % total);
  }

  irParaFoto(event: Event, index: number): void {
    event.stopPropagation();
    this.fotoIndex.set(index);
  }
}
