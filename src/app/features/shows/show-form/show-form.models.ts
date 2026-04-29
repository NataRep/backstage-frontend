import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { MediaMetadata, ShowType } from "../../../core/models/interfaces/show.model";
import { ShowFormComponent } from "./show-form.component";

export interface SelectedInventoryItem {
  id: FormControl<string>;
  count: FormControl<number>;
}

export interface ShowForm {
  isActive: FormControl<boolean>;
  type: FormControl<ShowType | null>;
  title: FormControl<string>;
  description: FormControl<string>;
  viewImg: FormControl<MediaMetadata | null>;
  comment: FormControl<string>;
  duration: FormControl<number>;
  price: FormControl<number>;
  requiredRoles: FormGroup<{
    artists: FormControl<number>;
    tech: FormControl<number>;
    fireworker: FormControl<number>;
  }>;
  requiredInventory: FormGroup<{
    prop: FormArray<FormGroup<SelectedInventoryItem>>;
    consumable: FormArray<FormGroup<SelectedInventoryItem>>;
    equipment: FormArray<FormGroup<SelectedInventoryItem>>;
    costume: FormArray<FormGroup<SelectedInventoryItem>>;
  }>;
  music: FormControl<MediaMetadata | null>;
}

export interface ShowFormValue {
  programData: ReturnType<ShowFormComponent['form']['getRawValue']>;
  imageFile: File | null;
  musicFile: File | null;
}