import { Pipe, PipeTransform } from '@angular/core';
import { WEEK_DAYS, WeekDayMetadata } from '../../core/models/interfaces/calendar.model';

@Pipe({
  name: 'getDayOfWeek',
  standalone: true
})
export class DayOfWeekPipe implements PipeTransform {

  transform(dayOfMonth: number, firstDayOfMonthIndex: number): WeekDayMetadata {
    const dayIndex = (dayOfMonth - 1 + firstDayOfMonthIndex) % 7;
    return WEEK_DAYS[dayIndex];
  }
}