import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { INVENTORY_TYPES, InventoryCategory, InventoryConditionStatus, InventoryItem, InventoryType } from '../../core/models/interfaces/inventory.models';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { INVENTORY_CATEGORY_RU, INVENTORY_TYPES_RU } from '../../shared/constants/texts/common.texts';
import { TrimOnBlurDirective } from '../../shared/directive/trim-on-blur.directive';
import { UppercaseFirstLetter } from '../../shared/pipes/uppercase-first-letter.pipe';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    IconComponent,
    UppercaseFirstLetter,
    TrimOnBlurDirective,
    UppercaseFirstLetter],
  templateUrl: './inventory-form.component.html',
  styleUrl: './inventory-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryFormComponent implements OnChanges {

  @Input() inventoryItem: InventoryItem | null = null;
  @Output() save = new EventEmitter<InventoryItem>();
  @Output() cancelForm = new EventEmitter<void>();

  private fb = inject(NonNullableFormBuilder);

  readonly typesTranslate = INVENTORY_TYPES_RU;
  readonly types = INVENTORY_TYPES;
  readonly categoryTranslate = INVENTORY_CATEGORY_RU;
  readonly statusOptions = [
    { value: 1, label: 'Хорошее' },
    { value: 2, label: 'Среднее' },
    { value: 3, label: 'Плохое' }
  ];

  form = this.fb.group({
    category: new FormControl<InventoryCategory | null>(null, [Validators.required]),
    type: new FormControl<InventoryType | null>(null, [Validators.required]),
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(200),
        Validators.pattern(/^[a-zA-Zа-яА-ЯёЁ0-9\s.,!?)(-]+$/)
      ]
    }),
    stockQuantity: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(100000),
      Validators.pattern(/^\d+$/)
    ]),
    conditionStatus: new FormControl<number>(1, [Validators.required]),
    comment: new FormControl('', [
      Validators.maxLength(500),
      Validators.pattern(/^[a-zA-Zа-яА-ЯёЁ0-9\s.,!?)(-]+$/)
    ]),
  });

  ngOnChanges() {
    if (this.inventoryItem) {
      this.setFormByItem();
    }
  }

  setFormByItem() {
    if (!this.inventoryItem) return;

    this.form.patchValue({
      category: this.inventoryItem.category,
      type: this.inventoryItem.type,
      name: this.inventoryItem.name,
      stockQuantity: this.inventoryItem.stockQuantity,
      conditionStatus: this.inventoryItem.conditionStatus,
      comment: this.inventoryItem.comment,
    });
  };

  resetForm() {
    this.form.reset({
      category: null,
      type: null,
      name: "",
      stockQuantity: null,
      conditionStatus: null,
      comment: ''
    });
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValues = this.form.getRawValue();

    const inventoryData: InventoryItem = {
      ...this.inventoryItem,
      category: rawValues.category!,
      type: rawValues.type as InventoryType,
      name: rawValues.name,
      stockQuantity: rawValues.stockQuantity || 0,
      conditionStatus: (rawValues.conditionStatus || 1) as InventoryConditionStatus,
      comment: rawValues.comment || '',
      updatedAt: new Date(),
    };

    console.log("inventoryData)", inventoryData)

    this.save.emit(inventoryData);
  }
}
