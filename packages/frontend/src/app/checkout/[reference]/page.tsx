'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCheckoutStore } from '@/stores/checkoutStore';
import type { PaymentMethod } from '@/stores/checkoutStore';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import MobileMoneyForm from '@/components/checkout/MobileMoneyForm';
import CardForm from '@/components/checkout/CardForm';
import PaymentStatus from '@/components/checkout/PaymentStatus';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch checkout session from API
  useEffect(() => {
    const reference = params.reference as string;

    const fetchSession = async () => {
      try {
        const res = await api.get(`/checkout/${reference}`);
        const data = res.data.data;
        setSession({
          reference: data.reference || reference,
          merchantName: data.merchant_name || 'Merchant',
          merchantLogo: data.merchant_logo,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          customerEmail: data.customer_email,
          customerPhone: data.customer_phone,
        });
      } catch (err) {
        console.error('Failed to fetch checkout session:', err);
        setLoadError('Session de paiement introuvable');
      }
    };

    fetchSession();

    return () => {
      reset();
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [params.reference, setSession, reset]);

  // Poll payment status
  const pollStatus = useCallback((reference: string) => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    let pollCount = 0;
    const maxPolls = 30; // Max ~60 seconds of polling

    pollingRef.current = setInterval(async () => {
      pollCount++;

      try {
        const res = await api.get(`/checkout/${reference}/status`);
        const data = res.data.data;
        const paymentStatus = data.status;

        if (paymentStatus === 'success' || paymentStatus === 'successful') {
          setStatus('success');
          setIsProcessing(false);
          if (pollingRef.current) clearInterval(pollingRef.current);
        } else if (paymentStatus === 'failed') {
          setStatus('failed');
          setError(data.message || 'Le paiement a échoué. Veuillez réessayer.');
          setIsProcessing(false);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
        // Otherwise keep polling for 'pending' / 'processing'
      } catch (err) {
        console.error('Failed to poll payment status:', err);
      }

      if (pollCount >= maxPolls) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setStatus('failed');
        setError('Le délai de paiement a expiré. Veuillez réessayer.');
        setIsProcessing(false);
      }
    }, 2000);
  }, [setStatus, setError]);

  const handleMobileMoneySubmit = async (phone: string) => {
    setIsProcessing(true);
    setStatus('processing');

    const reference = (params.reference as string) || session?.reference;
    if (!reference) return;

    try {
      await api.post(`/checkout/${reference}/pay`, {
        payment_method: selectedMethod,
        phone,
      });
      // Start polling for status
      pollStatus(reference);
    } catch (err: unknown) {
      console.error('Failed to process mobile money payment:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Le paiement a échoué. Veuillez réessayer.';
      setStatus('failed');
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleCardSubmit = async (cardData: { number: string; expiry: string; cvv: string }) => {
    setIsProcessing(true);
    setStatus('processing');

    const reference = (params.reference as string) || session?.reference;
    if (!reference) return;

    try {
      await api.post(`/checkout/${reference}/pay`, {
        payment_method: 'bank_card',
        card: cardData,
      });
      // Start polling for status
      pollStatus(reference);
    } catch (err: unknown) {
      console.error('Failed to process card payment:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Transaction refusée. Veuillez vérifier vos informations de carte.';
      setStatus('failed');
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setStatus('selecting');
    setError(null);
    setSelectedMethod(null as unknown as PaymentMethod);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {loadError ? (
            <div className="space-y-4">
              <AlertTriangle size={48} className="text-red-400 mx-auto" />
              <p className="text-lg font-semibold text-gray-900">{loadError}</p>
              <p className="text-sm text-gray-500">Veuillez vérifier le lien de paiement et réessayer.</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Chargement du paiement...</p>
            </>
          )}
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
