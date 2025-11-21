import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, forkJoin, from, map, of, switchMap, tap } from "rxjs";
import { EmployeeProfile } from "../../core/models/interfaces/auth.models";
import { AuthService } from "../../core/services/auth.service";
import { EmployeeService } from "../../core/services/firebase/employee.service";
import { PersonsService } from "../../core/services/persons.service";
import { loginAction, loginFailureAction, loginSuccessAction, logoutAction, logoutFailureAction, logoutSuccessAction, setUserDataAction } from "./auth.actions";

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private personService = inject(PersonsService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);


  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loginAction),
      exhaustMap(({ email, password }) =>
        from(this.authService.login(email, password))
          .pipe(
            map((response) => loginSuccessAction({
              user: {
                email: response.user.email,
                personId: response.user.uid,
                name: response.user.displayName
              }
            })),
            catchError(error => of(loginFailureAction({ error })))
          ))
    )
  })

  loginSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loginSuccessAction),
      switchMap(({ user }) =>
        forkJoin({
          personal: this.personService.getPersonById(user.personId),
          employee: this.employeeService.getByPersonId(user.personId),
        }).pipe(



          map(({ personal, employee }) => {
            console.log("personId", user.personId);

            if (!personal) {
              throw new Error('Person not found');
            }

            if (!employee) {
              throw new Error('Employee not found');
            }

            const employeeProfile: EmployeeProfile = {
              id: employee.id,
              roles: employee.roles,
              availability: employee.availability,
              isActive: employee.isActive,
              personId: employee.personId,
              accessLevel: employee.accessLevel,
            };

            console.log("employeeProfile", employeeProfile)

            return setUserDataAction({
              user: {
                personal,
                employee: employeeProfile,
                auth: user
              }
            });
          }),
          catchError(error => {
            console.error('Failed to load user data:', error);
            // Все равно создаем пользователя, даже если часть данных не загрузилась
            return of(setUserDataAction({
              user: {
                personal: null,
                employee: null,
                auth: user
              }
            }));
          }
          )
        )
      )
    );
  });

  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(logoutAction),
      exhaustMap(() =>
        from(this.authService.logout()).pipe(
          map(() => logoutSuccessAction()),
          catchError(error => of(logoutFailureAction({ error })))
        )
      )
    );
  });

  logoutSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(logoutSuccessAction),
      tap(() => {
        this.router.navigate(['/login']);
      })
    );
  }, { dispatch: false });

  autoLogin$ = createEffect(() => {
    return this.actions$.pipe(
      ofType('@ngrx/effects/init'),
      switchMap(() => {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          return of(loginSuccessAction({
            user: {
              email: currentUser.email,
              personId: currentUser.uid,
              name: currentUser.displayName
            }
          }));
        }
        return of({ type: 'NO_ACTION' });
      })
    );
  });

}