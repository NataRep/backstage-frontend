import { Timestamp } from "rxjs";
import { AccessLevel } from "../enums/auth.enums";
import { Role } from "../enums/employee.enums";

export interface Employee {
  id: string,
  personId: string,
  roles: Role[],
  availability: Timestamp<string>[],
  isActive: boolean,
  accessLevel: AccessLevel
}
