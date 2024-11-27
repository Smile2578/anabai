// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "admin" | "editor" | "user" | "premium" | "luxury";
      sessionCreated: number;
      expires?: string;
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string;
    role: "admin" | "editor" | "user" | "premium" | "luxury";
    sessionCreated?: number;
  }

  // Assurons-nous que les événements sont correctement typés
  interface Event {
    token: JWT | null;
    session: Session | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "admin" | "editor" | "user" | "premium" | "luxury";
    sessionCreated?: number;
    userIP?: string;
    exp: number;
  }
}