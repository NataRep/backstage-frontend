//персональные данные по всем персонам в приложении хранятся в отдельной базе для соблюдения закона о персональных данных

export interface PersonBase {
  full_name: string;
  email: string;
  phone?: string;
  social_links: SocialLink[];
}

export interface Person extends PersonBase {
  id: number;
  personId: string;
}

export interface SocialLink {
  type: SocialType;
  url: string;
}

export interface PersonsProps {
  page?: number;
  limit?: number;
  ids?: string[];
}

export enum SocialType {
  TELEGRAM = 'telegram',
  VK = 'vk',
  WHATSAPP = 'whatsapp',
  VIBER = 'viber',
  MAX = 'max',
  OTHER = 'other',
}
