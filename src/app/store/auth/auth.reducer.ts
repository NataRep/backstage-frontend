import { createReducer, on } from "@ngrx/store";
import { User } from "../../core/models/interfaces/auth.models";
import { loginAction, loginFailureAction, logoutFailureAction, logoutSuccessAction, setUserDataAction } from "./auth.actions";

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

  on(setUserDataAction, (state, { user }) => ({
    ...state,
    profile: user,
    loading: false,
    error: null
  })),

  on(logoutSuccessAction, (state) => ({
    ...state,
    profile: null,
    loading: false,
    error: null
  })),

  on(logoutFailureAction, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),
);