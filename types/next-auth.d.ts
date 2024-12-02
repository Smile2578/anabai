// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

// Interface pour les données de liaison de compte en attente
interface PendingLinkData {
  pendingLinkToken?: string;
  pendingLinkProvider?: string;
  pendingLinkEmail?: string;
  pendingLinkExpiry?: Date;
  pendingLinkId?: string;
}

// Interface pour les métadonnées de l'utilisateur
interface UserMetadata extends PendingLinkData {
  signupIp?: string;
  lastPasswordChange?: Date;
  failedLoginAttempts?: number;
  lastFailedLogin?: Date;
}

// Extension du type User pour inclure nos champs personnalisés
export interface AuthUser extends DefaultUser {
  id: string;
  role: "admin" | "editor" | "user" | "premium" | "luxury";
  status: "active" | "inactive" | "pending_verification" | "pending_setup";
  email: string;
  name: string;
  image?: string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  setupToken?: string;
  setupTokenExpiry?: Date;
  sessionCreated?: number;
  lastLogin: Date;
  lastLoginIp?: string;
  metadata?: UserMetadata;
  providers?: {
    google?: {
      id: string;
      email: string;
      lastLogin: Date;
      isConfigured?: boolean;
    };
    credentials?: {
      lastLogin: Date;
    };
  };
}

// Déclaration de module pour étendre les types NextAuth
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "admin" | "editor" | "user" | "premium" | "luxury";
      status: "active" | "inactive" | "pending_verification" | "pending_setup";
      email: string;
      name: string;
      image?: string;
      metadata?: UserMetadata;
    };
    error?: string;
    expires: Date;
  }

  interface User extends AuthUser {}

  interface JWT extends DefaultJWT {
    id: string;
    role: "admin" | "editor" | "user" | "premium" | "luxury";
    status: "active" | "inactive" | "pending_verification" | "pending_setup";
    sessionCreated?: number;
    exp: number;
  }
}