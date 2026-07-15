import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ClienteService } from '@/app/shared/services/cliente.service';
import { CepService } from '@/app/shared/services/cep.service';
import { Cliente, ClienteRequest, Endereco, ESTADOS_UF } from '@/app/shared/models/cliente.model';

interface ClienteForm {
    nome: string;
    email?: string;
    telefone?: string;
    cpfCnpj?: string;
    ativo: boolean;
    enderecos: Endereco[];
}

@Component({
    selector: 'app-clientes',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, SelectModule, ToggleSwitchModule, RadioButtonModule,
        ToolbarModule, ToastModule, ConfirmDialogModule,
        IconFieldModule, InputIconModule, TagModule, DividerModule
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

        <p-table #dt [value]="clientes()" [rows]="10" [paginator]="true" [(selection)]="selected"
            [globalFilterFields]="['nome', 'email', 'cpfCnpj']" dataKey="id" [rowHover]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Clientes</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onFilter(dt, $event)" placeholder="Pesquisar..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width:3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="nome" style="min-width:14rem">Nome <p-sortIcon field="nome" /></th>
                    <th pSortableColumn="email" style="min-width:14rem">E-mail <p-sortIcon field="email" /></th>
                    <th pSortableColumn="telefone" style="min-width:10rem">Telefone <p-sortIcon field="telefone" /></th>
                    <th style="min-width:10rem">Endereços</th>
                    <th pSortableColumn="ativo" style="min-width:8rem">Status <p-sortIcon field="ativo" /></th>
                    <th style="min-width:10rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-cliente>
                <tr>
                    <td><p-tableCheckbox [value]="cliente" /></td>
                    <td>{{ cliente.nome }}</td>
                    <td>{{ cliente.email || '—' }}</td>
                    <td>{{ cliente.telefone || '—' }}</td>
                    <td>{{ cliente.enderecos.length }}</td>
                    <td>
                        <p-tag [value]="cliente.ativo ? 'Ativo' : 'Inativo'" [severity]="cliente.ativo ? 'success' : 'danger'" />
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="edit(cliente)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="confirmDelete(cliente)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '760px' }" [header]="editingId ? 'Editar Cliente' : 'Novo Cliente'" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-5">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="nome" class="block font-bold mb-2">Nome *</label>
                            <input pInputText id="nome" [(ngModel)]="form.nome" required autofocus fluid />
                            @if (submitted && !form.nome) { <small class="text-red-500">Nome é obrigatório.</small> }
                        </div>
                        <div>
                            <label for="email" class="block font-bold mb-2">E-mail</label>
                            <input pInputText id="email" type="email" [(ngModel)]="form.email" fluid />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="telefone" class="block font-bold mb-2">Telefone</label>
                            <input pInputText id="telefone" [(ngModel)]="form.telefone" placeholder="(00) 00000-0000" fluid />
                        </div>
                        <div>
                            <label for="cpfCnpj" class="block font-bold mb-2">CPF/CNPJ</label>
                            <input pInputText id="cpfCnpj" [(ngModel)]="form.cpfCnpj" fluid />
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <p-toggleswitch inputId="ativo" [(ngModel)]="form.ativo" />
                        <label for="ativo" class="font-bold">Ativo</label>
                    </div>

                    <p-divider />

                    <div class="flex items-center justify-between">
                        <label class="block font-bold">Endereços</label>
                        <p-button label="Adicionar Endereço" icon="pi pi-plus" size="small" text (click)="addEndereco()" />
                    </div>

                    @if (!form.enderecos.length) {
                        <small class="text-muted-color">Nenhum endereço cadastrado.</small>
                    }

                    @for (endereco of form.enderecos; track $index; let i = $index) {
                        <div class="border border-surface-200 dark:border-surface-700 rounded-border p-4 flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <p-radiobutton [inputId]="'principal' + i" name="principal" [value]="i"
                                        [ngModel]="enderecoPrincipalIndex()" (ngModelChange)="setPrincipal(i)" />
                                    <label [for]="'principal' + i" class="text-sm">Principal</label>
                                </div>
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" size="small" (click)="removeEndereco(i)" />
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block font-bold mb-2 text-sm">Rótulo</label>
                                    <input pInputText [(ngModel)]="endereco.rotulo" placeholder="Casa, Trabalho..." fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2 text-sm">CEP *</label>
                                    <div class="flex gap-2">
                                        <input pInputText [(ngModel)]="endereco.cep" placeholder="00000-000"
                                            (blur)="buscarCep(i)" (keydown.enter)="buscarCep(i)" fluid />
                                        <p-button icon="pi pi-search" [outlined]="true" [loading]="buscandoCepIndex === i"
                                            (click)="buscarCep(i)" />
                                    </div>
                                    @if (submitted && !endereco.cep) { <small class="text-red-500">Obrigatório.</small> }
                                </div>
                                <div>
                                    <label class="block font-bold mb-2 text-sm">Estado *</label>
                                    <p-select [options]="estados" [(ngModel)]="endereco.estado" placeholder="UF" fluid />
                                    @if (submitted && !endereco.estado) { <small class="text-red-500">Obrigatório.</small> }
                                </div>
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                                <div class="col-span-2">
                                    <label class="block font-bold mb-2 text-sm">Logradouro *</label>
                                    <input pInputText [(ngModel)]="endereco.logradouro" fluid />
                                    @if (submitted && !endereco.logradouro) { <small class="text-red-500">Obrigatório.</small> }
                                </div>
                                <div>
                                    <label class="block font-bold mb-2 text-sm">Número *</label>
                                    <input pInputText [(ngModel)]="endereco.numero" fluid />
                                    @if (submitted && !endereco.numero) { <small class="text-red-500">Obrigatório.</small> }
                                </div>
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block font-bold mb-2 text-sm">Complemento</label>
                                    <input pInputText [(ngModel)]="endereco.complemento" fluid />
                                </div>
                                <div>
                                    <label class="block font-bold mb-2 text-sm">Bairro *</label>
                                    <input pInputText [(ngModel)]="endereco.bairro" fluid />
                                    @if (submitted && !endereco.bairro) { <small class="text-red-500">Obrigatório.</small> }
                                </div>
                                <div>
                                    <label class="block font-bold mb-2 text-sm">Cidade *</label>
                                    <input pInputText [(ngModel)]="endereco.cidade" fluid />
                                    @if (submitted && !endereco.cidade) { <small class="text-red-500">Obrigatório.</small> }
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancelar" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Salvar" icon="pi pi-check" (click)="save()" />
            </ng-template>
        </p-dialog>
    `
})
export class ClientesComponent implements OnInit {
    clientes = signal<Cliente[]>([]);
    selected: Cliente[] = [];
    dialogVisible = false;
    submitted = false;
    editingId: number | null = null;
    form: ClienteForm = this.criarFormVazio();
    estados = ESTADOS_UF;
    buscandoCepIndex: number | null = null;

    @ViewChild('dt') dt!: Table;

    constructor(
        private clienteService: ClienteService,
        private cepService: CepService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private chRef: ChangeDetectorRef
    ) {}

    ngOnInit() { this.load(); }

    load() {
        this.clienteService.getClientes().subscribe(data => {
            this.clientes.set(data);
            this.chRef.detectChanges();
        });
    }

    onFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    enderecoPrincipalIndex(): number {
        return this.form.enderecos.findIndex(e => e.principal);
    }

    setPrincipal(index: number) {
        this.form.enderecos.forEach((e, i) => e.principal = i === index);
    }

    addEndereco() {
        this.form.enderecos.push({
            rotulo: '', cep: '', logradouro: '', numero: '', complemento: '',
            bairro: '', cidade: '', estado: '', principal: this.form.enderecos.length === 0
        });
    }

    buscarCep(index: number) {
        const endereco = this.form.enderecos[index];
        const cepLimpo = (endereco.cep || '').replace(/\D/g, '');
        if (cepLimpo.length !== 8 || this.buscandoCepIndex !== null) return;

        this.buscandoCepIndex = index;
        this.cepService.buscar(endereco.cep).subscribe(resultado => {
            this.buscandoCepIndex = null;

            if (!resultado) {
                this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'CEP não encontrado.', life: 3000 });
                this.chRef.detectChanges();
                return;
            }

            endereco.logradouro = resultado.logradouro || endereco.logradouro;
            endereco.bairro = resultado.bairro || endereco.bairro;
            endereco.cidade = resultado.localidade || endereco.cidade;
            endereco.estado = resultado.uf || endereco.estado;
            this.chRef.detectChanges();
        });
    }

    removeEndereco(index: number) {
        const removiaPrincipal = this.form.enderecos[index].principal;
        this.form.enderecos.splice(index, 1);
        if (removiaPrincipal && this.form.enderecos.length) {
            this.form.enderecos[0].principal = true;
        }
    }

    openNew() {
        this.form = this.criarFormVazio();
        this.editingId = null;
        this.submitted = false;
        this.dialogVisible = true;
    }

    edit(cliente: Cliente) {
        this.form = {
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone,
            cpfCnpj: cliente.cpfCnpj,
            ativo: cliente.ativo,
            enderecos: cliente.enderecos.map(e => ({ ...e }))
        };
        this.editingId = cliente.id;
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
        const enderecosInvalidos = this.form.enderecos.some(e =>
            !e.cep?.trim() || !e.logradouro?.trim() || !e.numero?.trim() || !e.bairro?.trim() || !e.cidade?.trim() || !e.estado?.trim());
        if (enderecosInvalidos) return;

        const body: ClienteRequest = {
            nome: this.form.nome,
            email: this.form.email,
            telefone: this.form.telefone,
            cpfCnpj: this.form.cpfCnpj,
            ativo: this.form.ativo,
            enderecos: this.form.enderecos
        };

        const op = this.editingId
            ? this.clienteService.updateCliente(this.editingId, body)
            : this.clienteService.createCliente(body);

        op.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: this.editingId ? 'Cliente atualizado.' : 'Cliente criado.', life: 3000 });
                this.dialogVisible = false;
                this.load();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 })
        });
    }

    confirmDelete(cliente: Cliente) {
        this.confirmationService.confirm({
            message: `Deseja excluir o cliente "${cliente.nome}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.delete(cliente.id)
        });
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Deseja excluir os clientes selecionados?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.selected.forEach(c => this.delete(c.id, false));
                this.selected = [];
                this.load();
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Clientes excluídos.', life: 3000 });
            }
        });
    }

    private delete(id: number, reload = true) {
        this.clienteService.deleteCliente(id).subscribe({
            next: () => { if (reload) { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente excluído.', life: 3000 }); this.load(); } },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.', life: 3000 })
        });
    }

    private criarFormVazio(): ClienteForm {
        return { nome: '', email: '', telefone: '', cpfCnpj: '', ativo: true, enderecos: [] };
    }
}
