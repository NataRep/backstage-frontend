import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { SHOW_TYPES, ShowType } from '../../core/models/interfaces/show.model';
import { selectShowLoading } from '../../core/store/shows/shows.selector';

@Component({
  selector: 'app-shows',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowsComponent {
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly store = inject(Store);

  private queryParamsSignal = toSignal(this.route.queryParamMap);

  public readonly isLoading = this.store.selectSignal(selectShowLoading);

  category = computed<ShowType>(() => {
    const value = this.queryParamsSignal()?.get('category');
    return SHOW_TYPES.includes(value as ShowType) ? (value as ShowType) : 'fireshow';
  });

  constructor() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.category(),
      },
      queryParamsHandling: 'merge',
    });
  }
}
