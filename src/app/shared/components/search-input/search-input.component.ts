import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icons/icons.component';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
})
export class SearchInputComponent {
  readonly value = input<string>('');
  readonly placeholder = input<string>('Поиск...');
  readonly searchChange = output<string>();

  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchChange.emit(val);
  }
  clearSearch() {
    this.searchChange.emit('');
  }
}
