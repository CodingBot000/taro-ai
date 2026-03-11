import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';
import type { BackendVersionResponse, TarotError } from '@/types';

export const maxDuration = 5;

function readLocalBackendVersion(): string | null {
  try {
    const appPyPath = join(process.cwd(), 'docs', 'app.py');
    const contents = readFileSync(appPyPath, 'utf-8');
    const match = contents.match(/APP_VERSION\s*=\s*["']([^"']+)["']/);
    return match?.[1] ?? null;
  } catch (error) {
    console.error('Local version read error:', error);
    return null;
  }
}

export async function GET() {
  const version = readLocalBackendVersion();

  if (!version) {
    return NextResponse.json(
      { error: '버전 정보를 불러오지 못했습니다.', code: 'UNKNOWN' } as TarotError,
      { status: 500 }
    );
  }

  return NextResponse.json({ version } as BackendVersionResponse);
}
