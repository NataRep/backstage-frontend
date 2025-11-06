import { Injectable, signal } from '@angular/core';
import { getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _auth: ReturnType<typeof getAuth> | null = null;
  private _user = signal<User | null>(null);
  user = this._user.asReadonly();

  private get auth() {
    if (!this._auth) {
      if (!getApps().length) {
        throw new Error('Firebase App not initialized yet');
      }
      this._auth = getAuth();
      onAuthStateChanged(this._auth, (user) => this._user.set(user));
    }
    return this._auth;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }
}
