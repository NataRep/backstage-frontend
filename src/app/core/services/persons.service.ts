import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserPersonal } from "../models/interfaces/auth.models";

@Injectable({ providedIn: 'root' })
export class PersonsService {
  private http = inject(HttpClient);

  getPersonByFirebaseId(id: string): Observable<UserPersonal> {
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
    if (props.ids) {
      params = params.append('ids', props.ids.toString());
    }

    return this.http.get<UserPersonal[]>(`persons`, { params });
  }

}

interface PersonsProps {
  page?: number,
  limit?: number,
  ids?: number
}