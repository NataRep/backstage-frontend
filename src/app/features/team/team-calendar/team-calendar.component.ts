import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { HasUnsavedChanges } from '../../../core/guards/pending-changes.guard';
import { Role } from '../../../core/models/enums/employee.enums';
import { getDaysInMonth } from '../../../core/models/interfaces/calendar.model';
import { EmployeeProfile } from '../../../core/models/interfaces/employee.models';
import { selectAuthUser, selectCanEdit } from '../../../core/store/auth/auth.selectors';
import { getAllEmployeesAction, updateWorkerEmployeeAction } from '../../../core/store/employees/employees.actions';
import { selectAllActiveEmployees, selectEmployeesLoading } from '../../../core/store/employees/employees.selector';
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
export class TeamCalendarComponent extends BaseTableDirective<EmployeeProfile> implements OnInit, HasUnsavedChanges {
  // 1. HostListeners & Decorations
  @HostListener('window:resize')
  onResize() {
    this.calculatePageSize();
  }

  // 2. Dependency Injection
  private readonly store = inject(Store);

  // 3. BaseTableDirective Overrides
  protected override isTableLocked = () => !!this.editingEmployee();
  readonly dynamicPageSize = signal<number>(14);
  override pageSize = () => this.dynamicPageSize();
  protected override sourceData = () => this.filteredEmployees();

  // 4. Static / Constant Data
  readonly roles: Role[] = Object.values(Role);
  readonly rolesTranslate = ROLE_RU;
  private readonly todayMidnight = new Date().setHours(0, 0, 0, 0);

  // 5. Store Selectors (Signals)
  readonly allEmployees = this.store.selectSignal(selectAllActiveEmployees);
  readonly isLoading = this.store.selectSignal(selectEmployeesLoading);
  readonly currentUser = this.store.selectSignal(selectAuthUser);
  readonly canEdit = this.store.selectSignal(selectCanEdit);

  // 6. Local State (Signals)
  selectedPeriod = signal({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });
  selectedRole = signal<Role | 'all'>((this.route.snapshot.queryParamMap.get('role') as Role) || 'all');

  editingEmployee = signal<EmployeeProfile | null>(null);
  editDraft = signal<Set<number>>(new Set());

  hoverDay = signal<number | null>(null);
  isEditMode = signal<boolean>(false);

  // 7. Computed Properties
  readonly calendarDays = computed(() =>
    Array.from({ length: getDaysInMonth(this.selectedPeriod().month, this.selectedPeriod().year) }, (_, i) => i + 1)
  );

  readonly firstDayIndex = computed(() => {
    const { month, year } = this.selectedPeriod();
    return new Date(year, month, 1).getDay();
  });

  readonly availabilityMap = computed(() => {
    const { month, year } = this.selectedPeriod();
    const employees = this.filteredEmployees();
    const map = new Map<string, Set<number>>();

    employees.forEach(emp => {
      const personId = emp.person?.personId;

      if (!personId) return;

      const unavailableDays = new Set<number>();
      emp.worker?.availability?.forEach(timestamp => {
        const date = new Date(timestamp.seconds * 1000);
        if (date.getMonth() === month && date.getFullYear() === year) {
          unavailableDays.add(date.getDate());
        }
      });
      map.set(personId, unavailableDays);
    });
    return map;
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

  // 8. Lifecycle Hooks
  override ngOnInit() {
    super.ngOnInit();
    if (this.allEmployees().length === 0 && !this.isLoading()) {
      this.store.dispatch(getAllEmployeesAction());
    }
    this.calculatePageSize();
  }

  // 9. Public Business Logic & Event Handlers
  onDateChange(event: { month: number, year: number }) {
    this.selectedPeriod.set(event);
  }

  isPastDay(day: number): boolean {
    const { month, year } = this.selectedPeriod();
    const dateToCheck = new Date(year, month, day).getTime();
    return dateToCheck < this.todayMidnight;
  }

  isRowEditing(emp: EmployeeProfile): boolean {
    return emp.worker?.id === this.editingEmployee()?.worker?.id;
  }

  // 10. Edit Mode Actions
  toggleEdit(employee: EmployeeProfile) {
    const personId = employee.person?.personId;
    if (!personId) return;

    this.editingEmployee.update(current => {
      const currentId = current?.person?.personId;

      if (currentId === personId) {
        this.editDraft.set(new Set());
        return null;
      }

      const currentAvailability = this.availabilityMap().get(personId) ?? new Set<number>();

      this.editDraft.set(new Set(currentAvailability));

      return employee;
    });
  }

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

    const availability = employee.worker?.availability || [];

    const otherMonthsAvailability = availability.filter(ts => {
      const d = new Date(ts.seconds * 1000);
      return d.getMonth() !== month || d.getFullYear() !== year;
    }) || [];

    const newMonthAvailability = Array.from(draftDays).map(day => ({
      seconds: Math.floor(new Date(year, month, day).getTime() / 1000),
      nanoseconds: 0
    }));

    const personId = employee.person?.personId;
    const workerData = employee.worker;

    if (personId && workerData) {
      this.store.dispatch(updateWorkerEmployeeAction({
        personId,
        worker: {
          ...workerData,
          availability: [...otherMonthsAvailability, ...newMonthAvailability]
        }
      }));
    } else {
      console.warn('Не удалось обновить данные: personId или данные сотрудника отсутствуют', employee);
    }

    this.cancelEdit();
  }

  cancelEdit() {
    this.editingEmployee.set(null);
    this.editDraft.set(new Set());
  }

  // 11. Private Helpers
  protected override getExtraParams() {
    return { role: this.selectedRole() };
  }

  private calculatePageSize() {
    const rowHeight = 37;
    const headerHeight = 400;
    const availableHeight = window.innerHeight - headerHeight;
    const calculatedRows = Math.floor(availableHeight / rowHeight);
    this.dynamicPageSize.set(Math.max(calculatedRows, 5));
  }

  hasUnsavedChanges(): boolean {
    const employee = this.editingEmployee();

    if (!employee) return false;

    const personId = employee.person?.personId;
    const originalDays = (personId ? this.availabilityMap().get(personId) : null) ?? new Set<number>();
    const draftDays = this.editDraft();

    if (originalDays.size !== draftDays.size) return true;
    for (const day of originalDays) {
      if (!draftDays.has(day)) return true;
    }

    return false;
  }
}