'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboard } from '@/hooks/useDashboard';
import StatsCards from '@/components/dashboard/StatsCards';
import TransactionChart from '@/components/dashboard/TransactionChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

const PIE_COLORS = ['#0066FF', '#FF6B00', '#22c55e', '#8b5cf6', '#ec4899'];

function PaymentMethodTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; volume: number; percentage: number } }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
        <p className="text-sm font-medium text-gray-900">{data.label}</p>
        <p className="text-sm text-gray-500">{formatCurrency(data.volume)}</p>
        <p className="text-sm text-gray-500">{data.percentage}%</p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const { stats, chartData, paymentMethods, recentTransactions, isLoading } = useDashboard();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Vue d&apos;ensemble de votre activité</p>
      </div>

      <StatsCards stats={stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TransactionChart data={chartData} isLoading={isLoading} />
        </div>

        <div>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Méthodes de paiement</h3>
            <p className="text-sm text-gray-500 mb-6">Répartition par volume</p>

            {isLoading ? (
              <div className="h-[200px] bg-gray-100 rounded animate-pulse" />
            ) : (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="percentage"
                      >
                        {paymentMethods.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PaymentMethodTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3 mt-4">
                  {paymentMethods.map((pm, i) => (
                    <div key={pm.method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-sm text-gray-600">{pm.label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{pm.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <RecentTransactions transactions={recentTransactions} isLoading={isLoading} />
    </div>
  );
}
