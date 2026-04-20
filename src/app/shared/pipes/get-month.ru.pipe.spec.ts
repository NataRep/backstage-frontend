import { MONTHS_DATA } from '../../core/models/interfaces/calendar.model';
import { GetMonthRuPipe } from './get-month.ru.pipe';


describe('getMonthRu', () => {
  let pipe: GetMonthRuPipe;

  beforeEach(() => {
    pipe = new GetMonthRuPipe()
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return month name ', () => {
    const monthId = 0;
    const result = pipe.transform(monthId);
    const expectedMonth = MONTHS_DATA.find(m => m.id === monthId)?.nameRu;
    expect(result).toEqual(expectedMonth as string);
  });

  describe('GetMonthRuPipe (Edge Cases)', () => {
    const invalidIndices = [-1, 13, 99];

    invalidIndices.forEach(id => {
      it(`should return an empty string for invalid id: ${id}`, () => {
        const result = pipe.transform(id);
        expect(result).toBe('');
      });
    });
  });
})