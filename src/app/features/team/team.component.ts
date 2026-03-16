import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabItem, TabsComponent } from '../../shared/components/tabs/tabs.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule,
    RouterOutlet,
    TabsComponent],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamComponent {
  tabs: TabItem[] = [
    {
      label: "Team list",
      link: "list",
      icon: "team"
    },
    {
      label: "Availability calendar",
      link: "availability",
      icon: "calendar"
    }
  ]

}
