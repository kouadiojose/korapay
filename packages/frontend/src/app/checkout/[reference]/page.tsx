'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import MobileMoneyForm from '@/components/checkout/MobileMoneyForm';
import CardForm from '@/components/checkout/CardForm';
import PaymentStatus from '@/components/checkout/PaymentStatus';
import { Shield, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type CheckoutStep = 'select' | 'pay' | 'status';

const mockSession = {
  reference: 'KPY-TXN-DEMO12345',
  merchantName: 'AfriShop',
  amount: 15000,
  currency: 'XOF',
  description: 'Commande #12345 - T-shirt personnalisé',
  customerEmail: 'client@example.com',
};

export default function CheckoutPage() {
  const params = useParams();
  const reference = params.reference as string;

  const [step, setStep] = useState<CheckoutStep>('select');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'processing'>('processing');
  const [session] = useState(mockSession);

  const formattedAmount = formatCurrency(session.amount, session.currency);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setStep('pay');
  };

  const handleMobileMoneySubmit = async (phone: string) => {
    setIsLoading(true);
    setStep('status');
    setPaymentStatus('processing');

    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setPaymentStatus('success');
    }, 3000);
  };

  const handleCardSubmit = async (cardData: { number: string; expiry: string; cvv: string; name: string }) => {
    setIsLoading(true);
    setStep('status');
    setPaymentStatus('processing');

    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      if (cardData.number === '4000000000000002') {
        setPaymentStatus('failed');
      } else {
        setPaymentStatus('success');
      }
    }, 3000);
  };

  const handleRetry = () => {
    setStep('select');
    setSelectedMethod(null);
    setPaymentStatus('processing');
  };

  const isMobileMoney = selectedMethod && selectedMethod !== 'bank_card';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">KoraPay Checkout</h1>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Merchant Info */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Payer à</p>
                <p className="font-semibold text-lg">{session.merchantName}</p>
              </div>
              <div className="text-right">
                <p className="text-primary-100 text-sm">Montant</p>
                <p className="font-bold text-2xl">{formattedAmount}</p>
              </div>
            </div>
            {session.description && (
              <p className="text-primary-100 text-sm mt-2 truncate">{session.description}</p>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'select' && (
              <PaymentMethodSelector
                selected={selectedMethod}
                onSelect={handleMethodSelect}
              />
            )}

            {step === 'pay' && isMobileMoney && (
              <div>
                <button
                  onClick={() => setStep('select')}
                  className="text-sm text-primary-500 hover:text-primary-600 mb-4 flex items-center gap-1"
                >
                  &larr; Changer de moyen de paiement
                </button>
                <MobileMoneyForm
                  method={selectedMethod}
                  onSubmit={handleMobileMoneySubmit}
                  isLoading={isLoading}
                  amount={formattedAmount}
                />
              </div>
            )}

            {step === 'pay' && !isMobileMoney && (
              <div>
                <button
                  onClick={() => setStep('select')}
                  className="text-sm text-primary-500 hover:text-primary-600 mb-4 flex items-center gap-1"
                >
                  &larr; Changer de moyen de paiement
                </button>
                <CardForm
                  onSubmit={handleCardSubmit}
                  isLoading={isLoading}
                  amount={formattedAmount}
                />
              </div>
            )}

            {step === 'status' && (
              <PaymentStatus
                status={paymentStatus}
                amount={formattedAmount}
                reference={reference || session.reference}
                merchantName={session.merchantName}
                onRetry={handleRetry}
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Lock size={12} />
                <span>Paiement sécurisé SSL</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={12} />
                <span>Propulsé par KoraPay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reference */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Réf: {reference || session.reference}
        </p>
      </div>
    </div>
  );
}
