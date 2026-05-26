// Filter Types
export type FilterOperator = 
  | 'equals' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'between'
  | 'in'
  | 'dateRange';

export type FilterType = 
  | 'search' 
  | 'date' 
  | 'dateRange' 
  | 'select' 
  | 'multiSelect' 
  | 'checkbox' 
  | 'range';

export interface FilterValue {
  field: string;
  operator: FilterOperator;
  value: any;
  type: FilterType;
}

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface ColumnFilter {
  id: string;
  label: string;
  type: FilterType;
  operator?: FilterOperator;
  options?: FilterOption[];
  minValue?: number;
  maxValue?: number;
  placeholder?: string;
}

// Sorting
export type SortOrder = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  order: SortOrder;
}

// Pagination
export interface PaginationMeta {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalData: number;
}

export interface DataTableResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}

// Selection
export interface RowSelectionState {
  [key: string]: boolean;
}

// Column Visibility
export interface ColumnVisibilityState {
  [key: string]: boolean;
}

// Expandable Row
export interface ExpandedRowState {
  [key: string]: boolean;
}

// DataTable State
export interface DataTableState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  filters: FilterValue[];
  search?: {
    query: string;
    fields: string[];
  };
  sort: SortState;
  pagination: PaginationMeta;
  rowSelection: RowSelectionState;
  columnVisibility: ColumnVisibilityState;
  expandedRows: ExpandedRowState;
  paginationMode: 'traditional' | 'infinite';
}
