import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);

  private readonly cloudName = environment.cloudinary.cloudName;
  private readonly uploadPreset = environment.cloudinary.presetName;
  private readonly apiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<CloudinaryResponse>(this.apiUrl, formData).pipe(
      map(response => response.secure_url),
      catchError(error => {
        console.error('Cloudinary upload error:', error);
        return throwError(() => new Error('Ошибка при загрузке медиа-файла'));
      }))
  }
}