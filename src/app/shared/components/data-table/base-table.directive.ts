import { computed, Directive, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Directive()
export abstract class BaseTableDirective<T> implements OnInit {
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);

  // Состояние
  searchQuery = signal('');
  currentPage = signal(1);

  // Абстрактные данные
  protected abstract sourceData: () => T[];
  protected abstract pageSize: () => number;
  protected abstract getExtraParams(): Record<string, any>;
  protected abstract isTableLocked: () => boolean;

  // Логика страниц теперь опирается на sourceData().length
  totalPages = computed(() => {
    const count = this.sourceData().length;
    return Math.ceil(count / this.pageSize()) || 1;
  });

  paginatedData = computed(() => {
    const data = this.sourceData();
    const total = this.totalPages();
    const size = this.pageSize();

    let current = this.currentPage();

    // Авто-сброс на 1 страницу, если текущая стала недоступна
    if (current > total && total > 0) {
      current = 1;
    }

    const startIndex = (current - 1) * size;
    return data.slice(startIndex, startIndex + size);
  });

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  constructor() {
    effect(() => {
      if (this.isTableLocked()) return;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: this.currentPage(),
          search: this.searchQuery() || null,
          ...this.getExtraParams()
        },
        queryParamsHandling: 'merge',
      });
    });
  }

  ngOnInit() {
    // Инициализация из URL при первом запуске
    const params = this.route.snapshot.queryParamMap;
    this.searchQuery.set(params.get('search') || '');
    this.currentPage.set(Number(params.get('page')) || 1);
  }

  onSearch(value: string) {
    if (this.isTableLocked()) return;
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  increasePage() {
    if (this.isTableLocked()) return;
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  reducePage() {
    if (this.isTableLocked()) return;
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }
}