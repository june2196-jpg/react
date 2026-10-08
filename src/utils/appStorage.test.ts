import { beforeEach, describe, expect, it } from 'vitest';
import {
  APP_STORAGE_KEY,
  MAX_PERSISTED_COMPONENTS,
  MAX_PERSISTED_STATE_LENGTH,
  MAX_PROMPT_HISTORY,
  loadAppState,
  saveAppState,
} from './appStorage';

describe('loadAppState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('기존 저장 데이터에서 API 키는 무시하고 Provider, 프롬프트 히스토리, 생성 결과를 복원한다', () => {
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

    expect(state.provider).toBe('anthropic');
    expect(state.promptHistory).toEqual(['프로필 카드']);
    expect(state.components[0]).toMatchObject({ id: 'component-1', prompt: '프로필 카드' });
    expect(state.components[0]?.createdAt).toEqual(new Date('2026-10-08T00:00:00.000Z'));
  });

  it('손상된 저장 데이터는 기본 상태로 복원한다', () => {
    localStorage.setItem(APP_STORAGE_KEY, '{invalid json');

    expect(loadAppState()).toEqual({
      provider: 'google',
      promptHistory: [],
      components: [],
    });
  });

  it('저장할 프롬프트와 컴포넌트 수를 제한한다', () => {
    const prompts = Array.from({ length: MAX_PROMPT_HISTORY + 1 }, (_, index) => `프롬프트 ${index}`);
    const components = Array.from({ length: MAX_PERSISTED_COMPONENTS + 1 }, (_, index) => ({
      id: `component-${index}`,
      prompt: `프롬프트 ${index}`,
      code: `render(<div>${index}</div>)`,
      createdAt: new Date('2026-10-08T00:00:00.000Z'),
    }));

    saveAppState({ provider: 'google', promptHistory: prompts, components });

    const saved = JSON.parse(localStorage.getItem(APP_STORAGE_KEY) ?? '{}');
    expect(saved.promptHistory).toHaveLength(MAX_PROMPT_HISTORY);
    expect(saved.components).toHaveLength(MAX_PERSISTED_COMPONENTS);
  });

  it('저장 크기 제한을 넘는 오래된 생성 결과는 제외한다', () => {
    saveAppState({
      provider: 'google',
      promptHistory: ['대시보드'],
      components: [
        {
          id: 'large-component',
          prompt: '대시보드',
          code: 'x'.repeat(MAX_PERSISTED_STATE_LENGTH),
          createdAt: new Date('2026-10-08T00:00:00.000Z'),
        },
      ],
    });

    const rawState = localStorage.getItem(APP_STORAGE_KEY) ?? '';
    expect(rawState.length).toBeLessThanOrEqual(MAX_PERSISTED_STATE_LENGTH);
    expect(JSON.parse(rawState).components).toEqual([]);
  });

  it('새로고침 복원에 필요한 상태를 localStorage에 저장한다', () => {
    saveAppState({
      provider: 'google',
      promptHistory: ['검색 필터'],
      components: [],
    });

    expect(localStorage.getItem(APP_STORAGE_KEY)).toBe(
      JSON.stringify({
        provider: 'google',
        promptHistory: ['검색 필터'],
        components: [],
      }),
    );
  });
});
