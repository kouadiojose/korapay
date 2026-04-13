'use client';

import { useState, useEffect } from 'react';
import { Plus, Send, ArrowUpRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Payout } from '@/types/transaction.types';

const MOCK_PAYOUTS: Payout[] = [
  {
    id: 'po_001',
    reference: 'KP-PAY-2026-001',
    amount: 100000,
    currency: 'XOF',
    fee: 1500,
    net_amount: 98500,
    payment_method: 'orange_money',
    recipient_phone: '+2250701234568',
    recipient_name: 'Moussa Traoré',
    status: 'success',
    description: 'Remboursement commande',
    created_at: '2026-04-12T16:00:00Z',
  },
  {
    id: 'po_002',
    reference: 'KP-PAY-2026-002',
    amount: 200000,
    currency: 'XOF',
    fee: 3000,
    net_amount: 197000,
    payment_method: 'mtn_momo',
    recipient_phone: '+2250501234568',
    recipient_name: 'Paul Yao',
    status: 'processing',
    description: 'Paiement fournisseur',
    created_at: '2026-04-11T10:00:00Z',
  },
  {
    id: 'po_003',
    reference: 'KP-PAY-2026-003',
    amount: 50000,
    currency: 'XOF',
    fee: 750,
    net_amount: 49250,
    payment_method: 'wave',
    recipient_phone: '+2250101234567',
    recipient_name: 'Aminata Sow',
    status: 'success',
    description: 'Salaire freelance',
    created_at: '2026-04-10T14:30:00Z',
  },
  {
    id: 'po_004',
    reference: 'KP-PAY-2026-004',
    amount: 75000,
    currency: 'XOF',
    fee: 1125,
    net_amount: 73875,
    payment_method: 'orange_money',
    recipient_phone: '+2250701234570',
    recipient_name: 'Seydou Diarra',
    status: 'failed',
    description: 'Remboursement client',
    created_at: '2026-04-09T09:00:00Z',
  },
  {
    id: 'po_005',
    reference: 'KP-PAY-2026-005',
    amount: 300000,
    currency: 'XOF',
    fee: 4500,
    net_amount: 295500,
    payment_method: 'mtn_momo',
    recipient_phone: '+2250501234570',
    recipient_name: 'Compagnie XYZ',
    status: 'success',
    description: 'Paiement partenaire',
    created_at: '2026-04-08T11:00:00Z',
  },
];

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    currency: 'XOF',
    recipient: '',
    payment_method: 'orange_money',
    description: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPayouts(MOCK_PAYOUTS);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.recipient) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const newPayout: Payout = {
        id: `po_${Date.now()}`,
        reference: `KP-PAY-${Date.now()}`,
        amount: parseFloat(form.amount),
        currency: form.currency,
        fee: parseFloat(form.amount) * 0.015,
        net_amount: parseFloat(form.amount) * 0.985,
        payment_method: form.payment_method,
        recipient_phone: form.recipient,
        recipient_name: 'Nouveau Bénéficiaire',
        status: 'processing',
        description: form.description,
        created_at: new Date().toISOString(),
      };
      setPayouts([newPayout, ...payouts]);
      setShowModal(false);
      setForm({ amount: '', currency: 'XOF', recipient: '', payment_method: 'orange_money', description: '' });
      setIsSubmitting(false);
      toast.success('Décaissement initié avec succès');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Décaissements</h1>
          <p className="text-gray-500 mt-1">Envoyez des paiements à vos bénéficiaires</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" />
          Nouveau décaissement
        </Button>
      </div>

      {/* Payouts Table */}
      <Card className="p-0 overflow-hidden">
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
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bénéficiaire
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
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Aucun décaissement effectué
                    </td>
                  </tr>
                ) : (
                  payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                            <ArrowUpRight size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payout.recipient_name}
                            </p>
                            <p className="text-xs text-gray-500">{payout.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">
                          {getPaymentMethodLabel(payout.payment_method)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payout.amount, payout.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={payout.status} />
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-500">{formatDate(payout.created_at)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* New Payout Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouveau décaissement" size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="amount"
              label="Montant"
              type="number"
              placeholder="10000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <div className="w-full">
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Devise
              </label>
              <select
                id="currency"
                className="input-field w-full"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                <option value="XOF">XOF (FCFA)</option>
                <option value="XAF">XAF (FCFA)</option>
                <option value="NGN">NGN (Naira)</option>
                <option value="GHS">GHS (Cedi)</option>
              </select>
            </div>
          </div>

          <Input
            id="recipient"
            label="Téléphone / Compte du bénéficiaire"
            placeholder="+225 07 01 23 45 67"
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
          />

          <div className="w-full">
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
              Méthode de paiement
            </label>
            <select
              id="payment_method"
              className="input-field w-full"
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            >
              <option value="orange_money">Orange Money</option>
              <option value="mtn_momo">MTN MoMo</option>
              <option value="wave">Wave</option>
              <option value="moov_money">Moov Money</option>
            </select>
          </div>

          <Input
            id="description"
            label="Description (optionnel)"
            placeholder="Motif du paiement"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {form.amount && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Montant</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(parseFloat(form.amount) || 0, form.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Frais (1.5%)</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency((parseFloat(form.amount) || 0) * 0.015, form.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-medium text-gray-700">Total débité</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency((parseFloat(form.amount) || 0) * 1.015, form.currency)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              <Send size={18} className="mr-2" />
              Envoyer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
