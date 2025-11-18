import { inject, Injectable } from "@angular/core";
import { Actions } from "@ngrx/effects";
import { AuthService } from "../../core/services/auth.service";

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);


  /*login$ = createEffect(() => {
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
  })*/
}