import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth, updatePassword } from '@angular/fire/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { confirmPasswordReset } from 'firebase/auth';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { ToastService } from '../../core/services/toasts.service';
import { logoutAction } from '../../core/store/auth/auth.actions';
import { selectAuthUser } from '../../core/store/auth/auth.selectors';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { passwordsMatchGroupValidator, passwordsMatchValidator, passwordValidator } from './reset-password.validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private toastService = inject(ToastService);
  oobCode = "";

  action = output();

  currentUser = this.store.selectSignal(selectAuthUser);
  isResetMode = computed(() => !!this.oobCode);
  isUpdateMode = computed(() => !!this.currentUser && !this.oobCode);

  isPasswordVisibility = signal(false);
  isPasswordError = signal(false);
  passwordErrorMessage = signal('');
  passwordWasFocused = signal(false);

  successToastMessage = "Пароль успешно изменен!";
  errorToastMessage = "Что-то пошло не так. Попробуйте запросить ссылку на сброс пароля повторно.";

  form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6), passwordValidator()]),
    repeat: new FormControl('', [Validators.required, passwordsMatchValidator('password', 'repeat')],),
  },
    {
      validators: passwordsMatchGroupValidator('password', 'repeat')
    });

  ngOnInit() {
    this.initPasswordInput();
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'];
    });
  }

  initPasswordInput() {
    const passwordControl = this.passwordControl as FormControl;

    passwordControl.valueChanges.pipe(
      tap(() => {
        this.isPasswordError.set(false);
        this.passwordErrorMessage.set('');
      }),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => {
        passwordControl.markAsTouched({ onlySelf: true });
        this.updatePasswordError();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private updatePasswordError() {
    const passwordControl = this.passwordControl as FormControl;
    const shouldShowError =
      passwordControl?.invalid && (passwordControl.touched);

    this.isPasswordError.set(shouldShowError);

    if (shouldShowError && passwordControl.errors) {
      if (passwordControl.errors['required']) {
        this.passwordErrorMessage.set('Введите новый пароль');
      } else if (passwordControl.errors['latinOnly']) {
        this.passwordErrorMessage.set('Разрешены только латинский буквы, цифры и символы');
      } else if (passwordControl.errors['uppercaseRequired'] && !passwordControl.errors['digitRequired']) {
        this.passwordErrorMessage.set('Добавьте заглавные буквы');
      } else if (passwordControl.errors['digitRequired'] && !passwordControl.errors['uppercaseRequired']) {
        this.passwordErrorMessage.set('Добавьте цифру');
      }
      else if (passwordControl.errors['digitRequired'] && passwordControl.errors['uppercaseRequired']) {
        this.passwordErrorMessage.set('Добавьте цифры и заглавные буквы');
      }
    } else {
      this.passwordErrorMessage.set('');
    }
  }

  saveNewPassword() {
    this.form.markAllAsTouched();
    this.updatePasswordError();

    const newPassword = this.passwordControl?.value;

    if (this.form.invalid || !newPassword) return;

    if (this.isResetMode()) {
      // СЦЕНАРИЙ 1: Сброс через почту (нужен oobCode)
      this.handleConfirmReset(newPassword);
    } else if (this.isUpdateMode()) {
      // СЦЕНАРИЙ 2: Прямое обновление в ЛК (нужна свежая сессия)
      this.handleUpdatePassword(newPassword);
    }
  }

  private handleConfirmReset(password: string) {
    confirmPasswordReset(this.auth, this.oobCode, password)
      .then(() => this.handleSuccess())
      .catch(error => this.handleError(error));
  }

  private handleUpdatePassword(password: string) {
    if (!this.auth.currentUser) return;

    updatePassword(this.auth.currentUser, password)
      .then(() => this.handleSuccess())
      .catch(error => {
        this.handleError(error);
      });
  }

  private handleSuccess() {
    this.toastService.show(this.successToastMessage, 'success', 'top-right');
    this.form.reset();
    const target = this.isResetMode() ? '/login' : '/profile';
    this.action.emit();
    setTimeout(() => this.router.navigate([target]), 3000);
  }

  private handleError(error: unknown) {
    const err = error as { code?: string; message?: string };

    // 1. Ошибка безопасности: нужно залогиниться заново
    if (err.code === 'auth/requires-recent-login' || err.code === 'auth/user-token-expired') {
      this.errorToastMessage = "Для безопасности нужно перезайти в систему перед сменой пароля.";

      setTimeout(() => {
        this.action.emit();
        this.store.dispatch(logoutAction());
      }, 3000);
      return;
    }

    // 2. Ошибка ссылки (если это ResetMode)
    if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
      this.errorToastMessage = "Ссылка устарела или уже была использована. Запросите новую.";

      setTimeout(() => {
        this.action.emit();
        this.router.navigate(['/login']);
      }, 3000);
      return;
    }

    // 3. Все остальные ошибки
    this.errorToastMessage = "Ошибка: " + (err.message || "Попробуйте позже");
    this.toastService.show(this.errorToastMessage, 'warning', 'center');
  }

  togglePasswordVisibility() {
    this.isPasswordVisibility.update(v => !v);
  }

  get passwordControl() {
    return this.form.get('password');
  }

  get repeatControl() {
    return this.form.get('repeat');
  }
}
