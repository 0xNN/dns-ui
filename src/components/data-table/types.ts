import React from 'react';
import { ColumnFilter, FilterValue, SortState } from '../lib/data-table/types';

export interface DataTableColumn<T> {
  id: string;
  header: string | React.ReactNode;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterConfig?: ColumnFilter;
  width?: string | number;
  className?: string;
  headerClassName?: string;
  sticky?: boolean | 'left' | 'right';
}

export interface DataTableState {
  pageIndex: number;
  pageSize: number;
  sort: SortState;
  filters: FilterValue[];
  search?: {
    query: string;
    fields: string[];
  };
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  rowKey: keyof T;
  onRowClick?: (row: T) => void;
  showSelection?: boolean;
  showExpand?: boolean;
  stickySelection?: boolean;
  stickyExpand?: boolean;
  showRowNumber?: boolean;
  stickyRowNumber?: boolean;
  expandContent?: (row: T) => React.ReactNode;
  paginationMode?: 'traditional' | 'infinite';
  showFilters?: boolean;
  showSearch?: boolean;
  searchFields?: string[];
  searchPlaceholder?: string;
  tableHeight?: string | number;
  infiniteScrollHeight?: string | number;
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // Server-side props
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  totalCount?: number;
  onStateChange?: (state: DataTableState) => void;

  emptyStateMessage?: string;
}
