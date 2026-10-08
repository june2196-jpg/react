# Server Rules

## Module Context

This Bun server owns provider requests and converts model output into code that `react-live` can execute. It is the only layer that reads environment API keys.

## Local Rules

- Keep API-key resolution inside `resolveApiKey`; it accepts an explicitly supplied client key or the corresponding environment key (`server/index.ts:64-66`). Do not log, return, or include resolved keys in error responses.
- `/api/config` must continue to return only key-presence booleans (`server/index.ts:147-156`). The frontend uses these to select UI behavior without receiving secrets.
- Apply `CORS_HEADERS` to every API response path, including validation and provider errors (`server/index.ts:51-55`, `server/index.ts:171-209`).
- Preserve `stripCodeFences` then `ensureRenderCall` order when returning generated code (`server/index.ts:188`). Reversing or skipping either breaks model outputs that contain fences or lack `render(...)`.
- Keep Google calls behind `withModelFallback` and retain the declared model-order list (`server/index.ts:5`, `server/index.ts:134-135`).
- Generated code remains plain JavaScript with inline styles and no imports, matching the system prompt consumed by the live preview (`server/index.ts:6-19`).

## Testing Strategy

- Keep parsing and fallback logic side-effect-free in `generator.ts` and `fallback.ts`; their separation from `Bun.serve` is what makes them unit-testable (`server/generator.ts:1-3`).
- Add or update `generator.test.ts` for output normalization changes and `fallback.test.ts` for retry-order or error-propagation changes. Run `bun run test`.
