import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-team-calendar',
  standalone: true,
  imports: [],
  templateUrl: './team-calendar.component.html',
  styleUrl: './team-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamCalendarComponent {

}
