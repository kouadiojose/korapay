'use client';

import { useState, useEffect, useCallback } from 'react';
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
  {
    id: 'txn_006',
    reference: 'KP-TXN-2026-006',
    type: 'collection',
    amount: 35000,
    currency: 'XOF',
    fee: 525,
    net_amount: 34475,
    payment_method: 'moov_money',
    status: 'success',
    provider: 'moov_ci',
    customer_email: 'jean@email.com',
    customer_phone: '+2250601234567',
    customer_name: 'Jean Kouassi',
    description: 'Recharge compte',
    created_at: '2026-04-12T11:20:00Z',
    updated_at: '2026-04-12T11:21:00Z',
  },
  {
    id: 'txn_007',
    reference: 'KP-TXN-2026-007',
    type: 'collection',
    amount: 120000,
    currency: 'XOF',
    fee: 1800,
    net_amount: 118200,
    payment_method: 'orange_money',
    status: 'success',
    provider: 'orange_ci',
    customer_email: 'marie@email.com',
    customer_phone: '+2250701234569',
    customer_name: 'Marie Coulibaly',
    description: 'Facture #9012',
    created_at: '2026-04-11T15:45:00Z',
    updated_at: '2026-04-11T15:46:00Z',
  },
  {
    id: 'txn_008',
    reference: 'KP-TXN-2026-008',
    type: 'payout',
    amount: 200000,
    currency: 'XOF',
    fee: 3000,
    net_amount: 197000,
    payment_method: 'mtn_momo',
    status: 'processing',
    provider: 'mtn_ci',
    customer_phone: '+2250501234568',
    customer_name: 'Paul Yao',
    description: 'Paiement fournisseur',
    created_at: '2026-04-11T10:00:00Z',
    updated_at: '2026-04-11T10:00:00Z',
  },
  {
    id: 'txn_009',
    reference: 'KP-TXN-2026-009',
    type: 'collection',
    amount: 8500,
    currency: 'XOF',
    fee: 128,
    net_amount: 8372,
    payment_method: 'wave',
    status: 'success',
    provider: 'wave_ci',
    customer_email: 'awa@email.com',
    customer_phone: '+2250101234568',
    customer_name: 'Awa Sanogo',
    description: 'Micro-paiement',
    created_at: '2026-04-10T09:30:00Z',
    updated_at: '2026-04-10T09:31:00Z',
  },
  {
    id: 'txn_010',
    reference: 'KP-TXN-2026-010',
    type: 'collection',
    amount: 450000,
    currency: 'XOF',
    fee: 6750,
    net_amount: 443250,
    payment_method: 'bank_card',
    status: 'success',
    provider: 'stripe',
    customer_email: 'pierre@enterprise.com',
    customer_name: 'Pierre Dubois',
    description: 'Licence annuelle',
    created_at: '2026-04-10T08:00:00Z',
    updated_at: '2026-04-10T08:02:00Z',
  },
  {
    id: 'txn_011',
    reference: 'KP-TXN-2026-011',
    type: 'collection',
    amount: 18000,
    currency: 'XOF',
    fee: 270,
    net_amount: 17730,
    payment_method: 'orange_money',
    status: 'reversed',
    provider: 'orange_ci',
    customer_email: 'kofi@email.com',
    customer_phone: '+2250701234570',
    customer_name: 'Kofi Mensah',
    description: 'Commande annulée #3456',
    created_at: '2026-04-09T14:00:00Z',
    updated_at: '2026-04-09T16:00:00Z',
  },
  {
    id: 'txn_012',
    reference: 'KP-TXN-2026-012',
    type: 'collection',
    amount: 62000,
    currency: 'XOF',
    fee: 930,
    net_amount: 61070,
    payment_method: 'mtn_momo',
    status: 'success',
    provider: 'mtn_ci',
    customer_email: 'salif@email.com',
    customer_phone: '+2250501234569',
    customer_name: 'Salif Keita',
    description: 'Service consulting',
    created_at: '2026-04-09T11:30:00Z',
    updated_at: '2026-04-09T11:31:00Z',
  },
];

export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(() => {
    setIsLoading(true);

    // Simulate API call with mock data
    setTimeout(() => {
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
      setIsLoading(false);
    }, 500);
  }, [filters?.status, filters?.payment_method, filters?.type, filters?.search, filters?.page, filters?.per_page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getTransaction = useCallback((id: string): Transaction | undefined => {
    return MOCK_TRANSACTIONS.find((t) => t.id === id);
  }, []);

  return {
    transactions,
    total,
    isLoading,
    refetch: fetchTransactions,
    getTransaction,
  };
}
