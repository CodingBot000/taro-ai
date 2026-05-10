/**
 * 카드 ID → 이미지 경로 매핑
 * ID는 백엔드(app.py)의 TAROT_CARDS 키와 동일
 * 다국어 확장 시에도 ID는 변하지 않음
 */

export const CARD_BACK_IMAGE = '/cards/CardBacks.jpg';

const MAJOR_ARCANA_FILES: Record<string, string> = {
  major_00: '00-TheFool.jpg',
  major_01: '01-TheMagician.jpg',
  major_02: '02-TheHighPriestess.jpg',
  major_03: '03-TheEmpress.jpg',
  major_04: '04-TheEmperor.jpg',
  major_05: '05-TheHierophant.jpg',
  major_06: '06-TheLovers.jpg',
  major_07: '07-TheChariot.jpg',
  major_08: '08-Strength.jpg',
  major_09: '09-TheHermit.jpg',
  major_10: '10-WheelOfFortune.jpg',
  major_11: '11-Justice.jpg',
  major_12: '12-TheHangedMan.jpg',
  major_13: '13-Death.jpg',
  major_14: '14-Temperance.jpg',
  major_15: '15-TheDevil.jpg',
  major_16: '16-TheTower.jpg',
  major_17: '17-TheStar.jpg',
  major_18: '18-TheMoon.jpg',
  major_19: '19-TheSun.jpg',
  major_20: '20-Judgement.jpg',
  major_21: '21-TheWorld.jpg',
};

// 마이너 아르카나: suit + 2자리 숫자 → {Suit}{num}.jpg
const MINOR_SUIT_MAP: Record<string, string> = {
  wands: 'Wands',
  cups: 'Cups',
  swords: 'Swords',
  pentacles: 'Pentacles',
};

export function getCardImagePath(cardId: string): string {
  // 메이저 아르카나
  if (cardId.startsWith('major_')) {
    const file = MAJOR_ARCANA_FILES[cardId];
    if (file) return `/cards/major/${file}`;
  }

  // 마이너 아르카나 (e.g. "wands_01" → "Wands01.jpg")
  const match = cardId.match(/^(wands|cups|swords|pentacles)_(\d{2})$/);
  if (match) {
    const suit = MINOR_SUIT_MAP[match[1]];
    return `/cards/minor/${suit}${match[2]}.jpg`;
  }

  return CARD_BACK_IMAGE;
}
