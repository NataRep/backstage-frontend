import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { getAllEmployeesAction } from '../../core/store/employees/employees.actions';
import { selectAllEmployees } from '../../core/store/employees/employees.selector';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements OnInit {
  // Таблица сотрудников
  //1. запрашиваем список всех работников с бека - диспатч экшена
  // 2. из стора берем список работников
  // 3. отображаем список на странице
  // 4. для отображения большого списка используем 

  // Кнопка Добавить нового
  // 1. по клику открываю форму в модалке
  // 2. отправляю данные нового работника - диспатч экшена
  // 3. в сторе в случае успеха добавляю нового работника в список

  // Фильтры по Роли - Фильтрация через Computed Signal
  // Поиск по имени - Фильтрация через Computed Signal
  private store = inject(Store);

  employees = this.store.selectSignal(selectAllEmployees);

  ngOnInit() {
    this.store.dispatch(getAllEmployeesAction());
  }

}
