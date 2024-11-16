// components/navigation/Footer.tsx
'use client';

import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
          {/* Logo ou Nom */}
          <div className="text-2xl font-bold">
            <Link href="/">
              <span className="anaba-title-white">AnabAI</span>
            </Link>
          </div>

          {/* Liens */}
          <div className="flex space-x-4">
            <Link href="/voyage" className="hover:underline">
              Voyager avec AnabAI
            </Link>
            <Link href="/anablog" className="hover:underline">
              Anablog
            </Link>
            <Link href="/about" className="hover:underline">
              À propos
            </Link>
          </div>

          {/* Réseaux Sociaux */}
          <div className="flex space-x-4">
            <Link href="#" aria-label="Facebook">
              <FaFacebookF className="h-5 w-5 hover:text-primary" />
            </Link>
            <Link href="#" aria-label="Twitter">
              <FaTwitter className="h-5 w-5 hover:text-primary" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <FaInstagram className="h-5 w-5 hover:text-primary" />
            </Link>
          </div>
        </div>

        {/* Informations Légales */}
        <div className="mt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} AnabAI. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
