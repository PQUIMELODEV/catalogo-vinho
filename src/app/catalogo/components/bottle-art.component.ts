import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Wine } from '../models/wine.model';
import { VARIETAL_TINT } from '../data/wines.data';

/**
 * Rótulo ilustrado por formas geométricas, tingido pelo tipo do vinho.
 * Usado como placeholder elegante até as fotos reais (fornecidas pelo cliente)
 * substituírem este componente por um <img>.
 */
@Component({
  selector: 'app-bottle-art',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="bottle-art" [attr.width]="w()" [attr.height]="h()" viewBox="0 0 120 300" aria-hidden="true">
      <defs>
        <linearGradient [attr.id]="gradId()" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" [attr.stop-color]="tint().deep" />
          <stop offset="0.45" [attr.stop-color]="tint().glass" />
          <stop offset="0.55" [attr.stop-color]="tint().base" />
          <stop offset="1" [attr.stop-color]="tint().deep" />
        </linearGradient>
      </defs>
      <rect x="50" y="6" width="20" height="14" rx="3" [attr.fill]="tint().deep" />
      <rect x="52" y="18" width="16" height="64" rx="6" [attr.fill]="fill()" />
      <path
        d="M44 80 Q44 96 36 110 Q30 122 30 150 L30 270 Q30 288 48 288 L72 288 Q90 288 90 270 L90 150 Q90 122 84 110 Q76 96 76 80 Z"
        [attr.fill]="fill()"
      />
      <rect x="40" y="120" width="9" height="140" rx="5" fill="#ffffff" opacity="0.18" />
      <rect x="34" y="168" width="52" height="86" rx="4" fill="#fbfaf7" opacity="0.96" />
      <rect x="34" y="168" width="52" height="20" rx="4" [attr.fill]="tint().base" opacity="0.9" />
      <text x="60" y="182" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">{{ wine().year }}</text>
      <!-- Iniciais do produtor dependem de Wine.producer, que ainda não existe no back-end (Vinho). Reative quando houver esse dado real.
      <text x="60" y="212" text-anchor="middle" font-size="8.5" font-weight="700" fill="#3a2a22">{{ producerTag() }}</text>
      <line x1="42" y1="222" x2="78" y2="222" [attr.stroke]="tint().deep" stroke-width="1" opacity="0.5" />
      -->
      <text x="60" y="238" text-anchor="middle" font-size="6.5" fill="#6b5b50">{{ wine().category.toUpperCase() }}</text>
    </svg>
  `,
  styles: [`:host { display: contents; } .bottle-art { display: block; }`],
})
export class BottleArtComponent {
  readonly wine = input.required<Wine>();
  readonly big = input(false);

  readonly tint = computed(() => VARIETAL_TINT[this.wine().category]);
  readonly w = computed(() => (this.big() ? 120 : 86));
  readonly h = computed(() => (this.big() ? 300 : 215));
  readonly gradId = computed(() => `g-${this.wine().id}${this.big() ? '-b' : ''}`);
  readonly fill = computed(() => `url(#${this.gradId()})`);
  // Iniciais do produtor dependem de Wine.producer, que ainda não existe no back-end (Vinho). Reative quando houver esse dado real.
  // readonly producerTag = computed(() => this.wine().producer.split(' ')[0].toUpperCase());
}
