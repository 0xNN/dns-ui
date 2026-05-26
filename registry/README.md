# DNS UI DataTable

Advanced data table component for React with sticky columns, filtering, sorting, pagination, and selection.

## Installation

### Using shadcn CLI (Recommended)

```bash
npx shadcn@latest add https://raw.githubusercontent.com/dns-ui/tms-billing/main/registry/data-table.json
```

This will automatically:
- Copy all component files to your project
- Place files in the correct directories (`components/data-table/`, `components/ui/`, `lib/`)

### Manual Installation

1. Copy the `src/components/package/` folder to your project (e.g., `src/components/dns-ui/`)
2. Install dependencies:

```bash
npm install lucide-react date-fns clsx tailwind-merge
```

3. Ensure these shadcn/ui components are installed (the CLI handles this automatically):

```bash
npx shadcn@latest add button input select popover calendar table skeleton checkbox badge label scroll-area card
```

## Usage

```tsx
import { DataTable, DataTableProvider } from '@/components/data-table';
import type { DataTableColumn } from '@/components/data-table';

interface User {
  id: number;
  name: string;
  email: string;
}

const columns: DataTableColumn<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
    sticky: 'left',
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email',
    sortable: true,
    filterable: true,
    filterConfig: {
      id: 'email',
      label: 'Email',
      type: 'search',
      placeholder: 'Search email...',
    },
  },
];

function MyPage() {
  const [data, setData] = useState<User[]>([]);

  return (
    <DataTableProvider>
      <DataTable<User>
        columns={columns}
        data={data}
        rowKey="id"
        showSearch
        showRowNumber
        showSelection
        paginationMode="traditional"
        pageSize={10}
      />
    </DataTableProvider>
  );
}
```

## Features

- Sticky columns (left/right)
- Column filtering (search, select, multi-select, date, date range, range, checkbox)
- Server-side pagination, sorting, and filtering (`manualPagination`, `manualSorting`, `manualFiltering`)
- Row selection with select-all
- Expandable rows
- Row numbering
- Loading skeleton
- Empty state with illustration
- Column visibility control

## Peer Dependencies

| Package | Version |
|---------|---------|
| react | >=18 |
| react-dom | >=18 |
| tailwindcss | >=4 |
| lucide-react | >=1 |
| date-fns | >=4 |
| clsx | >=2 |
| tailwind-merge | >=3 |
