import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';
import { READING_TYPE_MAP, type ReadingType, type TarotResponse, type TarotError } from '@/types';

// Vercel Serverless Function 타임아웃 설정 (Pro: 300초, Hobby: 60초)
// ZeroGPU cold start + 생성 시간 고려
export const maxDuration = 120;

// 간단한 rate limiting (메모리 기반, Vercel serverless에서는 인스턴스당)
const requestLog = new Map<string, number[]>();
const RATE_LIMIT = 10; // IP당 분당 최대 요청
const RATE_WINDOW = 60 * 1000; // 1분

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_WINDOW);
  requestLog.set(ip, recent);

  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', code: 'RATE_LIMITED' } as TarotError,
        { status: 429 }
      );
    }

    // 요청 파싱
    const body = await request.json();
    const { question, readingType } = body as { question: string; readingType: ReadingType };

    // 입력 유효성 검사
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: '질문을 입력해주세요.', code: 'INVALID_QUESTION' } as TarotError,
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: '질문은 500자 이내로 입력해주세요.', code: 'QUESTION_TOO_LONG' } as TarotError,
        { status: 400 }
      );
    }

    if (!readingType || !READING_TYPE_MAP[readingType]) {
      return NextResponse.json(
        { error: '올바른 리딩 타입을 선택해주세요.', code: 'INVALID_READING_TYPE' } as TarotError,
        { status: 400 }
      );
    }

    // HuggingFace 토큰 확인
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      console.error('HF_TOKEN is not set');
      return NextResponse.json(
        { error: '서버 설정 오류입니다.', code: 'SERVER_CONFIG_ERROR' } as TarotError,
        { status: 500 }
      );
    }

    // Gradio Space 호출
    const spaceUrl = process.env.HF_SPACE_URL!;
    const client = await Client.connect(spaceUrl, {
      hf_token: hfToken as `hf_${string}`,
    });

    const result = await client.predict('/generate_reading', {
      question: question.trim(),
      reading_type: READING_TYPE_MAP[readingType],
    });

    const data = result.data as string[];

    // data[2]: 카드 JSON (id, name, direction 포함)
    let cardData = [];
    try {
      cardData = JSON.parse(data[2] || '[]');
    } catch {
      cardData = [];
    }

    const response: TarotResponse = {
      cards: data[0] || '',
      interpretation: data[1] || '',
      cardData,
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Tarot API Error:', error);

    // 타임아웃 에러 처리
    if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      return NextResponse.json(
        { error: 'AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.', code: 'TIMEOUT' } as TarotError,
        { status: 504 }
      );
    }

    // Gradio Space 비활성 상태
    if (error.message?.includes('sleeping') || error.message?.includes('not running')) {
      return NextResponse.json(
        { error: 'AI 서비스가 준비 중입니다. 1~2분 후 다시 시도해주세요.', code: 'SPACE_SLEEPING' } as TarotError,
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다.', code: 'UNKNOWN' } as TarotError,
      { status: 500 }
    );
  }
}
