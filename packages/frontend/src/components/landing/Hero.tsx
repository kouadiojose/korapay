'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-40 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Zap size={16} className="mr-2" />
              Paiements simplifiés pour l&apos;Afrique
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Acceptez les{' '}
              <span className="gradient-text">paiements</span>{' '}
              en toute simplicité
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              KoraPay vous permet d&apos;intégrer facilement les paiements Mobile Money
              (Orange, MTN, Wave, Moov) et Carte Bancaire dans vos applications.
              Où que vous soyez en Afrique.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Créer un compte gratuit
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Voir la documentation
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Shield size={20} className="text-green-500" />
                <span className="text-sm text-gray-600">Sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap size={20} className="text-yellow-500" />
                <span className="text-sm text-gray-600">Rapide</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe size={20} className="text-blue-500" />
                <span className="text-sm text-gray-600">Pan-Africain</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Tableau de bord</h3>
                <span className="text-sm text-green-500 font-medium">+24.5%</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Volume du jour</p>
                  <p className="text-2xl font-bold text-gray-900">2.4M</p>
                  <p className="text-xs text-primary-600">FCFA</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-xs text-green-600">+12% aujourd&apos;hui</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { method: 'Orange Money', amount: '15,000 FCFA', status: 'success', time: 'Il y a 2 min' },
                  { method: 'MTN MoMo', amount: '25,000 FCFA', status: 'success', time: 'Il y a 5 min' },
                  { method: 'Wave', amount: '8,500 FCFA', status: 'processing', time: 'Il y a 8 min' },
                  { method: 'Carte Visa', amount: '120,000 FCFA', status: 'success', time: 'Il y a 12 min' },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.method}</p>
                      <p className="text-xs text-gray-400">{tx.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{tx.amount}</p>
                      <span className={`text-xs font-medium ${tx.status === 'success' ? 'text-green-500' : 'text-blue-500'}`}>
                        {tx.status === 'success' ? 'Succès' : 'En cours'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">99%</span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500">Taux de succès</p>
              <p className="text-lg font-bold text-green-500">99.2%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
