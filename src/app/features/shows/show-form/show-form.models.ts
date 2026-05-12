import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { MediaMetadata, ShowType } from "../../../core/models/interfaces/show.model";

export interface SelectedInventoryItem {
  id: FormControl<string>;
  count: FormControl<number>;
}

export interface ShowForm {
  isActive: FormControl<boolean>;
  type: FormControl<ShowType | null>;
  title: FormControl<string>;
  description: FormControl<string>;
  duration: FormControl<number>;
  price: FormControl<number>;
  requiredRoles: FormGroup<{
    artist: FormControl<number>;
    tech: FormControl<number>;
    fireworker: FormControl<number>;
  }>;
  requiredInventory: FormGroup<{
    prop: FormArray<FormGroup<SelectedInventoryItem>>;
    consumable: FormArray<FormGroup<SelectedInventoryItem>>;
    equipment: FormArray<FormGroup<SelectedInventoryItem>>;
    costume: FormArray<FormGroup<SelectedInventoryItem>>;
  }>;
  viewImg: FormControl<MediaMetadata | null>;
  audio: FormControl<MediaMetadata | null>;
  comment: FormControl<string>;
}

export type RawShowFormValue = ReturnType<FormGroup<ShowForm>['getRawValue']>;

export interface CreateShowPayload {
  formValue: RawShowFormValue;
  imageFile: File | null;
  audioFile: File | null;
}