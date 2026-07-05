import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            // {
            //     label: 'Home',
            //     items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            // },
            {
                label: 'Configuração do Sistema',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Vinhos',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/configuracao/vinhos']
                    },
                    {
                        label: 'Países',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/configuracao/paises']
                    },
                    {
                        label: 'Tipos de Vinho',
                        icon: 'pi pi-fw pi-tag',
                        routerLink: ['/configuracao/tipos-vinho']
                    },
                    {
                        label: 'Categorias',
                        icon: 'pi pi-fw pi-folder',
                        routerLink: ['/configuracao/categorias']
                    },
                    {
                        label: 'Estoque',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/configuracao/estoque']
                    },
                    {
                        label: 'Movimentações',
                        icon: 'pi pi-fw pi-arrows-h',
                        routerLink: ['/configuracao/movimentacoes']
                    }
                ]
            },
        ];
    }
}
