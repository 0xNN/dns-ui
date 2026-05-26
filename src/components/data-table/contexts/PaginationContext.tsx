'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { PaginationMeta } from '@/lib/data-table/types';

interface PaginationContextType {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalData: number;
  paginationMode: 'traditional' | 'infinite';
  goToPage: (pageIndex: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  updatePaginationMeta: (meta: PaginationMeta) => void;
  setPaginationMode: (mode: 'traditional' | 'infinite') => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const PaginationContext = createContext<PaginationContextType | undefined>(
  undefined
);

export function PaginationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [paginationMode, setPaginationModeState] = useState<'traditional' | 'infinite'>(
    'traditional'
  );

  const goToPage = useCallback((newPageIndex: number) => {
    setPageIndex(Math.max(1, newPageIndex));
  }, []);

  const nextPage = useCallback(() => {
    setPageIndex((prev) => Math.min(prev + 1, pageCount));
  }, [pageCount]);

  const previousPage = useCallback(() => {
    setPageIndex((prev) => Math.max(prev - 1, 1));
  }, []);

  const setPageSizeFn = useCallback((size: number) => {
    setPageSizeState(size);
    setPageIndex(1);
  }, []);

  const updatePaginationMeta = useCallback((meta: PaginationMeta) => {
    setPageIndex(meta.pageIndex);
    setPageSizeState(meta.pageSize);
    setPageCount(meta.pageCount);
    setTotalData(meta.totalData);
  }, []);

  const setPaginationMode = useCallback(
    (mode: 'traditional' | 'infinite') => {
      setPaginationModeState(mode);
    },
    []
  );

  const canGoNext = pageIndex < pageCount;
  const canGoPrevious = pageIndex > 1;

  const value: PaginationContextType = {
    pageIndex,
    pageSize,
    pageCount,
    totalData,
    paginationMode,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: setPageSizeFn,
    updatePaginationMeta,
    setPaginationMode,
    canGoNext,
    canGoPrevious,
  };

  return (
    <PaginationContext.Provider value={value}>
      {children}
    </PaginationContext.Provider>
  );
}

export function usePagination(): PaginationContextType {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error(
      'usePagination must be used within a PaginationProvider'
    );
  }
  return context;
}
