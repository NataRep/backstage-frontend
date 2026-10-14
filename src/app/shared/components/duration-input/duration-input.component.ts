import { Component, forwardRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { IconComponent } from '../icons/icons.component';

@Component({
  selector: 'app-duration-input',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './duration-input.component.html',
  styleUrl: './duration-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DurationInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DurationInputComponent),
      multi: true,
    },
  ],
})
export class DurationInputComponent implements ControlValueAccessor, Validator {
  private fb = inject(FormBuilder);

  // Внутренняя форма для минут и секунд
  form = this.fb.group({
    minutes: ['', [Validators.pattern(/^\d*$/)]],
    seconds: ['', [Validators.pattern(/^\d*$/)]],
  });

  // Локальные состояния на сигналах
  disabled = signal(false);
  showWarning = signal(false);

  private onChange: (value: number | null) => void = () => { };
  private onTouched: () => void = () => { };

  constructor() {
    // Подписка на изменения формы с автоматической отпиской через takeUntilDestroyed
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const totalSeconds = this.calculateTotalSeconds();
        this.onChange(totalSeconds);
      });
  }

  // Запись значения из родительской формы (приходит в секундах)
  writeValue(value: number | null): void {
    if (value === null || value === undefined || value <= 0) {
      this.form.setValue({ minutes: '', seconds: '' }, { emitEvent: false });
      return;
    }

    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    this.form.setValue(
      {
        minutes: minutes > 0 ? String(minutes) : '',
        seconds: seconds > 0 ? String(seconds).padStart(2, '0') : '',
      },
      { emitEvent: false }
    );
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  // Валидация: проверяем, что секунды находятся в диапазоне 0–59
  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value && control.value !== 0) {
      return null;
    }

    const secVal = this.form.get('seconds')?.value;
    const secondsNum = Number(secVal);

    if (secVal && (Number.isNaN(secondsNum) || secondsNum > 59 || secondsNum < 0)) {
      return {
        invalidDuration: true,
      };
    }

    return null;
  }

  onBlur(): void {
    const secVal = this.form.get('seconds')?.value;
    if (secVal && secVal.length === 1) {
      this.form.patchValue({ seconds: secVal.padStart(2, '0') }, { emitEvent: false });
    }
    this.onTouched();
  }

  private calculateTotalSeconds(): number | null {
    const minVal = this.form.get('minutes')?.value;
    const secVal = this.form.get('seconds')?.value;

    if (!minVal && !secVal) {
      return null;
    }

    const minutes = minVal ? Number(minVal) : 0;
    const seconds = secVal ? Number(secVal) : 0;

    if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
      return null;
    }

    return minutes * 60 + seconds;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/\d/.test(event.key)) {
      event.preventDefault();
      this.showWarning.set(true);
      return;
    }

    this.showWarning.set(false);
  }
}