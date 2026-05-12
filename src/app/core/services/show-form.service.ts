import { Injectable, inject, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  CreateShowPayload,
  SelectedInventoryItem,
  ShowForm
} from '../../features/shows/show-form/show-form.models';
import { InventoryItem, InventoryType } from '../models/interfaces/inventory.models';
import { MediaMetadata, ShowItem } from '../models/interfaces/show.model';

@Injectable()
export class ShowFormService {
  private fb = inject(NonNullableFormBuilder);

  // --- State ---
  readonly form = this.initForm();
  readonly selectedImage = signal<File | null>(null);
  readonly selectedAudio = signal<File | null>(null); // Исправлен регистр CamelCase

  // --- Public API ---

  patchFormData(item: ShowItem, inventoryEntities: Record<string, InventoryItem>): void {
    this.resetFiles();

    // Очищаем массивы инвентаря перед заполнением
    const inventoryGroups = this.inventoryGroups;
    Object.values(inventoryGroups).forEach(array => array.clear());

    // Заполняем форму (поля теперь общие для всех ShowItem)
    this.form.patchValue({
      isActive: item.isActive,
      type: item.type,
      title: item.title,
      description: item.description,
      viewImg: item.viewImg,
      comment: item.comment,
      duration: item.duration,
      price: item.price,
      audio: item.audio ?? null,
      requiredRoles: item.requiredRoles
    });

    if (item.requiredInventory) {
      this.fillInventoryArrays(item.requiredInventory, inventoryEntities);
    }

    this.form.markAsPristine();
  }

  addInventoryItem(itemId: string, category: InventoryType): void {
    const array = this.inventoryGroups[category as keyof typeof this.inventoryGroups];
    const exists = array.controls.some(ctrl => ctrl.getRawValue().id === itemId);
    if (exists) return;

    array.push(this.createInventoryGroup(itemId, 1));
  }

  removeInventoryItem(index: number, category: InventoryType): void {
    this.inventoryGroups[category as keyof typeof this.inventoryGroups].removeAt(index);
  }

  /**
   * Возвращает Payload для эффекта (Данные + Файлы)
   */

  getFormValue() {
    return this.form.getRawValue()
  }

  getPayload(): CreateShowPayload {
    return {
      formValue: this.form.getRawValue(),
      imageFile: this.selectedImage(),
      audioFile: this.selectedAudio()
    };
  }

  // --- Private Helpers ---

  private initForm(): FormGroup<ShowForm> {
    return this.fb.group<ShowForm>({
      isActive: this.fb.control(true),
      type: this.fb.control(null, [Validators.required]),
      title: this.fb.control('', [Validators.required]),
      description: this.fb.control(''),
      viewImg: this.fb.control(null),
      comment: this.fb.control(''),
      duration: this.fb.control(0, [Validators.min(0)]), // Изменил min на 0 для универсальности
      price: this.fb.control(0, [Validators.min(0)]),
      requiredRoles: this.fb.group({
        artist: this.fb.control(0),
        tech: this.fb.control(0),
        fireworker: this.fb.control(0),
      }),
      requiredInventory: this.fb.group({
        prop: this.fb.array<FormGroup<SelectedInventoryItem>>([]),
        consumable: this.fb.array<FormGroup<SelectedInventoryItem>>([]),
        equipment: this.fb.array<FormGroup<SelectedInventoryItem>>([]),
        costume: this.fb.array<FormGroup<SelectedInventoryItem>>([]),
      }),
      audio: this.fb.control(null)
    });
  }

  private createInventoryGroup(id: string, count: number): FormGroup<SelectedInventoryItem> {
    return this.fb.group({
      id: this.fb.control(id),
      count: this.fb.control(count, [Validators.min(1)])
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
    this.selectedAudio.set(null);
  }

  removeFile(type: 'image' | 'audio'): void {
    if (type === 'image') {
      this.selectedImage.set(null);
      this.form.patchValue({ viewImg: null });
    } else {
      this.selectedAudio.set(null);
      this.form.patchValue({ audio: null });
    }
  }

  updateFileMetadata(file: File, type: 'image' | 'audio'): void {
    const fileMetadata: MediaMetadata = {
      name: file.name,
      url: '',
      metadata: {
        size: file.size,
        format: file.type,
      }
    };

    if (type === 'image') {
      this.selectedImage.set(file);
      this.form.patchValue({ viewImg: fileMetadata });
    } else {
      this.selectedAudio.set(file);
      this.form.patchValue({ audio: fileMetadata });
    }
  }

  resetForm(): void {
    this.form.reset();
    Object.values(this.inventoryGroups).forEach(array => array.clear());
    this.resetFiles();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  get inventoryGroups() {
    return this.form.controls.requiredInventory.controls;
  }
}