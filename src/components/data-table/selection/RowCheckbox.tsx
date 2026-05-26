'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useSelection } from '../contexts/SelectionContext';

interface RowCheckboxProps {
  rowId: string;
}

export function RowCheckbox({ rowId }: RowCheckboxProps) {
  const { isRowSelected, toggleRow } = useSelection();

  return (
    <Checkbox
      checked={isRowSelected(rowId)}
      onCheckedChange={() => toggleRow(rowId)}
    />
  );
}
