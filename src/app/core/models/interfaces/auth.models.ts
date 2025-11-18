import { Timestamp } from "rxjs";
import { AccessLevel } from "../enums/auth.enums";
import { Role } from "../enums/employee.enums";
import { Person } from "./person.model";


export interface User {
  personal: Person;
  employee: EmployeeProfile;
  auth: AuthInfo;
}

//авторизация firebase
export interface AuthInfo {
  email: string | null,
  localId: string,
}

//данные пользователе как о сотруднике
export interface EmployeeProfile {
  id: string,
  roles: Role[],
  availability: Timestamp<string>[],
  isActive: boolean,
  uthUid: string,
  accessLevel: AccessLevel,
}
