import { Timestamp } from "firebase/firestore";
import { Role } from "../enums/employee.enums";

export interface Employee {
  id: string,
  personId: string,
  roles: Role[],
  availability: Timestamp[],
  isActive: boolean
}
