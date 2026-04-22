import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icons/icons.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, IconComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {

}
