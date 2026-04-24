import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InventoryState } from './inventory.reducer';

export const selectInventoryState = createFeatureSelector<InventoryState>('inventory');

export const selectAllInventory = createSelector(
  selectInventoryState,
  (state: InventoryState) => state.inventory
);

export const selectInventoryLoading = createSelector(
  selectInventoryState,
  (state: InventoryState) => state.loading
);

export const selectInventoryError = createSelector(
  selectInventoryState,
  (state: InventoryState) => state.error
);

export const selectInventoryByCategory = (category: string | null) => createSelector(
  selectAllInventory,
  (inventory) => {
    if (!category) return inventory;
    return inventory.filter(item => item.category === category);
  }
);

export const selectInventoryItemById = (id: string) => createSelector(
  selectAllInventory,
  (inventory) => inventory.find(item => item.id === id) || null
);