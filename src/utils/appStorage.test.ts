import { beforeEach, describe, expect, it } from 'vitest';
import { APP_STORAGE_KEY, loadAppState, saveAppState } from './appStorage';

describe('loadAppState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 API 키, Provider, 프롬프트 히스토리, 생성 결과를 복원한다', () => {
    localStorage.setItem(
      APP_STORAGE_KEY,
      JSON.stringify({
        apiKey: 'test-api-key',
        provider: 'anthropic',
        promptHistory: ['프로필 카드'],
        components: [
          {
            id: 'component-1',
            prompt: '프로필 카드',
            code: 'render(<div />)',
            createdAt: '2026-10-08T00:00:00.000Z',
          },
        ],
      }),
    );

    const state = loadAppState();

    expect(state.apiKey).toBe('test-api-key');
    expect(state.provider).toBe('anthropic');
    expect(state.promptHistory).toEqual(['프로필 카드']);
    expect(state.components[0]).toMatchObject({ id: 'component-1', prompt: '프로필 카드' });
    expect(state.components[0]?.createdAt).toEqual(new Date('2026-10-08T00:00:00.000Z'));
  });

  it('손상된 저장 데이터는 기본 상태로 복원한다', () => {
    localStorage.setItem(APP_STORAGE_KEY, '{invalid json');

    expect(loadAppState()).toEqual({
      apiKey: '',
      provider: 'google',
      promptHistory: [],
      components: [],
    });
  });

  it('새로고침 복원에 필요한 상태를 localStorage에 저장한다', () => {
    saveAppState({
      apiKey: 'test-api-key',
      provider: 'google',
      promptHistory: ['검색 필터'],
      components: [],
    });

    expect(localStorage.getItem(APP_STORAGE_KEY)).toBe(
      JSON.stringify({
        apiKey: 'test-api-key',
        provider: 'google',
        promptHistory: ['검색 필터'],
        components: [],
      }),
    );
  });
});
