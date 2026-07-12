import { useState, useCallback, useMemo } from 'react';

export function usePagination({ initialPage = 1, initialLimit = 10, totalItems = 0 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / limit)),
    [totalItems, limit]
  );

  const goToPage = useCallback(
    (newPage) => {
      const p = Math.max(1, Math.min(newPage, totalPages));
      setPage(p);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    totalPages,
    totalItems,
    setPage,
    setLimit: changeLimit,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export default usePagination;
