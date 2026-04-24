import { inject, Injectable } from "@angular/core";
import { QueryConstraint } from "firebase/firestore";
import { from, Observable, retry, RetryConfig } from "rxjs";
import { InventoryItem } from "../../models/interfaces/inventory.models";
import { APP_RETRY_CONFIG } from "../../models/retry-config.model";
import { FirebaseService } from "./firebase-base.service";

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly collectionName = 'inventory';
  private firebase = inject(FirebaseService);
  private retryConfig: RetryConfig = inject(APP_RETRY_CONFIG);


  create(data: InventoryItem): Observable<string> {
    return from(this.firebase.create<InventoryItem>(this.collectionName, data));
  }

  // ---- Read ----
  getById(id: string): Observable<InventoryItem | null> {
    return from(this.firebase.getOneByField<InventoryItem>(this.collectionName, 'id', id));
  }

  getAll(): Observable<InventoryItem[]> {
    return from(from(this.firebase.getAll<InventoryItem>(this.collectionName)));
  }

  query(constraints: QueryConstraint[]): Observable<InventoryItem[]> {
    return from(this.firebase.query<InventoryItem>(this.collectionName, constraints));
  }

  // ---- Update ----
  update(id: string, patch: Partial<InventoryItem>): Observable<void> {
    return from(this.firebase.update<InventoryItem>(this.collectionName, id, patch));
  }

  // ---- Delete ----
  delete(id: string): Observable<void> {
    return from(this.firebase.delete(this.collectionName, id));
  }

  // ---- Subscriptions ----
  subscribeAll(constraints: QueryConstraint[] = []): Observable<InventoryItem[]> {
    return this.firebase.subscribeCollection<InventoryItem>(this.collectionName, constraints).pipe(retry(this.retryConfig));
  }

  subscribeChanges(constraints: QueryConstraint[] = []): Observable<{ type: 'added' | 'modified' | 'removed', doc: InventoryItem }[]> {
    return this.firebase.subscribeCollectionChanges<InventoryItem>(this.collectionName, constraints).pipe(retry(this.retryConfig));
  }
}
