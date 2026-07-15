export interface Endereco {
    id?: number;
    rotulo?: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    principal: boolean;
}

export interface Cliente {
    id: number;
    nome: string;
    email?: string;
    telefone?: string;
    cpfCnpj?: string;
    ativo: boolean;
    criadoEm: string;
    enderecos: Endereco[];
}

export interface ClienteRequest {
    nome: string;
    email?: string;
    telefone?: string;
    cpfCnpj?: string;
    ativo: boolean;
    enderecos: Endereco[];
}

export const ESTADOS_UF: string[] = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
];
