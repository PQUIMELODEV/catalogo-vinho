import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TipoVinhoService } from '@/app/shared/services/tipo-vinho.service';
import { TipoVinho } from '@/app/catalogo/models/wine.model';

@Component({
    selector: 'app-tipos-vinho',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, ToolbarModule, ToastModule, ConfirmDialogModule,
        IconFieldModule, InputIconModule
    ],
    providers: [ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog [style]="{ width: '450px' }" />

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Novo" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="danger" label="Excluir" icon="pi pi-trash" outlined
                    (onClick)="deleteSelected()" [disabled]="!selected.length" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="tipos()" [rows]="10" [paginator]="true" [(selection)]="selected"
            [globalFilterFields]="['nome']" dataKey="id" [rowHover]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tipos"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Tipos de Vinho</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onFilter(dt, $event)" placeholder="Pesquisar..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width:3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="id" style="min-width:6rem">ID <p-sortIcon field="id" /></th>
                    <th pSortableColumn="nome" style="min-width:20rem">Nome <p-sortIcon field="nome" /></th>
                    <th style="min-width:10rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-tipo>
                <tr>
                    <td><p-tableCheckbox [value]="tipo" /></td>
                    <td>{{ tipo.id }}</td>
                    <td>{{ tipo.nome }}</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="edit(tipo)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="confirmDelete(tipo)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '400px' }" [header]="editingId ? 'Editar Tipo' : 'Novo Tipo'" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-5">
                    <div>
                        <label for="nome" class="block font-bold mb-2">Nome * <small class="font-normal text-surface-400">(ex: Tinto, Branco, Rose, Espumante)</small></label>
                        <input pInputText id="nome" [(ngModel)]="form.nome" required autofocus fluid />
                        @if (submitted && !form.nome) {
                            <small class="text-red-500">Nome é obrigatório.</small>
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
export class TiposVinhoComponent implements OnInit {
    tipos = signal<TipoVinho[]>([]);
    selected: TipoVinho[] = [];
    dialogVisible = false;
    submitted = false;
    editingId: number | null = null;
    form: { nome: string } = { nome: '' };

    @ViewChild('dt') dt!: Table;

    constructor(
        private api: TipoVinhoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private chRef: ChangeDetectorRef
    ) {}

    ngOnInit() { this.load(); }

    load() {
        this.api.getTiposVinho().subscribe(data => {
            this.tipos.set(data);
            this.chRef.detectChanges();
        });
    }

    onFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() { this.form = { nome: '' }; this.editingId = null; this.submitted = false; this.dialogVisible = true; }

    edit(tipo: TipoVinho) { this.form = { nome: tipo.nome }; this.editingId = tipo.id; this.submitted = false; this.dialogVisible = true; }

    hideDialog() { this.dialogVisible = false; this.submitted = false; }

    save() {
        this.submitted = true;
        if (!this.form.nome?.trim()) return;
        const op = this.editingId ? this.api.updateTipoVinho(this.editingId, this.form) : this.api.createTipoVinho(this.form);
        op.subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: this.editingId ? 'Tipo atualizado.' : 'Tipo criado.', life: 3000 }); this.dialogVisible = false; this.load(); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 })
        });
    }

    confirmDelete(tipo: TipoVinho) {
        this.confirmationService.confirm({
            message: `Deseja excluir "${tipo.nome}"?`, header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
            accept: () => this.delete(tipo.id)
        });
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Deseja excluir os tipos selecionados?', header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
            accept: () => { this.selected.forEach(t => this.delete(t.id, false)); this.selected = []; this.load(); this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipos excluídos.', life: 3000 }); }
        });
    }

    private delete(id: number, reload = true) {
        this.api.deleteTipoVinho(id).subscribe({
            next: () => { if (reload) { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipo excluído.', life: 3000 }); this.load(); } },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.', life: 3000 })
        });
    }
}
