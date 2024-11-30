// __tests__/queue/import.test.ts
import fs from 'fs'
import path from 'path'
import { Queue } from 'bullmq'
import { redisConfig } from '@/lib/queue/config/redis'


describe('Import Queue', () => {
  let csvContent: string
  let queue: Queue

  beforeAll(async () => {
    csvContent = fs.readFileSync(
      path.join(process.cwd(), '__tests__/fixtures/JaponTest.csv'),
      'utf-8'
    )
  })

  beforeEach(async () => {
    queue = new Queue('import-test', {
      connection: redisConfig
    })
  })

  afterEach(async () => {
    await queue?.close()
  })

  it('should add import job to queue successfully', async () => {
    const job = await queue.add('import-csv', {
      type: 'csv',
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
  }, 10000)

  it('should validate CSV structure', () => {
    const lines = csvContent.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const dataRows = lines.slice(1).filter(line => line.trim() !== '')
    
    // Adapter les attentes au format réel du CSV
    expect(headers).toEqual(['Title', 'Note', 'URL', 'Comment'])
    expect(dataRows.length).toBe(5)
  })
})