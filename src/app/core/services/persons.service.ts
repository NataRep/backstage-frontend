import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Person, PersonBase, PersonsProps } from "../models/interfaces/person.model";

/**
 * во всех методах в качестве id используется localId персоны из firebase
 * 
 */

@Injectable({ providedIn: 'root' })
export class PersonDataService {
  private http = inject(HttpClient);

  getPersonById(id: string): Observable<Person> {
    return this.http.get<Person>(`persons/${id}`);
  }

  getAllPersons(props: PersonsProps): Observable<Person[]> {
    let params = new HttpParams();

    // Заменяем any на unknown. Теперь это безопасно.
    const snakeProps = convertToSnakeRecursive(props) as Record<string, unknown>;

    if (snakeProps) {
      Object.entries(snakeProps).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, String(v)));
          } else {
            params = params.append(key, String(value));
          }
        }
      });
    }

    return this.http.get<Person[]>(`persons`, { params });
  }

  getAllEmployees(): Observable<Person[]> {
    return this.http.get<Person[]>(`employees`);
  }

  getAllClients(): Observable<Person[]> {
    return this.http.get<Person[]>(`clients`);
  }

  createPerson(body: Person): Observable<Person> {
    // Явно указываем unknown, чтобы HttpClient принял результат трансформации
    const payload = convertToSnakeRecursive(body);
    return this.http.post<Person>(`persons`, payload);
  }

  updatePerson(personId: string, body: PersonBase): Observable<Person> {
    const payload = convertToSnakeRecursive(body);
    return this.http.patch<Person>(`persons/${personId}`, payload);
  }

  deletePerson(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`persons/${id}`);
  }
}

/**
 * Рекурсивная конвертация ключей объекта из camelCase в snake_case.
 * Безопасно работает с any/unknown и соблюдает правила линтера.
 */
function convertToSnakeRecursive(obj: unknown): unknown {
  // 1. Обработка null или не объектов
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 2. Обработка массивов (проходим по каждому элементу)
  if (Array.isArray(obj)) {
    return obj.map(item => convertToSnakeRecursive(item));
  }

  // 3. Обработка объектов
  const result: Record<string, unknown> = {};
  const record = obj as Record<string, unknown>;

  for (const [key, value] of Object.entries(record)) {
    const snakeKey = key
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .toLowerCase();

    result[snakeKey] = convertToSnakeRecursive(value);
  }

  return result;
}