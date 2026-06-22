import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { UserProfile } from '../models/user.model';

@Component({
    selector: 'app-profile-selector',
    standalone: true,
    imports: [CommonModule, DrawerModule, ButtonModule, AvatarModule, RippleModule],
    template: `
        <p-drawer [(visible)]="visible" position="right" [style]="{ width: '360px' }" [closeOnEscape]="false" [showCloseIcon]="false" styleClass="profile-selector-drawer">
            <ng-template pTemplate="header">
                <div class="flex flex-col gap-1">
                    <span class="text-xl font-semibold text-surface-900 dark:text-surface-0">Selecionar Perfil</span>
                    <span class="text-sm text-muted-color">Com qual perfil deseja entrar?</span>
                </div>
            </ng-template>

            <div class="flex flex-col gap-3 py-2">
                @for (profile of profiles; track profile.id) {
                    <button
                        pRipple
                        class="flex items-center gap-4 p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary cursor-pointer transition-all w-full text-left bg-transparent profile-option"
                        [class.selected]="selectedProfile?.id === profile.id"
                        (click)="selectProfile(profile)"
                    >
                        <p-avatar
                            [label]="getInitials(profile.name)"
                            [style]="{ 'background-color': profile.role === 'admin' ? 'var(--p-primary-color)' : 'var(--p-green-500)', color: '#fff' }"
                            size="large"
                            shape="circle"
                        />
                        <div class="flex flex-col flex-1">
                            <span class="font-semibold text-surface-900 dark:text-surface-0">{{ profile.name }}</span>
                            <span class="text-sm text-muted-color capitalize">{{ profile.role === 'admin' ? 'Administrador' : 'Cliente' }}</span>
                        </div>
                        <i class="pi pi-chevron-right text-muted-color"></i>
                    </button>
                }
            </div>
        </p-drawer>
    `,
    styles: [`
        :host ::ng-deep .profile-selector-drawer .p-drawer-content {
            padding: 1.5rem;
            background-color: var(--p-surface-0);
        }

        :host ::ng-deep .profile-selector-drawer .p-drawer-header {
            background-color: var(--p-surface-0);
            border-bottom: 1px solid var(--p-surface-200);
            padding: 1.5rem;
        }

        .profile-option {
            background-color: var(--p-surface-0);
            border: 1px solid var(--p-surface-200);
            color: var(--p-text-color);
            transition: border-color 0.2s, background-color 0.2s;
        }

        .profile-option:hover {
            border-color: var(--p-primary-color);
            background-color: var(--p-surface-50);
        }

        .profile-option.selected {
            border-color: var(--p-primary-color);
            background-color: color-mix(in srgb, var(--p-primary-color) 10%, var(--p-surface-0));
        }
    `]
})
export class ProfileSelectorComponent {
    @Input() visible = false;
    @Input() profiles: UserProfile[] = [];
    @Output() profileSelected = new EventEmitter<UserProfile>();

    selectedProfile: UserProfile | null = null;

    selectProfile(profile: UserProfile): void {
        this.selectedProfile = profile;
        setTimeout(() => this.profileSelected.emit(profile), 200);
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .slice(0, 2)
            .map(n => n[0])
            .join('')
            .toUpperCase();
    }
}
