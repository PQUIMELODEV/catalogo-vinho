import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { UsuarioService } from '@/app/shared/services/usuario.service';
import { Usuario, UsuarioRequest, MODULOS } from '@/app/shared/models/usuario.model';
import { Acesso } from '@/app/pages/auth/models/user.model';

interface UsuarioForm {
    nome: string;
    email: string;
    senha: string;
    ativo: boolean;
    acessos: Acesso[];
}

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, PasswordModule, ToolbarModule, ToastModule, ConfirmDialogModule,
        IconFieldModule, InputIconModule, ToggleSwitchModule, CheckboxModule, TagModule
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

        <p-table #dt [value]="usuarios()" [rows]="10" [paginator]="true" [(selection)]="selected"
            [globalFilterFields]="['nome', 'email']" dataKey="id" [rowHover]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuários"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Usuários</h5>
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
                    <th pSortableColumn="email" style="min-width:16rem">E-mail <p-sortIcon field="email" /></th>
                    <th style="min-width:10rem">Acessos</th>
                    <th pSortableColumn="ativo" style="min-width:8rem">Status <p-sortIcon field="ativo" /></th>
                    <th style="min-width:10rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-usuario>
                <tr>
                    <td><p-tableCheckbox [value]="usuario" /></td>
                    <td>{{ usuario.id }}</td>
                    <td>{{ usuario.nome }}</td>
                    <td>{{ usuario.email }}</td>
                    <td>{{ contarAcessos(usuario.acessos) }} de {{ modulos.length }} módulos</td>
                    <td>
                        <p-tag [value]="usuario.ativo ? 'Ativo' : 'Inativo'" [severity]="usuario.ativo ? 'success' : 'danger'" />
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="edit(usuario)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="confirmDelete(usuario)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '640px' }" [header]="editingId ? 'Editar Usuário' : 'Novo Usuário'" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-5">
                    <div>
                        <label for="nome" class="block font-bold mb-2">Nome *</label>
                        <input pInputText id="nome" [(ngModel)]="form.nome" required autofocus fluid />
                        @if (submitted && !form.nome) { <small class="text-red-500">Nome é obrigatório.</small> }
                    </div>
                    <div>
                        <label for="email" class="block font-bold mb-2">E-mail *</label>
                        <input pInputText id="email" type="email" [(ngModel)]="form.email" required fluid />
                        @if (submitted && !form.email) { <small class="text-red-500">E-mail é obrigatório.</small> }
                    </div>
                    <div>
                        <label for="senha" class="block font-bold mb-2">{{ editingId ? 'Nova senha (opcional)' : 'Senha *' }}</label>
                        <p-password id="senha" [(ngModel)]="form.senha" [toggleMask]="true" [feedback]="false" fluid />
                        @if (submitted && !editingId && !form.senha) { <small class="text-red-500">Senha é obrigatória.</small> }
                    </div>
                    <div class="flex items-center gap-3">
                        <p-toggleswitch inputId="ativo" [(ngModel)]="form.ativo" />
                        <label for="ativo" class="font-bold">Ativo</label>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Acessos</label>
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="text-left text-muted-color">
                                    <th class="pb-2">Módulo</th>
                                    <th class="pb-2 text-center">Ver</th>
                                    <th class="pb-2 text-center">Inserir</th>
                                    <th class="pb-2 text-center">Editar</th>
                                    <th class="pb-2 text-center">Remover</th>
                                </tr>
                            </thead>
                            <tbody>
                                @for (acesso of form.acessos; track acesso.modulo) {
                                    <tr class="border-t border-surface-200 dark:border-surface-700">
                                        <td class="py-2">{{ labelModulo(acesso.modulo) }}</td>
                                        <td class="py-2 text-center"><p-checkbox [(ngModel)]="acesso.visualizar" [binary]="true" /></td>
                                        <td class="py-2 text-center"><p-checkbox [(ngModel)]="acesso.inserir" [binary]="true" /></td>
                                        <td class="py-2 text-center"><p-checkbox [(ngModel)]="acesso.editar" [binary]="true" /></td>
                                        <td class="py-2 text-center"><p-checkbox [(ngModel)]="acesso.remover" [binary]="true" /></td>
                                    </tr>
                                }
                            </tbody>
                        </table>
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
export class UsuariosComponent implements OnInit {
    usuarios = signal<Usuario[]>([]);
    selected: Usuario[] = [];
    dialogVisible = false;
    submitted = false;
    editingId: number | null = null;
    form: UsuarioForm = this.criarFormVazio();
    modulos = MODULOS;

    @ViewChild('dt') dt!: Table;

    constructor(
        private usuarioService: UsuarioService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private chRef: ChangeDetectorRef
    ) {}

    ngOnInit() { this.load(); }

    load() {
        this.usuarioService.getUsuarios().subscribe(data => {
            this.usuarios.set(data);
            this.chRef.detectChanges();
        });
    }

    onFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    labelModulo(chave: string): string {
        return this.modulos.find(m => m.key === chave)?.label ?? chave;
    }

    contarAcessos(acessos: Acesso[]): number {
        return acessos?.filter(a => a.visualizar).length ?? 0;
    }

    openNew() {
        this.form = this.criarFormVazio();
        this.editingId = null;
        this.submitted = false;
        this.dialogVisible = true;
    }

    edit(usuario: Usuario) {
        this.form = {
            nome: usuario.nome,
            email: usuario.email,
            senha: '',
            ativo: usuario.ativo,
            acessos: this.mesclarAcessos(usuario.acessos)
        };
        this.editingId = usuario.id;
        this.submitted = false;
        this.dialogVisible = true;
    }

    hideDialog() {
        this.dialogVisible = false;
        this.submitted = false;
    }

    save() {
        this.submitted = true;
        if (!this.form.nome?.trim() || !this.form.email?.trim()) return;
        if (!this.editingId && !this.form.senha?.trim()) return;

        const body: UsuarioRequest = {
            nome: this.form.nome,
            email: this.form.email,
            ativo: this.form.ativo,
            acessos: this.form.acessos,
            ...(this.form.senha?.trim() ? { senha: this.form.senha } : {})
        };

        const op = this.editingId
            ? this.usuarioService.updateUsuario(this.editingId, body)
            : this.usuarioService.createUsuario(body);

        op.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: this.editingId ? 'Usuário atualizado.' : 'Usuário criado.', life: 3000 });
                this.dialogVisible = false;
                this.load();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 })
        });
    }

    confirmDelete(usuario: Usuario) {
        this.confirmationService.confirm({
            message: `Deseja excluir o usuário "${usuario.nome}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.delete(usuario.id)
        });
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Deseja excluir os usuários selecionados?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.selected.forEach(u => this.delete(u.id, false));
                this.selected = [];
                this.load();
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuários excluídos.', life: 3000 });
            }
        });
    }

    private delete(id: number, reload = true) {
        this.usuarioService.deleteUsuario(id).subscribe({
            next: () => { if (reload) { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário excluído.', life: 3000 }); this.load(); } },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.', life: 3000 })
        });
    }

    private criarFormVazio(): UsuarioForm {
        return {
            nome: '',
            email: '',
            senha: '',
            ativo: true,
            acessos: MODULOS.map(m => ({ modulo: m.key, visualizar: false, inserir: false, editar: false, remover: false }))
        };
    }

    private mesclarAcessos(existentes: Acesso[]): Acesso[] {
        return MODULOS.map(m =>
            existentes.find(a => a.modulo === m.key) ?? { modulo: m.key, visualizar: false, inserir: false, editar: false, remover: false }
        );
    }
}
