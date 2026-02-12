import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map, of } from "rxjs";
import { EmployeeManagerService } from "../../services/employee.service";
import { setUserProfileAction } from "../auth/auth.actions";
import { createEmployeeAction, createEmployeeFailureAction, createEmployeeSuccessAction, updateEmployeeAction, updateEmployeeFailureAction, updateEmployeeSuccessAction } from "./employees.actions";

@Injectable()
export class EmployeesEffects {
  private actions$ = inject(Actions);
  private employeeManagerService = inject(EmployeeManagerService)

  createEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createEmployeeAction),
      exhaustMap(({ personal, employment }) =>
        this.employeeManagerService.createEmployee(personal, employment).pipe(
          map(employee =>
            createEmployeeSuccessAction({ employee })
          ),
          catchError(error =>
            of(createEmployeeFailureAction({ error }))
          )
        )
      )
    )
  );

  updateEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateEmployeeAction),
      exhaustMap(({ personId, personal, employment }) =>
        this.employeeManagerService.updateFullEmployeeProfile(personId, personal, employment).pipe(
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
          personal: employee.personal!,
          employment: employee.employment!
        })
      )
    )
  );

}