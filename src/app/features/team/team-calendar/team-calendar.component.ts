import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Role } from '../../../core/models/enums/employee.enums';
import { getDaysInMonth } from '../../../core/models/interfaces/calendar.model';
import { EmployeeProfile, WorkerBase } from '../../../core/models/interfaces/employee.models';
import { Person } from '../../../core/models/interfaces/person.model';
import { selectAuthUser, selectCanEdit } from '../../../core/store/auth/auth.selectors';
import { getAllEmployeesAction, updateEmployeeAction } from '../../../core/store/employees/employees.actions';
import { selectAllEmployees, selectEmployeesLoading } from '../../../core/store/employees/employees.selector';
import { CalendarPikerComponent } from '../../../shared/components/calendar-piker/calendar-piker.component';
import { BaseTableDirective } from '../../../shared/components/data-table/base-table.directive';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { IconComponent } from '../../../shared/components/icons/icons.component';
import { ROLE_RU } from '../../../shared/constants/texts/common.texts';
import { RoleTranslatePipe } from '../../../shared/pipes/translateRole';

@Component({
  selector: 'app-team-calendar',
  standalone: true,
  imports: [IconComponent,
    DataTableComponent,
    RoleTranslatePipe,
    CalendarPikerComponent],
  templateUrl: './team-calendar.component.html',
  styleUrl: './team-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamCalendarComponent extends BaseTableDirective<EmployeeProfile> implements OnInit {
  private store = inject(Store);
  private actions = inject(Actions);
  override pageSize = () => 14;
  protected override sourceData = () => this.filteredEmployees();

  protected override getExtraParams() {
    return { role: this.selectedRole() };
  }

  readonly roles: Role[] = Object.values(Role);
  readonly rolesTranslate = ROLE_RU;

  allEmployees = this.store.selectSignal(selectAllEmployees);
  isLoading = this.store.selectSignal(selectEmployeesLoading);
  currentUser = this.store.selectSignal(selectAuthUser);
  canEdit = this.store.selectSignal(selectCanEdit);
  selectedEmployee = signal<EmployeeProfile | null>(null);
  selectedRole = signal<Role | 'all'>((this.route.snapshot.queryParamMap.get('role') as Role) || 'all');
  selectedPeriod = signal({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  onDateChange(event: { month: number, year: number }) {
    console.log('Новый период:', event);
    this.selectedPeriod.set(event);

    console.log("this.selectedPeriod", this.selectedPeriod())

    // Здесь ты можешь вызвать метод загрузки данных с бэкенда
    // this.loadEmployeesForPeriod(event);
  }

  readonly calendarDays = Array.from({ length: getDaysInMonth(this.selectedPeriod().month, this.selectedPeriod().year) }, (_, i) => i);

  filteredEmployees = computed(() => {
    const list = this.allEmployees();
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.selectedRole();

    if (list.length === 0) return [];

    const filtered = list.filter(emp => {
      const fullName = emp.person?.fullName.toLowerCase() || '';

      const matchesName = !query || fullName
        .split(" ")
        .some(word => word.startsWith(query));

      const matchesRole = role === 'all' ||
        emp.worker?.roles?.some(r => String(r).toLowerCase() === String(role).toLowerCase());

      return matchesName && matchesRole;
    });

    return filtered.sort((a, b) =>
      (a.person?.fullName || '').localeCompare(b.person?.fullName || '')
    );
  });

  override ngOnInit() {
    super.ngOnInit();
    if (this.allEmployees().length === 0 && !this.isLoading()) {
      this.store.dispatch(getAllEmployeesAction());
    }
  }


  updateSelectedEmployee(data: { person: Person; worker: WorkerBase }) {
    const selectedEmployee = this.selectedEmployee();

    if (!selectedEmployee) return;

    this.store.dispatch(updateEmployeeAction({
      personId: selectedEmployee.person?.personId!,
      person: { ...data.person },
      worker: { ...data.worker }
    }))
  }

}
