import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PAGE_LINKS_LIST } from '../../../core/models/page-links.models';
import { IconComponent } from '../../../shared/components/icons/icons.component';

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
