'use client';

import React from 'react';
import { FilterProvider } from './FilterContext';
import { PaginationProvider } from './PaginationContext';
import { SelectionProvider } from './SelectionContext';
import { SortProvider } from './SortContext';
import { ColumnVisibilityProvider } from './ColumnVisibilityContext';
import { ColumnVisibilityState } from '@/lib/data-table/types';

interface DataTableProviderProps {
  children: React.ReactNode;
  defaultColumnVisibility?: ColumnVisibilityState;
}

export function DataTableProvider({
  children,
  defaultColumnVisibility = {},
}: DataTableProviderProps) {
  return (
    <FilterProvider>
      <PaginationProvider>
        <SelectionProvider>
          <SortProvider>
            <ColumnVisibilityProvider defaultVisibility={defaultColumnVisibility}>
              {children}
            </ColumnVisibilityProvider>
          </SortProvider>
        </SelectionProvider>
      </PaginationProvider>
    </FilterProvider>
  );
}
