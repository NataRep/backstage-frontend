import { EmployeeProfile } from "./employee.models";

//авторизация firebase
export interface AuthInfo {
  email: string | null,
  personId: string,
  name: string | null,
}

export interface CurrentUser extends EmployeeProfile {
  auth: AuthInfo | null;
}
