'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePagination } from '../contexts/PaginationContext';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface TraditionalPaginationProps {
  pageSizeOptions?: number[];
}

export function TraditionalPagination({
  pageSizeOptions = [10, 25, 50, 100],
}: TraditionalPaginationProps) {
  const {
    pageIndex,
    pageSize,
    pageCount,
    totalData,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    canGoNext,
    canGoPrevious,
  } = usePagination();

  const startItem = (pageIndex - 1) * pageSize + 1;
  const endItem = Math.min(pageIndex * pageSize, totalData);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        Showing {totalData} rows
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        {/* Middle controls */}
        <div className="flex items-center justify-center gap-2">
          {/* Page size selector */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">Baris per halaman:</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-20" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Page indicator */}
        <div className="flex items-center gap-1 px-2">
          <span className="text-sm font-medium">Hal {pageIndex}</span>
          <span className="text-muted-foreground">dari</span>
          <span className="text-sm font-medium">{pageCount}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(1)}
          disabled={!canGoPrevious}
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={previousPage}
          disabled={!canGoPrevious}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={!canGoNext}
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(pageCount)}
          disabled={!canGoNext}
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
