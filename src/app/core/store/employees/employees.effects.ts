import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, forkJoin, from, map, of, switchMap, throwError } from "rxjs";
import { EmployeeService } from "../../services/firebase/employee.service";
import { PersonsService } from "../../services/persons.service";
import { setUserProfileAction } from "../auth/auth.actions";
import { createEmployeeAction, createEmployeeFailureAction, createEmployeeSuccessAction, updateEmployeeAction, updateEmployeeFailureAction, updateEmployeeSuccessAction } from "./employees.actions";

@Injectable()
export class EmployeesEffects {
  private actions$ = inject(Actions);
  private personService = inject(PersonsService);
  private employeeService = inject(EmployeeService);

  createEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createEmployeeAction),
      switchMap(({ personal, employment: employmentData }) =>
        forkJoin({
          personal: this.personService.createPerson(personal).pipe(
            catchError(err => {
              if (err.code === 'PERSON_ALREADY_EXISTS') {
                return this.personService.getPersonById(personal.personId);
              }
              return throwError(() => err);
            })
          ),
          employment: from(this.employeeService.getByPersonId(personal.personId)).pipe(
            switchMap(existingEmployee => {
              if (existingEmployee) {
                return of(existingEmployee);
              }
              return from(this.employeeService.create({ ...employmentData, personId: personal.personId })).pipe(
                map(id => ({ ...employmentData, personId: personal.personId, id }))
              );
            })
          )
        }).pipe(
          map(({ personal, employment }) =>
            createEmployeeSuccessAction({
              employee: {
                personal,
                employment: {
                  ...employmentData,
                  ...employment
                }
              }
            })
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
      switchMap(({ personId, personal, employment }) =>
        this.personService.updatePerson(personId, personal).pipe(
          switchMap(updatedPersonal =>
            from(this.employeeService.getByPersonId(personId)).pipe(
              switchMap(existingEmployee => {
                if (!existingEmployee) {
                  return throwError(() => new Error('Employee not found'));
                }

                console.log("updateEmployee$")
                // Обновляем существующего сотрудника
                return from(this.employeeService.update(existingEmployee.id, employment)).pipe(
                  map(() => ({
                    personal: updatedPersonal,
                    employment,
                  }))
                );
              })
            )
          ),
          map(({ personal, employment }) =>
            updateEmployeeSuccessAction({ employee: { personal, employment: { ...employment, personId: personal.personId } } })
          ),
          catchError(error => of(updateEmployeeFailureAction({ error })))
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