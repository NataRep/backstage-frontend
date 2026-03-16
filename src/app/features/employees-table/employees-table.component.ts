import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Role } from '../../core/models/enums/employee.enums';
import { EmployeeProfile, WorkerBase } from '../../core/models/interfaces/employee.models';
import { Person } from '../../core/models/interfaces/person.model';
import { selectAuthUser, selectCanEdit } from '../../core/store/auth/auth.selectors';
import { deleteEmployeeAction, deleteEmployeeSuccessAction, getAllEmployeesAction, updateEmployeeAction, updateEmployeeSuccessAction } from '../../core/store/employees/employees.actions';
import { selectAllEmployees, selectEmployeesLoading } from '../../core/store/employees/employees.selector';
import { BaseTableDirective } from '../../shared/components/data-table/base-table.directive';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../shared/components/modal-container/modal-container.component';
import { ModalAction } from '../../shared/components/modal-container/modal.model';
import { ROLE_RU } from '../../shared/constants/texts/common.texts';
import { GetSocialLinkPipe } from '../../shared/pipes/get-social-link.pipe';
import { RoleTranslatePipe } from '../../shared/pipes/translateRole';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { EmployeeInfoComponent } from '../employee-info/employee-info.component';

@Component({
  selector: 'app-employees-table',
  standalone: true,
  imports: [IconComponent,
    ModalContainerComponent,
    EmployeeFormComponent,
    EmployeeInfoComponent,
    DataTableComponent,
    RoleTranslatePipe,
    GetSocialLinkPipe],
  templateUrl: './employees-table.component.html',
  styleUrl: './employees-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesTableComponent extends BaseTableDirective<EmployeeProfile> {
  @ViewChild('employeeForm') employeeForm!: EmployeeFormComponent;

  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private actions = inject(Actions);
  protected override sourceData = () => this.filteredEmployees();
  override pageSize = () => 14;

  protected override getExtraParams() {
    return { role: this.selectedRole() };
  }

  readonly roles: Role[] = Object.values(Role);
  readonly rolesTranslate = ROLE_RU;

  allEmployees = this.store.selectSignal(selectAllEmployees);
  isLoading = this.store.selectSignal(selectEmployeesLoading);
  currentUser = this.store.selectSignal(selectAuthUser);
  canEdit = this.store.selectSignal(selectCanEdit);
  selectedEmployee = signal<EmployeeProfile | null>(null);
  selectedRole = signal<Role | 'all'>((this.route.snapshot.queryParamMap.get('role') as Role) || 'all');

  //модалки
  isEditModalOpen = signal(false);
  isInfoModalOpen = signal(false);
  isCreateNewModalOpen = signal(false);
  isConfirmDeleteModalOpen = signal(false)

  override ngOnInit() {
    super.ngOnInit();
    if (this.allEmployees().length === 0 && !this.isLoading()) {
      this.store.dispatch(getAllEmployeesAction());
    }

    this.initModalsSubscriptions();
  }

  private initModalsSubscriptions() {
    this.actions.pipe(
      ofType(updateEmployeeSuccessAction),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.employeeForm?.resetForm();
      this.closeEditModal();
    });

    this.actions.pipe(
      ofType(deleteEmployeeSuccessAction),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.closeConfirmDeleteModal();
    });
  }

  filteredEmployees = computed(() => {
    const list = this.allEmployees();
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.selectedRole();

    if (list.length === 0) return [];

    const filtered = list.filter(emp => {
      const fullName = emp.person?.fullName.toLowerCase() || '';

      const matchesName = !query || fullName
        .split(" ")
        .some(word => word.startsWith(query));

      const matchesRole = role === 'all' ||
        emp.worker?.roles?.some(r => String(r).toLowerCase() === String(role).toLowerCase());

      return matchesName && matchesRole;
    });

    return filtered.sort((a, b) =>
      (a.person?.fullName || '').localeCompare(b.person?.fullName || '')
    );
  });

  openEditModal(employee: EmployeeProfile) {
    this.isEditModalOpen.set(true);
    this.selectedEmployee.set(employee);
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.selectedEmployee.set(null);
  }

  openConfirmDeleteModal(employee: EmployeeProfile) {
    this.isConfirmDeleteModalOpen.set(true);
    this.selectedEmployee.set(employee);
  }

  closeConfirmDeleteModal() {
    this.isConfirmDeleteModalOpen.set(false);
    this.selectedEmployee.set(null);
  }

  updateSelectedEmployee(data: { person: Person; worker: WorkerBase }) {
    const selectedEmployee = this.selectedEmployee();

    if (!selectedEmployee) return;

    this.store.dispatch(updateEmployeeAction({
      personId: selectedEmployee.person?.personId!,
      person: { ...data.person },
      worker: { ...data.worker }
    }))
  }

  handleDeleteAction(actionType: ModalAction) {
    if (actionType === 'confirm') {
      this.deleteSelectedEmployee();
    }
  }

  deleteSelectedEmployee() {
    const selectedEmployee = this.selectedEmployee();
    const personId = selectedEmployee?.person?.personId
    if (!personId) return;

    this.store.dispatch(deleteEmployeeAction({ personId }));
  }

  showEmployeeInfo(employee: EmployeeProfile) {
    this.selectedEmployee.set(employee)
    this.isInfoModalOpen.set(true);
  }
}
