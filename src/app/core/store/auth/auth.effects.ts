import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, forkJoin, from, map, of, retry, switchMap, tap } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { WorkerDataService } from "../../services/firebase/firebase-workers.service";
import { PersonDataService } from "../../services/persons.service";
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
  private personService = inject(PersonDataService);
  private employeeService = inject(WorkerDataService);
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
          person: this.personService.getPersonById(user.personId),
          worker: this.employeeService.getByPersonId(user.personId),
        }).pipe(
          map(({ person, worker }) => {
            if (!person || !worker) {
              let errorText;
              if (!person && !worker) {
                return loginContextFailureAction({ error: 'Error: load User context failed' });
              } else if (!person) {
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
                person,
                worker: {
                  id: worker.id,
                  roles: worker.roles,
                  availability: worker.availability,
                  isActive: worker.isActive,
                  personId: worker.personId,
                  accessLevel: worker.accessLevel,
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