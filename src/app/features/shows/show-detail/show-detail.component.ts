import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, of, switchMap } from 'rxjs';
import { InventoryItem } from '../../../core/models/interfaces/inventory.models';
import { InventoryService } from '../../../core/services/inventory.service';
import { ShowsService } from '../../../core/services/shows.service';
import { selectCanEdit } from '../../../core/store/auth/auth.selectors';
import { AudioPlayerComponent } from '../../../shared/components/audio-player/audio-player.component';
import { TabItem, TabsComponent } from '../../../shared/components/tabs/tabs.component';
import { INVENTORY_TYPES_RU, NounTranslation } from '../../../shared/constants/texts/common.texts';
import { DeclensionPipe } from '../../../shared/pipes/declension.pipe';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { PriceFormatPipe } from '../../../shared/pipes/price-format.pipe';

export interface RequiredInventoryEntry {
  item: InventoryItem;
  requiredCount: number;
}

export interface InventoryGroup {
  type: string;
  label: string;
  entries: RequiredInventoryEntry[];
}

@Component({
  selector: 'app-show-detail',
  standalone: true,
  imports: [
    TabsComponent,
    PriceFormatPipe,
    DeclensionPipe,
    DurationPipe,
    AudioPlayerComponent,
  ],
  templateUrl: './show-detail.component.html',
  styleUrl: './show-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowDetailComponent {
  private readonly route = inject(ActivatedRoute);
  readonly showService = inject(ShowsService);
  private readonly inventoryService = inject(InventoryService);

  private readonly actions = inject(Actions);
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  readonly canEdit = this.store.selectSignal(selectCanEdit);
  readonly inventoryLabels = INVENTORY_TYPES_RU;

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

  readonly allInventory = toSignal(
    this.inventoryService.getAll(),
    { initialValue: [] as InventoryItem[] }
  );

  readonly requiredInventoryGroups = computed<InventoryGroup[]>(() => {
    const requiredMap = this.show()?.requiredInventory;
    const items = this.allInventory();

    if (!requiredMap || !items.length) {
      return [];
    }

    const byId = new Map<string, InventoryItem>();
    for (const item of items) {
      if (item.id) {
        byId.set(item.id, item);
      }
    }
    const groupsMap = new Map<string, InventoryGroup>();

    for (const [id, rawCount] of Object.entries(requiredMap)) {
      const requiredCount = Number(rawCount) || 0;
      if (requiredCount <= 0) {
        continue;
      }

      const item = byId.get(id);
      if (!item) {
        continue;
      }

      const typeKey = String(item.type ?? 'other');
      let group = groupsMap.get(typeKey);

      if (!group) {
        const labelsMap = this.inventoryLabels as Record<string, NounTranslation>;
        const translation = labelsMap[typeKey];
        const label = translation?.plural ?? translation?.singular ?? typeKey;
        group = {
          type: typeKey,
          label,
          entries: [],
        };
        groupsMap.set(typeKey, group);
      }

      group.entries.push({
        item: {
          ...item,
          id: item.id ?? id,
        },
        requiredCount,
      });
    }

    return Array.from(groupsMap.values());
  });

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