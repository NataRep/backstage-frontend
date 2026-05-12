export interface ShowItem {
  id?: string;
  isActive: boolean;
  type: ShowType;
  title: string;
  description: string;
  price: number;
  duration: number;
  requiredRoles: ShowRoles;
  requiredInventory: Record<string, number>;
  viewImg: MediaMetadata;
  audio?: MediaMetadata;
  comment: string;
}

export interface ShowRoles {
  artist: number;
  tech: number;
  fireworker: number;
}

export type showType = 'firework' | 'fireshow' | 'ledshow' | 'welcome';

export const SHOW_TYPES = [
  'firework',
  'fireshow',
  'ledshow',
  'welcome',
] as const;
export type ShowType = typeof SHOW_TYPES[number];

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
  fireworker: number;
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