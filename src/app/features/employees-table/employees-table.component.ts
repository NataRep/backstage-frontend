import { Component, computed, DestroyRef, effect, inject, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Role } from '../../core/models/enums/employee.enums';
import { EmployeeProfile, WorkerBase } from '../../core/models/interfaces/employee.models';
import { Person } from '../../core/models/interfaces/person.model';
import { selectAuthUser, selectCanEdit } from '../../core/store/auth/auth.selectors';
import { deleteEmployeeAction, deleteEmployeeSuccessAction, getAllEmployeesAction, updateEmployeeAction, updateEmployeeFailureAction, updateEmployeeSuccessAction } from '../../core/store/employees/employees.actions';
import { selectAllEmployees, selectEmployeesLoading } from '../../core/store/employees/employees.selector';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../shared/components/modal-container/modal-container.component';
import { ModalAction } from '../../shared/components/modal-container/modal.model';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { GetSocialLinkPipe } from '../../shared/pipes/get-social-link.pipe';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { EmployeeInfoComponent } from '../employee-info/employee-info.component';

@Component({
  selector: 'app-employees-table',
  standalone: true,
  imports: [IconComponent,
    ModalContainerComponent,
    EmployeeFormComponent,
    GetSocialLinkPipe,
    EmployeeInfoComponent,
    ToastComponent],
  templateUrl: './employees-table.component.html',
  styleUrl: './employees-table.component.scss'
})
export class EmployeesTableComponent {
  @ViewChild('employeeForm') employeeForm!: EmployeeFormComponent;

  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private actions = inject(Actions);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly roles: Role[] = Object.values(Role);

  allEmployees = this.store.selectSignal(selectAllEmployees);
  isLoading = this.store.selectSignal(selectEmployeesLoading);
  currentUser = this.store.selectSignal(selectAuthUser);
  canEdit = this.store.selectSignal(selectCanEdit);
  selectedEmployee = signal<EmployeeProfile | null>(null);

  searchQuery = signal(this.route.snapshot.queryParamMap.get('search') || '');
  selectedRole = signal<Role | 'all'>((this.route.snapshot.queryParamMap.get('role') as Role) || 'all');

  //модалки
  isEditModalOpen = signal(false);
  isInfoModalOpen = signal(false);
  isCreateNewModalOpen = signal(false);
  isConfirmDeleteModalOpen = signal(false)

  //тосты TODO вынести в сервис
  isSuccessToastOpen = signal(false);
  isErrorToastOpen = signal(false);
  successToastMessage = "Данные сохранены";
  errorToastMessage = "Что-то пошло не так. Попробуйте еще раз.";

  //пагинация
  pageSize = signal(5);
  currentPage = signal(Number(this.route.snapshot.queryParamMap.get('page')) || 1);

  totalPages = computed(() => {
    const count = this.filteredEmployees().length;
    return Math.ceil(count / this.pageSize());
  });
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  paginatedEmployees = computed(() => {
    const list = this.filteredEmployees();
    const total = this.totalPages();
    let current = this.currentPage();
    if (current > total && total > 0) {
      current = 1;
    }

    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();

    return this.filteredEmployees().slice(startIndex, endIndex);
  });

  constructor() {
    this.initToastSubscriptions()
    this.initModalsSubscriptions()

    effect(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: this.currentPage(),
          search: this.searchQuery() || null,
          role: this.selectedRole() === 'all' ? null : this.selectedRole()
        },
        queryParamsHandling: 'merge',
      });
    });
  }

  ngOnInit() {
    if (this.allEmployees().length === 0 && !this.isLoading()) {
      this.store.dispatch(getAllEmployeesAction());
    }
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

  private initToastSubscriptions() {
    this.actions.pipe(
      ofType(updateEmployeeSuccessAction),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isSuccessToastOpen.set(true);
    });

    this.actions.pipe(
      ofType(updateEmployeeFailureAction),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isErrorToastOpen.set(true);
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

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

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

  onSuccessToastClosed() {
    this.isSuccessToastOpen.set(false);
  }

  onErrorToastClosed() {
    this.isErrorToastOpen.set(false);
  }

  increasePage() {
    this.currentPage.update((p) => p + 1)
  }

  reducePage() {
    this.currentPage.update((p) => p - 1)
  }
}
