import { Injectable, signal } from '@angular/core';
import { getApps } from 'firebase/app';
import { browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _auth: ReturnType<typeof getAuth> | null = null;
  private _user = signal<User | null>(null);
  user = this._user.asReadonly();

  constructor() {
    this.initAuth();
  }

  private initAuth() {
    if (!getApps().length) throw new Error('Firebase App not initialized yet');

    this._auth = getAuth();

    setPersistence(this._auth, browserLocalPersistence)
      .catch(err => console.error('Failed to set persistence', err));

    onAuthStateChanged(this._auth, (user) => this._user.set(user));
  }

  private get auth() {
    if (!this._auth) throw new Error('Auth not initialized yet');
    return this._auth;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }
}
