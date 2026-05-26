import { FilterValue, FilterType } from './types';

export function parseDateValue(value: unknown): Date | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]) - 1;
      const day = Number(dateOnlyMatch[3]);
      const parsed = new Date(year, month, day);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

export function formatDateKey(value: unknown): string | null {
  const parsed = parseDateValue(value);
  if (!parsed) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate if a filter value is valid
 */
export function isValidFilterValue(filter: FilterValue): boolean {
  if (!filter.field || !filter.value) {
    return false;
  }

  switch (filter.type) {
    case 'dateRange':
      return (
        Array.isArray(filter.value) &&
        filter.value.length === 2 &&
        parseDateValue(filter.value[0]) !== null &&
        parseDateValue(filter.value[1]) !== null
      );

    case 'range':
      return (
        Array.isArray(filter.value) &&
        filter.value.length === 2 &&
        typeof filter.value[0] === 'number' &&
        typeof filter.value[1] === 'number'
      );

    case 'multiSelect':
      return Array.isArray(filter.value) && filter.value.length > 0;

    case 'date':
    case 'select':
    case 'checkbox':
    case 'search':
      return filter.value !== null && filter.value !== undefined && filter.value !== '';

    default:
      return true;
  }
}

/**
 * Apply filters to data (client-side filtering)
 */
export function applyFilters<T extends Record<string, any>>(
  data: T[],
  filters: FilterValue[]
): T[] {
  return data.filter((item) => {
    return filters.every((filter) => matchesFilter(item, filter));
  });
}

/**
 * Check if item matches filter criteria
 */
function matchesFilter(
  item: Record<string, any>,
  filter: FilterValue
): boolean {
  const value = item[filter.field];

  if (value === null || value === undefined) {
    return false;
  }

  switch (filter.type) {
    case 'search':
      return String(value)
        .toLowerCase()
        .includes(String(filter.value).toLowerCase());

    case 'date':
      return formatDateKey(value) === formatDateKey(filter.value);

    case 'dateRange': {
      const itemDateKey = formatDateKey(value);
      const [fromValue, toValue] = Array.isArray(filter.value)
        ? filter.value
        : [filter.value?.from, filter.value?.to];
      const fromDateKey = formatDateKey(fromValue);
      const toDateKey = formatDateKey(toValue);

      if (!itemDateKey || !fromDateKey || !toDateKey) return false;

      return itemDateKey >= fromDateKey && itemDateKey <= toDateKey;
    }

    case 'select':
      return value === filter.value;

    case 'multiSelect':
      return Array.isArray(filter.value) &&
        filter.value.includes(String(value));

    case 'checkbox':
      return Boolean(value) === Boolean(filter.value);

    case 'range': {
      const numValue = Number(value);
      const [min, max] = filter.value;
      return numValue >= min && numValue <= max;
    }

    default:
      return true;
  }
}

/**
 * Group filters by field for display purposes
 */
export function groupFiltersByField(
  filters: FilterValue[]
): Record<string, FilterValue[]> {
  return filters.reduce(
    (acc, filter) => {
      if (!acc[filter.field]) {
        acc[filter.field] = [];
      }
      acc[filter.field].push(filter);
      return acc;
    },
    {} as Record<string, FilterValue[]>
  );
}

/**
 * Remove filter by field and optionally by specific value
 */
export function removeFilter(
  filters: FilterValue[],
  fieldToRemove: string,
  valueToRemove?: any
): FilterValue[] {
  return filters.filter((filter) => {
    if (filter.field !== fieldToRemove) {
      return true;
    }
    if (valueToRemove === undefined) {
      return false;
    }
    return filter.value !== valueToRemove;
  });
}

/**
 * Clear all filters for specific field
 */
export function clearFieldFilters(
  filters: FilterValue[],
  fieldsToClear: string[]
): FilterValue[] {
  return filters.filter((filter) => !fieldsToClear.includes(filter.field));
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: FilterValue[]): boolean {
  return filters.length > 0 && filters.some(isValidFilterValue);
}
