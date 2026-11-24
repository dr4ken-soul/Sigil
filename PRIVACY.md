# Sigil Privacy Notice

Sigil is a human-readable transaction approval layer for Even G2 smart glasses. This notice explains what the demo stores and what it does not.

## What Sigil reads

- Signing requests you deliberately forward to the Telegram bot, including transaction hashes or payloads you send
- Verdicts you record with a ring tap, voice command or timeout
- Pairing codes used to bind a glasses install or bot to an account

## What Sigil stores

- Request facts, verdict, timestamp and route in a SQLite ledger on the operator's own server
- Settings such as timeout, thresholds and trusted recipients
- No private keys, mnemonics, seed phrases or wallet funds

## What Sigil does not do

- No mainnet traffic in this build. Every chain call is testnet or read-only
- No reading of Telegram history beyond commands and payloads you send the bot
- No sale or sharing of request data with third parties
- No advertising trackers and no analytics in the glasses bundle

## Third-party services

The demo uses testnet RPC endpoints, TON Center testnet, Hyperliquid testnet, Telegram Bot API and Groq for speech to text. Keys stay in the backend environment. The companion shows only the last four characters of configured keys.

## Contact

Questions about this notice can be sent to psychotedev@gmail.com.
