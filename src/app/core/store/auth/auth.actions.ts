import { createAction, props } from "@ngrx/store";
import { AuthInfo, CurrentUser } from "../../models/interfaces/auth.models";
import { Worker } from "../../models/interfaces/employee.models";
import { Person } from "../../models/interfaces/person.model";

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
  props<{ error: string }>()
);

export const logoutAction = createAction(
  '[Auth] Logout'
);

export const logoutSuccessAction = createAction(
  '[Auth] Logout Success'
);

export const logoutFailureAction = createAction(
  '[Auth] Logout Failure',
  props<{ error: string }>()
);

export const setUserDataAction = createAction(
  '[Auth] Set User Data',
  props<{ user: CurrentUser }>()
);

export const clearLoginErrorAction = createAction(
  '[Auth] Clear Error Message'
);

export const autoLoginAction = createAction('[Auth] Auto Login');

export const setUserProfileAction = createAction(
  '[Auth] Set User Profile',
  props<{ person: Person, worker: Worker }>()
);

export const loginCredentialsFailureAction = createAction(
  '[Auth] Login Credentials Failure',
  props<{ error: string }>()
);

export const loginContextFailureAction = createAction(
  '[Auth] Login Context Failure',
  props<{ error: string }>()
);