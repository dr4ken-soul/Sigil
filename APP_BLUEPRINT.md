# Sigil: App Blueprint

## Product Summary

Sigil is a human-readable transaction approval layer for Even G2 smart glasses. A signing request (Hyperliquid testnet order, EVM transaction, TON transfer, or one forwarded through the Telegram bot) is decoded, simulated and scored by the Sigil backend, then delivered to the glasses as one sentence of plain English with a risk verdict. The ring tap lets it through, a hold or a voice command stops it, and a mechanical stamp records the decision in an audit ledger on the companion site.

Built for the Heads Up: Even Realities Hackathon by TVM Ventures & Daos Hub, build week 23 to 29 November 2026, submission deadline 29 November 2026 20:59 (UTC+1), Demo Day 3 December 2026 at Daos Hub, Dubai (remote demo allowed). G2 is the display, voice and input layer only. Execution and custody stay with the underlying providers, reached through their APIs, and every demo runs on testnet or read-only data.

Sigil is the check that blind signing never had. Remove the glasses and it is still a decode and risk service; keep them and a decision that used to take a phone, a block explorer and a leap of faith takes one glance and one tap.

---

## Market Context

**Who this is for:**

1. DeFi users who sign transactions from wallets (Trust Wallet, Gram Wallet inside Telegram, exchange testnets) whose signing screens show a method name and a hex blob, not a consequence. Blind signing is the largest self-custody loss driver there is
2. Traders placing testnet orders on Hyperliquid who want a hands-free confirmation ritual during a session, eyes on the market, not on a phone
3. Telegram-native users who receive transaction requests in chats and bots and want a private, glanceable place to decide

**What they currently use:** wallet signing previews (asset, amount, and little else), desktop security extensions that do not exist on mobile, block explorers, and blind trust. On mobile, in a Telegram flow, there is effectively nothing.

**Why they switch:** Sigil turns the scariest five seconds in crypto (what am I actually signing?) into the product's whole surface: one honest sentence, one risk verdict, one tap. The glasses make it available at the exact moment a phone is worst: mid-trade, mid-chat, mid-walk.

---

## MVP Feature Set

### Feature 1: Request Ingestion and Decoding

**User story:** As a user I want any signing request I am about to act on to be read and explained before it executes, whatever surface it came from.

**How it works:** The backend accepts requests from four live sources: Hyperliquid testnet orders (parsed from the order struct), EVM transactions (function selector resolution, ABI decode, transfer and approval semantics, allowance state), TON testnet transfers (amount, recipient, comment and jetton patterns), and the Telegram bot (forwarded request payloads and transaction hashes). A deterministic explain pipeline builds the plain-English sentence from decoded facts using fixed templates. A simulation pass (eth_call on EVM, balance-diff estimate, TON state read) reports the expected effect before anything else happens.

**Acceptance criteria:** Sending the same request twice always yields the identical sentence, byte for byte. A raw calldata blob that fails to decode shows "Could not read this request" and its failing stage, never a guessed sentence.

**Complexity:** High

### Feature 2: Risk Verdict

**User story:** As a user I want to see, without reading hex, whether this transaction is routine or dangerous.

**How it works:** A heuristic risk engine scores each request: unlimited allowances, first-time recipients, known drainer addresses, hidden approve-then-transfer patterns, value above the user's configured threshold, unusual selectors, TON comment payloads that match gift or prize patterns, and Hyperliquid orders above the user's leverage cap. The result is one of SAFE, CHECK or DANGER, rendered with glyph, label and border treatment (never colour alone) and a flag list on the detail rows. Flags are facts ("unlimited allowance"), not advice.

**Acceptance criteria:** A classic unlimited-approval drainer request renders DANGER with the flag "unlimited allowance" visible in one detail row. Threshold configuration in the companion changes the verdict of a matching request immediately.

**Complexity:** Medium

### Feature 3: The Verdict Loop on G2

**User story:** As a user I want to decide in seconds, without my phone, and have a record of what I decided.

**How it works:** One request per screen on the 576 × 288 display (the verdict card). Ring tap approves, ring hold or voice denies, a 30-second countdown auto-denies for safety, and the verdict stamp snaps over the card with timestamp and route (ring, voice or timeout). The decision is posted to the backend ledger before any execution step continues. Offline, the glasses block verdicts and say so.

**Acceptance criteria:** The full loop (request arrival to stamp to next request) runs in the Even Hub simulator with zero mock data. There is no auto-approve code path anywhere in the repository.

**Complexity:** High

### Feature 4: Telegram Request Channel

**User story:** As a Telegram-native user I want to forward a transaction request to a bot, decide on my glasses, and see the verdict land back in the chat.

**How it works:** The Sigil bot pairs to an account via the same pairing code as the glasses. A forwarded request or transaction hash becomes a signing request; the verdict mirrors back as an edited bot message with inline buttons that reflect (not replace) the glasses decision. Channel alerts can post verdicts to a subscribed channel. This is the deepest Telegram integration in the build and the entry for the Best Telegram integration prize.

**Acceptance criteria:** A request forwarded to the bot appears on the glasses within seconds; the mirrored message updates with ✓ APPROVED or ✕ DENIED within 2 seconds of the stamp; the bot reads nothing beyond the commands and payloads the user sends it.

**Complexity:** Medium

### Feature 5: Companion Ledger and Settings

**User story:** As a user I want an audit trail and control over my risk rules and paired devices.

**How it works:** The companion site pairs devices by code (no Google sign-in in the WebView), shows live queue and today's counts, lists every verdict in a dense ledger with expandable facts and testnet explorer links, and holds settings: auto-deny timeout (15/30/60s), CHECK-upgrade value threshold, trusted recipients, integration status (last four characters of keys only) and voice options. The invariant line "Sigil never auto-approves" is permanently visible.

**Acceptance criteria:** Every verdict ever recorded appears in the ledger with time, source, plain line, risk and route. Secrets are never rendered in full anywhere.

**Complexity:** Medium

**What makes this the one that matters for judging:** the whole product is the read-and-write loop the judges score first, applied to the highest-stakes moment in the category. One sentence in, one tap out, one honest record. Verifiable by anyone: same request, same sentence; dangerous request, visible DANGER; ring tap, real testnet effect.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| G2 app | Vite, TypeScript, Tailwind, Even Hub SDK | The required web app form; compiled static assets, CSS transitions only for the 576 × 288 budget |
| Companion | Next.js 14 App Router, TypeScript, Tailwind, motion/react | SSR where useful, standard deploy, motion only for the specified transitions |
| Backend | Node.js, TypeScript, Fastify | One language across the repo; SSE for the glasses stream; small and deployable |
| EVM work | viem | Decode, eth_call simulation, testnet reads and writes |
| TON work | official TON JS libraries | Transfer decode and testnet settlement preview |
| Hyperliquid | hyperliquid testnet API (api.hyperliquid-testnet.xyz) | Real testnet order placement and position reads, never mainnet |
| Telegram | grammY (Telegram Bot API) | Requests in, verdict mirrors out |
| Speech to text | Whisper via API or local whisper.cpp (env switch) | The SDK gives raw microphone audio; the brief tells us to bring our own STT |
| Explain pipeline | deterministic templates | A security product must not let a model hallucinate what a transaction does |
| Database | SQLite (better-sqlite3) | Audit ledger and queue on the operator's own server; no user content goes third-party |
| Pairing | six-character codes + signed session tokens | No Google sign-in possible in the WebView; codes replace it |
| Hosting | Fly.io or Railway for backend, Vercel for companion | Persistent SSE and simple static deploy; reversible choice |

---

## Integration Detail

### Deterministic explain pipeline

```typescript
/**
 * Builds the one-line plain-English verdict sentence from decoded facts.
 * Deterministic by design: identical input must always produce the identical
 * sentence, and no model is allowed to paraphrase what a transaction does.
 * @param decoded - the decoded request (kind, amounts, addresses, semantics)
 * @returns the exact sentence rendered on the verdict card
 */
export function explainLine(decoded: DecodedRequest): string {
  switch (decoded.kind) {
    case 'evm-send':
      return `Send ${fmtAmount(decoded.amount, decoded.asset)} to ${short(decoded.to)}`
    case 'evm-approve':
      return decoded.unlimited
        ? `Let ${short(decoded.spender)} move any amount of your ${decoded.asset}`
        : `Let ${short(decoded.spender)} move your ${fmtAmount(decoded.amount, decoded.asset)}`
    case 'hl-order':
      return `Place a testnet order: ${decoded.side} ${decoded.coin}, ${fmtAmount(decoded.size, 'USDC')} ${decoded.orderType}`
    case 'ton-transfer':
      return decoded.comment
        ? `Send ${fmtAmount(decoded.amount, 'TON')} to ${short(decoded.to)} with comment '${decoded.comment}'`
        : `Send ${fmtAmount(decoded.amount, 'TON')} to ${short(decoded.to)}`
    default:
      throw new ExplainError('DECODE_FAILED')
  }
}
```

### Risk engine

```typescript
/**
 * Scores a decoded request into SAFE, CHECK or DANGER with explicit flags.
 * Flags are facts about the request, never financial advice. Thresholds come
 * from the user's settings, never from a hardcoded opinion.
 * @param request - the decoded request plus simulation result
 * @param rules - user thresholds and trusted recipient list
 */
export function scoreRisk(request: DecodedRequest, rules: RiskRules): RiskVerdict {
  const flags: RiskFlag[] = []
  if (request.kind === 'evm-approve' && request.unlimited) {
    flags.push({ level: 'danger', fact: 'unlimited allowance' })
  }
  if (request.firstTimeRecipient) {
    flags.push({ level: 'check', fact: 'first transfer to this recipient' })
  }
  if (rules.drainers.has(request.counterparty.toLowerCase())) {
    flags.push({ level: 'danger', fact: 'address matches known drainer list' })
  }
  if (request.valueUsd > rules.checkAboveUsd) {
    flags.push({ level: 'check', fact: `value above ${rules.checkAboveUsd} USDC threshold` })
  }
  if (request.kind === 'hl-order' && request.leverage > rules.maxLeverage) {
    flags.push({ level: 'check', fact: `leverage ${request.leverage}× above your cap` })
  }
  const level = flags.some((f) => f.level === 'danger')
    ? 'danger'
    : flags.length > 0
      ? 'check'
      : 'safe'
  return { level, flags }
}
```

### Hyperliquid testnet placement (after approval only)

```typescript
/**
 * Places an order on Hyperliquid TESTNET after the glasses verdict is
 * recorded as approved. Mainnet hosts are never constructed in this codebase.
 * @param order - the decoded order the user approved on the glasses
 * @param agentKey - testnet agent key from backend environment
 * @returns the testnet order id and fill status for the ledger row
 */
export async function placeTestnetOrder(order: HlOrder, agentKey: string) {
  const client = createTestnetClient({ baseUrl: 'https://api.hyperliquid-testnet.xyz' })
  const result = await client.exchange.order({
    coin: order.coin,
    isBuy: order.side === 'long',
    sz: order.size,
    orderType: { limit: { tif: 'Ioc' } },
    reduceOnly: false,
  })
  return { orderId: result.resting?.oid ?? result.filled?.avgPx, raw: result }
}
```

### Telegram verdict mirror

```typescript
/**
 * Mirrors a verdict back to the originating Telegram chat. The inline buttons
 * reflect the decision the user already made on the glasses, they never become
 * a second approval surface (one verdict surface, one record).
 */
export async function mirrorVerdict(bot: Bot, request: SigningRequest) {
  await bot.api.editMessageText(
    request.telegramChatId,
    request.telegramMessageId,
    request.status === 'approved'
      ? `✓ APPROVED · ${request.plainLine}`
      : `✕ ${request.status === 'expired' ? 'AUTO-DENY' : 'DENIED'} · ${request.plainLine}`,
    {
      replyMarkup: inlineKeyboard([
        [{ text: 'Open on glasses', callbackData: `open:${request.id}` }],
        [{ text: 'Full facts', callbackData: `facts:${request.id}` }],
      ]),
    },
  )
}
```

### Voice intent route

```text
raw mic (Even Hub SDK) → POST /stt (Whisper) → normalise text →
match intents in order: approve | deny | stop | details | explain | next →
unknown intent returns "COULD NOT HEAR, TRY AGAIN", never guesses an action
```

---

## Data Structures

```typescript
type RiskLevel = 'safe' | 'check' | 'danger'
type RequestSource = 'hyperliquid' | 'evm' | 'ton' | 'telegram'
type RequestStatus = 'pending' | 'approved' | 'denied' | 'expired' | 'error'

interface FactRow { label: string; value: string; flagged?: boolean }

interface RiskFlag { level: 'check' | 'danger'; fact: string }

interface SigningRequest {
  id: string
  source: RequestSource
  network: string                    // 'hyperliquid-testnet' | 'sepolia' | 'ton-testnet' | ...
  plainLine: string                  // deterministic output of explainLine
  facts: FactRow[]
  risk: { level: RiskLevel; flags: RiskFlag[] }
  raw: { kind: 'evm-tx' | 'ton-transfer' | 'hl-order'; digest: string; byteLength: number }
  status: RequestStatus
  createdAt: number
  autoDenyAt: number                 // createdAt + timeout from settings
  verdict?: { route: 'ring' | 'voice' | 'timeout'; at: number }
  telegramChatId?: number
  telegramMessageId?: number
}

interface RiskRules {
  checkAboveUsd: number
  maxLeverage: number
  trustedRecipients: Set<string>
  drainers: Set<string>              // maintained list, shipped as data
}

interface PairingSession { code: string; expiresAt: number; boundDeviceId?: string }
```

---

## Backend API Surface

| Route | Caller | Description |
|---|---|---|
| `POST /pair` | companion | Create a six-character pairing code, 10-minute expiry |
| `POST /pair/confirm` | G2 app, Telegram bot | Bind device with code, returns session token |
| `POST /requests` | Telegram bot, Hyperliquid session monitor, companion | Ingest a signing request, returns decoded verdict card payload |
| `GET /queue` | G2 app | Next pending request for this device |
| `GET /requests/:id` | companion | Full record including facts and raw digest |
| `POST /requests/:id/verdict` | G2 app | Record approve/deny with route; the only path that changes status |
| `POST /requests/:id/expiry` | backend timer | Auto-deny at deadline, flagged as expired |
| `GET /stream` | G2 app (SSE) | Live queue push |
| `POST /stt` | G2 app | Raw audio in, intent text out |
| `POST /telegram/webhook` | Telegram | Bot updates |
| `GET /ledger` | companion | Filtered verdict history |
| `PUT /settings` | companion | Risk rules, timeouts, voice options |

Execution actions (testnet order placement, TON testnet settlement preview) run server-side only after a recorded approval, and their receipts re-enter the same ledger.

---

## Environment Variables

```
PORT=8080
DATABASE_URL=./sigil.db
SESSION_SECRET=                 # pairing token signing
HYPERLIQUID_TESTNET_API=https://api.hyperliquid-testnet.xyz
HYPERLIQUID_AGENT_KEY=          # testnet agent key, never mainnet
ETHEREUM_RPC_URL=               # Sepolia or equivalent testnet RPC
TONCENTER_TESTNET_API=
TELEGRAM_BOT_TOKEN=
STT_PROVIDER=whisper-api        # or whisper-cpp
OPENAI_API_KEY=                 # only when STT_PROVIDER=whisper-api
WHISPER_CPP_PATH=               # only when STT_PROVIDER=whisper-cpp
DRAINER_LIST_PATH=./data/drainers.json
```

Every secret stays in backend environment. The G2 bundle and companion contain zero keys; the companion renders keys as last four characters only.

---

## App Surfaces

- G2 app: single surface, state machine per FRONTEND_SPEC.md §2.1 (IDLE, DECODING, VERDICT, DETAIL, VOICE, STAMP, SUMMARY, ERROR, OFFLINE)
- Companion `/pair`: device pairing by code
- Companion `/`: dashboard, live queue, ledger
- Companion `/settings`: risk rules and integrations
- Telegram bot: request intake and verdict mirrors (not a second approval surface)

---

## What Is Not Being Built in MVP

- Mainnet anything. Every chain call is testnet or read-only. Not a scoping slip, a safety rule of the product
- A mobile wallet or any custody. Sigil never holds funds and never broadcasts a transaction the user's wallet did not prepare
- Model-generated transaction summaries. The sentence is deterministic; an optional "explain" expansion may add derived facts but never re-describes the transaction
- A browser extension or desktop app
- Multi-user teams and sharing
- Fee or monetisation layer
- Automatic approvals of any kind, ever, including for "trusted" recipients

---

## Hackathon Deliverables Checklist

- Public GitHub repository with complete code and a README that states what existed before 23 November
- Demo video up to 3 minutes, running in the Even Hub simulator or on G2, real integrations only
- Short description: the problem, who it is for, how it works, and the tracks (01 + 02)
- Feature requests: up to five things the used APIs were missing (drafted in README.md)
- Optional packaged `.ehpk` build
- Submission on the DoraHacks page before 29 November 2026 20:59 (UTC+1)
- Community named in "How did you hear about this hackathon?" (open question for the builder)

---

## Hackathon Build Priority

Judged on usefulness at a glance (25), read and write (20), technical execution (20), display and voice UX (15), business potential and safety (20).

1. Backend decode + risk + verdict API working end to end on real testnet payloads
2. G2 verdict card loop in the Even Hub simulator: queue, stamp, countdown, auto-deny
3. Hyperliquid testnet order placed after a recorded approval, receipt in the ledger
4. Telegram bot intake and verdict mirror (Best Telegram entry)
5. EVM and TON decode live against testnet RPCs
6. Companion pair, ledger and settings pages
7. Voice path (Whisper) with deterministic intents
8. Quality audit, demo video, submission

---

## Rule: Complete Implementation, No Unfinished Work

This rule is binding for every agent that works in this repository.

Whenever the instruction says "build completely", it means implement everything from beginning to end: every requested feature, function, integration, configuration and deployment. This includes actual live integrations, not just local implementations, mockups or partial builds.

Nothing may be skipped, postponed or left unfinished. Complete the implementation, run all possible tests, verify functionality and fix any issues found.

The only acceptable remaining steps are providing `.env` credentials or secrets that require builder input, and final live testing or confirmation that requires the builder's participation.

Never claim a task is complete while any implementation remains unfinished. If genuinely blocked by an external dependency or permission, clearly explain the blocker and what is needed.

**Definition of done:** everything requested is fully built, integrated not just locally but live too, configured and verified, with nothing outstanding except the explicitly permitted steps above. For this project that means real Hyperliquid testnet, TON testnet, EVM testnet and Telegram Bot API traffic in the tests and the demo, never a mock where a live call is possible.

---

## Builder override: Groq STT

The builder chose Groq for speech to text. `STT_PROVIDER=groq` and `GROQ_API_KEY` replace `whisper-api` and `OPENAI_API_KEY`. The route posts to `https://api.groq.com/openai/v1/audio/transcriptions` with model `whisper-large-v3-turbo`. The original Whisper wording above is retained as the written spec.

