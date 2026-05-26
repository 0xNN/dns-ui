'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFilters } from '../contexts/FilterContext';
import { ColumnFilter } from '@/lib/data-table/types';
import { SearchFilter } from './SearchFilter';
import { DateFilter } from './DateFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { SelectFilter } from './SelectFilter';
import { MultiSelectFilter } from './MultiSelectFilter';
import { CheckboxFilter } from './CheckboxFilter';
import { RangeFilter } from './RangeFilter';
import { X } from 'lucide-react';

interface FilterPanelProps {
  columns: ColumnFilter[];
  onClose?: () => void;
}

export function FilterPanel({ columns, onClose }: FilterPanelProps) {
  const { filters, clearFilters, hasActiveFilters } = useFilters();

  const renderFilter = (column: ColumnFilter) => {
    switch (column.type) {
      case 'search':
        return (
          <SearchFilter
            key={column.id}
            field={column.id}
            label={column.label}
            placeholder={column.placeholder}
          />
        );

      case 'date':
        return (
          <DateFilter
            key={column.id}
            field={column.id}
            label={column.label}
          />
        );

      case 'dateRange':
        return (
          <DateRangeFilter
            key={column.id}
            field={column.id}
            label={column.label}
          />
        );

      case 'select':
        return (
          <SelectFilter
            key={column.id}
            field={column.id}
            label={column.label}
            options={column.options || []}
            placeholder={column.placeholder}
          />
        );

      case 'multiSelect':
        return (
          <MultiSelectFilter
            key={column.id}
            field={column.id}
            label={column.label}
            options={column.options || []}
            placeholder={column.placeholder}
          />
        );

      case 'checkbox':
        return (
          <CheckboxFilter
            key={column.id}
            field={column.id}
            label={column.label}
          />
        );

      case 'range':
        return (
          <RangeFilter
            key={column.id}
            field={column.id}
            label={column.label}
            min={column.minValue}
            max={column.maxValue}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {columns.map((column) => renderFilter(column))}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex flex-wrap gap-1">
            {filters.slice(0, 3).map((filter, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {filter.field}
              </Badge>
            ))}
            {filters.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{filters.length - 3} more
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-7"
          >
            Reset All
          </Button>
        </div>
      )}
    </Card>
  );
}
