import { useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface UseApiOptions {
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const { successMessage, errorMessage, showToast = true } = options;

  const execute = useCallback(async (request: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await request();
      const result = response.data;
      if (result.success !== undefined) {
        setData(result.data);
        if (result.pagination) setPagination(result.pagination);
        if (showToast && successMessage) toast.success(successMessage);
        return result;
      }
      setData(result);
      return result;
    } catch (err: any) {
      const msg = err.response?.data?.message || errorMessage || 'Something went wrong';
      setError(msg);
      if (showToast) toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [successMessage, errorMessage, showToast]);

  const get = useCallback((url: string, params?: any) => execute(() => api.get(url, { params })), [execute]);
  const post = useCallback((url: string, data?: any) => execute(() => api.post(url, data)), [execute]);
  const put = useCallback((url: string, data?: any) => execute(() => api.put(url, data)), [execute]);
  const del = useCallback((url: string) => execute(() => api.delete(url)), [execute]);

  return { data, loading, error, pagination, execute, get, post, put, del, setData };
}

export function usePaginatedApi<T = any>(url: string, initialParams?: any) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [params, setParams] = useState(initialParams || {});

  const fetch = useCallback(async (page = 1, extraParams?: any) => {
    setLoading(true);
    try {
      const response = await api.get(url, { params: { ...params, ...extraParams, page, limit: 10 } });
      if (response.data.success) {
        setData(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [url, params]);

  const updateParams = useCallback((newParams: any) => {
    setParams(newParams);
    fetch(1, newParams);
  }, [fetch]);

  return { data, loading, pagination, fetch, setParams: updateParams, params };
}
