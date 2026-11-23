# Sigil: Agent Context

## What This Is

Sigil is a human-readable transaction approval layer for Even G2 smart glasses. A signing request (Hyperliquid testnet order, EVM transaction, TON transfer, or one forwarded through the Telegram bot) is decoded, simulated and risk-scored by the Sigil backend, then shown on the glasses as one sentence of plain English with a risk verdict. Ring tap approves, ring hold or voice denies, a 30-second countdown auto-denies, and a mechanical stamp records the decision in an audit ledger.

Built for the Heads Up: Even Realities Hackathon by TVM Ventures & Daos Hub. Build week 23 to 29 November 2026, deadline 29 November 20:59 (UTC+1), Demo Day 3 December 2026 at Daos Hub, Dubai (remote demo allowed). Tracks: 01 Messaging & News (Telegram) + 02 Crypto & DeFi (Gram Wallet, Hyperliquid, Trust Wallet), plus the Best Telegram integration prize.

## One-Line Pitch

Every transaction explained in one line on your glasses, let through or stopped with one tap of the ring.

## MVP Features

1. Request ingestion and decoding: four live sources (Hyperliquid testnet orders, EVM transactions, TON transfers, Telegram bot), a deterministic explain pipeline, and a simulation pass before anything is shown
2. Risk verdict: heuristic engine (unlimited allowances, first-time recipients, drainer list, thresholds, leverage caps) producing SAFE, CHECK or DANGER with explicit fact flags, never advice
3. The verdict loop on G2: one request per screen, ring tap approves, ring hold or voice denies, 30s auto-deny, verdict stamp with timestamp and route, everything recorded before execution
4. Telegram request channel: bot pairing, forwarded requests, verdict mirrors with inline buttons (reflect-only), channel alerts
5. Companion ledger and settings: code pairing, live queue, dense audit ledger, risk rules, integrations shown as last-four only

Post-hackathon, not in MVP: mainnet anything, a wallet or custody, model-generated summaries, browser extension, teams, monetisation, auto-approvals (which are banned outright, see Never Do These).

## Stack

| Layer | Technology |
|---|---|
| G2 app | Vite, TypeScript, Tailwind, Even Hub SDK, bundled woff2 font subsets |
| Companion | Next.js 14 App Router, TypeScript, Tailwind, motion/react |
| Backend | Node.js, TypeScript, Fastify, SQLite (better-sqlite3) |
| EVM | viem, testnet RPC |
| TON | official TON JS libraries, testnet |
| Hyperliquid | api.hyperliquid-testnet.xyz only |
| Telegram | grammY |
| STT | Whisper (API or whisper.cpp, env switch) |
| Explain | deterministic templates, no model in the verdict path |

## Project Structure

```
sigil/
├── backend/
│   ├── src/
│   │   ├── decode/            (evm.ts, ton.ts, hyperliquid.ts, types.ts)
│   │   ├── explain.ts         (deterministic sentence pipeline)
│   │   ├── risk.ts            (scoring engine + flags)
│   │   ├── simulate.ts        (eth_call and balance-diff passes)
│   │   ├── routes/            (pair, requests, verdict, queue, stream, stt, ledger, settings)
│   │   ├── telegram/          (bot.ts, mirror.ts, commands.ts)
│   │   ├── hl/                (testnetClient.ts, placeOrder.ts)
│   │   ├── db/                (schema.sql, ledger.ts, settings.ts)
│   │   └── index.ts
│   ├── data/drainers.json     (maintained list, shipped as data)
│   └── package.json
├── g2-app/
│   ├── src/
│   │   ├── screens/           (idle, decoding, verdict, detail, voice, stamp, summary, error)
│   │   ├── components/        (riskChip, factRow, actionBar, countdown, meter)
│   │   ├── lib/               (evenhub.ts, sse.ts, intents.ts)
│   │   ├── styles/            (fonts/ subsets, g2.css)
│   │   └── main.ts
│   ├── public/
│   │   └── logo slot          (plain comment, no asset)
│   ├── app.json               (Even Hub manifest, whitelisted origins)
│   └── package.json
├── companion/
│   ├── src/
│   │   ├── app/               (page.tsx, pair/page.tsx, settings/page.tsx, layout.tsx)
│   │   ├── components/        (topBar, statStrip, ledgerRow, filterChips, pairCard, toast)
│   │   ├── lib/               (api.ts, session.ts)
│   │   └── styles/globals.css
│   └── package.json
├── tests/                     (Vitest units per package, Playwright flows)
├── APP_BLUEPRINT.md
├── FRONTEND_SPEC.md
├── BUILD_GUIDE.md
├── PRODUCT.md
├── MARKETING.md
└── README.md
```

## Design System

All gates confirmed. Do not deviate from any value below. Full specification lives in FRONTEND_SPEC.md; this is the map, not the territory.

**Aesthetic:** Forensic instrument
**Identity fingerprint (§0C):** verdict card / one-line statement / phosphor + amber risk / decoded-ribbon evidence / queue rhythm (one thing at a time) / mechanical stamp motion
**Dials:** DESIGN_VARIANCE 7, MOTION_INTENSITY 4, VISUAL_DENSITY 3

**Gates:** 0 Name: Sigil, text wordmark only, no symbol mark · 1 Forensic instrument · 2 Card queue + verdict pair · 3 Verdict stamp · 4 Mechanical snap · 5 Phosphor + amber risk · 6 Space Grotesk + IBM Plex Mono · 7 Sparse on glass, ledger on web · Voice: clinical terse, British English

**Fonts:**
- Display: Space Grotesk (human sentences)
- Mono: IBM Plex Mono (machine facts, labels, addresses, amounts)
- G2 app bundles latin subsets as woff2 with system fallbacks. No runtime CDN fetch on the glasses

**Colour palette (companion):**
```css
--bg-primary: #0a0d0b;  --bg-secondary: #0f1411;  --bg-surface: #151b17;  --bg-elevated: #1b231e;
--phosphor: #4dff9e;    --phosphor-hover: #7dffb9; --phosphor-glow: rgba(77,255,158,0.10);
--risk: #ffb454;        --risk-glow: rgba(255,180,84,0.12);
--text-primary: #e9f4ee; --text-secondary: #8fa79b; --text-muted: #46564e;
--border-subtle: rgba(77,255,158,0.06); --border-default: rgba(77,255,158,0.14);
--radius-sm: 2px; --radius-md: 4px; --radius-lg: 8px;
--duration-fast: 120ms; --duration-normal: 180ms; --duration-slow: 280ms;
--ease-snap: cubic-bezier(0.2, 0, 0, 1);
```
G2 ink: `--g2-ink: #3dff8f` with opacity tiers 100 / 72 / 45 / 22. Amber is the only non-phosphor hue in the product and is reserved for risk. On the monochrome glass, risk is carried by glyph, label and border treatment, never colour alone.

**Motion:** mechanical snap only. 120/180/280ms, `--ease-snap`, no springs. The verdict stamp is the one dramatic moment: scale 1.45 to 1, rotate -7deg to -3deg, 160ms plus a 60ms settle. Reduced motion swaps everything to instant.

**Surface maps:**
- G2: one request per screen. IDLE → DECODING → VERDICT → DETAIL rows → STAMP → SUMMARY, with VOICE overlay, ERROR and OFFLINE states. Ring tap is the only approval path
- Companion: top bar (wordmark, PAIR / LEDGER / SETTINGS, status pill) over a scanline-textured graphite page; sparse headings, dense ledger rows

## The Approval Pipeline (shape to remember)

```text
ingest (bot / HL session / companion) → decode (evm | ton | hl) → simulate →
explain (deterministic template) → scoreRisk (facts only) → verdict card on G2 →
verdict recorded (ring | voice | timeout) → testnet execution step → ledger + mirror
```

The sentence is never model-generated. The verdict is recorded before any execution. Timeouts can only deny.

## Code Rules (follow without exception)

**General:**
- TypeScript strict everywhere. camelCase variables and functions. JSDoc on every exported function and hook
- API keys and secrets live only in backend environment. Never commit them, never log them, never send them to a client
- All chain traffic is testnet or read-only. If a code path could touch mainnet, it does not exist
- The drainer list ships as data (`data/drainers.json`) with a source note, never as folklore inside code

**G2 app:**
- CSS transitions and keyframes only, no animation library inside the WebView
- Fixed 576 × 288 canvas, no scrollbars, safe areas respected (FRONTEND_SPEC.md §2.0)
- Fonts bundled as woff2 subsets, never fetched at runtime
- No colour-only states anywhere; every state pairs glyph + label + border treatment
- The countdown hairline updates on a 250ms timer, never per frame

**Companion / React:**
- CSS variables from the design system used directly, never hardcoded hex in components
- CSS class-based hover states only, no inline `onMouseEnter` / `onMouseLeave`
- `motion/react` for the specified transitions only, with the exact values in FRONTEND_SPEC.md §5
- Loading states use skeleton shimmer or static blocks, never spinners
- Never use `localStorage` for anything sensitive; session tokens go in httpOnly cookies

**Writing rules (apply to all copy, labels, code comments, JSDoc, README, PRODUCT.md, MARKETING.md):**
- Clinical terse, British English throughout
- No em dashes anywhere
- COPY_GUIDELINES punctuation rule governs: a full stop ends a thought, a comma carries one on
- Short direct sentences. No filler words: "seamlessly", "powerful", "cutting-edge", "unlock"
- Labels, eyebrows, chips and stats carry no trailing punctuation
- Sentence fragments are allowed when the thought is complete ("Unlimited allowance.")
- No lorem ipsum anywhere. Every headline and label in FRONTEND_SPEC.md is final text

## Never Do These

- Never create an auto-approve code path, for any recipient, including "trusted" ones
- Never let a model generate or paraphrase the transaction verdict sentence
- Never broadcast a transaction Sigil itself originated from a user's wallet; execution stays with the provider the user already uses (testnet demos excepted, clearly flagged)
- Never hold user funds, private keys or mnemonics anywhere
- Never show raw calldata as primary content on the glass; the plain sentence leads, bytes live in one detail row
- Never render a secret in full in the companion; last four characters maximum
- Never read Telegram content beyond the commands and payloads the user sends the bot
- Never use Google sign-in in the WebView; pairing codes only
- Never use colour as the only carrier of risk or status
- Never mock an integration where a live testnet call is possible

## Hackathon Checklist

- Project name: Sigil
- Hackathon: Heads Up: Even Realities Hackathon by TVM Ventures & Daos Hub (DoraHacks)
- Build week 23–29 November 2026, submission deadline 29 November 20:59 (UTC+1), Demo Day 3 December
- Public GitHub repository, complete code, README stating what existed before 23 November
- Demo video up to 3 minutes in the Even Hub simulator or on G2
- Short description: problem, who it is for, how it works, tracks 01 + 02
- Up to five API feature requests (drafted in README.md)
- Optional `.ehpk` package
- Community named in the submission's "How did you hear about this hackathon?" field

## Copy and Punctuation

The shared rule set lives in COPY_GUIDELINES.md and applies to every string in this product. The core rule, restated here because agents must not have to go looking for it: **a full stop ends a thought, a comma carries one on, decide which before writing not after.** The failure mode is a run of short sentences standing in for one sentence ("Nothing was changed. You can try again." should be "Nothing was changed, so you can try again."), and the worse mechanical fix of joining independent clauses with a bare comma. Context rules for this product: labels and chips get no trailing punctuation; helper sentences get exactly one full stop; status confirmations ("Connected.", "Saved.") get one; the glass may use fragments where the thought is complete. Full audit scope: every screen, component and state, audited at the source string.

## Rule: Complete Implementation, No Unfinished Work

Binding for every agent in this repository.

Whenever the instruction says "build completely", it means implement everything from beginning to end: every requested feature, function, integration, configuration and deployment. This includes actual live integrations, not just local implementations, mockups or partial builds.

Nothing may be skipped, postponed or left unfinished. Complete the implementation, run all possible tests, verify functionality and fix any issues found.

The only acceptable remaining steps are providing `.env` credentials or secrets that require builder input, and final live testing or confirmation that requires the builder's participation.

Never claim a task is complete while any implementation remains unfinished. If genuinely blocked by an external dependency or permission, clearly explain the blocker and what is needed.

**Definition of done:** everything requested is fully built, integrated not just locally but live too, configured and verified, with nothing outstanding except the explicitly permitted steps above.
