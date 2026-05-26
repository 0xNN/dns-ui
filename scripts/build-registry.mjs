import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PACKAGE_DIR = path.join(ROOT, 'src', 'components');
const REGISTRY_DIR = path.join(ROOT, 'registry');
const REGISTRY_PREFIX = 'dns-ui';

// All files to include from package/
const PACKAGE_FILES = [
  // Root
  'index.ts',

  // DataTable core
  'data-table/DataTable.tsx',
  'data-table/types.ts',
  'data-table/index.ts',

  // Contexts
  'data-table/contexts/DataTableProvider.tsx',
  'data-table/contexts/ColumnVisibilityContext.tsx',
  'data-table/contexts/FilterContext.tsx',
  'data-table/contexts/PaginationContext.tsx',
  'data-table/contexts/SelectionContext.tsx',
  'data-table/contexts/SortContext.tsx',

  // Filters
  'data-table/filters/CheckboxFilter.tsx',
  'data-table/filters/ColumnHeaderFilter.tsx',
  'data-table/filters/DateFilter.tsx',
  'data-table/filters/DateRangeFilter.tsx',
  'data-table/filters/FilterPanel.tsx',
  'data-table/filters/MultiSelectFilter.tsx',
  'data-table/filters/RangeFilter.tsx',
  'data-table/filters/SearchFilter.tsx',
  'data-table/filters/SelectFilter.tsx',

  // Pagination
  'data-table/pagination/InfiniteScrollPagination.tsx',
  'data-table/pagination/TraditionalPagination.tsx',

  // Selection
  'data-table/selection/ExpandableRow.tsx',
  'data-table/selection/RowCheckbox.tsx',
  'data-table/selection/SelectAllCheckbox.tsx',
  'data-table/selection/SelectionSummary.tsx',

  // Lib
  'lib/utils.ts',
  'lib/data-table/types.ts',
  'lib/data-table/filter-utils.ts',
  'lib/data-table/query-builder.ts',
  'lib/data-table/index.ts',
];

// UI components used by data-table (only what's needed)
const UI_FILES = [
  'ui/badge.tsx',
  'ui/button.tsx',
  'ui/calendar.tsx',
  'ui/card.tsx',
  'ui/checkbox.tsx',
  'ui/input.tsx',
  'ui/label.tsx',
  'ui/popover.tsx',
  'ui/scroll-area.tsx',
  'ui/select.tsx',
  'ui/skeleton.tsx',
  'ui/table.tsx',
];

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
}

function normalizeImports(content, filePath) {
  // Convert relative imports like '../ui/table' to '@/components/dns-ui/ui/table'
  content = content.replace(
    /from ['"]\.\.\/ui\/(.+?)['"]/g,
    `from '@/components/${REGISTRY_PREFIX}/ui/$1'`
  );

  // Convert relative imports like '../lib/utils' to '@/lib/dns-ui/utils'
  content = content.replace(
    /from ['"]\.\.\/lib\/(.+?)['"]/g,
    `from '@/lib/${REGISTRY_PREFIX}/$1'`
  );

  // Convert relative imports like './lib/utils' to '@/lib/dns-ui/utils'
  content = content.replace(
    /from ['"]\.\/lib\/(.+?)['"]/g,
    `from '@/lib/${REGISTRY_PREFIX}/$1'`
  );

  // Convert relative context imports within data-table
  // './contexts/FilterContext' -> '@/components/dns-ui/data-table/contexts/FilterContext'
  // './selection/RowCheckbox' -> '@/components/dns-ui/data-table/selection/RowCheckbox'
  // './filters/...' -> '@/components/dns-ui/data-table/filters/...'
  // './pagination/...' -> '@/components/dns-ui/data-table/pagination/...'
  content = content.replace(
    /from ['"]\.\/(contexts|filters|pagination|selection)\/(.+?)['"]/g,
    `from '@/components/${REGISTRY_PREFIX}/data-table/$1/$2'`
  );

  // Convert './types' -> '@/components/dns-ui/data-table/types'
  content = content.replace(
    /from ['"]\.\/types['"]/g,
    `from '@/components/${REGISTRY_PREFIX}/data-table/types'`
  );

  return content;
}

function buildRegistry() {
  // Ensure registry directory exists
  if (!fs.existsSync(REGISTRY_DIR)) {
    fs.mkdirSync(REGISTRY_DIR, { recursive: true });
  }

  const files = [];

  // Process package files (target: components/data-table/... and components/lib/...)
  for (const relPath of PACKAGE_FILES) {
    const fullPath = path.join(PACKAGE_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`WARN: File not found: ${fullPath}`);
      continue;
    }

    let content = readFile(fullPath);
    content = normalizeImports(content, relPath);

    // Determine target path
    let target;
    if (relPath.startsWith('data-table/')) {
      target = `components/${REGISTRY_PREFIX}/data-table/${relPath.slice('data-table/'.length)}`;
    } else if (relPath.startsWith('lib/')) {
      target = `lib/${REGISTRY_PREFIX}/${relPath.slice('lib/'.length)}`;
    } else if (relPath === 'index.ts') {
      target = `components/${REGISTRY_PREFIX}/data-table/index.ts`;
    } else {
      target = `components/${REGISTRY_PREFIX}/${relPath}`;
    }

    files.push({
      path: relPath,
      target,
      content,
      type: 'registry:ui',
    });
  }

  // Process UI files (target: components/ui/...)
  for (const relPath of UI_FILES) {
    const fullPath = path.join(PACKAGE_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`WARN: UI file not found: ${fullPath}`);
      continue;
    }

    let content = readFile(fullPath);
    content = normalizeImports(content, relPath);

    files.push({
      path: relPath,
      target: `components/${REGISTRY_PREFIX}/${relPath}`,
      content,
      type: 'registry:ui',
    });
  }

  const registry = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: 'dns-ui-data-table',
    type: 'registry:ui',
    title: 'DNS UI DataTable',
    description: 'Advanced data table with sticky columns, filtering, sorting, and pagination',
    dependencies: ['lucide-react', 'date-fns', 'clsx', 'tailwind-merge'],
    registryDependencies: [],
    files,
  };

  const outputPath = path.join(REGISTRY_DIR, 'data-table.json');
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2), 'utf-8');
  console.log(`Registry generated: ${outputPath}`);
  console.log(`Total files: ${files.length}`);
}

buildRegistry();
