import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InventoryItem, InventoryType } from '../../../../core/models/interfaces/inventory.models';
import { NumberInputComponent } from '../../../../shared/components/number-input/number-input.component';
import { InventoryLabels } from '../../../../shared/constants/texts/common.texts';
import { UppercaseFirstLetter } from '../../../../shared/pipes/uppercase-first-letter.pipe';



@Component({
  selector: 'app-show-form-inventory-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NumberInputComponent, UppercaseFirstLetter],
  templateUrl: './show-form-inventory-manager.component.html',
  styleUrl: './show-form-inventory-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowFormInventoryManagerComponent {
  // Входные данные
  @Input({ required: true }) inventoryGroup!: FormGroup;
  @Input({ required: true }) allInventory: InventoryItem[] = [];
  @Input({ required: true }) inventoryEntities: Record<string, InventoryItem> = {};
  @Input({ required: true }) searchControls!: Record<InventoryType, FormControl<string>>;

  // Словари для верстки
  @Input({ required: true }) inventoryCategories: InventoryType[] = [];
  @Input({ required: true }) inventoryLabels!: InventoryLabels;

  @Output() addItem = new EventEmitter<string>();
  @Output() removeItem = new EventEmitter<{ index: number, category: InventoryType }>();

  getFilteredItems(key: InventoryType): InventoryItem[] {
    const query = this.searchControls[key].value?.toLowerCase() || '';
    if (query.length < 2) return [];

    return this.allInventory.filter(item =>
      item.type === key &&
      item.name.toLowerCase().includes(query)
    );
  }

  getItemInfo(id: string | undefined): InventoryItem | undefined {
    return id ? this.inventoryEntities[id] : undefined;
  }

  getInventoryArray(category: InventoryType) {
    return this.inventoryGroup.get(category) as FormArray;
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  onSelect(itemId: string, category: InventoryType): void {
    this.addItem.emit(itemId);
    // Очищаем поле поиска после выбора
    this.searchControls[category].setValue('');
  }
}