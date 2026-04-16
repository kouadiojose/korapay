'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { KycDocument, KycDocumentType } from '@/types/merchant.types';
import { KYC_DOCUMENT_TYPES } from '@/types/merchant.types';

const KYC_STATUS_MAP: Record<string, string> = {
  pending: 'En attente',
  under_review: 'En cours de vérification',
  approved: 'Vérifié',
  rejected: 'Rejeté',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  approved: <CheckCircle2 size={16} className="text-green-500" />,
  rejected: <XCircle size={16} className="text-red-500" />,
  under_review: <Clock size={16} className="text-blue-500" />,
  pending: <Clock size={16} className="text-yellow-500" />,
};

export default function KycPage() {
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<KycDocumentType>('national_id');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [overallStatus, setOverallStatus] = useState<string>('pending');

  const fetchKycDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/merchants/kyc');
      const data = res.data.data;
      const docs = data?.documents ?? data ?? [];
      setDocuments(Array.isArray(docs) ? docs : []);
      if (data?.status) {
        setOverallStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to fetch KYC documents:', err);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKycDocuments();
  }, [fetchKycDocuments]);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', selectedType);
      await api.post('/merchants/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowModal(false);
      setSelectedFile(null);
      toast.success('Document soumis avec succès');
      fetchKycDocuments();
    } catch (err) {
      console.error('Failed to upload KYC document:', err);
      toast.error('Erreur lors de la soumission du document');
    } finally {
      setIsUploading(false);
    }
  };

  const approvedCount = documents.filter((d) => d.status === 'approved').length;
  const totalRequired = KYC_DOCUMENT_TYPES.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vérification KYC</h1>
        <p className="text-gray-500 mt-1">Soumettez vos documents pour activer le mode production</p>
      </div>

      {/* KYC Status Banner */}
      <Card className={`border-l-4 ${
        overallStatus === 'approved'
          ? 'border-l-green-500 bg-green-50'
          : overallStatus === 'rejected'
          ? 'border-l-red-500 bg-red-50'
          : 'border-l-yellow-500 bg-yellow-50'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              overallStatus === 'approved'
                ? 'bg-green-100 text-green-600'
                : overallStatus === 'rejected'
                ? 'bg-red-100 text-red-600'
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Statut KYC</h3>
                <Badge status={overallStatus} label={KYC_STATUS_MAP[overallStatus] || overallStatus} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {approvedCount} sur {totalRequired} documents approuvés
              </p>
            </div>
          </div>
          <div className="w-full sm:w-48 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all"
              style={{ width: `${(approvedCount / totalRequired) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Documents List */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Documents soumis</h3>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Upload size={16} className="mr-2" />
          Ajouter un document
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </Card>
          ))
        ) : documents.length === 0 ? (
          <Card className="text-center py-12">
            <FileText size={40} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun document soumis</h3>
            <p className="text-gray-500 mb-6">
              Commencez par télécharger vos documents de vérification
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Upload size={18} className="mr-2" />
              Ajouter un document
            </Button>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id}>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {KYC_DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label || doc.type}
                    </h4>
                    {STATUS_ICONS[doc.status]}
                  </div>
                  <p className="text-sm text-gray-500">{doc.file_name}</p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Soumis: {formatDate(doc.uploaded_at)}</span>
                    {doc.reviewed_at && (
                      <span>Examiné: {formatDate(doc.reviewed_at)}</span>
                    )}
                  </div>

                  {doc.status === 'rejected' && doc.rejection_reason && (
                    <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-3">
                      <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{doc.rejection_reason}</p>
                    </div>
                  )}
                </div>
                <Badge status={doc.status} label={KYC_STATUS_MAP[doc.status] || doc.status} />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ajouter un document">
        <div className="space-y-5">
          <div className="w-full">
            <label htmlFor="doc_type" className="block text-sm font-medium text-gray-700 mb-1">
              Type de document
            </label>
            <select
              id="doc_type"
              className="input-field w-full"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as KycDocumentType)}
            >
              {KYC_DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={32} className="text-gray-400 mx-auto mb-3" />
                {selectedFile ? (
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      Cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG ou PNG (max 10 Mo)</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleUpload} isLoading={isUploading}>
              <Upload size={18} className="mr-2" />
              Soumettre
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
