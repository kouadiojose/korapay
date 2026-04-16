'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Transaction, TransactionFilters } from '@/types/transaction.types';

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_001',
    reference: 'KP-TXN-2026-001',
    type: 'collection',
    amount: 25000,
    currency: 'XOF',
    fee: 375,
    net_amount: 24625,
    payment_method: 'orange_money',
    status: 'success',
    provider: 'orange_ci',
    provider_reference: 'ORG-REF-001',
    customer_email: 'amadou@email.com',
    customer_phone: '+2250701234567',
    customer_name: 'Amadou Koné',
    description: 'Achat en ligne #1234',
    created_at: '2026-04-13T10:30:00Z',
    updated_at: '2026-04-13T10:31:00Z',
  },
  {
    id: 'txn_002',
    reference: 'KP-TXN-2026-002',
    type: 'collection',
    amount: 50000,
    currency: 'XOF',
    fee: 750,
    net_amount: 49250,
    payment_method: 'mtn_momo',
    status: 'success',
    provider: 'mtn_ci',
    customer_email: 'fatou@email.com',
    customer_phone: '+2250501234567',
    customer_name: 'Fatou Diallo',
    description: 'Abonnement mensuel',
    created_at: '2026-04-13T09:15:00Z',
    updated_at: '2026-04-13T09:16:00Z',
  },
  {
    id: 'txn_003',
    reference: 'KP-TXN-2026-003',
    type: 'collection',
    amount: 15000,
    currency: 'XOF',
    fee: 225,
    net_amount: 14775,
    payment_method: 'wave',
    status: 'pending',
    provider: 'wave_ci',
    customer_email: 'ibrahim@email.com',
    customer_phone: '+2250101234567',
    customer_name: 'Ibrahim Touré',
    description: 'Commande #5678',
    created_at: '2026-04-13T08:45:00Z',
    updated_at: '2026-04-13T08:45:00Z',
  },
  {
    id: 'txn_004',
    reference: 'KP-TXN-2026-004',
    type: 'payout',
    amount: 100000,
    currency: 'XOF',
    fee: 1500,
    net_amount: 98500,
    payment_method: 'orange_money',
    status: 'success',
    provider: 'orange_ci',
    customer_phone: '+2250701234568',
    customer_name: 'Moussa Traoré',
    description: 'Remboursement commande',
    created_at: '2026-04-12T16:00:00Z',
    updated_at: '2026-04-12T16:02:00Z',
  },
  {
    id: 'txn_005',
    reference: 'KP-TXN-2026-005',
    type: 'collection',
    amount: 75000,
    currency: 'XOF',
    fee: 1125,
    net_amount: 73875,
    payment_method: 'bank_card',
    status: 'failed',
    provider: 'stripe',
    customer_email: 'alice@email.com',
    customer_name: 'Alice Bamba',
    description: 'Achat premium',
    created_at: '2026-04-12T14:30:00Z',
    updated_at: '2026-04-12T14:31:00Z',
  },
];

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
      // Graceful degradation: fall back to mock data with client-side filtering
      let filtered = [...MOCK_TRANSACTIONS];

      if (filters?.status) {
        filtered = filtered.filter((t) => t.status === filters.status);
      }
      if (filters?.payment_method) {
        filtered = filtered.filter((t) => t.payment_method === filters.payment_method);
      }
      if (filters?.type) {
        filtered = filtered.filter((t) => t.type === filters.type);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.reference.toLowerCase().includes(search) ||
            t.customer_name?.toLowerCase().includes(search) ||
            t.customer_email?.toLowerCase().includes(search)
        );
      }

      const page = filters?.page || 1;
      const perPage = filters?.per_page || 10;
      const start = (page - 1) * perPage;
      const end = start + perPage;

      setTotal(filtered.length);
      setTransactions(filtered.slice(start, end));
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
