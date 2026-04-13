'use client';

import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Props {
  status: 'success' | 'failed' | 'processing';
  amount: string;
  reference: string;
  merchantName: string;
  onRetry?: () => void;
}

export default function PaymentStatus({ status, amount, reference, merchantName, onRetry }: Props) {
  const config = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      title: 'Paiement réussi !',
      description: `Votre paiement de ${amount} a été effectué avec succès.`,
    },
    failed: {
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      title: 'Paiement échoué',
      description: 'Le paiement n\'a pas pu être traité. Veuillez réessayer.',
    },
    processing: {
      icon: Clock,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      title: 'Paiement en cours...',
      description: 'Votre paiement est en cours de traitement. Veuillez patienter.',
    },
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <div className="text-center space-y-6">
      <div className={`w-20 h-20 ${current.bgColor} rounded-full flex items-center justify-center mx-auto`}>
        <Icon size={40} className={current.iconColor} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{current.title}</h2>
        <p className="text-gray-600">{current.description}</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Marchand</span>
          <span className="font-medium text-gray-900">{merchantName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Montant</span>
          <span className="font-medium text-gray-900">{amount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Référence</span>
          <span className="font-mono text-gray-900 text-xs">{reference}</span>
        </div>
      </div>

      {status === 'failed' && onRetry && (
        <Button onClick={onRetry} className="w-full">
          <ArrowLeft size={16} className="mr-2" />
          Réessayer
        </Button>
      )}

      {status === 'processing' && (
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Vérification en cours...
        </div>
      )}

      {status === 'success' && (
        <p className="text-sm text-gray-500">
          Vous pouvez fermer cette page en toute sécurité.
        </p>
      )}
    </div>
  );
}
