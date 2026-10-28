import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, readAuth } from '../models/auth.model';
import { UserResponse } from '../models/user.model';
import { API_URL } from './api';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokens = inject(TokenService);

  readonly user = signal<UserResponse | null>(this.tokens.getUser());

  isLoggedIn(): boolean {
    return !!this.tokens.getToken();
  }

  rememberedEmail(): string {
    return this.tokens.getRememberedEmail();
  }

  rememberEmail(email: string): void {
    this.tokens.rememberEmail(email);
  }

  forgetEmail(): void {
    this.tokens.forgetEmail();
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.submit(`${API_URL}/api/auth/register`, payload);
  }

  login(payload: LoginRequest): Observable<void> {
    return this.submit(`${API_URL}/api/auth/login`, payload);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${API_URL}/api/auth/logout`, {}).pipe(
      catchError(() => of(undefined)),
      tap(() => this.clearLocal()),
      map(() => undefined),
    );
  }

  setUser(user: UserResponse): void {
    this.tokens.saveUser(user);
    this.user.set(user);
  }

  clearLocal(): void {
    this.tokens.clearSession();
    this.user.set(null);
  }

  private submit(url: string, payload: LoginRequest | RegisterRequest): Observable<void> {
    return this.http.post<unknown>(url, payload).pipe(
      switchMap((response) => {
        if (!this.capture(response)) {
          return throwError(
            () =>
              new HttpErrorResponse({
                status: 500,
                error: { message: 'The server did not return a token.' },
              }),
          );
        }
        return of(undefined);
      }),
    );
  }

  private capture(response: unknown): boolean {
    const auth: AuthResponse = readAuth(response);
    if (!auth.token) {
      return false;
    }
    this.tokens.save(auth.token, auth.type, auth.user);
    if (auth.user.email || auth.user.firstname) {
      this.user.set(auth.user);
    }
    return true;
  }
}
