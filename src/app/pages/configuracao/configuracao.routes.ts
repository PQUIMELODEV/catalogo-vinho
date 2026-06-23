import { Routes } from '@angular/router';

export const CONFIGURACAO_ROUTES: Routes = [
    {
        path: 'paises',
        loadComponent: () => import('./paises/paises.component').then(m => m.PaisesComponent)
    },
    {
        path: 'tipos-vinho',
        loadComponent: () => import('./tipos-vinho/tipos-vinho.component').then(m => m.TiposVinhoComponent)
    },
    {
        path: 'vinhos',
        loadComponent: () => import('./vinhos/vinhos.component').then(m => m.VinhosComponent)
    },
    {
        path: 'estoque',
        loadComponent: () => import('./estoque/estoque.component').then(m => m.EstoqueComponent)
    },
    {
        path: 'movimentacoes',
        loadComponent: () => import('./movimentacoes/movimentacoes.component').then(m => m.MovimentacoesComponent)
    },
    {
        path: 'categorias',
        loadComponent: () => import('./categorias/categorias.component').then(m => m.CategoriasComponent)
    }
];
