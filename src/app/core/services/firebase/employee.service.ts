import { Injectable } from "@angular/core";
import { QueryConstraint } from "firebase/firestore";
import { Observable } from "rxjs";
import { Employee } from "../../models/interfaces/emploeey.models";
import { FirebaseService, WithId } from "./firebase.service";

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly collectionName = 'employees';

  constructor(private firebase: FirebaseService) { }

  // ---- Create ----
  create(employee: Employee): Promise<string> {
    return this.firebase.create<Employee>(this.collectionName, employee);
  }

  setWithId(id: string, employee: Employee): Promise<void> {
    return this.firebase.setWithId<Employee>(this.collectionName, id, employee);
  }

  // ---- Read ----
  getOne(id: string): Promise<WithId<Employee> | null> {
    return this.firebase.getOne<Employee>(this.collectionName, id);
  }

  getAll(): Promise<WithId<Employee>[]> {
    return this.firebase.getAll<Employee>(this.collectionName);
  }

  query(constraints: QueryConstraint[]): Promise<WithId<Employee>[]> {
    return this.firebase.query<Employee>(this.collectionName, constraints);
  }

  // ---- Update ----
  update(id: string, patch: Partial<Employee>): Promise<void> {
    return this.firebase.update<Employee>(this.collectionName, id, patch);
  }

  // ---- Delete ----
  delete(id: string): Promise<void> {
    return this.firebase.delete(this.collectionName, id);
  }

  // ---- Subscriptions ----
  subscribeAll(constraints: QueryConstraint[] = []): Observable<WithId<Employee>[]> {
    return this.firebase.subscribeCollection<Employee>(this.collectionName, constraints);
  }

  subscribeOne(id: string): Observable<WithId<Employee> | null> {
    return this.firebase.subscribeDoc<Employee>(this.collectionName, id);
  }

  subscribeChanges(constraints: QueryConstraint[] = []): Observable<{ type: 'added' | 'modified' | 'removed', doc: WithId<Employee> }[]> {
    return this.firebase.subscribeCollectionChanges<Employee>(this.collectionName, constraints);
  }
}