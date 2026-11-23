# Sigil: Agent Context

## What This Is

Sigil is a human-readable transaction approval layer for Even G2 smart glasses. A signing request (Hyperliquid testnet order, EVM transaction, TON transfer, or one forwarded through the Telegram bot) is decoded, simulated and risk-scored by the Sigil backend, then shown on the glasses as one sentence of plain English with a risk verdict. Ring tap approves, ring hold or voice denies, a 30-second countdown auto-denies, and a mechanical stamp records the decision in an audit ledger.

Built for the Heads Up: Even Realities Hackathon by TVM Ventures & Daos Hub. Build week 23 to 29 November 2026, deadline 29 November 20:59 (UTC+1), Demo Day 3 December, Daos Hub, Dubai. Tracks 01 Messaging & News (Telegram) and 02 Crypto & DeFi, plus Best Telegram integration.

## One-Line Pitch

Every transaction explained in one line on your glasses, let through or stopped with one tap of the ring.

## MVP Features

1. Request ingestion and decoding from four live sources, deterministic explain pipeline, simulation pass
2. Risk verdict with explicit fact flags, never advice
3. Verdict loop on G2 with ring tap, hold, voice, auto-deny, stamp, recorded before execution
4. Telegram request channel with pairing, forwarding, reflect-only mirrors and channel alerts
5. Companion ledger and settings with code pairing, dense audit trail, last-four secrets

## Stack

G2 app: Vite, TypeScript, Tailwind, Even Hub SDK, bundled woff2 subsets. Companion: Next.js 14 App Router, TypeScript, Tailwind, motion/react. Backend: Node.js, TypeScript, Fastify, SQLite. EVM viem, TON official JS, Hyperliquid testnet only, Telegram grammY, Whisper STT.

## Project Structure

```
backend/src/decode/            evm.ts, ton.ts, hyperliquid.ts, types.ts
backend/src/explain.ts         deterministic sentence pipeline
backend/src/risk.ts            scoring engine and flags
backend/src/simulate.ts        eth_call and balance-diff
backend/src/routes/            pair, requests, verdict, queue, stream, stt, ledger, settings
backend/src/telegram/          bot.ts, mirror.ts, commands.ts
backend/src/hl/                testnetClient.ts, placeOrder.ts
backend/src/db/                schema.sql, ledger.ts, settings.ts
g2-app/src/screens/            idle, decoding, verdict, detail, voice, stamp, summary, error
g2-app/src/components/         riskChip, factRow, actionBar, countdown, meter
g2-app/src/lib/                evenhub.ts, sse.ts, intents.ts
companion/src/app/             page, pair/page, settings/page, layout
companion/src/components/      topBar, statStrip, ledgerRow, filterChips, pairCard, toast
tests/                         Vitest units per package, Playwright flows
```

## Design System

Aesthetic forensic instrument. Dials DESIGN_VARIANCE 7, MOTION_INTENSITY 4, VISUAL_DENSITY 3. Gate decisions all confirmed: Sigil text wordmark, card queue plus verdict pair, verdict stamp, mechanical snap, phosphor plus amber risk, Space Grotesk plus IBM Plex Mono, sparse on glass and ledger on web. Voice clinical terse British English.

Palette in FRONTEND_SPEC.md §1.2. G2 ink #3dff8f with opacity tiers 100 / 72 / 45 / 22. Amber reserved for risk. Risk carried by glyph, label and border, never colour alone. Motion mechanical snap only, 120/180/280ms, stamp 160ms plus 60ms settle.

## The Approval Pipeline

ingest, decode, simulate, explain deterministic template, scoreRisk facts only, verdict card on G2, verdict recorded ring or voice or timeout, testnet execution step, ledger and mirror. Sentence never model-generated. Verdict recorded before execution. Timeouts can only deny.

## Code Rules

TypeScript strict everywhere. camelCase, JSDoc on every exported function and hook. Secrets only in backend environment. All chain traffic testnet or read-only. Drainer list ships as data in data/drainers.json with source note.
G2: CSS transitions and keyframes only, fixed 576 × 288, fonts bundled, no colour-only states, countdown on 250ms timer.
Companion: CSS variables, class-based hover states, motion/react only for specified transitions, skeletons not spinners, session tokens in httpOnly cookies.
Writing: clinical terse British English, no em dashes, full stop ends a thought and comma carries one on, no filler adjectives, labels and chips no trailing punctuation, no lorem ipsum.

## Never Do These

Never create an auto-approve path. Never let a model generate the sentence. Never broadcast a transaction Sigil originated from a user's wallet. Never hold funds, keys or mnemonics. Never show raw calldata as primary glass content. Never render a full secret. Never read Telegram beyond commands and payloads. Never use Google sign-in in the WebView. Never use colour as the only risk carrier. Never mock an integration where a live testnet call is possible.

## Rule: Complete Implementation, No Unfinished Work

Binding for every agent. Build everything from beginning to end, including live integrations. Run all tests, verify, fix issues. Only credentials and builder-participation live tests may remain. Never claim complete while implementation remains unfinished.
