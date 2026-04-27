import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SHOW_TYPES } from '../../../core/models/interfaces/show.model';
import { ShowsService } from '../../../core/services/shows.service';
import { getAllShowAction } from '../../../core/store/shows/shows.actions';
import { selectAllShow } from '../../../core/store/shows/shows.selector';
import { getCategoryTabs, TabItem, TabsComponent } from '../../../shared/components/tabs/tabs.component';

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

  readonly shows = this.store.selectSignal(selectAllShow);

  tabs: TabItem[] = getCategoryTabs(SHOW_TYPES);

  ngOnInit(): void {
    this.store.dispatch(getAllShowAction());
  }

}