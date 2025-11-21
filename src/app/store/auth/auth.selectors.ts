import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<UserState>('auth');

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectAuthUser = createSelector(
  selectAuthState,
  (state) => state.profile
);