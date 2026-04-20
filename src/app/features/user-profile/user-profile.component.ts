import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { WorkerBase } from '../../core/models/interfaces/employee.models';
import { PersonBase } from '../../core/models/interfaces/person.model';
import { selectAuthUser } from '../../core/store/auth/auth.selectors';
import { updateEmployeeAction } from '../../core/store/employees/employees.actions';
import { selectEmployeesError, selectEmployeesLoading } from '../../core/store/employees/employees.selector';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../shared/components/modal-container/modal-container.component';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { EmployeeInfoComponent } from '../employee-info/employee-info.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    EmployeeInfoComponent,
    EmployeeFormComponent,
    ModalContainerComponent,
    ResetPasswordComponent,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private queryParamMap = toSignal(this.route.queryParamMap);
  currentUser = this.store.selectSignal(selectAuthUser);
  loading = this.store.selectSignal(selectEmployeesLoading);
  error = this.store.selectSignal(selectEmployeesError);
  isPasswordModalOpen = signal(false);

  isEditMode = computed(() => {
    return this.queryParamMap()?.get('edit') === 'true';
  });

  toggleEditMode() {
    const next = !this.isEditMode();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: next ? { edit: 'true' } : { edit: null },
      queryParamsHandling: 'merge',
    });
  }

  updateUser(data: { person: PersonBase; worker: WorkerBase }) {
    const user = this.currentUser();
    const personId = user?.person?.personId;

    if (personId) {
      this.store.dispatch(updateEmployeeAction({
        personId,
        person: { ...data.person },
        worker: { ...data.worker }
      }));
    }
  }

  openPasswordModal() {
    this.isPasswordModalOpen.set(true)
  }

  handleUpdatePasswordAction() {
    this.isPasswordModalOpen.set(false);
  }

}
