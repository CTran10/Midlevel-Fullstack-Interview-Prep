# Mid-Level Full-Stack Interview Prep

A local-first Next.js study app for full-stack and backend interview practice. It combines spaced-repetition flashcards, mock interview prompts, factual reading notes, system-design walkthroughs, and an LLM-ready readiness export.

The project is intentionally small: no backend, no auth, no tracking, no external API calls, and no required environment variables. Study progress is stored in browser LocalStorage.

## What It Covers

- Backend fundamentals: HTTP, REST, Django, Postgres, transactions, locking, indexing, queues, caching, rate limits, and Redis.
- Full-stack product work: API endpoint design, frontend state, forms, loading states, validation, Angular-oriented concepts, and user-facing failure handling.
- Production readiness: testing strategy, observability, debugging, AWS/infrastructure basics, idempotency, retries, and reliability tradeoffs.
- System design practice: booking-system examples, read/write paths, source-of-truth decisions, stale data tolerance, and operational constraints.
- Interview leveling: prompts and explanations are written to encourage mid-level answers with tradeoffs, constraints, failure modes, and ownership signals.

## Study Modes

- `Study`: active-recall cards with examples, 60-second answer prompts, and Again / Hard / Good / Easy ratings.
- `Mock`: random interview prompts with a timer and hidden answers.
- `Read`: factual notes, interview-ready lines, tradeoff lenses, pitfalls, and guided examples.
- `Progress`: deck-level review counts, due cards, weak areas, and next study recommendations.

## Decks And Content

- Booking platform full-stack deck: Django, Postgres, performance, testing, system design, AWS/infra, and behavioral prompts.
- Booking platform extended drill bank: imported from the included markdown source for deeper ORM, booking-system, Angular, AWS, Terraform, and behavioral practice.
- Delivery platform backend deck: HTTP/REST, databases, Redis/caching, queues, distributed systems, microservices, reliability, search, system design, and behavioral/AI tooling.
- Reading guide: factual modules for booking systems, Postgres, Django, transactions, keys, performance, testing, Redis, queues, AWS, frontend basics, auth, API design, observability, forms, SQL, and behavioral stories.

## LLM Readiness Export

The reading guide includes a copyable report intended for an LLM reviewer. It summarizes current progress, weak topics, learning-type signals, next reps, and a leveling rubric from junior through solid mid-level. The export is plain Markdown so it can be pasted into another tool for feedback on:

- likely leveling signal
- best learning opportunities
- gaps in system design, debugging, testing, and full-stack judgment
- whether answers show tradeoffs instead of only tool names

## Run Locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Project Structure

- `src/data/cards.ts`: seeded decks and imported extended cards.
- `src/data/content.ts`: reading guide modules and guided examples.
- `src/lib/srs.ts`: spaced-repetition scheduling.
- `src/lib/learning.ts`: practice-type classification and answer guidance.
- `src/lib/assessment-export.ts`: Markdown export for LLM-based readiness review.
- `src/components/InterviewPrepApp.tsx`: main app shell and study modes.

## Public Repo Notes

- No secrets or environment variables are required.
- `private: true` in `package.json` prevents accidental npm publishing; it does not prevent this repository from being public on GitHub.
- Generated folders such as `.next/`, `node_modules/`, coverage, logs, and TypeScript build info are ignored.
