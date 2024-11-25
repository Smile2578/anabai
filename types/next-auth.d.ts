// types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury';
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury';
  }
}