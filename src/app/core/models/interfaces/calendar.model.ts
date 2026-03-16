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