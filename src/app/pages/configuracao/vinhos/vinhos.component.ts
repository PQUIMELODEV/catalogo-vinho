import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { VinhoService } from '@/app/shared/services/vinho.service';
import { PaisService } from '@/app/shared/services/pais.service';
import { TipoVinhoService } from '@/app/shared/services/tipo-vinho.service';
import { Pais, TipoVinho, Vinho } from '@/app/catalogo/models/wine.model';

@Component({
    selector: 'app-vinhos',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, TextareaModule, InputNumberModule, SelectModule,
        ToggleSwitchModule, ToolbarModule, ToastModule, ConfirmDialogModule,
        IconFieldModule, InputIconModule, TagModule
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

        <p-table #dt [value]="vinhos()" [rows]="10" [paginator]="true" [(selection)]="selected"
            [globalFilterFields]="['nome', 'paisNome', 'tipoVinhoNome']" dataKey="id" [rowHover]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} vinhos"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
            [tableStyle]="{ 'min-width': '80rem' }">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Vinhos</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onFilter(dt, $event)" placeholder="Pesquisar..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width:3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="nome" style="min-width:16rem">Nome <p-sortIcon field="nome" /></th>
                    <th pSortableColumn="paisNome" style="min-width:10rem">País <p-sortIcon field="paisNome" /></th>
                    <th pSortableColumn="tipoVinhoNome" style="min-width:10rem">Tipo <p-sortIcon field="tipoVinhoNome" /></th>
                    <th pSortableColumn="safra" style="min-width:7rem">Safra <p-sortIcon field="safra" /></th>
                    <th pSortableColumn="preco" style="min-width:9rem">Preço <p-sortIcon field="preco" /></th>
                    <th pSortableColumn="volumeMl" style="min-width:8rem">Volume <p-sortIcon field="volumeMl" /></th>
                    <th pSortableColumn="ativo" style="min-width:8rem">Status <p-sortIcon field="ativo" /></th>
                    <th style="min-width:10rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-vinho>
                <tr>
                    <td><p-tableCheckbox [value]="vinho" /></td>
                    <td>{{ vinho.nome }}</td>
                    <td>{{ vinho.paisNome }}</td>
                    <td>{{ vinho.tipoVinhoNome }}</td>
                    <td>{{ vinho.safra }}</td>
                    <td>{{ vinho.preco | currency:'BRL' }}</td>
                    <td>{{ vinho.volumeMl }} ml</td>
                    <td>
                        <p-tag [value]="vinho.ativo ? 'Ativo' : 'Inativo'" [severity]="vinho.ativo ? 'success' : 'danger'" />
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="edit(vinho)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="confirmDelete(vinho)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '600px' }" [header]="editingId ? 'Editar Vinho' : 'Novo Vinho'" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-5">
                    <div>
                        <label for="nome" class="block font-bold mb-2">Nome *</label>
                        <input pInputText id="nome" [(ngModel)]="form.nome" required autofocus fluid />
                        @if (submitted && !form.nome) { <small class="text-red-500">Nome é obrigatório.</small> }
                    </div>
                    <div>
                        <label for="descricao" class="block font-bold mb-2">Descrição (Ficha Técnica)</label>
                        <textarea pTextarea id="descricao" [(ngModel)]="form.descricao" rows="3" fluid></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="paisId" class="block font-bold mb-2">País *</label>
                            <p-select id="paisId" [(ngModel)]="form.paisId" [options]="paises()" optionLabel="nome" optionValue="id" placeholder="Selecione" fluid />
                            @if (submitted && !form.paisId) { <small class="text-red-500">País é obrigatório.</small> }
                        </div>
                        <div>
                            <label for="tipoVinhoId" class="block font-bold mb-2">Tipo *</label>
                            <p-select id="tipoVinhoId" [(ngModel)]="form.tipoVinhoId" [options]="tiposVinho()" optionLabel="nome" optionValue="id" placeholder="Selecione" fluid />
                            @if (submitted && !form.tipoVinhoId) { <small class="text-red-500">Tipo é obrigatório.</small> }
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="preco" class="block font-bold mb-2">Preço *</label>
                            <p-inputnumber id="preco" [(ngModel)]="form.preco" mode="currency" currency="BRL" locale="pt-BR" fluid />
                        </div>
                        <div>
                            <label for="precoPromocional" class="block font-bold mb-2">Preço Promocional</label>
                            <p-inputnumber id="precoPromocional" [(ngModel)]="form.precoPromocional" mode="currency" currency="BRL" locale="pt-BR" fluid />
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label for="safra" class="block font-bold mb-2">Safra *</label>
                            <p-inputnumber id="safra" [(ngModel)]="form.safra" [useGrouping]="false" fluid />
                        </div>
                        <div>
                            <label for="teorAlcoolico" class="block font-bold mb-2">Teor Alcoólico (%)</label>
                            <p-inputnumber id="teorAlcoolico" [(ngModel)]="form.teorAlcoolico" [minFractionDigits]="1" [maxFractionDigits]="1" suffix="%" fluid />
                        </div>
                        <div>
                            <label for="volumeMl" class="block font-bold mb-2">Volume (ml)</label>
                            <p-inputnumber id="volumeMl" [(ngModel)]="form.volumeMl" suffix=" ml" fluid />
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <p-toggleswitch inputId="ativo" [(ngModel)]="form.ativo" />
                        <label for="ativo" class="font-bold">Visível no catálogo</label>
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
export class VinhosComponent implements OnInit {
    vinhos = signal<Vinho[]>([]);
    paises = signal<Pais[]>([]);
    tiposVinho = signal<TipoVinho[]>([]);
    selected: Vinho[] = [];
    dialogVisible = false;
    submitted = false;
    editingId: string | null = null;
    form: Omit<Vinho, 'id' | 'criadoEm' | 'paisNome' | 'tipoVinhoNome'> = this.emptyForm();

    @ViewChild('dt') dt!: Table;

    constructor(
        private api: VinhoService,
        private paisService: PaisService,
        private tipoVinhoService: TipoVinhoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private chRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.load();
        this.paisService.getPaises().subscribe(d => this.paises.set(d));
        this.tipoVinhoService.getTiposVinho().subscribe(d => this.tiposVinho.set(d));
    }

    emptyForm(): Omit<Vinho, 'id' | 'criadoEm' | 'paisNome' | 'tipoVinhoNome'> {
        return { nome: '', descricao: undefined, preco: 0, precoPromocional: undefined, paisId: 0, tipoVinhoId: 0, safra: new Date().getFullYear(), teorAlcoolico: 0, volumeMl: 750, ativo: true };
    }

    load() {
        this.api.getVinhos().subscribe(data => {
            this.vinhos.set(data);
            this.chRef.detectChanges();
        });
    }

    onFilter(table: Table, event: Event) { table.filterGlobal((event.target as HTMLInputElement).value, 'contains'); }

    openNew() { this.form = this.emptyForm(); this.editingId = null; this.submitted = false; this.dialogVisible = true; }

    edit(v: Vinho) {
        this.form = { nome: v.nome, descricao: v.descricao, preco: v.preco, precoPromocional: v.precoPromocional, paisId: v.paisId, tipoVinhoId: v.tipoVinhoId, safra: v.safra, teorAlcoolico: v.teorAlcoolico, volumeMl: v.volumeMl, ativo: v.ativo };
        this.editingId = v.id;
        this.submitted = false;
        this.dialogVisible = true;
    }

    hideDialog() { this.dialogVisible = false; this.submitted = false; }

    save() {
        this.submitted = true;
        if (!this.form.nome?.trim() || !this.form.paisId || !this.form.tipoVinhoId) return;
        const op = this.editingId ? this.api.updateVinho(this.editingId, this.form) : this.api.createVinho(this.form);
        op.subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: this.editingId ? 'Vinho atualizado.' : 'Vinho criado.', life: 3000 }); this.dialogVisible = false; this.load(); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 })
        });
    }

    confirmDelete(v: Vinho) {
        this.confirmationService.confirm({
            message: `Deseja excluir "${v.nome}"?`, header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
            accept: () => this.delete(v.id)
        });
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Deseja excluir os vinhos selecionados?', header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
            accept: () => { this.selected.forEach(v => this.delete(v.id, false)); this.selected = []; this.load(); this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Vinhos excluídos.', life: 3000 }); }
        });
    }

    private delete(id: string, reload = true) {
        this.api.deleteVinho(id).subscribe({
            next: () => { if (reload) { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Vinho excluído.', life: 3000 }); this.load(); } },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.', life: 3000 })
        });
    }
}
