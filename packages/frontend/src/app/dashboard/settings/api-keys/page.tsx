'use client';

import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Copy, Trash2, AlertTriangle, Key } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { ApiKey } from '@/types/merchant.types';

const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'key_001',
    label: 'Test Key - Development',
    environment: 'test',
    public_key: 'pk_test_kp_abc123def456',
    secret_key_hint: 'sk_test_****ef56',
    status: 'active',
    last_used_at: '2026-04-13T10:30:00Z',
    created_at: '2026-01-15T08:00:00Z',
  },
  {
    id: 'key_002',
    label: 'Live Key - Production',
    environment: 'live',
    public_key: 'pk_live_kp_xyz789ghi012',
    secret_key_hint: 'sk_live_****i012',
    status: 'active',
    last_used_at: '2026-04-12T14:00:00Z',
    created_at: '2026-02-20T08:00:00Z',
  },
  {
    id: 'key_003',
    label: 'Old Test Key',
    environment: 'test',
    public_key: 'pk_test_kp_old123old456',
    secret_key_hint: 'sk_test_****d456',
    status: 'revoked',
    created_at: '2025-12-01T08:00:00Z',
  },
];

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'test' | 'live'>('test');
  const [generatedKey, setGeneratedKey] = useState<{ public_key: string; secret_key: string } | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setApiKeys(MOCK_API_KEYS);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = () => {
    if (!newKeyLabel.trim()) {
      toast.error('Veuillez entrer un nom pour la clé');
      return;
    }
    setIsCreating(true);
    setTimeout(() => {
      const newPublic = `pk_${newKeyEnv}_kp_${Math.random().toString(36).substring(2, 14)}`;
      const newSecret = `sk_${newKeyEnv}_kp_${Math.random().toString(36).substring(2, 14)}`;

      setGeneratedKey({ public_key: newPublic, secret_key: newSecret });

      const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        label: newKeyLabel,
        environment: newKeyEnv,
        public_key: newPublic,
        secret_key_hint: `sk_${newKeyEnv}_****${newSecret.slice(-4)}`,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      setApiKeys([newKey, ...apiKeys]);
      setShowCreateModal(false);
      setShowKeyModal(true);
      setNewKeyLabel('');
      setIsCreating(false);
    }, 800);
  };

  const handleRevoke = (id: string) => {
    setApiKeys(apiKeys.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k)));
    toast.success('Clé révoquée avec succès');
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clés API</h1>
          <p className="text-gray-500 mt-1">Gérez vos clés d&apos;authentification API</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={18} className="mr-2" />
          Nouvelle clé
        </Button>
      </div>

      {/* Keys List */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-96" />
            </Card>
          ))
        ) : (
          apiKeys.map((key) => (
            <Card key={key.id} className="hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${key.environment === 'live' ? 'bg-green-50 text-green-500' : 'bg-yellow-50 text-yellow-500'}`}>
                    <Key size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{key.label}</h3>
                      <Badge
                        status={key.environment === 'live' ? 'success' : 'pending'}
                        label={key.environment === 'live' ? 'Live' : 'Test'}
                      />
                      {key.status === 'revoked' && (
                        <Badge status="failed" label="Révoquée" />
                      )}
                    </div>

                    <div className="space-y-1.5 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400 w-20">Public:</span>
                        <code className="text-xs bg-gray-50 px-2 py-1 rounded font-mono text-gray-700">
                          {key.public_key}
                        </code>
                        <button onClick={() => copyToClipboard(key.public_key)} className="text-gray-400 hover:text-gray-600">
                          <Copy size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400 w-20">Secret:</span>
                        <code className="text-xs bg-gray-50 px-2 py-1 rounded font-mono text-gray-700">
                          {revealedKeys.has(key.id) ? key.secret_key_hint : '••••••••••••••••'}
                        </code>
                        <button onClick={() => toggleReveal(key.id)} className="text-gray-400 hover:text-gray-600">
                          {revealedKeys.has(key.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>Créée: {formatDate(key.created_at)}</span>
                      {key.last_used_at && <span>Dernière utilisation: {formatDate(key.last_used_at)}</span>}
                    </div>
                  </div>
                </div>

                {key.status === 'active' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevoke(key.id)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Révoquer
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Key Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Créer une nouvelle clé API">
        <div className="space-y-5">
          <Input
            id="key_label"
            label="Nom de la clé"
            placeholder="ex: Production Backend"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Environnement</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewKeyEnv('test')}
                className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-colors ${
                  newKeyEnv === 'test'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Test
              </button>
              <button
                type="button"
                onClick={() => setNewKeyEnv('live')}
                className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-colors ${
                  newKeyEnv === 'live'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Live
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleCreate} isLoading={isCreating}>
              Générer la clé
            </Button>
          </div>
        </div>
      </Modal>

      {/* Generated Key Modal */}
      <Modal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} title="Clé API générée" size="lg">
        <div className="space-y-5">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Important</p>
              <p className="text-sm text-yellow-700 mt-1">
                Copiez votre clé secrète maintenant. Elle ne sera plus affichée après la fermeture de cette fenêtre.
              </p>
            </div>
          </div>

          {generatedKey && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Clé publique
                </label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <code className="flex-1 text-sm font-mono text-gray-700 break-all">
                    {generatedKey.public_key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedKey.public_key)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Clé secrète
                </label>
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg p-3">
                  <code className="flex-1 text-sm font-mono text-red-700 break-all">
                    {generatedKey.secret_key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedKey.secret_key)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <Button className="w-full" onClick={() => { setShowKeyModal(false); setGeneratedKey(null); }}>
            J&apos;ai copié mes clés
          </Button>
        </div>
      </Modal>
    </div>
  );
}
