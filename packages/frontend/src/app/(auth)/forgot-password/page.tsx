'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authApi } from '@/lib/auth';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsEmailSent(true);
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">KoraPay</span>
          </Link>
        </div>

        {isEmailSent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé</h2>
            <p className="text-gray-500 mb-8">
              Nous avons envoyé un lien de réinitialisation à{' '}
              <span className="font-medium text-gray-700">{getValues('email')}</span>.
              Vérifiez votre boîte de réception.
            </p>
            <Link href="/login">
              <Button variant="secondary" className="w-full" size="lg">
                <ArrowLeft size={18} className="mr-2" />
                Retour à la connexion
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <Mail size={32} className="text-primary-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Mot de passe oublié?</h2>
              <p className="text-gray-500 mt-2">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                id="email"
                label="Adresse email"
                type="email"
                placeholder="vous@entreprise.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
              >
                Envoyer le lien de réinitialisation
              </Button>
            </form>

            <p className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-medium text-primary-500 hover:text-primary-600"
              >
                <ArrowLeft size={16} className="mr-1" />
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
