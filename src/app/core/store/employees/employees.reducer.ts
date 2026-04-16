import { createReducer, on } from "@ngrx/store";
import { EmployeeProfile } from "../../models/interfaces/employee.models";
import { createEmployeeAction, createEmployeeFailureAction, createEmployeeSuccessAction, deleteEmployeeAction, deleteEmployeeFailureAction, deleteEmployeeSuccessAction, getAllEmployeesAction, getAllEmployeesFailureAction, getAllEmployeesSuccessAction, updateEmployeeAction, updateEmployeeFailureAction, updateEmployeeSuccessAction, updateWorkerEmployeeFailureAction, updateWorkerEmployeeSuccessAction } from "./employees.actions";

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

  on(updateEmployeeFailureAction, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),

  on(updateWorkerEmployeeSuccessAction, (state, { personId, worker }) => ({
    ...state,
    employees: state.employees.map((emp) =>
      emp.person?.personId === personId
        ? { ...emp, worker: { ...worker } }
        : emp
    ),
    loading: false,
    error: null,
  })),

  on(updateWorkerEmployeeFailureAction, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),

  on(deleteEmployeeAction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(deleteEmployeeSuccessAction, (state, { personId }) => ({
    ...state,
    employees: [
      ...state.employees.filter((item) => item.person?.personId != personId)],
    loading: false,
    error: null,
  })),

  on(deleteEmployeeFailureAction, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),

  on(getAllEmployeesAction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(getAllEmployeesSuccessAction, (state, { employees }) => {
    const map = new Map(
      [...state.employees, ...employees]
        .map(emp => [emp.worker?.personId, emp])
    );

    return {
      ...state,
      employees: Array.from(map.values()),
      loading: false,
      error: null,
    };
  }),

  on(getAllEmployeesFailureAction, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),
)
