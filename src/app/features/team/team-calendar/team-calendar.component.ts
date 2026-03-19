import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Role } from '../../../core/models/enums/employee.enums';
import { getDaysInMonth } from '../../../core/models/interfaces/calendar.model';
import { EmployeeProfile } from '../../../core/models/interfaces/employee.models';
import { selectAuthUser, selectCanEdit } from '../../../core/store/auth/auth.selectors';
import { getAllEmployeesAction, updateWorkerEmployeeAction } from '../../../core/store/employees/employees.actions';
import { selectAllEmployees, selectEmployeesLoading } from '../../../core/store/employees/employees.selector';
import { CalendarPikerComponent } from '../../../shared/components/calendar-piker/calendar-piker.component';
import { BaseTableDirective } from '../../../shared/components/data-table/base-table.directive';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { IconComponent } from '../../../shared/components/icons/icons.component';
import { ROLE_RU } from '../../../shared/constants/texts/common.texts';
import { DayOfWeekPipe } from '../../../shared/pipes/day-of-week.pipe';
import { RoleTranslatePipe } from '../../../shared/pipes/translateRole';

@Component({
  selector: 'app-team-calendar',
  standalone: true,
  imports: [IconComponent,
    DataTableComponent,
    RoleTranslatePipe,
    CalendarPikerComponent,
    DayOfWeekPipe],
  templateUrl: './team-calendar.component.html',
  styleUrl: './team-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamCalendarComponent extends BaseTableDirective<EmployeeProfile> implements OnInit {
  @HostListener('window:resize')
  onResize() {
    this.calculatePageSize();
  };

  // 1. Dependency Injection
  private readonly store = inject(Store);
  private readonly actions = inject(Actions);

  // 2. Overrides (BaseTableDirective)
  readonly dynamicPageSize = signal<number>(14);
  override pageSize = () => this.dynamicPageSize();;
  protected override sourceData = () => this.filteredEmployees();

  // 3. Static / Constant Data
  readonly roles: Role[] = Object.values(Role);
  readonly rolesTranslate = ROLE_RU;

  // 4. Store Selectors (Signals)
  readonly allEmployees = this.store.selectSignal(selectAllEmployees);
  readonly isLoading = this.store.selectSignal(selectEmployeesLoading);
  readonly currentUser = this.store.selectSignal(selectAuthUser);
  readonly canEdit = this.store.selectSignal(selectCanEdit);

  // 5. Local State (Signals)
  hoverDay = signal<number | null>(null);
  editingEmployee = signal<EmployeeProfile | null>(null);
  isEditMode = signal<boolean>(false);
  selectedRole = signal<Role | 'all'>((this.route.snapshot.queryParamMap.get('role') as Role) || 'all');
  selectedPeriod = signal({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });
  editDraft = signal<Set<number>>(new Set());

  // 6. Computed Properties
  readonly availabilityMap = computed(() => {
    const { month, year } = this.selectedPeriod();
    const employees = this.filteredEmployees();
    const map = new Map<string, Set<number>>();

    employees.forEach(emp => {
      const unavailableDays = new Set<number>();

      emp.worker?.availability?.forEach(timestamp => {
        const date = new Date(timestamp.seconds * 1000);

        // Проверяем, попадает ли дата в текущий выбранный месяц и год
        if (date.getMonth() === month && date.getFullYear() === year) {
          unavailableDays.add(date.getDate());
        }
      });

      map.set(emp.person?.personId!, unavailableDays);
    });

    return map;
  });

  readonly calendarDays = computed(() =>
    Array.from({ length: getDaysInMonth(this.selectedPeriod().month, this.selectedPeriod().year) }, (_, i) => i + 1)
  );

  readonly firstDayIndex = computed(() => {
    const { month, year } = this.selectedPeriod();
    return new Date(year, month, 1).getDay();
  });

  readonly filteredEmployees = computed(() => {
    const list = this.allEmployees();
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.selectedRole();

    if (list.length === 0) return [];

    const filtered = list.filter(emp => {
      const fullName = emp.person?.fullName.toLowerCase() || '';
      const matchesName = !query || fullName.split(" ").some(word => word.startsWith(query));
      const matchesRole = role === 'all' ||
        emp.worker?.roles?.some(r => String(r).toLowerCase() === String(role).toLowerCase());

      return matchesName && matchesRole;
    });

    return filtered.sort((a, b) => (a.person?.fullName || '').localeCompare(b.person?.fullName || ''));
  });

  // 7. Lifecycle Hooks
  override ngOnInit() {
    super.ngOnInit();
    if (this.allEmployees().length === 0 && !this.isLoading()) {
      this.store.dispatch(getAllEmployeesAction());
    }
    this.calculatePageSize();

    console.log("currentUser", this.currentUser())
  }

  // 8. Event Handlers & Business Logic
  protected override getExtraParams() {
    return { role: this.selectedRole() };
  }

  onDateChange(event: { month: number, year: number }) {
    this.selectedPeriod.set(event);
  }

  hasUnsavedChanges(): boolean {
    return !!this.editingEmployee();
  }


  private calculatePageSize() {
    const rowHeight = 37; // Примерная высота строки в пикселях
    const headerHeight = 400; // Суммарная высота всего, что ВНЕ таблицы 

    const availableHeight = window.innerHeight - headerHeight;
    const calculatedRows = Math.floor(availableHeight / rowHeight);

    // Устанавливаем минимум 5 строк, чтобы таблица не схлопнулась совсем
    this.dynamicPageSize.set(Math.max(calculatedRows, 5));
  }

  private readonly todayMidnight = new Date().setHours(0, 0, 0, 0);
  isPastDay(day: number): boolean {
    const { month, year } = this.selectedPeriod();
    const dateToCheck = new Date(year, month, day).getTime();
    return dateToCheck < this.todayMidnight;
  }

  toggleEdit(employee: EmployeeProfile) {
    this.editingEmployee.update(current => {
      if (current?.worker?.id === employee.worker?.id) {
        this.editDraft.set(new Set()); // Очистка при закрытии
      }

      const currentAvailability = this.availabilityMap().get(employee.person?.personId!) || new Set();
      this.editDraft.set(new Set(currentAvailability));
      return employee;
    });
  }

  isRowEditing(emp: EmployeeProfile) {
    return emp.worker?.id === this.editingEmployee()?.worker?.id
  }

  // Метод для клика по ячейке
  toggleDayInDraft(day: number, isPast: boolean) {
    if (!this.editingEmployee() || isPast) return;

    this.editDraft.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  }

  saveChanges() {
    const employee = this.editingEmployee();
    if (!employee) return;

    const { month, year } = this.selectedPeriod();
    const draftDays = this.editDraft();
    const otherMonthsAvailability = employee.worker?.availability?.filter(ts => {
      const d = new Date(ts.seconds * 1000);
      return d.getMonth() !== month || d.getFullYear() !== year;
    }) || [];

    const newMonthAvailability = Array.from(draftDays).map(day => ({
      seconds: Math.floor(new Date(year, month, day).getTime() / 1000),
      nanoseconds: 0
    }));

    const finalAvailability = [...otherMonthsAvailability, ...newMonthAvailability];

    this.store.dispatch(updateWorkerEmployeeAction({
      personId: employee.person?.personId!,
      worker: {
        ...employee.worker!,
        availability: finalAvailability
      }
    }));

    this.editingEmployee.set(null);
    this.editDraft.set(new Set());
  }

  cancelEdit() {
    this.editingEmployee.set(null);
    this.editDraft.set(new Set());
  }
}