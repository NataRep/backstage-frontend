import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../core/store/auth/auth.selectors';
import { IconComponent } from "../../shared/components/icons/icons.component";
import { EmployerInfoComponent } from '../emploeer-info/employer-info.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, EmployerInfoComponent, IconComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent {
  private store = inject(Store);
  isEditMode = false;
  currentUser = this.store.selectSignal(selectAuthUser);

  toggleEditMode() {
    this.isEditMode = !this.isEditMode
  }
}
