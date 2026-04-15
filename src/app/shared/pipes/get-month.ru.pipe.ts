import { Pipe, PipeTransform } from "@angular/core";
import { MONTHS_DATA } from "../../core/models/interfaces/calendar.model";

@Pipe({ name: 'getMonthRu', standalone: true })
export class GetMonthRuPipe implements PipeTransform {
  transform(monthNumber: number): string {
    return MONTHS_DATA?.find(month => month.id === monthNumber)?.nameRu || '';
  }
}