import { buildApiUrl } from '@/lib/api';
import type { TarotError, TarotRequest, TarotResponse } from '@/types';

interface SubmitTarotReadingParams {
  accessToken: string | null;
  requestBody: TarotRequest;
}

export async function submitTarotReading({
  accessToken,
  requestBody,
}: SubmitTarotReadingParams): Promise<TarotResponse> {
  const response = await fetch(buildApiUrl('/api/tarot'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),
    },
    body: JSON.stringify(requestBody),
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData: TarotError = await response.json().catch(() => ({
      error: '서버 오류가 발생했습니다.',
    }));
    throw new Error(errorData.error);
  }

  return response.json() as Promise<TarotResponse>;
}
