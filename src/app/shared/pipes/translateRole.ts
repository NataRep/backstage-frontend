import { Pipe, PipeTransform } from "@angular/core";
import { Role } from "../../core/models/enums/employee.enums";
import { ROLE_RU } from "../constants/texts/common.texts";

@Pipe({ name: 'roleTranslate', standalone: true })
export class RoleTranslatePipe implements PipeTransform {
  transform(value: string | Role): string {
    return ROLE_RU[value as keyof typeof ROLE_RU] || value;
  }
}