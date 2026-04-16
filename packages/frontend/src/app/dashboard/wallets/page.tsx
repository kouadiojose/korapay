'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Wallet as WalletType, WalletTransaction } from '@/types/transaction.types';

export default function WalletsPage() {
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Fetch wallets
  useEffect(() => {
    const fetchWallets = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/wallets');
        const data = res.data.data ?? [];
        setWallets(data);
        if (data.length > 0) {
          setSelectedWallet(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch wallets:', err);
        toast.error('Erreur lors du chargement des portefeuilles');
        setWallets([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWallets();
  }, []);

  // Fetch wallet transactions when selected wallet changes
  const fetchWalletTransactions = useCallback(async (currency: string) => {
    if (!currency) return;
    setIsLoadingTransactions(true);
    try {
      const res = await api.get(`/wallets/${currency}/transactions`, {
        params: { per_page: 20 },
      });
      const responseData = res.data.data;
      const txns = responseData?.data ?? responseData ?? [];
      setWalletTransactions(txns);
    } catch (err) {
      console.error('Failed to fetch wallet transactions:', err);
      toast.error('Erreur lors du chargement des mouvements');
      setWalletTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    const wallet = wallets.find((w) => w.id === selectedWallet);
    if (wallet) {
      fetchWalletTransactions(wallet.currency);
    }
  }, [selectedWallet, wallets, fetchWalletTransactions]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Portefeuilles</h1>
          <p className="text-gray-500 mt-1">Gérez vos soldes par devise</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-16 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-40 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Portefeuilles</h1>
        <p className="text-gray-500 mt-1">Gérez vos soldes par devise</p>
      </div>

      {/* Balance Cards */}
      {wallets.length === 0 ? (
        <Card className="text-center py-12">
          <Wallet size={40} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun portefeuille disponible</h3>
          <p className="text-gray-500">Aucune donnée disponible</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wallets.map((wallet) => (
              <Card
                key={wallet.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedWallet === wallet.id
                    ? 'ring-2 ring-primary-500 border-primary-200'
                    : ''
                }`}
                onClick={() => setSelectedWallet(wallet.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Wallet size={20} className="text-primary-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-500 uppercase">{wallet.currency}</span>
                  </div>
                  <TrendingUp size={18} className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(wallet.balance, wallet.currency)}
                </p>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-gray-500">
                    Disponible: <span className="font-medium text-gray-700">{formatCurrency(wallet.available_balance, wallet.currency)}</span>
                  </span>
                </div>
                {wallet.pending_balance > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                      En attente: {formatCurrency(wallet.pending_balance, wallet.currency)}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Wallet Transactions */}
          <Card className="p-0 overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Historique du portefeuille</h3>
              <p className="text-sm text-gray-500 mt-1">
                Mouvements pour {wallets.find((w) => w.id === selectedWallet)?.currency || ''}
              </p>
            </div>

            {isLoadingTransactions ? (
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
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Référence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Solde après
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {walletTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          Aucun mouvement pour ce portefeuille
                        </td>
                      </tr>
                    ) : (
                      walletTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  t.type === 'credit'
                                    ? 'bg-green-50 text-green-600'
                                    : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {t.type === 'credit' ? (
                                  <ArrowDownLeft size={16} />
                                ) : (
                                  <ArrowUpRight size={16} />
                                )}
                              </div>
                              <span className="text-sm text-gray-900">{t.description}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="text-sm text-gray-500 font-mono">{t.reference}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-sm font-semibold ${
                                t.type === 'credit' ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {t.type === 'credit' ? '+' : '-'}
                              {formatCurrency(t.amount, wallets.find((w) => w.id === selectedWallet)?.currency)}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-sm text-gray-700">
                              {formatCurrency(t.balance_after, wallets.find((w) => w.id === selectedWallet)?.currency)}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <span className="text-sm text-gray-500">{formatDate(t.created_at)}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
