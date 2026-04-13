import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BookOpen, Code, Webhook, CreditCard, Smartphone, ArrowLeftRight, Key, Shield } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    icon: BookOpen,
    title: 'Guide de démarrage',
    description: 'Apprenez à intégrer KoraPay en quelques minutes. Configuration, authentification et premier paiement.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Key,
    title: 'Authentification',
    description: 'Gérez vos clés API, authentifiez vos requêtes et sécurisez votre intégration.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money',
    description: 'Intégrez Orange Money, MTN MoMo, Wave et Moov Money pour collecter des paiements.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: CreditCard,
    title: 'Carte Bancaire',
    description: 'Acceptez les paiements par carte Visa et Mastercard avec 3D Secure.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: ArrowLeftRight,
    title: 'Transferts & Payouts',
    description: 'Envoyez de l\'argent vers des comptes Mobile Money ou bancaires.',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Recevez des notifications en temps réel sur l\'état de vos transactions.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Code,
    title: 'Référence API',
    description: 'Documentation complète de tous les endpoints, paramètres et réponses.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Shield,
    title: 'Sécurité',
    description: 'Bonnes pratiques de sécurité, gestion des clés et conformité.',
    color: 'bg-red-100 text-red-600',
  },
];

export default function DocsPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              <span className="gradient-text">Documentation</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour intégrer KoraPay dans vos applications.
              API simple, exemples de code et guides détaillés.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 mb-16">
            <h3 className="text-white font-semibold mb-4">Installation rapide</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Base URL de l&apos;API :</p>
                <code className="text-green-400 text-sm bg-gray-800 px-4 py-2 rounded-lg block">
                  https://api.korapay.com/api/v1
                </code>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Authentification :</p>
                <code className="text-green-400 text-sm bg-gray-800 px-4 py-2 rounded-lg block">
                  Authorization: Bearer sk_live_votre_cle_secrete
                </code>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections.map((section, index) => (
              <Link
                key={index}
                href="/docs"
                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <section.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{section.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-16 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Exemple: Initialiser un paiement</h2>
              <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`// POST /api/v1/charges/initialize
// Headers: Authorization: Bearer sk_test_votre_cle

// Request Body
{
  "amount": 5000,
  "currency": "XOF",
  "payment_method": "orange_money",
  "customer": {
    "name": "Amadou Diallo",
    "email": "amadou@example.com",
    "phone": "+22507XXXXXXXX"
  },
  "reference": "ORDER-12345",
  "callback_url": "https://votre-site.com/webhook"
}

// Response (200 OK)
{
  "status": true,
  "message": "Payment initialized successfully",
  "data": {
    "reference": "KPY-TXN-ABC12345",
    "payment_link": "https://pay.korapay.com/checkout/KPY-TXN-ABC12345",
    "status": "pending",
    "amount": 5000,
    "currency": "XOF"
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
