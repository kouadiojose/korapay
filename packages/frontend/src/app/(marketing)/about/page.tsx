import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Globe, Users, Shield, Zap } from 'lucide-react';

const values = [
  {
    icon: Globe,
    title: 'Accessibilité',
    description: 'Nous rendons les paiements numériques accessibles à tous en Afrique, quel que soit le moyen de paiement préféré.',
  },
  {
    icon: Shield,
    title: 'Sécurité',
    description: 'La sécurité de vos transactions est notre priorité absolue. Chiffrement de bout en bout et conformité aux normes internationales.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Nous innovons constamment pour offrir les meilleures solutions de paiement adaptées au marché africain.',
  },
  {
    icon: Users,
    title: 'Partenariat',
    description: 'Nous construisons des relations durables avec nos marchands et les accompagnons dans leur croissance.',
  },
];

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              A propos de <span className="gradient-text">KoraPay</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              KoraPay est une plateforme de paiement fintech qui simplifie les transactions
              numériques en Afrique. Notre mission est de connecter les entreprises africaines
              au commerce numérique mondial grâce à des solutions de paiement innovantes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
              <p className="text-gray-600 mb-4">
                Chez KoraPay, nous croyons que chaque entreprise africaine mérite un accès
                simple et fiable aux paiements numériques. Notre plateforme unifie Mobile Money,
                cartes bancaires et virements dans une seule API.
              </p>
              <p className="text-gray-600 mb-4">
                Fondée par des experts en technologie financière, KoraPay est née de la volonté
                de résoudre les défis de paiement uniques à l&apos;Afrique : fragmentation des
                opérateurs, complexité des intégrations et besoin de fiabilité.
              </p>
              <p className="text-gray-600">
                Aujourd&apos;hui, nous servons des centaines d&apos;entreprises dans plus de
                10 pays africains, traitant des millions de transactions chaque mois.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-10 text-white">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-4xl font-bold">500+</p>
                  <p className="text-primary-100 mt-1">Marchands actifs</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">10M+</p>
                  <p className="text-primary-100 mt-1">Transactions</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">10+</p>
                  <p className="text-primary-100 mt-1">Pays couverts</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">99.2%</p>
                  <p className="text-primary-100 mt-1">Taux de succès</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nos Valeurs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon size={28} className="text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
