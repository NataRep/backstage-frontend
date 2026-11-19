import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { InventoryCategory } from '../../../core/models/interfaces/inventory.models';
import { ShowType } from '../../../core/models/interfaces/show.model';
import { INVENTORY_CATEGORY_RU } from '../../constants/texts/common.texts';
import { UppercaseFirstLetter } from '../../pipes/uppercase-first-letter.pipe';
import { IconComponent } from '../icons/icons.component';

export type TabQueryParamsMap = Record<string, string | null | undefined>;

export interface TabItem {
  label: string;
  icon: string;
  /** Путь для перехода при mode = 'route' */
  routePath?: string;
  /** Готовый объект query-параметров при mode = 'route' (например, { category: 'fireshow' }) */
  queryParams?: TabQueryParamsMap | null;
  /** Значение параметра при mode = 'queryParams' (например, 'fireshow' для ?category=fireshow) */
  paramValue?: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent, UppercaseFirstLetter],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  @Input() tabs: TabItem[] = [];

  /** 'route' — переход по routePath с queryParams; 'queryParams' — смена только query-параметра на текущем пути */
  @Input() mode: 'route' | 'queryParams' = 'route';

  /** Имя query-параметра при mode = 'queryParams' (например, 'category' или 'tab') */
  @Input() queryParamKey = 'tab';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly currentQueryParams = toSignal(this.route.queryParams);

  getTargetLink(tab: TabItem): string | unknown[] {
    if (this.mode === 'queryParams') {
      return [];
    }
    return tab.routePath ?? [];
  }

  getTargetQueryParams(tab: TabItem): TabQueryParamsMap | null {
    if (this.mode === 'queryParams') {
      return { [this.queryParamKey]: tab.paramValue ?? null };
    }
    return tab.queryParams ?? null;
  }

  isTabActive(tab: TabItem): boolean {
    if (this.mode === 'queryParams') {
      return this.currentQueryParams()?.[this.queryParamKey] === tab.paramValue;
    }
    if (!tab.routePath) {
      return false;
    }
    const currentPath = this.router.url.split('?')[0];
    return currentPath === tab.routePath;
  }
}

export const getCategoryTabs = (array: readonly (ShowType | InventoryCategory)[]): TabItem[] => {
  return [...array].map((categoryKey) => ({
    label: INVENTORY_CATEGORY_RU[categoryKey as keyof typeof INVENTORY_CATEGORY_RU],
    icon: categoryKey,
    paramValue: categoryKey,
  }));
};