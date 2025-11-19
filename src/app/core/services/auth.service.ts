import { effect, inject, Injectable, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth'; // ← используем AngularFire Auth
import {
  browserLocalPersistence,
  getIdTokenResult,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential
} from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
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
    try {
      await setPersistence(this.auth, browserLocalPersistence);

      onAuthStateChanged(this.auth, (user) => {
        console.log('Auth state changed:', user);
        this._user.set(user);
      });
    } catch (err) {
      console.error('Failed to initialize auth:', err);
    }
  }

  private async updateToken() {
    const user = this._user();
    if (user) {
      try {
        const tokenResult = await getIdTokenResult(user); // ← правильный метод
        this._token.set(tokenResult.token);
      } catch (error) {
        console.error('Failed to get user token:', error);
        this._token.set(null);
      }
    } else {
      this._token.set(null);
    }
  }

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      console.log('Attempting login for:', email);
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Login successful:', result.user.email);
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  // Метод для принудительного обновления токена
  async refreshToken(): Promise<string | null> {
    const user = this._user();
    if (!user) return null;

    try {
      await user.getIdToken(true); // forceRefresh = true
      const tokenResult = await getIdTokenResult(user);
      this._token.set(tokenResult.token);
      return tokenResult.token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  // Метод для проверки статуса токена
  getTokenStatus(): {
    isValid: boolean;
    expiresIn?: number;
    isExpired?: boolean;
    willExpireSoon?: boolean
  } {
    const token = this._token();
    const user = this._user();

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

  // Дополнительные полезные методы
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  isAuthenticated(): boolean {
    return this._user() !== null;
  }

  getUserEmail(): string | null {
    return this._user()?.email || null;
  }

  getUserId(): string | null {
    return this._user()?.uid || null;
  }
}