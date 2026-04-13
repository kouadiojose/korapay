'use client';

import { CreditCard, Smartphone, ArrowLeftRight, Shield, BarChart3, Code, Globe, Headphones } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Mobile Money',
    description: 'Acceptez les paiements via Orange Money, MTN MoMo, Wave et Moov Money dans toute l\'Afrique.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: CreditCard,
    title: 'Carte Bancaire',
    description: 'Intégrez les paiements Visa et Mastercard avec authentification 3D Secure.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: ArrowLeftRight,
    title: 'Transferts',
    description: 'Envoyez de l\'argent vers n\'importe quel compte Mobile Money ou bancaire en temps réel.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Shield,
    title: 'Sécurité',
    description: 'Chiffrement AES-256, conformité PCI DSS et authentification à deux facteurs.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Tableau de bord en temps réel avec des rapports détaillés sur vos transactions.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Code,
    title: 'API REST',
    description: 'API simple et bien documentée. Intégrez KoraPay en quelques lignes de code.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Globe,
    title: 'Multi-pays',
    description: 'Opérez dans plus de 10 pays africains avec une seule intégration.',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    icon: Headphones,
    title: 'Support 24/7',
    description: 'Une équipe dédiée pour vous accompagner à chaque étape de votre croissance.',
    color: 'bg-amber-100 text-amber-600',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont vous avez besoin pour{' '}
            <span className="gradient-text">accepter les paiements</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une plateforme complète qui simplifie la collecte, les transferts et les paiements
            dans toute l&apos;Afrique.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
