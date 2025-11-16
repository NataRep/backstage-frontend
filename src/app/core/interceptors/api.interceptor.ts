// interceptors/api.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return from(getFreshToken(auth)).pipe(
    switchMap(token => {
      const baseUrl = 'http://localhost:3000/api/';
      const url = req.url.startsWith('http') ? req.url : `${baseUrl}${req.url}`;

      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const apiReq = req.clone({
        url: url,
        setHeaders: headers
      });

      return next(apiReq);
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        console.warn('Authentication error, redirecting to login');
        redirectToLogin(router);
      }
      return throwError(() => error);
    })
  );
};

async function getFreshToken(auth: AuthService): Promise<string | null> {
  const user = auth.user();
  if (!user) return null;

  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Failed to get fresh token:', error);
    return null;
  }
}

function redirectToLogin(router: Router): void {
  setTimeout(() => {
    router.navigate(['/login'], {
      queryParams: { returnUrl: router.url }
    });
  }, 0);
}