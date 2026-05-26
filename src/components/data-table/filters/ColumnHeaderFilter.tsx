'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { ColumnFilter } from '@/lib/data-table/types';
import { useFilters } from '../contexts/FilterContext';
import { SearchFilter } from './SearchFilter';
import { DateFilter } from './DateFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { SelectFilter } from './SelectFilter';
import { MultiSelectFilter } from './MultiSelectFilter';
import { CheckboxFilter } from './CheckboxFilter';
import { RangeFilter } from './RangeFilter';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ColumnHeaderFilterProps {
  filterConfig: ColumnFilter;
}

export function ColumnHeaderFilter({ filterConfig }: ColumnHeaderFilterProps) {
  const { getFieldFilters } = useFilters();
  const isActive = getFieldFilters(filterConfig.id).length > 0;

  const renderFilterContent = () => {
    switch (filterConfig.type) {
      case 'search':
        return (
          <SearchFilter
            field={filterConfig.id}
            label={filterConfig.label}
            placeholder={filterConfig.placeholder}
          />
        );
      case 'date':
        return (
          <DateFilter
            field={filterConfig.id}
            label={filterConfig.label}
          />
        );
      case 'dateRange':
        return (
          <DateRangeFilter
            field={filterConfig.id}
            label={filterConfig.label}
          />
        );
      case 'select':
        return (
          <SelectFilter
            field={filterConfig.id}
            label={filterConfig.label}
            options={filterConfig.options ?? []}
            placeholder={filterConfig.placeholder}
          />
        );
      case 'multiSelect':
        return (
          <MultiSelectFilter
            field={filterConfig.id}
            label={filterConfig.label}
            options={filterConfig.options ?? []}
            placeholder={filterConfig.placeholder}
          />
        );
      case 'checkbox':
        return (
          <CheckboxFilter
            field={filterConfig.id}
            label={filterConfig.label}
          />
        );
      case 'range':
        return (
          <RangeFilter
            field={filterConfig.id}
            label={filterConfig.label}
            min={filterConfig.minValue}
            max={filterConfig.maxValue}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()} // prevent sort trigger
          className={cn(
            'flex items-center justify-center h-5 w-5 rounded transition-colors',
            isActive
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          title={`Filter ${filterConfig.label}`}
        >
          <Filter className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-3 z-[100]"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        {renderFilterContent()}
      </PopoverContent>
    </Popover>
  );
}
