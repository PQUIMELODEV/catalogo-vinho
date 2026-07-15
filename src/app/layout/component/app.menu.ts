import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../pages/auth/services/auth.service';

interface ModuleMenuItem extends MenuItem {
    modulo?: string;
}

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of menuVisivel(); track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    model: (MenuItem & { items?: ModuleMenuItem[] })[] = [];

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.model = [
            {
                label: 'Configuração do Sistema',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Vinhos',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/configuracao/vinhos'],
                        modulo: 'vinhos'
                    },
                    {
                        label: 'Países',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/configuracao/paises'],
                        modulo: 'paises'
                    },
                    {
                        label: 'Tipos de Vinho',
                        icon: 'pi pi-fw pi-tag',
                        routerLink: ['/configuracao/tipos-vinho'],
                        modulo: 'tipos-vinho'
                    },
                    {
                        label: 'Categorias',
                        icon: 'pi pi-fw pi-folder',
                        routerLink: ['/configuracao/categorias'],
                        modulo: 'categorias'
                    },
                    {
                        label: 'Estoque',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/configuracao/estoque'],
                        modulo: 'estoque'
                    },
                    {
                        label: 'Movimentações',
                        icon: 'pi pi-fw pi-arrows-h',
                        routerLink: ['/configuracao/movimentacoes'],
                        modulo: 'movimentacoes'
                    },
                    {
                        label: 'Usuários',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/configuracao/usuarios'],
                        modulo: 'usuarios'
                    },
                    {
                        label: 'Clientes',
                        icon: 'pi pi-fw pi-id-card',
                        routerLink: ['/configuracao/clientes'],
                        modulo: 'clientes'
                    }
                ]
            },
        ];
    }

    menuVisivel(): MenuItem[] {
        return this.model
            .map(grupo => ({
                ...grupo,
                items: grupo.items?.filter(item => !item['modulo'] || this.authService.hasAccess(item['modulo']))
            }))
            .filter(grupo => (grupo.items?.length ?? 0) > 0);
    }
}
