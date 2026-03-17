# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps + generate Prisma client + migrate DB
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run dev:daemon   # Start dev server in background, logs to logs.txt
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest unit tests (watch mode)
npm run db:reset     # Reset SQLite database
```

Run a single test file:
```bash
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx
```

## Architecture

**UIGen** is a Next.js 15 App Router app where users describe React components in chat and Claude AI generates them in real-time with live preview.

### Core Concepts

**Virtual File System** (`src/lib/file-system.ts`): Files exist only in memory — never written to disk. `VirtualFileSystem` class manages an in-memory file tree that serializes to JSON for persistence in Prisma's `Project.data` column.

**AI Integration** (`src/app/api/chat/route.ts`): Uses Vercel AI SDK `streamText()` with Claude (model configured in `src/lib/provider.ts`). The AI has two tools:
- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — modify file content
- `file_manager` (`src/lib/tools/file-manager.ts`) — create/delete files

The system prompt is in `src/lib/prompts/generation.tsx`.

**Preview Rendering** (`src/components/preview/PreviewFrame.tsx`): Renders generated components in an `<iframe>`. The pipeline is: `PreviewFrame` → `src/lib/transform/jsx-transformer.ts` which uses Babel standalone to compile JSX/TSX at runtime, creates blob URLs for each file, builds an ES module import map (with `@/` alias support), and resolves third-party imports via `esm.sh`. The final HTML is injected into the iframe — no build step needed.

**Anonymous Work Persistence** (`src/lib/anon-work-tracker.ts`): Before auth, the user's messages and virtual FS are saved to `sessionStorage`. After sign-in/sign-up, `HeaderActions` reads this and offers to save the work as a new project.

**Component Generation Flow:**
1. User sends message → API route receives virtual FS snapshot + message history
2. Claude streams response with tool calls to modify virtual FS
3. Updated FS serialized back to client, saved to Prisma if authenticated
4. PreviewFrame recompiles and re-renders

### State Management

Two React contexts:
- `src/lib/contexts/file-system-context.tsx` — virtual FS state, selected file
- `src/lib/contexts/chat-context.tsx` — message history, streaming state

### Auth

JWT sessions via HTTP-only cookies (`src/lib/auth.ts`). `src/middleware.ts` protects API routes. Server actions in `src/actions/` handle auth + project CRUD. Anonymous users can generate components without persistence.

### Database

Prisma + SQLite. Two models: `User` (email/password with bcrypt) and `Project` (stores messages as JSON string and virtual FS as JSON string in `data` column).

### Environment

`ANTHROPIC_API_KEY` in `.env` is optional. Without it, `MockLanguageModel` (`src/lib/provider.ts`) returns static responses for demo/development.

## Key File Locations

| Purpose | Path |
|---|---|
| AI chat endpoint | `src/app/api/chat/route.ts` |
| AI system prompt | `src/lib/prompts/generation.tsx` |
| Virtual file system | `src/lib/file-system.ts` |
| AI provider config | `src/lib/provider.ts` |
| JWT auth utils | `src/lib/auth.ts` |
| Main layout (resizable panels) | `src/app/main-content.tsx` |
| Preview iframe renderer | `src/components/preview/PreviewFrame.tsx` |
| Prisma schema | `prisma/schema.prisma` |
