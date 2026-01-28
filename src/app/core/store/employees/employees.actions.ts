import { createAction, props } from "@ngrx/store";
import { EmployeeBase, EmployeeProfile } from "../../models/interfaces/employee.models";
import { PersonBase } from "../../models/interfaces/person.model";

export const createEmployeeAction = createAction(
  '[Employee] Create',
  props<{ person: PersonBase, employee: EmployeeBase }>()
);

export const createEmployeeSuccessAction = createAction(
  '[Employee] Create Success',
  props<{ employee: EmployeeProfile }>()
)

export const updateEmployee = createAction(
  '[Update] Create',
  props<{ person: PersonBase, employee: EmployeeBase }>()
);