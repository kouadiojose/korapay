'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Send, ArrowUpRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Payout } from '@/types/transaction.types';

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

  const fetchPayouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payouts', { params: { per_page: 20 } });
      const responseData = res.data.data;
      const data = responseData?.data ?? responseData ?? [];
      setPayouts(data);
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
      toast.error('Erreur lors du chargement des décaissements');
      setPayouts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.recipient) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/payouts', {
        amount: parseFloat(form.amount),
        currency: form.currency,
        recipient: form.recipient,
        payment_method: form.payment_method,
        description: form.description,
      });
      setShowModal(false);
      setForm({ amount: '', currency: 'XOF', recipient: '', payment_method: 'orange_money', description: '' });
      toast.success('Décaissement initié avec succès');
      // Refresh list from the API
      fetchPayouts();
    } catch (err) {
      console.error('Failed to create payout:', err);
      toast.error('Erreur lors de la création du décaissement');
    } finally {
      setIsSubmitting(false);
    }
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
                      Aucun paiement disponible
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
