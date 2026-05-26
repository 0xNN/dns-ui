'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useFilters } from '../contexts/FilterContext';

interface CheckboxFilterProps {
  field: string;
  label: string;
}

export function CheckboxFilter({ field, label }: CheckboxFilterProps) {
  const { filters, addFilter, removeFilter } = useFilters();

  const existingFilter = filters.find(
    (f) => f.field === field && f.type === 'checkbox'
  );
  const isChecked = !!existingFilter;

  const handleChange = (checked: boolean) => {
    removeFilter(field);
    if (checked) {
      addFilter({
        field,
        operator: 'equals',
        value: true,
        type: 'checkbox',
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={field}
        checked={isChecked}
        onCheckedChange={(checked) => handleChange(checked as boolean)}
      />
      <label
        htmlFor={field}
        className="text-sm font-medium cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
}
