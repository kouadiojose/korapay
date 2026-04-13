'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Shield, Zap, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authApi } from '@/lib/auth';
import toast from 'react-hot-toast';

const registerSchema = z
  .object({
    email: z.string().email('Adresse email invalide'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre'),
    confirm_password: z.string(),
    first_name: z.string().min(2, 'Minimum 2 caractères'),
    last_name: z.string().min(2, 'Minimum 2 caractères'),
    phone: z.string().optional(),
    business_name: z.string().min(2, 'Nom de l\'entreprise requis'),
    business_type: z.enum(['individual', 'sole_proprietor', 'partnership', 'corporation'], {
      errorMap: () => ({ message: 'Type d\'entreprise requis' }),
    }),
    country: z.enum(['CI', 'SN', 'ML', 'BF', 'CM', 'GH', 'NG', 'BJ', 'TG', 'NE'], {
      errorMap: () => ({ message: 'Pays requis' }),
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const STEPS = [
  { title: 'Compte', description: 'Informations personnelles' },
  { title: 'Entreprise', description: 'Détails de l\'entreprise' },
];

const COUNTRIES = [
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'SN', label: 'Sénégal' },
  { value: 'ML', label: 'Mali' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'CM', label: 'Cameroun' },
  { value: 'GH', label: 'Ghana' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'BJ', label: 'Bénin' },
  { value: 'TG', label: 'Togo' },
  { value: 'NE', label: 'Niger' },
];

const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individuel' },
  { value: 'sole_proprietor', label: 'Entreprise individuelle' },
  { value: 'partnership', label: 'Société de personnes' },
  { value: 'corporation', label: 'Société / SA / SARL' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleNext = async () => {
    const fields: (keyof RegisterFormData)[] =
      step === 0
        ? ['first_name', 'last_name', 'email', 'password', 'confirm_password']
        : ['business_name', 'business_type', 'country'];
    const valid = await trigger(fields);
    if (valid) setStep(step + 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const { confirm_password, ...registerData } = data;
      void confirm_password;
      await authApi.register(registerData);
      toast.success('Compte créé avec succès! Veuillez vous connecter.');
      router.push('/login');
    } catch {
      toast.error('Erreur lors de la création du compte. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-primary-500 font-bold text-xl">K</span>
              </div>
              <span className="text-2xl font-bold">KoraPay</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-4">
                Créez votre compte marchand
              </h1>
              <p className="text-lg text-white/80">
                Rejoignez des milliers d&apos;entreprises qui utilisent KoraPay pour leurs paiements.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="font-semibold">Activation en 24h</p>
                  <p className="text-sm text-white/70">Commencez à accepter des paiements rapidement</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-semibold">Aucun frais caché</p>
                  <p className="text-sm text-white/70">Tarification transparente, payez uniquement par transaction</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="font-semibold">Support dédié</p>
                  <p className="text-sm text-white/70">Équipe technique disponible pour vous accompagner</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/50">
            &copy; 2026 KoraPay. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">KoraPay</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Créer un compte</h2>
            <p className="text-gray-500 mt-2">
              Commencez à accepter des paiements en quelques minutes
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-4 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-center gap-3 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                    i < step
                      ? 'bg-green-500 text-white'
                      : i === step
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.description}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Step 1: Personal Info */}
            {step === 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="first_name"
                    label="Prénom"
                    placeholder="Amadou"
                    error={errors.first_name?.message}
                    {...register('first_name')}
                  />
                  <Input
                    id="last_name"
                    label="Nom"
                    placeholder="Koné"
                    error={errors.last_name?.message}
                    {...register('last_name')}
                  />
                </div>

                <Input
                  id="email"
                  label="Adresse email"
                  type="email"
                  placeholder="vous@entreprise.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  id="phone"
                  label="Téléphone (optionnel)"
                  type="tel"
                  placeholder="+225 07 01 23 45 67"
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <div className="relative">
                  <Input
                    id="password"
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 caractères"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <Input
                  id="confirm_password"
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="Confirmer votre mot de passe"
                  error={errors.confirm_password?.message}
                  {...register('confirm_password')}
                />

                <Button type="button" className="w-full" size="lg" onClick={handleNext}>
                  Continuer
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </>
            )}

            {/* Step 2: Business Info */}
            {step === 1 && (
              <>
                <Input
                  id="business_name"
                  label="Nom de l'entreprise"
                  placeholder="Ma Super Entreprise"
                  error={errors.business_name?.message}
                  {...register('business_name')}
                />

                <div className="w-full">
                  <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type d&apos;entreprise
                  </label>
                  <select
                    id="business_type"
                    className="input-field w-full"
                    {...register('business_type')}
                  >
                    <option value="">Sélectionner le type</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.business_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.business_type.message}</p>
                  )}
                </div>

                <div className="w-full">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <select
                    id="country"
                    className="input-field w-full"
                    {...register('country')}
                  >
                    <option value="">Sélectionner le pays</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    size="lg"
                    onClick={() => setStep(0)}
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    isLoading={isSubmitting}
                  >
                    Créer le compte
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </div>
              </>
            )}
          </form>

          <p className="mt-8 text-center text-gray-500">
            Déjà un compte?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary-500 hover:text-primary-600"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
