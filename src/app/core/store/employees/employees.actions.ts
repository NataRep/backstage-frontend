import { createAction, props } from "@ngrx/store";
import { EmployeeProfile, Worker, WorkerBase } from "../../models/interfaces/employee.models";
import { Person, PersonBase } from "../../models/interfaces/person.model";

// --- Create ---
export const createEmployeeAction = createAction('[Employee] Create', props<{ person: Person, worker: WorkerBase }>());
export const createEmployeeSuccessAction = createAction('[Employee] Create Success', props<{ employee: EmployeeProfile }>());
export const createEmployeeFailureAction = createAction('[Employee] Create Failure', props<{ error: unknown }>());

// --- Update ---
export const updateEmployeeAction = createAction('[Employee] Update', props<{ personId: string, person: PersonBase, worker: WorkerBase }>());
export const updateEmployeeSuccessAction = createAction('[Employee] Update Success', props<{ employee: EmployeeProfile }>());
export const updateEmployeeFailureAction = createAction('[Employee] Update Failure', props<{ error: unknown }>());

export const updateWorkerEmployeeAction = createAction('[Employee] Update Worker', props<{ personId: string, worker: Worker }>());
export const updateWorkerEmployeeSuccessAction = createAction('[Employee] Update Worker Success', props<{ personId: string, worker: Worker }>());
export const updateWorkerEmployeeFailureAction = createAction('[Employee] Update Worker Failure', props<{ error: unknown }>());

// --- Delete ---
export const deleteEmployeeAction = createAction('[Employee] Delete by id', props<{ personId: string }>());
export const deleteEmployeeSuccessAction = createAction('[Employee] Delete Success', props<{ personId: string }>());
export const deleteEmployeeFailureAction = createAction('[Employee] Delete Failure', props<{ error: unknown }>());

// --- Get ---
export const getAllEmployeesAction = createAction('[Employee] Get All');
export const getAllActiveEmployeesAction = createAction('[Employee] Get All Active');
export const getAllEmployeesSuccessAction = createAction('[Employee] Get All Success', props<{ employees: EmployeeProfile[] }>());
export const getAllEmployeesFailureAction = createAction('[Employee] Get All Failure', props<{ error: unknown }>());