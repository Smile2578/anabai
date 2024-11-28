// jest.setup.js
import { config } from 'dotenv'
import '@testing-library/jest-dom'

// Configuration de l'environnement de test
config({
  path: './.env.local'
})

// Mock global pour Redis
global.Redis = {
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
  }))
}

// Mock global pour Vercel Blob
global.blob = {
  put: jest.fn(),
  del: jest.fn(),
  get: jest.fn(),
}

// Attendre que Redis soit disponible avant de démarrer les tests
beforeAll(async () => {
  // Attendre 5 secondes que Redis démarre complètement
  await new Promise((resolve) => setTimeout(resolve, 5000))
})

// Nettoyage après tous les tests
afterAll(async () => {
  // Vous pouvez ajouter ici d'autres opérations de nettoyage si nécessaire
})