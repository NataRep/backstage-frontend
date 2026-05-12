import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, untracked, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SHOW_TYPES } from '../../../core/models/interfaces/show.model';
import { ShowsService } from '../../../core/services/shows.service';
import { selectCanEdit } from '../../../core/store/auth/auth.selectors';
import { createShowAction, getAllShowAction } from '../../../core/store/shows/shows.actions';
import { selectAllShow } from '../../../core/store/shows/shows.selector';
import { IconComponent } from '../../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../../shared/components/modal-container/modal-container.component';
import { getCategoryTabs, TabItem, TabsComponent } from '../../../shared/components/tabs/tabs.component';
import { filterData } from '../../../shared/utils/filter.utils';
import { ShowFormComponent } from '../show-form/show-form.component';
import { CreateShowPayload } from '../show-form/show-form.models';
import { ShowItemComponent } from './show-item/show-item.component';

@Component({
  selector: 'app-show-list',
  standalone: true,
  imports: [TabsComponent,
    ModalContainerComponent,
    ShowFormComponent,
    ShowItemComponent,
    IconComponent],
  templateUrl: './show-list.component.html',
  styleUrl: './show-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowListComponent implements OnInit {
  @ViewChild('showForm') showForm!: ShowFormComponent;

  readonly showService = inject(ShowsService);
  readonly store = inject(Store);
  readonly actions = inject(Actions);
  private route = inject(ActivatedRoute);

  tabs: TabItem[] = getCategoryTabs(SHOW_TYPES);
  private readonly queryParams = toSignal(this.route.queryParamMap);
  readonly currentCategory = computed(() => this.queryParams()?.get('category'));

  public readonly canEdit = this.store.selectSignal(selectCanEdit);
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

  isCreateNewModalOpen = signal(false);

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

  createNewShow(data: CreateShowPayload) {
    this.store.dispatch(createShowAction({ data }));
    this.closeCreateModal();
  }

  openCreateModal() {
    this.isCreateNewModalOpen.set(true);
  }

  closeCreateModal() {
    this.showForm?.resetForm();
    this.isCreateNewModalOpen.set(false);
  }
}