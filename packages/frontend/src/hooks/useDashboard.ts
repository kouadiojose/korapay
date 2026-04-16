'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type {
  DashboardStats,
  ChartDataPoint,
  PaymentMethodBreakdown,
  Transaction,
} from '@/types/transaction.types';

const MOCK_STATS: DashboardStats = {
  total_volume: 12450000,
  total_transactions: 1284,
  success_rate: 94.7,
  active_wallets: 3,
  volume_trend: 12.5,
  transaction_trend: 8.3,
  success_trend: 1.2,
  wallet_trend: 0,
};

const MOCK_CHART_DATA: ChartDataPoint[] = [
  { date: '07 Apr', volume: 1200000, count: 145 },
  { date: '08 Apr', volume: 1450000, count: 167 },
  { date: '09 Apr', volume: 980000, count: 123 },
  { date: '10 Apr', volume: 1680000, count: 198 },
  { date: '11 Apr', volume: 2100000, count: 234 },
  { date: '12 Apr', volume: 1750000, count: 201 },
  { date: '13 Apr', volume: 1920000, count: 216 },
];

const MOCK_PAYMENT_METHODS: PaymentMethodBreakdown[] = [
  { method: 'orange_money', label: 'Orange Money', count: 456, volume: 4500000, percentage: 35.5 },
  { method: 'mtn_momo', label: 'MTN MoMo', count: 321, volume: 3200000, percentage: 25.0 },
  { method: 'wave', label: 'Wave', count: 267, volume: 2100000, percentage: 20.8 },
  { method: 'moov_money', label: 'Moov Money', count: 128, volume: 1350000, percentage: 10.0 },
  { method: 'bank_card', label: 'Carte Bancaire', count: 112, volume: 1300000, percentage: 8.7 },
];

const MOCK_RECENT_TRANSACTIONS: Transaction[] = [
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
    customer_name: 'Amadou Koné',
    customer_email: 'amadou@email.com',
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
    customer_name: 'Fatou Diallo',
    customer_email: 'fatou@email.com',
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
    customer_name: 'Ibrahim Touré',
    customer_email: 'ibrahim@email.com',
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
    customer_name: 'Moussa Traoré',
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
    customer_name: 'Alice Bamba',
    customer_email: 'alice@email.com',
    created_at: '2026-04-12T14:30:00Z',
    updated_at: '2026-04-12T14:31:00Z',
  },
];

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodBreakdown[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, transactionsRes] = await Promise.all([
          api.get('/transactions/stats'),
          api.get('/transactions', { params: { per_page: 10 } }),
        ]);

        const statsData = statsRes.data.data;
        setStats({
          total_volume: statsData.total_volume ?? statsData.successful_volume ?? 0,
          total_transactions: statsData.total_count ?? 0,
          success_rate: statsData.success_rate ?? 0,
          active_wallets: MOCK_STATS.active_wallets,
          volume_trend: MOCK_STATS.volume_trend,
          transaction_trend: MOCK_STATS.transaction_trend,
          success_trend: MOCK_STATS.success_trend,
          wallet_trend: MOCK_STATS.wallet_trend,
        });

        const txns = transactionsRes.data.data?.data ?? transactionsRes.data.data ?? [];
        setRecentTransactions(txns);

        // No chart/payment method endpoints yet -- use mock data as fallback
        setChartData(MOCK_CHART_DATA);
        setPaymentMethods(MOCK_PAYMENT_METHODS);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        toast.error('Erreur lors du chargement du tableau de bord');
        // Graceful degradation: fall back to mock data
        setStats(MOCK_STATS);
        setChartData(MOCK_CHART_DATA);
        setPaymentMethods(MOCK_PAYMENT_METHODS);
        setRecentTransactions(MOCK_RECENT_TRANSACTIONS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    stats,
    chartData,
    paymentMethods,
    recentTransactions,
    isLoading,
  };
}
