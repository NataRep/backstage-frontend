import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Role } from '../../core/models/enums/employee.enums';
import { EmployeeProfile, WorkerBase } from '../../core/models/interfaces/employee.models';
import { Person, PersonBase } from '../../core/models/interfaces/person.model';
import { createEmployeeAction, createEmployeeSuccessAction, getAllEmployeesAction } from '../../core/store/employees/employees.actions';
import { selectAllEmployees, selectEmployeesLoading } from '../../core/store/employees/employees.selector';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../shared/components/modal-container/modal-container.component';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule,
    IconComponent,
    ModalContainerComponent,
    EmployeeFormComponent],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements OnInit {
  // Таблица сотрудников
  //1. запрашиваем список всех работников с бека - диспатч экшена
  // 2. из стора берем список работников
  // 3. отображаем список на странице
  // 4. для отображения большого списка используем 

  // Кнопка Добавить нового
  // 1. по клику открываю форму в модалке
  // 2. отправляю данные нового работника - диспатч экшена
  // 3. в сторе в случае успеха добавляю нового работника в список

  // Фильтры по Роли - Фильтрация через Computed Signal
  // Поиск по имени - Фильтрация через Computed Signal
  @ViewChild('employeeForm') employeeForm!: EmployeeFormComponent;

  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private actions = inject(Actions);
  allEmployees = this.store.selectSignal(selectAllEmployees);
  isLoading = this.store.selectSignal(selectEmployeesLoading);
  searchQuery = signal('');
  selectedRole = signal<Role | 'all'>('all');
  isCreateNewModalOpen = signal(false);
  isEditModalOpen = signal(false);
  selectedEmployee = signal<EmployeeProfile | null>(null);

  readonly roles: Role[] = Object.values(Role);

  ngOnInit() {
    if (this.allEmployees().length === 0 && !this.isLoading()) {
      this.store.dispatch(getAllEmployeesAction());
    }

    this.actions.pipe(
      ofType(createEmployeeSuccessAction),
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

  createNewEmployee(data: { person: Person; worker: WorkerBase }) {
    console.log(data);
    this.store.dispatch(createEmployeeAction(data));
  }

  closeCreateModal() {
    this.isCreateNewModalOpen.set(false);
  }

  openCreateModal() {
    this.isCreateNewModalOpen.set(true);
  }

  updateSelectedEmployee(data: { person: PersonBase; worker: WorkerBase }) {
    console.log(data)
  }

  closeEditModal() {
    this.isCreateNewModalOpen.set(false);
  }

  openEditModal() {
    this.isEditModalOpen.set(true);
  }
}