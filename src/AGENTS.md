# Frontend Rules

## Module Context

This React application collects prompts and optional user-supplied keys, then displays generated code through `react-live`. It communicates only with the local `/api` surface.

## Local Rules

- Use relative `/api` paths for configuration and generation. Vite maps them to the Bun server, preserving the provider-key boundary (`src/App.tsx:25`, `src/hooks/useComponentGenerator.ts:23-27`, `vite.config.ts:7-12`).
- Keep an entered API key in component state and include it only when non-empty (`src/App.tsx:14`, `src/hooks/useComponentGenerator.ts:27`). Do not add browser persistence for it.
- Keep `Provider` values aligned with the server provider union and configuration map (`src/types/index.ts:1`, `src/App.tsx:8-11`, `server/index.ts:57-63`).
- Generated output must be rendered through `LiveProvider` with `noInline`; this matches the server-side `render(...)` normalization contract (`src/components/LivePreview.tsx:11-16`, `server/generator.ts:13-23`).
- Maintain loading-state cleanup in the `finally` branch so failed and successful requests both re-enable generation (`src/hooks/useComponentGenerator.ts:45-47`).

## Testing Strategy

- `PromptInput` is the tested interaction boundary. Keep coverage for disabled empty prompts, submission behavior, and loading state when changing the input or submit flow (`src/components/PromptInput.test.tsx:7-28`).
- Run `bun run test` after frontend interaction changes.
