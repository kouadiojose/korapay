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
          active_wallets: 0,
          volume_trend: 0,
          transaction_trend: 0,
          success_trend: 0,
          wallet_trend: 0,
        });

        const txns = transactionsRes.data.data?.data ?? transactionsRes.data.data ?? [];
        setRecentTransactions(txns);

        // No chart/payment method endpoints yet -- leave empty
        setChartData([]);
        setPaymentMethods([]);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setStats({
          total_volume: 0,
          total_transactions: 0,
          success_rate: 0,
          active_wallets: 0,
          volume_trend: 0,
          transaction_trend: 0,
          success_trend: 0,
          wallet_trend: 0,
        });
        setChartData([]);
        setPaymentMethods([]);
        setRecentTransactions([]);
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
