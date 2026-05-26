'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { RowSelectionState, ExpandedRowState } from '@/lib/data-table/types';

interface SelectionContextType {
  rowSelection: RowSelectionState;
  expandedRows: ExpandedRowState;
  toggleRow: (rowId: string) => void;
  toggleAll: (rowIds: string[], selected: boolean) => void;
  selectRows: (rowIds: string[]) => void;
  deselectRows: (rowIds: string[]) => void;
  clearSelection: () => void;
  isRowSelected: (rowId: string) => boolean;
  selectedCount: number;
  toggleExpanded: (rowId: string) => void;
  isRowExpanded: (rowId: string) => boolean;
  expandedCount: number;
  getSelectedRowIds: () => string[];
}

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

export function SelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expandedRows, setExpandedRows] = useState<ExpandedRowState>({});

  const toggleRow = useCallback((rowId: string) => {
    setRowSelection((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  const toggleAll = useCallback((rowIds: string[], selected: boolean) => {
    const newSelection: RowSelectionState = {};
    rowIds.forEach((id) => {
      newSelection[id] = selected;
    });
    setRowSelection(selected ? newSelection : {});
  }, []);

  const selectRows = useCallback((rowIds: string[]) => {
    setRowSelection((prev) => {
      const newSelection = { ...prev };
      rowIds.forEach((id) => {
        newSelection[id] = true;
      });
      return newSelection;
    });
  }, []);

  const deselectRows = useCallback((rowIds: string[]) => {
    setRowSelection((prev) => {
      const newSelection = { ...prev };
      rowIds.forEach((id) => {
        delete newSelection[id];
      });
      return newSelection;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  const isRowSelected = useCallback(
    (rowId: string) => !!rowSelection[rowId],
    [rowSelection]
  );

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const toggleExpanded = useCallback((rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  const isRowExpanded = useCallback(
    (rowId: string) => !!expandedRows[rowId],
    [expandedRows]
  );

  const expandedCount = Object.values(expandedRows).filter(Boolean).length;

  const getSelectedRowIds = useCallback(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection]
  );

  const value: SelectionContextType = {
    rowSelection,
    expandedRows,
    toggleRow,
    toggleAll,
    selectRows,
    deselectRows,
    clearSelection,
    isRowSelected,
    selectedCount,
    toggleExpanded,
    isRowExpanded,
    expandedCount,
    getSelectedRowIds,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextType {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error(
      'useSelection must be used within a SelectionProvider'
    );
  }
  return context;
}
