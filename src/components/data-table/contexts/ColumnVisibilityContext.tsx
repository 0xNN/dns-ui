'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ColumnVisibilityState } from '@/lib/data-table/types';

interface ColumnVisibilityContextType {
  visibility: ColumnVisibilityState;
  toggleColumn: (columnId: string) => void;
  showColumn: (columnId: string) => void;
  hideColumn: (columnId: string) => void;
  isColumnVisible: (columnId: string) => boolean;
  showAllColumns: () => void;
  hideAllColumns: () => void;
  setVisibility: (visibility: ColumnVisibilityState) => void;
}

const ColumnVisibilityContext = createContext<ColumnVisibilityContextType | undefined>(
  undefined
);

export function ColumnVisibilityProvider({
  children,
  defaultVisibility = {},
}: {
  children: React.ReactNode;
  defaultVisibility?: ColumnVisibilityState;
}) {
  const [visibility, setVisibilityState] = useState<ColumnVisibilityState>(
    defaultVisibility
  );

  const toggleColumn = useCallback((columnId: string) => {
    setVisibilityState((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }, []);

  const showColumn = useCallback((columnId: string) => {
    setVisibilityState((prev) => ({
      ...prev,
      [columnId]: true,
    }));
  }, []);

  const hideColumn = useCallback((columnId: string) => {
    setVisibilityState((prev) => ({
      ...prev,
      [columnId]: false,
    }));
  }, []);

  const isColumnVisible = useCallback(
    (columnId: string) => visibility[columnId] !== false,
    [visibility]
  );

  const showAllColumns = useCallback(() => {
    setVisibilityState((prev) => {
      const newVisibility: ColumnVisibilityState = {};
      Object.keys(prev).forEach((key) => {
        newVisibility[key] = true;
      });
      return newVisibility;
    });
  }, []);

  const hideAllColumns = useCallback(() => {
    setVisibilityState((prev) => {
      const newVisibility: ColumnVisibilityState = {};
      Object.keys(prev).forEach((key) => {
        newVisibility[key] = false;
      });
      return newVisibility;
    });
  }, []);

  const setVisibility = useCallback((newVisibility: ColumnVisibilityState) => {
    setVisibilityState(newVisibility);
  }, []);

  const value: ColumnVisibilityContextType = {
    visibility,
    toggleColumn,
    showColumn,
    hideColumn,
    isColumnVisible,
    showAllColumns,
    hideAllColumns,
    setVisibility,
  };

  return (
    <ColumnVisibilityContext.Provider value={value}>
      {children}
    </ColumnVisibilityContext.Provider>
  );
}

export function useColumnVisibility(): ColumnVisibilityContextType {
  const context = useContext(ColumnVisibilityContext);
  if (!context) {
    throw new Error(
      'useColumnVisibility must be used within a ColumnVisibilityProvider'
    );
  }
  return context;
}
