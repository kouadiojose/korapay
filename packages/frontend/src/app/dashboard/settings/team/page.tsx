'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, MoreVertical, Mail, Shield, UserCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { TeamMember } from '@/types/merchant.types';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  developer: 'Développeur',
  viewer: 'Lecteur',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  developer: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'developer' as 'admin' | 'developer' | 'viewer',
  });

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/merchants/team');
      const data = res.data.data ?? [];
      setTeam(data);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      setTeam([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.first_name || !inviteForm.last_name) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setIsInviting(true);
    try {
      await api.post('/merchants/team/invite', {
        email: inviteForm.email,
        first_name: inviteForm.first_name,
        last_name: inviteForm.last_name,
        role: inviteForm.role,
      });
      setShowModal(false);
      setInviteForm({ email: '', first_name: '', last_name: '', role: 'developer' });
      toast.success('Invitation envoyée avec succès');
      fetchTeam();
    } catch (err) {
      console.error('Failed to invite team member:', err);
      toast.error('Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Équipe</h1>
          <p className="text-gray-500 mt-1">Gérez les membres et les permissions de votre équipe</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" />
          Inviter un membre
        </Button>
      </div>

      {/* Team Members */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : team.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <UserCircle size={40} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée disponible</h3>
            <p className="text-gray-500">Invitez des membres pour collaborer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {team.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {member.first_name.charAt(0)}
                            {member.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}>
                        <Shield size={12} />
                        {ROLE_LABELS[member.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <Badge
                        status={member.status === 'active' ? 'success' : member.status === 'pending' ? 'pending' : 'expired'}
                        label={member.status === 'active' ? 'Actif' : member.status === 'pending' ? 'En attente' : 'Désactivé'}
                      />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">
                        {member.last_login_at ? formatDate(member.last_login_at) : 'Jamais'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'owner' && (
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Inviter un membre">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="first_name"
              label="Prénom"
              placeholder="Prénom"
              value={inviteForm.first_name}
              onChange={(e) => setInviteForm({ ...inviteForm, first_name: e.target.value })}
            />
            <Input
              id="last_name"
              label="Nom"
              placeholder="Nom"
              value={inviteForm.last_name}
              onChange={(e) => setInviteForm({ ...inviteForm, last_name: e.target.value })}
            />
          </div>

          <Input
            id="email"
            label="Adresse email"
            type="email"
            placeholder="membre@entreprise.com"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
          />

          <div className="w-full">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <select
              id="role"
              className="input-field w-full"
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm({
                  ...inviteForm,
                  role: e.target.value as 'admin' | 'developer' | 'viewer',
                })
              }
            >
              <option value="admin">Administrateur</option>
              <option value="developer">Développeur</option>
              <option value="viewer">Lecteur</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleInvite} isLoading={isInviting}>
              <Mail size={18} className="mr-2" />
              Envoyer l&apos;invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
