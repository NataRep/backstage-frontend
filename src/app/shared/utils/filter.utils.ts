export interface FilterOptions<T> {
  query?: string;
  searchFields: (item: T) => string[]; // Поля, по которым ищем
  category?: string;
  categoryField?: keyof T; // Поле для сравнения категории
  sortField: (item: T) => string; // Поле для алфавитной сортировки
  extraFilter?: (item: T) => boolean; // Специфичные фильтры (например, роли)
}

export function filterData<T>(data: T[], options: FilterOptions<T>): T[] {
  const { query, searchFields, category, categoryField, sortField, extraFilter } = options;
  const normalizedQuery = query?.toLowerCase().trim();

  const filtered = data.filter(item => {
    if (category && category !== 'all' && categoryField) {
      if (item[categoryField] !== category) return false;
    }

    if (normalizedQuery) {
      const isMatch = searchFields(item).some(field =>
        field.toLowerCase().includes(normalizedQuery)
      );
      if (!isMatch) return false;
    }

    if (extraFilter && !extraFilter(item)) return false;

    return true;
  });

  return [...filtered].sort((a, b) =>
    sortField(a).localeCompare(sortField(b))
  );
}