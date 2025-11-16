import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, from, map, of } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { loginAction, loginFailureAction, loginSuccessAction } from "./auth.actions";

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);


  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loginAction),
      exhaustMap(({ email, password }) =>
        from(this.authService.login(email, password))
          .pipe(
            map((response) => loginSuccessAction({
              user: {
                email: response.user.email,
                localId: response.user.uid
              }
            })),
            catchError(error => of(loginFailureAction({ error })))
          ))
    )
  })
}