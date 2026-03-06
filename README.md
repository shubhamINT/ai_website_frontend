# AI Website Frontend

Next.js frontend for the AI-assisted website experience. The project is structured inside `app/` so routes, assistant UI, hooks, and shared helpers stay close to the App Router while still being split into maintainable modules.

## Architecture

### Runtime Flow

1. `app/landing/page.tsx` renders the landing route.
2. `app/dynamic/page.tsx` starts the active assistant experience.
3. `app/hooks/useLiveKitConnection.ts` fetches the LiveKit token.
4. `app/hooks/useAgentMessages.ts` listens for LiveKit transcription and data events.
5. `app/hooks/_lib/parsers/message-factories.ts` converts raw payloads into typed UI messages.
6. `app/dynamic/_components/shell/AgentVisualStage.tsx` selects the correct renderer.
7. assistant UI is rendered from focused modules under `app/dynamic/_components/`.

### Folder Structure

```text
ai_website_frontend/
├── app/
│   ├── _shared/
│   │   └── media/
│   ├── api/
│   │   └── health/
│   ├── dynamic/
│   │   ├── _components/
│   │   │   ├── audio/
│   │   │   ├── background/
│   │   │   ├── cards/
│   │   │   ├── forms/
│   │   │   │   ├── contact/
│   │   │   │   ├── job-application/
│   │   │   │   └── meeting/
│   │   │   ├── maps/
│   │   │   ├── media/
│   │   │   └── shell/
│   │   └── page.tsx
│   ├── hooks/
│   │   ├── _lib/
│   │   │   ├── livekit/
│   │   │   ├── parsers/
│   │   │   └── storage/
│   │   ├── agentTypes.ts
│   │   ├── topics.ts
│   │   ├── useAgentInteraction.ts
│   │   ├── useAgentMessages.ts
│   │   ├── useAudioFFT.ts
│   │   ├── useContextSync.ts
│   │   ├── useInteractionControl.ts
│   │   ├── useLiveKitConnection.ts
│   │   └── useLocationPublishing.ts
│   ├── landing/
│   │   ├── _components/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── pixabay/
├── livekit_modular/            # isolated legacy / experimental flow
├── docs/
│   └── deployment.md
└── Dockerfile
```

## Ownership Rules

### `app/dynamic/`

Put route-specific assistant UI here.

- `shell/` for orchestration components
- `forms/` for business interaction views
- `maps/` for map-heavy visual modules
- `cards/` for flashcard rendering
- `media/` and `audio/` for reusable assistant presentation pieces

### `app/hooks/`

Put active assistant runtime logic here.

- stateful hooks stay at the top level
- parser, storage, and publish helpers stay in `app/hooks/_lib/`
- shared assistant types and topic constants stay in `app/hooks/agentTypes.ts` and `app/hooks/topics.ts`

### `app/_shared/`

Put code here only when it is reused across multiple routes like `landing` and `dynamic`.

### `lib/`

Put external API clients and integration-focused utilities here.

## Assistant Contracts

Topic constants live in `app/hooks/topics.ts`.

Current handled topics:

- `ui.flashcard`
- `ui.text`
- `user.details`
- `ui.location_request`
- `ui.contact_form`
- `ui.meeting_form`
- `ui.global_presense`
- `ui.nearby_offices`
- `ui.job_application`
- `ui.context`
- `user.context`
- `user.location`
- `lk.chat`

When adding a new assistant UI message:

1. define the payload shape in `app/hooks/agentTypes.ts`
2. add message parsing in `app/hooks/_lib/parsers/`
3. build the visual renderer in `app/dynamic/_components/`
4. register the renderer in `app/dynamic/_components/shell/AgentVisualStage.tsx`

## Storage Contract

Persistent visitor identity is managed in `app/hooks/_lib/storage/userInfo.storage.ts`.

- localStorage key: `user_info`
- shape: `user_name`, `user_email`, `user_phone`, `user_id`
- route components should not use raw `localStorage` directly for this contract

## Development Rules

- keep route files thin
- keep parsing and transport logic out of render components
- keep assistant topics centralized in `app/hooks/topics.ts`
- keep shared code in `app/_shared/` only when it is reused across routes
- keep `livekit_modular/` isolated unless there is an explicit merge decision

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm exec tsc --noEmit
```

## Verification

Refactor verification completed with:

- `pnpm exec tsc --noEmit`
- `pnpm build`
- `pnpm exec eslint app lib`

Note: ESLint still reports a few non-blocking `@next/next/no-img-element` warnings in remote-media-driven components where direct image rendering is intentional for now.

## Deployment

Deployment instructions are documented in `docs/deployment.md`.
