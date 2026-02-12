import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, forkJoin, from, map, of, retry, switchMap, tap } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { FirebaseEmployeeService } from "../../services/firebase/firebase-employee.service";
import { PersonsService } from "../../services/persons.service";
import {
  loginAction,
  loginContextFailureAction,
  loginCredentialsFailureAction,
  loginFailureAction,
  loginSuccessAction,
  logoutAction,
  logoutFailureAction,
  logoutSuccessAction,
  setUserDataAction
} from "./auth.actions";

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private personService = inject(PersonsService);
  private employeeService = inject(FirebaseEmployeeService);
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
            catchError(error => {
              return of(loginCredentialsFailureAction({ error: 'Incorrect email or password' }))
            })
          ))
    )
  })

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginSuccessAction),
      switchMap(({ user }) =>
        forkJoin({
          personal: this.personService.getPersonById(user.personId),
          employee: this.employeeService.getByPersonId(user.personId),
        }).pipe(
          map(({ personal, employee }) => {
            if (!personal || !employee) {
              let errorText;
              if (!personal && !employee) {
                console.log("loginSuccess$")
                return loginContextFailureAction({ error: 'Error: load User context failed' });
              } else if (!personal) {
                errorText = "Error: load User personal context failed"
              }
              else {
                errorText = "Error: load User employee context failed"
              }

              return loginFailureAction({ error: errorText });
            }

            return setUserDataAction({
              user: {
                auth: user,
                personal,
                employment: {
                  id: employee.id,
                  roles: employee.roles,
                  availability: employee.availability,
                  isActive: employee.isActive,
                  personId: employee.personId,
                  accessLevel: employee.accessLevel,
                }
              }
            });
          }),
          catchError(error => {
            return of(loginFailureAction({ error }));
          }
          )
        )
      )
    )
  );

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

  loginFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginFailureAction),
      switchMap(() =>
        from(this.authService.logout()).pipe(
          retry(1),
          map(() => {
            return logoutSuccessAction()
          }),
          catchError(error => {
            console.error("Logout failed twice", error);
            return of(logoutSuccessAction());
          })
        )
      )
    )
  );
}