import { ChangeDetectorRef, Component, effect, input, output, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FotoService } from '@/app/shared/services/foto.service';
import { Vinho, VinhoFoto } from '@/app/catalogo/models/wine.model';

const MAX_FOTOS = 5;

@Component({
    selector: 'app-vinho-fotos-dialog',
    standalone: true,
    imports: [DialogModule, ButtonModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: `
        <p-confirmdialog [style]="{ width: '420px' }" />

        <p-dialog
            [visible]="!!vinho()"
            (visibleChange)="!$event && close.emit()"
            [modal]="true"
            [dismissableMask]="true"
            [style]="{ width: '640px' }"
            [header]="'Fotos — ' + (vinho()?.nome ?? '')"
        >
            <div class="fotos-grid">
                @for (foto of fotos(); track foto.id; let i = $index) {
                    <div class="foto-item">
                        <img [src]="foto.url" [alt]="vinho()?.nome" />
                        <div class="foto-item__actions">
                            <p-button icon="pi pi-arrow-left" [rounded]="true" [outlined]="true" [disabled]="i === 0" (click)="mover(i, -1)" />
                            <p-button icon="pi pi-arrow-right" [rounded]="true" [outlined]="true" [disabled]="i === fotos().length - 1" (click)="mover(i, 1)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="confirmarRemover(foto)" />
                        </div>
                    </div>
                }
                @if (fotos().length < MAX_FOTOS) {
                    <div class="foto-item foto-item--upload">
                        <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelected($event)" />
                        <p-button label="Adicionar foto" icon="pi pi-plus" [outlined]="true" [loading]="enviando()" (click)="fileInput.click()" />
                    </div>
                }
            </div>
            <p class="fotos-count">{{ fotos().length }} de {{ MAX_FOTOS }} fotos</p>
        </p-dialog>
    `,
    styles: [`
        .fotos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 12px;
        }
        .foto-item {
            position: relative;
            border: 1px solid var(--p-content-border-color);
            border-radius: 8px;
            overflow: hidden;
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--p-content-hover-background);
        }
        .foto-item img { width: 100%; height: 100%; object-fit: cover; }
        .foto-item__actions {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            display: flex;
            justify-content: center;
            gap: 4px;
            padding: 6px;
            background: rgba(0, 0, 0, .55);
        }
        .foto-item--upload { border-style: dashed; }
        .fotos-count { margin-top: 14px; color: var(--p-text-muted-color); font-size: 13px; }
    `],
})
export class VinhoFotosDialogComponent {
    readonly vinho = input<Vinho | null>(null);
    readonly close = output<void>();

    readonly MAX_FOTOS = MAX_FOTOS;
    readonly fotos = signal<VinhoFoto[]>([]);
    readonly enviando = signal(false);

    constructor(
        private fotoService: FotoService,
        private confirmationService: ConfirmationService,
        private chRef: ChangeDetectorRef
    ) {
        effect(() => {
            const v = this.vinho();
            if (v) {
                this.load(v.id);
            } else {
                this.fotos.set([]);
            }
        });
    }

    private load(vinhoId: string) {
        this.fotoService.getFotos(vinhoId).subscribe(data => {
            this.fotos.set(data);
            this.chRef.detectChanges();
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        const v = this.vinho();
        input.value = '';
        if (!file || !v) return;

        this.enviando.set(true);
        this.chRef.detectChanges();
        this.fotoService.uploadFoto(v.id, file).subscribe({
            next: () => { this.enviando.set(false); this.load(v.id); },
            error: () => { this.enviando.set(false); this.chRef.detectChanges(); },
        });
    }

    mover(index: number, direcao: -1 | 1) {
        const lista = this.fotos();
        const alvo = index + direcao;
        if (alvo < 0 || alvo >= lista.length) return;

        const a = lista[index];
        const b = lista[alvo];
        const v = this.vinho();

        this.fotoService.atualizarOrdem(a.id, b.ordem).subscribe();
        this.fotoService.atualizarOrdem(b.id, a.ordem).subscribe(() => {
            if (v) this.load(v.id);
        });
    }

    confirmarRemover(foto: VinhoFoto) {
        this.confirmationService.confirm({
            message: 'Deseja remover esta foto?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const v = this.vinho();
                this.fotoService.deleteFoto(foto.id).subscribe(() => { if (v) this.load(v.id); });
            }
        });
    }
}
