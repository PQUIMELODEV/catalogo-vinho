import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthUser } from '../models/user.model';
import { BaseResponse } from '../../../shared/models/base-response.model';

interface LoginResponse {
    token: string;
    usuario: Omit<AuthUser, 'token'>;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly STORAGE_KEY = 'auth_user';
    private readonly API = 'https://localhost:44396/api';

    currentUser = signal<AuthUser | null>(this.loadFromStorage());

    constructor(private http: HttpClient, private router: Router) {}

    login(email: string, senha: string): Observable<AuthUser> {
        return this.http.post<BaseResponse<LoginResponse>>(`${this.API}/auth/login`, { email, senha }).pipe(
            map(r => {
                if (!r.status || !r.resultado) throw new Error(r.mensagem || 'Credenciais inválidas');
                const user: AuthUser = { ...r.resultado.usuario, token: r.resultado.token };
                return user;
            }),
            tap(user => {
                this.currentUser.set(user);
                this.saveToStorage(user);
                this.router.navigate([this.rotaInicial()]);
            })
        );
    }

    rotaInicial(): string {
        if (this.temAcessoAdmin()) return '/';
        if (this.temAcessoCatalogo()) return '/catalogo';
        return '/auth/access';
    }

    temAcessoAdmin(): boolean {
        return (this.currentUser()?.acessos ?? []).some(a => a.modulo !== 'catalogo' && a.visualizar);
    }

    temAcessoCatalogo(): boolean {
        return this.hasAccess('catalogo');
    }

    /** true quando o usuário pode alternar entre a área administrativa e o catálogo do cliente. */
    temMultiplosPerfis(): boolean {
        return this.temAcessoAdmin() && this.temAcessoCatalogo();
    }

    refreshMe(): Observable<AuthUser | null> {
        return this.http.get<BaseResponse<Omit<AuthUser, 'token'>>>(`${this.API}/auth/me`).pipe(
            map(r => {
                const atual = this.currentUser();
                if (!r.status || !r.resultado || !atual) return null;
                const user: AuthUser = { ...r.resultado, token: atual.token };
                this.currentUser.set(user);
                this.saveToStorage(user);
                return user;
            })
        );
    }

    logout(): void {
        this.currentUser.set(null);
        localStorage.removeItem(this.STORAGE_KEY);
        this.router.navigate(['/auth/login']);
    }

    isLoggedIn(): boolean {
        return !!this.currentUser();
    }

    getToken(): string | null {
        return this.currentUser()?.token ?? null;
    }

    hasAccess(modulo: string, tipo: 'visualizar' | 'inserir' | 'editar' | 'remover' = 'visualizar'): boolean {
        const acesso = this.currentUser()?.acessos?.find(a => a.modulo === modulo);
        return !!acesso?.[tipo];
    }

    private saveToStorage(user: AuthUser): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }

    private loadFromStorage(): AuthUser | null {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    }
}
