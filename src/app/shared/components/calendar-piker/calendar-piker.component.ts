import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { GetMonthRuPipe } from '../../pipes/get-month.ru.pipe';

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
  @Input() currentDate = new Date();

  selectedMonth = signal<number>(this.currentDate.getMonth());
  selectedYear = signal<number>(this.currentDate.getFullYear());

  changeMonth(count: number): void {
    this.selectedMonth.update(month => {
      const newMonth = month + count;

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
