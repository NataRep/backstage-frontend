import { createAction, props } from "@ngrx/store";
import { AuthInfo } from "../../core/models/interfaces/auth.models";


export const loginAction = createAction(
  '[Auth] Login',
  props<{ email: string, password: string }>()
)

export const logoutAction = createAction(
  '[Auth] Logout'
)

export const loginSuccessAction = createAction(
  '[Auth] Login Success',
  props<{ user: AuthInfo }>()
);


export const loginFailureAction = createAction(
  '[Auth] Login Failure',
  props<{ error: unknown }>()
);