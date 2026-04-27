import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap, takeUntil } from 'rxjs';
import { ShowsService } from '../../services/shows.service';
import * as ShowsActions from './shows.actions';

@Injectable()
export class ShowEffects {
  private actions$ = inject(Actions);
  private showService = inject(ShowsService);

  // --- 1. Realtime Subscription (Long-running) ---
  // Этот эффект работает постоянно, пока не придет сигнал отписки
  subscribeShow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShowsActions.subscribeAllShowAction),
      switchMap(() =>
        this.showService.subscribeAll().pipe(
          map((items) => ShowsActions.getAllShowSuccessAction({ items: items })),
          takeUntil(this.actions$.pipe(ofType(ShowsActions.unsubscribeAllShowAction))),
          catchError((err: Error) =>
            of(ShowsActions.getAllShowFailureAction({ error: err.message }))
          )
        )
      )
    )
  );

  // --- 2. Create ---
  createShow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShowsActions.createShowAction),
      mergeMap(({ data }) =>
        this.showService.create(data).pipe(
          map((id) => ShowsActions.createShowSuccessAction({ data: { ...data, id } })),
          catchError((err: Error) =>
            of(ShowsActions.createShowFailureAction({ error: err.message }))
          )
        )
      )
    )
  );

  // --- 3. Update ---
  updateShow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShowsActions.updateShowAction),
      mergeMap(({ data }) => {
        if (!data.id) {
          return of(ShowsActions.updateShowFailureAction({
            error: 'ID инвентаря отсутствует'
          }));
        }

        return this.showService.update(data.id, data).pipe(
          map(() => ShowsActions.updateShowSuccessAction({ data })),
          catchError((err: Error) =>
            of(ShowsActions.updateShowFailureAction({ error: err.message }))
          )
        )
      })
    )
  );

  // --- 4. Delete ---
  deleteShow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShowsActions.deleteShowAction),
      mergeMap(({ id }) =>
        this.showService.delete(id).pipe(
          map(() => ShowsActions.deleteShowSuccessAction({ id })),
          catchError((err: Error) =>
            of(ShowsActions.deleteShowFailureAction({ error: err.message }))
          )
        )
      )
    )
  );

  // --- 5. One-time Get All (если нужно без подписки) ---
  loadShows$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShowsActions.getAllShowAction),
      switchMap(() =>
        this.showService.getAll().pipe(
          map((items) => ShowsActions.getAllShowSuccessAction({ items: items })),
          catchError((err: Error) =>
            of(ShowsActions.getAllShowFailureAction({ error: err.message }))
          )
        )
      )
    )
  );
}