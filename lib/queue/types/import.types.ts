// lib/queue/types/import.types.ts
export interface ImportJobData {
    fileContent: string
    userId: string
    options?: {
      skipValidation?: boolean
      autoEnrich?: boolean
      validateOnly?: boolean
    }
  }
  
  export interface ImportJobResult {
    success: boolean
    stats: {
      total: number
      processed: number
      failed: number
      enriched: number
    }
    errors?: Array<{
      row: number
      error: string
    }>
  }