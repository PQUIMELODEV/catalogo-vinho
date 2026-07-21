import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthUser } from '../models/user.model';
import { BaseResponse } from '../../../shared/models/base-response.model';
import { environment } from '@/environments/environment';

interface LoginResponse {
    token: string;
    usuario: Omit<AuthUser, 'token'>;
}

interface VerificarTelefoneResponse {
    clienteEncontrado: boolean;
    precisaCriarSenha: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly STORAGE_KEY = 'auth_user';
    private readonly API = environment.apiUrl;

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

    /** Primeiro passo do login do cliente: diz se o telefone é conhecido e se precisa criar senha. */
    verificarTelefone(telefone: string): Observable<VerificarTelefoneResponse> {
        return this.http.post<BaseResponse<VerificarTelefoneResponse>>(`${this.API}/auth/telefone/verificar`, { telefone }).pipe(
            map(r => {
                if (!r.status || !r.resultado) throw new Error(r.mensagem || 'Não foi possível verificar o telefone.');
                return r.resultado;
            }),
            catchError(err => this.repassarErro(err, 'Não foi possível verificar o telefone.'))
        );
    }

    /** Primeiro acesso: define a senha do cliente e já efetua o login. */
    criarSenhaTelefone(telefone: string, novaSenha: string, desafioA: number, desafioB: number, desafioResposta: number): Observable<AuthUser> {
        return this.http.post<BaseResponse<LoginResponse>>(`${this.API}/auth/telefone/criar-senha`, { telefone, novaSenha, desafioA, desafioB, desafioResposta }).pipe(
            map(r => {
                if (!r.status || !r.resultado) throw new Error(r.mensagem || 'Não foi possível criar a senha.');
                const user: AuthUser = { ...r.resultado.usuario, token: r.resultado.token };
                return user;
            }),
            tap(user => {
                this.currentUser.set(user);
                this.saveToStorage(user);
                this.router.navigate([this.rotaInicial()]);
            }),
            catchError(err => this.repassarErro(err, 'Não foi possível criar a senha.'))
        );
    }

    /** Login do cliente a partir do 2º acesso: telefone + senha. */
    loginTelefone(telefone: string, senha: string, lembrar: boolean): Observable<AuthUser> {
        return this.http.post<BaseResponse<LoginResponse>>(`${this.API}/auth/telefone/login`, { telefone, senha, lembrar }).pipe(
            map(r => {
                if (!r.status || !r.resultado) throw new Error(r.mensagem || 'Telefone ou senha inválidos.');
                const user: AuthUser = { ...r.resultado.usuario, token: r.resultado.token };
                return user;
            }),
            tap(user => {
                this.currentUser.set(user);
                this.saveToStorage(user);
                this.router.navigate([this.rotaInicial()]);
            }),
            catchError(err => this.repassarErro(err, 'Telefone ou senha inválidos.'))
        );
    }

    /**
     * Respostas de erro HTTP (401, 500 etc.) pulam o `map` acima e caem direto aqui como
     * HttpErrorResponse — extrai a mensagem amigável do corpo (BaseResponse.mensagem) em vez
     * de deixar vazar o texto genérico do Angular ("Http failure response for ... 401").
     */
    private repassarErro(err: unknown, mensagemPadrao: string): Observable<never> {
        if (err instanceof HttpErrorResponse) {
            const mensagem = err.error?.mensagem;
            return throwError(() => new Error(mensagem || mensagemPadrao));
        }
        return throwError(() => err instanceof Error ? err : new Error(mensagemPadrao));
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
