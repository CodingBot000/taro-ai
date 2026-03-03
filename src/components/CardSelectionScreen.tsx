'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getTranslations, type Locale } from '@/lib/i18n';
import { generateDeck, shuffleDeck } from '@/lib/cardDeck';
import { CARD_BACK_IMAGE } from '@/lib/cardImageMap';
import type { ReadingType, CardSlot, SelectedCardPayload } from '@/types';

interface CardSelectionScreenProps {
  readingType: ReadingType;
  onConfirm: (selectedCards: SelectedCardPayload[]) => void;
  onBack: () => void;
  locale?: Locale;
}

const COLS = 9;
const CARD_W = 36;
const CARD_H = 54;
const GAP = 4;
const H_STEP = CARD_W + GAP;  // 40 — 겹침 없음
const V_STEP = CARD_H + GAP;  // 58 — 겹침 없음
const ROWS = Math.ceil(78 / COLS); // 9

// 그리드 실제 크기 (스케일 전)
const GRID_W = (COLS - 1) * H_STEP + CARD_W;
const GRID_H = (ROWS - 1) * V_STEP + CARD_H;

export default function CardSelectionScreen({
  readingType,
  onConfirm,
  onBack,
  locale = 'ko',
}: CardSelectionScreenProps) {
  const t = getTranslations(locale);
  const requiredCount = readingType === 'one-card' ? 1 : 3;

  const [deck, setDeck] = useState<CardSlot[]>(() => generateDeck());
  const [isSpread, setIsSpread] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // 반응형 스케일 계산
  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.parentElement?.clientWidth ?? window.innerWidth;
      const padding = 32;
      const available = parentWidth - padding;
      const newScale = Math.min(1, available / GRID_W);
      setScale(newScale);
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // 초기 펼침 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => setIsSpread(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const selectedCount = deck.filter(c => c.isSelected).length;
  const canConfirm = selectedCount === requiredCount;

  // 카드 탭 핸들러
  const handleCardTap = useCallback((index: number) => {
    if (isShuffling) return;

    setDeck(prev => {
      const next = prev.map(c => ({ ...c }));
      const card = next[index];

      if (readingType === 'one-card') {
        if (card.isSelected) {
          card.isSelected = false;
          card.selectionOrder = null;
        } else {
          // 기존 선택 해제 후 새로 선택
          next.forEach(c => { c.isSelected = false; c.selectionOrder = null; });
          next[index].isSelected = true;
          next[index].selectionOrder = 1;
        }
      } else {
        // 쓰리카드 모드
        if (card.isSelected) {
          const removedOrder = card.selectionOrder!;
          card.isSelected = false;
          card.selectionOrder = null;
          // 이후 순서 재정렬
          next.forEach(c => {
            if (c.isSelected && c.selectionOrder! > removedOrder) {
              c.selectionOrder = c.selectionOrder! - 1;
            }
          });
        } else {
          const currentSelected = next.filter(c => c.isSelected).length;
          if (currentSelected >= 3) return prev;
          card.isSelected = true;
          card.selectionOrder = currentSelected + 1;
        }
      }

      return next;
    });
  }, [isShuffling, readingType]);

  // 셔플
  const handleShuffle = useCallback(() => {
    if (isShuffling) return;
    setIsShuffling(true);
    setIsSpread(false); // 중앙으로 모임

    setTimeout(() => {
      setDeck(shuffleDeck());
      setTimeout(() => {
        setIsSpread(true);
        setIsShuffling(false);
      }, 100);
    }, 450);
  }, [isShuffling]);

  // 확인
  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    const selected = deck
      .filter(c => c.isSelected)
      .sort((a, b) => a.selectionOrder! - b.selectionOrder!)
      .map(c => ({ id: c.id, direction: c.direction }));
    onConfirm(selected);
  }, [canConfirm, deck, onConfirm]);

  // 각 카드의 그리드 위치 계산
  const getCardPosition = (index: number) => {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    return {
      left: col * H_STEP,
      top: row * V_STEP,
    };
  };

  // 중앙 좌표 (스택 상태)
  const centerX = (GRID_W - CARD_W) / 2;
  const centerY = (GRID_H - CARD_H) / 2;

  return (
    <div className="relative z-10 max-w-lg mx-auto px-4 animate-fade-in">
      {/* 안내 텍스트 */}
      <div className="text-center mb-4">
  
        <p className="text-sm text-gold-400 font-body">
          {readingType === 'one-card' ? t.selectCardGuide_one : t.selectCardGuide_three}
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="flex justify-center mb-6">
        <div
          ref={containerRef}
          style={{
            width: GRID_W,
            height: GRID_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
          className="relative"
        >
          {deck.map((card, index) => {
            const pos = getCardPosition(index);
            const isStacked = !isSpread;

            return (
              <button
                key={`${card.id}-${index}`}
                type="button"
                className={`selection-card ${card.isSelected ? 'selected' : ''}`}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  left: 0,
                  top: 0,
                  transform: isStacked
                    ? `translate(${centerX}px, ${centerY}px) scale(0.85)`
                    : `translate(${pos.left}px, ${pos.top}px)${card.isSelected ? ' translateY(-12px)' : ''}`,
                  transitionDelay: isStacked ? '0ms' : `${index * 15}ms`,
                  zIndex: card.isSelected ? 90 : index,
                }}
                onClick={() => handleCardTap(index)}
                disabled={isShuffling}
              >
                <img
                  src={CARD_BACK_IMAGE}
                  alt="카드"
                  className="w-full h-full object-cover rounded pointer-events-none select-none"
                  style={{
                    border: '1px solid rgba(139, 61, 255, 0.35)',
                    borderRadius: 4,
                  }}
                  draggable={false}
                />
                {/* 선택 순서 뱃지 (쓰리카드) */}
                {card.isSelected && card.selectionOrder && readingType === 'three-card' && (
                  <span className="order-badge">{card.selectionOrder}</span>
                )}
                {/* 원카드 선택 표시 */}
                {card.isSelected && readingType === 'one-card' && (
                  <span className="order-badge">✦</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 그리드 아래 여백 (스케일로 인한 높이 보정) */}
      <div style={{ height: GRID_H * scale - GRID_H + 16 }} />

      {/* 해석하기 버튼 */}
      <div className="text-center mb-6">
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="glow-button font-body"
        >
          <span className="flex items-center justify-center gap-2">
            <span>✦</span>
            {t.interpretButton}
            <span>✦</span>
          </span>
        </button>
      </div>

      {/* 뒤로가기 */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors font-body"
        >
          ← 질문 수정하기
        </button>
      </div>

      {/* 셔플 버튼 (우하단 고정) */}
      <button
        onClick={handleShuffle}
        disabled={isShuffling}
        className="shuffle-button"
        title={t.shuffleButton}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
      </button>
    </div>
  );
}
