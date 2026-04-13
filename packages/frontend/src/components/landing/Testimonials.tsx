'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Fatou Diop',
    role: 'CEO, AfriShop',
    content: 'KoraPay a transformé notre business. Nous recevons des paiements de toute l\'Afrique de l\'Ouest en quelques secondes. L\'intégration a pris moins d\'une journée.',
    country: 'Sénégal',
    rating: 5,
  },
  {
    name: 'Kouadio Jean',
    role: 'CTO, DigiPay CI',
    content: 'L\'API est très bien documentée et le support technique est excellent. Le taux de succès des transactions Mobile Money est le meilleur que nous ayons vu.',
    country: 'Côte d\'Ivoire',
    rating: 5,
  },
  {
    name: 'Amadou Traoré',
    role: 'Fondateur, MaliExpress',
    content: 'Grâce à KoraPay, nous avons pu lancer notre marketplace en un temps record. L\'intégration Orange Money et Wave fonctionne parfaitement.',
    country: 'Mali',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ils nous font{' '}
            <span className="gradient-text">confiance</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des centaines d&apos;entreprises africaines utilisent KoraPay pour gérer leurs paiements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-semibold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.role} - {testimonial.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Marchands actifs' },
              { value: '10M+', label: 'Transactions traitées' },
              { value: '99.2%', label: 'Taux de succès' },
              { value: '10+', label: 'Pays couverts' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
