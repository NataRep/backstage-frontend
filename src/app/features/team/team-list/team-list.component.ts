import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { WorkerBase } from '../../../core/models/interfaces/employee.models';
import { Person } from '../../../core/models/interfaces/person.model';
import { selectCanEdit } from '../../../core/store/auth/auth.selectors';
import { createEmployeeAction, createEmployeeSuccessAction } from '../../../core/store/employees/employees.actions';
import { ModalContainerComponent } from '../../../shared/components/modal-container/modal-container.component';
import { EmployeeFormComponent } from '../../employee/employee-form/employee-form.component';
import { EmployeesTableComponent } from '../../employee/employees-table/employees-table.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule,
    ModalContainerComponent,
    EmployeeFormComponent,
    EmployeesTableComponent],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamListComponent implements OnInit {
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
  canEdit = this.store.selectSignal(selectCanEdit);
  isCreateNewModalOpen = signal(false);

  ngOnInit() {
    this.actions.pipe(
      ofType(createEmployeeSuccessAction),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.employeeForm?.resetForm();
      this.closeCreateModal();
    });
  }

  createNewEmployee(data: { person: Person; worker: WorkerBase }) {
    this.store.dispatch(createEmployeeAction(data));
  }

  closeCreateModal() {
    this.isCreateNewModalOpen.set(false);
  }

  openCreateModal() {
    this.isCreateNewModalOpen.set(true);
  }
}