'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    description: 'Pour les petites entreprises et les entrepreneurs',
    price: '1.5%',
    priceLabel: 'par transaction',
    features: [
      'Mobile Money (Orange, MTN, Wave, Moov)',
      'Carte Bancaire (Visa, Mastercard)',
      'Dashboard marchand',
      'Webhooks en temps réel',
      'API REST complète',
      'Support par email',
      'Mode sandbox illimité',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    name: 'Business',
    description: 'Pour les entreprises en croissance',
    price: '1.2%',
    priceLabel: 'par transaction',
    features: [
      'Tout du plan Starter',
      'Transferts et Payouts',
      'Payouts en masse',
      'Analytics avancés',
      'Support prioritaire 24/7',
      'Manager de compte dédié',
      'IP Whitelisting',
      'Règlement T+1',
    ],
    cta: 'Choisir Business',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Pour les grandes entreprises',
    price: 'Sur mesure',
    priceLabel: 'contactez-nous',
    features: [
      'Tout du plan Business',
      'Tarifs personnalisés',
      'SLA garanti 99.99%',
      'Intégration dédiée',
      'Infrastructure isolée',
      'Audit de sécurité',
      'Formation sur site',
      'Règlement T+0',
    ],
    cta: 'Contacter les ventes',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Des tarifs{' '}
            <span className="gradient-text">transparents</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pas de frais cachés. Payez uniquement pour ce que vous utilisez.
            Commencez gratuitement en mode sandbox.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-primary-500 text-white shadow-2xl scale-105 border-2 border-primary-400'
                  : 'bg-white border-2 border-gray-100 hover:border-primary-200'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Plus populaire
                </div>
              )}

              <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.popular ? 'text-primary-100' : 'text-gray-500'}`}>
                {plan.description}
              </p>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ml-2 ${plan.popular ? 'text-primary-100' : 'text-gray-500'}`}>
                  {plan.priceLabel}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle
                      size={18}
                      className={`mr-2 mt-0.5 flex-shrink-0 ${
                        plan.popular ? 'text-primary-200' : 'text-green-500'
                      }`}
                    />
                    <span className={`text-sm ${plan.popular ? 'text-primary-50' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button
                  variant={plan.popular ? 'secondary' : 'primary'}
                  className={`w-full ${plan.popular ? 'bg-white text-primary-500 hover:bg-primary-50 border-0' : ''}`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
