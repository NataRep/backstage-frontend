import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private http = inject(HttpClient);

  private cache = new Map<string, any>();

  getIcon(name: string) {
    if (!this.cache.has(name)) {
      const path = `assets/icons/${name}.svg`;

      const request$ = this.http.get(path, {
        responseType: 'text'
      }).pipe(
        map((svg: string) => svg),
        shareReplay(1),
        catchError(error => {
          console.error(`Failed to load icon ${name}:`, error);
          return of(''); // Возвращаем пустую строку при ошибке
        })
      );

      this.cache.set(name, request$);
    }

    return this.cache.get(name);
  }
}