// interceptors/api.interceptor.ts
import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { environment } from '../environments/environments';
import { AuthService } from '../services/auth.service';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
export const ALLOW_EXTERNAL = new HttpContextToken<boolean>(() => false);


let refreshInProgress = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  if (req.url.startsWith('/assets/') || req.url.endsWith('.svg')) {
    return next(req);
  }

  const apiBase = (environment.apiUrl || '').replace(/\/$/, '');
  let finalUrl = req.url;
  let shouldAddAuth = true;

  if (/^https?:\/\//i.test(req.url)) {
    if (!req.context.get(ALLOW_EXTERNAL)) {
      try {
        const url = new URL(req.url);
        const apiUrl = new URL(apiBase);

        if (url.origin !== apiUrl.origin) {
          shouldAddAuth = false;

          const whitelist = new Set([
            'accept',
            'content-type',
            'cache-control',
            'pragma',
            'accept-encoding',
            'user-agent'
          ]);

          let cleaned = req;
          req.headers.keys().forEach(h => {
            if (!whitelist.has(h.toLowerCase())) {
              cleaned = cleaned.clone({ headers: cleaned.headers.delete(h) });
            }
          });

          return next(cleaned);
        }
      } catch {

        return next(req);
      }
    }
  } else {
    finalUrl = `${apiBase}/${req.url.replace(/^\/+/, '')}`;
  }

  const handleRequest = (token: string | null): Observable<HttpEvent<unknown>> => {
    const headers: Record<string, string> = {};

    if (shouldAddAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const contentTypeAlready = req.headers.has('Content-Type');
    const isPlainObjectBody = req.body !== null &&
      typeof req.body === 'object' &&
      !(req.body instanceof FormData) &&
      !(req.body instanceof ArrayBuffer) &&
      !(req.body instanceof Blob);

    if (!contentTypeAlready && isPlainObjectBody) {
      headers['Content-Type'] = 'application/json';
    }

    const clonedReq = req.clone({
      url: finalUrl,
      setHeaders: headers
    });

    return next(clonedReq);
  };

  const handle401Error = (): Observable<HttpEvent<unknown>> => {
    if (refreshInProgress) {
      return refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => handleRequest(token))
      );
    }

    refreshInProgress = true;
    refreshTokenSubject.next(null);

    return from(auth.refreshToken()).pipe(
      switchMap((newToken: string | null) => {
        refreshInProgress = false;
        if (newToken) {
          refreshTokenSubject.next(newToken);
          return handleRequest(newToken);
        }

        safeRedirectToLogin(router);
        return throwError(() => new Error('Token refresh failed'));
      }),
      catchError(err => {
        refreshInProgress = false;
        safeRedirectToLogin(router);
        return throwError(() => err);
      })
    );
  };

  const tokenStatus = auth.getTokenStatus?.() ?? { isExpired: false, willExpireSoon: false };
  const currentToken = auth.token?.() ?? null;

  if (shouldAddAuth && (tokenStatus.willExpireSoon || tokenStatus.isExpired)) {
    if (!refreshInProgress) {
      refreshInProgress = true;
      refreshTokenSubject.next(null);

      return from(auth.refreshToken()).pipe(
        switchMap((newToken: string | null) => {
          refreshInProgress = false;
          if (newToken) {
            refreshTokenSubject.next(newToken);
            return handleRequest(newToken);
          }
          safeRedirectToLogin(router);
          return throwError(() => new Error('Token refresh failed'));
        }),
        catchError(err => {
          refreshInProgress = false;
          safeRedirectToLogin(router);
          return throwError(() => err);
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter(t => t !== null),
        take(1),
        switchMap(t => handleRequest(t))
      );
    }
  }

  return handleRequest(currentToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && shouldAddAuth) {
        return handle401Error();
      }

      if (error.status === 403) {
        console.warn('Access denied - insufficient permissions');
        safeRedirectToLogin(router);
      }

      return throwError(() => error);
    })
  );
};

function isValidReturnUrl(url: string): boolean {
  try {
    if (!url) return false;
    const decoded = decodeURIComponent(url);

    if (!decoded.startsWith('/')) return false;

    if (decoded.split('/').some(segment => segment === '..')) return false;

    const absoluteUrl = new URL(decoded, window.location.origin);
    return absoluteUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}


function safeRedirectToLogin(router: Router): void {
  const currentUrl = router.url || '';
  const queryParams: Record<string, string> = {};

  if (isValidReturnUrl(currentUrl) && !currentUrl.startsWith('/login')) {
    queryParams['returnUrl'] = currentUrl;
  }

  Promise.resolve().then(() => {
    router.navigate(['/login'], { queryParams }).catch(err => {
      console.error('Redirect to login failed:', err);
    });
  });
}
