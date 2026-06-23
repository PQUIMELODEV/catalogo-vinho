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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { ApiService } from '@/app/shared/services/api.service';
import { Categoria } from '@/app/catalogo/models/wine.model';

@Component({
    selector: 'app-categorias',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, ToolbarModule, ToastModule, ConfirmDialogModule,
        IconFieldModule, InputIconModule, ToggleSwitchModule, TagModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <p-confirmdialog [style]="{ width: '450px' }" />

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nova" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="danger" label="Excluir" icon="pi pi-trash" outlined
                    (onClick)="deleteSelected()" [disabled]="!selected.length" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="categorias()" [rows]="10" [paginator]="true" [(selection)]="selected"
            [globalFilterFields]="['nome', 'slug']" dataKey="id" [rowHover]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorias"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Categorias</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onFilter(dt, $event)" placeholder="Pesquisar..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width:3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="id" style="min-width:5rem">ID <p-sortIcon field="id" /></th>
                    <th pSortableColumn="nome" style="min-width:14rem">Nome <p-sortIcon field="nome" /></th>
                    <th pSortableColumn="slug" style="min-width:14rem">Slug <p-sortIcon field="slug" /></th>
                    <th pSortableColumn="ativo" style="min-width:8rem">Status <p-sortIcon field="ativo" /></th>
                    <th style="min-width:10rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-cat>
                <tr>
                    <td><p-tableCheckbox [value]="cat" /></td>
                    <td>{{ cat.id }}</td>
                    <td>{{ cat.nome }}</td>
                    <td><code class="text-sm">{{ cat.slug }}</code></td>
                    <td>
                        <p-tag [value]="cat.ativo ? 'Ativo' : 'Inativo'" [severity]="cat.ativo ? 'success' : 'danger'" />
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="edit(cat)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="confirmDelete(cat)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '480px' }" [header]="editingId ? 'Editar Categoria' : 'Nova Categoria'" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-5">
                    <div>
                        <label for="nome" class="block font-bold mb-2">Nome *</label>
                        <input pInputText id="nome" [(ngModel)]="form.nome" (ngModelChange)="autoSlug()" required autofocus fluid />
                        @if (submitted && !form.nome) { <small class="text-red-500">Nome é obrigatório.</small> }
                    </div>
                    <div>
                        <label for="slug" class="block font-bold mb-2">Slug *</label>
                        <input pInputText id="slug" [(ngModel)]="form.slug" required fluid />
                        @if (submitted && !form.slug) { <small class="text-red-500">Slug é obrigatório.</small> }
                    </div>
                    <div class="flex items-center gap-3">
                        <p-toggleswitch inputId="ativo" [(ngModel)]="form.ativo" />
                        <label for="ativo" class="font-bold">Ativo</label>
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
export class CategoriasComponent implements OnInit {
    categorias = signal<Categoria[]>([]);
    selected: Categoria[] = [];
    dialogVisible = false;
    submitted = false;
    editingId: number | null = null;
    form: { nome: string; slug: string; ativo: boolean } = { nome: '', slug: '', ativo: true };

    @ViewChild('dt') dt!: Table;

    constructor(
        private api: ApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() { this.load(); }

    load() { this.api.getCategorias().subscribe(data => this.categorias.set(data)); }

    onFilter(table: Table, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); }

    autoSlug() {
        this.form.slug = this.form.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    openNew() { this.form = { nome: '', slug: '', ativo: true }; this.editingId = null; this.submitted = false; this.dialogVisible = true; }

    edit(cat: Categoria) { this.form = { nome: cat.nome, slug: cat.slug, ativo: cat.ativo }; this.editingId = cat.id; this.submitted = false; this.dialogVisible = true; }

    hideDialog() { this.dialogVisible = false; this.submitted = false; }

    save() {
        this.submitted = true;
        if (!this.form.nome?.trim() || !this.form.slug?.trim()) return;
        const op = this.editingId ? this.api.updateCategoria(this.editingId, this.form) : this.api.createCategoria(this.form);
        op.subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: this.editingId ? 'Categoria atualizada.' : 'Categoria criada.', life: 3000 }); this.dialogVisible = false; this.load(); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 })
        });
    }

    confirmDelete(cat: Categoria) {
        this.confirmationService.confirm({
            message: `Deseja excluir "${cat.nome}"?`, header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
            accept: () => this.delete(cat.id)
        });
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Deseja excluir as categorias selecionadas?', header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
            accept: () => { this.selected.forEach(c => this.delete(c.id, false)); this.selected = []; this.load(); this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Categorias excluídas.', life: 3000 }); }
        });
    }

    private delete(id: number, reload = true) {
        this.api.deleteCategoria(id).subscribe({
            next: () => { if (reload) { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Categoria excluída.', life: 3000 }); this.load(); } },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.', life: 3000 })
        });
    }
}
