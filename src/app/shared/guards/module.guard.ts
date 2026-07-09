import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../pages/auth/services/auth.service';

export const moduleGuard: CanActivateFn = route => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const modulo = route.data['modulo'] as string;

    if (authService.hasAccess(modulo)) return true;

    router.navigate(['/auth/access']);
    return false;
};
