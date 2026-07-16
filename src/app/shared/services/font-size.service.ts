import { Injectable, effect, signal } from '@angular/core';

export type FontScale = 'normal' | 'medio' | 'grande';

interface NivelFonte {
  chave: FontScale;
  label: string;
  scale: number;
}

/**
 * Base do html (styles.scss: `html { font-size: 14px; }`). PrimeNG e as
 * classes utilitárias (Tailwind) usam rem em cima desse valor, então
 * escalar a raiz cobre botões, tags, dropdowns, tabelas etc. — tanto no
 * catálogo do cliente quanto na área administrativa — sem usar `zoom`
 * (que quebraria os media queries). O CSS próprio do catálogo (que usa
 * px fixo) escuta a variável --app-font-scale via calc().
 */
const BASE_ROOT_FONT_PX = 14;

const NIVEIS: NivelFonte[] = [
  { chave: 'normal', label: 'Normal', scale: 0.9 },
  { chave: 'medio', label: 'Médio', scale: 1 },
  { chave: 'grande', label: 'Grande', scale: 1.25 },
];

const INDICE_PADRAO = NIVEIS.findIndex(n => n.chave === 'medio');
const STORAGE_KEY = 'app-font-scale';

@Injectable({ providedIn: 'root' })
export class FontSizeService {
  readonly niveis = NIVEIS;
  readonly indice = signal(this.lerIndiceSalvo());

  constructor() {
    effect(() => this.aplicar(this.indice()));
  }

  get atual(): NivelFonte {
    return NIVEIS[this.indice()];
  }

  podeDiminuir(): boolean {
    return this.indice() > 0;
  }

  podeAumentar(): boolean {
    return this.indice() < NIVEIS.length - 1;
  }

  aumentar(): void {
    if (this.podeAumentar()) this.indice.set(this.indice() + 1);
  }

  diminuir(): void {
    if (this.podeDiminuir()) this.indice.set(this.indice() - 1);
  }

  selecionar(chave: FontScale): void {
    const idx = NIVEIS.findIndex(n => n.chave === chave);
    if (idx >= 0) this.indice.set(idx);
  }

  private lerIndiceSalvo(): number {
    if (typeof localStorage === 'undefined') return INDICE_PADRAO;
    const salvo = localStorage.getItem(STORAGE_KEY);
    const idx = NIVEIS.findIndex(n => n.chave === salvo);
    return idx >= 0 ? idx : INDICE_PADRAO;
  }

  private aplicar(indice: number): void {
    const nivel = NIVEIS[indice];
    document.documentElement.style.setProperty('--app-font-scale', String(nivel.scale));
    document.documentElement.style.fontSize = `${BASE_ROOT_FONT_PX * nivel.scale}px`;
    localStorage.setItem(STORAGE_KEY, nivel.chave);
  }
}
