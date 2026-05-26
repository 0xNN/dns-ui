# Feature-Rich DataTable Component

A comprehensive, production-ready DataTable component built with React 18, TypeScript, and shadcn/ui. Includes advanced filtering, sorting, selection, pagination, and expandable rows.

## Features

### Filtering System (7 Filter Types)
- **Search Filter**: Full-text search across fields
- **Date Filter**: Single date selection
- **Date Range Filter**: Date range filtering
- **Select Filter**: Single-select dropdown
- **Multi-Select Filter**: Multiple selection with badges
- **Checkbox Filter**: Boolean toggle filtering
- **Range Filter**: Numeric range slider

### Selection & Expansion
- Row checkboxes with individual selection
- Select all / deselect all functionality
- Selection summary with action buttons
- Expandable rows with custom content renderer
- Bulk action support for selected rows

### Pagination
- **Traditional Mode**: Page navigation with first/last/prev/next buttons
- **Infinite Scroll Mode**: Load More button for infinite scrolling
- Configurable page sizes (10, 25, 50, 100)
- Total items and current range display

### Sorting
- Multi-column sortable headers
- Ascending/Descending/None toggle
- Visual sort indicators
- Server-side ready query building

### Additional Features
- Top-level optional search bar
- Scrollable table area with configurable fixed height
- Sticky table header
- Sticky columns on the left with automatic offset stacking
- Column visibility toggle
- Loading skeleton states
- Error state handling
- Empty state message
- Responsive design
- Client & server-side ready architecture
- React Context for state management (no external state library)

## Installation & Setup

### 1. Basic Setup with DataTableProvider

```tsx
'use client';

import { DataTableProvider } from '@/components/data-table';
import { DataTable } from '@/components/data-table';

export default function MyPage() {
  return (
    <DataTableProvider>
      {/* Your DataTable and other components */}
    </DataTableProvider>
  );
}
```

### 2. Define Column Configuration

```tsx
import { DataTableColumn } from '@/components/data-table';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: DataTableColumn<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
    filterable: true,
    sticky: 'left', // or `right`, or `true` for left
    filterConfig: {
      id: 'name',
      label: 'Search Name',
      type: 'search',
      placeholder: 'Enter name...',
    },
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email',
    sortable: true,
  },
  {
    id: 'role',
    header: 'Role',
    accessor: 'role',
    sortable: true,
    filterable: true,
    filterConfig: {
      id: 'role',
      label: 'Select Role',
      type: 'multiSelect',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  },
];
```

Sticky columns can be added to multiple visible columns. The table measures each sticky column at runtime and stacks their offsets so they do not overlap.
Use `sticky: 'left'` or `sticky: 'right'` to pin columns on either side.

### 3. Render DataTable

```tsx
<DataTable<User>
  columns={columns}
  data={users}
  rowKey="id"
  showSelection={true}
  showExpand={true}
  expandContent={(row) => <div>Details for {row.name}</div>}
  paginationMode="traditional"
  showFilters={true}
  showSearch={true}
  searchFields={['name', 'email']} // optional, defaults to all columns
  tableHeight={600}
  pageSize={10}
/>
```

## Usage Examples

### Server-Side Integration

To integrate with your API backend:

```tsx
'use client';

import { useFilters } from '@/components/data-table';
import { usePagination } from '@/components/data-table';
import { useSort } from '@/components/data-table';
import { buildQueryParams } from '@/lib/data-table';

function DataTableWithAPI() {
  const { filters } = useFilters();
  const { pageIndex, pageSize } = usePagination();
  const { sort } = useSort();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = buildQueryParams(pageIndex, pageSize, filters, sort, undefined, search);
        const response = await fetch(`/api/users?${new URLSearchParams(params)}`);
        const result = await response.json();
        setData(result.data);
        // Update pagination meta from API
        updatePaginationMeta(result.meta.pagination);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pageIndex, pageSize, filters, sort]);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      rowKey="id"
      showSearch={true}
      onStateChange={({ search: nextSearch }) => setSearch(nextSearch)}
      // ... other props
    />
  );
}
```

### Custom Cell Rendering

```tsx
const columns: DataTableColumn<User>[] = [
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    cell: (row) => (
      <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
];
```

### Expandable Rows with Details

```tsx
<DataTable
  columns={columns}
  data={data}
  rowKey="id"
  showExpand={true}
  expandContent={(row) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="font-medium">{row.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Phone</p>
          <p className="font-medium">{row.phone}</p>
        </div>
      </div>
      <p>{row.description}</p>
    </div>
  )}
/>
```

### Row Selection with Bulk Actions

```tsx
import { useSelection } from '@/components/data-table';

function DataTableWithActions() {
  const { getSelectedRowIds } = useSelection();

  const handleBulkDelete = async () => {
    const selectedIds = getSelectedRowIds();
    await fetch('/api/users/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: selectedIds }),
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        rowKey="id"
        showSelection={true}
      />
      <SelectionSummary
        actionLabel="Delete Selected"
        onAction={handleBulkDelete}
      />
    </>
  );
}
```

## API Response Format

The DataTable expects API responses in this format:

```json
{
  "status": 200,
  "success": true,
  "message": "success",
  "data": [
    { "id": 1, "name": "User 1", ... },
    { "id": 2, "name": "User 2", ... }
  ],
  "meta": {
    "pagination": {
      "pageIndex": 1,
      "pageSize": 10,
      "pageCount": 7,
      "totalData": 65
    }
  }
}
```

## Query Parameters Sent to API

When building requests with `buildQueryParams()`:

```
pageIndex=1
pageSize=10
sortBy=name
sortOrder=asc
filters[name]=john
filters[role][]=admin&filters[role][]=user
filters[salary][min]=30000&filters[salary][max]=100000
filters[joinDate][from]=2024-01-01&filters[joinDate][to]=2024-12-31
```

## Hooks API

### useFilters()
```tsx
const {
  filters,           // Current filter array
  addFilter,         // Add a filter
  updateFilter,      // Update existing filter
  removeFilter,      // Remove filter
  clearFilters,      // Clear all filters
  clearFieldFilters, // Clear filters for specific fields
  hasActiveFilters,  // Check if any filters active
  getFieldFilters,   // Get filters for specific field
} = useFilters();
```

### usePagination()
```tsx
const {
  pageIndex,          // Current page (1-indexed)
  pageSize,           // Items per page
  pageCount,          // Total pages
  totalData,          // Total items count
  paginationMode,     // 'traditional' | 'infinite'
  goToPage,           // Jump to specific page
  nextPage,           // Go to next page
  previousPage,       // Go to previous page
  setPageSize,        // Change page size
  updatePaginationMeta, // Update all pagination data
  setPaginationMode,  // Switch pagination mode
  canGoNext,          // Can go to next?
  canGoPrevious,      // Can go to previous?
} = usePagination();
```

### useSelection()
```tsx
const {
  rowSelection,      // Selected rows object
  expandedRows,      // Expanded rows object
  toggleRow,         // Toggle row selection
  toggleAll,         // Toggle all rows
  selectRows,        // Select multiple rows
  deselectRows,      // Deselect multiple rows
  clearSelection,    // Clear all selections
  isRowSelected,     // Check if row selected
  selectedCount,     // Count of selected rows
  toggleExpanded,    // Toggle row expansion
  isRowExpanded,     // Check if row expanded
  expandedCount,     // Count of expanded rows
  getSelectedRowIds, // Get array of selected IDs
} = useSelection();
```

### useSort()
```tsx
const {
  sort,              // { column: string | null, order: 'asc' | 'desc' | null }
  setSort,           // Set sort column and order
  toggleSort,        // Cycle sort: asc -> desc -> none
  clearSort,         // Clear sorting
  isSorted,          // Check if column sorted
  getSortOrder,      // Get sort order for column
} = useSort();
```

### useColumnVisibility()
```tsx
const {
  visibility,        // Visibility state object
  toggleColumn,      // Toggle column visibility
  showColumn,        // Show column
  hideColumn,        // Hide column
  isColumnVisible,   // Check if visible
  showAllColumns,    // Show all columns
  hideAllColumns,    // Hide all columns
  setVisibility,     // Set all visibility
} = useColumnVisibility();
```

## Filter Types Configuration

### Search Filter
```tsx
{
  id: 'name',
  label: 'Search Name',
  type: 'search',
  placeholder: 'Enter name...',
}
```

### Date Filter
```tsx
{
  id: 'createdAt',
  label: 'Created Date',
  type: 'date',
}
```

### Date Range Filter
```tsx
{
  id: 'dateRange',
  label: 'Date Range',
  type: 'dateRange',
}
```

### Select Filter
```tsx
{
  id: 'status',
  label: 'Status',
  type: 'select',
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ],
  placeholder: 'Select status...',
}
```

### Multi-Select Filter
```tsx
{
  id: 'roles',
  label: 'Roles',
  type: 'multiSelect',
  options: [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ],
  placeholder: 'Select roles...',
}
```

### Checkbox Filter
```tsx
{
  id: 'isVerified',
  label: 'Is Verified',
  type: 'checkbox',
}
```

### Range Filter
```tsx
{
  id: 'salary',
  label: 'Salary Range',
  type: 'range',
  minValue: 0,
  maxValue: 1000000,
}
```

## DataTable Props

```tsx
interface DataTableProps<T> {
  // Required
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: keyof T;

  // Optional
  isLoading?: boolean;
  error?: string | null;
  onRowClick?: (row: T) => void;
  showSelection?: boolean;
  showExpand?: boolean;
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
}
```

## Styling & Customization

The DataTable uses Tailwind CSS classes and shadcn/ui components. Customize by:

1. **Modifying component styles** - Edit the component files directly
2. **Using Tailwind config** - Customize via `tailwind.config.ts`
3. **Custom cell rendering** - Use the `cell` prop in column config
4. **Custom header rendering** - Use `header` prop with JSX

## Performance Considerations

- **Virtual scrolling**: Consider for tables with 1000+ rows
- **Pagination**: Use traditional or infinite scroll based on UX needs
- **Client vs Server filtering**: Choose based on dataset size
- **Memoization**: Use `React.memo` for expensive cell renders
- **Key prop**: Always use a stable unique `rowKey`

## Accessibility

- Fully keyboard navigable (arrow keys, tab, enter)
- ARIA labels on all interactive elements
- Semantic HTML structure
- Screen reader friendly
- High contrast support

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Demo

Visit `/data-table-demo` to see all features in action!
