// tests/api-routes.test.ts
import { describe, expect, it, afterAll } from '@jest/globals';
import { GET } from '@/app/api/test/route';
import mongoose from 'mongoose';

describe('API Routes', () => {
  // Fermer la connexion après tous les tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should perform basic database operations', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.testResults.success).toBe(true);
    expect(data.testResults.operations).toContain('create');
    expect(data.testResults.operations).toContain('read');
    expect(data.testResults.operations).toContain('delete');
  });
});