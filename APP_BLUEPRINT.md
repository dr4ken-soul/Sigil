# Sigil: App Blueprint

## Product Summary

Sigil is a human-readable transaction approval layer for Even G2 smart glasses. A signing request (Hyperliquid testnet order, EVM transaction, TON transfer, or one forwarded through the Telegram bot) is decoded, simulated and scored by the Sigil backend, then delivered to the glasses as one sentence of plain English with a risk verdict. The ring tap lets it through, a hold or a voice command stops it, and a mechanical stamp records the decision in an audit ledger on the companion site.

Built for the Heads Up: Even Realities Hackathon by TVM Ventures & Daos Hub, build week 23 to 29 November 2026, submission deadline 29 November 2026 20:59 (UTC+1), Demo Day 3 December 2026 at Daos Hub, Dubai (remote demo allowed). G2 is the display, voice and input layer only. Execution and custody stay with the underlying providers, reached through their APIs, and every demo runs on testnet or read-only data.

Sigil is the check that blind signing never had. Remove the glasses and it is still a decode and risk service; keep them and a decision that used to take a phone, a block explorer and a leap of faith takes one glance and one tap.

## MVP Feature Set

1. Request ingestion and decoding from four live sources: Hyperliquid testnet orders, EVM transactions, TON testnet transfers and Telegram bot payloads. Deterministic explain pipeline, simulation pass, loud failure on undecodable calldata.
2. Risk verdict: SAFE, CHECK or DANGER from unlimited allowances, first-time recipients, drainer list, hidden approve-then-transfer patterns, value thresholds, unusual selectors, TON comment patterns and Hyperliquid leverage caps. Flags are facts, not advice.
3. The verdict loop on G2: 576 × 288 display, ring tap approves, ring hold or voice denies, 30-second auto-deny, verdict stamp with timestamp and route, recorded before any execution step. Offline blocks verdicts.
4. Telegram request channel: pairing code, forwarded requests, verdict mirror with reflect-only inline buttons, channel alerts.
5. Companion ledger and settings: code pairing, live queue, dense audit ledger, risk rules, timeouts, trusted recipients, integrations shown as last four characters only.

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| G2 app | Vite, TypeScript, Tailwind, Even Hub SDK | Required web app form, static assets, CSS transitions only |
| Companion | Next.js 14 App Router, TypeScript, Tailwind, motion/react | Standard deploy, specified transitions only |
| Backend | Node.js, TypeScript, Fastify | One language, SSE stream, small deployable unit |
| EVM work | viem | Decode, eth_call simulation, testnet reads and writes |
| TON work | official TON JS libraries | Transfer decode and testnet settlement preview |
| Hyperliquid | api.hyperliquid-testnet.xyz | Real testnet order placement, never mainnet |
| Telegram | grammY | Requests in, verdict mirrors out |
| Speech to text | Whisper via API or local whisper.cpp (env switch) | Bring your own STT |
| Explain pipeline | deterministic templates | A security product must not hallucinate |
| Database | SQLite (better-sqlite3) | Audit ledger on operator's own server |
| Pairing | six-character codes + signed session tokens | No Google sign-in in the WebView |
| Hosting | Fly.io or Railway for backend, Vercel for companion | Persistent SSE, simple static deploy |

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
  network: string
  plainLine: string
  facts: FactRow[]
  risk: { level: RiskLevel; flags: RiskFlag[] }
  raw: { kind: 'evm-tx' | 'ton-transfer' | 'hl-order'; digest: string; byteLength: number }
  status: RequestStatus
  createdAt: number
  autoDenyAt: number
  verdict?: { route: 'ring' | 'voice' | 'timeout'; at: number }
  telegramChatId?: number
  telegramMessageId?: number
}

interface RiskRules {
  checkAboveUsd: number
  maxLeverage: number
  trustedRecipients: Set<string>
  drainers: Set<string>
}

interface PairingSession { code: string; expiresAt: number; boundDeviceId?: string }
```

## Backend API Surface

| Route | Caller | Description |
|---|---|---|
| `POST /pair` | companion | Create six-character pairing code, 10-minute expiry |
| `POST /pair/confirm` | G2 app, Telegram bot | Bind device with code, return session token |
| `POST /requests` | bot, HL session monitor, companion | Ingest request, return decoded verdict card payload |
| `GET /queue` | G2 app | Next pending request for this device |
| `GET /requests/:id` | companion | Full record including facts and raw digest |
| `POST /requests/:id/verdict` | G2 app | Record approve/deny with route, the only status-changing path |
| `POST /requests/:id/expiry` | backend timer | Auto-deny at deadline, flagged as expired |
| `GET /stream` | G2 app (SSE) | Live queue push |
| `POST /stt` | G2 app | Raw audio in, intent text out |
| `POST /telegram/webhook` | Telegram | Bot updates |
| `GET /ledger` | companion | Filtered verdict history |
| `PUT /settings` | companion | Risk rules, timeouts, voice options |

Execution actions run server-side only after a recorded approval. Receipts re-enter the ledger.

## Deterministic explain pipeline

```typescript
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

## Risk engine

```typescript
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
  const level = flags.some((f) => f.level === 'danger') ? 'danger' : flags.length > 0 ? 'check' : 'safe'
  return { level, flags }
}
```

## Voice intent route

```text
raw mic (Even Hub SDK) → POST /stt (Whisper) → normalise text →
match intents in order: approve | deny | stop | details | explain | next →
unknown intent returns "COULD NOT HEAR, TRY AGAIN", never guesses an action
```

## Environment Variables

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

Every secret stays in backend environment. The G2 bundle and companion contain zero keys; the companion renders keys as last four characters only.

## App Surfaces

G2 app: IDLE, DECODING, VERDICT, DETAIL, VOICE, STAMP, SUMMARY, ERROR, OFFLINE. Companion `/pair`, `/`, `/settings`. Telegram bot intake and verdict mirrors.

## What Is Not Being Built in MVP

Mainnet anything, a wallet or custody, model-generated transaction summaries, browser extension, teams, monetisation, automatic approvals of any kind.

## Hackathon Deliverables Checklist

- Public GitHub repository with complete code and a README that states what existed before 23 November
- Demo video up to 3 minutes, real integrations only
- Short description: problem, audience, how it works, tracks 01 + 02
- Up to five API feature requests in README.md
- Optional packaged `.ehpk` build
- Submission on the DoraHacks page before 29 November 2026 20:59 (UTC+1)
- Community named in "How did you hear about this hackathon?"

## Rule: Complete Implementation, No Unfinished Work

Binding for every agent in this repository. Whenever the instruction says "build completely", implement everything from beginning to end: every requested feature, function, integration, configuration and deployment, including live integrations. Nothing may be skipped or left unfinished. Run all possible tests, verify functionality and fix issues. The only acceptable remaining steps are providing credentials that require builder input and final live testing requiring the builder's participation. Never claim completion while implementation remains unfinished.
