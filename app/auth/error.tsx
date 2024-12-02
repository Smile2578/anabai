// app/auth/error.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const errors = {
  AccessDenied: "Accès refusé. Vérifiez que vous utilisez la bonne méthode de connexion.",
  Verification: "L'email n'a pas encore été vérifié. Veuillez vérifier votre boîte mail.",
  Default: "Une erreur s'est produite lors de l'authentification."
};

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorMessage = error ? errors[error as keyof typeof errors] || errors.Default : errors.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Erreur d&apos;authentification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorMessage}
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retour à la connexion
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 