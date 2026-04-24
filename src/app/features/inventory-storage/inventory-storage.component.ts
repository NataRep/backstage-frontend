import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { INVENTORY_CATEGORY, InventoryCategory, InventoryItem } from '../../core/models/interfaces/inventory.models';
import { selectCanEdit } from '../../core/store/auth/auth.selectors';
import { createInventoryAction } from '../../core/store/inventory/inventory.actions';
import { selectInventoryLoading } from '../../core/store/inventory/inventory.selector';
import { ModalContainerComponent } from '../../shared/components/modal-container/modal-container.component';
import { TabItem, TabsComponent } from '../../shared/components/tabs/tabs.component';
import { INVENTORY_CATEGORY_RU } from '../../shared/constants/texts/common.texts';
import { InventoryFormComponent } from '../inventory-form/inventory-form.component';
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
    InventoryTableComponent,
    ModalContainerComponent,
    InventoryFormComponent],
  templateUrl: './inventory-storage.component.html',
  styleUrl: './inventory-storage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryStorageComponent {

  @ViewChild('inventoryForm') inventoryForm!: InventoryFormComponent;

  private readonly store = inject(Store);
  private route = inject(ActivatedRoute);
  private queryParamsSignal = toSignal(this.route.queryParamMap);

  public readonly isLoading = this.store.selectSignal(selectInventoryLoading);
  public readonly canEdit = this.store.selectSignal(selectCanEdit);

  isCreateNewModalOpen = signal(false);

  category = computed(() => {
    const value = this.queryParamsSignal()?.get('category');
    return (value as InventoryCategory) || 'firework';
  });

  applicationTabs: TabItem[] = getInventoryTabs();

  openCreateModal() {
    this.isCreateNewModalOpen.set(true);
  }

  closeCreateModal() {
    this.inventoryForm?.resetForm();
    this.isCreateNewModalOpen.set(false);
  }

  createItem(data: InventoryItem) {
    this.store.dispatch(createInventoryAction({ data }))
    this.closeCreateModal()
  }
}
