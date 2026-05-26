'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFilters } from '../contexts/FilterContext';
import { FilterOption } from '@/lib/data-table/types';

interface SelectFilterProps {
  field: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

export function SelectFilter({
  field,
  label,
  options,
  placeholder = 'Select option...',
}: SelectFilterProps) {
  const { addFilter, removeFilter, getFieldFilters } = useFilters();

  // Derive value directly from context — no local state needed
  const existingFilter = getFieldFilters(field).find((f) => f.type === 'select');
  const selectedValue = existingFilter ? String(existingFilter.value) : '';

  const handleValueChange = (value: string) => {
    removeFilter(field);
    if (value) {
      addFilter({
        field,
        operator: 'equals',
        value,
        type: 'select',
      });
    }
  };

  const handleClear = () => {
    removeFilter(field);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <Select value={selectedValue} onValueChange={handleValueChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={String(option.value)}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedValue && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
