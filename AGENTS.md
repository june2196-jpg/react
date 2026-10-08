# Agent Rules

## Operational Commands

- Use Bun for package and script operations: `bun install`, `bun run dev`, `bun run build`, `bun run lint`, and `bun run test`.
- `bun run dev` starts the Bun API server and Vite together. The API server listens on port 3002; Vite proxies `/api` requests there (`vite.config.ts:7-12`).
- Run `bun run test` after changes to `server/generator.ts`, `server/fallback.ts`, or `src/components/PromptInput.tsx`; those are the currently unit-tested behavior boundaries.

## Golden Rules

- Keep provider API calls and environment API keys on the Bun server. `ENV_KEYS` reads process environment variables and `/api/config` exposes only booleans, not key values (`server/index.ts:59-63`, `server/index.ts:147-156`). Do not add provider calls or environment-key access to `src/`.
- Preserve the generated-code normalization pipeline. `react-live` requires a `render(...)` call, so generated text must continue through `stripCodeFences` and `ensureRenderCall` before it is returned (`server/index.ts:1`, `server/index.ts:188`; `server/generator.ts:13-23`).
- Preserve the generated component contract: self-contained plain JavaScript with no imports or CSS imports, followed by `render(<Component />)` (`server/index.ts:6-19`). Changes to that contract require matching parser and preview updates.
- Keep Google model fallback behavior ordered and fail with the final error only after every model fails (`server/index.ts:135`, `server/fallback.ts:3-18`). Update `server/fallback.test.ts` with fallback changes.
- Keep frontend requests relative to `/api`; direct provider URLs bypass the local proxy and server-side key boundary (`src/hooks/useComponentGenerator.ts:23-27`, `vite.config.ts:7-12`).

## TDD Rule

**이 규칙은 Rigid — 상황에 맞게 변형하지 마라.** 이 섹션은 전역 기본값이다. 하위 디렉터리의 `AGENTS.md`에 별도 TDD 규칙이 있으면 하위 규칙을 우선 적용한다.

### 적용 기준

**반드시 TDD를 적용한다.**

- 비즈니스 로직
- API
- 유틸리티 함수
- 버그 수정

**TDD가 불필요하다.**

- 타입 정의
- 설정 파일
- 순수 UI 변경
- SQL

### RED-GREEN-REFACTOR

1. **RED**: 하나의 동작에 하나의 테스트만 작성한다. 반드시 실행해 실패를 확인하고, 실패 이유가 **기능 미구현**임을 확인한다.
2. **GREEN**: 테스트를 통과시키는 최소한의 코드만 작성한다. **YAGNI**를 지키고, 신규 테스트와 기존 테스트가 모두 통과하는지 확인한다.
3. **REFACTOR**: 중복 제거, 이름 개선, 헬퍼 추출만 수행한다. 테스트를 green 상태로 유지하고, 새 동작을 추가하지 않는다.
4. **반복**: 다음 동작에 대한 RED로 돌아간다.

### 삭제 강제 규칙

- 테스트 전에 프로덕션 코드를 먼저 작성했다면 **반드시 삭제**하고 RED부터 다시 시작한다.
- 나중에 참고하려는 목적이라도 프로덕션 코드를 남기지 않는다.

### 변명 차단표

| 변명 | 반론 |
| --- | --- |
| 너무 단순해서 테스트 불필요 | 단순한 동작도 계약이다. 가장 작은 테스트로 계약을 고정한다. |
| 나중에 추가하겠다 | 테스트 없는 코드는 나중에도 검증 기준이 없다. 지금 RED를 만든다. |
| 시간이 없다 | 결함을 재현·수정하는 시간이 더 크다. 최소 동작 하나부터 테스트한다. |
| 삭제하면 낭비 | 검증되지 않은 선행 구현은 매몰비용이다. 삭제하고 요구사항을 테스트로 다시 표현한다. |
| 프로토타입이다 | 프로토타입도 동작을 바꾸면 된다. 바뀌는 로직과 API에는 TDD를 적용한다. |

## Project Context

Prompt-driven React component generator with immediate live preview and source inspection.

Stack: React 19, TypeScript, Vite, Bun, react-live, Vitest.

## Standards and References

- Keep TypeScript types shared through `src/types/index.ts`; the provider union must stay aligned with the server provider handling (`src/types/index.ts:1`, `server/index.ts:57`).
- Follow the repository commit skill: use Korean Conventional Commit messages in the form `feat: 요약`, `fix: 요약`, `refactor: 요약`, or `chore: 요약`.
- When code behavior makes a rule obsolete or incomplete, propose an update to the relevant `AGENTS.md` in the same change.

## Context Map

- **[Bun API, providers, generated-code normalization](./server/AGENTS.md)** — API routes, provider calls, fallback, and server-side tests.
- **[React UI, Vite proxy consumers, live preview](./src/AGENTS.md)** — components, hooks, styling, and frontend tests.
