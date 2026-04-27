
/** Базовая модель для простых заказов (Пиротехника, Welcome) */
export interface BaseShow {
  id?: string;
  isActive: boolean;
  type: showType;
  title: string;
  description: string;
  viewImg: MediaMetadata;
  comment: string;
}

/** Расширенная модель для программ (Fire/Led Show) */
export interface FullShowItem extends BaseShow {
  duration: number;
  price: number;
  requiredRoles: ShowRoles;
  requiredInventory: ShowInventory;
  music: MediaMetadata;
}

export type ShowItem = FullShowItem | BaseShow;

export type showType = 'firework' | 'fireshow' | 'ledshow' | 'welcome' | 'other';

export const SHOW_TYPES = [
  'firework',
  'fireshow',
  'ledshow',
  'welcome',
] as const;
export type ShowType = typeof SHOW_TYPES[number];

/** Вспомогательные интерфейсы для вложенных объектов (Maps) */
export interface MediaMetadata {
  name: string;
  url: string;
  metadata: {
    size: number;
    format: string;
    duration?: number; // Для аудио
  };
}

export interface ShowRoles {
  artist: number;
  tech: number;
}

export interface ShowInventory {
  prop: string[];
  consumable: string[];
  equipment: string[];
  costume: string[];
}

export const SAFETY_ITEMS_RU = {
  first_aid: 'аптечка',
  extinguisher: 'огнетушитель',
  blanket: 'ткань для тушения',
  stands: 'подставки под реквизит',
  soaking: 'замочка',
  fuel: 'керосин'
} as const;

export const FIRE_SAFETY_KIT: ShowInventory = {
  prop: [],
  consumable: [SAFETY_ITEMS_RU.fuel],
  equipment: [
    SAFETY_ITEMS_RU.first_aid,
    SAFETY_ITEMS_RU.extinguisher,
    SAFETY_ITEMS_RU.blanket,
    SAFETY_ITEMS_RU.stands,
    SAFETY_ITEMS_RU.soaking
  ],
  costume: []
};