import { describe, expect, it } from 'vitest';
import { isPromptWithinLimit } from './promptValidation';

describe('isPromptWithinLimit', () => {
  it('500자 프롬프트는 유효하다고 판단한다', () => {
    expect(isPromptWithinLimit('가'.repeat(500))).toBe(true);
  });

  it('501자 프롬프트는 유효하지 않다고 판단한다', () => {
    expect(isPromptWithinLimit('가'.repeat(501))).toBe(false);
  });
});
