'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Webhook as WebhookIcon, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Webhook } from '@/types/merchant.types';
import { WEBHOOK_EVENTS } from '@/types/merchant.types';

const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: 'wh_001',
    url: 'https://api.myapp.com/webhooks/korapay',
    events: ['charge.success', 'charge.failed', 'payout.success'],
    status: 'active',
    secret_hash: 'whsec_abc123def456',
    last_triggered_at: '2026-04-13T10:31:00Z',
    failure_count: 0,
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'wh_002',
    url: 'https://hooks.slack.com/services/T00/B00/xxxx',
    events: ['charge.success', 'settlement.completed'],
    status: 'active',
    secret_hash: 'whsec_xyz789ghi012',
    last_triggered_at: '2026-04-12T14:00:00Z',
    failure_count: 2,
    created_at: '2026-02-15T08:00:00Z',
  },
  {
    id: 'wh_003',
    url: 'https://old-api.example.com/callback',
    events: ['charge.success'],
    status: 'inactive',
    secret_hash: 'whsec_old456old789',
    failure_count: 10,
    created_at: '2025-11-01T08:00:00Z',
  },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWebhooks(MOCK_WEBHOOKS);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleCreate = () => {
    if (!newUrl.trim()) {
      toast.error('Veuillez entrer une URL');
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error('Veuillez sélectionner au moins un événement');
      return;
    }
    setIsCreating(true);
    setTimeout(() => {
      const newWebhook: Webhook = {
        id: `wh_${Date.now()}`,
        url: newUrl,
        events: selectedEvents,
        status: 'active',
        secret_hash: `whsec_${Math.random().toString(36).substring(2, 14)}`,
        failure_count: 0,
        created_at: new Date().toISOString(),
      };
      setWebhooks([newWebhook, ...webhooks]);
      setShowModal(false);
      setNewUrl('');
      setSelectedEvents([]);
      setIsCreating(false);
      toast.success('Webhook créé avec succès');
    }, 800);
  };

  const handleDelete = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    toast.success('Webhook supprimé');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-500 mt-1">Configurez les notifications pour vos événements de paiement</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" />
          Ajouter un webhook
        </Button>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-96 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-48" />
            </Card>
          ))
        ) : webhooks.length === 0 ? (
          <Card className="text-center py-12">
            <WebhookIcon size={40} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun webhook configuré</h3>
            <p className="text-gray-500 mb-6">
              Ajoutez un webhook pour recevoir des notifications en temps réel
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={18} className="mr-2" />
              Ajouter un webhook
            </Button>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id} className="hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${webhook.status === 'active' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}>
                    <WebhookIcon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <a
                        href={webhook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-900 hover:text-primary-500 flex items-center gap-1 break-all"
                      >
                        {webhook.url}
                        <ExternalLink size={14} className="flex-shrink-0" />
                      </a>
                      <Badge
                        status={webhook.status === 'active' ? 'success' : 'expired'}
                        label={webhook.status === 'active' ? 'Actif' : 'Inactif'}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          {event}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Créé: {formatDate(webhook.created_at)}</span>
                      {webhook.last_triggered_at && (
                        <span>Dernier appel: {formatDate(webhook.last_triggered_at)}</span>
                      )}
                      {webhook.failure_count > 0 && (
                        <span className="text-red-500 flex items-center gap-1">
                          <XCircle size={12} />
                          {webhook.failure_count} échec(s)
                        </span>
                      )}
                      {webhook.failure_count === 0 && webhook.status === 'active' && (
                        <span className="text-green-500 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Aucun échec
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(webhook.id)}
                >
                  <Trash2 size={14} className="mr-1" />
                  Supprimer
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Webhook Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ajouter un webhook" size="lg">
        <div className="space-y-5">
          <Input
            id="webhook_url"
            label="URL du webhook"
            placeholder="https://api.myapp.com/webhooks/korapay"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            hint="L'URL qui recevra les notifications POST"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Événements
            </label>
            <div className="space-y-2">
              {WEBHOOK_EVENTS.map((event) => (
                <label
                  key={event.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedEvents.includes(event.value)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.value)}
                    onChange={() => toggleEvent(event.value)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.label}</p>
                    <p className="text-xs text-gray-500">{event.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleCreate} isLoading={isCreating}>
              Créer le webhook
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
