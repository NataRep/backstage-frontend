import { createAction, props } from "@ngrx/store";
import { EmployeeBase, EmployeeProfile } from "../../models/interfaces/employee.models";
import { Person, PersonBase } from "../../models/interfaces/person.model";

export const createEmployeeAction = createAction(
  '[Employee] Create',
  props<{ personal: Person, employment: EmployeeBase }>()
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
  props<{ personId: string, personal: PersonBase, employment: EmployeeBase }>()
);

export const updateEmployeeSuccessAction = createAction(
  '[Employee] Update Success',
  props<{ employee: EmployeeProfile }>()
);

export const updateEmployeeFailureAction = createAction(
  '[Employee] Update Failure',
  props<{ error: unknown }>()
);