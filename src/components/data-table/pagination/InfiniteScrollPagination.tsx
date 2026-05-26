'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { usePagination } from '../contexts/PaginationContext';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollPaginationProps {
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export function InfiniteScrollPagination({
  isLoading = false,
  onLoadMore,
}: InfiniteScrollPaginationProps) {
  const { pageIndex, totalData, pageSize, pageCount, nextPage } =
    usePagination();

  const currentItemsLoaded = pageIndex * pageSize;
  const hasMore = currentItemsLoaded < totalData;

  const handleLoadMore = () => {
    nextPage();
    onLoadMore?.();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="text-sm text-muted-foreground">
        Loaded {Math.min(currentItemsLoaded, totalData)} of {totalData} items
      </div>

      {hasMore ? (
        <Button
          onClick={handleLoadMore}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Loading...' : 'Load More'}
        </Button>
      ) : (
        <div className="text-sm text-muted-foreground">
          All items loaded
        </div>
      )}
    </div>
  );
}
