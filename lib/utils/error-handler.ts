import { toast } from '@/hooks/use-toast';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorCodes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  FORBIDDEN: 'FORBIDDEN_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  NETWORK: 'NETWORK_ERROR',
} as const;

export function handleError(error: unknown, context?: string): AppError {
  console.error(`[${context || 'Error'}]:`, error);

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      errorCodes.SERVER,
      500,
      { originalError: error.name }
    );
  }

  return new AppError(
    'Une erreur inattendue est survenue',
    errorCodes.SERVER,
    500
  );
}

export function showErrorToast(error: unknown) {
  const appError = handleError(error);
  toast({
    title: "Erreur",
    description: appError.message,
    variant: "destructive",
  });
}

export function createErrorResponse(error: unknown) {
  const appError = handleError(error);
  return new Response(
    JSON.stringify({
      error: appError.message,
      code: appError.code,
      context: appError.context,
    }),
    { 
      status: appError.statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
} 