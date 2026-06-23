import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AuthService } from '@/app/pages/auth/services/auth.service';
import { ProfileSelectorComponent } from '@/app/pages/auth/components/profile-selector.component';
import { UserProfile } from '@/app/pages/auth/models/user.model';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, ProfileSelectorComponent],
    template: `
    <app-profile-selector
        [visible]="showProfileSelector()"
        [profiles]="profiles()"
        (profileSelected)="onProfileSelected($event)"
        (visibleChange)="showProfileSelector.set($event)"
    />

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
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()" title="Alternar tema">
                    <i [class]="layoutService.isDarkTheme() ? 'pi pi-sun' : 'pi pi-moon'"></i>
                </button>

                <div class="w-px h-6 mx-1" style="background: var(--p-surface-border)"></div>

                <div class="flex items-center gap-2 px-2 py-1 rounded-lg" style="background: var(--p-surface-hover)">
                    <div class="flex items-center justify-center w-8 h-8 rounded-full" style="background: var(--p-primary-color)">
                        <i class="pi pi-user text-sm" style="color: var(--p-primary-contrast-color)"></i>
                    </div>
                    <span class="text-sm font-medium hidden md:block">{{ userName }}</span>
                </div>

                <button
                    type="button"
                    class="layout-topbar-action"
                    (click)="openProfileSelector()"
                    title="Trocar perfil"
                >
                    <i class="pi pi-arrow-right-arrow-left"></i>
                </button>

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

    showProfileSelector = signal(false);
    profiles = signal<UserProfile[]>([]);

    get userName(): string {
        return this.authService.activeProfile()?.name ?? this.authService.currentUser()?.name ?? 'Usuário';
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update(state => ({ ...state, darkTheme: !state.darkTheme }));
    }

    openProfileSelector() {
        const user = this.authService.currentUser();
        if (!user || user.profiles.length < 2) return;
        this.profiles.set(user.profiles);
        this.showProfileSelector.set(true);
    }

    onProfileSelected(profile: UserProfile) {
        this.showProfileSelector.set(false);
        this.authService.selectProfile(profile);
    }

    logout() {
        this.authService.logout();
    }
}
