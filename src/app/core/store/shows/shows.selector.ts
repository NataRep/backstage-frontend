import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ShowType } from '../../models/interfaces/show.model';
import { ShowState } from './shows.reducer';

export const selectShowState = createFeatureSelector<ShowState>('shows');

export const selectAllShows = createSelector(selectShowState, (state: ShowState) => state.shows);

export const selectShowLoading = createSelector(
  selectShowState,
  (state: ShowState) => state.loading
);

export const selectShowError = createSelector(selectShowState, (state: ShowState) => state.error);

export const selectShowByType = (type: ShowType | null) =>
  createSelector(selectAllShows, (show) => {
    if (!type) return show;
    return show.filter((item) => item.type === type);
  });

export const selectShowItemById = (id: string) =>
  createSelector(selectAllShows, (show) => show.find((item) => item.id === id) || null);