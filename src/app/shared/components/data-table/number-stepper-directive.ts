import { ContentChild, Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumberStepper]',
  standalone: true,
  exportAs: 'stepper' // Позволяет обращаться к директиве через #stepper="stepper"
})
export class NumberStepperDirective {
  @ContentChild('numInput', { static: true }) inputElement!: ElementRef<HTMLInputElement>;

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

    if (this.ngControl?.control) {
      this.ngControl.control.setValue(newValue);
      this.ngControl.control.markAsTouched();
      this.ngControl.control.markAsDirty();
    }
  }

  get isMax(): boolean {
    const input = this.inputElement?.nativeElement;
    return input ? Number(input.value) >= Number(input.max || Infinity) : false;
  }

  get isMin(): boolean {
    const input = this.inputElement?.nativeElement;
    return input ? Number(input.value) <= Number(input.min || -Infinity) : false;
  }
}