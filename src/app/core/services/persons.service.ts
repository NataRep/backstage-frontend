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
    if (props.page) {
      params = params.append('page', props.page.toString());
    }
    if (props.limit) {
      params = params.append('limit', props.limit.toString());
    }
    if (props.ids?.length) {
      props.ids.forEach(id => {
        params = params.append('ids', id);
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
    console.log("createPerson", convertObjectKeysToSnake(body));
    return this.http.post<Person>(`persons`, convertObjectKeysToSnake(body));
  }

  updatePerson(personId: string, body: PersonBase): Observable<Person> {
    return this.http.patch<Person>(`persons/${personId}`, convertObjectKeysToSnake(body));
  }

  deletePerson(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`persons/${id}`);
  }

}

interface AnyObject {
  [key: string]: any;
}

function convertObjectKeysToSnake(obj: AnyObject): AnyObject {
  const result: AnyObject = {};

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .toLowerCase();

    result[snakeKey] = value;
  }

  return result;
}