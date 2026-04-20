import { WEEK_DAYS } from '../../core/models/interfaces/calendar.model';
import { DayOfWeekPipe } from './day-of-week.pipe';

describe('DayOfWeekPipe', () => {
  let pipe: DayOfWeekPipe;

  beforeEach(() => {
    pipe = new DayOfWeekPipe()
  })

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  const testCases = [
    { day: 1, start: 1, expectedIndex: 1 }, // Понедельник
    { day: 7, start: 1, expectedIndex: 0 }, // Воскресенье
    { day: 15, start: 3, expectedIndex: 3 }, // Среда (пример)
  ];

  testCases.forEach(({ day, start, expectedIndex }) => {
    it(`should return index ${expectedIndex} on day ${day} at offset ${start}`, () => {
      const result = pipe.transform(day, start);
      expect(result).toEqual(WEEK_DAYS[expectedIndex]);
    });
  });
})