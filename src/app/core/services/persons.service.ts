import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserPersonal } from "../models/interfaces/auth.models";

/**
 * во всех методах в качестве id используется localId персоны из firebase
 */

@Injectable({ providedIn: 'root' })
export class PersonsService {
  private http = inject(HttpClient);

  getPersonById(id: string): Observable<UserPersonal> {
    return this.http.get<UserPersonal>(`persons/${id}`);
  }

  getAllPersons(props: PersonsProps): Observable<UserPersonal[]> {
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

    return this.http.get<UserPersonal[]>(`persons`, { params });
  }

  createPerson(body: UserPersonal): Observable<UserPersonal> {
    return this.http.post<UserPersonal>(`persons`, body);
  }

  updatePerson(id: string, body: {
    full_name?: string,
    email?: string,
    phone?: string,
    telegram?: string,
    whatsapp?: string,
    vk?: string,
  }): Observable<UserPersonal> {
    return this.http.patch<UserPersonal>(`persons/${id}`, body);
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