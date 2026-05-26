'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFilters } from '../contexts/FilterContext';

interface RangeFilterProps {
  field: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

export function RangeFilter({
  field,
  label,
  min = 0,
  max = 100,
  step = 1,
}: RangeFilterProps) {
  const { filters, addFilter, removeFilter } = useFilters();

  const existingFilter = filters.find(
    (f) => f.field === field && f.type === 'range'
  );

  const existingRange = existingFilter?.value as [number, number] | undefined;

  const [minValue, setMinValue] = useState<number>(existingRange ? existingRange[0] : min);
  const [maxValue, setMaxValue] = useState<number>(existingRange ? existingRange[1] : max);

  // Use a stable string key to avoid firing on every re-render
  const existingValueKey = existingFilter ? JSON.stringify(existingFilter.value) : null;

  // Sync local state only when the actual filter value changes (not every render)
  useEffect(() => {
    if (!existingFilter) {
      setMinValue(min);
      setMaxValue(max);
    } else if (existingFilter.value) {
      const [eMin, eMax] = existingFilter.value as [number, number];
      setMinValue(eMin);
      setMaxValue(eMax);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingValueKey, min, max]);

  const handleApply = () => {
    removeFilter(field);
    if (minValue < maxValue) {
      addFilter({
        field,
        operator: 'between',
        value: [minValue, maxValue],
        type: 'range',
      });
    }
  };

  const handleClear = () => {
    setMinValue(min);
    setMaxValue(max);
    removeFilter(field);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Min</label>
            <Input
              type="number"
              min={min}
              max={maxValue - step}
              step={step}
              value={minValue}
              onChange={(e) => setMinValue(Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Max</label>
            <Input
              type="number"
              min={minValue + step}
              max={max}
              step={step}
              value={maxValue}
              onChange={(e) => setMaxValue(Number(e.target.value))}
              className="h-8"
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Range: {minValue} - {maxValue}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="default" onClick={handleApply}>
            Apply
          </Button>
          {existingFilter && (
            <Button size="sm" variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
