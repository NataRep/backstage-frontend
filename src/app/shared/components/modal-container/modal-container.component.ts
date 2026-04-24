import { ChangeDetectionStrategy, Component, Input, model, output } from '@angular/core';
import { IconComponent } from '../icons/icons.component';
import { ModalAction, ModalActionButton, ModalSize, ModalType } from './modal.model';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './modal-container.component.html',
  styleUrl: './modal-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalContainerComponent {
  @Input() size: ModalSize = 'medium';
  @Input() type: ModalType = 'default';
  @Input() actionButton: ModalActionButton | null = null;

  action = output<ModalAction>();
  isOpen = model(false);

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.action.emit('close');
    this.isOpen.set(false);
  }

  onConfirm() {
    this.action.emit('confirm');
  }

  onCancel() {
    this.action.emit('cancel');
    this.close();
  }
}
