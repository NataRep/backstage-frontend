import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value || '';

    const errors: ValidationErrors = {};

    // только латиница + цифры + спецсимволы
    if (!/^[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(value)) {
      errors['latinOnly'] = true;
    }

    // хотя бы 1 заглавная буква
    if (!/[A-Z]/.test(value)) {
      errors['uppercaseRequired'] = true;
    }

    // хотя бы 1 цифра
    if (!/\d/.test(value)) {
      errors['digitRequired'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  };
}

export function passwordsMatchValidator(passwordKey: string, repeatKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const formGroup = group as FormGroup;
    const password = formGroup.get(passwordKey)?.value;
    const repeatControl = formGroup.get(repeatKey);

    if (!repeatControl) return null;

    if (password !== repeatControl.value) {
      repeatControl.setErrors({ ...(repeatControl.errors ?? {}), passwordsMismatch: true });
    } else {
      if (repeatControl.errors) {
        const errors = { ...repeatControl.errors };
        delete errors['passwordsMismatch'];
        repeatControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    }

    return null;
  };
}


export function passwordsMatchGroupValidator(passwordKey: string, repeatKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const formGroup = group as FormGroup;
    const password = formGroup.get(passwordKey)?.value;
    const repeatControl = formGroup.get(repeatKey);

    if (!repeatControl) return null;

    if (password !== repeatControl.value) {
      repeatControl.setErrors({ ...(repeatControl.errors ?? {}), passwordsMismatch: true });
    } else {
      if (repeatControl.errors) {
        const errors = { ...repeatControl.errors };
        delete errors['passwordsMismatch'];
        repeatControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    }

    return null;
  };
}