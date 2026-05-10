import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: '타로 | AI 타로 리딩',
  description: 'AI가 읽어주는 당신의 타로 카드. 원카드, 쓰리카드 리딩으로 오늘의 운세를 확인하세요.',
  keywords: ['타로', '타로 카드', 'AI 타로', '운세', '타로 리딩'],
  openGraph: {
    title: '타로 | AI 타로 리딩',
    description: 'AI가 읽어주는 당신의 타로 카드',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
