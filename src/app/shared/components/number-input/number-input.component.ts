import { Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { IconComponent } from "../icons/icons.component";


@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true
    }
  ],
  templateUrl: './number-input.component.html',
  styleUrl: './number-input.component.scss'
})
export class NumberInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() min = 0;
  @Input() max = 999;

  value = 0;
  isDisabled = false;

  private onChange: (value: number) => void = () => { /* Заглушка для Angular */ };
  private onTouched: () => void = () => { /* Заглушка для Angular */ };

  increment() {
    if (this.value < this.max) {
      this.updateValue(this.value + 1);
    }
  }

  decrement() {
    if (this.value > this.min) {
      this.updateValue(this.value - 1);
    }
  }

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).valueAsNumber;
    this.updateValue(isNaN(val) ? this.min : val);
  }

  // Метод обновления значения
  private updateValue(val: number): void {
    this.value = val;
    this.onChange(this.value);
    this.onTouched();
  }

  // Методы ControlValueAccessor с правильными типами
  writeValue(val: number | null): void {
    this.value = val ?? 0;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
  }
}