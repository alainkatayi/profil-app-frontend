import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UpdateProfileRequest, UserResponse, normalizeUser } from '../models/user.model';
import { API_URL } from './api';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  getMe(): Observable<UserResponse> {
    return this.http.get<unknown>(`${API_URL}/api/users/me`).pipe(
      map((raw) => normalizeUser(raw)),
      tap((user) => this.auth.setUser(user)),
    );
  }

  updateProfile(payload: UpdateProfileRequest): Observable<UserResponse> {
    return this.http
      .put<unknown>(`${API_URL}/api/users/me`, payload)
      .pipe(switchMap(() => this.getMe()));
  }

  loadProfileImage(fileName: string): Observable<Blob> {
    return this.http.get(`${API_URL}/api/users/me/images/${encodeURIComponent(fileName)}`, {
      responseType: 'blob',
    });
  }

  // Le contrôleur Spring doit lire la partie sous le nom "file".
  uploadImage(file: File): Observable<UserResponse> {
    const body = new FormData();
    body.append('file', file);
    return this.http
      .post<unknown>(`${API_URL}/api/users/me/images`, body)
      .pipe(switchMap(() => this.getMe()));
  }
}
