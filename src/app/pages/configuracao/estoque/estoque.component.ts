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
                    <td>{{ item.quantidade }}</td>
                    <td>{{ item.quantidadeMinima }}</td>
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
                        <label for="quantidade" class="block font-bold mb-2">Quantidade *</label>
                        <p-inputnumber id="quantidade" [(ngModel)]="form.quantidade" [min]="0" fluid />
                    </div>
                    <div>
                        <label for="quantidadeMinima" class="block font-bold mb-2">Quantidade Mínima (alerta)</label>
                        <p-inputnumber id="quantidadeMinima" [(ngModel)]="form.quantidadeMinima" [min]="0" fluid />
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
    form = { quantidade: 0, quantidadeMinima: 0 };

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
        this.form = { quantidade: item.quantidade, quantidadeMinima: item.quantidadeMinima };
        this.dialogVisible = true;
    }

    hideDialog() { this.dialogVisible = false; this.editing = null; }

    save() {
        if (!this.editing) return;
        this.api.updateEstoque(this.editing.vinhoId, { vinhoId: this.editing.vinhoId, ...this.form }).subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Estoque atualizado.', life: 3000 }); this.dialogVisible = false; this.load(); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 })
        });
    }
}
