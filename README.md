# Sigil

Human-readable transaction approval for Even G2 smart glasses. One line of plain English on the glasses, one tap of the ring to let a transaction through or stop it.

Built for the **Heads Up: Even Realities Hackathon** by TVM Ventures & Daos Hub. Tracks: **01 Messaging & News (Telegram)** and **02 Crypto & DeFi (Gram Wallet, Hyperliquid, Trust Wallet)**, entering the **Best Telegram integration** prize.

## What It Does

A signing request (Hyperliquid testnet order, EVM transaction, TON transfer, or one forwarded to the Telegram bot) is decoded, simulated and risk-scored by the Sigil backend. The glasses show one deterministic sentence and a risk verdict. Ring tap approves, ring hold or voice denies, a 30-second countdown auto-denies, and a verdict stamp records the decision in an audit ledger.

The sentence is built from decoded facts by fixed templates, never by a model. The same request always produces the same words.

## Repository Layout

```
backend/    Fastify API: decode, explain, risk, verdicts, SSE, Telegram bot, STT
g2-app/     Even Hub WebView app (Vite + TypeScript + Tailwind), 576 × 288 monochrome
companion/  Next.js pairing, dashboard, ledger and settings
tests/      Vitest units and Playwright flows
```

Full documents: `PRODUCT.md` (plain language), `APP_BLUEPRINT.md` (architecture), `FRONTEND_SPEC.md` (every screen), `BUILD_GUIDE.md` (build sequence), `CLAUDE.md` (agent context).

## Quickstart

```bash
# tooling
npm install -g @evenrealities/evenhub-cli @evenrealities/evenhub-simulator

# backend
cd backend && npm install && cp ../.env.example .env   # fill keys, see below
npm run dev

# g2 app (point the simulator at this dev server per the Even Hub docs)
cd g2-app && npm install && npm run dev

# companion
cd companion && npm install && npm run dev
```

Environment variables are documented in `APP_BLUEPRINT.md`. Every key stays on the backend. The glasses bundle and companion contain zero secrets.

## Demo Script (3 minutes)

1. A forwarded Telegram request lands; the glasses show "Send 250 USDT to 0x7a3c…9f2c" with SAFE
2. A second request arrives: an unlimited allowance. The chip reads ✕ DANGER, the flag "unlimited allowance" is one row away. Ring hold denies; the stamp lands
3. A Hyperliquid testnet order is approved with a ring tap; the order is placed on testnet and the receipt appears in the ledger
4. The Telegram mirror shows ✓ APPROVED and ✕ DENIED updating live
5. The ledger and settings pages: facts, explorer links, "Sigil never auto-approves"
6. Feature requests slide

## Safety Rules (non-negotiable)

- Testnet and read-only data only. No user funds held, ever
- No auto-approve code path exists anywhere in this repository
- Timeouts can only deny
- No financial advice anywhere in copy
- No API keys in any client bundle

## What Existed Before 23 November 2026

Per the hackathon rules: the Even Hub SDK and simulator, the Hyperliquid testnet API, the Telegram Bot API, Whisper, viem and the TON libraries are pre-existing tools used as documented. No portion of the Sigil product (decode pipeline, risk engine, verdict loop, bot flows, companion) existed before the build window. Any open-source library used is listed in each package's manifest.

## API Feature Requests (submitted with the build)

1. **Even Hub SDK:** raw microphone audio only, with no voice activity detection or utterance boundaries. Built-in VAD or level events would cut STT latency sharply
2. **Even Hub SDK:** no headless "peek" surface. A privacy-preserving notification hook would let a pending approval show a one-line badge while another app is open
3. **Hyperliquid testnet:** no dry-run or impact preview endpoint for orders, forcing every "what will this do" answer to be estimated client-side
4. **Gram Wallet:** no testnet signing sandbox, so third-party approval previews cannot show a wallet-native confirmation without real keys
5. **Telegram Mini Apps:** no bridge events to G2 input (ring, touch), which would let a Mini App mirror ride the same verdict interaction as the glasses app

## Licence and Attribution

Code licence: MIT (to confirm at publication). Product names (Hyperliquid, Telegram, Trust Wallet, Gram Wallet, Even Realities) belong to their owners; Sigil integrates their public APIs per their terms.
