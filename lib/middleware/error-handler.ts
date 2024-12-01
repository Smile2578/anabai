import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { env } from '@/lib/env.config';

export async function errorHandler(
  error: unknown
): Promise<NextResponse> {
  const appError = AppError.fromError(error);
  
  // Log l'erreur en développement
  if (env.NODE_ENV === 'development') {
    console.error('🚨 Error:', {
      code: appError.code,
      message: appError.message,
      stack: appError.stack,
      context: appError.context
    });
  }

  // En production, on ne renvoie pas les détails de l'erreur
  const response = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(env.NODE_ENV === 'development' && { context: appError.context })
    }
  };

  return NextResponse.json(response, { status: appError.statusCode });
}

type RouteHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<NextResponse> | NextResponse;

export function withErrorHandler(handler: RouteHandler) {
  return async function errorHandlerWrapper(
    req: NextRequest,
    ...args: unknown[]
  ): Promise<NextResponse> {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return errorHandler(error);
    }
  };
} 