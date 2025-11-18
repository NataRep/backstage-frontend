import { createAction, props } from "@ngrx/store";
import { User } from "../../core/models/interfaces/auth.models";

export const loginAction = createAction(
  '[Auth] Login',
  props<{ email: string, password: string }>()
);

export const loginSuccessAction = createAction(
  '[Auth] Login Success',
  props<{ user: User }>()
);

export const loginFailureAction = createAction(
  '[Auth] Login Failure',
  props<{ error: unknown }>()
);

export const logoutAction = createAction(
  '[Auth] Logout'
);

export const logoutSuccessAction = createAction(
  '[Auth] Logout Success',
  props<{ message: string }>()
);

export const logoutFailureAction = createAction(
  '[Auth] Logout Failure',
  props<{ error: unknown }>()
);