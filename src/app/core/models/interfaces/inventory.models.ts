import { Timestamp } from "firebase/firestore";
import { SHOW_TYPES } from "./show.model";

export type Inventory = InventoryItem[];

export interface InventoryItem {
  id?: string;
  name: string;
  type: InventoryType;
  category: InventoryCategory;
  stockQuantity: number;
  conditionStatus: InventoryConditionStatus;
  comment: string;
  updatedAt: Timestamp | Date; // Firestore возвращает Timestamp, но мы можем конвертировать в Date
}

export const INVENTORY_TYPES = [
  'prop',
  'consumable',
  'equipment',
  'costume',
] as const;
export type InventoryType = typeof INVENTORY_TYPES[number];

export const INVENTORY_CATEGORY = [
  ...SHOW_TYPES,
  'stage',
  'other'
] as const;
export type InventoryCategory = typeof INVENTORY_CATEGORY[number];

export type InventoryConditionStatus = 1 | 2 | 3;