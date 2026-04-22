import { Role } from "../../../core/models/enums/employee.enums";
import { InventoryType } from "../../../core/models/interfaces/inventory.models";

export const TEXT = {
  PROJECT_NAME: "Путь солнца",
};

export const ROLE_RU: Record<
  Role,
  { singular: string; plural: string }
> = {
  owner: {
    singular: 'владелец',
    plural: 'владельцы'
  },
  manager: {
    singular: 'менеджер',
    plural: 'менеджеры'
  },
  fireworker: {
    singular: 'пиротехник',
    plural: 'пиротехники'
  },
  staff: {
    singular: 'техник',
    plural: 'техники'
  },
  artist: {
    singular: 'артист',
    plural: 'артисты'
  },
  driver: {
    singular: 'водитель',
    plural: 'водители'
  }
};

export const INVENTORY_CATEGORY_RU = {
  'firework': 'пиротехника',
  'fireshow': 'огненное шоу',
  'ledshow': 'световое шоу',
  'stage': 'сцена',
  'other': 'прочее'
};

export const INVENTORY_TYPES_RU: Record<
  InventoryType,
  { singular: string; plural: string }
> = {
  prop: {
    singular: 'реквизит',
    plural: 'реквизит'
  },
  consumable: {
    singular: 'расходник',
    plural: 'расходники'
  },
  equipment: {
    singular: 'оборудование',
    plural: 'оборудование'
  },
  costume: {
    singular: 'костюм',
    plural: 'костюмы'
  }
};
