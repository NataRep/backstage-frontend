import { Timestamp } from "rxjs";
import { AccessLevel } from "../enums/auth.enums";
import { Role } from "../enums/employee.enums";
import { AuthInfo } from "./auth.models";
import { Person } from "./person.model";

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

export interface EmployeeProfile {
  personal: Person | null;
  employment: Employee | null;
  auth: AuthInfo | null;
}
