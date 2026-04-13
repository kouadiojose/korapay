'use client';

import { Smartphone, CreditCard, CheckCircle } from 'lucide-react';

const providers = [
  {
    name: 'Orange Money',
    countries: 'CI, SN, ML, BF, CM',
    color: 'from-orange-400 to-orange-600',
    icon: '🟠',
  },
  {
    name: 'MTN MoMo',
    countries: 'CI, CM, GH, BJ, CG',
    color: 'from-yellow-400 to-yellow-600',
    icon: '🟡',
  },
  {
    name: 'Wave',
    countries: 'SN, CI, ML, BF',
    color: 'from-blue-400 to-blue-600',
    icon: '🔵',
  },
  {
    name: 'Moov Money',
    countries: 'CI, BJ, TG, NE',
    color: 'from-blue-500 to-indigo-600',
    icon: '🔷',
  },
  {
    name: 'Visa / Mastercard',
    countries: 'International',
    color: 'from-gray-700 to-gray-900',
    icon: '💳',
  },
];

export default function PaymentMethods() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tous les moyens de paiement{' '}
            <span className="gradient-text">en une seule API</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Intégrez Mobile Money et Carte Bancaire avec une seule intégration.
            Nous gérons la complexité pour vous.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {providers.map((provider, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-2xl`}>
                  {provider.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-500">{provider.countries}</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  Collecte de paiements
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  Transferts sortants
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  Webhooks en temps réel
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center space-x-2">
              <Smartphone size={20} className="text-primary-500" />
              <CreditCard size={20} className="text-primary-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Exemple d&apos;intégration rapide</h3>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-gray-300">
              <code>{`// Initialiser un paiement avec KoraPay
const response = await fetch('https://api.korapay.com/api/v1/charges/initialize', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_votre_cle_secrete',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 5000,
    currency: 'XOF',
    payment_method: 'orange_money',
    customer: {
      name: 'Amadou Diallo',
      phone: '+22507XXXXXXXX',
      email: 'amadou@example.com',
    },
    reference: 'ORDER-12345',
    callback_url: 'https://votre-site.com/webhook',
  }),
});

const { data } = await response.json();
// Rediriger vers: data.payment_link`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
