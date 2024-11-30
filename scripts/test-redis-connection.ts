import { config } from 'dotenv';
config({ path: '.env.test' });

import { redisRest, createRedisClient } from '../lib/services/core/RedisService';

async function testRedisConnection() {
  console.log('🔄 Démarrage des tests de connexion Redis...');
  console.log('Configuration environnement:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REDIS_URL:', process.env.REDIS_URL);
  console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL);
  console.log('UPSTASH_REDIS_REST_TOKEN existe:', !!process.env.UPSTASH_REDIS_REST_TOKEN);

  try {
    // Test REST API
    console.log('\n📡 Test de la connexion REST API...');
    try {
      await redisRest.set('test_rest', 'Hello Upstash REST!');
      const restValue = await redisRest.get('test_rest');
      console.log('✅ REST API: Connexion réussie');
      console.log('📝 Valeur REST récupérée:', restValue);
    } catch (error) {
      console.error('❌ Erreur REST API:', error);
      throw error;
    }

    // Test Native Client
    console.log('\n🔌 Test de la connexion native...');
    const client = await createRedisClient();
    
    try {
      console.log('Tentative de connexion...');
      await client.connect();
      console.log('✅ Connexion native établie');
      
      await client.set('test_native', 'Hello Redis Native!');
      const nativeValue = await client.get('test_native');
      console.log('📝 Valeur Native récupérée:', nativeValue);
    } catch (error) {
      console.error('❌ Erreur client natif:', error);
      throw error;
    } finally {
      try {
        await client.quit();
        console.log('Connexion native fermée');
      } catch (quitError) {
        console.error('Erreur lors de la fermeture:', quitError);
      }
    }

    console.log('\n✨ Tous les tests sont passés avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Échec des tests:', error);
    process.exit(1);
  }
}

testRedisConnection(); 