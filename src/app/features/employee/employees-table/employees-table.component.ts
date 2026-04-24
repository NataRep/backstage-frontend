import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Input, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Role } from '../../../core/models/enums/employee.enums';
import { EmployeeProfile, WorkerBase } from '../../../core/models/interfaces/employee.models';
import { Person } from '../../../core/models/interfaces/person.model';
import { selectAuthUser, selectCanEdit } from '../../../core/store/auth/auth.selectors';
import { deleteEmployeeAction, deleteEmployeeSuccessAction, getAllActiveEmployeesAction, getAllEmployeesAction, updateEmployeeAction, updateEmployeeSuccessAction } from '../../../core/store/employees/employees.actions';
import { selectAllEmployees, selectEmployeesLoading } from '../../../core/store/employees/employees.selector';
import { BaseTableDirective } from '../../../shared/components/data-table/base-table.directive';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { IconComponent } from '../../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../../shared/components/modal-container/modal-container.component';
import { ModalAction } from '../../../shared/components/modal-container/modal.model';
import { ROLE_RU } from '../../../shared/constants/texts/common.texts';
import { GetSocialLinkPipe } from '../../../shared/pipes/get-social-link.pipe';
import { UppercaseFirstLetter } from '../../../shared/pipes/uppercase-first-letter.pipe';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { EmployeeInfoComponent } from '../employee-info/employee-info.component';

export type EmployeesViewMode =
  | 'all'
  | 'active';

@Component({
  selector: 'app-employees-table',
  standalone: true,
  imports: [IconComponent,
    ModalContainerComponent,
    EmployeeFormComponent,
    EmployeeInfoComponent,
    DataTableComponent,
    GetSocialLinkPipe,
    UppercaseFirstLetter],
  templateUrl: './employees-table.component.html',
  styleUrl: './employees-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesTableComponent extends BaseTableDirective<EmployeeProfile> {
  @Input() mode: EmployeesViewMode = 'all';
  // 1. ViewChild (ссылки на DOM/Компоненты)
  @ViewChild('employeeForm') employeeForm!: EmployeeFormComponent;

  // 2. Dependency Injection
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(Store);
  private readonly actions = inject(Actions);

  // 3. BaseTableDirective Overrides
  protected override sourceData = () => this.filteredEmployees();
  override pageSize = () => 10;
  protected override isTableLocked = () => false;

  // 4. Static / Constant Data
  readonly roles: Role[] = Object.values(Role);
  readonly rolesTranslate = ROLE_RU;

  // 5. Store Selectors (Signals)
  readonly allEmployees = this.store.selectSignal(selectAllEmployees);
  readonly isLoading = this.store.selectSignal(selectEmployeesLoading);
  readonly currentUser = this.store.selectSignal(selectAuthUser);
  readonly canEdit = this.store.selectSignal(selectCanEdit);

  // 6. Local State (Signals)
  selectedEmployee = signal<EmployeeProfile | null>(null);
  selectedRole = signal<Role | 'all'>((this.route.snapshot.queryParamMap.get('role') as Role) || 'all');

  // Модальные окна (UI State)
  isEditModalOpen = signal(false);
  isInfoModalOpen = signal(false);
  isCreateNewModalOpen = signal(false);
  isConfirmDeleteModalOpen = signal(false);

  // 7. Computed Properties
  readonly filteredEmployees = computed(() => {
    const list = this.allEmployees();
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.selectedRole();

    if (list.length === 0) return [];

    const filtered = list.filter(emp => {
      const fullName = emp.person?.fullName.toLowerCase() || '';
      const matchesName = !query || fullName.split(" ").some(word => word.startsWith(query));
      const matchesRole = role === 'all' ||
        emp.worker?.roles?.some(r => String(r).toLowerCase() === String(role).toLowerCase());

      return matchesName && matchesRole;
    });

    return filtered.sort((a, b) =>
      (a.person?.fullName || '').localeCompare(b.person?.fullName || '')
    );
  });

  // 8. Lifecycle Hooks
  override ngOnInit() {
    super.ngOnInit();
    if (this.allEmployees().length === 0 && !this.isLoading()) {
      this.loadEmployees();
    }
    this.initModalsSubscriptions();
  }

  // 9. API & Store Actions (Бизнес-логика)
  private loadEmployees() {
    switch (this.mode) {
      case 'all':
        this.store.dispatch(getAllEmployeesAction());
        break;

      case 'active':
        this.store.dispatch(getAllActiveEmployeesAction());
        break;

      default:
        this.store.dispatch(getAllEmployeesAction());
    }
  };

  updateSelectedEmployee(data: { person: Person; worker: WorkerBase }) {
    const selectedEmployee = this.selectedEmployee();
    const personId = selectedEmployee?.person?.personId

    if (!selectedEmployee || !personId) return;

    this.store.dispatch(updateEmployeeAction({
      personId,
      person: { ...data.person },
      worker: { ...data.worker }
    }));
  }

  deleteSelectedEmployee() {
    const personId = this.selectedEmployee()?.person?.personId;
    if (!personId) return;

    this.store.dispatch(deleteEmployeeAction({ personId }));
  }

  handleDeleteAction(actionType: ModalAction) {
    if (actionType === 'confirm') {
      this.deleteSelectedEmployee();
    }
  }

  // 10. Modal Management (Управление UI)
  openEditModal(employee: EmployeeProfile) {
    this.selectedEmployee.set(employee);
    this.isEditModalOpen.set(true);
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.selectedEmployee.set(null);
  }

  openConfirmDeleteModal(employee: EmployeeProfile) {
    this.selectedEmployee.set(employee);
    this.isConfirmDeleteModalOpen.set(true);
  }

  closeConfirmDeleteModal() {
    this.isConfirmDeleteModalOpen.set(false);
    this.selectedEmployee.set(null);
  }

  showEmployeeInfo(employee: EmployeeProfile) {
    this.selectedEmployee.set(employee);
    this.isInfoModalOpen.set(true);
  }

  // 11. Private Helpers & Subscriptions
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

  protected override getExtraParams() {
    return { role: this.selectedRole() };
  }
}