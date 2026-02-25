export function validateQuestion(question: string): {
  isValid: boolean;
  errorMessage: string;
} {
  const text = question.trim();

  if (!text) {
    return { isValid: false, errorMessage: "질문을 입력해주세요." };
  }

  if (text.length <= 2) {
    return {
      isValid: false,
      errorMessage: "조금 더 구체적으로 질문해주세요. 예: '이직해야 할까요?', '연애운이 궁금해요'",
    };
  }

  // 한글 자음/모음만 (ㅋㅋㅋ, ㅎㅎ, ㅇㅇ 등)
  if (/^[ㄱ-ㅎㅏ-ㅣ\s!?.,]+$/.test(text)) {
    return {
      isValid: false,
      errorMessage: "질문을 문장으로 입력해주세요. 예: '오늘 하루 어떨까요?'",
    };
  }

  // 같은 글자만 반복
  if (/^(.)\1+$/.test(text)) {
    return { isValid: false, errorMessage: "질문을 문장으로 입력해주세요." };
  }

  // 특수문자·숫자만
  if (/^[\W\d_]+$/u.test(text)) {
    return {
      isValid: false,
      errorMessage: "질문을 한국어 문장 형태로 입력해주세요.",
    };
  }

  return { isValid: true, errorMessage: "" };
}
