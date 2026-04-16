'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Transaction, TransactionFilters } from '@/types/transaction.types';

export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (filters?.page) params.page = filters.page;
      if (filters?.per_page) params.per_page = filters.per_page;
      if (filters?.status) params.status = filters.status;
      if (filters?.type) params.type = filters.type;
      if (filters?.payment_method) params.payment_method = filters.payment_method;
      if (filters?.date_from) params.from = filters.date_from;
      if (filters?.date_to) params.to = filters.date_to;
      if (filters?.search) params.search = filters.search;

      const res = await api.get('/transactions', { params });
      const responseData = res.data.data;

      const txns = responseData?.data ?? responseData ?? [];
      const pagination = responseData?.pagination;

      setTransactions(txns);
      setTotal(pagination?.total ?? txns.length);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      toast.error('Erreur lors du chargement des transactions');
      setTransactions([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status, filters?.payment_method, filters?.type, filters?.search, filters?.page, filters?.per_page, filters?.date_from, filters?.date_to]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getTransaction = useCallback(async (reference: string): Promise<Transaction | undefined> => {
    try {
      const res = await api.get(`/transactions/${reference}`);
      return res.data.data;
    } catch (err) {
      console.error('Failed to fetch transaction:', err);
      return undefined;
    }
  }, []);

  return {
    transactions,
    total,
    isLoading,
    refetch: fetchTransactions,
    getTransaction,
  };
}
