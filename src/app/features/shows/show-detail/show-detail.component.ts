import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { ShowsService } from '../../../core/services/shows.service';
import { TabItem, TabsComponent } from '../../../shared/components/tabs/tabs.component';

@Component({
  selector: 'app-show-detail',
  standalone: true,
  imports: [TabsComponent],
  templateUrl: './show-detail.component.html',
  styleUrl: './show-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowDetailComponent {
  private readonly route = inject(ActivatedRoute);
  readonly showService = inject(ShowsService);

  readonly showId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id')?.trim() ?? '')),
    { initialValue: '' }
  );

  readonly show = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')?.trim() ?? ''),
      switchMap((id) => (id ? this.showService.getById(id) : of(null)))
    ),
    { initialValue: null }
  );

  readonly tabs = computed<TabItem[]>(() => {
    const type = this.show()?.type ?? null;
    return [
      {
        label: 'Назад к списку',
        routePath: '/shows/list',
        queryParams: type ? { category: type } : null,
        icon: 'back',
      },
    ];
  });

  constructor() {
    effect(() => {
      console.log('show:', this.show());
    });
  }
}