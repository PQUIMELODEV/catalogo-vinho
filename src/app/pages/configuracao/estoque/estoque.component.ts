import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { EstoqueService } from '@/app/shared/services/estoque.service';
import { Estoque } from '@/app/catalogo/models/wine.model';
import { quebraEmCaixasLabel } from '@/app/shared/utils/quantidade.util';

@Component({
    selector: 'app-estoque',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputNumberModule, ToolbarModule, ToastModule, IconFieldModule, InputIconModule, TagModule
    ],
    providers: [],
    template: `
        <p-toast />

        <p-table #dt [value]="estoques()" [rows]="10" [paginator]="true"
            [globalFilterFields]="['vinhoNome']" dataKey="vinhoId" [rowHover]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} itens"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
            [tableStyle]="{ 'min-width': '60rem' }">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Estoque</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onFilter(dt, $event)" placeholder="Pesquisar vinho..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th pSortableColumn="vinhoNome" style="min-width:20rem">Vinho <p-sortIcon field="vinhoNome" /></th>
                    <th pSortableColumn="quantidade" style="min-width:12rem">Quantidade <p-sortIcon field="quantidade" /></th>
                    <th pSortableColumn="quantidadeMinima" style="min-width:12rem">Qtd. Mínima <p-sortIcon field="quantidadeMinima" /></th>
                    <th style="min-width:10rem">Status</th>
                    <th style="min-width:8rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-item>
                <tr>
                    <td>{{ item.vinhoNome }}</td>
                    <td>
                        {{ item.quantidade }} un
                        @if (quebra(item.quantidade, item.quantidadePorCaixa)) {
                            <span class="block text-xs text-muted-color">{{ quebra(item.quantidade, item.quantidadePorCaixa) }}</span>
                        }
                    </td>
                    <td>{{ item.quantidadeMinima }} un</td>
                    <td>
                        <p-tag [value]="item.abaixoMinimo ? 'Estoque baixo' : 'Normal'"
                            [severity]="item.abaixoMinimo ? 'danger' : 'success'" />
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" (click)="openEdit(item)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '420px' }" header="Ajustar Estoque" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-5">
                    <div class="text-lg font-semibold">{{ editing?.vinhoNome }}</div>
                    <div>
                        <label class="block font-bold mb-2">Quantidade *</label>
                        @if (editingPorCaixa > 0) {
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label for="caixas" class="block text-sm mb-1 text-muted-color">Caixas ({{ editingPorCaixa }} un)</label>
                                    <p-inputnumber id="caixas" [(ngModel)]="form.caixas" [min]="0" [useGrouping]="false" fluid />
                                </div>
                                <div>
                                    <label for="unidades" class="block text-sm mb-1 text-muted-color">Unidades avulsas</label>
                                    <p-inputnumber id="unidades" [(ngModel)]="form.unidades" [min]="0" [useGrouping]="false" fluid />
                                </div>
                            </div>
                            <small class="block mt-1 text-muted-color">Total: {{ totalUnidades() }} unidades</small>
                        } @else {
                            <p-inputnumber id="unidades" [(ngModel)]="form.unidades" [min]="0" [useGrouping]="false" fluid />
                        }
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Quantidade Mínima (alerta)</label>
                        @if (editingPorCaixa > 0) {
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label for="minCaixas" class="block text-sm mb-1 text-muted-color">Caixas ({{ editingPorCaixa }} un)</label>
                                    <p-inputnumber id="minCaixas" [(ngModel)]="form.minimaCaixas" [min]="0" [useGrouping]="false" fluid />
                                </div>
                                <div>
                                    <label for="minUnidades" class="block text-sm mb-1 text-muted-color">Unidades avulsas</label>
                                    <p-inputnumber id="minUnidades" [(ngModel)]="form.minimaUnidades" [min]="0" [useGrouping]="false" fluid />
                                </div>
                            </div>
                            <small class="block mt-1 text-muted-color">Total: {{ totalMinima() }} unidades</small>
                        } @else {
                            <p-inputnumber id="quantidadeMinima" [(ngModel)]="form.minimaUnidades" [min]="0" [useGrouping]="false" fluid />
                        }
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancelar" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Salvar" icon="pi pi-check" (click)="save()" />
            </ng-template>
        </p-dialog>
    `
})
export class EstoqueComponent implements OnInit {
    estoques = signal<Estoque[]>([]);
    dialogVisible = false;
    editing: Estoque | null = null;
    editingPorCaixa = 0;
    form = { caixas: 0, unidades: 0, minimaCaixas: 0, minimaUnidades: 0 };

    quebra = quebraEmCaixasLabel;

    totalUnidades(): number {
        return this.editingPorCaixa > 0
            ? this.form.caixas * this.editingPorCaixa + this.form.unidades
            : this.form.unidades;
    }

    totalMinima(): number {
        return this.editingPorCaixa > 0
            ? this.form.minimaCaixas * this.editingPorCaixa + this.form.minimaUnidades
            : this.form.minimaUnidades;
    }

    @ViewChild('dt') dt!: Table;

    constructor(
        private api: EstoqueService,
        private messageService: MessageService,
        private chRef: ChangeDetectorRef
    ) {}

    ngOnInit() { this.load(); }

    load() {
        this.api.getEstoques().subscribe(data => {
            this.estoques.set(data);
            this.chRef.detectChanges();
        });
    }

    onFilter(table: Table, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); }

    openEdit(item: Estoque) {
        this.editing = item;
        this.editingPorCaixa = item.quantidadePorCaixa ?? 0;
        const pc = this.editingPorCaixa;
        const caixas = pc > 0 ? Math.floor(item.quantidade / pc) : 0;
        const unidades = pc > 0 ? item.quantidade % pc : item.quantidade;
        const minimaCaixas = pc > 0 ? Math.floor(item.quantidadeMinima / pc) : 0;
        const minimaUnidades = pc > 0 ? item.quantidadeMinima % pc : item.quantidadeMinima;
        this.form = { caixas, unidades, minimaCaixas, minimaUnidades };
        this.dialogVisible = true;
    }

    hideDialog() { this.dialogVisible = false; this.editing = null; }

    save() {
        if (!this.editing) return;
        const quantidade = this.totalUnidades();
        const quantidadeMinima = this.totalMinima();
        this.api.updateEstoque(this.editing.vinhoId, { vinhoId: this.editing.vinhoId, quantidade, quantidadeMinima }).subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Estoque atualizado.', life: 3000 }); this.dialogVisible = false; this.load(); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 })
        });
    }
}
