import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTrimOnBlur]',
  standalone: true,
})
export class TrimOnBlurDirective {
  private el = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl, { optional: true });

  @HostListener('blur')
  onBlur(): void {
    const control = this.ngControl?.control;

    if (control) {
      const value = control.value;
      if (typeof value === 'string') {
        control.setValue(value.trim());
      }
    } else {
      const nativeElement = this.el.nativeElement;
      const value = nativeElement.value;

      if (value) {
        nativeElement.value = value.trim();
        nativeElement.dispatchEvent(new Event('input'));
      }
    }
  }
}