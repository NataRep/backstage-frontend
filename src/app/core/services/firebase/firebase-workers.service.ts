import { inject, Injectable } from "@angular/core";
import { QueryConstraint, where } from "firebase/firestore";
import { Observable } from "rxjs";
import { Worker } from "../../models/interfaces/employee.models";
import { FirebaseService, WithId } from "./firebase-base.service";


@Injectable({ providedIn: 'root' })
export class WorkerDataService {
  private readonly collectionName = 'employees';
  private firebase = inject(FirebaseService);

  // ---- Create ----
  create(worker: Worker): Promise<string> {
    return this.firebase.create<Worker>(this.collectionName, worker);
  }

  // ---- Read ----
  getByPersonId(personId: string): Promise<WithId<Worker> | null> {
    return this.firebase.getOneByField<Worker>(this.collectionName, 'personId', personId);
  }

  getAll(): Promise<WithId<Worker>[]> {
    return this.firebase.getAll<Worker>(this.collectionName);
  }

  getAllActiveWorkers(): Promise<WithId<Worker>[]> {
    const activeConstraint = where('isActive', '==', true);
    return this.firebase.query<Worker>(this.collectionName, [activeConstraint]);
  }

  query(constraints: QueryConstraint[]): Promise<WithId<Worker>[]> {
    return this.firebase.query<Worker>(this.collectionName, constraints);
  }

  // ---- Update ----
  update(id: string, patch: Partial<Worker>): Promise<void> {
    return this.firebase.update<Worker>(this.collectionName, id, patch);
  }

  // ---- Delete ----
  delete(id: string): Promise<void> {
    return this.firebase.delete(this.collectionName, id);
  }

  // ---- Subscriptions ----
  subscribeAll(constraints: QueryConstraint[] = []): Observable<WithId<Worker>[]> {
    return this.firebase.subscribeCollection<Worker>(this.collectionName, constraints);
  }

  subscribeOne(id: string): Observable<WithId<Worker> | null> {
    return this.firebase.subscribeDoc<Worker>(this.collectionName, id);
  }

  subscribeChanges(constraints: QueryConstraint[] = []): Observable<{ type: 'added' | 'modified' | 'removed', doc: WithId<Worker> }[]> {
    return this.firebase.subscribeCollectionChanges<Worker>(this.collectionName, constraints);
  }
}