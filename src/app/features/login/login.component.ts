import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, tap } from 'rxjs';
import { clearLoginErrorAction, loginAction } from '../../core/store/auth/auth.actions';
import { selectAuthError } from '../../core/store/auth/auth.selectors';
import { IconComponent } from '../../shared/icons/components/icons/icons.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();
  loginErrorMessage = this.store.selectSignal(selectAuthError);
  isPasswordVisibility = false;
  isEmailError = signal(false);
  emailErrorMessage = signal('');
  emailWasFocused = signal(false);

  authForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    const emailControl = this.authForm.get('email')!;
    const passwordControl = this.authForm.get('password')!;

    emailControl.valueChanges.pipe(
      tap(() => {
        this.isEmailError.set(false);
        this.emailErrorMessage.set('');
        this.store.dispatch(clearLoginErrorAction());
      }),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => {
        emailControl.markAsTouched({ onlySelf: true });
        this.updateEmailError();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    passwordControl.valueChanges.pipe(
      tap(() => {
        this.store.dispatch(clearLoginErrorAction());
      }),
      distinctUntilChanged())
      .subscribe();
  }

  onEmailFocus() {
    this.emailWasFocused.set(true);
  }

  onEmailBlur() {
    const emailControl = this.authForm.get('email');
    emailControl?.markAsTouched({ onlySelf: true });
    this.updateEmailError();
  }

  private updateEmailError() {
    const emailControl = this.authForm.get('email');
    const shouldShowError = !!(emailControl?.invalid &&
      (emailControl?.touched || this.emailWasFocused()));

    this.isEmailError.set(shouldShowError);

    if (shouldShowError && emailControl?.errors) {
      if (emailControl.errors['required']) this.emailErrorMessage.set('Введите email');
      if (emailControl.errors['email']) this.emailErrorMessage.set('Неверный формат email');
    } else {
      this.emailErrorMessage.set('');
    }
  }

  login() {
    this.authForm.markAllAsTouched();
    this.updateEmailError();

    if (this.authForm.valid) {
      const { email, password } = this.authForm.value;
      this.store.dispatch(loginAction({
        email: email!,
        password: password!
      }));
    }
  }

  togglePasswordVisibility() {
    this.isPasswordVisibility = !this.isPasswordVisibility
  }

  get email() {
    return this.authForm.get('email');
  }

  get password() {
    return this.authForm.get('password');
  }

  getPasswordError(): boolean {
    const passwordControl = this.authForm.get('password');
    return !!(passwordControl?.invalid && passwordControl?.touched);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}