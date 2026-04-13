'use client';

import { cn } from '@/lib/utils';
import { Smartphone, CreditCard } from 'lucide-react';
import type { PaymentMethod } from '@/stores/checkoutStore';

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'orange_money',
    label: 'Orange Money',
    icon: <Smartphone size={20} />,
    description: 'Payez avec votre compte Orange Money',
    color: 'border-orange-500 bg-orange-50 text-orange-700',
  },
  {
    id: 'mtn_momo',
    label: 'MTN MoMo',
    icon: <Smartphone size={20} />,
    description: 'Payez avec MTN Mobile Money',
    color: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  },
  {
    id: 'wave',
    label: 'Wave',
    icon: <Smartphone size={20} />,
    description: 'Payez avec votre compte Wave',
    color: 'border-blue-500 bg-blue-50 text-blue-700',
  },
  {
    id: 'moov_money',
    label: 'Moov Money',
    icon: <Smartphone size={20} />,
    description: 'Payez avec Moov Money',
    color: 'border-cyan-500 bg-cyan-50 text-cyan-700',
  },
  {
    id: 'bank_card',
    label: 'Carte Bancaire',
    icon: <CreditCard size={20} />,
    description: 'Visa, Mastercard',
    color: 'border-primary-500 bg-primary-50 text-primary-700',
  },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Méthode de paiement
      </h3>
      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
              selected === method.id
                ? method.color
                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                selected === method.id ? 'bg-white/60' : 'bg-gray-100'
              )}
            >
              {method.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium">{method.label}</p>
              <p className="text-xs opacity-70">{method.description}</p>
            </div>
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                selected === method.id ? 'border-current' : 'border-gray-300'
              )}
            >
              {selected === method.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-current" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
