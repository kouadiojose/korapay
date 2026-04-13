'use client';

import { useRouter } from 'next/navigation';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '@/lib/utils';
import type { Transaction } from '@/types/transaction.types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded mb-3" />
        ))}
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transactions récentes</h3>
          <p className="text-sm text-gray-500 mt-1">10 dernières transactions</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/transactions')}
          className="text-sm font-medium text-primary-500 hover:text-primary-600"
        >
          Voir tout
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-gray-100 bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Méthode
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((txn) => (
              <tr
                key={txn.id}
                onClick={() => router.push(`/dashboard/transactions/${txn.id}`)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        txn.type === 'collection'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-orange-50 text-orange-600'
                      }`}
                    >
                      {txn.type === 'collection' ? (
                        <ArrowDownLeft size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {txn.customer_name || txn.reference}
                      </p>
                      <p className="text-xs text-gray-500">{txn.reference}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-sm text-gray-600">
                    {getPaymentMethodLabel(txn.payment_method)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(txn.amount, txn.currency)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge status={txn.status} />
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-gray-500">{formatDate(txn.created_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
