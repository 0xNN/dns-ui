'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSelection } from '../contexts/SelectionContext';
import { X } from 'lucide-react';

interface SelectionSummaryProps {
  onAction?: (selectedIds: string[]) => void;
  actionLabel?: string;
}

export function SelectionSummary({
  onAction,
  actionLabel = 'Action',
}: SelectionSummaryProps) {
  const { selectedCount, getSelectedRowIds, clearSelection } = useSelection();

  if (selectedCount === 0) {
    return null;
  }

  const selectedIds = getSelectedRowIds();

  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <Badge variant="default">{selectedCount} selected</Badge>
      <span className="text-sm text-muted-foreground">
        {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected for action
      </span>
      <div className="flex gap-2 ml-auto">
        {onAction && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onAction(selectedIds)}
          >
            {actionLabel}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={clearSelection}
          className="gap-1"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      </div>
    </div>
  );
}
