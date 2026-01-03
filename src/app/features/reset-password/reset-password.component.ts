import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from '@angular/fire/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { confirmPasswordReset } from 'firebase/auth';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { passwordsMatchGroupValidator, passwordsMatchValidator, passwordValidator } from './reset-password.validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, ToastComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  oobCode = "";

  isPasswordVisibility = signal(false);
  isPasswordError = signal(false);
  passwordErrorMessage = signal('');
  passwordWasFocused = signal(false);

  isSuccessToastOpen = signal(false);
  isErrorToastOpen = signal(false);
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

  reset() {
    this.form.markAllAsTouched();
    this.updatePasswordError();
    const newPassword = this.passwordControl?.value;

    if (this.form.invalid || !this.oobCode || !newPassword) {
      return;
    }

    confirmPasswordReset(this.auth, this.oobCode, newPassword)
      .then(() => {
        this.isSuccessToastOpen.set(true);
        setTimeout(() => this.router.navigate(['/login']), 4000)
      })
      .catch(error => {
        this.isErrorToastOpen.set(true);
        setTimeout(() => this.router.navigate(['/login']), 5000)
      });
  }

  togglePasswordVisibility() {
    this.isPasswordVisibility.update(v => !v);
  }

  onSuccessToastClosed() {
    this.isSuccessToastOpen.set(false);
  }

  onErrorToastClosed() {
    this.isErrorToastOpen.set(true);
  }

  get passwordControl() {
    return this.form.get('password');
  }

  get repeatControl() {
    return this.form.get('repeat');
  }
}
