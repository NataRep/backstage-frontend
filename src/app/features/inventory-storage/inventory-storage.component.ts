import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { INVENTORY_CATEGORY, InventoryCategory } from '../../core/models/interfaces/inventory.models';
import { selectCanEdit } from '../../core/store/auth/auth.selectors';
import { selectInventoryLoading } from '../../core/store/inventory/inventory.selector';
import { TabItem, TabsComponent } from '../../shared/components/tabs/tabs.component';
import { INVENTORY_CATEGORY_RU } from '../../shared/constants/texts/common.texts';
import { InventoryTableComponent } from '../inventory-table/inventory-table.component';

export const getInventoryTabs = (): TabItem[] => {
  return INVENTORY_CATEGORY.map(key => ({
    label: INVENTORY_CATEGORY_RU[key],
    link: key,
    icon: key
  }));
};

@Component({
  selector: 'app-inventory-storage',
  standalone: true,
  imports: [CommonModule,
    TabsComponent,
    InventoryTableComponent,],
  templateUrl: './inventory-storage.component.html',
  styleUrl: './inventory-storage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryStorageComponent {
  private readonly store = inject(Store);
  private route = inject(ActivatedRoute);
  private queryParamsSignal = toSignal(this.route.queryParamMap);
  public readonly isLoading = this.store.selectSignal(selectInventoryLoading);
  public readonly canEdit = this.store.selectSignal(selectCanEdit);

  category = computed(() => {
    const value = this.queryParamsSignal()?.get('category');
    return (value as InventoryCategory) || 'firework';
  });



  applicationTabs: TabItem[] = getInventoryTabs();
}
