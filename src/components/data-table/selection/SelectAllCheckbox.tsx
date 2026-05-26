'use client';

import React, { useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useSelection } from '../contexts/SelectionContext';

interface SelectAllCheckboxProps {
  rowIds: string[];
}

export function SelectAllCheckbox({ rowIds }: SelectAllCheckboxProps) {
  const { rowSelection, toggleAll } = useSelection();

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const isAllSelected = rowIds.length > 0 && selectedCount === rowIds.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < rowIds.length;

  const handleChange = () => {
    if (isAllSelected) {
      toggleAll(rowIds, false);
    } else {
      toggleAll(rowIds, true);
    }
  };

  return (
    <Checkbox
      checked={isAllSelected}
      ref={(element) => {
        if (element && isIndeterminate) {
          element.indeterminate = true;
        }
      }}
      onCheckedChange={handleChange}
    />
  );
}
