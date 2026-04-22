import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap, takeUntil, tap } from 'rxjs';
import { InventoryService } from '../../services/firebase/firebase-inventory.service';
import * as InventoryActions from './inventory.actions';

@Injectable()
export class InventoryEffects {
  private actions$ = inject(Actions);
  private inventoryService = inject(InventoryService);

  // --- 1. Realtime Subscription (Long-running) ---
  // Этот эффект работает постоянно, пока не придет сигнал отписки
  subscribeInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InventoryActions.subscribeAllInventoryAction),
      tap(() => console.log('Effect triggered')),
      switchMap(() =>
        this.inventoryService.subscribeAll().pipe(
          // Используем getAllInventorySuccessAction, так как редьюсер ожидает его для обновления списка
          map((items) => InventoryActions.getAllInventorySuccessAction({ items: items })),
          takeUntil(this.actions$.pipe(ofType(InventoryActions.unsubscribeAllInventoryAction))),
          catchError((err: Error) =>
            of(InventoryActions.getAllInventoryFailureAction({ error: err.message }))
          )
        )
      )
    )
  );

  // --- 2. Create ---
  createInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InventoryActions.createInventoryAction),
      mergeMap(({ data }) =>
        this.inventoryService.create(data).pipe(
          // Firebase возвращает ID, дополняем объект и отправляем в стор
          map((id) => InventoryActions.createInventorySuccessAction({ data: { ...data, id } })),
          catchError((err: Error) =>
            of(InventoryActions.createInventoryFailureAction({ error: err.message }))
          )
        )
      )
    )
  );

  // --- 3. Update ---
  updateInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InventoryActions.updateInventoryAction),
      mergeMap(({ data }) => {
        if (!data.id) {
          return of(InventoryActions.updateInventoryFailureAction({
            error: 'ID инвентаря отсутствует'
          }));
        }

        return this.inventoryService.update(data.id, data).pipe(
          map(() => InventoryActions.updateInventorySuccessAction({ data })),
          catchError((err: Error) =>
            of(InventoryActions.updateInventoryFailureAction({ error: err.message }))
          )
        )
      })
    )
  );

  // --- 4. Delete ---
  deleteInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InventoryActions.deleteInventoryAction),
      mergeMap(({ id }) =>
        this.inventoryService.delete(id).pipe(
          map(() => InventoryActions.deleteInventorySuccessAction({ id })),
          catchError((err: Error) =>
            of(InventoryActions.deleteInventoryFailureAction({ error: err.message }))
          )
        )
      )
    )
  );

  // --- 5. One-time Get All (если нужно без подписки) ---
  getAllInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InventoryActions.getAllInventoryAction),
      switchMap(() =>
        this.inventoryService.getAll().pipe(
          map((items) => InventoryActions.getAllInventorySuccessAction({ items: items })),
          catchError((err: Error) =>
            of(InventoryActions.getAllInventoryFailureAction({ error: err.message }))
          )
        )
      )
    )
  );


}