import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { authInterceptor } from './app/shared/interceptors/auth.interceptor';

// Paleta da marca (inspirada no rótulo Concha y Toro): laranja = cor de ação
// (botões/CTA), bordô e creme entram nos tokens do catálogo (catalogo.component.scss).
const AppTheme = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#fbeaea',
            100: '#f5c9cb',
            200: '#ec9a9d',
            300: '#e06b70',
            400: '#d5474d',
            500: '#c0272d',
            600: '#a61f26',
            700: '#86181e',
            800: '#661318',
            900: '#470d10',
            950: '#2b0709'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.600}',
                    activeColor: '{primary.700}'
                },
                highlight: {
                    background: '{primary.500}',
                    focusBackground: '{primary.600}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            },
            dark: {
                primary: {
                    color: '{primary.400}',
                    contrastColor: '#2a1206',
                    hoverColor: '{primary.300}',
                    activeColor: '{primary.200}'
                },
                highlight: {
                    background: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                    focusBackground: 'color-mix(in srgb, {primary.400}, transparent 64%)',
                    color: 'rgba(255,255,255,.92)',
                    focusColor: 'rgba(255,255,255,.92)'
                }
            }
        }
    }
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
        provideZonelessChangeDetection(),
        providePrimeNG({ theme: { preset: AppTheme, options: { darkModeSelector: '.app-dark' } } }),
        MessageService
    ]
};
