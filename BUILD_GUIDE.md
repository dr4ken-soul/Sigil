# Sigil: Build Guide

## Before You Write a Single Line of Code

Read APP_BLUEPRINT.md and FRONTEND_SPEC.md in full. This guide sequences the build; it does not repeat content that exists at full fidelity elsewhere. CLAUDE.md is the persistent context file.

## Prerequisites

```bash
node --version    # 20 or higher
npm --version     # 9 or higher
git --version     # any recent version
npm install -g @evenrealities/evenhub-cli @evenrealities/evenhub-simulator
```

Accounts and keys (all testnet or free tier): Telegram bot token from @BotFather, Hyperliquid testnet agent key, EVM testnet RPC URL, TON testnet endpoint, Whisper via OpenAI API key or local whisper.cpp.

## Repository Setup

```bash
mkdir sigil && cd sigil
git init
mkdir -p backend/src/{decode,explain,risk,simulate,routes,telegram,hl,db} backend/data
mkdir -p g2-app/src/{screens,components,lib,styles/fonts} g2-app/public
mkdir -p companion/src/{app/{pair,settings},components,lib,styles}
mkdir -p tests
```

Root `.env` for backend, never committed: PORT, DATABASE_URL, SESSION_SECRET, HYPERLIQUID_TESTNET_API, HYPERLIQUID_AGENT_KEY, ETHEREUM_RPC_URL, TONCENTER_TESTNET_API, TELEGRAM_BOT_TOKEN, STT_PROVIDER, OPENAI_API_KEY, WHISPER_CPP_PATH, DRAINER_LIST_PATH.

## Phase 1: Backend Core

Package setup: fastify, @fastify/cors, @fastify/cookie, better-sqlite3, viem, @ton/core, grammy. Dev: typescript, tsx, vitest, @types/node.
Database and types exactly as specified in APP_BLUEPRINT.md Data Structures. Ledger stores every request and verdict; status changes only through the verdict route.
Decode modules evm.ts, ton.ts, hyperliquid.ts against real testnet payloads. Unknown selectors fail loudly.
Explain and risk exactly as specified in APP_BLUEPRINT.md Integration Detail. Determinism test required.
Verdict API and stream. POST /requests/:id/verdict is the only path that changes status. GET /stream is SSE. Auto-approve must not exist as a route, function or comment.

## Phase 2: Live Integrations

Hyperliquid testnet client with base URL guard refusing anything but the testnet host. Read positions and fills into ledger facts.
EVM simulation with eth_call plus balance-diff. Test real Sepolia unlimited approval; verdict DANGER with "unlimited allowance".
TON transfer decode and testnet settlement preview. Test real testnet transfer with comment.
Telegram bot with pair command, forwarded-request intake, verdict mirror with reflect-only buttons, channel alerts.

## Phase 3: Voice

POST /stt accepts raw audio, runs Whisper per env, returns normalised text. Intent matching deterministic and ordered: approve, deny, stop, details, explain, next. Unknown returns "COULD NOT HEAR, TRY AGAIN".

## Phase 4: G2 App

Scaffold from official Even Hub minimal template pointed at local dev server. Vite, TypeScript, Tailwind. Confirm one input works before screens.
Screens per FRONTEND_SPEC.md §2: idle, decoding, verdict, detail, voice, stamp, summary, error. Shared risk chip, fact rows, action bar, countdown. Stamp keyframes copied from §2.7.
Input and state machine: ring tap, ring hold 400ms, touch strip, voice intents. One explicit reducer, every transition reachable in a test.
Fonts bundled woff2 subsets. app.json whitelists backend origin only. Logo slot stays a plain comment.

## Phase 5: Companion

Scaffold Next.js 14 App Router with TypeScript and Tailwind, install motion. Translate colour system and fonts exactly.
Pages /pair, /, /settings per FRONTEND_SPEC.md §3. Session tokens in httpOnly cookies. Keys last-four only.

## Phase 6: Quality Audit

Safety audit: no auto-approve path, no mainnet host or chain id, no client secrets, timeout only denies, verdict recorded before execution.
Integration audit: all live, no mocks. Hyperliquid order from glasses approval, Sepolia unlimited approval DANGER, TON testnet transfer decoded, Telegram mirror within 2 seconds, Whisper on real audio.
G2 audit: every screen at 576 × 288, stamp exact values, offline blocks verdicts, countdown verified.
Companion audit: ledger rows complete, keyboard paths, greyscale test, all breakpoints.
Copy audit: no em dash, label punctuation, British English.

## Rule: Complete Implementation, No Unfinished Work

Binding for every agent following this guide. Implement everything from beginning to end, including live integrations. Nothing skipped or left unfinished. Run all possible tests, verify functionality and fix issues. The only acceptable remaining steps are credentials requiring builder input and final live testing requiring the builder's participation. Never call the build complete while anything remains unfinished.

## Final Checklist

Public repository with complete README and pre-23 November statement. Demo video under 3 minutes. Short description and track declaration. Up to five API feature requests. Optional .ehpk package. Submitted on DoraHacks before 29 November 2026 20:59 (UTC+1).
