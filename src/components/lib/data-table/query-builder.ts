import { FilterValue, SortState } from './types';

export interface QueryParams {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  searchFields?: string[];
  [key: string]: any;
}

export interface SearchQuery {
  query: string;
  fields: string[];
}

/**
 * Build query parameters untuk API request
 */
export function buildQueryParams(
  pageIndex: number,
  pageSize: number,
  filters: FilterValue[],
  sort: SortState,
  additionalParams?: Record<string, any>,
  search?: SearchQuery
): QueryParams {
  const params: QueryParams = {
    pageIndex,
    pageSize,
  };

  // Add sort parameters
  if (sort.column) {
    params.sortBy = sort.column;
    params.sortOrder = sort.order || 'asc';
  }

  // Add filters
  filters.forEach((filter) => {
    const filterKey = `filters[${filter.field}]`;
    
    if (filter.type === 'dateRange' && Array.isArray(filter.value)) {
      params[`${filterKey}[from]`] = filter.value[0];
      params[`${filterKey}[to]`] = filter.value[1];
    } else if (filter.type === 'range' && Array.isArray(filter.value)) {
      params[`${filterKey}[min]`] = filter.value[0];
      params[`${filterKey}[max]`] = filter.value[1];
    } else if (filter.type === 'multiSelect' && Array.isArray(filter.value)) {
      params[`${filterKey}[]`] = filter.value;
    } else {
      params[filterKey] = filter.value;
    }
  });

  if (search?.query?.trim()) {
    params.search = search.query.trim();
    if (search.fields?.length) {
      params.searchFields = search.fields;
    }
  }

  // Add additional parameters
  if (additionalParams) {
    Object.assign(params, additionalParams);
  }

  return params;
}

/**
 * Convert query params to URL search params
 */
export function paramsToURLSearchParams(params: QueryParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, String(item));
      });
    } else {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

/**
 * Build URL dengan query parameters
 */
export function buildURL(baseURL: string, params: QueryParams): string {
  const url = new URL(baseURL);
  const searchParams = paramsToURLSearchParams(params);
  
  url.search = searchParams.toString();
  return url.toString();
}
