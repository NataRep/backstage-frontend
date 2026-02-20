import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { WorkerBase } from '../../core/models/interfaces/employee.models';
import { Person } from '../../core/models/interfaces/person.model';
import { createEmployeeAction, createEmployeeFailureAction, createEmployeeSuccessAction } from '../../core/store/employees/employees.actions';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../shared/components/modal-container/modal-container.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { EmployeesTableComponent } from '../employees-table/employees-table.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule,
    IconComponent,
    ModalContainerComponent,
    EmployeeFormComponent,
    ToastComponent,
    EmployeesTableComponent],
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
  isCreateNewModalOpen = signal(false);
  isSuccessToastOpen = signal(false);
  isErrorToastOpen = signal(false);
  successToastMessage = "Данные сохранены";
  errorToastMessage = "Что-то пошло не так. Попробуйте еще раз.";

  constructor() {
    this.initToastSubscriptions();
  }

  ngOnInit() {
    this.actions.pipe(
      ofType(createEmployeeSuccessAction),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.employeeForm?.resetForm();
      this.closeCreateModal();
    });
  }

  private initToastSubscriptions() {
    this.actions.pipe(
      ofType(createEmployeeSuccessAction),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isSuccessToastOpen.set(true);
    });

    this.actions.pipe(
      ofType(createEmployeeFailureAction),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isErrorToastOpen.set(true);
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

  onSuccessToastClosed() {
    this.isSuccessToastOpen.set(false);
  }

  onErrorToastClosed() {
    this.isErrorToastOpen.set(true);
  }
}