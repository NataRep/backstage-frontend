import { Timestamp } from "rxjs";
import { AccessLevel } from "../enums/auth.enums";
import { Role } from "../enums/employee.enums";

export interface UserProfile {
  personal: UserPersonal;
  employee: EmployeeProfile;
  auth: AuthInfo;
}

//персональные данные по всем персонам в приложении хранятся в отдельной базе для соблюдения закона о персональных данных
export interface UserPersonal {
  id?: number,
  personId: string,
  full_name: string,
  email?: string,
  phone?: string,
  telegram?: string,
  whatsapp?: string,
  vk?: string,
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
