import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.role() === null) {

    const maxWaitTime = 2000;
    const checkInterval = 10;


    await new Promise<void>((resolve) => {
      let elapsed = 0;

      const checkRole = () => {
        if (authService.role() !== null) {
          resolve();
        } else if (elapsed >= maxWaitTime) {
          console.warn('Auth initialization timeout, defaulting to guest');
          resolve();
        } else {
          elapsed += checkInterval;
          setTimeout(checkRole, checkInterval);
        }
      };

      checkRole();
    });
  }

  if (authService.role() === 'user') {
    return router.parseUrl('/');
  }

  return true;
};
