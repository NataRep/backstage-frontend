import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/components/icons/icons.component';
import { PAGE_LINKS_LIST } from '../models/main-layout.models';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [RouterModule, IconComponent],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainNavComponent {
  navList = PAGE_LINKS_LIST;
}
