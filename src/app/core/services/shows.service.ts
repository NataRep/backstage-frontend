import { inject, Injectable } from "@angular/core";
import { QueryConstraint } from "firebase/firestore";
import { from, Observable, retry, RetryConfig } from "rxjs";
import { ShowItem } from "../models/interfaces/show.model";
import { APP_RETRY_CONFIG } from "../models/retry-config.model";
import { FirebaseService } from "./firebase/firebase-base.service";

@Injectable({ providedIn: 'root' })
export class ShowsService {
  private readonly collectionName = 'services';
  private firebase = inject(FirebaseService);
  private retryConfig: RetryConfig = inject(APP_RETRY_CONFIG);


  create(data: ShowItem): Observable<string> {
    return from(this.firebase.create<ShowItem>(this.collectionName, data));
  }

  // ---- Read ----
  getById(id: string): Observable<ShowItem | null> {
    return from(this.firebase.getOneByField<ShowItem>(this.collectionName, 'id', id));
  }

  getAll(): Observable<ShowItem[]> {
    return from(this.firebase.getAll<ShowItem>(this.collectionName));
  }

  query(constraints: QueryConstraint[]): Observable<(ShowItem)[]> {
    return from(this.firebase.query<ShowItem>(this.collectionName, constraints));
  }

  // ---- Update ----
  update(id: string, patch: Partial<ShowItem>): Observable<void> {
    return from(this.firebase.update<ShowItem>(this.collectionName, id, patch));
  }

  // ---- Delete ----
  delete(id: string): Observable<void> {
    return from(this.firebase.delete(this.collectionName, id));
  }

  // ---- Subscriptions ----
  subscribeAll(constraints: QueryConstraint[] = []): Observable<(ShowItem)[]> {
    return this.firebase.subscribeCollection<ShowItem>(this.collectionName, constraints).pipe(retry(this.retryConfig));
  }

  subscribeChanges(constraints: QueryConstraint[] = []): Observable<{ type: 'added' | 'modified' | 'removed', doc: ShowItem }[]> {
    return this.firebase.subscribeCollectionChanges<ShowItem>(this.collectionName, constraints).pipe(retry(this.retryConfig));
  }
}