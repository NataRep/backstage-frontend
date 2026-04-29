import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, Component,
  EventEmitter,
  inject, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { InventoryItem, InventoryType } from '../../../core/models/interfaces/inventory.models';
import { ShowItem } from '../../../core/models/interfaces/show.model';
import { ShowFormService } from '../../../core/services/show-form.service';
import { getAllInventoryAction } from '../../../core/store/inventory/inventory.actions';
import { selectAllInventory, selectInventoryEntities } from '../../../core/store/inventory/inventory.selector';
import { NumberInputComponent } from '../../../shared/components/number-input/number-input.component';
import { INVENTORY_TYPES_RU, UNIVERSAL_CATEGORY_RU } from '../../../shared/constants/texts/common.texts';
import { TrimOnBlurDirective } from '../../../shared/directive/trim-on-blur.directive';
import { UppercaseFirstLetter } from '../../../shared/pipes/uppercase-first-letter.pipe';
import { ShowFormInventoryManagerComponent } from './show-form-inventory-manager/show-form-inventory-manager.component';
import { ShowFormRolesComponent } from './show-form-roles/show-form-roles.component';
import { ShowFormValue } from './show-form.models';

@Component({
  selector: 'app-show-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TrimOnBlurDirective,
    UppercaseFirstLetter,
    NumberInputComponent,
    ShowFormRolesComponent,
    ShowFormInventoryManagerComponent
  ],
  providers: [ShowFormService], // Сервис живет столько же, сколько форма
  templateUrl: './show-form.component.html',
  styleUrl: './show-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowFormComponent implements OnInit, OnChanges {
  @Input() inventoryItem: ShowItem | null = null;
  @Output() save = new EventEmitter<ShowFormValue>();
  @Output() cancelForm = new EventEmitter<void>();

  private readonly store = inject(Store);
  protected readonly formService = inject(ShowFormService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.formService.form;

  readonly allInventory = this.store.selectSignal(selectAllInventory);
  readonly inventoryEntities = this.store.selectSignal(selectInventoryEntities);

  readonly inventoryLabels = INVENTORY_TYPES_RU;
  readonly categoryTranslate = UNIVERSAL_CATEGORY_RU;
  readonly inventoryCategories = Object.keys(INVENTORY_TYPES_RU) as InventoryType[];

  readonly searchControls: Record<InventoryType, FormControl<string>> = {
    prop: this.fb.control(''),
    consumable: this.fb.control(''),
    equipment: this.fb.control(''),
    costume: this.fb.control('')
  };


  ngOnInit(): void {
    if (this.allInventory().length === 0) {
      this.store.dispatch(getAllInventoryAction());
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const item = changes['inventoryItem']?.currentValue;
    if (item) {
      this.formService.patchFormData(item, this.inventoryEntities());
    }
  }

  addInventoryItem(itemId: string): void {
    const info = this.getItemInfo(itemId);
    if (info?.type) {
      this.formService.addInventoryItem(itemId, info.type as InventoryType);
    }
  }

  removeInventoryItem(index: number, category: InventoryType): void {
    this.formService.removeInventoryItem(index, category);
  }

  onFileSelected(event: Event, type: 'image' | 'music'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.formService.selectedImage.set(type === 'image' ? file : this.formService.selectedImage());
      this.formService.selectedMusic.set(type === 'music' ? file : this.formService.selectedMusic());
      this.formService.updateFileMetadata(file, type);
    }
  }

  submit(): void {
    if (this.form.valid) {
      this.save.emit(this.formService.getFormValue());
      console.log('отправка', this.formService.getFormValue())
    }
  }

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

  resetForm(): void {
    this.formService.resetForm();
  }
}