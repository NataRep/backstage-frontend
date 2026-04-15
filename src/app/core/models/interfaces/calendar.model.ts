export interface MonthMetadata {
  readonly id: number;
  readonly name: string;
  readonly nameRu: string;
}



export const MONTHS_DATA: MonthMetadata[] = [
  { id: 0, name: 'January', nameRu: 'Январь' },
  { id: 1, name: 'February', nameRu: 'Февраль', },
  { id: 2, name: 'March', nameRu: 'Март' },
  { id: 3, name: 'April', nameRu: 'Апрель' },
  { id: 4, name: 'May', nameRu: 'Май' },
  { id: 5, name: 'June', nameRu: 'Июнь' },
  { id: 6, name: 'July', nameRu: 'Июль' },
  { id: 7, name: 'August', nameRu: 'Август' },
  { id: 8, name: 'September', nameRu: 'Сентябрь' },
  { id: 9, name: 'October', nameRu: 'Октябрь' },
  { id: 10, name: 'November', nameRu: 'Ноябрь' },
  { id: 11, name: 'December', nameRu: 'Декабрь' }
];

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export interface WeekDayMetadata {
  readonly id: number;
  readonly name: string;
  readonly shortName: string;
  readonly nameRu: string;
  readonly shortNameRu: string;
}

export const WEEK_DAYS: WeekDayMetadata[] = [
  { id: 0, name: 'Sunday', shortName: 'Sun', nameRu: 'Воскресенье', shortNameRu: 'Вс' },
  { id: 1, name: 'Monday', shortName: 'Mon', nameRu: 'Понедельник', shortNameRu: 'Пн' },
  { id: 2, name: 'Tuesday', shortName: 'Tue', nameRu: 'Вторник', shortNameRu: 'Вт' },
  { id: 3, name: 'Wednesday', shortName: 'Wed', nameRu: 'Среда', shortNameRu: 'Ср' },
  { id: 4, name: 'Thursday', shortName: 'Thu', nameRu: 'Четверг', shortNameRu: 'Чт' },
  { id: 5, name: 'Friday', shortName: 'Fri', nameRu: 'Пятница', shortNameRu: 'Пт' },
  { id: 6, name: 'Saturday', shortName: 'Sat', nameRu: 'Суббота', shortNameRu: 'Сб' }
];