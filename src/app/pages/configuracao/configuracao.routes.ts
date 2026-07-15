import { Routes } from '@angular/router';
import { moduleGuard } from '../../shared/guards/module.guard';

export const CONFIGURACAO_ROUTES: Routes = [
    {
        path: 'paises',
        loadComponent: () => import('./paises/paises.component').then(m => m.PaisesComponent),
        canActivate: [moduleGuard],
        data: { modulo: 'paises' }
    },
    {
        path: 'tipos-vinho',
        loadComponent: () => import('./tipos-vinho/tipos-vinho.component').then(m => m.TiposVinhoComponent),
        canActivate: [moduleGuard],
        data: { modulo: 'tipos-vinho' }
    },
    {
        path: 'vinhos',
        loadComponent: () => import('./vinhos/vinhos.component').then(m => m.VinhosComponent),
        canActivate: [moduleGuard],
        data: { modulo: 'vinhos' }
    },
    {
        path: 'estoque',
        loadComponent: () => import('./estoque/estoque.component').then(m => m.EstoqueComponent),
        canActivate: [moduleGuard],
        data: { modulo: 'estoque' }
    },
    {
        path: 'movimentacoes',
        loadComponent: () => import('./movimentacoes/movimentacoes.component').then(m => m.MovimentacoesComponent),
        canActivate: [moduleGuard],
        data: { modulo: 'movimentacoes' }
    },
    {
        path: 'categorias',
        loadComponent: () => import('./categorias/categorias.component').then(m => m.CategoriasComponent),
        canActivate: [moduleGuard],
        data: { modulo: 'categorias' }
    },
    {
        path: 'usuarios',
        loadComponent: () => import('./usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [moduleGuard],
        data: { modulo: 'usuarios' }
    },
    {
        path: 'clientes',
        loadComponent: () => import('./clientes/clientes.component').then(m => m.ClientesComponent),
        canActivate: [moduleGuard],
        data: { modulo: 'clientes' }
    }
];
