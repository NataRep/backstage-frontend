import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccessLevel } from '../../models/enums/auth.enums';
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

export const selectUserAccessLevel = createSelector(
  selectAuthUser,
  (state) => state?.worker?.accessLevel
);

export const selectCanEdit = createSelector(
  selectUserAccessLevel,
  (accessLevel) => {
    return [
      AccessLevel.Admin,
      AccessLevel.Owner,
      AccessLevel.Manager
    ].includes(accessLevel as AccessLevel);
  }
);