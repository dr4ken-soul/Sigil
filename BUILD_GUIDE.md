# Sigil: Build Guide

## Before You Write a Single Line of Code

Read APP_BLUEPRINT.md and FRONTEND_SPEC.md in full. Every data structure, route and integration pattern is in APP_BLUEPRINT.md. Every class, animation value, z-index and piece of copy is in FRONTEND_SPEC.md. This guide sequences the build; it does not repeat content that exists at full fidelity elsewhere. Where a step says "as specified in X", read that section before writing the file. CLAUDE.md is the persistent context file and sits alongside this guide.

---

## Prerequisites

```bash
node --version    # 20 or higher
npm --version     # 9 or higher
git --version     # any recent version
```

Even Realities tooling, as published in the hackathon brief (verify current names in the Even Hub docs before use):

```bash
npm install -g @evenrealities/evenhub-cli
npm install -g @evenrealities/evenhub-simulator
```

Accounts and keys (all testnet or free tier):

- A Telegram bot token from @BotFather
- A Hyperliquid **testnet** agent key (api.hyperliquid-testnet.xyz)
- An EVM testnet RPC URL (Sepolia or equivalent)
- A TON testnet endpoint (toncenter testnet or equivalent)
- Whisper: an OpenAI API key, or a local whisper.cpp install (env switch `STT_PROVIDER`)

Read the Even Hub docs and the minimal template first, per the brief's five-step setup: point the simulator at your local dev server, change one line of text, confirm one input works, then build.

---

## Repository Setup

```bash
mkdir sigil && cd sigil
git init
mkdir -p backend/src/{decode,explain,risk,simulate,routes,telegram,hl,db} backend/data
mkdir -p g2-app/src/{screens,components,lib,styles/fonts} g2-app/public
mkdir -p companion/src/{app/{pair,settings},components,lib,styles}
mkdir -p tests
```

Root `.env` for the backend (never committed):

```
PORT=8080
DATABASE_URL=./sigil.db
SESSION_SECRET=
HYPERLIQUID_TESTNET_API=https://api.hyperliquid-testnet.xyz
HYPERLIQUID_AGENT_KEY=
ETHEREUM_RPC_URL=
TONCENTER_TESTNET_API=
TELEGRAM_BOT_TOKEN=
STT_PROVIDER=whisper-api
OPENAI_API_KEY=
WHISPER_CPP_PATH=
DRAINER_LIST_PATH=./data/drainers.json
```

---

## Phase 1: Backend Core (decode, explain, risk, verdict API)

### 1.1 Package setup

```bash
cd backend
npm init -y
npm install fastify @fastify/cors @fastify/cookie better-sqlite3 viem @ton/core grammY
npm install --save-dev typescript tsx vitest @types/node
```

### 1.2 Database and types

Create `src/db/schema.sql` and the `SigningRequest`, `FactRow`, `RiskFlag`, `RiskRules` interfaces exactly as specified in APP_BLUEPRINT.md, Data Structures. The ledger table stores every request and its verdict; status changes only through the verdict route.

### 1.3 Decode modules

Implement `src/decode/evm.ts`, `src/decode/ton.ts`, `src/decode/hyperliquid.ts` against real testnet payloads. Function selector resolution plus a small built-in ABI set first; unknown selectors fail loudly (the ERROR state exists for this). Unit tests with captured real testnet payloads for each kind.

### 1.4 Explain and risk

Implement `src/explain.ts` and `src/risk.ts` exactly as specified in APP_BLUEPRINT.md, Integration Detail. Determinism test: the same decoded request must return the identical sentence and verdict across runs.

### 1.5 Verdict API and stream

Implement the routes in APP_BLUEPRINT.md, Backend API Surface. `POST /requests/:id/verdict` is the only path that changes status; `POST /requests/:id/expiry` fires from a timer and flags `expired`. `GET /stream` is SSE. Auto-approve must not exist as a route, a function or a comment suggesting one.

---

## Phase 2: Live Integrations

### 2.1 Hyperliquid testnet

`src/hl/testnetClient.ts` and `placeOrder.ts` as specified in APP_BLUEPRINT.md. Guard: the client constructor refuses any base URL that is not the testnet host. Read positions and fills back into ledger facts. Test: place a real testnet order after a recorded approval and see its receipt in the ledger.

### 2.2 EVM simulation

`src/simulate.ts`: eth_call plus balance-diff estimate via trace where the RPC supports it. Test against a real unlimited-approval transaction on Sepolia; the verdict must be DANGER with the "unlimited allowance" flag.

### 2.3 TON

Transfer decode (amount, recipient, comment, jetton patterns) and a testnet settlement preview from a Sigil-held **testnet** wallet, clearly flagged in the ledger. Test with a real testnet transfer carrying a comment.

### 2.4 Telegram bot

`src/telegram/bot.ts`, `mirror.ts`, `commands.ts` as specified in APP_BLUEPRINT.md. Pair command, forwarded-request intake, verdict mirror with reflect-only inline buttons, channel alerts. Test in a real chat: forward a request, approve on the glasses, watch the message edit.

---

## Phase 3: Voice

### 3.1 STT route

`POST /stt`: accept raw audio from the Even Hub SDK, run Whisper (API or whisper.cpp per env), return normalised text. Intent matching in `intents.ts` is deterministic and ordered (approve, deny, stop, details, explain, next); unknown text returns "COULD NOT HEAR, TRY AGAIN". Test with real microphone audio through the simulator.

---

## Phase 4: G2 App

### 4.1 Scaffold

Start from the official Even Hub minimal template pointed at a local dev server. Vite + TypeScript + Tailwind. Confirm one input works before building screens (the brief's step 4).

### 4.2 Screens

One file per screen in `src/screens/`, implemented exactly as specified in FRONTEND_SPEC.md §2: `idle.ts` (§2.2), `decoding.ts` (§2.3), `verdict.ts` (§2.4), `detail.ts` (§2.5), `voice.ts` (§2.6), `stamp.ts` (§2.7), `summary.ts` (§2.8), `error.ts` (§2.9). The risk chip, fact rows, action bar and countdown are components shared across screens. The stamp keyframes are copied from §2.7 values, not approximated.

### 4.3 Input and state machine

Wire ring tap, ring hold (400ms threshold), touch strip and voice intents per §2.10 and the transition table §4.3. Implement the state machine as one explicit reducer; every transition in the table must be reachable in a test.

### 4.4 Fonts and manifest

Bundle the woff2 subsets into `src/styles/fonts/`. `app.json` whitelists the Sigil backend origin only. The logo slot stays a plain comment.

---

## Phase 5: Companion

### 5.1 Scaffold

```bash
cd companion
npx create-next-app@latest . --typescript --tailwind --app
npm install motion
```

Translate the colour system and font import from FRONTEND_SPEC.md §1.1–1.2 into `tailwind.config.ts` and `globals.css` exactly. This is the one part of the spec that gets copied in full, it is foundational wiring.

### 5.2 Pages

`/pair` (§3.2), `/` (§3.3), `/settings` (§3.4), each implemented exactly as specified, with the state inventory §4.2 and interaction table §4.1 honoured. Session tokens in httpOnly cookies. Keys rendered last-four only.

---

## Phase 6: Quality Audit

Run every check before recording the demo video.

**Safety audit:**
- No auto-approve path exists: search the repo for one and prove the search clean in the README
- No mainnet host, chain id or key appears anywhere
- No secret is rendered client-side; companion shows last four characters
- Timeout can only deny (flip the timeout to 5s and watch a request die)
- Verdict is recorded before any execution step (check the ledger ordering)

**Integration audit (all live, no mocks):**
- Hyperliquid testnet order placed from a glasses approval, receipt in ledger
- Unlimited-approval Sepolia transaction renders DANGER with flags
- TON testnet transfer decoded and previewed
- Telegram mirror updates within 2 seconds of the stamp
- Whisper intent path works on real microphone audio

**G2 audit:**
- Every screen in §2 renders correctly in the simulator at 576 × 288
- Stamp plays at exact §2.7 values; reduced-motion path is instant
- Offline blocks verdicts and says so; queue recovers
- Countdown hairline and auto-deny verified at 15/30/60s

**Companion audit:**
- Ledger rows complete (time, source, plain line, risk, route) and expandable
- Keyboard paths work; focus ring visible; greyscale test loses no risk information
- Visual review at every breakpoint in FRONTEND_SPEC.md §6

**Copy audit:**
- No em dash in any interface string; label punctuation per CLAUDE.md; British English

---

## Rule: Complete Implementation, No Unfinished Work

Binding for every agent following this guide.

Whenever the instruction says "build completely", it means implement everything from beginning to end: every requested feature, function, integration, configuration and deployment. This includes actual live integrations, not just local implementations, mockups or partial builds.

Nothing may be skipped, postponed or left unfinished. Complete the implementation, run all possible tests, verify functionality and fix any issues found.

The only acceptable remaining steps are providing `.env` credentials or secrets that require builder input, and final live testing or confirmation that requires the builder's participation.

Never claim a task is complete while any implementation remains unfinished. If genuinely blocked by an external dependency or permission, clearly explain the blocker and what is needed.

**Definition of done:** everything requested is fully built, integrated not just locally but live too, configured and verified, with nothing outstanding except the explicitly permitted steps above. For this project that means real Hyperliquid testnet, TON testnet, EVM testnet and Telegram Bot API traffic in the tests and the demo, never a mock where a live call is possible.

---

## Final Checklist (matches APP_BLUEPRINT.md)

- Public GitHub repository with complete README and the pre-23 November statement
- Demo video up to 3 minutes, real integrations on screen
- Short description and track declaration (01 + 02)
- Up to five API feature requests
- Optional `.ehpk` package
- Submitted on DoraHacks before 29 November 2026 20:59 (UTC+1)

---

## Builder override: Groq STT

The builder chose Groq for speech to text. `STT_PROVIDER=groq` and `GROQ_API_KEY` replace `whisper-api` and `OPENAI_API_KEY`. The route posts to `https://api.groq.com/openai/v1/audio/transcriptions` with model `whisper-large-v3-turbo`. The original Whisper wording above is retained as the written spec.

