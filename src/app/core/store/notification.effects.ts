import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';
import { ToastService } from '../services/toasts.service';
import * as EmployeeActions from './employees/employees.actions';
import * as InventoryActions from './inventory/inventory.actions';
import * as ShowsActions from './shows/shows.actions';

@Injectable()
export class NotificationEffects {
  private actions$ = inject(Actions);
  private toastService = inject(ToastService);

  showSuccessToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        EmployeeActions.updateEmployeeSuccessAction,
        EmployeeActions.createEmployeeSuccessAction,
        EmployeeActions.updateWorkerEmployeeSuccessAction,
        InventoryActions.createInventorySuccessAction,
        InventoryActions.updateInventorySuccessAction,
        ShowsActions.createShowSuccessAction,
        ShowsActions.updateShowSuccessAction,
        ShowsActions.deleteShowSuccessAction
      ),
      tap(() => this.toastService.show('Данные сохранены', 'success', 'top-right'))
    ),
    { dispatch: false }
  );

  showErrorToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        EmployeeActions.getAllEmployeesFailureAction,
        EmployeeActions.deleteEmployeeFailureAction,
        EmployeeActions.updateEmployeeFailureAction,
        EmployeeActions.createEmployeeFailureAction,
        EmployeeActions.updateWorkerEmployeeFailureAction,
        InventoryActions.updateInventoryFailureAction,
        InventoryActions.deleteInventoryFailureAction,
        InventoryActions.createInventoryFailureAction,
        ShowsActions.createShowFailureAction,
        ShowsActions.updateShowFailureAction,
        ShowsActions.deleteShowFailureAction,
      ),
      tap(() => this.toastService.show('Что-то пошло не так. Попробуйте еще раз', 'warning', 'center'))
    ),
    { dispatch: false }
  );
}