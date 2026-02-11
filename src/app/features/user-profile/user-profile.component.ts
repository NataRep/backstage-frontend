import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EmployeeBase } from '../../core/models/interfaces/employee.models';
import { PersonBase } from '../../core/models/interfaces/person.model';
import { selectAuthUser } from '../../core/store/auth/auth.selectors';
import { updateEmployeeAction, updateEmployeeFailureAction, updateEmployeeSuccessAction } from '../../core/store/employees/employees.actions';
import { selectEmployeesError, selectEmployeesLoading } from '../../core/store/employees/employees.selector';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../shared/components/modal-container/modal-container.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
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
    ToastComponent,
    ModalContainerComponent,
    ResetPasswordComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private actions$ = inject(Actions);
  private queryParamMap = toSignal(this.route.queryParamMap);
  currentUser = this.store.selectSignal(selectAuthUser);

  loading = this.store.selectSignal(selectEmployeesLoading);
  error = this.store.selectSignal(selectEmployeesError);

  isSuccessToastOpen = signal(false);
  isErrorToastOpen = signal(false);
  successToastMessage = "Данные сохранены";
  errorToastMessage = "Что-то пошло не так. Попробуйте сохранить изменения еще раз.";

  isPasswordModalOpen = signal(false);

  isEditMode = computed(() => {
    console.log("currentUser", this.currentUser())
    return this.queryParamMap()?.get('edit') === 'true';
  });

  constructor() {
    this.initToastSubscriptions()
  }

  private initToastSubscriptions() {
    this.actions$.pipe(
      ofType(updateEmployeeSuccessAction),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isSuccessToastOpen.set(true);
      this.toggleEditMode();
    });

    this.actions$.pipe(
      ofType(updateEmployeeFailureAction),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isErrorToastOpen.set(true);
    });
  }


  toggleEditMode() {
    const next = !this.isEditMode();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: next ? { edit: 'true' } : { edit: null },
      queryParamsHandling: 'merge',
    });
  }

  updateUser(data: { personal: PersonBase; employment: EmployeeBase }) {
    console.log("this.currentUser()", this.currentUser());
    console.log("this.currentUser()?.personal?.personId", this.currentUser()?.personal?.personId);

    this.store.dispatch(updateEmployeeAction({

      personId: this.currentUser()?.personal?.personId!,
      personal: {
        ...data.personal,
      },
      employment: {
        ...data.employment
      }
    }))
  }

  openPasswordModal() {
    this.isPasswordModalOpen.set(true)
  }


  handleUpdatePasswordAction() {
    this.isPasswordModalOpen.set(false);
  }

}
