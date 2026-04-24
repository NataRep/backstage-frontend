import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { InventoryCategory, InventoryItem, InventoryType } from '../../core/models/interfaces/inventory.models';
import { selectCanEdit } from '../../core/store/auth/auth.selectors';
import { deleteInventoryAction, deleteInventorySuccessAction, subscribeAllInventoryAction, unsubscribeAllInventoryAction, updateInventoryAction, updateInventorySuccessAction } from '../../core/store/inventory/inventory.actions';
import { selectAllInventory, selectInventoryByCategory, selectInventoryLoading } from '../../core/store/inventory/inventory.selector';
import { BaseTableDirective } from '../../shared/components/data-table/base-table.directive';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { IconComponent } from '../../shared/components/icons/icons.component';
import { ModalContainerComponent } from '../../shared/components/modal-container/modal-container.component';
import { ModalAction } from '../../shared/components/modal-container/modal.model';
import { INVENTORY_TYPES_RU } from '../../shared/constants/texts/common.texts';
import { UppercaseFirstLetter } from '../../shared/pipes/uppercase-first-letter.pipe';
import { InventoryFormComponent } from '../inventory-form/inventory-form.component';


@Component({
  selector: 'app-inventory-table',
  standalone: true,
  imports: [
    IconComponent,
    ModalContainerComponent,
    UppercaseFirstLetter,
    InventoryFormComponent,
    DataTableComponent,
    CommonModule
  ],
  templateUrl: './inventory-table.component.html',
  styleUrl: './inventory-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryTableComponent extends BaseTableDirective<InventoryItem> implements OnDestroy, OnInit {
  // Используем setter для @Input, чтобы сбрасывать страницу при смене вкладки
  @Input() set category(value: InventoryCategory) {
    this._category.set(value);
    this.currentPage.set(1); // Сбрасываем на 1 страницу при переключении табов
  }
  private readonly store = inject(Store);
  private readonly actions = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);
  private _category = signal<InventoryCategory>('firework');

  isEditModalOpen = signal<boolean>(false);
  isConfirmDeleteModalOpen = signal<boolean>(false);

  selectedItem = signal<InventoryItem | null>(null);

  selectedType = signal<InventoryType | 'all'>('all');
  inventoryTypes = INVENTORY_TYPES_RU;


  // Реализация абстрактных методов для BaseTableDirective
  protected override sourceData = () => this.filteredInventory();
  override pageSize = () => 10;
  protected override isTableLocked = () => this.isLoading();

  // Добавляем категорию в URL через ExtraParams
  protected override getExtraParams() {
    return { category: this._category() };
  }

  readonly allInventory = this.store.selectSignal(selectAllInventory);
  readonly isLoading = this.store.selectSignal(selectInventoryLoading);
  readonly canEdit = this.store.selectSignal(selectCanEdit);

  readonly filteredInventory = computed(() => {
    const list = this.allInventory();
    const currentCategory = this._category();
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.selectedType();

    // 1. Фильтр по категории и типу
    let result = list.filter(item => item.category === currentCategory);
    if (type != 'all') {
      result = result.filter(item => item.type == type);
    }
    // 2. Фильтр по поиску
    if (query) {
      result = result.filter(item => item.name.toLowerCase().includes(query));
    }
    // 3. Сортировка
    return [...result].sort((a, b) => a.name.localeCompare(b.name));
  });

  public readonly items = computed(() => {
    const currentCategory = this._category() || null;
    return this.store.selectSignal(selectInventoryByCategory(currentCategory))();
  });

  override ngOnInit() {
    super.ngOnInit();
    this.store.dispatch(subscribeAllInventoryAction());

    this.initModalsSubscriptions();
  }

  ngOnDestroy() {
    this.store.dispatch(unsubscribeAllInventoryAction());
  }

  handleDeleteAction(actionType: ModalAction) {
    if (actionType === 'confirm') {
      this.deleteItem();
    }
  }

  // 8. Действия со Store
  updateItem(data: InventoryItem) {
    const id = this.selectedItem()?.id;
    if (!id) return;

    this.store.dispatch(updateInventoryAction({
      data: { ...data, id }
    }));
  }

  deleteItem() {
    const id = this.selectedItem()?.id;
    if (id) {
      this.store.dispatch(deleteInventoryAction({ id }));
    }
  }

  // 9. Управление модалками
  openEditModal(item: InventoryItem) {
    this.selectedItem.set(item);
    this.isEditModalOpen.set(true);
  }

  closeEditModal() {
    this.selectedItem.set(null);
    this.isEditModalOpen.set(false);
  }

  openConfirmDeleteModal(item: InventoryItem) {
    this.selectedItem.set(item);
    this.isConfirmDeleteModalOpen.set(true);
  }

  // 10. Подписки на успех (закрытие окон)
  private initModalsSubscriptions() {

    this.actions.pipe(
      ofType(updateInventorySuccessAction),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.isEditModalOpen.set(false);
      this.selectedItem.set(null);
    });

    this.actions.pipe(
      ofType(deleteInventorySuccessAction),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.isConfirmDeleteModalOpen.set(false);
      this.selectedItem.set(null);
    });
  }

}