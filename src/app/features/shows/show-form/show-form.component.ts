import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, computed, EventEmitter,
  inject, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray, FormControl, FormGroup, NonNullableFormBuilder,
  ReactiveFormsModule, Validators
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { INVENTORY_TYPES, InventoryItem, InventoryType } from '../../../core/models/interfaces/inventory.models';
import { FullShowItem, MediaMetadata, ShowItem, ShowType } from '../../../core/models/interfaces/show.model';
import { getAllInventoryAction } from '../../../core/store/inventory/inventory.actions';
import { selectAllInventory, selectInventoryEntities, selectInventoryGroupedByCategory } from '../../../core/store/inventory/inventory.selector';
import { NumberInputComponent } from '../../../shared/components/number-input/number-input.component';
import { INVENTORY_TYPES_RU, UNIVERSAL_CATEGORY_RU } from '../../../shared/constants/texts/common.texts';
import { TrimOnBlurDirective } from '../../../shared/directive/trim-on-blur.directive';
import { UppercaseFirstLetter } from '../../../shared/pipes/uppercase-first-letter.pipe';

// --- Interfaces ---

interface SelectedInventoryItem {
  id: FormControl<string>;
  count: FormControl<number>;
}

interface ShowForm {
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

// --- Component ---

@Component({
  selector: 'app-show-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TrimOnBlurDirective,
    UppercaseFirstLetter,
    NumberInputComponent,
  ],
  templateUrl: './show-form.component.html',
  styleUrl: './show-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowFormComponent implements OnInit, OnChanges {
  @Input() inventoryItem: ShowItem | null = null;
  @Output() save = new EventEmitter<ShowFormValue>();
  @Output() cancelForm = new EventEmitter<void>();

  private fb = inject(NonNullableFormBuilder);
  private store = inject(Store);

  // --- Store Signals ---
  readonly allInventory = this.store.selectSignal(selectAllInventory);
  readonly inventoryEntities = this.store.selectSignal(selectInventoryEntities);

  // --- Form & Controls ---
  readonly form = this.initForm();

  readonly searchControls: Record<InventoryType, FormControl<string>> = {
    prop: this.fb.control(''),
    consumable: this.fb.control(''),
    equipment: this.fb.control(''),
    costume: this.fb.control('')
  };

  // --- Computed Signals ---
  readonly currentType = toSignal(
    this.form.controls.type.valueChanges,
    { initialValue: this.form.controls.type.value }
  );

  readonly groupedInventory = computed(() => {
    const category = this.currentType();
    return this.store.selectSignal(selectInventoryGroupedByCategory(category))();
  });

  // --- Static Data / Translations ---
  readonly typesInventoryTranslate = INVENTORY_TYPES_RU;
  readonly types = INVENTORY_TYPES;
  readonly categoryTranslate = UNIVERSAL_CATEGORY_RU;
  readonly inventoryCategories = Object.keys(INVENTORY_TYPES_RU) as InventoryType[];
  readonly inventoryLabels = INVENTORY_TYPES_RU;

  // --- State ---
  selectedImage: File | null = null;
  selectedMusic: File | null = null;

  // --- Lifecycle ---
  ngOnInit(): void {
    if (this.allInventory().length === 0) {
      this.store.dispatch(getAllInventoryAction());
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inventoryItem'] && this.inventoryItem) {
      this.patchFormData(this.inventoryItem);
    }
  }

  // --- Public Methods ---
  getFilteredItems(key: InventoryType): InventoryItem[] {
    const query = this.searchControls[key].value?.toLowerCase() || '';
    if (query.length < 2) return [];

    return this.allInventory().filter(item =>
      item.type === key &&
      item.name.toLowerCase().includes(query)
    );
  }

  getItemInfo(id: string | undefined): InventoryItem | undefined {
    return id ? this.inventoryEntities()[id] : undefined;
  }

  onFileSelected(event: Event, type: 'image' | 'music'): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (type === 'image') {
      this.selectedImage = file;
    } else {
      this.selectedMusic = file;
    }

    const fileMetadata: MediaMetadata = {
      name: file.name,
      url: '',
      metadata: {
        size: file.size,
        format: file.type,
      }
    };

    this.form.patchValue({
      [type === 'image' ? 'viewImg' : 'music']: fileMetadata
    });
  }

  addInventoryItem(itemId: string): void {
    const info = this.getItemInfo(itemId);
    if (!info?.type) return;

    const category = info.type as keyof ShowForm['requiredInventory']['controls'];
    const array = this.form.controls.requiredInventory.controls[category];

    const exists = array.controls.some(ctrl => ctrl.controls.id.value === itemId);
    if (exists) return;

    array.push(this.createInventoryGroup(itemId, 1));
  }

  removeInventoryItem(index: number, category: keyof ShowForm['requiredInventory']['controls']): void {
    this.form.controls.requiredInventory.controls[category].removeAt(index);
  }

  submit(): void {
    if (this.form.valid) {
      const payload: ShowFormValue = {
        programData: this.form.getRawValue(),
        imageFile: this.selectedImage,
        musicFile: this.selectedMusic
      };
      this.save.emit(payload);
    }
  }

  resetForm(): void {
    this.form.reset();
    this.selectedImage = null;
    this.selectedMusic = null;
  }

  // --- Private Helpers ---
  private initForm(): FormGroup<ShowForm> {
    return this.fb.group<ShowForm>({
      isActive: new FormControl(true, { nonNullable: true }),
      type: new FormControl<ShowType | null>(null, [Validators.required]),
      title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl('', { nonNullable: true }),
      viewImg: new FormControl<MediaMetadata | null>(null),
      comment: new FormControl('', { nonNullable: true }),
      duration: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
      price: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),

      requiredRoles: this.fb.group({
        artists: new FormControl(0, { nonNullable: true }),
        tech: new FormControl(0, { nonNullable: true }),
        fireworker: new FormControl(0, { nonNullable: true }),
      }),

      requiredInventory: this.fb.group({
        prop: this.fb.array<FormGroup<SelectedInventoryItem>>([]),
        consumable: this.fb.array<FormGroup<SelectedInventoryItem>>([]),
        equipment: this.fb.array<FormGroup<SelectedInventoryItem>>([]),
        costume: this.fb.array<FormGroup<SelectedInventoryItem>>([]),
      }),

      music: new FormControl<MediaMetadata | null>(null)
    });
  }

  private createInventoryGroup(id: string, count: number): FormGroup<SelectedInventoryItem> {
    return this.fb.group({
      id: new FormControl(id, { nonNullable: true }),
      count: new FormControl(count, { nonNullable: true, validators: [Validators.min(1)] })
    });
  }

  private patchFormData(item: ShowItem): void {
    const inventoryGroups = this.form.controls.requiredInventory.controls;
    Object.values(inventoryGroups).forEach(array => array.clear());

    this.form.patchValue({
      isActive: item.isActive,
      type: item.type,
      title: item.title,
      description: item.description,
      viewImg: item.viewImg,
      comment: item.comment,
    });

    if (isFullShow(item)) {
      this.form.patchValue({
        duration: item.duration,
        price: item.price,
        music: item.music,
        requiredRoles: item.requiredRoles
      });

      if (item.requiredInventory) {
        Object.entries(item.requiredInventory).forEach(([itemId, count]) => {
          const info = this.getItemInfo(itemId);
          if (info?.type) {
            const category = info.type as keyof typeof inventoryGroups;
            inventoryGroups[category]?.push(this.createInventoryGroup(itemId, count));
          }
        });
      }
    } else {
      this.form.patchValue({
        duration: 0,
        price: 0,
        requiredRoles: { artists: 0, tech: 0, fireworker: 0 }
      });
    }

    this.form.markAsPristine();
  }
}

// --- Utils ---
function isFullShow(item: ShowItem): item is FullShowItem {
  return (item as FullShowItem).requiredRoles !== undefined;
}