import { createReducer, on } from "@ngrx/store";
import { EmployeeProfile } from "../../models/interfaces/employee.models";
import { createEmployeeAction, createEmployeeFailureAction, createEmployeeSuccessAction, getAllEmployeesAction, getAllEmployeesFailureAction, getAllEmployeesSuccessAction, updateEmployeeAction, updateEmployeeSuccessAction } from "./employees.actions";

export interface EmployeesState {
  employees: EmployeeProfile[],
  loading: boolean,
  error: unknown
};

const initialState: EmployeesState = {
  employees: [],
  loading: false,
  error: null
}

export const employeeReducer = createReducer(
  initialState,

  on(createEmployeeAction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(createEmployeeSuccessAction, (state, { employee }) => ({
    ...state,
    employees: [...state.employees, employee],
    loading: false,
    error: null,
  })),

  on(createEmployeeFailureAction, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),

  on(updateEmployeeAction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(updateEmployeeSuccessAction, (state, { employee }) => ({
    ...state,
    employees: [
      ...state.employees.filter((item) => item.person?.personId != employee.person?.personId),
      employee],
    loading: false,
    error: null,
  })),

  on(getAllEmployeesAction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(getAllEmployeesSuccessAction, (state, { employees }) => ({
    ...state,
    employees: [
      ...employees],
    loading: false,
    error: null,
  })),

  on(getAllEmployeesFailureAction, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),
)
