'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { PaymentMethod } from '@/stores/checkoutStore';

interface MobileMoneyFormProps {
  method: PaymentMethod;
  amount: string;
  currency: string;
  isProcessing: boolean;
  onSubmit: (phone: string) => void;
}

const METHOD_LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  mtn_momo: 'MTN MoMo',
  wave: 'Wave',
  moov_money: 'Moov Money',
};

export default function MobileMoneyForm({
  method,
  amount,
  currency,
  isProcessing,
  onSubmit,
}: MobileMoneyFormProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Le numéro de téléphone est requis');
      return;
    }
    if (phone.replace(/\s/g, '').length < 8) {
      setError('Numéro de téléphone invalide');
      return;
    }
    setError('');
    onSubmit(phone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
          <Phone size={20} className="text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            Paiement par {METHOD_LABELS[method] || method}
          </p>
          <p className="text-xs text-gray-500">
            Vous recevrez une notification sur votre téléphone pour confirmer le paiement
          </p>
        </div>
      </div>

      <Input
        id="phone"
        label="Numéro de téléphone"
        type="tel"
        placeholder="+225 07 01 23 45 67"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          if (error) setError('');
        }}
        error={error}
      />

      <Button type="submit" className="w-full" size="lg" isLoading={isProcessing}>
        Payer {amount} {currency}
      </Button>
    </form>
  );
}
