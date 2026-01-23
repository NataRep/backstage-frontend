import { Timestamp } from "rxjs";
import { AccessLevel } from "../enums/auth.enums";
import { Role } from "../enums/employee.enums";

export interface EmployeeBase {
  roles: Role[];
  availability: Timestamp<string>[];
  isActive: boolean;
  accessLevel: AccessLevel;
}

export interface Employee extends EmployeeBase {
  id: string;
  personId: string;
}