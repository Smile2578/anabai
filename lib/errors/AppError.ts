export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR'
  | 'EXTERNAL_API_ERROR'
  | 'RATE_LIMIT_ERROR';

export type ErrorContext = Record<string, unknown>;

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context
    };
  }

  public static fromError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        'INTERNAL_ERROR',
        error.message,
        500,
        { originalError: error.name }
      );
    }

    return new AppError(
      'INTERNAL_ERROR',
      'Une erreur inconnue est survenue',
      500
    );
  }
}

export const createError = {
  validation: (message: string, context?: ErrorContext) => 
    new AppError('VALIDATION_ERROR', message, 400, context),
    
  notFound: (message: string, context?: ErrorContext) =>
    new AppError('NOT_FOUND', message, 404, context),
    
  unauthorized: (message: string, context?: ErrorContext) =>
    new AppError('UNAUTHORIZED', message, 401, context),
    
  forbidden: (message: string, context?: ErrorContext) =>
    new AppError('FORBIDDEN', message, 403, context),
    
  badRequest: (message: string, context?: ErrorContext) =>
    new AppError('BAD_REQUEST', message, 400, context),
    
  internal: (message: string, context?: ErrorContext) =>
    new AppError('INTERNAL_ERROR', message, 500, context),
    
  externalApi: (message: string, context?: ErrorContext) =>
    new AppError('EXTERNAL_API_ERROR', message, 502, context),
    
  rateLimit: (message: string, context?: ErrorContext) =>
    new AppError('RATE_LIMIT_ERROR', message, 429, context)
}; 