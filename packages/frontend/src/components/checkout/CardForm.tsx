'use client';

import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface CardFormProps {
  amount: string;
  currency: string;
  isProcessing: boolean;
  onSubmit: (cardData: { number: string; expiry: string; cvv: string }) => void;
}

export default function CardForm({ amount, currency, isProcessing, onSubmit }: CardFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 16);
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 4);
    if (numbers.length >= 3) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }
    return numbers;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (!cleanNumber || cleanNumber.length < 13) {
      newErrors.number = 'Numéro de carte invalide';
    }
    if (!expiry || expiry.length < 5) {
      newErrors.expiry = 'Date invalide';
    }
    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'CVV invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      number: cardNumber.replace(/\s/g, ''),
      expiry,
      cvv,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
          <CreditCard size={20} className="text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Paiement par Carte Bancaire</p>
          <p className="text-xs text-gray-500">Visa, Mastercard</p>
        </div>
      </div>

      <Input
        id="card_number"
        label="Numéro de carte"
        placeholder="4242 4242 4242 4242"
        value={cardNumber}
        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        error={errors.number}
        maxLength={19}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="expiry"
          label="Date d'expiration"
          placeholder="MM/YY"
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          error={errors.expiry}
          maxLength={5}
        />
        <Input
          id="cvv"
          label="CVV"
          type="password"
          placeholder="123"
          value={cvv}
          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
          error={errors.cvv}
          maxLength={4}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isProcessing}>
        <Lock size={16} className="mr-2" />
        Payer {amount} {currency}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock size={12} />
        <span>Paiement sécurisé par chiffrement SSL 256-bit</span>
      </div>
    </form>
  );
}
