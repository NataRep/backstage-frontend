import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-show-detail',
  standalone: true,
  imports: [],
  templateUrl: './show-detail.component.html',
  styleUrl: './show-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowDetailComponent {

}
