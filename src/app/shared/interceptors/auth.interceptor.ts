import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../pages/auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    const isLoginRequest = req.url.includes('/auth/login') || req.url.includes('/auth/telefone/');

    return next(authReq).pipe(
        catchError(err => {
            if (err.status === 401 && !isLoginRequest) {
                authService.logout();
            }
            return throwError(() => err);
        })
    );
};
