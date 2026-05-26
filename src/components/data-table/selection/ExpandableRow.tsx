'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useSelection } from '../contexts/SelectionContext';

interface ExpandableRowProps {
  rowId: string;
}

export function ExpandableRow({ rowId }: ExpandableRowProps) {
  const { toggleExpanded, isRowExpanded } = useSelection();
  const isExpanded = isRowExpanded(rowId);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleExpanded(rowId)}
      className="h-6 w-6 p-0"
    >
      <ChevronDown
        className={`h-4 w-4 transition-transform ${
          isExpanded ? 'rotate-180' : ''
        }`}
      />
    </Button>
  );
}
