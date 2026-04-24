import { ContentChild, Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumberStepper]',
  standalone: true,
  exportAs: 'stepper' // Позволяет обращаться к директиве через #stepper="stepper"
})
export class NumberStepperDirective {
  // Находим инпут внутри элемента, на который повешена директива
  @ContentChild('numInput', { static: true }) inputElement!: ElementRef<HTMLInputElement>;

  // Внедряем NgControl, чтобы работать с Reactive Forms или NgModel
  private ngControl = inject(NgControl, { optional: true, self: false });

  increment() {
    this.step(1);
  }

  decrement() {
    this.step(-1);
  }

  private step(delta: number) {
    const input = this.inputElement.nativeElement;

    if (delta > 0) {
      input.stepUp();
    } else {
      input.stepDown();
    }

    const newValue = Number(input.value);

    // Если используется Reactive Forms, обновляем контрол
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(newValue);
      this.ngControl.control.markAsTouched();
      this.ngControl.control.markAsDirty();
    }
  }

  // Вспомогательные геттеры для блокировки кнопок
  get isMax(): boolean {
    const input = this.inputElement?.nativeElement;
    return input ? Number(input.value) >= Number(input.max || Infinity) : false;
  }

  get isMin(): boolean {
    const input = this.inputElement?.nativeElement;
    return input ? Number(input.value) <= Number(input.min || -Infinity) : false;
  }
}