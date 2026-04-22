import { createAction, props } from "@ngrx/store";
import { InventoryItem } from "../../models/interfaces/inventory.models";

// --- Create ---
export const createInventoryAction = createAction('[Inventory] Create', props<{ data: InventoryItem }>());
export const createInventorySuccessAction = createAction('[Inventory] Create Success', props<{ data: InventoryItem }>());
export const createInventoryFailureAction = createAction('[Inventory] Create Failure', props<{ error: string }>());

// --- Update ---
export const updateInventoryAction = createAction('[Inventory] Update', props<{ data: InventoryItem }>());
export const updateInventorySuccessAction = createAction('[Inventory] Update Success', props<{ data: InventoryItem }>());
export const updateInventoryFailureAction = createAction('[Inventory] Update Failure', props<{ error: string }>());

// --- Delete ---
export const deleteInventoryAction = createAction('[Inventory] Delete by id', props<{ id: string }>());
export const deleteInventorySuccessAction = createAction('[Inventory] Delete Success', props<{ id: string }>());
export const deleteInventoryFailureAction = createAction('[Inventory] Delete Failure', props<{ error: string }>());

// --- Read (One-time) ---
export const getAllInventoryAction = createAction('[Inventory] Get All');
export const getAllInventorySuccessAction = createAction('[Inventory] Get All Success', props<{ items: InventoryItem[] }>());
export const getAllInventoryFailureAction = createAction('[Inventory] Get All Failure', props<{ error: string }>());

// --- Subscriptions (Realtime) ---
// Запуск прослушивания Firebase
export const subscribeAllInventoryAction = createAction('[Inventory] Subscribe All');
// Остановка прослушивания (вызывать при OnDestroy компонента)
export const unsubscribeAllInventoryAction = createAction('[Inventory] Unsubscribe All');
// Экшен, который будет диспатчить эффект при каждом обновлении в Firebase
export const inventoryStreamUpdatedAction = createAction('[Inventory] Stream Updated', props<{ items: InventoryItem[] }>());