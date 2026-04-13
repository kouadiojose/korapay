'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-bold text-white">KoraPay</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              La plateforme de paiement qui simplifie les transactions en Afrique.
              Mobile Money, Carte Bancaire, tout en un.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Produits</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs" className="hover:text-white transition-colors">API de Paiement</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Mobile Money</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Carte Bancaire</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Transferts</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">A propos</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Carrières</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Guide d&apos;intégration</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Assistance</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} KoraPay. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/docs" className="text-sm text-gray-500 hover:text-white transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/docs" className="text-sm text-gray-500 hover:text-white transition-colors">
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
