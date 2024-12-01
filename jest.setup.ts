import { config } from 'dotenv';
import '@testing-library/jest-dom';

// Charger les variables d'environnement depuis .env.local
config({ path: '.env.local' }); 

// Mock de fetch global
global.fetch = jest.fn();

// Suppression des warnings de console pendant les tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock de ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock d'IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})); 