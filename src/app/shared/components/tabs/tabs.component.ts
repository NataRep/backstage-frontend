import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UppercaseFirstLetter } from '../../pipes/uppercase-first-letter.pipe';
import { IconComponent } from '../icons/icons.component';

export interface TabItem {
  label: string;
  link: string;
  icon: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent,
    UppercaseFirstLetter],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {
  @Input() tabs: TabItem[] = [];

  /** Если true — переключаем только Query Params */
  @Input() useQueryParams = false;

  /** Имя параметра в URL (например, 'type' или 'tab') */
  @Input() queryParamName = 'tab';

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Используем Signal для отслеживания текущих параметров (Angular 18 way)
  private queryParams = toSignal(this.route.queryParams);

  isActive(tab: TabItem): boolean {
    if (this.useQueryParams) {
      const currentTab = this.queryParams()?.[this.queryParamName];
      return currentTab === tab.link;
    }
    return this.router.url.includes(tab.link);
  }

  /**
   * Генерирует объект параметров для [queryParams]
   */
  getQueryParams(tabLink: string): Record<string, string> {
    return { [this.queryParamName]: tabLink };
  }
}