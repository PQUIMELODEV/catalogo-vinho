import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser, UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly STORAGE_KEY = 'auth_user';

    currentUser = signal<AuthUser | null>(this.loadFromStorage());
    activeProfile = signal<UserProfile | null>(this.loadFromStorage()?.activeProfile ?? null);

    constructor(private router: Router) {}

    // Simula chamada ao backend — substituir pela chamada HTTP real
    login(email: string, password: string): AuthUser {
        const mockUsers: Record<string, AuthUser> = {
            'admin@vinho.com': {
                id: '1',
                email: 'admin@vinho.com',
                name: 'Pedro Admin',
                token: 'mock-token-admin',
                profiles: [
                    { id: 'p1', name: 'Pedro Admin', role: 'admin' },
                    { id: 'p2', name: 'Pedro Cliente', role: 'cliente' }
                ]
            },
            'cliente@vinho.com': {
                id: '2',
                email: 'cliente@vinho.com',
                name: 'João Cliente',
                token: 'mock-token-cliente',
                profiles: [
                    { id: 'p3', name: 'João Cliente', role: 'cliente' }
                ]
            }
        };

        const user = mockUsers[email];
        if (!user) throw new Error('Credenciais inválidas');

        this.currentUser.set(user);
        this.saveToStorage(user);
        return user;
    }

    selectProfile(profile: UserProfile): void {
        const user = this.currentUser();
        if (!user) return;

        const updated = { ...user, activeProfile: profile };
        this.currentUser.set(updated);
        this.activeProfile.set(profile);
        this.saveToStorage(updated);

        const route = profile.role === 'admin' ? '/dashboard' : '/catalogo';
        this.router.navigate([route]);
    }

    logout(): void {
        this.currentUser.set(null);
        this.activeProfile.set(null);
        localStorage.removeItem(this.STORAGE_KEY);
        this.router.navigate(['/auth/login']);
    }

    isLoggedIn(): boolean {
        return !!this.currentUser();
    }

    hasMultipleProfiles(): boolean {
        return (this.currentUser()?.profiles?.length ?? 0) > 1;
    }

    private saveToStorage(user: AuthUser): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }

    private loadFromStorage(): AuthUser | null {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    }
}
