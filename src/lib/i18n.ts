// 다국어 지원 시스템
// 1차: 한국어, 이후 영어 등 확장 예정

export type Locale = 'ko' | 'en';

export const DEFAULT_LOCALE: Locale = 'ko';

const translations = {
  ko: {
    // 헤더 / 브랜딩
    siteName: '타로',
    siteSubtitle: 'AI가 읽어주는 당신의 별자리',

    // 리딩 타입
    readingTypeLabel: '리딩 방식 선택',
    oneCard: '원카드',
    oneCardDesc: '오늘의 운세',
    threeCard: '쓰리카드',
    threeCardDesc: '과거 / 현재 / 미래',

    // 카테고리 선택
    mainCategoryLabel: '질문 카테고리 선택',
    subCategoryLabel: '상황을 더 구체적으로 골라주세요',
    questionInputLabel: '질문 입력',
    questionInputHelpText: '상황을 한두 문장으로 적으면 해석이 더 정확해집니다.',
    subCategoryHint: '세부 상황을 고르면 질문 예시가 바뀝니다.',
    unknownSubCategoryHint: '괜찮아요. 가장 고민되는 상황을 그대로 적어주세요.',

    // 입력 폼
    questionPlaceholder: '궁금한 것을 물어보세요... (예: 이직해야 할까요?)',
    submitButton: '카드 뽑기',
    selectCardButton: '카드 선택하기',
    submitting: '뽑은 카드에 집중해주세요...',

    // 카드 선택 화면
    selectCards: '카드를 선택하세요',
    selectCardGuide_one: '마음이 끌리는 카드 한 장을 선택하세요',
    selectCardGuide_three: '첫 번째 = 과거, 두 번째 = 현재, 세 번째 = 미래',
    shuffleButton: '셔플',
    interpretButton: '해석하기',

    // 로딩 상태 (레거시 - 호환용)
    loadingTitle: '카드를 읽고 있어요',
    loadingMessages: [
      '뽑은 카드에 집중해주세요...',
      '별자리의 기운을 모으고 있어요...',
      '당신의 에너지를 읽고 있어요...',
      '카드가 메시지를 전하려 해요...',
      '우주의 답을 기다리고 있어요...',
    ],
    loadingNote: '첫 요청은 최대 1분 정도 걸릴 수 있어요',

    // 결과
    resultTitle: '리더의 해석',
    drawnCards: '뽑힌 카드',
    interpretation: '해석',
    readAgain: '다시 뽑기',
    newQuestion: '새 질문하기',

    // 에러
    errorTitle: '앗, 문제가 생겼어요',
    errorDefault: '잠시 후 다시 시도해주세요.',
    errorTimeout: 'AI가 응답하는 데 시간이 오래 걸리고 있어요. 잠시 후 다시 시도해주세요.',
    errorNetwork: '네트워크 연결을 확인해주세요.',

    // 푸터
    footerText: '본 타로는 AI 기반 엔터테인먼트 서비스입니다. 중요한 결정에 대해서는 전문가와 상담하세요.',
  },

  en: {
    siteName: 'Starlight Tarot',
    siteSubtitle: 'AI-Powered Tarot Readings',

    readingTypeLabel: 'Choose your reading',
    oneCard: 'One Card',
    oneCardDesc: "Today's Fortune",
    threeCard: 'Three Cards',
    threeCardDesc: 'Past / Present / Future',

    mainCategoryLabel: 'Choose a question category',
    subCategoryLabel: 'Choose the situation in more detail',
    questionInputLabel: 'Enter your question',
    questionInputHelpText: 'A short description of your situation helps the reading stay precise.',
    subCategoryHint: 'Pick a detailed situation to change the example question.',
    unknownSubCategoryHint: 'That is fine. Write the situation that feels most important to you.',

    questionPlaceholder: 'Ask your question... (e.g., Should I change jobs?)',
    submitButton: 'Draw Cards',
    selectCardButton: 'Select Cards',
    submitting: 'Please concentrate on the cards you have drawn...',

    selectCards: 'Select your cards',
    selectCardGuide_one: 'Choose one card that speaks to you',
    selectCardGuide_three: '1st = Past, 2nd = Present, 3rd = Future',
    shuffleButton: 'Shuffle',
    interpretButton: 'Interpret',

    loadingTitle: 'Starlight is reading your cards',
    loadingMessages: [
      'Please concentrate on the cards you have drawn...',
      'Gathering celestial energy...',
      'Reading your aura...',
      'The cards have a message...',
      'Awaiting cosmic guidance...',
    ],
    loadingNote: 'First reading may take up to a minute',

    resultTitle: "Starlight's Reading",
    drawnCards: 'Cards Drawn',
    interpretation: 'Interpretation',
    readAgain: 'Draw Again',
    newQuestion: 'New Question',

    errorTitle: 'Oops, something went wrong',
    errorDefault: 'Please try again in a moment.',
    errorTimeout: 'The AI is taking longer than usual. Please try again.',
    errorNetwork: 'Please check your network connection.',

    footerText: 'Starlight Tarot is an AI-based entertainment service. Please consult a professional for important decisions.',
  },
} as const;

export type TranslationKey = keyof typeof translations.ko;

export function t(key: TranslationKey, locale: Locale = DEFAULT_LOCALE): any {
  return translations[locale]?.[key] ?? translations.ko[key];
}

export function getTranslations(locale: Locale = DEFAULT_LOCALE) {
  return translations[locale] ?? translations.ko;
}
