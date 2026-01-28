//персональные данные по всем персонам в приложении хранятся в отдельной базе для соблюдения закона о персональных данных (Firebase не подходит)
export type PersonType = 'employee' | 'client';

export interface PersonBase {
  type: PersonType;
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
  link: string;
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
