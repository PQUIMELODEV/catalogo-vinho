import { Acesso } from '../../pages/auth/models/user.model';

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    ativo: boolean;
    criadoEm: string;
    acessos: Acesso[];
}

export interface UsuarioRequest {
    nome: string;
    email: string;
    senha?: string;
    ativo: boolean;
    acessos: Acesso[];
}

export const MODULOS: { key: string; label: string }[] = [
    { key: 'vinhos', label: 'Vinhos' },
    { key: 'paises', label: 'Países' },
    { key: 'tipos-vinho', label: 'Tipos de Vinho' },
    { key: 'categorias', label: 'Categorias' },
    { key: 'estoque', label: 'Estoque' },
    { key: 'movimentacoes', label: 'Movimentações' },
    { key: 'usuarios', label: 'Usuários' },
    { key: 'clientes', label: 'Clientes' },
    { key: 'catalogo', label: 'Catálogo (Cliente)' }
];
