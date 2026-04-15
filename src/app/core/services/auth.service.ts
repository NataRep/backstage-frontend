import { effect, inject, Injectable, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth'; // ← используем AngularFire Auth
import { Store } from '@ngrx/store';
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
import { loginSuccessAction } from '../store/auth/auth.actions';

export type UserAuthRole = 'guest' | 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private store = inject(Store);

  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _role = signal<UserAuthRole>('guest');

  private authReadyResolver!: () => void;
  private authInitialized = false;
  authReady: Promise<void>;

  user = this._user.asReadonly();
  token = this._token.asReadonly();
  role = this._role.asReadonly();

  constructor() {
    this.authReady = new Promise<void>((resolve) => {
      this.authReadyResolver = resolve;
    });

    this.initAuth();

    effect(() => {
      this.updateToken();
    }, { allowSignalWrites: true });
  }

  private async initAuth() {
    try {
      await setPersistence(this.auth, browserLocalPersistence);

      onAuthStateChanged(this.auth, (user) => {
        this._user.set(user);

        if (user) {
          this._role.set('user');
          this.store.dispatch(loginSuccessAction({
            user: {
              email: user.email,
              personId: user.uid,
              name: user.displayName
            }
          }));
        } else {
          this._role.set('guest');
        }

        if (!this.authInitialized) {
          this.authInitialized = true;
          this.authReadyResolver();
        }
      });
    } catch {
      this._role.set('guest');
      if (!this.authInitialized) {
        this.authInitialized = true;
        this.authReadyResolver();
      }
    }
  }

  private async updateToken() {
    const user = this._user();
    if (user) {
      try {
        const tokenResult = await getIdTokenResult(user);
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
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async refreshToken(): Promise<string | null> {
    const user = this._user();
    if (!user) return null;

    try {
      await user.getIdToken(true);
      const tokenResult = await getIdTokenResult(user);
      this._token.set(tokenResult.token);
      return tokenResult.token;
    } catch {
      return null;
    }
  }

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
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const expiresIn = exp - now;

      return {
        isValid: expiresIn > 0,
        expiresIn: Math.floor(expiresIn / 1000),
        isExpired: expiresIn <= 0,
        willExpireSoon: expiresIn > 0 && expiresIn < 5 * 60 * 1000
      };
    } catch {
      return { isValid: false, isExpired: true };
    }
  }

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