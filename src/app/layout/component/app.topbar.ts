import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AuthService } from '@/app/pages/auth/services/auth.service';
import { FontSizeService } from '@/app/shared/services/font-size.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule],
    template: `
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <i class="pi pi-wine text-2xl" style="color: var(--p-primary-color)"></i>
                <span class="font-bold text-lg">Catálogo de Vinhos</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="flex items-center gap-2">
                <div class="flex items-center gap-1 px-1" role="group" aria-label="Ajustar tamanho da fonte">
                    <button type="button" class="layout-topbar-action" [disabled]="!fontSize.podeDiminuir()" (click)="fontSize.diminuir()" title="Diminuir fonte">
                        <i class="pi pi-search-minus"></i>
                    </button>
                    <span class="text-xs font-bold hidden md:inline" style="min-width: 44px; text-align: center; color: var(--p-text-muted-color)">{{ fontSize.atual.label }}</span>
                    <button type="button" class="layout-topbar-action" [disabled]="!fontSize.podeAumentar()" (click)="fontSize.aumentar()" title="Aumentar fonte">
                        <i class="pi pi-search-plus"></i>
                    </button>
                </div>

                <div class="w-px h-6 mx-1" style="background: var(--p-content-border-color)"></div>

                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()" title="Alternar tema">
                    <i [class]="layoutService.isDarkTheme() ? 'pi pi-sun' : 'pi pi-moon'"></i>
                </button>

                <div class="w-px h-6 mx-1" style="background: var(--p-content-border-color)"></div>

                @if (authService.temMultiplosPerfis()) {
                    <button
                        type="button"
                        class="layout-topbar-action"
                        routerLink="/catalogo"
                        title="Ver como cliente"
                    >
                        <i class="pi pi-shopping-bag"></i>
                    </button>
                }

                <div class="flex items-center gap-2 px-2 py-1 rounded-lg" style="background: var(--p-content-hover-background)">
                    <div class="flex items-center justify-center w-8 h-8 rounded-full" style="background: var(--p-primary-color)">
                        <i class="pi pi-user text-sm" style="color: var(--p-primary-contrast-color)"></i>
                    </div>
                    <span class="text-sm font-medium hidden md:block">{{ userName }}</span>
                </div>

                <button
                    type="button"
                    class="layout-topbar-action"
                    (click)="logout()"
                    title="Sair"
                    style="color: var(--p-red-500)"
                >
                    <i class="pi pi-sign-out"></i>
                </button>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    layoutService = inject(LayoutService);
    authService = inject(AuthService);
    fontSize = inject(FontSizeService);

    get userName(): string {
        return this.authService.currentUser()?.nome ?? 'Usuário';
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update(state => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logout() {
        this.authService.logout();
    }
}
