import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { IconComponent } from '../icons/icons.component';

export type Toast = 'success' | 'error';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent implements OnChanges, OnDestroy {
  @Input() message: string = 'Текст сообщения';
  @Input() type: Toast = 'success';
  @Input() position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  @Input() autoCloseDuration?: number;
  @Input() isOpen = false;

  @Output() closed = new EventEmitter<void>();

  private timeoutId?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true && this.autoCloseDuration) {
      this.startAutoClose();
    }

    if (changes['isOpen']?.currentValue === false || changes['autoCloseDuration']) {
      this.clearTimeout();
    }
  }

  close() {
    console.log('close');
    this.clearTimeout();
    this.isOpen = false;
    this.closed.emit();
  }

  private startAutoClose(): void {
    if (this.autoCloseDuration && this.autoCloseDuration > 0) {
      this.clearTimeout();

      this.timeoutId = setTimeout(() => {
        this.close();
      }, this.autoCloseDuration);
    }
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  ngOnDestroy() {
    this.clearTimeout();
  }
}
