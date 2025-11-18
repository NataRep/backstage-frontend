import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Person } from "../models/interfaces/auth.models";

/**
 * во всех методах в качестве id используется localId персоны из firebase
 */

@Injectable({ providedIn: 'root' })
export class PersonsService {
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

  createPerson(body: Person): Observable<Person> {
    return this.http.post<Person>(`persons`, body);
  }

  updatePerson(id: string, body: {
    full_name?: string,
    email?: string,
    phone?: string,
    telegram?: string,
    whatsapp?: string,
    vk?: string,
  }): Observable<Person> {
    return this.http.patch<Person>(`persons/${id}`, body);
  }

  deletePerson(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`persons/${id}`);
  }

}

interface PersonsProps {
  page?: number,
  limit?: number,
  ids?: string[]
}