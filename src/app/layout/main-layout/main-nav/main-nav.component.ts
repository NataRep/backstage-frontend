import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/icons/components/icons/icons.component';

interface NavItem {
  title: string;
  link: string;
  icon: string;
}

export const MAIN_NAV: NavItem[] = [
  {
    title: "Dashboard",
    link: "dashboard",
    icon: "home"
  },
  {
    title: "Orders",
    link: "orders",
    icon: "calendar"
  },
  {
    title: "Team Management",
    link: "team",
    icon: "team"
  },
  {
    title: "Shows & Events",
    link: "shows",
    icon: "firework"
  },
  {
    title: "Tools storage",
    link: "Tools & Resources",
    icon: "storage"
  },
  {
    title: "Statistics & Analytics",
    link: "statistics",
    icon: "statistics"
  }
];

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [RouterModule, IconComponent],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainNavComponent {

  nav = MAIN_NAV;

}
