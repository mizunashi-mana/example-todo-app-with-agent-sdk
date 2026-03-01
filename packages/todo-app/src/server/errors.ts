import type { Context } from 'hono';

export type ErrorCode
  = | 'INVALID_JSON'
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'OLLAMA_CONNECTION_ERROR'
    | 'AGENT_ERROR'
    | 'INTERNAL_ERROR';

interface ErrorBody {
  error: {
    code: ErrorCode;
    message: string;
  };
}

type StatusCode = 400 | 404 | 500 | 502;

export function errorResponse(c: Context, status: StatusCode, code: ErrorCode, message: string) {
  const body: ErrorBody = { error: { code, message } };
  return c.json(body, status);
}
