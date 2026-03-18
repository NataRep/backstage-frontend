import { AccessLevel } from "../enums/auth.enums";
import { Role } from "../enums/employee.enums";
import { Person } from "./person.model";

export interface WorkerBase {
  roles: Role[];
  availability: CustomTimestamp[];
  isActive: boolean;
  accessLevel: AccessLevel;
}

export interface Worker extends WorkerBase {
  id?: string;
  personId: string;
}

export interface EmployeeProfile {
  person: Person | null;
  worker: Worker | null;
}

export interface CustomTimestamp {
  seconds: number;
  nanoseconds: number;
}