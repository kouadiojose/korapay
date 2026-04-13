'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CreditCard, Lock } from 'lucide-react';

interface Props {
  onSubmit: (cardData: { number: string; expiry: string; cvv: string; name: string }) => void;
  isLoading: boolean;
  amount: string;
}

export default function CardForm({ onSubmit, isLoading, amount }: Props) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 16);
    return nums.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 4);
    if (nums.length >= 2) {
      return nums.slice(0, 2) + '/' + nums.slice(2);
    }
    return nums;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const rawNumber = cardNumber.replace(/\s/g, '');

    if (rawNumber.length < 15) newErrors.number = 'Numéro de carte invalide';
    if (expiry.length < 5) newErrors.expiry = 'Date invalide';
    if (cvv.length < 3) newErrors.cvv = 'CVV invalide';
    if (!name.trim()) newErrors.name = 'Nom requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({ number: rawNumber, expiry, cvv, name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
          <CreditCard size={20} className="text-primary-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Carte Bancaire</p>
          <p className="text-xs text-gray-500">Visa, Mastercard</p>
        </div>
      </div>

      <Input
        label="Nom sur la carte"
        placeholder="AMADOU DIALLO"
        value={name}
        onChange={(e) => setName(e.target.value.toUpperCase())}
        error={errors.name}
      />

      <Input
        label="Numéro de carte"
        placeholder="4111 1111 1111 1111"
        value={cardNumber}
        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        error={errors.number}
        maxLength={19}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expiration"
          placeholder="MM/AA"
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          error={errors.expiry}
          maxLength={5}
        />
        <Input
          label="CVV"
          type="password"
          placeholder="123"
          value={cvv}
          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
          error={errors.cvv}
          maxLength={4}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock size={14} />
        <span>Paiement sécurisé par chiffrement SSL 256-bit</span>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        Payer {amount}
      </Button>
    </form>
  );
}
