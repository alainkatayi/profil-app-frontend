import { Injectable } from '@angular/core';
import { normalizeUser, UserResponse } from '../models/user.model';

const TOKEN_KEY = 'token';
const TYPE_KEY = 'token_type';
const USER_KEY = 'user';
const EMAIL_KEY = 'remember_email';

@Injectable({ providedIn: 'root' })
export class TokenService {
  getToken(): string | null {
    return this.storage()?.getItem(TOKEN_KEY) ?? null;
  }

  getType(): string {
    return this.storage()?.getItem(TYPE_KEY) || 'Bearer';
  }

  getUser(): UserResponse | null {
    const raw = this.storage()?.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return normalizeUser(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  save(token: string, type: string, user: UserResponse): void {
    const storage = this.storage();
    if (!storage) {
      return;
    }
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(TYPE_KEY, type || 'Bearer');
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  saveUser(user: UserResponse): void {
    this.storage()?.setItem(USER_KEY, JSON.stringify(user));
  }

  clearSession(): void {
    const storage = this.storage();
    storage?.removeItem(TOKEN_KEY);
    storage?.removeItem(TYPE_KEY);
    storage?.removeItem(USER_KEY);
  }

  getRememberedEmail(): string {
    return this.storage()?.getItem(EMAIL_KEY) ?? '';
  }

  rememberEmail(email: string): void {
    this.storage()?.setItem(EMAIL_KEY, email);
  }

  forgetEmail(): void {
    this.storage()?.removeItem(EMAIL_KEY);
  }

  private storage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }
}
