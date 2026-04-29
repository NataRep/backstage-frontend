import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NumberInputComponent } from '../../../../shared/components/number-input/number-input.component';

@Component({
  selector: 'app-show-form-roles',
  standalone: true,
  imports: [ReactiveFormsModule, NumberInputComponent],
  templateUrl: './show-form-roles.component.html',
  styleUrl: './show-form-roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowFormRolesComponent {
  @Input({ required: true }) rolesGroup!: FormGroup;
}