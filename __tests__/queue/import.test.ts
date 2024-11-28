// __tests__/queue/import.test.ts
import fs from 'fs'
import path from 'path'
import { importQueue } from '@/lib/queue/queues/import.queue'

jest.setTimeout(30000)

describe('Import Queue', () => {
  let csvContent: string

  beforeAll(() => {
    csvContent = fs.readFileSync(
      path.join(process.cwd(), '__tests__/fixtures/JaponTest.csv'),
      'utf-8'
    )
  })

  beforeEach(async () => {
    await importQueue.clean(0, 'completed')
    await importQueue.clean(0, 'failed')
    await importQueue.empty()
  })

  afterEach(async () => {
    // Nettoyage après chaque test
    await importQueue.removeAllListeners()
    await importQueue.close()
  })

  it('should add import job to queue successfully', async () => {
    const job = await importQueue.add({
      fileContent: csvContent,
      userId: 'test-user',
      options: {
        skipValidation: false,
        autoEnrich: true
      }
    })

    expect(job.id).toBeDefined()
    expect(job.data.fileContent).toBe(csvContent)
    expect(job.data.userId).toBe('test-user')
  })

  it('should process CSV file and count lines correctly', async () => {
    // Créer une nouvelle instance de queue pour ce test
    const testQueue = new Queue('import-test', {
      redis: redisConfig
    })

    try {
      // Ajouter le processeur
      testQueue.process(async (job) => {
        const lines = job.data.fileContent.split('\n')
        const headerRow = lines[0].split(',')
        const dataRows = lines.slice(1).filter(line => line.trim() !== '')

        // Vérifier les en-têtes requis
        const requiredHeaders = ['Title', 'Note', 'URL', 'Comment']
        const missingHeaders = requiredHeaders.filter(
          header => !headerRow.includes(header)
        )

        if (missingHeaders.length > 0) {
          throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
        }

        return {
          success: true,
          stats: {
            total: dataRows.length,
            processed: dataRows.length,
            failed: 0,
            enriched: 0
          }
        }
      })

      // Ajouter le job
      const job = await testQueue.add({
        fileContent: csvContent,
        userId: 'test-user'
      })

      // Attendre le résultat
      const result = await job.finished()
      
      // Vérifications
      expect(result.success).toBe(true)
      expect(result.stats.total).toBe(6) // Nombre réel de lignes dans votre CSV
      expect(result.stats.processed).toBe(6)
      expect(result.stats.failed).toBe(0)
    } finally {
      // Nettoyage
      await testQueue.empty()
      await testQueue.close()
    }
  })

  it('should validate CSV structure', () => {
    const lines = csvContent.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    console.log('CSV Headers:', headers)
    console.log('Number of rows:', lines.length - 1)
    
    // Adapter les attentes au format réel du CSV
    expect(headers).toEqual(['Title', 'Note', 'URL', 'Comment'])
    expect(lines.length - 1).toBe(6) // Nombre réel de lignes dans votre CSV
  })
})