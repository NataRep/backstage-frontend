import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map, of } from "rxjs";
import { EmployeeFacade } from "../../services/employee-facade.service";
import { setUserProfileAction } from "../auth/auth.actions";
import { createEmployeeAction, createEmployeeFailureAction, createEmployeeSuccessAction, getAllEmployeesAction, getAllEmployeesFailureAction, getAllEmployeesSuccessAction, updateEmployeeAction, updateEmployeeFailureAction, updateEmployeeSuccessAction } from "./employees.actions";

@Injectable()
export class EmployeesEffects {
  private actions$ = inject(Actions);
  private employeeManagerService = inject(EmployeeFacade)

  createEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createEmployeeAction),
      exhaustMap(({ person, worker }) =>
        this.employeeManagerService.createEmployee(person, worker).pipe(
          map(employee => {
            console.log("createEmployeeSuccessAction", employee)
            return createEmployeeSuccessAction({ employee })
          }
          ),
          catchError(error => {
            console.log("createEmployeeFailureAction", error)
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
      exhaustMap(({ personId, person, worker }) =>
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
      map(({ employee }) =>
        setUserProfileAction({
          person: employee.person!,
          worker: employee.worker!
        })
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

}