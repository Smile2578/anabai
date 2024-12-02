// types/auth.d.ts
export interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
  }
  
  export interface AuthStore extends AuthState {
    setUser: (user: AuthUser | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
  }
  
  export interface SetupAccountRequest {
    password: string;
    setupToken: string;
  }
  
  export interface LinkAccountRequest {
    email: string;
    provider: string;
    password: string;
  }