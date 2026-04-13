'use client';

import Link from 'next/link';
import { Key, Webhook, ShieldCheck, Users, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';

const SETTINGS_SECTIONS = [
  {
    title: 'Clés API',
    description: 'Gérez vos clés API pour les environnements test et production',
    href: '/dashboard/settings/api-keys',
    icon: Key,
    color: 'text-primary-500 bg-primary-50',
  },
  {
    title: 'Webhooks',
    description: 'Configurez les notifications en temps réel pour vos événements',
    href: '/dashboard/settings/webhooks',
    icon: Webhook,
    color: 'text-accent-500 bg-accent-50',
  },
  {
    title: 'Vérification KYC',
    description: 'Soumettez vos documents pour activer le mode production',
    href: '/dashboard/settings/kyc',
    icon: ShieldCheck,
    color: 'text-green-500 bg-green-50',
  },
  {
    title: 'Équipe',
    description: 'Gérez les membres de votre équipe et leurs permissions',
    href: '/dashboard/settings/team',
    icon: Users,
    color: 'text-purple-500 bg-purple-50',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Configurez votre compte et vos intégrations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="hover:shadow-md transition-all cursor-pointer group h-full">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${section.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                      <ChevronRight
                        size={18}
                        className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
