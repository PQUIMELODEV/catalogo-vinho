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
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { PedidoService } from '@/app/shared/services/pedido.service';
import { ClienteService } from '@/app/shared/services/cliente.service';
import { VinhoService } from '@/app/shared/services/vinho.service';
import { Pedido, PedidoItem, PedidoRequest, STATUS_PAGAMENTO_OPTIONS, StatusPagamento } from '@/app/shared/models/pedido.model';
import { Cliente, Endereco } from '@/app/shared/models/cliente.model';
import { Vinho } from '@/app/catalogo/models/wine.model';

interface PedidoForm {
    clienteId: number | null;
    enderecoId: number | null;
    observacao?: string;
    valorPago: number;
    statusPagamento: StatusPagamento;
    itens: PedidoItem[];
}

@Component({
    selector: 'app-pedidos',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, TextareaModule, InputNumberModule, SelectModule,
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

        <p-table #dt [value]="pedidos()" [rows]="10" [paginator]="true" [(selection)]="selected"
            [globalFilterFields]="['clienteNome']" dataKey="id" [rowHover]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pedidos"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
            [tableStyle]="{ 'min-width': '70rem' }">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Pedidos</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onFilter(dt, $event)" placeholder="Pesquisar..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width:3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="id" style="min-width:5rem">Nº <p-sortIcon field="id" /></th>
                    <th pSortableColumn="clienteNome" style="min-width:14rem">Cliente <p-sortIcon field="clienteNome" /></th>
                    <th pSortableColumn="criadoEm" style="min-width:10rem">Data <p-sortIcon field="criadoEm" /></th>
                    <th style="min-width:6rem">Itens</th>
                    <th pSortableColumn="valorTotal" style="min-width:9rem">Total <p-sortIcon field="valorTotal" /></th>
                    <th pSortableColumn="valorPago" style="min-width:9rem">Pago <p-sortIcon field="valorPago" /></th>
                    <th pSortableColumn="statusPagamento" style="min-width:9rem">Status <p-sortIcon field="statusPagamento" /></th>
                    <th style="min-width:12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-pedido>
                <tr>
                    <td><p-tableCheckbox [value]="pedido" /></td>
                    <td>#{{ pedido.id }}</td>
                    <td>{{ pedido.clienteNome }}</td>
                    <td>{{ pedido.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</td>
                    <td>{{ pedido.itens.length }}</td>
                    <td>{{ pedido.valorTotal | currency: 'BRL' }}</td>
                    <td>{{ pedido.valorPago | currency: 'BRL' }}</td>
                    <td>
                        <p-tag [value]="statusLabel(pedido.statusPagamento)" [severity]="statusSeverity(pedido.statusPagamento)" />
                    </td>
                    <td>
                        <p-button icon="pi pi-whatsapp" class="mr-2" [rounded]="true" [outlined]="true" severity="success"
                            (click)="enviarWhatsApp(pedido)" pTooltip="Enviar pedido pelo WhatsApp" />
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="edit(pedido)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="confirmDelete(pedido)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '760px', maxWidth: '95vw' }"
            [breakpoints]="{ '960px': '90vw', '640px': '96vw' }"
            [header]="editingId ? 'Editar Pedido' : 'Novo Pedido'" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label for="cliente" class="block font-bold mb-2">Cliente *</label>
                            <p-select id="cliente" [options]="clientes()" [(ngModel)]="form.clienteId" optionLabel="nome" optionValue="id"
                                placeholder="Selecione" filter fluid (ngModelChange)="onClienteChange()" />
                            @if (submitted && !form.clienteId) { <small class="text-red-500">Cliente é obrigatório.</small> }
                        </div>
                        <div>
                            <label for="endereco" class="block font-bold mb-2">Endereço de entrega</label>
                            <p-select id="endereco" [options]="enderecosDoCliente()" [(ngModel)]="form.enderecoId" optionLabel="resumo" optionValue="id"
                                placeholder="Selecione" [disabled]="!form.clienteId" fluid />
                        </div>
                    </div>

                    <p-divider />

                    <div class="flex items-center justify-between">
                        <label class="block font-bold">Itens</label>
                        <p-button label="Adicionar Item" icon="pi pi-plus" size="small" text (click)="addItem()" />
                    </div>

                    @if (!form.itens.length) {
                        <small class="text-muted-color">Nenhum item adicionado.</small>
                        @if (submitted) { <small class="text-red-500 block">O pedido precisa ter ao menos um item.</small> }
                    }

                    @for (item of form.itens; track $index; let i = $index) {
                        <div class="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end">
                            <div class="col-span-2 sm:col-span-5">
                                <label class="block font-bold mb-2 text-sm">Vinho *</label>
                                <p-select [options]="vinhos()" [(ngModel)]="item.vinhoId" optionLabel="nome" optionValue="id"
                                    placeholder="Selecione" filter fluid (ngModelChange)="onVinhoChange(item)" />
                            </div>
                            <div class="col-span-1 sm:col-span-2">
                                <label class="block font-bold mb-2 text-sm">Qtd *</label>
                                <p-inputnumber [(ngModel)]="item.quantidade" [min]="1" [useGrouping]="false" fluid />
                            </div>
                            <div class="col-span-1 sm:col-span-2">
                                <label class="block font-bold mb-2 text-sm">Preço un.</label>
                                <p-inputnumber [(ngModel)]="item.precoUnitario" mode="currency" currency="BRL" locale="pt-BR" fluid />
                            </div>
                            <div class="col-span-1 sm:col-span-2">
                                <label class="block font-bold mb-2 text-sm">Subtotal</label>
                                <div class="py-2 font-bold">{{ (item.quantidade * item.precoUnitario) | currency: 'BRL' }}</div>
                            </div>
                            <div class="col-span-1 sm:col-span-1">
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" size="small" (click)="removeItem(i)" />
                            </div>
                        </div>
                    }

                    @if (form.itens.length) {
                        <div class="flex justify-end">
                            <div class="text-right">
                                <span class="block text-sm text-muted-color">Valor total</span>
                                <strong class="text-xl">{{ valorTotalCalculado() | currency: 'BRL' }}</strong>
                            </div>
                        </div>
                    }

                    <p-divider />

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label for="valorPago" class="block font-bold mb-2">Valor pago</label>
                            <p-inputnumber id="valorPago" [(ngModel)]="form.valorPago" mode="currency" currency="BRL" locale="pt-BR" fluid />
                        </div>
                        <div>
                            <label for="status" class="block font-bold mb-2">Status de pagamento *</label>
                            <p-select id="status" [options]="statusOptions" [(ngModel)]="form.statusPagamento" optionLabel="label" optionValue="value" fluid />
                        </div>
                    </div>
                    <div>
                        <label for="observacao" class="block font-bold mb-2">Observação</label>
                        <textarea pTextarea id="observacao" [(ngModel)]="form.observacao" rows="3" fluid></textarea>
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
export class PedidosComponent implements OnInit {
    pedidos = signal<Pedido[]>([]);
    clientes = signal<Cliente[]>([]);
    vinhos = signal<Vinho[]>([]);
    selected: Pedido[] = [];
    dialogVisible = false;
    submitted = false;
    editingId: number | null = null;
    form: PedidoForm = this.criarFormVazio();
    statusOptions = STATUS_PAGAMENTO_OPTIONS;

    @ViewChild('dt') dt!: Table;

    constructor(
        private pedidoService: PedidoService,
        private clienteService: ClienteService,
        private vinhoService: VinhoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private chRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.load();
        this.clienteService.getClientes().subscribe(d => this.clientes.set(d));
        this.vinhoService.getVinhos().subscribe(d => this.vinhos.set(d));
    }

    load() {
        this.pedidoService.getPedidos().subscribe(data => {
            this.pedidos.set(data);
            this.chRef.detectChanges();
        });
    }

    onFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    statusLabel(status: StatusPagamento): string {
        return this.statusOptions.find(s => s.value === status)?.label ?? status;
    }

    statusSeverity(status: StatusPagamento): 'success' | 'warn' | 'danger' {
        return this.statusOptions.find(s => s.value === status)?.severity ?? 'warn';
    }

    enderecosDoCliente(): { id: number; resumo: string }[] {
        const cliente = this.clientes().find(c => c.id === this.form.clienteId);
        return (cliente?.enderecos ?? []).map(e => ({ id: e.id!, resumo: this.formatarEndereco(e) }));
    }

    private formatarEndereco(e: Endereco): string {
        const rotulo = e.rotulo ? `${e.rotulo} — ` : '';
        const complemento = e.complemento ? ` - ${e.complemento}` : '';
        return `${rotulo}${e.logradouro}, ${e.numero}${complemento} - ${e.bairro}, ${e.cidade}/${e.estado}`;
    }

    onClienteChange() {
        this.form.enderecoId = null;
    }

    onVinhoChange(item: PedidoItem) {
        const vinho = this.vinhos().find(v => v.id === item.vinhoId);
        if (vinho) {
            item.vinhoNome = vinho.nome;
            item.precoUnitario = vinho.preco;
        }
    }

    addItem() {
        this.form.itens.push({ vinhoId: '', quantidade: 1, precoUnitario: 0 });
    }

    removeItem(index: number) {
        this.form.itens.splice(index, 1);
    }

    valorTotalCalculado(): number {
        return this.form.itens.reduce((soma, i) => soma + i.quantidade * i.precoUnitario, 0);
    }

    openNew() {
        this.form = this.criarFormVazio();
        this.editingId = null;
        this.submitted = false;
        this.dialogVisible = true;
    }

    edit(pedido: Pedido) {
        this.form = {
            clienteId: pedido.clienteId,
            enderecoId: pedido.enderecoId ?? null,
            observacao: pedido.observacao,
            valorPago: pedido.valorPago,
            statusPagamento: pedido.statusPagamento,
            itens: pedido.itens.map(i => ({ ...i }))
        };
        this.editingId = pedido.id;
        this.submitted = false;
        this.dialogVisible = true;
    }

    hideDialog() {
        this.dialogVisible = false;
        this.submitted = false;
    }

    save() {
        this.submitted = true;
        const itensValidos = this.form.itens.length > 0 && this.form.itens.every(i => i.vinhoId && i.quantidade > 0);
        if (!this.form.clienteId || !itensValidos) return;

        const body: PedidoRequest = {
            clienteId: this.form.clienteId,
            enderecoId: this.form.enderecoId ?? undefined,
            observacao: this.form.observacao,
            valorPago: this.form.valorPago,
            statusPagamento: this.form.statusPagamento,
            itens: this.form.itens.map(i => ({ vinhoId: i.vinhoId, quantidade: i.quantidade, precoUnitario: i.precoUnitario }))
        };

        const op = this.editingId
            ? this.pedidoService.updatePedido(this.editingId, body)
            : this.pedidoService.createPedido(body);

        op.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: this.editingId ? 'Pedido atualizado.' : 'Pedido criado.', life: 3000 });
                this.dialogVisible = false;
                this.load();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 })
        });
    }

    confirmDelete(pedido: Pedido) {
        this.confirmationService.confirm({
            message: `Deseja excluir o pedido #${pedido.id}?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.delete(pedido.id)
        });
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Deseja excluir os pedidos selecionados?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.selected.forEach(p => this.delete(p.id, false));
                this.selected = [];
                this.load();
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Pedidos excluídos.', life: 3000 });
            }
        });
    }

    private delete(id: number, reload = true) {
        this.pedidoService.deletePedido(id).subscribe({
            next: () => { if (reload) { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Pedido excluído.', life: 3000 }); this.load(); } },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.', life: 3000 })
        });
    }

    /** Monta o resumo do pedido e abre o WhatsApp — sem número fixo, o admin escolhe o contato do entregador na hora de enviar. */
    enviarWhatsApp(pedido: Pedido) {
        const fmt = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        const itensTexto = pedido.itens
            .map(i => `• ${i.quantidade}x ${i.vinhoNome ?? i.vinhoId} — ${fmt(i.quantidade * i.precoUnitario)}`)
            .join('\n');

        const msg =
            `*Pedido #${pedido.id} — Adega Serra Azul*\n\n` +
            `Cliente: ${pedido.clienteNome ?? ''}${pedido.clienteTelefone ? ' - ' + pedido.clienteTelefone : ''}\n\n` +
            `Endereço de entrega:\n${pedido.enderecoResumo ?? 'Não informado'}\n\n` +
            `Itens:\n${itensTexto}\n\n` +
            `Total: ${fmt(pedido.valorTotal)}\n` +
            `Valor pago: ${fmt(pedido.valorPago)}\n` +
            `Status: ${this.statusLabel(pedido.statusPagamento)}` +
            (pedido.observacao ? `\n\nObservação: ${pedido.observacao}` : '');

        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }

    private criarFormVazio(): PedidoForm {
        return { clienteId: null, enderecoId: null, observacao: '', valorPago: 0, statusPagamento: 'AReceber', itens: [] };
    }
}
