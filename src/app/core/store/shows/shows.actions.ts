import { createAction, props } from "@ngrx/store";
import { CreateShowPayload } from "../../../features/shows/show-form/show-form.models";
import { ShowItem } from "../../models/interfaces/show.model";

// --- Create ---
export const createShowAction = createAction(
  '[Shows] Create',
  props<{ data: CreateShowPayload }>()
);
export const createShowSuccessAction = createAction('[Shows] Create Success', props<{ data: ShowItem }>());
export const createShowFailureAction = createAction('[Shows] Create Failure', props<{ error: string }>());

// --- Update ---
export const updateShowAction = createAction('[Shows] Update', props<{ data: ShowItem }>());
export const updateShowSuccessAction = createAction('[Shows] Update Success', props<{ data: ShowItem }>());
export const updateShowFailureAction = createAction('[Shows] Update Failure', props<{ error: string }>());

// --- Delete ---
export const deleteShowAction = createAction('[Shows] Delete by id', props<{ id: string }>());
export const deleteShowSuccessAction = createAction('[Shows] Delete Success', props<{ id: string }>());
export const deleteShowFailureAction = createAction('[Shows] Delete Failure', props<{ error: string }>());

// --- Read (One-time) ---
export const getAllShowAction = createAction('[Shows] Get All');
export const getAllShowSuccessAction = createAction('[Shows] Get All Success', props<{ items: ShowItem[] }>());
export const getAllShowFailureAction = createAction('[Shows] Get All Failure', props<{ error: string }>());

// --- Subscriptions (Realtime) ---
export const subscribeAllShowAction = createAction('[Shows] Subscribe All');
export const unsubscribeAllShowAction = createAction('[Shows] Unsubscribe All');
export const ShowStreamUpdatedAction = createAction('[Shows] Stream Updated', props<{ items: ShowItem[] }>());