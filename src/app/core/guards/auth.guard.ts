import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.authReady;

  let role = authService.role();
  const url = state.url;

  if (url.startsWith('/login') || url.startsWith('/reset-password')) {
    if (role === 'user') {
      return router.parseUrl('/');
    }
    return true;
  }

  if (role === 'guest' && !url.startsWith('/reset-password') && !url.startsWith('/login')) {
    return router.parseUrl('/login');
  }

  return true;
};