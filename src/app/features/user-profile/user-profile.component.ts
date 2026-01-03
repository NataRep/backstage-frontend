import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
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
