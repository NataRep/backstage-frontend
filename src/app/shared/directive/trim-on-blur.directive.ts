import { Directive, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTrimOnBlur]',
  standalone: true,
})
export class TrimOnBlurDirective {
  private ngControl = inject(NgControl, { optional: true });

  @HostListener('blur')
  onBlur(): void {
    const control = this.ngControl?.control;
    const value = control?.value;

    if (control && typeof value === 'string') {
      const trimmedValue = value.trim();

      if (trimmedValue !== value) {
        control.setValue(trimmedValue, {
          emitEvent: true,
          emitModelToViewChange: true
        });
      }
    }
  }
}