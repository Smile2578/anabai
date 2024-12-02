import { config } from 'dotenv';
import '@testing-library/jest-dom'

// Charger les variables d'environnement depuis .env.local
config({ path: '.env.local' });

// Mock de NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => {
      const stringifiedBody = JSON.stringify(body);
      return {
        status: init?.status || 200,
        headers: new Headers({
          'Content-Type': 'application/json',
          ...(init?.headers || {})
        }),
        json: async () => JSON.parse(stringifiedBody),
        text: async () => stringifiedBody,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300
      };
    }
  }
}));

// Mock des objets Web API
global.Request = jest.fn().mockImplementation((input: string | URL | Request, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  return {
    url: typeof input === 'string' ? input : input.toString(),
    method: init?.method || 'GET',
    headers: {
      get: (name: string) => headers.get(name),
      has: (name: string) => headers.has(name),
      set: (name: string, value: string) => headers.set(name, value),
      append: (name: string, value: string) => headers.append(name, value),
      delete: (name: string) => headers.delete(name),
      forEach: (callback: (value: string, key: string) => void) => headers.forEach(callback),
      entries: () => headers.entries(),
      keys: () => headers.keys(),
      values: () => headers.values(),
      [Symbol.iterator]: () => headers[Symbol.iterator]()
    },
    body: init?.body,
    json: async () => init?.body ? JSON.parse(init.body.toString()) : null,
    text: async () => init?.body ? init.body.toString() : '',
    clone: () => new Request(input, init)
  };
}) as unknown as typeof Request;

class MockHeaders extends Headers {
  constructor(init?: HeadersInit) {
    super(init);
    return new Map(init instanceof Array ? init : []) as unknown as Headers;
  }
}

// Assigner les mocks aux objets globaux
global.Headers = MockHeaders as typeof Headers;
global.Response = jest.fn().mockImplementation((body?: BodyInit | null, init?: ResponseInit) => {
  const stringifiedBody = body ? JSON.stringify(body) : '';
  return {
    status: init?.status || 200,
    headers: new Headers(init?.headers),
    json: async () => JSON.parse(stringifiedBody),
    text: async () => stringifiedBody,
    ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
    ...init
  };
}) as unknown as typeof Response;

// Mock de fetch global
global.fetch = jest.fn() as jest.Mock;

// Suppression des warnings de console pendant les tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
} as typeof console;

// Variables d'environnement pour les tests
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.GOOGLE_ID = 'test-google-id';
process.env.GOOGLE_SECRET = 'test-google-secret';

// Mock de ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

// Mock d'IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock de next-auth
jest.mock('next-auth', () => ({
  __esModule: true,
  default: () => ({}),
  getServerSession: jest.fn(() => Promise.resolve(null)),
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' }))
}));

jest.mock('next-auth/providers/google', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    id: 'google',
    name: 'Google',
    type: 'oauth'
  }))
}));

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'text' },
      password: { label: 'Password', type: 'password' }
    },
    authorize: jest.fn()
  }))
}));

// Mock de lib/utils/security
jest.mock('@/lib/utils/security', () => ({
  rateLimit: jest.fn().mockReturnValue(true)
}));

// Mock de lib/db/connection
jest.mock('@/lib/db/connection', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true)
}));

interface MockUserData {
  email: string;
  name?: string;
  password?: string;
  status?: string;
  emailVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  providers?: Record<string, unknown>;
}

// Mock de User
jest.mock('@/models/User', () => {
  const mockUser = function(this: void, data: MockUserData) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(true)
    };
  };
  return {
    __esModule: true,
    default: Object.assign(mockUser, {
      findOne: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn()
    })
  };
});

// Mock de lib/auth/passwordUtils
jest.mock('@/lib/auth/passwordUtils', () => ({
  validatePassword: jest.fn().mockReturnValue({
    isValid: true,
    score: 4,
    errors: []
  })
}));

// Mock de lib/auth/sendEmail
jest.mock('@/lib/auth/sendEmail', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(true)
  }
}));

// Mock de lib/utils/security
jest.mock('@/lib/utils/security', () => ({
  rateLimit: jest.fn().mockReturnValue(true)
}));

// Mock de lib/db/connection
jest.mock('@/lib/db/connection', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true)
})); 