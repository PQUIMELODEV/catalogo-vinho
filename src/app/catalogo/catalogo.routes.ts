import { Routes } from '@angular/router';

/**
 * Rotas da feature de catálogo.
 * No Sakai, importe em app.routes.ts:
 *
 *   {
 *     path: 'catalogo',
 *     loadChildren: () => import('./catalogo/catalogo.routes').then(m => m.CATALOGO_ROUTES)
 *   }
 *
 * Para deixar o catálogo como página inicial do cliente, use path: ''.
 */
export const CATALOGO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./catalogo.component').then((m) => m.CatalogoComponent),
  },
];
