import { createAction, props } from "@ngrx/store";
import { AuthInfo } from "../../models/interfaces/auth.models";
import { EmployeeProfile } from "../../models/interfaces/employee.models";

export const loginAction = createAction(
  '[Auth] Login',
  props<{ email: string, password: string }>()
);

export const loginSuccessAction = createAction(
  '[Auth] Login Success',
  props<{ user: AuthInfo }>()
);

export const loginFailureAction = createAction(
  '[Auth] Login Failure',
  props<{ error: unknown }>()
);

export const logoutAction = createAction(
  '[Auth] Logout'
);

export const logoutSuccessAction = createAction(
  '[Auth] Logout Success'
);

export const logoutFailureAction = createAction(
  '[Auth] Logout Failure',
  props<{ error: unknown }>()
);

export const setUserDataAction = createAction(
  '[Auth] Set User Data',
  props<{ user: EmployeeProfile }>()
);

export const clearLoginErrorAction = createAction(
  '[Auth] Clear Error Message'
);

export const autoLoginAction = createAction('[Auth] Auto Login');
