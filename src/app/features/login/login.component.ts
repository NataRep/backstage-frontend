import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { loginAction, logoutAction } from '../../store/auth/auth.actions';
import { selectAuthState } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private store = inject(Store);

  user = this.store.selectSignal(selectAuthState);

  login(email: string, password: string) {

    this.store.dispatch(loginAction({
      email: email,
      password: password
    }));
  }


  logout() {
    this.store.dispatch(logoutAction())
  }
}
