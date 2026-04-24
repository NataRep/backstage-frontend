import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, exhaustMap, filter, map, of, switchMap } from "rxjs";
import { EmployeeFacade } from "../../services/employee-facade.service";
import { ToastService } from "../../services/toasts.service";
import { setUserProfileAction } from "../auth/auth.actions";
import { selectAuthUser } from "../auth/auth.selectors";
import {
  createEmployeeAction,
  createEmployeeFailureAction,
  createEmployeeSuccessAction,
  deleteEmployeeAction,
  deleteEmployeeFailureAction,
  deleteEmployeeSuccessAction,
  getAllActiveEmployeesAction,
  getAllEmployeesAction,
  getAllEmployeesFailureAction,
  getAllEmployeesSuccessAction,
  updateEmployeeAction,
  updateEmployeeFailureAction,
  updateEmployeeSuccessAction,
  updateWorkerEmployeeAction,
  updateWorkerEmployeeFailureAction,
  updateWorkerEmployeeSuccessAction
} from "./employees.actions";

@Injectable()
export class EmployeesEffects {
  private actions$ = inject(Actions);
  private employeeManagerService = inject(EmployeeFacade);
  private store = inject(Store);
  private toastService = inject(ToastService);
  private currentUser = this.store.selectSignal(selectAuthUser);

  createEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createEmployeeAction),
      switchMap(({ person, worker }) =>
        this.employeeManagerService.createEmployee(person, worker).pipe(
          map(employee => {
            return createEmployeeSuccessAction({ employee })
          }
          ),
          catchError(error => {
            return of(createEmployeeFailureAction({ error }))
          }
          )
        )
      )
    )
  );

  updateEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateEmployeeAction),
      switchMap(({ personId, person, worker }) =>
        this.employeeManagerService.updateFullEmployeeProfile(personId, person, worker).pipe(
          map((employeeProfile) => updateEmployeeSuccessAction({
            employee: employeeProfile
          })),
          catchError(error => of(updateEmployeeFailureAction({
            error: error.message || error
          })))
        )
      )
    )
  );

  updateEmployeeSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateEmployeeSuccessAction),
      filter(({ employee }) => this.currentUser()?.person?.personId === employee.person?.personId),
      map(({ employee }) =>
        setUserProfileAction({
          person: employee.person!,
          worker: employee.worker!
        })
      )
    )
  );



  updateWorkerEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateWorkerEmployeeAction),
      concatMap(({ personId, worker }) =>
        this.employeeManagerService.updateWorkerEmployeeProfile(worker).pipe(
          map((updatedWorker) => updateWorkerEmployeeSuccessAction({
            personId,
            worker: updatedWorker
          })),
          catchError((error) => of(updateWorkerEmployeeFailureAction({
            error: error.message || 'Ошибка сервера'
          })))
        )
      )
    )
  );

  updateWorkerSuccessSyncAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateWorkerEmployeeSuccessAction),
      map(action => ({ action, currentUser: this.currentUser() })),
      filter(({ action, currentUser }) => currentUser?.person?.personId === action.personId),
      map(({ action, currentUser }) =>
        setUserProfileAction({
          person: currentUser!.person!,
          worker: action.worker
        })
      )
    )
  );

  deleteEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteEmployeeAction),
      switchMap(({ personId }) =>
        this.employeeManagerService.deleteFullEmployeeProfile(personId).pipe(
          map((id) => deleteEmployeeSuccessAction({
            personId: id
          })),
          catchError(error => of(deleteEmployeeFailureAction({
            error: error.message || error
          })))
        )
      )
    )
  );

  getAllEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getAllEmployeesAction),
      exhaustMap(() =>
        this.employeeManagerService.getAllEmployees().pipe(
          map((employees) => getAllEmployeesSuccessAction({
            employees
          })),
          catchError(error => of(getAllEmployeesFailureAction({
            error
          }))))
      ))
  );

  getAllActiveEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getAllActiveEmployeesAction),
      switchMap(() =>
        this.employeeManagerService.subscribeAllActiveEmployees().pipe(
          map((employees) => getAllEmployeesSuccessAction({
            employees
          })),
          catchError(error => {
            console.error('Ошибка подписки:', error);
            return of(getAllEmployeesFailureAction({ error }));
          })
        )
      )
    )
  );
}