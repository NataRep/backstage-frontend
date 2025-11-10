import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.getFreshToken()).pipe(
      switchMap(token => {
        const baseUrl = 'http://localhost:3000';
        const url = req.url.startsWith('http') ? req.url : `${baseUrl}${req.url}`;

        const apiReq = req.clone({
          url: url,
          setHeaders: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'application/json'
          }
        });

        return next.handle(apiReq);
      })
    );
  }

  private async getFreshToken(): Promise<string | null> {
    const user = this.auth.user();
    if (!user) return null;

    try {
      // Получаем свежий токен
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error('Failed to get fresh token:', error);
      return null;
    }
  }
}