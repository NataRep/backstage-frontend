import { Component, computed, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Role } from '../../core/models/enums/employee.enums';
import { EmployeeProfile, WorkerBase } from '../../core/models/interfaces/employee.models';
import { Person } from '../../core/models/interfaces/person.model';
import { selectAuthUser } from '../../core/store/auth/auth.selectors';
import { getAllEmployeesAction, updateEmployeeAction, updateEmployeeSuccessAction } from '../../core/store/employees/employees.actions';
import { selectAllEmployees, selectEmployeesLoading } from '../../core/store/employees/employees.selector';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../shared/components/modal-container/modal-container.component';
import { GetSocialLinkPipe } from '../../shared/pipes/get-social-link.pipe';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';

@Component({
  selector: 'app-employees-table',
  standalone: true,
  imports: [IconComponent,
    ModalContainerComponent,
    EmployeeFormComponent,
    GetSocialLinkPipe],
  templateUrl: './employees-table.component.html',
  styleUrl: './employees-table.component.scss'
})
export class EmployeesTableComponent {
  @ViewChild('employeeForm') employeeForm!: EmployeeFormComponent;

  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private actions = inject(Actions);
  readonly roles: Role[] = Object.values(Role);
  allEmployees = this.store.selectSignal(selectAllEmployees);
  isLoading = this.store.selectSignal(selectEmployeesLoading);
  currentUser = this.store.selectSignal(selectAuthUser);
  searchQuery = signal('');
  selectedRole = signal<Role | 'all'>('all');
  isEditModalOpen = signal(false);
  selectedEmployee = signal<EmployeeProfile | null>(null);

  ngOnInit() {
    if (this.allEmployees().length === 0 && !this.isLoading()) {
      this.store.dispatch(getAllEmployeesAction());
    }

    this.actions.pipe(
      ofType(updateEmployeeSuccessAction),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.employeeForm?.resetForm();
      this.closeEditModal();
    });
  }

  filteredEmployees = computed(() => {
    const list = this.allEmployees();
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.selectedRole();

    return list.filter(emp => {
      const matchesName = !query ||
        emp.person?.fullName.toLowerCase().includes(query)

      const matchesRole = role === 'all' ||
        emp.worker?.roles.includes(role);

      return matchesName && matchesRole;
    });
  });

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  openEditModal(employee: EmployeeProfile) {
    this.isEditModalOpen.set(true);
    this.selectedEmployee.set(employee);
  }

  openDeleteConfirmModal() {
    console.log("ddd")
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
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
}
