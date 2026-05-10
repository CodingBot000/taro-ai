import { describe, expect, it } from 'vitest';
import { validateQuestion } from '../validateQuestion';

describe('validateQuestion', () => {
  it('accepts concrete Korean questions', () => {
    expect(validateQuestion('이직을 준비해도 괜찮을까요?')).toEqual({
      isValid: true,
      errorMessage: '',
    });
  });

  it('rejects empty or too short questions', () => {
    expect(validateQuestion('   ').isValid).toBe(false);
    expect(validateQuestion('응?').isValid).toBe(false);
  });

  it('rejects consonant-only and symbol-only input', () => {
    expect(validateQuestion('ㅋㅋㅋㅋ').isValid).toBe(false);
    expect(validateQuestion('12345!!').isValid).toBe(false);
  });
});
