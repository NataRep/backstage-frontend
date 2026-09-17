import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchInputComponent } from '../search-input/search-input.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  templateUrl: './data-table.component.html',
  imports: [
    SearchInputComponent,
  ],
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  @Input() searchQuery = '';
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pages: number[] = [];
  @Input() isToolsDisabled = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  onSearch(value: string) {
    if (this.isToolsDisabled) return;
    this.searchChange.emit(value);
  }
}
