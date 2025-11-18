import { createReducer, on } from "@ngrx/store";
import { User } from "../../core/models/interfaces/auth.models";
import { loginAction, loginFailureAction, loginSuccessAction } from "./auth.actions";

export interface UserState {
  profile: User | null,
  loading: boolean,
  error: unknown
};

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null
}

export const authReducer = createReducer(
  initialState,

  on(loginAction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(loginFailureAction, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),

  on(loginSuccessAction, (state, { user }) => ({
    ...state,
    profile: user,
    loading: false,
    error: null
  }))
);