import { Injectable, inject, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { SelectedInventoryItem, ShowForm, ShowFormValue } from '../../features/shows/show-form/show-form.models';
import { InventoryItem, InventoryType } from '../models/interfaces/inventory.models';
import { FullShowItem, MediaMetadata, ShowItem } from '../models/interfaces/show.model';

@Injectable()
export class ShowFormService {
  private fb = inject(NonNullableFormBuilder);

  // --- State ---
  readonly form = this.initForm();
  readonly selectedImage = signal<File | null>(null);
  readonly selectedMusic = signal<File | null>(null);

  // --- Public API ---

  /**
   * Заполняет форму данными из модели ShowItem
   */
  patchFormData(item: ShowItem, inventoryEntities: Record<string, InventoryItem>): void {
    this.resetFiles();
    const inventoryGroups = this.inventoryGroups;

    Object.values(inventoryGroups).forEach(array => array.clear());

    this.form.patchValue({
      isActive: item.isActive,
      type: item.type,
      title: item.title,
      description: item.description,
      viewImg: item.viewImg,
      comment: item.comment,
    });

    if (this.isFullShow(item)) {
      this.form.patchValue({
        duration: item.duration,
        price: item.price,
        music: item.music,
        requiredRoles: item.requiredRoles
      });

      if (item.requiredInventory) {
        this.fillInventoryArrays(item.requiredInventory, inventoryEntities);
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

  /**
   * Добавляет предмет в соответствующий FormArray инвентаря
   */
  addInventoryItem(itemId: string, category: InventoryType): void {
    const array = this.inventoryGroups[category as keyof typeof this.inventoryGroups];

    const exists = array.controls.some(ctrl => ctrl.controls.id.value === itemId);
    if (exists) return;

    array.push(this.createInventoryGroup(itemId, 1));
  }

  /**
   * Удаляет предмет из FormArray
   */
  removeInventoryItem(index: number, category: InventoryType): void {
    this.inventoryGroups[category as keyof typeof this.inventoryGroups].removeAt(index);
  }

  /**
   * Собирает финальный объект данных для сохранения
   */
  getFormValue(): ShowFormValue {
    return {
      programData: this.form.getRawValue(),
      imageFile: this.selectedImage(),
      musicFile: this.selectedMusic()
    };
  }

  // --- Private Helpers ---

  private initForm(): FormGroup<ShowForm> {
    return this.fb.group<ShowForm>({
      isActive: new FormControl(true, { nonNullable: true }),
      type: new FormControl(null, [Validators.required]),
      title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl('', { nonNullable: true }),
      viewImg: new FormControl(null),
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
      music: new FormControl(null)
    });
  }

  private createInventoryGroup(id: string, count: number): FormGroup<SelectedInventoryItem> {
    return this.fb.group({
      id: new FormControl(id, { nonNullable: true }),
      count: new FormControl(count, { nonNullable: true, validators: [Validators.min(1)] })
    });
  }

  private fillInventoryArrays(
    requiredInventory: Record<string, number>,
    entities: Record<string, InventoryItem>
  ): void {
    const inventoryControls = this.inventoryGroups;

    Object.entries(requiredInventory).forEach(([itemId, count]) => {
      const info = entities[itemId];

      if (info?.type) {
        const category = info.type as keyof typeof inventoryControls;
        const targetArray = inventoryControls[category];

        if (targetArray) {
          targetArray.push(this.createInventoryGroup(itemId, count));
        }
      }
    });
  }

  private resetFiles(): void {
    this.selectedImage.set(null);
    this.selectedMusic.set(null);
  }

  private isFullShow(item: ShowItem): item is FullShowItem {
    return (item as FullShowItem).requiredRoles !== undefined;
  }

  updateFileMetadata(file: File, type: 'image' | 'music'): void {
    const fileMetadata: MediaMetadata = {
      name: file.name,
      url: '', // Будет заполнено позже (например, после загрузки на сервер)
      metadata: {
        size: file.size,
        format: file.type,
      }
    };

    const controlName = type === 'image' ? 'viewImg' : 'music';

    this.form.patchValue({
      [controlName]: fileMetadata
    });
  }

  resetForm(): void {
    this.form.reset();

    const inventoryGroups = this.form.controls.requiredInventory.controls;
    Object.values(inventoryGroups).forEach(array => array.clear());

    this.resetFiles();

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  get inventoryGroups() {
    return this.form.controls.requiredInventory.controls;
  }
}
