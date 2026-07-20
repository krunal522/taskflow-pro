// ============================================
// HOOKS — usePagination
// ============================================

import { useState, useMemo } from 'react';

interface PaginationConfig {
  total: number;
  pageSize?: number;
  initialPage?: number;
}

interface PaginationResult {
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

function usePagination({ total, pageSize: initSize = 20, initialPage = 1 }: PaginationConfig): PaginationResult {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initSize);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return {
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    goToPage: (p: number) => setPage(Math.min(Math.max(1, p), totalPages)),
    nextPage: () => setPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setPage(p => Math.max(p - 1, 1)),
    setPageSize: (size: number) => { setPageSize(size); setPage(1); },
  };
}

export default usePagination;
