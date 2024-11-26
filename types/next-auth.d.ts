// types/next-auth.d.ts
import { DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury';
    }
  }

  interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury';
  }
}