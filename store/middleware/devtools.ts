// store/middleware/devtools.ts
import { devtools, persist } from 'zustand/middleware';
import { create } from 'zustand';

export const useAuthStore = create(
  devtools(
    persist(
      () => ({
        // ... notre state
      }),
      {
        name: 'auth-storage',
        // ... options de persistence
      }
    ),
    {
      name: 'AuthStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);