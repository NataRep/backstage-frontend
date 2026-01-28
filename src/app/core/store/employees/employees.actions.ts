import { createAction, props } from "@ngrx/store";
import { AuthInfo } from "../../models/interfaces/auth.models";

export const createCurrentUser = createAction(
  '[Auth] Login Success',
  props<{ user: AuthInfo }>()
);