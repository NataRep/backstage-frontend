import { effect, Injectable, signal } from '@angular/core';
import { getApps } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  IdTokenResult,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _auth: ReturnType<typeof getAuth> | null = null;
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);

  user = this._user.asReadonly();
  token = this._token.asReadonly();

  constructor() {
    this.initAuth();

    effect(() => {
      this.updateToken();
    }, { allowSignalWrites: true });
  }

  private async initAuth() {
    if (!getApps().length) throw new Error('Firebase App not initialized yet');

    this._auth = getAuth();

    try {
      await setPersistence(this._auth, browserLocalPersistence);
    } catch (err) {
      console.error('Failed to set persistence', err);
    }

    onAuthStateChanged(this._auth, (user) => {
      this._user.set(user);
    });
  }

  private async updateToken() {
    const user = this._user();
    if (user) {
      try {
        const tokenResult: IdTokenResult = await user.getIdTokenResult();
        this._token.set(tokenResult.token);
      } catch (error) {
        console.error('Failed to get user token:', error);
        this._token.set(null);
      }
    } else {
      this._token.set(null);
    }
  }

  private get auth() {
    if (!this._auth) throw new Error('Auth not initialized yet');
    return this._auth;
  }

  async login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    return result;
  }

  async logout() {
    await signOut(this.auth);
    this._token.set(null);
  }

  // Метод для принудительного обновления токена
  async refreshToken(): Promise<string | null> {
    const user = this._user();
    if (!user) return null;

    try {
      await user.getIdToken(true); // forceRefresh = true
      const tokenResult = await user.getIdTokenResult();
      this._token.set(tokenResult.token);
      return tokenResult.token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  // Метод для проверки статуса токена
  getTokenStatus(): { isValid: boolean; expiresIn?: number; isExpired?: boolean; willExpireSoon?: boolean } {
    const token = this.token();
    const user = this.user();

    if (!token || !user) {
      return { isValid: false, isExpired: true };
    }

    try {
      // Декодируем JWT токен чтобы получить expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const expiresIn = exp - now;

      return {
        isValid: expiresIn > 0,
        expiresIn: Math.floor(expiresIn / 1000), // в секундах
        isExpired: expiresIn <= 0,
        willExpireSoon: expiresIn > 0 && expiresIn < 5 * 60 * 1000 // 5 минут
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return { isValid: false, isExpired: true };
    }
  }
}