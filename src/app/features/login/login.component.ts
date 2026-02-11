import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { clearLoginErrorAction, loginAction } from '../../core/store/auth/auth.actions';
import { selectAuthError, selectAuthUser } from '../../core/store/auth/auth.selectors';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../shared/components/modal-container/modal-container.component';
import { ModalAction } from '../../shared/components/modal-container/modal.model';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, ModalContainerComponent, ToastComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private auth = inject(Auth);
  private router = inject(Router)
  private currentUser = this.store.selectSignal(selectAuthUser);

  loginErrorMessage = this.store.selectSignal(selectAuthError);
  isPasswordVisibility = false;
  isEmailError = signal(false);
  emailErrorMessage = signal('');
  emailWasFocused = signal(false);

  isResetEmailError = signal(false);
  resetEmailErrorMessage = signal('');
  resetEmailWasFocused = signal(false);

  isModalOpen = false;
  isSuccessToastOpen = signal(false);
  isErrorToastOpen = signal(false);
  successToastMessage = 'Ссылка для сброса пароля отправлена! Проверьте электронную почту.';
  errorToastMessage = 'Что-то пошло не так. Попробуйте повторить запрос позже';

  authForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  resetPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor() {
    effect(() => {
      if (this.currentUser()) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnInit() {
    this.initLoginForm();
    this.initResetPasswordForm();
  }

  initLoginForm() {
    const emailControl = this.authForm.get('email') as FormControl;
    const passwordControl = this.authForm.get('password')!;

    this.initEmailValidation(
      emailControl,
      this.isEmailError,
      this.emailErrorMessage,
      this.emailWasFocused
    );

    passwordControl.valueChanges.pipe(
      tap(() => this.store.dispatch(clearLoginErrorAction())),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  initResetPasswordForm() {
    const emailControl = this.resetPasswordForm.get('email') as FormControl;

    this.initEmailValidation(
      emailControl,
      this.isResetEmailError,
      this.resetEmailErrorMessage,
      this.resetEmailWasFocused
    );
  }

  login() {
    this.authForm.markAllAsTouched();
    const emailControl = this.authForm.get('email') as FormControl;

    this.updateEmailError(
      emailControl,
      this.isEmailError,
      this.emailErrorMessage,
      this.emailWasFocused
    );

    if (this.authForm.valid) {
      const { email, password } = this.authForm.value;
      this.store.dispatch(loginAction({
        email: email!,
        password: password!
      }));
    }
  }

  private initEmailValidation(
    emailControl: FormControl,
    isError: WritableSignal<boolean>,
    errorMessage: WritableSignal<string>,
    wasFocused: WritableSignal<boolean>
  ) {
    emailControl.valueChanges.pipe(
      tap(() => {
        isError.set(false);
        errorMessage.set('');
        this.store.dispatch(clearLoginErrorAction());
      }),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => {
        emailControl.markAsTouched({ onlySelf: true });
        this.updateEmailError(emailControl, isError, errorMessage, wasFocused);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private updateEmailError(
    emailControl: FormControl,
    isError: WritableSignal<boolean>,
    errorMessage: WritableSignal<string>,
    wasFocused: WritableSignal<boolean>
  ) {
    const shouldShowError =
      emailControl.invalid && (emailControl.touched || wasFocused());

    isError.set(shouldShowError);

    if (shouldShowError && emailControl.errors) {
      if (emailControl.errors['required']) {
        errorMessage.set('Введите email');
      } else if (emailControl.errors['email']) {
        errorMessage.set('Неверный формат email');
      }
    } else {
      errorMessage.set('');
    }
  }

  trimOnBlur(controlName: string) {
    const control = this.authForm.get(controlName);
    if (control && typeof control.value === 'string') {
      control.setValue(control.value.trim(), { emitEvent: true });
    }
  }

  onEmailFocus() {
    this.emailWasFocused.set(true);
  }

  onEmailBlur() {
    const emailControl = this.authForm.get('email') as FormControl;
    emailControl.markAsTouched({ onlySelf: true });

    this.updateEmailError(
      emailControl,
      this.isEmailError,
      this.emailErrorMessage,
      this.emailWasFocused
    );
  }

  onResetEmailFocus() {
    this.resetEmailWasFocused.set(true);
  }

  onResetEmailBlur() {
    const emailControl = this.resetPasswordForm.get('email') as FormControl;
    emailControl.markAsTouched({ onlySelf: true });

    this.updateEmailError(
      emailControl,
      this.isResetEmailError,
      this.resetEmailErrorMessage,
      this.resetEmailWasFocused
    );
  }

  togglePasswordVisibility() {
    this.isPasswordVisibility = !this.isPasswordVisibility
  }

  getPasswordError(): boolean {
    const passwordControl = this.authForm.get('password');
    return !!(passwordControl?.invalid && passwordControl?.touched);
  }

  openResetModal() {
    this.isModalOpen = true;
  }

  handleModalAction(action: ModalAction) {

    if (action == 'confirm') {
      this.sendResetLink();
    } else {
      this.closeResetPasswordForm();
      return;
    }
  }

  private sendResetLink() {
    const emailControl = this.resetPasswordForm.get('email') as FormControl;

    this.updateEmailError(
      emailControl,
      this.isResetEmailError,
      this.resetEmailErrorMessage,
      this.resetEmailWasFocused
    );

    if (!this.resetPasswordForm.valid) return;

    sendPasswordResetEmail(this.auth, emailControl.value)
      .then(() => {
        this.resetEmailErrorMessage.set('');
        this.isSuccessToastOpen.set(true);
      })
      .catch((error) => {
        this.isErrorToastOpen.set(true);
        this.resetEmailErrorMessage.set('Произошла ошибка. Попробуйте еще раз');
      })
      .finally(() => {
        this.closeResetPasswordForm();
      });
  }

  closeResetPasswordForm() {
    this.isModalOpen = false;
    this.resetPasswordForm.get('email')?.reset();
    this.isResetEmailError.set(false);
    this.resetEmailErrorMessage.set('');
    this.resetEmailWasFocused.set(false);
  }

  onSuccessToastClosed() {
    this.isSuccessToastOpen.set(false);
  }

  onErrorToastClosed() {
    this.isErrorToastOpen.set(false);
  }

  get email() {
    return this.authForm.get('email');
  }

  get password() {
    return this.authForm.get('password');
  }
}