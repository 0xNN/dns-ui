import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useFilters } from './contexts/FilterContext';
import { FilterValue } from '../lib/data-table/types';
import { usePagination } from './contexts/PaginationContext';
import { useSelection } from './contexts/SelectionContext';
import { useSort } from './contexts/SortContext';
import { SortState } from '../lib/data-table/types';
import { useColumnVisibility } from './contexts/ColumnVisibilityContext';
import { RowCheckbox } from './selection/RowCheckbox';
import { SelectAllCheckbox } from './selection/SelectAllCheckbox';
import { ExpandableRow } from './selection/ExpandableRow';
import { SelectionSummary } from './selection/SelectionSummary';
import { TraditionalPagination } from './pagination/TraditionalPagination';
import { InfiniteScrollPagination } from './pagination/InfiniteScrollPagination';
import { FilterPanel } from './filters/FilterPanel';
import { ColumnHeaderFilter } from './filters/ColumnHeaderFilter';
import { DataTableColumn, DataTableProps } from './types';
import { Button } from '../ui/button';
import { Filter, ArrowUpDown, X, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../lib/utils';
import { formatDateKey } from '../lib/data-table/filter-utils';
import EmptyStateIllustration from '@/components/EmptyStateIllustration';

const STICKY_SELECTION_KEY = '__datatable_selection__';
const STICKY_EXPAND_KEY = '__datatable_expand__';
const STICKY_ROW_NUMBER_KEY = '__datatable_rownumber__';
const TOOL_COLUMN_WIDTH = 48;
const DEFAULT_STICKY_DATA_COLUMN_WIDTH = 180;

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  error = null,
  rowKey,
  onRowClick,
  showSelection = true,
  showExpand = false,
  stickySelection = true,
  stickyExpand = true,
  showRowNumber = false,
  stickyRowNumber = true,
  expandContent,
  paginationMode = 'traditional',
  showFilters = true,
  showSearch = false,
  searchFields,
  searchPlaceholder,
  tableHeight,
  infiniteScrollHeight,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  totalCount,
  onStateChange,
  emptyStateMessage = 'No Data Available',
}: DataTableProps<T>) {
  const { isColumnVisible, setVisibility } = useColumnVisibility();
  const { pageIndex, pageSize: contextPageSize, updatePaginationMeta, goToPage } = usePagination();
  const { sort, toggleSort } = useSort();
  const { isRowExpanded } = useSelection();
  const { filters } = useFilters();
  const filterableColumns = columns
    .filter((col) => col.filterable && col.filterConfig)
    .map((col) => col.filterConfig!);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const stickyCellRefs = React.useRef<Record<string, HTMLTableCellElement | null>>({});
  const [stickyOffsets, setStickyOffsets] = React.useState<Record<string, number>>({});
  const [stickyWidths, setStickyWidths] = React.useState<Record<string, number>>({});
  const tableScrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const isStickyLeftColumn = React.useCallback(
    (column: DataTableColumn<T>) => column.sticky === true || column.sticky === 'left',
    []
  );
  const isStickyRightColumn = React.useCallback(
    (column: DataTableColumn<T>) => column.sticky === 'right',
    []
  );

  const resolvedTableHeight = React.useMemo(() => {
    const heightValue = tableHeight ?? infiniteScrollHeight;
    if (heightValue !== undefined && heightValue !== null) {
      return typeof heightValue === 'number' ? `${heightValue}px` : heightValue;
    }

    return paginationMode === 'infinite' ? '600px' : undefined;
  }, [tableHeight, infiniteScrollHeight, paginationMode]);

  const tableBodyStyle = React.useMemo(
    () => (resolvedTableHeight ? { height: resolvedTableHeight } : undefined),
    [resolvedTableHeight]
  );

  const searchableColumns = React.useMemo(() => {
    const targetFields = searchFields?.length ? searchFields.map(String) : columns.map((column) => column.id);
    return columns.filter((column) => targetFields.includes(column.id));
  }, [columns, searchFields]);

  const resolvedSearchPlaceholder = React.useMemo(() => {
    if (searchPlaceholder) return searchPlaceholder;
    if (!showSearch) return '';
    if (!searchableColumns.length) return 'Search...';

    const labels = searchableColumns.map((column) =>
      typeof column.header === 'string' ? column.header : column.id
    );

    if (searchFields?.length) {
      return labels.length ? `Search ${labels.join(', ')}...` : 'Search...';
    }

    return 'Search all columns...';
  }, [searchPlaceholder, showSearch, searchableColumns, searchFields]);

  const applySearch = React.useCallback(
    (rows: T[], query: string): T[] => {
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) return rows;
      if (!searchableColumns.length) return rows;

      return rows.filter((row) =>
        searchableColumns.some((column) => {
          let value: unknown = null;

          if (column.accessor) {
            if (typeof column.accessor === 'function') {
              value = column.accessor(row);
            } else {
              value = row[column.accessor as keyof T];
            }
          } else {
            value = row[column.id as keyof T];
          }

          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(normalizedQuery);
        })
      );
    },
    [searchableColumns]
  );

  const handleSearchSubmit = () => {
    const nextQuery = searchInput.trim();
    setSearchInput(nextQuery);
    setSearchQuery(nextQuery);
    goToPage(1);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setSearchQuery('');
    goToPage(1);
  };

  // Client-side filtering
  const applyFilters = React.useCallback(
    (rows: T[], activeFilters: FilterValue[]): T[] => {
      if (activeFilters.length === 0) return rows;
      return rows.filter((row) =>
        activeFilters.every((filter) => {
          const rawValue = row[filter.field as keyof T];
          const cellValue = rawValue == null ? '' : rawValue;

          switch (filter.type) {
            case 'search':
              return String(cellValue)
                .toLowerCase()
                .includes(String(filter.value).toLowerCase());

            case 'date': {
              return formatDateKey(cellValue) === formatDateKey(filter.value);
            }

            case 'dateRange': {
              const cellDateKey = formatDateKey(cellValue);
              const [from, to] = filter.value as [string | undefined, string | undefined];
              const fromDateKey = from ? formatDateKey(from) : undefined;
              const toDateKey = to ? formatDateKey(to) : undefined;
              if (!cellDateKey || !fromDateKey || !toDateKey) return false;
              if (cellDateKey < fromDateKey) return false;
              if (cellDateKey > toDateKey) return false;
              return true;
            }

            case 'select':
              return String(cellValue) === String(filter.value);

            case 'multiSelect': {
              const selected = filter.value as string[];
              if (!selected || selected.length === 0) return true;
              return selected.includes(String(cellValue));
            }

            case 'checkbox':
              return Boolean(cellValue) === Boolean(filter.value);

            case 'range': {
              const [min, max] = filter.value as [number, number];
              const num = Number(cellValue);
              if (min != null && num < min) return false;
              if (max != null && num > max) return false;
              return true;
            }

            default:
              return true;
          }
        })
      );
    },
    []
  );

  const applySort = React.useCallback(
    (rows: T[], sortState: SortState): T[] => {
      if (!sortState.column || !sortState.order) return rows;

      return [...rows].sort((a, b) => {
        const column = columns.find((c) => c.id === sortState.column);
        if (!column) return 0;

        let valA: any;
        let valB: any;

        if (column.accessor) {
          if (typeof column.accessor === 'function') {
            valA = column.accessor(a);
            valB = column.accessor(b);
          } else {
            valA = a[column.accessor as keyof T];
            valB = b[column.accessor as keyof T];
          }
        }

        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        const multiplier = sortState.order === 'desc' ? -1 : 1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * multiplier;
        }

        return (valA < valB ? -1 : 1) * multiplier;
      });
    },
    [columns]
  );

  const processedData = React.useMemo(() => {
    let result = data;
    if (!manualFiltering) {
      result = applySearch(result, searchQuery);
    }
    if (!manualFiltering) {
      result = applyFilters(result, filters);
    }
    if (!manualSorting) {
      result = applySort(result, sort);
    }
    return result;
  }, [data, filters, sort, searchQuery, applyFilters, applySearch, applySort, manualFiltering, manualSorting]);

  const paginatedData = React.useMemo(() => {
    if (manualPagination) return processedData;
    if (paginationMode === 'infinite') {
      return processedData.slice(0, pageIndex * contextPageSize);
    }
    const start = (pageIndex - 1) * contextPageSize;
    return processedData.slice(start, start + contextPageSize);
  }, [processedData, pageIndex, contextPageSize, paginationMode, manualPagination]);

  const visibleColumns = React.useMemo(
    () => columns.filter((col) => isColumnVisible(col.id)),
    [columns, isColumnVisible]
  );

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isScrolledEnd, setIsScrolledEnd] = React.useState(false);

  React.useEffect(() => {
    const container = tableScrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollLeft > 0);
      setIsScrolledEnd(
        container.scrollLeft + container.clientWidth < container.scrollWidth - 2
      );
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [paginatedData]);
  const rowIds = processedData.map((row) => String(row[rowKey]));
  const stickyColumns = React.useMemo(
    () => visibleColumns.filter((column) => isStickyLeftColumn(column)),
    [visibleColumns, isStickyLeftColumn]
  );
  const stickyRightColumns = React.useMemo(
    () => visibleColumns.filter((column) => isStickyRightColumn(column)),
    [visibleColumns, isStickyRightColumn]
  );

  const stickyColumnKeys = React.useMemo(() => {
    const keys: string[] = [];

    if (showSelection && stickySelection) keys.push(STICKY_SELECTION_KEY);
    if (showExpand && stickyExpand) keys.push(STICKY_EXPAND_KEY);
    if (showRowNumber && stickyRowNumber) keys.push(STICKY_ROW_NUMBER_KEY);

    stickyColumns.forEach((column) => {
      keys.push(column.id);
    });

    return keys;
  }, [showSelection, stickySelection, showExpand, stickyExpand, showRowNumber, stickyRowNumber, stickyColumns]);

  const stickyRightColumnKeys = React.useMemo(
    () => [...stickyRightColumns].reverse().map((column) => column.id),
    [stickyRightColumns]
  );

  const lastStickyLeftKey = React.useMemo(() => {
    return stickyColumnKeys[stickyColumnKeys.length - 1];
  }, [stickyColumnKeys]);

  const lastStickyRightKey = React.useMemo(() => {
    return stickyRightColumnKeys[stickyRightColumnKeys.length - 1];
  }, [stickyRightColumnKeys]);

  const measureStickyOffsets = React.useCallback(() => {
    const nextOffsets: Record<string, number> = {};
    const nextWidths: Record<string, number> = {};

    let left = 0;

    stickyColumnKeys.forEach((key) => {
      const measuredWidth = stickyCellRefs.current[key]?.getBoundingClientRect().width ?? 0;
      nextOffsets[key] = left;
      nextWidths[key] = measuredWidth;
      left += measuredWidth;
    });

    let right = 0;
    stickyRightColumnKeys.forEach((key) => {
      const measuredWidth = stickyCellRefs.current[key]?.getBoundingClientRect().width ?? 0;
      nextOffsets[key] = right;
      nextWidths[key] = measuredWidth;
      right += measuredWidth;
    });

    setStickyOffsets(nextOffsets);
    setStickyWidths(nextWidths);
  }, [stickyColumnKeys, stickyRightColumnKeys]);

  const buildStickySizeStyle = React.useCallback(
    (width?: string | number | null, fallbackKey?: string) => {
      const measuredWidth = fallbackKey ? stickyWidths[fallbackKey] : undefined;
      const resolvedWidth =
        typeof width === 'number'
          ? `${width}px`
          : width ??
          (measuredWidth !== undefined && measuredWidth > 0
            ? `${measuredWidth}px`
            : (fallbackKey === STICKY_SELECTION_KEY || fallbackKey === STICKY_EXPAND_KEY || fallbackKey === STICKY_ROW_NUMBER_KEY)
              ? `${TOOL_COLUMN_WIDTH}px`
              : undefined);

      return resolvedWidth
        ? {
          width: resolvedWidth,
          minWidth: resolvedWidth,
          maxWidth: resolvedWidth,
        }
        : undefined;
    },
    [stickyWidths]
  );

  const getColumnStyle = React.useCallback(
    (column: DataTableColumn<T>) => {
      if (!isStickyLeftColumn(column) && !isStickyRightColumn(column)) {
        return column.width !== undefined
          ? {
            width: typeof column.width === 'number' ? `${column.width}px` : column.width,
          }
          : undefined;
      }

      const fallbackWidth =
        typeof column.width === 'number'
          ? `${column.width}px`
          : column.width ??
          (stickyWidths[column.id] != null
            ? `${stickyWidths[column.id]}px`
            : `${DEFAULT_STICKY_DATA_COLUMN_WIDTH}px`);

      return {
        width: fallbackWidth,
        minWidth: fallbackWidth,
        maxWidth: fallbackWidth,
      };
    },
    [isStickyLeftColumn, isStickyRightColumn, stickyWidths]
  );

  useEffect(() => {
    // Update pagination meta whenever filtered or sorted data changes
    // If server-side (manual), use totalCount and don't reset pageIndex to 1 automatically here
    // as the parent will manage it.
    if (manualPagination && totalCount !== undefined) {
      updatePaginationMeta({
        pageIndex,
        pageSize: contextPageSize,
        pageCount: Math.ceil(totalCount / contextPageSize),
        totalData: totalCount,
      });
      return;
    }

    // Client-side pagination reset logic
    updatePaginationMeta({
      pageIndex: 1,
      pageSize: contextPageSize,
      pageCount: Math.ceil(processedData.length / contextPageSize),
      totalData: processedData.length,
    });
  }, [processedData.length, contextPageSize, updatePaginationMeta, manualPagination, totalCount]);

  // Notify parent of state changes (useful for server-side fetching)
  useEffect(() => {
    onStateChange?.({
      pageIndex,
      pageSize: contextPageSize,
      sort,
      filters,
      search: showSearch
        ? {
          query: searchQuery,
          fields: searchFields?.length ? searchFields.map(String) : columns.map((column) => column.id),
        }
        : undefined,
    });
  }, [pageIndex, contextPageSize, sort, filters, searchQuery, showSearch, searchableColumns, onStateChange]);

  useEffect(() => {
    // Initialize column visibility on mount, preserving existing visibility state
    const initialVisibility = columns.reduce(
      (acc, col) => ({
        ...acc,
        [col.id]: isColumnVisible(col.id),
      }),
      {}
    );
    setVisibility(initialVisibility);
  }, [columns, setVisibility]);

  React.useLayoutEffect(() => {
    measureStickyOffsets();
  }, [measureStickyOffsets, paginatedData, visibleColumns, showSelection, showExpand]);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;

    const container = tableScrollContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      measureStickyOffsets();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [measureStickyOffsets]);

  const getColumnValue = (row: T, column: DataTableColumn<T>): React.ReactNode => {
    if (column.cell) {
      return column.cell(row);
    }
    if (column.accessor) {
      if (typeof column.accessor === 'function') {
        return column.accessor(row);
      }
      return row[column.accessor as keyof T];
    }
    return null;
  };

  const renderSortIcon = (columnId: string) => {
    if (sort.column !== columnId) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return (
      <ArrowUpDown
        className={`h-4 w-4 transition-transform ${sort.order === 'desc' ? 'rotate-180' : ''
          }`}
      />
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center gap-3 p-8 text-destructive bg-destructive/10 rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Panel */}
      {(showSearch || (showFilters && filterableColumns.length > 0)) && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {showSearch && (
            <div className="w-full md:max-w-md">
              <label className="sr-only" htmlFor="datatable-search">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="datatable-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  placeholder={resolvedSearchPlaceholder}
                  className="h-8 w-full pl-8 pr-8"
                />
                {searchInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSearchClear}
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {showFilters && filterableColumns.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant={showFilterPanel ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {showFilterPanel && filterableColumns.length > 0 && (
        <FilterPanel
          columns={filterableColumns}
          onClose={() => setShowFilterPanel(false)}
        />
      )}

      {/* Selection Summary */}
      <SelectionSummary />

      {/* Main Table */}
      <div
        ref={tableScrollContainerRef}
        className={cn(
          'border rounded-lg',
          resolvedTableHeight ? 'overflow-auto' : 'overflow-hidden'
        )}
        style={tableBodyStyle}
      >
        <Table containerClassName={resolvedTableHeight ? 'overflow-visible' : undefined}>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {showSelection && (
                <TableHead
                  ref={(node) => {
                    if (stickySelection) {
                      stickyCellRefs.current[STICKY_SELECTION_KEY] = node;
                    }
                  }}
                  className={cn(
                    "text-center bg-muted sticky top-0",
                    stickySelection ? "z-[70]" : "z-[60]",
                    stickySelection && isScrolled && STICKY_SELECTION_KEY === lastStickyLeftKey
                      ? "shadow-[1px_0_0_#e2e8f0,10px_0_15px_-5px_rgba(0,0,0,0.15)]"
                      : "shadow-[1px_0_0_#e2e8f0]"
                  )}
                  style={{
                    left: stickySelection ? stickyOffsets[STICKY_SELECTION_KEY] ?? 0 : undefined,
                    ...buildStickySizeStyle(undefined, STICKY_SELECTION_KEY),
                  }}
                >
                  <div className="flex items-center justify-center">
                    <SelectAllCheckbox rowIds={rowIds} />
                  </div>
                </TableHead>
              )}
              {showExpand && (
                <TableHead
                  ref={(node) => {
                    if (stickyExpand) {
                      stickyCellRefs.current[STICKY_EXPAND_KEY] = node;
                    }
                  }}
                  className={cn(
                    "text-center bg-muted sticky top-0",
                    stickyExpand ? "z-[70]" : "z-[60]",
                    stickyExpand && isScrolled && STICKY_EXPAND_KEY === lastStickyLeftKey
                      ? "shadow-[1px_0_0_#e2e8f0,10px_0_15px_-5px_rgba(0,0,0,0.15)]"
                      : "shadow-[1px_0_0_#e2e8f0]"
                  )}
                  style={{
                    left: stickyExpand ? stickyOffsets[STICKY_EXPAND_KEY] ?? 0 : undefined,
                    ...buildStickySizeStyle(undefined, STICKY_EXPAND_KEY),
                  }}
                >
                  <div className="flex items-center justify-center" aria-hidden="true">
                    <span className="block h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {showRowNumber && (
                <TableHead
                  ref={(node) => {
                    if (stickyRowNumber) {
                      stickyCellRefs.current[STICKY_ROW_NUMBER_KEY] = node;
                    }
                  }}
                  className={cn(
                    "text-center bg-muted sticky top-0",
                    stickyRowNumber ? "z-[70]" : "z-[60]",
                    stickyRowNumber && isScrolled && STICKY_ROW_NUMBER_KEY === lastStickyLeftKey
                      ? "shadow-[1px_0_0_#e2e8f0,10px_0_15px_-5px_rgba(0,0,0,0.15)]"
                      : "shadow-[1px_0_0_#e2e8f0]",
                    stickyRowNumber && isScrolled && STICKY_ROW_NUMBER_KEY === lastStickyLeftKey && "shadow-[inset_-8px_0_8px_-8px_rgba(0,0,0,0.1)]"
                  )}
                  style={{
                    left: stickyRowNumber ? stickyOffsets[STICKY_ROW_NUMBER_KEY] ?? 0 : undefined,
                    ...buildStickySizeStyle(undefined, STICKY_ROW_NUMBER_KEY),
                  }}
                >
                  <div className="flex items-center justify-center">
                    No
                  </div>
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  ref={(node) => {
                    if (isStickyLeftColumn(column) || isStickyRightColumn(column)) {
                      stickyCellRefs.current[column.id] = node;
                    }
                  }}
                  className={cn(
                    isStickyLeftColumn(column)
                      ? cn(
                        'sticky top-0 text-left bg-muted',
                        isScrolled && column.id === lastStickyLeftKey
                          ? "z-[70] shadow-[1px_0_0_#e2e8f0,10px_0_15px_-5px_rgba(0,0,0,0.15)]"
                          : "z-[70] shadow-[1px_0_0_#e2e8f0]",
                        isScrolled && column.id === lastStickyLeftKey && "shadow-[inset_-8px_0_8px_-8px_rgba(0,0,0,0.1)]"
                      )
                      : isStickyRightColumn(column)
                        ? cn(
                          'sticky top-0 text-left bg-muted',
                          isScrolledEnd && column.id === lastStickyRightKey
                            ? "z-[70] shadow-[-1px_0_0_#e2e8f0,-10px_0_15px_-5px_rgba(0,0,0,0.15)]"
                            : "z-[70] shadow-[-1px_0_0_#e2e8f0]",
                          isScrolledEnd && column.id === lastStickyRightKey && "shadow-[inset_8px_0_8px_-8px_rgba(0,0,0,0.1)]"
                        )
                        : 'sticky top-0 z-[60] text-left bg-muted border-b',
                    column.headerClassName
                  )}
                  style={{
                    ...getColumnStyle(column),
                    left: isStickyLeftColumn(column) ? stickyOffsets[column.id] ?? 0 : undefined,
                    right: isStickyRightColumn(column) ? stickyOffsets[column.id] ?? 0 : undefined,
                  }}
                >
                  <div className="flex items-center gap-1">
                    {column.sortable ? (
                      <button
                        onClick={() => toggleSort(column.id)}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        {column.header}
                        {renderSortIcon(column.id)}
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                    {column.filterable && column.filterConfig && (
                      <ColumnHeaderFilter filterConfig={column.filterConfig} />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {showSelection && (
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                  {showExpand && <TableCell></TableCell>}
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : processedData.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={
                    visibleColumns.length +
                    (showSelection ? 1 : 0) +
                    (showExpand ? 1 : 0)
                  }

                >
                  <div className="flex flex-col items-center justify-center pb-7">
                    <EmptyStateIllustration />
                    <div className="text-center text-muted-foreground">
                      {emptyStateMessage}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              paginatedData.map((row, index) => {
                const rowId = String(row[rowKey]);
                const isExpanded = isRowExpanded(rowId);

                return (
                  <React.Fragment key={rowId}>
                    <TableRow
                      onClick={() => onRowClick?.(row)}
                      className={cn('group hover:bg-muted/50 transition-colors', {
                        'cursor-pointer': onRowClick,
                      })}
                    >
                      {showSelection && (
                        <TableCell
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "text-center bg-background group-hover:bg-muted",
                            stickySelection && "sticky z-[45]",
                            stickySelection && isScrolled && STICKY_SELECTION_KEY === lastStickyLeftKey
                              ? "shadow-[1px_0_0_#e2e8f0,10px_0_15px_-5px_rgba(0,0,0,0.15)]"
                              : "shadow-[1px_0_0_#e2e8f0]"
                          )}
                          style={{
                            left: stickySelection ? stickyOffsets[STICKY_SELECTION_KEY] ?? 0 : undefined,
                            ...buildStickySizeStyle(undefined, STICKY_SELECTION_KEY),
                          }}
                        >
                          <div className="flex items-center justify-center">
                            <RowCheckbox rowId={rowId} />
                          </div>
                        </TableCell>
                      )}
                      {showExpand && (
                        <TableCell
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "text-center bg-background group-hover:bg-muted",
                            stickyExpand && "sticky z-[45]",
                            stickyExpand && isScrolled && STICKY_EXPAND_KEY === lastStickyLeftKey
                              ? "shadow-[1px_0_0_#e2e8f0,10px_0_15px_-5px_rgba(0,0,0,0.15)]"
                              : "shadow-[1px_0_0_#e2e8f0]"
                          )}
                          style={{
                            left: stickyExpand ? stickyOffsets[STICKY_EXPAND_KEY] ?? 0 : undefined,
                            ...buildStickySizeStyle(undefined, STICKY_EXPAND_KEY),
                          }}
                        >
                          <div className="flex items-center justify-center">
                            <ExpandableRow rowId={rowId} />
                          </div>
                        </TableCell>
                      )}
                      {showRowNumber && (
                        <TableCell
                          className={cn(
                            "text-center bg-background group-hover:bg-muted font-medium text-muted-foreground text-xs",
                            stickyRowNumber && "sticky z-[45]",
                            stickyRowNumber && isScrolled && STICKY_ROW_NUMBER_KEY === lastStickyLeftKey
                              ? "shadow-[1px_0_0_#e2e8f0,10px_0_15px_-5px_rgba(0,0,0,0.15),inset_-8px_0_8px_-8px_rgba(0,0,0,0.1)]"
                              : "shadow-[1px_0_0_#e2e8f0]"
                          )}
                          style={{
                            left: stickyRowNumber ? stickyOffsets[STICKY_ROW_NUMBER_KEY] ?? 0 : undefined,
                            ...buildStickySizeStyle(undefined, STICKY_ROW_NUMBER_KEY),
                          }}
                        >
                          <div className="flex items-center justify-center">
                            {((pageIndex - 1) * contextPageSize) + index + 1}
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          className={cn(
                            'truncate',
                            isStickyLeftColumn(column) &&
                            cn(
                              'sticky z-[45] bg-background',
                              isScrolled && column.id === lastStickyLeftKey
                                ? "shadow-[1px_0_0_#e2e8f0,10px_0_15px_-5px_rgba(0,0,0,0.15),inset_-8px_0_8px_-8px_rgba(0,0,0,0.1)]"
                                : "shadow-[1px_0_0_#e2e8f0]"
                            ),
                            isStickyRightColumn(column) &&
                            cn(
                              'sticky z-[45] bg-background',
                              isScrolledEnd && column.id === lastStickyRightKey
                                ? "shadow-[-1px_0_0_#e2e8f0,-10px_0_15px_-5px_rgba(0,0,0,0.15),inset_8px_0_8px_-8px_rgba(0,0,0,0.1)]"
                                : "shadow-[-1px_0_0_#e2e8f0]"
                            ),
                            isStickyLeftColumn(column) &&
                            'group-hover:bg-muted',
                            isStickyRightColumn(column) &&
                            'group-hover:bg-muted',
                            column.className
                          )}
                          style={{
                            ...getColumnStyle(column),
                            left: isStickyLeftColumn(column) ? stickyOffsets[column.id] ?? 0 : undefined,
                            right: isStickyRightColumn(column) ? stickyOffsets[column.id] ?? 0 : undefined,
                          }}
                        >
                          {getColumnValue(row, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                    {showExpand && isExpanded && expandContent && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        {showSelection && (
                          <TableCell
                            className="bg-muted/30"
                            style={{
                              ...buildStickySizeStyle(TOOL_COLUMN_WIDTH),
                            }}
                            colSpan={1}
                          />
                        )}
                        {showExpand && (
                          <TableCell
                            className="bg-muted/30"
                            style={{
                              ...buildStickySizeStyle(TOOL_COLUMN_WIDTH),
                            }}
                            colSpan={1}
                          />
                        )}
                        <TableCell
                          colSpan={visibleColumns.length}
                          className="p-4"
                        >
                          {expandContent(row)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginationMode === 'traditional' && (
        <TraditionalPagination pageSizeOptions={pageSizeOptions} />
      )}
      {paginationMode === 'infinite' && (
        <InfiniteScrollPagination isLoading={isLoading} />
      )}
    </div>
  );
}
