import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'KoraPay - Paiements en ligne simplifiés pour l\'Afrique',
  description: 'Plateforme de paiement fintech permettant de gérer les paiements en ligne via Mobile Money (Orange, MTN, Wave, Moov) et Carte Bancaire.',
  keywords: 'paiement, mobile money, orange money, mtn, wave, moov, carte bancaire, afrique, fintech',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
