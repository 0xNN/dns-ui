'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SortState, SortOrder } from '@/lib/data-table/types';

interface SortContextType {
  sort: SortState;
  setSort: (column: string | null, order?: SortOrder) => void;
  toggleSort: (column: string) => void;
  clearSort: () => void;
  isSorted: (column: string) => boolean;
  getSortOrder: (column: string) => SortOrder;
}

const SortContext = createContext<SortContextType | undefined>(undefined);

export function SortProvider({ children }: { children: React.ReactNode }) {
  const [sort, setSort] = useState<SortState>({
    column: null,
    order: null,
  });

  const setSortFn = useCallback((column: string | null, order: SortOrder = 'asc') => {
    setSort({
      column,
      order: column ? order : null,
    });
  }, []);

  const toggleSort = useCallback((column: string) => {
    setSort((prev) => {
      if (prev.column === column) {
        // Cycle: asc -> desc -> null
        if (prev.order === 'asc') {
          return { column, order: 'desc' };
        } else if (prev.order === 'desc') {
          return { column: null, order: null };
        } else {
          return { column, order: 'asc' };
        }
      } else {
        return { column, order: 'asc' };
      }
    });
  }, []);

  const clearSort = useCallback(() => {
    setSort({ column: null, order: null });
  }, []);

  const isSorted = useCallback(
    (column: string) => sort.column === column && sort.order !== null,
    [sort]
  );

  const getSortOrder = useCallback(
    (column: string) => (sort.column === column ? sort.order : null),
    [sort]
  );

  const value: SortContextType = {
    sort,
    setSort: setSortFn,
    toggleSort,
    clearSort,
    isSorted,
    getSortOrder,
  };

  return (
    <SortContext.Provider value={value}>{children}</SortContext.Provider>
  );
}

export function useSort(): SortContextType {
  const context = useContext(SortContext);
  if (!context) {
    throw new Error('useSort must be used within a SortProvider');
  }
  return context;
}
