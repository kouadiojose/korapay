'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCheckoutStore } from '@/stores/checkoutStore';
import type { PaymentMethod } from '@/stores/checkoutStore';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import MobileMoneyForm from '@/components/checkout/MobileMoneyForm';
import CardForm from '@/components/checkout/CardForm';
import PaymentStatus from '@/components/checkout/PaymentStatus';

const MOCK_SESSION = {
  reference: 'KP-CHK-2026-001',
  merchantName: 'TechShop CI',
  merchantLogo: undefined,
  amount: 25000,
  currency: 'XOF',
  description: 'Commande #1234 - TechShop CI',
  customerEmail: 'client@email.com',
  customerPhone: '',
};

export default function CheckoutPage() {
  const params = useParams();
  const {
    session,
    selectedMethod,
    status,
    error,
    setSession,
    setSelectedMethod,
    setStatus,
    setError,
    reset,
  } = useCheckoutStore();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load mock checkout session
    setSession({
      ...MOCK_SESSION,
      reference: (params.reference as string) || MOCK_SESSION.reference,
    });

    return () => reset();
  }, [params.reference, setSession, reset]);

  const handleMobileMoneySubmit = (phone: string) => {
    setIsProcessing(true);
    setStatus('processing');

    // Simulate payment processing
    setTimeout(() => {
      // Simulate success (80% chance) or failure (20% chance)
      const isSuccess = Math.random() > 0.2;
      if (isSuccess) {
        setStatus('success');
      } else {
        setStatus('failed');
        setError('Le paiement a été refusé par l\'opérateur. Veuillez réessayer.');
      }
      setIsProcessing(false);
    }, 3000);
  };

  const handleCardSubmit = (cardData: { number: string; expiry: string; cvv: string }) => {
    setIsProcessing(true);
    setStatus('processing');

    setTimeout(() => {
      const isSuccess = Math.random() > 0.2;
      if (isSuccess) {
        setStatus('success');
      } else {
        setStatus('failed');
        setError('Transaction refusée. Veuillez vérifier vos informations de carte.');
      }
      setIsProcessing(false);
    }, 3000);
  };

  const handleRetry = () => {
    setStatus('selecting');
    setError(null);
    setSelectedMethod(null as unknown as PaymentMethod);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement du paiement...</p>
        </div>
      </div>
    );
  }

  const formattedAmount = formatCurrency(session.amount, session.currency);

  const isMobileMoney = selectedMethod && selectedMethod !== 'bank_card';
  const isCard = selectedMethod === 'bank_card';
  const showResult = status === 'processing' || status === 'success' || status === 'failed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {session.merchantName?.charAt(0) || 'K'}
                </span>
              </div>
              <div>
                <p className="font-semibold">{session.merchantName}</p>
                {session.description && (
                  <p className="text-sm text-white/70">{session.description}</p>
                )}
              </div>
            </div>
            <div className="text-3xl font-bold">{formattedAmount}</div>
          </div>

          {/* Body */}
          <div className="p-6">
            {showResult ? (
              <PaymentStatus
                status={status}
                amount={formattedAmount}
                currency={session.currency}
                reference={session.reference}
                error={error}
                onRetry={handleRetry}
              />
            ) : (
              <div className="space-y-6">
                <PaymentMethodSelector
                  selected={selectedMethod}
                  onSelect={setSelectedMethod}
                />

                {isMobileMoney && (
                  <div className="border-t border-gray-100 pt-6">
                    <MobileMoneyForm
                      method={selectedMethod}
                      amount={formattedAmount}
                      currency={session.currency}
                      isProcessing={isProcessing}
                      onSubmit={handleMobileMoneySubmit}
                    />
                  </div>
                )}

                {isCard && (
                  <div className="border-t border-gray-100 pt-6">
                    <CardForm
                      amount={formattedAmount}
                      currency={session.currency}
                      isProcessing={isProcessing}
                      onSubmit={handleCardSubmit}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Shield size={14} />
                  <span>PCI DSS</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock size={14} />
                  <span>SSL 256-bit</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Propulsé par</span>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 bg-primary-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-[10px]">K</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">KoraPay</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          En effectuant ce paiement, vous acceptez les conditions générales de {session.merchantName}.
        </p>
      </div>
    </div>
  );
}
