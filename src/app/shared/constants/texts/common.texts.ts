import { Role } from "../../../core/models/enums/employee.enums";
import { InventoryCategory, InventoryType } from "../../../core/models/interfaces/inventory.models";
import { ShowType } from "../../../core/models/interfaces/show.model";

export const TEXT = {
  PROJECT_NAME: "Путь солнца",
};

/** Вспомогательный интерфейс для склонений */
export interface NounTranslation {
  singular: string;
  plural: string;
}


export type InventoryLabels = Record<InventoryType, NounTranslation>;

export const ROLE_RU: Record<Role, NounTranslation> = {
  owner: { singular: 'владелец', plural: 'владельцы' },
  manager: { singular: 'менеджер', plural: 'менеджеры' },
  fireworker: { singular: 'пиротехник', plural: 'пиротехники' },
  staff: { singular: 'техник', plural: 'техники' },
  artist: { singular: 'артист', plural: 'артисты' },
  driver: { singular: 'водитель', plural: 'водители' }
};


export type UniversalCategory = ShowType | InventoryCategory;

export const UNIVERSAL_CATEGORY_RU: Record<UniversalCategory, string> = {
  // Общие (Шоу + Заказы + Инвентарь)
  'firework': 'пиротехника',
  'fireshow': 'огненное шоу',
  'ledshow': 'световое шоу',
  'welcome': 'велком',
  'other': 'прочее',
  // Только инвентарь
  'stage': 'сцена',
};

export const INVENTORY_TYPES_RU: Record<InventoryType, NounTranslation> = {
  prop: { singular: 'реквизит', plural: 'реквизит' },
  consumable: { singular: 'расходник', plural: 'расходники' },
  equipment: { singular: 'оборудование', plural: 'оборудование' },
  costume: { singular: 'костюм', plural: 'костюмы' }
};
