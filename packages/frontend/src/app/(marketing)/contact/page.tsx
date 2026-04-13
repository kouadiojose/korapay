'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Contactez-<span className="gradient-text">nous</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une question ? Un projet ? Notre équipe est là pour vous aider.
              Remplissez le formulaire et nous vous répondrons dans les plus brefs délais.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={28} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message envoyé !</h3>
                  <p className="text-gray-600">
                    Merci pour votre message. Notre équipe vous répondra dans les 24 heures.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input label="Prénom" placeholder="Votre prénom" required />
                    <Input label="Nom" placeholder="Votre nom" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input label="Email" type="email" placeholder="vous@exemple.com" required />
                    <Input label="Téléphone" type="tel" placeholder="+225 07 XX XX XX XX" />
                  </div>
                  <div className="mb-6">
                    <Input label="Entreprise" placeholder="Nom de votre entreprise" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                    <select className="input-field" required>
                      <option value="">Sélectionner un sujet</option>
                      <option value="integration">Intégration technique</option>
                      <option value="sales">Ventes et tarification</option>
                      <option value="support">Support technique</option>
                      <option value="partnership">Partenariat</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      className="input-field min-h-[120px] resize-y"
                      placeholder="Décrivez votre projet ou votre question..."
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Envoyer le message
                  </Button>
                </form>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Mail size={24} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-gray-600 text-sm">contact@korapay.com</p>
                <p className="text-gray-600 text-sm">support@korapay.com</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Phone size={24} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                <p className="text-gray-600 text-sm">+225 07 00 00 00 00</p>
                <p className="text-gray-600 text-sm">Lun-Ven, 8h-18h GMT</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <MapPin size={24} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                <p className="text-gray-600 text-sm">Abidjan, Côte d&apos;Ivoire</p>
                <p className="text-gray-600 text-sm">Cocody, Riviera Palmeraie</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
