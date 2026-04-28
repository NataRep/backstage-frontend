import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InventoryItem } from '../../models/interfaces/inventory.models';
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

export const selectInventoryEntities = createSelector(
  selectAllInventory,
  (inventory) => inventory.reduce((acc, item) => {
    if (item.id) acc[item.id] = item;
    return acc;
  }, {} as Record<string, InventoryItem>)
);

export const selectInventoryItemById = (id: string) => createSelector(
  selectInventoryEntities,
  (entities) => entities[id] || null
);

export const selectInventoryGroupedByCategory = (category: string | null) => createSelector(
  selectAllInventory,
  (allInventory) => {
    const filtered = category
      ? allInventory.filter(i => i.category === category)
      : [];

    return {
      equipment: filtered.filter(i => i.type === 'equipment'),
      costumes: filtered.filter(i => i.type === 'costume'),
      consumables: filtered.filter(i => i.type === 'consumable'),
      props: filtered.filter(i => i.type === 'prop'),
    };
  }
);