import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import { loadAppState, saveAppState } from './utils/appStorage';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [initialState] = useState(loadAppState);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<Provider>(initialState.provider);
  const [promptHistory, setPromptHistory] = useState(initialState.promptHistory);
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator(initialState.components);

  useEffect(() => {
    saveAppState({ provider, promptHistory, components });
  }, [provider, promptHistory, components]);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = async (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    const generated = await generate(prompt, apiKey || undefined, provider);
    if (generated) {
      setPromptHistory((previousHistory) => [
        prompt,
        ...previousHistory.filter((historyPrompt) => historyPrompt !== prompt),
      ]);
    }
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setApiKey('');
  };

  const activeProvider = PROVIDER_CONFIG[provider].label;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-mark">RC</div>
        <div className="header-copy">
          <span className="eyebrow">Component forge / v1.0</span>
          <h1>프롬프트로 조립하는<br />React 인터페이스.</h1>
          <p>요청을 입력하면 즉시 컴포넌트를 만들고, 작업대에서 결과와 코드를 확인합니다.</p>
        </div>
        <div className="header-meta" aria-label="현재 작업 상태">
          <div>
              <span>엔진</span>
            <strong>{activeProvider}</strong>
          </div>
          <div>
              <span>아웃풋</span>
            <strong>{components.length}</strong>
          </div>
        </div>
      </header>

      <main className="workspace">
        <section className="composer-panel" aria-label="컴포넌트 생성">
          <PromptInput
            onGenerate={handleGenerate}
            isLoading={isLoading}
            history={promptHistory}
          />
        </section>

        <aside className="settings-panel" aria-label="실행 설정">
          <div className="settings-header">
            <span className="panel-kicker">Control deck</span>
            <h2>생성 엔진</h2>
          </div>
          <div className="provider-select">
            <label htmlFor="provider">Provider</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as Provider)}
            >
              {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="api-key-input">
            <label htmlFor="api-key">
              API Key
            </label>
            <div className="api-key-field">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  hasEnvKey
                    ? '서버 키 사용 중 (직접 입력으로 덮어쓰기 가능)'
                    : PROVIDER_CONFIG[provider].placeholder
                }
              />
              <button
                className="btn-toggle-key"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
            <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
              {hasEnvKey ? '.env 키가 연결되어 있습니다.' : '직접 입력하거나 서버 환경변수를 설정하세요.'}
            </p>
          </div>
        </aside>
      </main>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      <section className="results-section">
        {components.length > 0 && (
          <div className="results-header">
            <div>
              <span className="panel-kicker">Output bay</span>
              <h2>생성 결과</h2>
            </div>
            <button className="btn-clear" onClick={clearAll}>
              전체 삭제
            </button>
          </div>
        )}

        {components.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-preview" aria-hidden="true">
              <div className="empty-window">
                <span />
                <span />
                <span />
              </div>
              <div className="empty-canvas">
                <div className="empty-card empty-card--primary" />
                <div className="empty-card" />
                <div className="empty-card empty-card--wide" />
              </div>
            </div>
            <div className="empty-copy">
              <span className="empty-status">대기 중</span>
              <h2>첫 번째 인터페이스를<br />작업대에 올려보세요.</h2>
              <p>위 입력창에 원하는 화면을 적으면, 이곳에서 바로 조립 결과를 확인할 수 있습니다.</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-card">
            <div className="loading-pulse" />
            <p>컴포넌트를 생성하고 있습니다...</p>
          </div>
        )}

        <div className="results-grid">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRemove={removeComponent}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
