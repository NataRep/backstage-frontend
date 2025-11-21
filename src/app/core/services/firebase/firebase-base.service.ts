import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection as collectionFn,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  query as firestoreQuery,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  QueryConstraint,
  QuerySnapshot,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type WithId<T> = T & { id: string };

/**
 * Универсальный сервис для работы с Firestore.
 * НЕ занимается авторизацией.
 */

@Injectable({ providedIn: 'root' })

export class FirebaseService {

  private db = inject(Firestore);

  constructor() {
    console.log('🔥 FirebaseService constructor called');
    console.log('🔥 Firestore instance:', this.db);

    if (!this.db) {
      console.error('❌ Firestore is not available!');
    } else {
      console.log('✅ Firestore injected successfully');
    }
  }

  // ---- Helpers ----
  private colRef(collectionName: string): CollectionReference<DocumentData> {
    return collectionFn(this.db, collectionName) as CollectionReference<DocumentData>;
  }

  private docRef(collectionName: string, id: string): DocumentReference<DocumentData> {
    return doc(this.db, collectionName, id) as DocumentReference<DocumentData>;
  }

  private snapshotToEntity<T>(snap: DocumentSnapshot<DocumentData>): WithId<T> | null {
    if (!snap.exists()) return null;
    const data = snap.data() as T;
    return { ...(data as object), id: snap.id } as WithId<T>;
  }

  private querySnapshotToEntities<T>(snap: QuerySnapshot<DocumentData>): Array<WithId<T>> {
    return snap.docs.map(d => ({ ...(d.data() as T), id: d.id } as WithId<T>));
  }

  async exists(collectionName: string, id: string): Promise<boolean> {
    const doc = await this.getOne(collectionName, id);
    return doc !== null;
  }

  // ---- Create ----
  /**
   * Создать документ с автогенерацией id. Возвращает id созданного документа.
   */
  async create<T>(collectionName: string, data: T): Promise<string> {
    const ref = await addDoc(this.colRef(collectionName), data as DocumentData);
    return ref.id;
  }

  /**
   * Создать/перезаписать документ с указанным id.
   * Если нужно только обновить поля — используйте update().
   */
  async setWithId<T>(collectionName: string, id: string, data: T): Promise<void> {
    await setDoc(this.docRef(collectionName, id), data as DocumentData);
  }

  // ---- Read ----
  async getOne<T>(collectionName: string, id: string): Promise<WithId<T> | null> {
    const snap = await getDoc(this.docRef(collectionName, id));
    return this.snapshotToEntity<T>(snap);
  }

  async getAllByField<T>(
    collectionName: string,
    field: string,
    value: any
  ): Promise<Array<WithId<T>>> {
    const q = firestoreQuery(
      this.colRef(collectionName),
      where(field, '==', value)
    );
    const snap = await getDocs(q);
    return this.querySnapshotToEntities<T>(snap);
  }

  async getOneByField<T>(
    collectionName: string,
    field: string,
    value: any
  ): Promise<WithId<T> | null> {
    const q = firestoreQuery(
      this.colRef(collectionName),
      where(field, '==', value),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : this.querySnapshotToEntities<T>(snap)[0];
  }

  async getAll<T>(collectionName: string): Promise<Array<WithId<T>>> {
    const snap = await getDocs(this.colRef(collectionName));
    return this.querySnapshotToEntities<T>(snap);
  }

  /**
   * Выполнить запрос с набором QueryConstraint (where, orderBy, limit и т.д.)
   * Пример constraints: [where('status', '==', 'open'), orderBy('createdAt', 'desc'), limit(20)]
   */
  async query<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<Array<WithId<T>>> {
    const q = firestoreQuery(this.colRef(collectionName), ...constraints);
    const snap = await getDocs(q);
    return this.querySnapshotToEntities<T>(snap);
  }

  // ---- Update ----
  async update<T>(collectionName: string, id: string, patch: Partial<T>): Promise<void> {
    await updateDoc(this.docRef(collectionName, id), patch as DocumentData);
  }

  // ---- Delete ----
  async delete(collectionName: string, id: string): Promise<void> {
    await deleteDoc(this.docRef(collectionName, id));
  }

  // ---- Batch / Transaction-like batch writes ----
  /**
   * Выполнить пачку операций (set/update/delete).
   * operations — массив объектов вида:
   * { type: 'set'|'update'|'delete', collection: 'name', id?: 'id', data?: any }
   */
  async batch(operations: Array<{ type: 'set' | 'update' | 'delete', collection: string, id: string, data?: any }>): Promise<void> {
    const b = writeBatch(this.db);
    for (const op of operations) {
      const dref = this.docRef(op.collection, op.id);
      if (op.type === 'set') b.set(dref, op.data);
      if (op.type === 'update') b.update(dref, op.data);
      if (op.type === 'delete') b.delete(dref);
    }
    await b.commit();
  }

  // ---- Pagination
  async queryWithPagination<T>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    pageSize = 20,
    startAfterDoc?: DocumentSnapshot<DocumentData>
  ): Promise<{ data: Array<WithId<T>>, lastDoc?: DocumentSnapshot<DocumentData> }> {
    const allConstraints = [...constraints, orderBy('__name__'), limit(pageSize)];
    const q = startAfterDoc ? firestoreQuery(this.colRef(collectionName), ...allConstraints, startAfter(startAfterDoc)) : firestoreQuery(this.colRef(collectionName), ...allConstraints);
    const snap = await getDocs(q);
    const items = this.querySnapshotToEntities<T>(snap);
    const last = snap.docs.length ? snap.docs[snap.docs.length - 1] : undefined;
    return { data: items, lastDoc: last };
  }

  queryConstraintWhere(fieldPath: string, opStr: any, value: any): QueryConstraint {
    return where(fieldPath, opStr, value);
  }

  queryConstraintOrderBy(fieldPath: string, directionStr?: 'asc' | 'desc'): QueryConstraint {
    return orderBy(fieldPath, directionStr);
  }

  queryConstraintLimit(n: number): QueryConstraint {
    return limit(n);
  }

  // ---- Realtime Subscriptions ----

  /**
   * Подписка на всю коллекцию или с query constraints
   * Возвращает Observable массива документов
   */
  subscribeCollection<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Observable<Array<WithId<T>>> {
    return new Observable(subscriber => {
      const q = constraints.length
        ? firestoreQuery(this.colRef(collectionName), ...constraints)
        : this.colRef(collectionName);

      const unsubscribe = onSnapshot(q, snapshot => {
        const items = this.querySnapshotToEntities<T>(snapshot);
        subscriber.next(items);
      }, error => subscriber.error(error));

      // при отписке вызывается unsubscribe
      return unsubscribe;
    });
  }

  /**
   * Подписка на один документ
   * Возвращает Observable документа (или null, если не существует)
   */
  subscribeDoc<T>(
    collectionName: string,
    id: string
  ): Observable<WithId<T> | null> {
    return new Observable(subscriber => {
      const docRef = this.docRef(collectionName, id);
      const unsubscribe = onSnapshot(docRef, snapshot => {
        const entity = this.snapshotToEntity<T>(snapshot);
        subscriber.next(entity);
      }, error => subscriber.error(error));

      return unsubscribe;
    });
  }

  /**
   * Подписка на изменения с фильтром (например, новые или обновлённые заказы)
   * snapshot.docChanges() позволяет различать added / modified / removed
   */
  subscribeCollectionChanges<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Observable<{ type: 'added' | 'modified' | 'removed', doc: WithId<T> }[]> {
    return new Observable(subscriber => {
      const q = constraints.length
        ? firestoreQuery(this.colRef(collectionName), ...constraints)
        : this.colRef(collectionName);

      const unsubscribe = onSnapshot(q, snapshot => {
        const changes = snapshot.docChanges().map(change => ({
          type: change.type as 'added' | 'modified' | 'removed',
          doc: { ...(change.doc.data() as T), id: change.doc.id } as WithId<T>
        }));
        subscriber.next(changes);
      }, error => subscriber.error(error));

      return unsubscribe;
    });
  }

}
