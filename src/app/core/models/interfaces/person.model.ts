//персональные данные по всем персонам в приложении хранятся в отдельной базе для соблюдения закона о персональных данных
export interface Person {
  id?: number,
  personId: string,
  full_name: string,
  email?: string,
  phone?: string,
  telegram?: string,
  whatsapp?: string,
  vk?: string,
}


export interface PersonsProps {
  page?: number,
  limit?: number,
  ids?: string[]
}
