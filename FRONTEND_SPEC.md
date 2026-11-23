# FRONTEND_SPEC.md: SIGIL

Human-readable transaction approval for Even G2. One line of plain English on the glasses, one tap of the ring to let the transaction through or stop it. Built for Heads Up: Even Realities Hackathon by TVM Ventures & Daos Hub (build week 23 to 29 November 2026).

## 0. Project Identity

- Name: Sigil. Text wordmark only, "SIGIL", IBM Plex Mono 600, uppercase, tracking 0.3em. No symbol mark. Comment slot reserved.
- One-line pitch: Every transaction explained in one line on your glasses, let through or stopped with one tap of the ring
- Aesthetic: Forensic instrument. Identity fingerprint: verdict card / one-line statement / phosphor + amber risk / decoded-ribbon evidence / queue rhythm / mechanical stamp motion
- Dials: DESIGN_VARIANCE 7, MOTION_INTENSITY 4, VISUAL_DENSITY 3
- Tracks: 01 Messaging & News (Telegram) + 02 Crypto & DeFi, plus Best Telegram integration prize
- Money safety: testnet, read-only or paper only. No user funds held. No financial advice.

### Gates (all confirmed)

Name and wordmark Sigil, forensic instrument, card queue plus verdict pair, verdict stamp, mechanical snap, phosphor plus amber risk, Space Grotesk plus IBM Plex Mono, sparse on glass and ledger on web. Voice: clinical terse, British English, no em dashes, no marketing adjectives.

### Evidence and assumptions

G2 display 576 × 288 per eye, monochrome green, mic, touch, R1 ring, no camera or speaker. Web app in Even Hub WebView via Even Hub SDK. One app on screen, bring your own STT, backend required, no Google sign-in in WebView. Judging: usefulness 25, read and write 20, technical execution 20, UX 15, business and safety 20. Exact G2 phosphor hex and Even Hub SDK method names to verify at build. Companion and backend deploy targets Vercel and Fly.io or equivalent.

## 1. Global Design System

### 1.1 Fonts

Companion import: `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;700&display=swap`

`--font-display`: Space Grotesk. `--font-mono`: IBM Plex Mono. G2 app bundles latin woff2 subsets, weights 400/500/600/700, with system fallbacks. No runtime CDN fetch in the glasses app.

### 1.2 Colour system

```css
:root {
  --bg-primary:     #0a0d0b;
  --bg-secondary:   #0f1411;
  --bg-surface:     #151b17;
  --bg-elevated:    #1b231e;
  --phosphor:       #4dff9e;
  --phosphor-hover: #7dffb9;
  --phosphor-glow:  rgba(77, 255, 158, 0.10);
  --risk:           #ffb454;
  --risk-glow:      rgba(255, 180, 84, 0.12);
  --text-primary:   #e9f4ee;
  --text-secondary: #8fa79b;
  --text-muted:     #46564e;
  --border-subtle:  rgba(77, 255, 158, 0.06);
  --border-default: rgba(77, 255, 158, 0.14);
  --radius-sm: 2px;  --radius-md: 4px;  --radius-lg: 8px;
  --duration-fast: 120ms;  --duration-normal: 180ms;  --duration-slow: 280ms;
  --ease-snap: cubic-bezier(0.2, 0, 0, 1);
}
```

Risk rule: amber is the only non-phosphor hue. G2 ink `--g2-ink: #3dff8f`, opacity tiers 100 / 72 / 45 / 22.

| Level | G2 glyph and label | G2 border | Companion colour | Companion glyph |
|---|---|---|---|---|
| SAFE | `✓ SAFE` | 1px solid ink 45% | phosphor | `✓` |
| CHECK | `! CHECK` | 1px dashed ink 100% | risk | `!` |
| DANGER | `✕ DANGER` | 2px double ink 100%, bg ink 18% | risk | `✕` |

### 1.3 z-index maps

Companion: z-0 scanlines, z-10 content, z-20 panels, z-40 sheet, z-45 scrim, z-50 top bar, z-60 toast.
G2: z-0 base, z-10 card, z-20 action bar and chip, z-30 detail rows, z-40 voice strip, z-50 stamp, z-60 status toast.

### 1.4 Motion primitives

`--ease-snap: cubic-bezier(0.2, 0, 0, 1)`. Durations 120 / 180 / 280 ms. No springs. Companion entrance: opacity 0 to 1, y 6 to 0, 180 ms, stagger 60 ms, viewport once amount 0.2. G2 card swap: opacity 0 to 1 + translateY 4px to 0, 120 ms. Reduced motion: instant state swap.

### 1.5 Copy voice

Clinical terse, British English. A full stop ends a thought, a comma carries one on. No em dashes in interface copy. Labels, eyebrows and chips carry no trailing punctuation. No "seamless", "powerful", "instant".

## 2. The G2 Application

### 2.0 Hardware canvas contract

Canvas 576 × 288 per eye, monochrome green on black, fixed viewport, no scrollbars. Safe area 20px top/bottom, 24px left/right. Ink tiers 100 / 72 / 45 / 22. 60fps, CSS transitions only. Text ceiling 30px verdict line maximum 2 lines, 14px facts, 11-12px labels.

### 2.1 State machine

IDLE to DECODING to VERDICT. Ring tap to STAMP approved. Ring hold 400ms or voice deny to STAMP denied. Touch strip or voice details to DETAIL ROWS. Countdown 0 to STAMP denied auto. Voice explain replaces statement for 6s. Errors to ERROR. Link loss to OFFLINE. Approval is only reachable from VERDICT with explicit ring tap. No auto-approve path anywhere.

### 2.2 IDLE

Centred shell. Dashed rotated 40px glyph at ink 45. "NO REQUESTS WAITING" mono 13px tracking 0.22em uppercase ink-72. "New signing requests appear here" display 15px ink-45. Bottom hint "TAP TO REFRESH" mono 11px ink-22. Glyph opacity pulse 0.45 to 0.7 over 2.4s linear infinite, off under reduced motion.

### 2.3 DECODING

"READING TRANSACTION" with one dot added every 300ms up to three, then repeats. Three skeleton rows h-4 ink 0.22, pulse 0.22 to 0.45 to 0.22 over 900ms. After 900ms sub-line "Still reading a complex call".

### 2.4 VERDICT CARD

Container relative z-10 flex flex-col h-288 px-6 py-5.
Header h-7: source tag mono 12px uppercase tracking 0.18em ink-72, copy "HYPERLIQUID · TESTNET" / "EVM · SEPOLIA" / "TON · TESTNET" / "TELEGRAM · BOT". Risk chip right z-20, h-6 px-2.5 mono 11px tracking 0.14em uppercase.
Statement mt-5 display bold 30px leading 1.12 ink, one sentence max 2 lines, ellipsis at word boundary. Patterns: "Send 250 USDT to 0x7a3c…9f2c", "Let 0x1f4b…c2e8 move your USDT", "Let 0x1f4b…c2e8 move any amount of your USDT", "Place a testnet order: long HYPE, 500 USDC at market", "Send 12 TON to UQB…k3Fq", "Send 12 TON to UQB…k3Fq with comment 'prize'".
Fact rows mt-4 gap-2 max 3, mono 14px, label 11px uppercase tracking 0.18em ink-45, value ink-72 truncated 6+4. Priority VALUE, TO, NETWORK, FEE, ALLOWANCE, FIRST TIME, SIM. Flagged rows get leading "!".
Action bar absolute bottom h-12 px-6 z-20. Hairline top, width 100% to 0 over countdown updated every 250ms. Left "AUTO-DENY 0:30". Right "TAP ✓  HOLD ✕  SAY 'EXPLAIN'". Countdown 15/30/60, 30 default.

### 2.5 DETAIL ROWS

Slides: SIMULATION, FEE, FLAGS, RAW (selector plus byte count only). Dots indicator. Ring tap advances, wrap returns to VERDICT. 120ms snap.

### 2.6 VOICE overlay

Trigger "Sigil" or touch strip 200ms. Strip bottom h-12 bg-black/70 z-40, label "LISTENING", three meter bars scaleY 0.3 to 1 on 140ms steps. Intents approve, deny, details, explain, next, stop. STT raw audio to backend /stt. 1.5s budget then "COULD NOT HEAR, TRY AGAIN".

### 2.7 STAMP

Overlay fixed inset-0 z-50 pointer-events-none. Box border-2 rounded-sm px-8 py-4 bg-black/85. APPROVED solid border, DENIED dashed. Line 1 mono semibold 22px tracking 0.22em: "✓ APPROVED" / "✕ DENIED" / "✕ DENIED · AUTO". Line 2 mono 11px tracking 0.18em ink-45: timestamp "23 NOV 09:41:07" and "VIA RING" / "VIA VOICE" / "VIA TIMEOUT".
Keyframes: 0% opacity 0 scale 1.45 rotate -7deg; 70% opacity 1 scale 0.98 rotate -3deg; 100% opacity 1 scale 1 rotate -3deg. 160ms plus 60ms settle. Card dims to 0.35 over 120ms. After 900ms overlay snaps out 120ms. Reduced motion: end state held 900ms.

### 2.8 SESSION SUMMARY

"SESSION CLEAR" display 28px. Row "APPROVED 3" "DENIED 2" "EXPIRED 0" mono 13px. "TAP TO RESET".

### 2.9 ERROR and OFFLINE

ERROR: "COULD NOT READ THIS REQUEST" display 22px, failing stage "DECODE FAILED" / "NETWORK DOWN" / "SOURCE REJECTED", hint "TAP TO RETRY  HOLD TO DISMISS". OFFLINE: chip "OFFLINE" dashed, "WAITING FOR LINK", no verdict while backend cannot record one.

### 2.10 Input map

Ring tap in VERDICT approves only. Ring hold 400ms denies. Ring tap in DETAIL advances. Ring tap in IDLE or ERROR refreshes or retries. Touch strip tap 200ms starts voice. Swipe right opens details. Voice intents as above. Countdown 0 auto-denies.

## 3. Companion Web

### 3.1 Shell and top bar

Fixed top bar h-14 bg-secondary/90 backdrop blur border-bottom subtle. Wordmark "SIGIL" mono sm semibold tracking 0.3em uppercase with comment logo slot. Nav PAIR, LEDGER, SETTINGS mono 11px tracking 0.18em uppercase, hover phosphor. Status pill far right. Page pt-14 min-h-screen bg-primary. Scanline layer fixed z-0 opacity 0.03 repeating-linear-gradient(0deg, transparent 0 2px, rgba(77,255,158,0.5) 2px 3px). Content relative z-10 max-w-6xl px-6 md:px-10.

### 3.2 /pair

Centred card max-w-md bg-surface border default rounded-lg p-8. Eyebrow "DEVICE PAIRING" phosphor. Heading "Enter the code on your glasses". Body "Open Sigil on the glasses and type the six characters shown here. The code expires in ten minutes." Code mono 40px tracking 0.35em phosphor tabular-nums, format K7-4M2. Countdown "EXPIRES IN 09:58". "REGENERATE CODE". States generating, paired, expired, error.

### 3.3 /

Stat strip grid 2 by 2 md 4 across gap-px border subtle rounded-lg. Cells WAITING (phosphor at 0, risk at 1 or more), APPROVED TODAY, DENIED TODAY, AUTO-DENIED. Numbers mono 3xl tabular, labels mono 10px tracking 0.2em. Count 0 to value over 1.2s ease-out once.
Live queue heading "WAITING". Ledger heading "LEDGER" with filter chips ALL, APPROVED, DENIED, RISK.
Ledger row grid 110px 90px 1fr 120px 120px, md 130px 100px 1fr 140px 140px, gap-4 py-3 border-bottom subtle. Time mono xs muted, source mono 11px uppercase secondary, plain line body primary truncate, risk chip, verdict mono 11px uppercase: "✓ APPROVED · RING" phosphor, "✕ DENIED · VOICE" risk, "✕ AUTO-DENY" muted. Hover bg-surface 120ms. Click expands inline detail with facts, raw selector, byte count, testnet explorer link. Height 0 to auto 180ms. Empty "NOTHING RECORDED YET" and "Pair a device and the first verdict lands here". Mobile two lines, horizontally scrollable chips.

### 3.4 /settings

max-w-2xl. Groups VERDICT RULES, TRUSTED RECIPIENTS, INTEGRATIONS, VOICE. Field rows py-4 border-bottom subtle with visible labels. Auto-deny segmented 15s 30s 60s, 30 default. Value threshold mono number input. Trusted recipients repeatable mono rows with visible REMOVE and inline confirm. Integrations status rows with last four characters only, ROTATE and DISCONNECT. Voice toggle RING WAKE WORD and STT language select. Save instant with toast "Saved." 1.8s. Invariant always visible: "Sigil never auto-approves. Timeouts can only deny."

## 4. Interactions and state behaviour

Companion interaction table: pair code appears generating to code with skeleton 900ms, filter chip instant 120ms opacity, ledger row toggle 180ms with Enter/Space and Escape, remove recipient inline confirm then toast "Removed.", setting change persisted toast "Saved." 1.8s.
State inventory: G2 queue IDLE/DECODING/VERDICT/STAMP/ERROR/OFFLINE. Pair card generating/skeleton/paired/expired/mismatch. Ledger full/skeleton/empty/expanded/fetch failure. Settings saved/toasts.
Verdict transition table as §2.1 with data kept noted.
Input ownership: ring tap or hold owns verdict and row advance with 400ms threshold and cancel on early release. Touch strip owns voice wake and detail swipe with 12px axis lock. Voice overlay owns six intents, auto-dismiss after 4s silence.

## 5. Motion and transitions

Card swap opacity 0 to 1, y 4 to 0, 120ms. Verdict stamp opacity 0 to 1, scale 1.45 to 1, rotate -7 to -3deg, 160ms plus 60ms settle, end state held 900ms. Card dim 1 to 0.35 120ms linear. Countdown hairline 100% to 0 linear. Skeleton pulse 900ms linear infinite. Voice meter 140ms steps. Count-up 1.2s ease-out once. Ledger expand 180ms. Toast 180ms in, 1.8s hold, 120ms out. Idle glyph pulse 2.4s linear infinite. Everything else still.

## 6. Responsive and adaptive behaviour

G2 fixed 576 × 288. Statement ellipsises at word boundaries at 2 lines. Fact rows 3 to 2 below 24-character average value. Font sizes never scale down.
Companion: phone below 768px ledger two lines, stat strip 2 by 2, chip rail scrolls, risk chip and verdict always visible. Tablet 768-1024 four across. Desktop above 1024 max-w-6xl, keyboard j/k rows, Enter expand. Zoom 200% rows stack, no horizontal scroll.

## 7. Accessibility

Risk never rides on colour alone. Full companion keyboard operability with visible focus ring. Ledger rows are buttons with complete accessible names. Status changes aria-live polite. Reduced motion disables loops. Every voice intent has a ring or touch equivalent. Contrast at least 4.5:1 below 18px. Timeout announced in action bar and by voice. WCAG 2.2 AA target.

## 8. Technical approach and tools

G2: Vite, TypeScript, Tailwind, Even Hub SDK, CSS transitions only, woff2 subsets. Companion: Next.js 14 App Router, TypeScript, Tailwind, motion/react. Backend: Node.js, TypeScript, Fastify, viem, TON libraries, grammY, Groq Whisper, SQLite. Deterministic sentence by template. Secrets in backend env only. Vitest and Playwright.

## 9. Assets and image briefs

Wordmark SIGIL live text. No logo symbol, favicon or generated imagery. Scanline texture CSS only. G2 glyphs as font glyphs. Product proof from real simulator recordings only.

## 10. Acceptance criteria

Real signing request flows source to G2 card under 3 seconds. Sentence deterministic. Only ring tap or voice approve, no auto-approve path. Stamp exact values. Risk glyph plus label plus border. Telegram mirror within 2 seconds. Ledger complete. No client secrets. Offline blocks verdicts. Copy matches §1.5, no em dash. Visual review complete.

## 11. Handoff notes

Open question: community to name on DoraHacks. Verify at build: G2 phosphor hex, Even Hub SDK method names, testnet endpoint behaviour. Risks: STT latency in demo, WebView font loading.

## 12. Spec completeness check

All screens and states specified. Every primary action has trigger, outcome, feedback and recovery. Data and side effects truthful. Copy final. Signature effect specified. Motion values and reduced-motion paths concrete. Breakpoints concrete. Assets stated. Tools named. IDs and values agree. Input ownership defined. Spec saved as FRONTEND_SPEC.md in the project repository.
