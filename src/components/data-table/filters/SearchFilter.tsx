'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFilters } from '../contexts/FilterContext';
import { FilterValue } from '@/lib/data-table/types';

interface SearchFilterProps {
  field: string;
  label: string;
  placeholder?: string;
}

export function SearchFilter({
  field,
  label,
  placeholder = 'Search...',
}: SearchFilterProps) {
  const { filters, addFilter, removeFilter } = useFilters();

  const existingFilter = filters.find(
    (f) => f.field === field && f.type === 'search'
  );

  // Initialize from context so value persists when popover is closed & reopened
  const [value, setValue] = useState<string>(
    existingFilter ? String(existingFilter.value) : ''
  );

  // Sync local state if filter is cleared externally (e.g. "Reset All")
  // Use existingFilter?.value (primitive) not the full object to avoid firing every render
  useEffect(() => {
    if (!existingFilter) {
      setValue('');
    } else {
      setValue(String(existingFilter.value));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingFilter?.value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (newValue.trim()) {
        if (existingFilter) {
          removeFilter(field);
        }
        addFilter({
          field,
          operator: 'contains',
          value: newValue,
          type: 'search',
        });
      } else {
        if (existingFilter) {
          removeFilter(field);
        }
      }
    },
    [field, existingFilter, addFilter, removeFilter]
  );

  const handleClear = useCallback(() => {
    setValue('');
    removeFilter(field);
  }, [field, removeFilter]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className="pr-8"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
