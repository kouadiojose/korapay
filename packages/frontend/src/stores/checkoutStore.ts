import { create } from 'zustand';

export type PaymentMethod = 'orange_money' | 'mtn_momo' | 'wave' | 'moov_money' | 'bank_card';
export type CheckoutStatus = 'idle' | 'selecting' | 'processing' | 'success' | 'failed' | 'expired';

interface CheckoutSession {
  reference: string;
  merchantName: string;
  merchantLogo?: string;
  amount: number;
  currency: string;
  description?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface CheckoutState {
  session: CheckoutSession | null;
  selectedMethod: PaymentMethod | null;
  status: CheckoutStatus;
  error: string | null;
  setSession: (session: CheckoutSession) => void;
  setSelectedMethod: (method: PaymentMethod) => void;
  setStatus: (status: CheckoutStatus) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  session: null,
  selectedMethod: null,
  status: 'idle',
  error: null,

  setSession: (session) => set({ session, status: 'selecting' }),
  setSelectedMethod: (method) => set({ selectedMethod: method }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  reset: () => set({ session: null, selectedMethod: null, status: 'idle', error: null }),
}));
