import { API_URL, isApiConfigured } from './config';

export type TransformResult = { result: string; tone: string; use_case: string | null };

export class ApiNotConfiguredError extends Error {}
export class TransformApiError extends Error {}

function isTransformResult(value: unknown): value is TransformResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  return (
    typeof result.result === 'string' &&
    typeof result.tone === 'string' &&
    (result.use_case === null || typeof result.use_case === 'string')
  );
}

export async function transformText(
  text: string,
  tone: string,
  useCase: string | null,
): Promise<TransformResult> {
  if (!isApiConfigured) {
    throw new ApiNotConfiguredError(
      'Set EXPO_PUBLIC_API_URL in your .env to the address of your running FastAPI server.',
    );
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/transform`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tone, use_case: useCase }),
    });
  } catch {
    // Same "server unreachable" case script.js catches via TypeError —
    // almost always means the phone can't see EXPO_PUBLIC_API_URL.
    throw new TransformApiError(
      'Could not reach the server. Confirm uvicorn is running and EXPO_PUBLIC_API_URL points at your computer\u2019s LAN IP.',
    );
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // response wasn't JSON
  }

  if (!response.ok) {
    const message = data?.error ?? `Server responded ${response.status}`;
    throw new TransformApiError(message);
  }

  if (!isTransformResult(data)) {
    throw new TransformApiError('The server returned an invalid transform response.');
  }

  return data;
}
