import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, shareReplay } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class IconService {
  private http = inject(HttpClient);

  private cache = new Map<string, Observable<string>>();

  getIcon(name: string): Observable<string> {
    const cachedRequest = this.cache.get(name);

    if (cachedRequest) {
      return cachedRequest;
    }

    const path = `assets/icons/${name}.svg`;

    const request$ = this.http.get(path, {
      responseType: 'text'
    }).pipe(
      shareReplay(1),
      catchError(error => {
        console.error(`Failed to load icon ${name}:`, error);
        return of('');
      })
    );

    this.cache.set(name, request$);
    return request$;
  }
}