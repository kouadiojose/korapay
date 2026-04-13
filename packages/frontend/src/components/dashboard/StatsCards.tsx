'use client';

import { DollarSign, ArrowLeftRight, TrendingUp, Wallet } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types/transaction.types';

interface StatsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Volume total',
      value: stats ? formatCurrency(stats.total_volume) : '-',
      trend: stats?.volume_trend || 0,
      icon: <DollarSign size={22} />,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Transactions',
      value: stats ? stats.total_transactions.toLocaleString('fr-FR') : '-',
      trend: stats?.transaction_trend || 0,
      icon: <ArrowLeftRight size={22} />,
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
    {
      title: 'Taux de succès',
      value: stats ? `${stats.success_rate}%` : '-',
      trend: stats?.success_trend || 0,
      icon: <TrendingUp size={22} />,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Portefeuilles actifs',
      value: stats ? stats.active_wallets.toString() : '-',
      trend: stats?.wallet_trend || 0,
      icon: <Wallet size={22} />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
            <div className={`${card.bgColor} ${card.color} p-2.5 rounded-xl`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {card.trend !== 0 && (
              <>
                <span
                  className={`text-sm font-medium ${
                    card.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {card.trend > 0 ? '+' : ''}
                  {card.trend}%
                </span>
                <span className="text-xs text-gray-400">vs dernier mois</span>
              </>
            )}
            {card.trend === 0 && (
              <span className="text-xs text-gray-400">Pas de changement</span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
