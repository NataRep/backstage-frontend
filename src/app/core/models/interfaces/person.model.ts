//персональные данные по всем персонам в приложении хранятся в отдельной базе для соблюдения закона о персональных данных
export interface SocialLink {
  type: string,
  url: string
}

export interface Person {
  id?: number,
  personId: string,
  full_name: string,
  email?: string,
  phone?: string,
  social_links: SocialLink[],
}


export interface PersonsProps {
  page?: number,
  limit?: number,
  ids?: string[]
}
