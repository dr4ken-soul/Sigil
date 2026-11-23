# MARKETING.md: Sigil

## Goal

Get Sigil in front of the Heads Up judges (Even Realities, TVM Ventures, partner VCs, Daos Hub) and the crypto builder audience during build week without sounding like a pitch deck.

The story is simple: people sign transactions they cannot read. Sigil reads them out loud in one line on a pair of glasses and asks for one tap. Every post proves the product works, not that the idea is interesting.

Core proof to show in public: a real testnet request landing on the glasses, a real DANGER verdict on an unlimited approval, one ring tap placing a real Hyperliquid testnet order, the Telegram mirror updating live.

## Posting Style

- all lowercase
- builder voice, not company voice
- one clear idea per post
- short lines with space between thoughts
- show what works, never explain what you plan to build
- the demo video does the heavy lifting, copy supports it

## Post Plan

### post 1, project announcement

```
building sigil for the @EvenRealities heads up hackathon 🟢

the most dangerous moment in crypto is the five seconds before you tap "sign", and your wallet shows you a hex blob

sigil puts one line of plain english on the glasses: "send 250 USDT to 0x7a3c…9f2c", safe, check or danger, one tap of the ring to let it through or stop it

no model writes that sentence. it comes from decoding the transaction itself, same request, same words, every time

testnet only. never holds funds. never auto-approves.

demo drops before submission @[date]
```

Attach a 60-second screen recording of one request travelling from Telegram to the glasses to the stamp.

### post 2, final submission

```
submitted sigil to the heads up hackathon

one glance explains the transaction, one tap of the ring decides it, a stamp records it

live: hyperliquid testnet orders placed from the glasses, unlimited approvals flagged danger, TON transfers decoded, Telegram mirrors updating in chat

the audit ledger keeps every verdict. time, source, sentence, route.

[demo link] [repo link] [even hub listing if published]
```

Attach the final demo video and the repository link.

---

## Submission Notes

**Project title:** Sigil

**Tagline:** Read before you sign.

**Category:** Tracks 01 (Messaging & News, Telegram) and 02 (Crypto & DeFi, Gram Wallet, Hyperliquid, Trust Wallet), plus Best Telegram integration

**Money safety line:** every demo runs on testnet or read-only data. Sigil holds no funds and gives no financial advice.

**Built with:**
- Vite + TypeScript + Tailwind (Even Hub G2 app)
- Next.js 14 + Tailwind + motion/react (companion)
- Node.js + Fastify + SQLite (backend)
- viem (EVM), official TON libraries, Hyperliquid testnet API
- grammY (Telegram Bot API)
- Whisper (speech to text)

**Project description (under 200 words):**

Sigil is a human-readable transaction approval layer for Even G2 smart glasses. Signing requests from Hyperliquid testnet orders, EVM transactions, TON transfers and the Telegram bot are decoded, simulated and risk-scored on the Sigil backend, then delivered to the glasses as one deterministic sentence of plain English with a SAFE, CHECK or DANGER verdict carried by glyph and label, never colour alone. The ring tap approves, a hold or voice denies, a 30-second countdown auto-denies for safety, and a mechanical verdict stamp records the decision in an audit ledger before any testnet execution step runs. The sentence is built from decoded facts by fixed templates rather than a language model, so the same request always produces the same words, which matters when the sentence is the only thing standing between a user and a drainer. The Telegram bot mirrors every verdict back to the chat it came from. The companion site pairs devices by code, holds risk rules, and keeps the full audit trail. Sigil never holds funds, never auto-approves, and never touches mainnet in this build.

**Demo video flow (under 3 minutes):**
1. Telegram request forwarded; glasses show the verdict card, SAFE (25 seconds)
2. Ring tap approves; stamp lands; mirror updates in chat (25 seconds)
3. Unlimited-approval request arrives; ✕ DANGER, detail row shows the flag; ring hold denies (30 seconds)
4. Hyperliquid testnet order approved on glasses; testnet order placed; receipt in ledger (30 seconds)
5. TON transfer decode with comment (20 seconds)
6. Companion: ledger, facts, explorer links, settings invariant "Sigil never auto-approves" (25 seconds)
7. Voice path: "deny" and "explain" on real audio (15 seconds)
8. End on the SIGIL wordmark (5 seconds)

---

## Checklist

- [ ] Registered on DoraHacks before submission, community named in "How did you hear about this hackathon?" (fill before submitting, this drives the Community Partner Award)
- [ ] Post 1 goes out once the simulator flow is real on camera
- [ ] Demo video recorded in the Even Hub simulator or on G2, trimmed to 3 minutes
- [ ] Post 2 goes out at submission
- [ ] Repo public, README carries the pre-23 November statement and the feature requests
- [ ] Submitted before 29 November 2026, 20:59 (UTC+1)
- [ ] Demo Day 3 December: remote demo slot confirmed if not attending Dubai

---

## Builder override: Groq STT

The builder chose Groq for speech to text. `STT_PROVIDER=groq` and `GROQ_API_KEY` replace `whisper-api` and `OPENAI_API_KEY`. The route posts to `https://api.groq.com/openai/v1/audio/transcriptions` with model `whisper-large-v3-turbo`. The original Whisper wording above is retained as the written spec.
