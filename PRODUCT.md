# PRODUCT.md: Sigil

## What Sigil Does

Sigil explains what a crypto transaction will actually do, in one sentence, on a pair of Even G2 smart glasses, before you let it happen. Ring tap to approve. Hold to deny. The decision is stamped and recorded.

It works on the transactions people really sign: Hyperliquid testnet orders, wallet sends and approvals on EVM testnets, TON transfers, and transaction requests forwarded through a Telegram bot.

## Who It Is For

- Self-custody users who are tired of signing screens that show a hex blob instead of a consequence
- Traders on Hyperliquid testnet who want a hands-free confirmation ritual during a session
- Telegram-native users who receive transaction requests in chats and want a private place to decide

## How It Works

1. A signing request arrives at the Sigil backend from one of the four sources
2. The backend decodes it (what contract, what method, what moves where), simulates the effect, and scores risk from facts: unlimited allowances, first-time recipients, known drainer addresses, value thresholds, leverage caps
3. The glasses show one line: "Send 250 USDT to 0x7a3c…9f2c", with a risk verdict (SAFE, CHECK or DANGER) carried by glyph, label and border, never colour alone
4. You decide: ring tap approves, ring hold or voice denies, and if you do nothing for 30 seconds the request is denied for safety
5. A mechanical stamp records the verdict, the companion ledger keeps the audit trail, and the Telegram mirror updates the chat

The sentence is built from decoded facts by fixed templates. No model writes it. The same request always produces the same words.

## What It Produces

- A verdict card on G2: one sentence, up to three fact rows, a risk chip, a countdown
- A stamped decision with timestamp and route (ring, voice or timeout)
- An audit ledger on the companion site with expandable facts and testnet explorer links
- Mirrored verdicts in Telegram chats and channels

## What Sigil Never Does

- Hold funds, keys or mnemonics. Execution stays with the provider you already use
- Auto-approve anything, including for "trusted" recipients
- Give financial advice. Flags are facts about a transaction, not recommendations
- Touch mainnet in this build. Everything is testnet or read-only
- Read your Telegram beyond the commands and requests you send the bot

## Where the Name Comes From

A sigil is a seal pressed onto something to mark it as understood and allowed. Only what you comprehend and approve passes through.
