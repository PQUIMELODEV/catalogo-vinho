import { Component, OnInit, signal, ViewChild } from '@angular/core';
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
import { TagModule } from 'primeng/tag';
import { ApiService } from '@/app/shared/services/api.service';
import { Pais } from '@/app/catalogo/models/wine.model';

@Component({
    selector: 'app-paises',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, ToolbarModule, ToastModule, ConfirmDialogModule,
        IconFieldModule, InputIconModule, TagModule
    ],
    providers: [MessageService, ConfirmationService],
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

        <p-table #dt [value]="paises()" [rows]="10" [paginator]="true" [(selection)]="selected"
            [globalFilterFields]="['nome']" dataKey="id" [rowHover]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} países"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Países</h5>
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
                    <th pSortableColumn="nome" style="min-width:16rem">Nome <p-sortIcon field="nome" /></th>
                    <th style="min-width:20rem">Bandeira URL</th>
                    <th style="min-width:10rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-pais>
                <tr>
                    <td><p-tableCheckbox [value]="pais" /></td>
                    <td>{{ pais.id }}</td>
                    <td>{{ pais.nome }}</td>
                    <td>
                        @if (pais.bandeiraUrl) {
                            <a [href]="pais.bandeiraUrl" target="_blank" class="text-blue-500 underline">{{ pais.bandeiraUrl }}</a>
                        } @else {
                            <span class="text-surface-400">—</span>
                        }
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="edit(pais)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="confirmDelete(pais)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '480px' }" [header]="editingId ? 'Editar País' : 'Novo País'" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-5">
                    <div>
                        <label for="nome" class="block font-bold mb-2">Nome *</label>
                        <input pInputText id="nome" [(ngModel)]="form.nome" required autofocus fluid />
                        @if (submitted && !form.nome) {
                            <small class="text-red-500">Nome é obrigatório.</small>
                        }
                    </div>
                    <div>
                        <label for="bandeiraUrl" class="block font-bold mb-2">URL da Bandeira</label>
                        <input pInputText id="bandeiraUrl" [(ngModel)]="form.bandeiraUrl" fluid placeholder="https://..." />
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
export class PaisesComponent implements OnInit {
    paises = signal<Pais[]>([]);
    selected: Pais[] = [];
    dialogVisible = false;
    submitted = false;
    editingId: number | null = null;
    form: { nome: string; bandeiraUrl?: string } = { nome: '' };

    @ViewChild('dt') dt!: Table;

    constructor(
        private api: ApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() { this.load(); }

    load() {
        this.api.getPaises().subscribe(data => this.paises.set(data));
    }

    onFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.form = { nome: '' };
        this.editingId = null;
        this.submitted = false;
        this.dialogVisible = true;
    }

    edit(pais: Pais) {
        this.form = { nome: pais.nome, bandeiraUrl: pais.bandeiraUrl };
        this.editingId = pais.id;
        this.submitted = false;
        this.dialogVisible = true;
    }

    hideDialog() {
        this.dialogVisible = false;
        this.submitted = false;
    }

    save() {
        this.submitted = true;
        if (!this.form.nome?.trim()) return;

        const op = this.editingId
            ? this.api.updatePais(this.editingId, this.form)
            : this.api.createPais(this.form);

        op.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: this.editingId ? 'País atualizado.' : 'País criado.', life: 3000 });
                this.dialogVisible = false;
                this.load();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 })
        });
    }

    confirmDelete(pais: Pais) {
        this.confirmationService.confirm({
            message: `Deseja excluir o país "${pais.nome}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.delete(pais.id)
        });
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Deseja excluir os países selecionados?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.selected.forEach(p => this.delete(p.id, false));
                this.selected = [];
                this.load();
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Países excluídos.', life: 3000 });
            }
        });
    }

    private delete(id: number, reload = true) {
        this.api.deletePais(id).subscribe({
            next: () => { if (reload) { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'País excluído.', life: 3000 }); this.load(); } },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.', life: 3000 })
        });
    }
}
