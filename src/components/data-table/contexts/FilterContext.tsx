'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FilterValue, FilterType } from '@/lib/data-table/types';
import { removeFilter, clearFieldFilters, hasActiveFilters } from '@/lib/data-table/filter-utils';

interface FilterContextType {
  filters: FilterValue[];
  addFilter: (filter: FilterValue) => void;
  updateFilter: (fieldId: string, newFilter: Partial<FilterValue>) => void;
  removeFilter: (fieldId: string, value?: any) => void;
  clearFilters: () => void;
  clearFieldFilters: (fields: string[]) => void;
  hasActiveFilters: boolean;
  getFieldFilters: (field: string) => FilterValue[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterValue[]>([]);

  const addFilter = useCallback((filter: FilterValue) => {
    setFilters((prev) => [...prev, filter]);
  }, []);

  const updateFilter = useCallback(
    (fieldId: string, newFilter: Partial<FilterValue>) => {
      setFilters((prev) =>
        prev.map((f) =>
          f.field === fieldId ? { ...f, ...newFilter } : f
        )
      );
    },
    []
  );

  const removeFilterFn = useCallback((fieldId: string, value?: any) => {
    setFilters((prev) => removeFilter(prev, fieldId, value));
  }, []);

  const clearFiltersFn = useCallback(() => {
    setFilters([]);
  }, []);

  const clearFieldFiltersFn = useCallback((fields: string[]) => {
    setFilters((prev) => clearFieldFilters(prev, fields));
  }, []);

  const getFieldFilters = useCallback(
    (field: string) => filters.filter((f) => f.field === field),
    [filters]
  );

  const value: FilterContextType = {
    filters,
    addFilter,
    updateFilter,
    removeFilter: removeFilterFn,
    clearFilters: clearFiltersFn,
    clearFieldFilters: clearFieldFiltersFn,
    hasActiveFilters: hasActiveFilters(filters),
    getFieldFilters,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters(): FilterContextType {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
