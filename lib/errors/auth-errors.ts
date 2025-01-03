// lib/errors/auth-errors.ts

// Types d'erreurs Supabase
export const SUPABASE_ERROR_CODES = {
  'PGRST301': 'Erreur de contrainte d\'unicité',
  'P0001': 'Erreur de violation de politique',
  '23505': 'Cette adresse email est déjà utilisée',
  '23503': 'Erreur de référence',
  '23514': 'Erreur de contrainte de vérification',
  '42501': 'Permission insuffisante',
  '28000': 'Autorisation invalide'
} as const;

export const AUTH_ERRORS = {
  SIGNUP: {
    EMAIL_EXISTS: {
      code: 'auth/email-exists',
      message: 'Cette adresse email est déjà utilisée.'
    },
    INVALID_EMAIL: {
      code: 'auth/invalid-email',
      message: 'L\'adresse email n\'est pas valide.'
    },
    WEAK_PASSWORD: {
      code: 'auth/weak-password',
      message: 'Le mot de passe doit contenir au moins 8 caractères.'
    },
    DATABASE_ERROR: {
      code: 'auth/database-error',
      message: 'Une erreur est survenue lors de la création du compte.'
    },
    ROLE_REQUIRED: {
      code: 'auth/role-required',
      message: 'Le rôle utilisateur est requis.'
    },
    INVALID_ROLE: {
      code: 'auth/invalid-role',
      message: 'Le rôle spécifié n\'est pas valide.'
    }
  },
  LOGIN: {
    INVALID_CREDENTIALS: {
      code: 'auth/invalid-credentials',
      message: 'Email ou mot de passe incorrect.'
    },
    USER_NOT_FOUND: {
      code: 'auth/user-not-found',
      message: 'Aucun compte ne correspond à cette adresse email.'
    },
    TOO_MANY_ATTEMPTS: {
      code: 'auth/too-many-attempts',
      message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.'
    },
    ACCOUNT_DISABLED: {
      code: 'auth/account-disabled',
      message: 'Ce compte a été désactivé.'
    },
    EMAIL_NOT_VERIFIED: {
      code: 'auth/email-not-verified',
      message: 'Veuillez vérifier votre adresse email avant de vous connecter.'
    }
  },
  SESSION: {
    EXPIRED: {
      code: 'auth/session-expired',
      message: 'Votre session a expiré. Veuillez vous reconnecter.'
    },
    INVALID: {
      code: 'auth/invalid-session',
      message: 'Session invalide. Veuillez vous reconnecter.'
    },
    MISSING: {
      code: 'auth/no-session',
      message: 'Aucune session active trouvée.'
    }
  },
  VERIFICATION: {
    TOKEN_EXPIRED: {
      code: 'auth/verification-expired',
      message: 'Le lien de vérification a expiré.'
    },
    TOKEN_INVALID: {
      code: 'auth/invalid-verification',
      message: 'Le lien de vérification est invalide.'
    },
    EMAIL_ALREADY_VERIFIED: {
      code: 'auth/email-already-verified',
      message: 'Cette adresse email est déjà vérifiée.'
    }
  },
  PROVIDER: {
    GOOGLE_ERROR: {
      code: 'auth/google-error',
      message: 'Erreur lors de la connexion avec Google.'
    },
    LINK_ERROR: {
      code: 'auth/provider-link-error',
      message: 'Erreur lors de la liaison du compte.'
    },
    ALREADY_LINKED: {
      code: 'auth/provider-already-linked',
      message: 'Ce compte est déjà lié à un autre utilisateur.'
    }
  },
  PASSWORD: {
    RESET_EXPIRED: {
      code: 'auth/reset-password-expired',
      message: 'Le lien de réinitialisation du mot de passe a expiré.'
    },
    RESET_INVALID: {
      code: 'auth/invalid-reset-password',
      message: 'Le lien de réinitialisation du mot de passe est invalide.'
    },
    SAME_PASSWORD: {
      code: 'auth/same-password',
      message: 'Le nouveau mot de passe doit être différent de l\'ancien.'
    }
  },
  PERMISSIONS: {
    INSUFFICIENT_RIGHTS: {
      code: 'auth/insufficient-rights',
      message: 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.'
    },
    ADMIN_REQUIRED: {
      code: 'auth/admin-required',
      message: 'Cette action nécessite des droits administrateur.'
    }
  }
};

export type AuthErrorCode = keyof typeof AUTH_ERRORS;

interface SupabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
}

export const handleAuthError = (error: SupabaseError): { code: string; message: string } => {
  console.error('🔴 Erreur d\'authentification:', error);
  
  // Erreurs PostgreSQL spécifiques
  if (error.code && SUPABASE_ERROR_CODES[error.code as keyof typeof SUPABASE_ERROR_CODES]) {
    return {
      code: error.code,
      message: SUPABASE_ERROR_CODES[error.code as keyof typeof SUPABASE_ERROR_CODES]
    };
  }

  // Erreurs Supabase Auth
  if (error.message) {
    if (error.message.includes('Email not confirmed')) {
      return AUTH_ERRORS.LOGIN.EMAIL_NOT_VERIFIED;
    }

    if (error.message.includes('User already registered')) {
      return AUTH_ERRORS.SIGNUP.EMAIL_EXISTS;
    }
    
    if (error.message.includes('Invalid login credentials')) {
      return AUTH_ERRORS.LOGIN.INVALID_CREDENTIALS;
    }

    if (error.message.includes('Email link is invalid or has expired')) {
      return AUTH_ERRORS.VERIFICATION.TOKEN_EXPIRED;
    }

    if (error.message.includes('Invalid token')) {
      return AUTH_ERRORS.SESSION.INVALID;
    }

    if (error.message.includes('Session expired')) {
      return AUTH_ERRORS.SESSION.EXPIRED;
    }

    if (error.message.includes('No session found')) {
      return AUTH_ERRORS.SESSION.MISSING;
    }

    // Erreurs de base de données
    if (error.message.includes('Database error')) {
      return AUTH_ERRORS.SIGNUP.DATABASE_ERROR;
    }
  }

  // Erreurs HTTP
  if (error.status === 401) {
    return AUTH_ERRORS.SESSION.INVALID;
  }

  if (error.status === 403) {
    return AUTH_ERRORS.PERMISSIONS.INSUFFICIENT_RIGHTS;
  }

  if (error.status === 422) {
    return {
      code: 'auth/validation-error',
      message: error.message || 'Les données fournies ne sont pas valides.'
    };
  }

  if (error.status === 429) {
    return AUTH_ERRORS.LOGIN.TOO_MANY_ATTEMPTS;
  }

  // Erreur par défaut
  return {
    code: 'auth/unknown',
    message: 'Une erreur inattendue est survenue. Veuillez réessayer.'
  };
};

export const isAuthError = (error: unknown): error is { code: string; message: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
};