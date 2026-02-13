import { createAction, props } from "@ngrx/store";
import { EmployeeProfile, WorkerBase } from "../../models/interfaces/employee.models";
import { Person, PersonBase } from "../../models/interfaces/person.model";

export const createEmployeeAction = createAction(
  '[Employee] Create',
  props<{ person: Person, worker: WorkerBase }>()
);

export const createEmployeeSuccessAction = createAction(
  '[Employee] Create Success',
  props<{ employee: EmployeeProfile }>()
)

export const createEmployeeFailureAction = createAction(
  '[Employee] Create Failure',
  props<{ error: unknown }>()
)

export const updateEmployeeAction = createAction(
  '[Employee] Update',
  props<{ personId: string, person: PersonBase, worker: WorkerBase }>()
);

export const updateEmployeeSuccessAction = createAction(
  '[Employee] Update Success',
  props<{ employee: EmployeeProfile }>()
);

export const updateEmployeeFailureAction = createAction(
  '[Employee] Update Failure',
  props<{ error: unknown }>()
);

export const getAllEmployeesAction = createAction(
  '[Employee] Get All'
)

export const getAllEmployeesSuccessAction = createAction(
  '[Employee] Get All Success',
  props<{ employees: EmployeeProfile[] }>()
)

export const getAllEmployeesFailureAction = createAction(
  '[Employee] Get All Failure',
  props<{ error: unknown }>()
)