export type StatusPagamento = 'AReceber' | 'Pago' | 'Cancelado';

export interface PedidoItem {
    id?: number;
    vinhoId: string;
    vinhoNome?: string;
    quantidade: number;
    precoUnitario: number;
    tipo?: 'unidade' | 'caixa';
    subtotal?: number;
}

export interface Pedido {
    id: number;
    clienteId: number;
    clienteNome?: string;
    clienteTelefone?: string;
    enderecoId?: number;
    enderecoResumo?: string;
    observacao?: string;
    valorTotal: number;
    valorPago: number;
    statusPagamento: StatusPagamento;
    criadoEm: string;
    itens: PedidoItem[];
}

export interface PedidoRequest {
    clienteId: number;
    enderecoId?: number;
    observacao?: string;
    valorPago: number;
    statusPagamento: StatusPagamento;
    itens: { vinhoId: string; quantidade: number; precoUnitario: number }[];
}

export const STATUS_PAGAMENTO_OPTIONS: { label: string; value: StatusPagamento; severity: 'success' | 'warn' | 'danger' }[] = [
    { label: 'A Receber', value: 'AReceber', severity: 'warn' },
    { label: 'Pago', value: 'Pago', severity: 'success' },
    { label: 'Cancelado', value: 'Cancelado', severity: 'danger' }
];

/** Item do carrinho enviado ao finalizar o pedido pelo catálogo. O preço é sempre resolvido no servidor. */
export interface CheckoutItem {
    vinhoId: string;
    kind: 'unit' | 'box';
    quantidade: number;
}
