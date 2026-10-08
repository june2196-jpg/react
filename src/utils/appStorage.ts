import type { GeneratedComponent, Provider } from '../types';

export const APP_STORAGE_KEY = 'react-component-generator:app-state';
export const MAX_PROMPT_HISTORY = 20;
export const MAX_PERSISTED_COMPONENTS = 10;
export const MAX_PERSISTED_STATE_LENGTH = 1_000_000;

export interface PersistedAppState {
  provider: Provider;
  promptHistory: string[];
  components: GeneratedComponent[];
}

const defaultState: PersistedAppState = {
  provider: 'google',
  promptHistory: [],
  components: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProvider(value: unknown): value is Provider {
  return value === 'anthropic' || value === 'google';
}

function restoreComponent(value: unknown): GeneratedComponent | null {
  if (!isRecord(value)) return null;

  const { id, prompt, code, createdAt } = value;
  const restoredCreatedAt = typeof createdAt === 'string' ? new Date(createdAt) : null;

  if (
    typeof id !== 'string' ||
    typeof prompt !== 'string' ||
    typeof code !== 'string' ||
    !restoredCreatedAt ||
    Number.isNaN(restoredCreatedAt.getTime())
  ) {
    return null;
  }

  return { id, prompt, code, createdAt: restoredCreatedAt };
}

function limitStoredState(state: PersistedAppState): PersistedAppState {
  const limitedState: PersistedAppState = {
    provider: state.provider,
    promptHistory: state.promptHistory.slice(0, MAX_PROMPT_HISTORY),
    components: state.components.slice(0, MAX_PERSISTED_COMPONENTS),
  };

  while (JSON.stringify(limitedState).length > MAX_PERSISTED_STATE_LENGTH) {
    if (limitedState.components.length > 0) {
      limitedState.components.pop();
      continue;
    }

    if (limitedState.promptHistory.length > 0) {
      limitedState.promptHistory.pop();
      continue;
    }

    break;
  }

  return limitedState;
}

export function loadAppState(): PersistedAppState {
  try {
    const stored = localStorage.getItem(APP_STORAGE_KEY);
    if (!stored) return defaultState;

    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed)) return defaultState;

    return limitStoredState({
      provider: isProvider(parsed.provider) ? parsed.provider : 'google',
      promptHistory: Array.isArray(parsed.promptHistory)
        ? parsed.promptHistory.filter((prompt): prompt is string => typeof prompt === 'string')
        : [],
      components: Array.isArray(parsed.components)
        ? parsed.components.map(restoreComponent).filter((component): component is GeneratedComponent => component !== null)
        : [],
    });
  } catch {
    return defaultState;
  }
}

export function saveAppState(state: PersistedAppState): void {
  try {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(limitStoredState(state)));
  } catch {
    // 저장소 접근이 차단되거나 용량이 부족한 경우에도 생성 흐름은 유지한다.
  }
}

