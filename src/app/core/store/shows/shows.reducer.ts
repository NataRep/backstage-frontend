import { createReducer, on } from "@ngrx/store";
import { ShowItem } from "../../models/interfaces/show.model";
import * as ShowsActions from './shows.actions';

export interface ShowState {
  shows: ShowItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ShowState = {
  shows: [],
  loading: false,
  error: null
};

export const showReducer = createReducer(
  initialState,

  // --- Start Loading ---
  on(
    ShowsActions.createShowAction,
    ShowsActions.updateShowAction,
    ShowsActions.deleteShowAction,
    ShowsActions.getAllShowAction,
    (state) => ({
      ...state,
      loading: true,
      error: null,
    })
  ),

  // --- Success Operations ---
  on(ShowsActions.createShowSuccessAction, (state, { data }) => {
    // Проверяем, есть ли уже такой ID в стейте
    const exists = state.shows.some(item => item.id === data.id);

    return {
      ...state,
      shows: exists
        ? state.shows.map(item => item.id === data.id ? data : item)
        : [...state.shows, data],
      loading: false,
    };
  }),

  on(ShowsActions.updateShowSuccessAction, (state, { data }) => ({
    ...state,
    shows: state.shows.map(item => item.id === data.id ? data : item),
    loading: false,
  })),

  on(ShowsActions.deleteShowSuccessAction, (state, { id }) => ({
    ...state,
    shows: state.shows.filter((item) => item.id !== id),
    loading: false,
  })),

  // --- Handle Data (One-time and Stream) ---
  on(
    ShowsActions.getAllShowSuccessAction,
    ShowsActions.ShowStreamUpdatedAction,
    (state, { items }) => ({
      ...state,
      shows: items,
      loading: false,
      error: null,
    })
  ),

  // --- Failures ---
  on(
    ShowsActions.createShowFailureAction,
    ShowsActions.updateShowFailureAction,
    ShowsActions.deleteShowFailureAction,
    ShowsActions.getAllShowFailureAction,
    (state, { error }) => ({
      ...state,
      loading: false,
      error: error as string,
    })
  ),
);