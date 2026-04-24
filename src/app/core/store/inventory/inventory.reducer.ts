import { createReducer, on } from "@ngrx/store";
import { InventoryItem } from "../../models/interfaces/inventory.models";
import { createInventoryAction, createInventoryFailureAction, createInventorySuccessAction, deleteInventoryAction, deleteInventoryFailureAction, deleteInventorySuccessAction, getAllInventoryAction, getAllInventoryFailureAction, getAllInventorySuccessAction, inventoryStreamUpdatedAction, updateInventoryAction, updateInventoryFailureAction, updateInventorySuccessAction } from "./inventory.actions";

export interface InventoryState {
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  inventory: [],
  loading: false,
  error: null
};

export const InventoryReducer = createReducer(
  initialState,

  // --- Start Loading ---
  on(
    createInventoryAction,
    updateInventoryAction,
    deleteInventoryAction,
    getAllInventoryAction,
    (state) => ({
      ...state,
      loading: true,
      error: null,
    })
  ),

  // --- Success Operations ---
  on(createInventorySuccessAction, (state, { data }) => {
    // Проверяем, есть ли уже такой ID в стейте
    const exists = state.inventory.some(item => item.id === data.id);

    return {
      ...state,
      inventory: exists
        ? state.inventory.map(item => item.id === data.id ? data : item) // Обновляем, если нашли
        : [...state.inventory, data], // Добавляем новый, если не нашли
      loading: false,
    };
  }),

  on(updateInventorySuccessAction, (state, { data }) => ({
    ...state,
    inventory: state.inventory.map(item => item.id === data.id ? data : item),
    loading: false,
  })),

  on(deleteInventorySuccessAction, (state, { id }) => ({
    ...state,
    inventory: state.inventory.filter((item) => item.id !== id),
    loading: false,
  })),

  // --- Handle Data (One-time and Stream) ---
  on(
    getAllInventorySuccessAction,
    inventoryStreamUpdatedAction,
    (state, { items }) => ({
      ...state,
      inventory: items,
      loading: false,
      error: null,
    })
  ),

  // --- Failures ---
  on(
    createInventoryFailureAction,
    updateInventoryFailureAction,
    deleteInventoryFailureAction,
    getAllInventoryFailureAction,
    (state, { error }) => ({
      ...state,
      loading: false,
      error: error as string,
    })
  ),
);