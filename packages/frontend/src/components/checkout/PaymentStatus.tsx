'use client';

import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { CheckoutStatus } from '@/stores/checkoutStore';

interface PaymentStatusProps {
  status: CheckoutStatus;
  amount?: string;
  currency?: string;
  reference?: string;
  error?: string | null;
  onRetry?: () => void;
}

export default function PaymentStatus({
  status,
  amount,
  currency,
  reference,
  error,
  onRetry,
}: PaymentStatusProps) {
  if (status === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 size={40} className="text-primary-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Traitement en cours</h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          Veuillez confirmer le paiement sur votre téléphone. Ne fermez pas cette page.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi!</h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-6">
          Votre paiement de <span className="font-semibold text-gray-900">{amount} {currency}</span> a été effectué avec succès.
        </p>
        {reference && (
          <div className="bg-gray-50 rounded-lg p-3 inline-block">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Référence</p>
            <p className="text-sm font-mono font-medium text-gray-700 mt-1">{reference}</p>
          </div>
        )}
        <p className="text-sm text-gray-400 mt-8">
          Vous pouvez fermer cette page en toute sécurité.
        </p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement échoué</h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-6">
          {error || 'Le paiement n\'a pas pu être traité. Veuillez réessayer.'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} size="lg">
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  return null;
}
