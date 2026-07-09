export interface Acesso {
    modulo: string;
    visualizar: boolean;
    inserir: boolean;
    editar: boolean;
    remover: boolean;
}

export interface AuthUser {
    id: number;
    nome: string;
    email: string;
    ativo: boolean;
    token: string;
    acessos: Acesso[];
}
