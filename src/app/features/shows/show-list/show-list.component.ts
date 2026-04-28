import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SHOW_TYPES } from '../../../core/models/interfaces/show.model';
import { ShowsService } from '../../../core/services/shows.service';
import { getAllShowAction } from '../../../core/store/shows/shows.actions';
import { selectAllShow } from '../../../core/store/shows/shows.selector';
import { getCategoryTabs, TabItem, TabsComponent } from '../../../shared/components/tabs/tabs.component';
import { filterData } from '../../../shared/utils/filter.utils';

@Component({
  selector: 'app-show-list',
  standalone: true,
  imports: [TabsComponent],
  templateUrl: './show-list.component.html',
  styleUrl: './show-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowListComponent implements OnInit {
  readonly showService = inject(ShowsService);
  readonly store = inject(Store);
  readonly actions = inject(Actions);
  private route = inject(ActivatedRoute);

  tabs: TabItem[] = getCategoryTabs(SHOW_TYPES);
  private readonly queryParams = toSignal(this.route.queryParamMap);
  readonly currentCategory = computed(() => this.queryParams()?.get('category'));

  readonly allShows = this.store.selectSignal(selectAllShow);
  readonly searchQuery = signal('');

  readonly filteredShows = computed(() =>
    filterData(this.allShows(), {
      query: this.searchQuery(),
      searchFields: (s) => [s.title, s.description],
      category: this.currentCategory() || undefined,
      categoryField: 'type',
      sortField: (s) => s.title
    })
  );

  constructor() {
    effect(() => {
      this.currentCategory();
      untracked(() => {
        this.searchQuery.set('');
      });
    });
  }

  ngOnInit(): void {
    this.store.dispatch(getAllShowAction());
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

}