'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const TIMELINE_EVENTS = [
  { status: 'created', label: 'Transaction créée', icon: Clock, color: 'text-gray-400 bg-gray-100' },
  { status: 'processing', label: 'En cours de traitement', icon: AlertCircle, color: 'text-blue-500 bg-blue-100' },
  { status: 'success', label: 'Paiement réussi', icon: CheckCircle2, color: 'text-green-500 bg-green-100' },
  { status: 'failed', label: 'Paiement échoué', icon: XCircle, color: 'text-red-500 bg-red-100' },
];

interface Transaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  payment_method: string;
  amount: number;
  currency: string;
  fee: number;
  net_amount: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  provider_reference?: string;
  narration?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransaction() {
      try {
        const { data } = await api.get(`/transactions/${params.id}`);
        setTxn(data.data);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Transaction introuvable';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }
    if (params.id) fetchTransaction();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          </div>
          <div className="h-60 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !txn) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction introuvable</h2>
        <p className="text-gray-500 mb-6">{error || 'Cette transaction n\'existe pas.'}</p>
        <Button variant="secondary" onClick={() => router.push('/dashboard/transactions')}>
          <ArrowLeft size={18} className="mr-2" />
          Retour aux transactions
        </Button>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  };

  const getTimelineForStatus = () => {
    const statusMap: Record<string, number> = {
      pending: 1,
      processing: 2,
      success: 3,
      failed: 3,
      reversed: 3,
    };
    const step = statusMap[txn.status] || 1;
    return TIMELINE_EVENTS.slice(0, step).map((event, i) => {
      if (i === step - 1 && txn.status === 'failed') {
        return { ...TIMELINE_EVENTS[3] };
      }
      return event;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/transactions')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Transactions</span>
        </button>
        <div className="flex-1" />
        <Badge status={txn.status} className="text-sm px-3 py-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start gap-4 mb-6">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  txn.type === 'collection'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-orange-50 text-orange-600'
                }`}
              >
                {txn.type === 'collection' ? (
                  <ArrowDownLeft size={24} />
                ) : (
                  <ArrowUpRight size={24} />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {formatCurrency(Number(txn.amount), txn.currency)}
                </h2>
                <p className="text-sm text-gray-500 capitalize">
                  {txn.type === 'collection' ? 'Encaissement' : txn.type === 'transfer' ? 'Transfert' : 'Décaissement'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Référence</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{txn.reference}</p>
                  <button onClick={() => copyToClipboard(txn.reference)} className="text-gray-400 hover:text-gray-600">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Méthode de paiement</p>
                <p className="text-sm font-medium text-gray-900">{getPaymentMethodLabel(txn.payment_method)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Montant</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(Number(txn.amount), txn.currency)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Frais</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(Number(txn.fee), txn.currency)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Montant net</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(Number(txn.net_amount), txn.currency)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(txn.created_at)}</p>
              </div>
              {txn.narration && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-700">{txn.narration}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations client</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {txn.customer_name && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Nom</p>
                  <p className="text-sm font-medium text-gray-900">{txn.customer_name}</p>
                </div>
              )}
              {txn.customer_email && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900">{txn.customer_email}</p>
                </div>
              )}
              {txn.customer_phone && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Téléphone</p>
                  <p className="text-sm font-medium text-gray-900">{txn.customer_phone}</p>
                </div>
              )}
              {!txn.customer_name && !txn.customer_email && !txn.customer_phone && (
                <p className="text-sm text-gray-400 col-span-2">Aucune information client disponible</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations fournisseur</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Fournisseur</p>
                <p className="text-sm font-medium text-gray-900">{getPaymentMethodLabel(txn.payment_method)}</p>
              </div>
              {txn.provider_reference && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Référence fournisseur</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{txn.provider_reference}</p>
                    <button onClick={() => copyToClipboard(txn.provider_reference!)} className="text-gray-400 hover:text-gray-600">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Historique</h3>
            <div className="space-y-6">
              {getTimelineForStatus().map((event, i) => {
                const Icon = event.icon;
                const timeline = getTimelineForStatus();
                return (
                  <div key={i} className="flex gap-4">
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${event.color}`}>
                        <Icon size={18} />
                      </div>
                      {i < timeline.length - 1 && (
                        <div className="absolute top-9 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {i === 0 ? formatDate(txn.created_at) : formatDate(txn.completed_at || txn.updated_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
