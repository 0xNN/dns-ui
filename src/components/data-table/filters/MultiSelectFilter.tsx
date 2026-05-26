'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useFilters } from '../contexts/FilterContext';
import { FilterOption } from '@/lib/data-table/types';
import { ChevronDown } from 'lucide-react';

interface MultiSelectFilterProps {
  field: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

export function MultiSelectFilter({
  field,
  label,
  options,
  placeholder = 'Select options...',
}: MultiSelectFilterProps) {
  const { filters, addFilter, removeFilter } = useFilters();
  const [isOpen, setIsOpen] = useState(false);

  const existingFilter = filters.find(
    (f) => f.field === field && f.type === 'multiSelect'
  );

  const [selectedValues, setSelectedValues] = useState<string[]>(
    existingFilter ? (existingFilter.value as string[]) : []
  );

  // Sync local state when filter is cleared externally
  // Use a stable string key so this doesn't fire on every render
  const existingValueKey = existingFilter ? JSON.stringify(existingFilter.value) : null;
  useEffect(() => {
    if (!existingFilter) {
      setSelectedValues([]);
    } else {
      setSelectedValues(existingFilter.value as string[]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingValueKey]);

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(String(value))
      ? selectedValues.filter((v) => v !== String(value))
      : [...selectedValues, String(value)];

    setSelectedValues(newValues);
    removeFilter(field);

    if (newValues.length > 0) {
      addFilter({
        field,
        operator: 'in',
        value: newValues,
        type: 'multiSelect',
      });
    }
  };

  const handleClear = () => {
    setSelectedValues([]);
    removeFilter(field);
  };

  const getSelectedLabels = () => {
    return options
      .filter((opt) => selectedValues.includes(String(opt.value)))
      .map((opt) => opt.label);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">
            {selectedValues.length > 0
              ? `${selectedValues.length} selected`
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 border border-input rounded-md bg-background shadow-md z-50">
            <div className="p-2 space-y-2 max-h-48 overflow-y-auto">
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field}-${option.value}`}
                    checked={selectedValues.includes(String(option.value))}
                    onCheckedChange={() => handleToggle(String(option.value))}
                  />
                  <label
                    htmlFor={`${field}-${option.value}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {getSelectedLabels().map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
