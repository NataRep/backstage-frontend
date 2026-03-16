import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { GetMonthRuPipe } from '../../pipes/get-month.ru.pipe';

const DEFAULT_DAYS_COUNT = 31;

@Component({
  selector: 'app-calendar-piker',
  standalone: true,
  imports: [GetMonthRuPipe],
  templateUrl: './calendar-piker.component.html',
  styleUrl: './calendar-piker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarPikerComponent {
  @Output() dateChange = new EventEmitter<{ month: number, year: number }>();

  selectedMonth = signal<number>(new Date().getMonth());
  selectedYear = signal<number>(new Date().getFullYear());
  currentDate = new Date();
  selectData = signal

  changeMonth(count: number): void {
    this.selectedMonth.update(month => {
      let newMonth = month + count;

      if (newMonth > 11) {
        this.selectedYear.update(y => y + 1);
        return 0;
      } else if (newMonth < 0) {
        this.selectedYear.update(y => y - 1);
        return 11;
      }

      return newMonth;
    });

    this.notifyDateChange();
  }

  changeYear(count: number): void {
    this.selectedYear.update(year => year + count);
    this.notifyDateChange();
  }

  private notifyDateChange(): void {
    this.dateChange.emit({
      month: this.selectedMonth(),
      year: this.selectedYear()
    });
  }
}
