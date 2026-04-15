import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import { ToastPosition, ToastType } from '../../../core/services/toasts.service';
import { IconComponent } from '../icons/icons.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  @Input() message = 'Текст сообщения';
  @Input() type: ToastType = 'success';
  @Input() position: ToastPosition = 'top-right';
}
