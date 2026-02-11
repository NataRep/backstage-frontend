import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmployeesState } from './employees.reducer';

export const selectEmployeesState = createFeatureSelector<EmployeesState>('employees');

export const selectAllEmployees = createSelector(
  selectEmployeesState,
  (state) => state.employees
);

export const selectEmployeeById = (personId: string) => createSelector(
  selectEmployeesState,
  (state) => state.employees.find(emp => emp.personal?.personId === personId)
);

export const selectEmployeesLoading = createSelector(
  selectEmployeesState,
  (state) => state.loading
);

export const selectEmployeesError = createSelector(
  selectEmployeesState,
  (state) => state.error
);
