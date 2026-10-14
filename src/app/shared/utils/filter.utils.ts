export interface FilterOptions<T> {
  query?: string;
  searchFields: (item: T) => (string | number | null | undefined)[];
  category?: string;
  categoryField?: keyof T;
  sortField: (item: T) => string;
  extraFilter?: (item: T) => boolean;
}

export function filterData<T>(data: T[], options: FilterOptions<T>): T[] {
  console.log("filterData data", data);

  const { query, searchFields, category, categoryField, sortField, extraFilter } = options;

  const normalizedQuery = query?.toLowerCase().trim() || '';
  const queryWords = normalizedQuery ? normalizedQuery.split(/\s+/) : [];

  const filtered = data.filter((item) => {
    if (category && category !== 'all' && categoryField) {
      const itemCategory = item[categoryField];
      if (itemCategory != null && String(itemCategory) !== category) {
        return false;
      }
    }

    if (queryWords.length > 0) {
      const fields = searchFields(item);

      const isMatch = queryWords.every((qWord) =>
        fields.some((field) => {
          if (field == null) return false;
          return String(field)
            .toLowerCase()
            .split(/\s+/)
            .some((fWord) => fWord.startsWith(qWord));
        })
      );

      if (!isMatch) return false;
    }

    if (extraFilter && !extraFilter(item)) return false;

    return true;
  });

  const result = [...filtered].sort((a, b) => sortField(a).localeCompare(sortField(b)));

  console.log("filterData result", result);
  return result;
}