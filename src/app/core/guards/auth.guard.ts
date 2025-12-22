import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.role() === null) {
    await new Promise<void>((resolve) => {
      const maxWait = 2000;
      const interval = 10;
      let elapsed = 0;

      const wait = () => {
        if (authService.role() !== null || elapsed >= maxWait) {
          resolve();
        } else {
          elapsed += interval;
          setTimeout(wait, interval);
        }
      };

      wait();
    });
  }

  const role = authService.role();
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