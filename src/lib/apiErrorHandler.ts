import { NextResponse } from 'next/server';

export interface APIErrorDetails {
  [key: string]: unknown;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public details?: APIErrorDetails
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function handleAPIError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        status: error.status
      },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout', status: 504 },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: error.message, status: 500 },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error', status: 500 },
    { status: 500 }
  );
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new APIError('Request timeout', 504));
      });
    })
  ]);
}
