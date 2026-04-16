'use client';

import { useState, useEffect, useCallback } from 'react';
import { Landmark, ArrowDownToLine } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Settlement } from '@/types/transaction.types';

const MOCK_SETTLEMENTS: Settlement[] = [
  {
    id: 'stl_001',
    amount: 2500000,
    currency: 'XOF',
    fee: 25000,
    net_amount: 2475000,
    status: 'settled',
    settlement_date: '2026-04-12T00:00:00Z',
    bank_name: 'Banque Atlantique',
    account_number: '****4521',
    created_at: '2026-04-12T08:00:00Z',
  },
  {
    id: 'stl_002',
    amount: 1800000,
    currency: 'XOF',
    fee: 18000,
    net_amount: 1782000,
    status: 'processing',
    settlement_date: '2026-04-13T00:00:00Z',
    bank_name: 'Banque Atlantique',
    account_number: '****4521',
    created_at: '2026-04-13T08:00:00Z',
  },
  {
    id: 'stl_003',
    amount: 3200000,
    currency: 'XOF',
    fee: 32000,
    net_amount: 3168000,
    status: 'settled',
    settlement_date: '2026-04-10T00:00:00Z',
    bank_name: 'Banque Atlantique',
    account_number: '****4521',
    created_at: '2026-04-10T08:00:00Z',
  },
  {
    id: 'stl_004',
    amount: 950000,
    currency: 'XOF',
    fee: 9500,
    net_amount: 940500,
    status: 'settled',
    settlement_date: '2026-04-08T00:00:00Z',
    bank_name: 'Banque Atlantique',
    account_number: '****4521',
    created_at: '2026-04-08T08:00:00Z',
  },
  {
    id: 'stl_005',
    amount: 4100000,
    currency: 'XOF',
    fee: 41000,
    net_amount: 4059000,
    status: 'settled',
    settlement_date: '2026-04-05T00:00:00Z',
    bank_name: 'Banque Atlantique',
    account_number: '****4521',
    created_at: '2026-04-05T08:00:00Z',
  },
  {
    id: 'stl_006',
    amount: 750000,
    currency: 'XOF',
    fee: 7500,
    net_amount: 742500,
    status: 'pending',
    settlement_date: '2026-04-14T00:00:00Z',
    bank_name: 'Banque Atlantique',
    account_number: '****4521',
    created_at: '2026-04-14T00:00:00Z',
  },
];

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettlements = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/settlements', { params: { per_page: 20 } });
      const responseData = res.data.data;
      const data = responseData?.data ?? responseData ?? [];
      setSettlements(data);
    } catch (err) {
      console.error('Failed to fetch settlements:', err);
      toast.error('Erreur lors du chargement des règlements');
      setSettlements(MOCK_SETTLEMENTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const totalSettled = settlements
    .filter((s) => s.status === 'settled')
    .reduce((sum, s) => sum + s.net_amount, 0);

  const pendingAmount = settlements
    .filter((s) => s.status !== 'settled')
    .reduce((sum, s) => sum + s.net_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Règlements</h1>
        <p className="text-gray-500 mt-1">Suivez vos règlements bancaires</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total réglé</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {isLoading ? '...' : formatCurrency(totalSettled)}
              </p>
            </div>
            <div className="bg-green-50 text-green-500 p-2.5 rounded-xl">
              <Landmark size={22} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">En cours / En attente</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {isLoading ? '...' : formatCurrency(pendingAmount)}
              </p>
            </div>
            <div className="bg-yellow-50 text-yellow-500 p-2.5 rounded-xl">
              <ArrowDownToLine size={22} />
            </div>
          </div>
        </Card>
      </div>

      {/* Settlements Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Historique des règlements</h3>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date de règlement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Frais
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Net
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Banque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(s.settlement_date)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(s.amount, s.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-500">
                        {formatCurrency(s.fee, s.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(s.net_amount, s.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div>
                        <p className="text-sm text-gray-900">{s.bank_name}</p>
                        <p className="text-xs text-gray-500">{s.account_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
