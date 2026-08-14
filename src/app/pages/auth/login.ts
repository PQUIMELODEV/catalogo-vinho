import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from './services/auth.service';

type Step = 'telefone' | 'senha' | 'criar-senha' | 'email';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        FormsModule,
        RouterModule,
        RippleModule,
        MessageModule,
        AppFloatingConfigurator
    ],
    template: `
        <app-floating-configurator />

        <div class="flex items-center justify-center min-h-screen w-full overflow-y-auto py-8 px-4" style="background: var(--c-ground)">
            <div class="relative flex flex-col items-center w-full">
                <div class="w-full max-w-[420px]" style="border-radius: 24px; box-shadow: 0 12px 40px rgba(0, 0, 0, .10); background: var(--c-card)">
                    <div class="px-7 py-10 sm:px-10">

                        <div class="text-center mb-8">
                            <div class="mx-auto mb-5 flex items-center justify-center"
                                style="width: 60px; height: 60px; border-radius: 18px; background: var(--p-primary-color); color: #fff; font-weight: 800; font-size: 1.4rem; letter-spacing: .03em; box-shadow: 0 6px 16px color-mix(in srgb, var(--p-primary-color) 40%, transparent)">JP</div>
                            <div class="text-2xl font-bold mb-2" style="color: var(--p-text-color)">Catálogo de Vinhos</div>
                            <span class="text-muted-color font-medium">{{ subtitulo() }}</span>
                        </div>

                        @if (errorMessage()) {
                            <p-message severity="error" [text]="errorMessage()" styleClass="mb-6 w-full" />
                        }

                        @if (step() === 'telefone') {
                            <div>
                                <label for="telefone1" class="block text-surface-900 dark:text-surface-0 text-sm font-semibold mb-2">Telefone</label>
                                <input pInputText id="telefone1" type="tel" placeholder="(00) 00000-0000" class="w-full mb-6"
                                    [(ngModel)]="telefone" (keyup.enter)="onVerificarTelefone()" />

                                <p-button label="Continuar" styleClass="w-full" [loading]="loading()" (onClick)="onVerificarTelefone()" />

                                <div class="text-center mt-6">
                                    <span class="font-medium no-underline cursor-pointer text-primary text-sm" (click)="irParaEmail()">Sou administrador, entrar com e-mail</span>
                                </div>
                            </div>
                        }

                        @if (step() === 'criar-senha') {
                            <div>
                                <p class="text-muted-color mb-6">Primeiro acesso — crie uma senha numérica de 4 dígitos para <strong>{{ telefone }}</strong>.</p>

                                <label for="novaSenha1" class="block text-surface-900 dark:text-surface-0 text-sm font-semibold mb-2">Nova senha (4 números)</label>
                                <input pInputText id="novaSenha1" type="password" inputmode="numeric" maxlength="4" placeholder="0000" class="w-full mb-4"
                                    [ngModel]="novaSenha" (ngModelChange)="novaSenha = somenteDigitos($event, 4)" />

                                <label for="confirmarSenha1" class="block text-surface-900 dark:text-surface-0 text-sm font-semibold mb-2">Confirmar senha</label>
                                <input pInputText id="confirmarSenha1" type="password" inputmode="numeric" maxlength="4" placeholder="0000" class="w-full mb-4"
                                    [ngModel]="confirmarSenha" (ngModelChange)="confirmarSenha = somenteDigitos($event, 4)" />

                                <label for="desafio1" class="block text-surface-900 dark:text-surface-0 text-sm font-semibold mb-2">Só para confirmar que você não é um robô: quanto é {{ desafioA }} + {{ desafioB }}?</label>
                                <input pInputText id="desafio1" type="number" inputmode="numeric" placeholder="Resposta" class="w-full mb-6"
                                    [(ngModel)]="desafioResposta" (keyup.enter)="onCriarSenha()" />

                                <p-button label="Criar senha e entrar" styleClass="w-full" [loading]="loading()" (onClick)="onCriarSenha()" />

                                <div class="text-center mt-6">
                                    <span class="font-medium no-underline cursor-pointer text-primary text-sm" (click)="voltarParaTelefone()">Voltar</span>
                                </div>
                            </div>
                        }

                        @if (step() === 'senha') {
                            <div>
                                <p class="text-muted-color mb-6">Telefone: <strong>{{ telefone }}</strong></p>

                                <label for="senha1" class="block text-surface-900 dark:text-surface-0 text-sm font-semibold mb-2">Senha</label>
                                <p-password id="senha1" [(ngModel)]="senha" placeholder="Sua senha" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"
                                    (keyup.enter)="onLoginTelefone()" />

                                <div class="flex items-center mt-2 mb-6">
                                    <p-checkbox [(ngModel)]="lembrar" id="lembrar1" binary class="mr-2" />
                                    <label for="lembrar1">Lembrar de mim neste dispositivo</label>
                                </div>

                                <p-button label="Entrar" styleClass="w-full" [loading]="loading()" (onClick)="onLoginTelefone()" />

                                <div class="text-center mt-6">
                                    <span class="font-medium no-underline cursor-pointer text-primary text-sm" (click)="voltarParaTelefone()">Trocar telefone</span>
                                </div>
                            </div>
                        }

                        @if (step() === 'email') {
                            <div>
                                <label for="email1" class="block text-surface-900 dark:text-surface-0 text-sm font-semibold mb-2">E-mail</label>
                                <input pInputText id="email1" type="text" placeholder="seu@email.com" class="w-full mb-6" [(ngModel)]="email" />

                                <label for="password1" class="block text-surface-900 dark:text-surface-0 text-sm font-semibold mb-2">Senha</label>
                                <p-password
                                    id="password1"
                                    [(ngModel)]="password"
                                    placeholder="Sua senha"
                                    [toggleMask]="true"
                                    styleClass="mb-6"
                                    [fluid]="true"
                                    [feedback]="false"
                                    (keyup.enter)="onLogin()"
                                />

                                <p-button
                                    label="Entrar"
                                    styleClass="w-full"
                                    [loading]="loading()"
                                    (onClick)="onLogin()"
                                />

                                <div class="text-center mt-6">
                                    <span class="font-medium no-underline cursor-pointer text-primary text-sm" (click)="voltarParaTelefone()">Sou cliente, entrar com telefone</span>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        /* Mesma paleta quente da marca usada no catálogo (creme + bordô), para o
           login não destoar do restante do app. Só escopado a este componente. */
        :host {
            --p-content-background: #ffffff;
            --p-content-hover-background: #efeadf;
            --p-content-border-color: #e4dbcb;
            --p-surface-100: #f5f0e6;
            --p-text-color: #2a2620;
            --p-text-muted-color: #7c7264;
            --c-ground: var(--p-content-hover-background, #efeadf);
            --c-card: var(--p-content-background, #ffffff);
            display: block;
        }
        :host-context(.app-dark) {
            --p-content-background: #1e1b16;
            --p-content-hover-background: #16130f;
            --p-content-border-color: #332d25;
            --p-surface-100: #262019;
            --p-text-color: #ede7db;
            --p-text-muted-color: #a99e8c;
        }
        /* Aquece a borda dos campos para o mesmo tom da marca (não vinha do token de content). */
        :host ::ng-deep .p-inputtext,
        :host ::ng-deep .p-password > input {
            border-color: var(--p-content-border-color);
            background: var(--p-content-background);
        }
    `]
})
export class Login {
    step = signal<Step>('telefone');

    telefone = '';
    senha = '';
    novaSenha = '';
    confirmarSenha = '';
    lembrar = false;

    desafioA = 0;
    desafioB = 0;
    desafioResposta: number | null = null;

    email = '';
    password = '';

    loading = signal(false);
    errorMessage = signal('');

    constructor(private authService: AuthService) {}

    subtitulo(): string {
        switch (this.step()) {
            case 'criar-senha': return 'Configure sua senha para continuar';
            case 'senha': return 'Digite sua senha para entrar';
            case 'email': return 'Acesso administrativo';
            default: return 'Entre com seu telefone para continuar';
        }
    }

    onVerificarTelefone(): void {
        if (!this.telefone?.trim()) {
            this.errorMessage.set('Informe seu telefone.');
            return;
        }

        this.loading.set(true);
        this.errorMessage.set('');

        this.authService.verificarTelefone(this.telefone).subscribe({
            next: (r) => {
                this.loading.set(false);
                if (!r.clienteEncontrado) {
                    this.errorMessage.set('Telefone não encontrado. Fale com a loja para cadastrar seu número.');
                    return;
                }
                if (r.precisaCriarSenha) this.gerarDesafio();
                this.step.set(r.precisaCriarSenha ? 'criar-senha' : 'senha');
            },
            error: (err: Error) => {
                this.loading.set(false);
                this.errorMessage.set(err.message || 'Não foi possível verificar o telefone.');
            }
        });
    }

    onCriarSenha(): void {
        if (!/^\d{4}$/.test(this.novaSenha ?? '')) {
            this.errorMessage.set('A senha precisa ter exatamente 4 números.');
            return;
        }
        if (this.novaSenha !== this.confirmarSenha) {
            this.errorMessage.set('As senhas não coincidem.');
            return;
        }
        if (this.desafioResposta === null || Number(this.desafioResposta) !== this.desafioA + this.desafioB) {
            this.errorMessage.set('Resposta incorreta. Confira a soma e tente de novo.');
            this.gerarDesafio();
            return;
        }

        this.loading.set(true);
        this.errorMessage.set('');

        this.authService.criarSenhaTelefone(this.telefone, this.novaSenha, this.desafioA, this.desafioB, Number(this.desafioResposta)).subscribe({
            next: () => this.loading.set(false),
            error: (err: Error) => {
                this.loading.set(false);
                this.gerarDesafio();
                this.errorMessage.set(err.message || 'Não foi possível criar a senha.');
            }
        });
    }

    /** Mantém só dígitos e limita o tamanho — usado nos campos de senha numérica (PIN). */
    somenteDigitos(valor: string, maxLen: number): string {
        return (valor ?? '').replace(/\D/g, '').slice(0, maxLen);
    }

    private gerarDesafio(): void {
        this.desafioA = 1 + Math.floor(Math.random() * 20);
        this.desafioB = 1 + Math.floor(Math.random() * 20);
        this.desafioResposta = null;
    }

    onLoginTelefone(): void {
        if (!this.senha) {
            this.errorMessage.set('Informe sua senha.');
            return;
        }

        this.loading.set(true);
        this.errorMessage.set('');

        this.authService.loginTelefone(this.telefone, this.senha, this.lembrar).subscribe({
            next: () => this.loading.set(false),
            error: (err: Error) => {
                this.loading.set(false);
                this.errorMessage.set(err.message || 'Telefone ou senha incorretos.');
            }
        });
    }

    onLogin(): void {
        if (!this.email || !this.password) {
            this.errorMessage.set('Preencha e-mail e senha.');
            return;
        }

        this.loading.set(true);
        this.errorMessage.set('');

        this.authService.login(this.email, this.password).subscribe({
            next: () => this.loading.set(false),
            error: () => {
                this.errorMessage.set('E-mail ou senha incorretos.');
                this.loading.set(false);
            }
        });
    }

    irParaEmail(): void {
        this.errorMessage.set('');
        this.step.set('email');
    }

    voltarParaTelefone(): void {
        this.errorMessage.set('');
        this.senha = '';
        this.novaSenha = '';
        this.confirmarSenha = '';
        this.step.set('telefone');
    }
}
