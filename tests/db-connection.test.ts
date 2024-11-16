// tests/db-connection.test.ts
import connectDB from '@/lib/db/connection';
import mongoose from 'mongoose';

describe('Database Connection', () => {
  // Nettoyer après tous les tests
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('should connect to MongoDB', async () => {
    try {
      const conn = await connectDB();
      expect(conn).toBeDefined();
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  });
});