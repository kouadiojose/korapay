'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-bold text-gray-900">KoraPay</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              A propos
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              Tarifs
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              Documentation
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Commencer</Button>
            </Link>
          </div>

          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <Link href="/about" className="text-gray-600 hover:text-primary-500 font-medium py-2">
                A propos
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-primary-500 font-medium py-2">
                Tarifs
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-primary-500 font-medium py-2">
                Documentation
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary-500 font-medium py-2">
                Contact
              </Link>
              <div className="flex space-x-3 pt-3">
                <Link href="/login" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">Connexion</Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button size="sm" className="w-full">Commencer</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
