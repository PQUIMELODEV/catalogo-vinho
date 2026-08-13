import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { MovimentacaoService } from '@/app/shared/services/movimentacao.service';
import { VinhoService } from '@/app/shared/services/vinho.service';
import { MovimentacaoEstoque, Vinho } from '@/app/catalogo/models/wine.model';
import { caixasParaUnidades, quebraEmCaixasLabel } from '@/app/shared/utils/quantidade.util';

@Component({
    selector: 'app-movimentacoes',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, InputNumberModule, SelectModule, SelectButtonModule, ToolbarModule,
        ToastModule, ConfirmDialogModule, IconFieldModule, InputIconModule, TagModule
    ],
    providers: [ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog [style]="{ width: '450px' }" />

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nova Movimentação" icon="pi pi-plus" severity="secondary" (onClick)="openNew()" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="movimentacoes()" [rows]="15" [paginator]="true"
            [globalFilterFields]="['vinhoNome', 'tipo', 'motivo']" dataKey="id" [rowHover]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} movimentações"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[15, 30, 50]"
            [tableStyle]="{ 'min-width': '70rem' }">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Movimentações de Estoque</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onFilter(dt, $event)" placeholder="Pesquisar..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th pSortableColumn="criadoEm" style="min-width:12rem">Data <p-sortIcon field="criadoEm" /></th>
                    <th pSortableColumn="vinhoNome" style="min-width:18rem">Vinho <p-sortIcon field="vinhoNome" /></th>
                    <th pSortableColumn="tipo" style="min-width:9rem">Tipo <p-sortIcon field="tipo" /></th>
                    <th pSortableColumn="quantidade" style="min-width:10rem">Quantidade <p-sortIcon field="quantidade" /></th>
                    <th style="min-width:20rem">Motivo</th>
                    <th style="min-width:8rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-mov>
                <tr>
                    <td>{{ mov.criadoEm | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>{{ mov.vinhoNome }}</td>
                    <td>
                        <p-tag [value]="mov.tipo === 'entrada' ? 'Entrada' : 'Saída'"
                            [severity]="mov.tipo === 'entrada' ? 'success' : 'danger'" />
                    </td>
                    <td>
                        {{ mov.quantidade }} un
                        @if (quebra(mov.quantidade, mov.quantidadePorCaixa)) {
                            <span class="block text-xs text-muted-color">{{ quebra(mov.quantidade, mov.quantidadePorCaixa) }}</span>
                        }
                    </td>
                    <td>{{ mov.motivo }}</td>
                    <td>
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="confirmDelete(mov)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '500px' }" header="Nova Movimentação" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-5">
                    <div>
                        <label for="vinhoId" class="block font-bold mb-2">Vinho *</label>
                        <p-select id="vinhoId" [(ngModel)]="form.vinhoId" [options]="vinhos()" appendTo="body"
                            optionLabel="nome" optionValue="id" placeholder="Selecione o vinho" [filter]="true" filterBy="nome" fluid />
                        @if (submitted && !form.vinhoId) { <small class="text-red-500">Vinho é obrigatório.</small> }
                    </div>
                    <div>
                        <label for="tipo" class="block font-bold mb-2">Tipo *</label>
                        <p-select id="tipo" [(ngModel)]="form.tipo" [options]="tipoOpcoes" appendTo="body"
                            optionLabel="label" optionValue="value" placeholder="Selecione" fluid />
                        @if (submitted && !form.tipo) { <small class="text-red-500">Tipo é obrigatório.</small> }
                    </div>
                    <div>
                        <label for="quantidade" class="block font-bold mb-2">Quantidade *</label>
                        @if (selectedPorCaixa > 0) {
                            <p-selectbutton [(ngModel)]="form.unidadeMedida" [options]="medidaOpcoes"
                                optionLabel="label" optionValue="value" [allowEmpty]="false" styleClass="mb-3" />
                        }
                        <p-inputnumber id="quantidade" [(ngModel)]="form.quantidade" [min]="1" fluid />
                        @if (form.unidadeMedida === 'cx' && selectedPorCaixa > 0) {
                            <small class="block mt-1 text-muted-color">= {{ form.quantidade * selectedPorCaixa }} unidades ({{ selectedPorCaixa }} un/caixa)</small>
                        }
                        @if (submitted && form.quantidade < 1) { <small class="text-red-500">Quantidade deve ser maior que zero.</small> }
                    </div>
                    <div>
                        <label for="motivo" class="block font-bold mb-2">Motivo</label>
                        <input pInputText id="motivo" [(ngModel)]="form.motivo" fluid placeholder="Ex: Compra, Venda, Ajuste de inventário..." />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancelar" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Registrar" icon="pi pi-check" (click)="save()" />
            </ng-template>
        </p-dialog>
    `
})
export class MovimentacoesComponent implements OnInit {
    movimentacoes = signal<MovimentacaoEstoque[]>([]);
    vinhos = signal<Vinho[]>([]);
    dialogVisible = false;
    submitted = false;
    tipoOpcoes = [{ label: 'Entrada', value: 'entrada' }, { label: 'Saída', value: 'saida' }];
    medidaOpcoes = [{ label: 'Unidade', value: 'un' }, { label: 'Caixa', value: 'cx' }];
    form: { vinhoId: string; tipo: string; quantidade: number; motivo: string; unidadeMedida: 'un' | 'cx' } = { vinhoId: '', tipo: '', quantidade: 1, motivo: '', unidadeMedida: 'un' };

    quebra = quebraEmCaixasLabel;

    get selectedPorCaixa(): number {
        return this.vinhos().find(v => v.id === this.form.vinhoId)?.quantidadePorCaixa ?? 0;
    }

    @ViewChild('dt') dt!: Table;

    constructor(
        private api: MovimentacaoService,
        private vinhoService: VinhoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.load();
        this.vinhoService.getVinhos(true).subscribe(d => this.vinhos.set(d));
    }

    load() { this.api.getMovimentacoes().subscribe(data => this.movimentacoes.set(data)); }

    onFilter(table: Table, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); }

    openNew() { this.form = { vinhoId: '', tipo: '', quantidade: 1, motivo: '', unidadeMedida: 'un' }; this.submitted = false; this.dialogVisible = true; }

    hideDialog() { this.dialogVisible = false; this.submitted = false; }

    save() {
        this.submitted = true;
        if (!this.form.vinhoId || !this.form.tipo || this.form.quantidade < 1) return;
        const quantidade = this.form.unidadeMedida === 'cx' && this.selectedPorCaixa > 0
            ? Math.round(caixasParaUnidades(this.form.quantidade, this.selectedPorCaixa))
            : this.form.quantidade;
        this.api.createMovimentacao({ vinhoId: this.form.vinhoId, tipo: this.form.tipo, quantidade, motivo: this.form.motivo }).subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Movimentação registrada.', life: 3000 }); this.dialogVisible = false; this.load(); },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err?.error ?? 'Não foi possível registrar.', life: 4000 })
        });
    }

    confirmDelete(mov: MovimentacaoEstoque) {
        this.confirmationService.confirm({
            message: `Deseja excluir esta movimentação?`, header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
            accept: () => this.api.deleteMovimentacao(mov.id).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Movimentação excluída.', life: 3000 }); this.load(); },
                error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.', life: 3000 })
            })
        });
    }
}
