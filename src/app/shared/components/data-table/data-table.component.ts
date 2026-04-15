import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'app-data-table',
  standalone: true,
  templateUrl: './data-table.component.html',
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

  onSearch(event: Event) {
    if (this.isToolsDisabled) return;
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }
}