# FRONTEND_SPEC.md: SIGIL

Human-readable transaction approval for Even G2. One line of plain English on the glasses, one tap of the ring to let the transaction through or stop it. Built for Heads Up: Even Realities Hackathon by TVM Ventures & Daos Hub (build week 23–29 November 2026).

---

## 0. Project Identity

- **Name:** Sigil
- **One-line pitch:** Every transaction explained in one line on your glasses, let through or stopped with one tap of the ring
- **Aesthetic (Gate 1):** Forensic instrument
- **Identity Fingerprint (§0C):** verdict card / one-line statement / phosphor + amber risk / decoded-ribbon evidence / queue rhythm (one thing at a time) / mechanical stamp motion
- **Dials:** DESIGN_VARIANCE 7, MOTION_INTENSITY 4, VISUAL_DENSITY 3
- **Crypto category:** B, off-chain tool with live testnet touches. Sigil never holds funds and never broadcasts a user transaction the user's own wallet has not prepared
- **Tracks entered:** 01 Messaging & News (Telegram) + 02 Crypto & DeFi (Gram Wallet, Hyperliquid, Trust Wallet sourced flows), plus the Best Telegram integration prize
- **Money safety (hackathon rule):** testnet, read-only or paper only. No user funds held. No financial advice anywhere in copy

### Gate confirmation (all gates confirmed)

| Gate | Decision |
|---|---|
| 0 Name and wordmark | Sigil. Text wordmark only: "SIGIL", IBM Plex Mono 600, uppercase, tracking 0.3em. No symbol mark. Comment slot reserved in code for any future mark |
| 1 Aesthetic | Forensic instrument |
| 2 Navigation and shell | Card queue + verdict pair. One request per screen on G2. Ring tap = approve, ring hold or voice = deny. Companion mirrors the queue |
| 3 Signature moment | Verdict stamp: a mechanical APPROVED / DENIED stamp snaps over the card |
| 4 Motion character | Mechanical snap. 120-180 ms transitions, no springs, relay-flip state changes |
| 5 Colour | Phosphor + amber risk. Companion is graphite + phosphor green; amber is the only other hue and is reserved for risk states. G2 is hardware-fixed monochrome green |
| 6 Typography | Space Grotesk (human sentences) + IBM Plex Mono (machine facts) |
| 7 Density and rhythm | Sparse on glass (one dominant element per screen), ledger on web (dense rows under sparse headings) |
| Voice | Clinical terse, British English, COPY_GUIDELINES punctuation, no em dashes, no marketing adjectives |

### Evidence and assumptions

| Statement | Type | Source | Confidence or open question |
|---|---|---|---|
| G2 display 576 × 288 per eye, monochrome green; mic, touch, R1 ring; no camera or speaker | User-provided | Hackathon brief | Fixed constraint |
| App is a web app in the Even Realities App WebView, talks to G2 via Even Hub SDK over Bluetooth | User-provided | Hackathon brief | Fixed constraint |
| One app on screen at a time; no pop-ups when app is closed; bring your own STT; backend required; no Google sign-in in WebView | User-provided | Hackathon brief | Fixed constraint |
| Judging: usefulness 25, read and write 20, technical execution 20, UX 15, business and safety 20 | User-provided | Hackathon brief | Fixed |
| All seven gates and scope decisions above | Decision | Gate walkthrough 2026-11-23 | Confirmed by user |
| Exact G2 phosphor green hex and Even Hub SDK method names | Assumption | To verify against hub.evenrealities.com docs and the simulator at build time | Values in this spec use token names so one constant changes at wiring |
| Hyperliquid testnet, TON testnet, EVM testnet RPCs and Telegram Bot API behave as their current public docs describe | Research-backed | Public API docs, verify at build | Live-tested in build phase 6 |
| Companion and backend deploy targets (Vercel + Fly.io or equivalent) | Decision | Reversible at deploy time | User can override |

---

## 1. Global Design System

### 1.1 Fonts (Gate 6)

Companion web import:

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;700&display=swap');
```

- `--font-display`: 'Space Grotesk', system-ui, sans-serif. Human sentences, headings, verdict lines
- `--font-mono`: 'IBM Plex Mono', ui-monospace, monospace. Machine facts, labels, eyebrows, addresses, amounts, timestamps

G2 app: the same two families as subset woff2 files bundled into the WebView app (latin subset, weights 400/500/600/700 only), with `system-ui` and `ui-monospace` fallbacks so the app stays legible if a font fails to load. Fonts must not be fetched from a CDN at runtime inside the glasses app.

### 1.2 Colour system (Gate 5)

Companion web (Tailwind config keys in brackets):

```css
:root {
  --bg-primary:     #0a0d0b;   /* bg-base    */
  --bg-secondary:   #0f1411;   /* bg-sunk    */
  --bg-surface:     #151b17;   /* bg-panel   */
  --bg-elevated:    #1b231e;   /* bg-lift    */
  --phosphor:       #4dff9e;   /* phosphor   */
  --phosphor-hover: #7dffb9;   /* phosphor-hi*/
  --phosphor-glow:  rgba(77, 255, 158, 0.10);
  --risk:           #ffb454;   /* risk       */
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

Risk rule (monochrome survival): amber is the only non-phosphor hue in the entire product. On the G2 display (monochrome) risk is carried by glyph, label and border treatment, never colour alone:

| Level | G2 glyph and label | G2 border | Companion colour | Companion glyph |
|---|---|---|---|---|
| SAFE | `✓ SAFE` | 1px solid ink 45% | phosphor | `✓` |
| CHECK | `! CHECK` | 1px dashed ink 100% | risk (amber) | `!` |
| DANGER | `✕ DANGER` | 2px double ink 100%, bg ink 18% | risk (amber) | `✕` |

Status semantics elsewhere use phosphor for live/positive and amber for attention. There is no red, no traffic-signal green, no second accent.

### 1.3 Global z-index maps

Companion web:

```
z-0   scanline texture layer (repeating-linear-gradient, 3% opacity, pointer-events-none)
z-10  page content
z-20  floating panels (pairing card, modal bodies)
z-40  sheet / drawer panel
z-45  sheet scrim (fixed inset-0 bg-black/60)
z-50  fixed top bar (wordmark, status pill, nav tabs)
z-60  toast strip
```

G2 app (single 576 × 288 canvas):

```
z-0   base surface (pure black) + hairline frame
z-10  card content (header, statement, facts)
z-20  pinned action bar and risk chip
z-30  detail rows overlay
z-40  voice listening strip
z-50  verdict stamp
z-60  status toast line
```

### 1.4 Motion primitives (Gate 4, mechanical snap)

Shared easing token `--ease-snap: cubic-bezier(0.2, 0, 0, 1)`. Durations: 120 ms fast, 180 ms normal, 280 ms slow. No springs anywhere.

Companion standard entrance (the only routine reveal):

```
initial:   { opacity: 0, y: 6 }
animate:   { opacity: 1, y: 0 }
transition:{ duration: 0.18, ease: [0.2, 0, 0, 1] }
stagger:   60ms per child, base delay 0
viewport:  { once: true, amount: 0.2 }
```

G2 app uses CSS transitions and keyframes only (WebView budget). Standard swap between card states: `opacity 0→1 + translateY 4px→0`, 120 ms, `--ease-snap`. Reduced motion: every transition becomes an instant state swap (0 ms), skeletons stop pulsing, the stamp appears at its end state.

### 1.5 Copy voice (Gate 7 and voice gate)

Clinical terse, British English. COPY_GUIDELINES punctuation rule governs everything: a full stop ends a thought, a comma carries one on. No em dashes in interface copy. Labels, eyebrows and chips carry no trailing punctuation. Sentence fragments are allowed on the glass when the thought is complete ("Not a launch." style: "Unlimited allowance." is a complete warning). Verdict sentences are deterministic output built from decoded facts, never generated prose. No adjectives like "seamless", "powerful", "instant" anywhere.

---

## 2. The G2 Application

Product grammar: a glance utility. One request on screen at a time, decide in seconds, hands free. The glasses are display, voice and input only. Execution stays with the underlying provider.

### 2.0 Hardware canvas contract

```
Canvas: 576 × 288 per eye, monochrome green on black. Fixed viewport, no scrollbars
Safe area: 20px top/bottom, 24px left/right. Action bar pinned inside the bottom safe area
Ink tiers (Tailwind tokens): text-ink (100%), text-ink-72, text-ink-45, text-ink-22
  --g2-ink: #3dff8f (nominal phosphor; one constant to correct against real hardware)
Perf budget: 60fps with zero dropped frames on a mid-range phone; CSS transitions only,
  no WebGL, no large images, no runtime font fetch
Text ceiling: 30px verdict line, 2 lines maximum; 14px facts; 11-12px labels
```

### 2.1 State machine

```text
IDLE (queue empty) → tap/ring: refresh
IDLE → request arrives → DECODING (≤ 900ms budget before "still reading" copy)
DECODING → verdict ready → VERDICT CARD
VERDICT → ring tap → STAMP (APPROVED) → receipt line → next request or IDLE
VERDICT → ring hold (400ms) or voice "deny" → STAMP (DENIED) → next request or IDLE
VERDICT → tap touch strip or voice "details" → DETAIL ROWS (ring advances, back to VERDICT)
VERDICT → countdown reaches 0 → STAMP (DENIED, "AUTO-DENY") → next request
any → voice "explain" → EXPLAIN LINE replaces statement for 6s, then returns
any error → ERROR state with retry action
```

Guard rule: approval is only reachable from VERDICT CARD with an explicit ring tap. There is no auto-approve path anywhere in the product.

### 2.2 Screen: IDLE (queue empty)

```
Layout: flex flex-col items-center justify-center h-[288px] px-6 text-center
Glyph: w-10 h-10 border border-dashed border-[color:var(--g2-ink)] opacity-45 rotate-45 (coded, not an asset)
Line 1: font-mono text-[13px] tracking-[0.22em] uppercase text-ink-72  "NO REQUESTS WAITING"
Line 2: font-display text-[15px] text-ink-45  "New signing requests appear here"
Hint:   absolute bottom-5 font-mono text-[11px] tracking-[0.18em] text-ink-22  "TAP TO REFRESH"
Motion: glyph opacity pulse 0.45 → 0.7 over 2.4s linear infinite (off under reduced motion)
```

### 2.3 Screen: DECODING

```
Shell identical to the verdict card (header row keeps the source tag, risk chip shows "… " placeholder)
Statement slot: font-mono text-[13px] tracking-[0.22em] uppercase text-ink-72
  Text: "READING TRANSACTION" with one dot added every 300ms up to three, then repeats
Skeleton rows (x3): h-4 bg-[color:var(--g2-ink)] opacity-[0.22] rounded-sm
  pulse: opacity 0.22 → 0.45 → 0.22, 900ms linear infinite (reduced motion: static 0.3)
After 900ms the sub-line swaps to font-display text-[13px] text-ink-45 "Still reading a complex call"
```

### 2.4 Screen: VERDICT CARD (the product)

```
Container: relative z-10 flex flex-col h-[288px] px-6 py-5

HEADER ROW (h-7, flex items-center justify-between):
  Source tag (left):
    font-mono text-[12px] uppercase tracking-[0.18em] text-ink-72
    copy: "HYPERLIQUID · TESTNET" | "EVM · SEPOLIA" | "TON · TESTNET" | "TELEGRAM · BOT"
  Risk chip (right, z-20):
    inline-flex items-center gap-1.5 h-6 px-2.5 rounded-sm font-mono text-[11px] tracking-[0.14em] uppercase
    SAFE:   border border-ink-45 text-ink            content "✓ SAFE"
    CHECK:  border border-dashed border-ink text-ink   content "! CHECK"
    DANGER: border-2 border-double border-ink bg-[color:var(--g2-ink)]/20 text-ink  content "✕ DANGER"

STATEMENT (the one thing):
  mt-5 font-display font-bold text-[30px] leading-[1.12] text-ink
  one sentence, maximum 2 lines, ellipsis at word boundary
  deterministic copy patterns (built from decoded facts, never prose):
    EVM send        "Send 250 USDT to 0x7a3c…9f2c"
    EVM approve     "Let 0x1f4b…c2e8 move your USDT"
    EVM approve-all "Let 0x1f4b…c2e8 move any amount of your USDT"
    HL testnet      "Place a testnet order: long HYPE, 500 USDC at market"
    TON transfer    "Send 12 TON to UQB…k3Fq"
    TON with memo   "Send 12 TON to UQB…k3Fq with comment 'prize'"

FACT ROWS (mt-4, flex flex-col gap-2, maximum 3 rows):
  each row: flex items-baseline justify-between font-mono text-[14px]
    label: text-[11px] uppercase tracking-[0.18em] text-ink-45
    value: text-ink-72, addresses and hashes truncated to 6+4 characters
  rows chosen in priority order: VALUE | TO | NETWORK | FEE | ALLOWANCE | FIRST TIME | SIM
  any flagged fact gets a leading "!" glyph in text-ink (for example "! first transfer to this recipient")

ACTION BAR (absolute bottom-0 left-0 right-0 h-12 px-6, z-20):
  hairline progress: absolute top-0 left-0 h-px bg-ink-22
    width shrinks 100% → 0 linearly with the auto-deny countdown, updated every 250ms
  left: font-mono text-[12px] tracking-[0.18em] text-ink-45  "AUTO-DENY 0:30"  (mm:ss)
  right: font-mono text-[11px] tracking-[0.14em] text-ink-22  "TAP ✓  HOLD ✕  SAY 'EXPLAIN'"

Countdown: 30s default, user-configurable 15 / 30 / 60 in companion settings.
```

### 2.5 Detail rows (ring advance)

Entered by touch-strip tap or voice "details". One fact per glance, same card shell, statement slot replaced by the detail block:

```
Detail slot: font-mono text-[15px] text-ink-72 leading-relaxed, label line text-ink-45 text-[11px] uppercase tracking-[0.18em]
Rows in rotation: "SIMULATION" (balance changes line) | "FEE" | "FLAGS" (each flag one line) | "RAW" (selector + byte count only)
Indicator: bottom centre, flex gap-1.5, one 4px dot per detail row, active dot bg-ink, others bg-ink-22
Ring tap advances; wrapping past the last row returns to VERDICT CARD
Motion: content swap uses the standard 120ms snap
```

### 2.6 Voice overlay

```
Trigger: user says "Sigil" or presses the touch strip for 200ms while in VERDICT
Strip: absolute bottom-0 inset-x-0 h-12 bg-black/70 z-40 flex items-center gap-3 px-6
  label: font-mono text-[11px] tracking-[0.22em] uppercase text-ink  "LISTENING"
  meter: flex gap-1 (3 bars, w-1 h-4 bg-ink), scaleY animates 0.3 → 1 on random
    cadence, 140ms steps, --ease-snap; reduced motion: static bars at 0.6
Intents (deterministic, matched before any model call): "approve" | "deny" |
  "details" | "explain" | "next" | "stop"
STT path: raw microphone audio from the Even Hub SDK → backend /stt (Whisper) →
  intent match. Latency budget 1.5s before the strip shows "COULD NOT HEAR, TRY AGAIN"
```

### 2.7 STAMP (signature moment, Gate 3)

```
Overlay: fixed inset-0 z-50 flex items-center justify-center pointer-events-none
Box: relative border-2 rounded-sm px-8 py-4 bg-black/85
  APPROVED: border-solid  border-[color:var(--g2-ink)]
  DENIED:   border-dashed border-[color:var(--g2-ink)]
  content line 1: font-mono font-semibold text-[22px] tracking-[0.22em] text-ink
    "✓ APPROVED" | "✕ DENIED" | "✕ DENIED · AUTO"
  content line 2: font-mono text-[11px] tracking-[0.18em] text-ink-45 mt-2
    timestamp "23 NOV 09:41:07" + verdict route "VIA RING" | "VIA VOICE" | "VIA TIMEOUT"

Animation (CSS keyframes, plays once):
  0%    opacity 0,  scale 1.45, rotate -7deg
  70%   opacity 1,  scale 0.98, rotate -3deg
  100%  opacity 1,  scale 1,    rotate -3deg
  duration 160ms + 60ms settle, --ease-snap
Card beneath dims to opacity 0.35 over 120ms when the stamp lands
After 900ms the whole overlay snaps out (opacity 1 → 0, 120ms) and the next
  request enters, or IDLE shows
Reduced motion: no scale or rotate; the box appears at its end state for the
  same 900ms hold
```

### 2.8 Session summary (after the queue drains)

```
Layout: same centred shell as IDLE
Line 1: font-display text-[28px] text-ink  "SESSION CLEAR"
Row (x3, inline): font-mono text-[13px] tracking-[0.16em] text-ink-45
  "APPROVED 3"  "DENIED 2"  "EXPIRED 0"
Hint: "TAP TO RESET" text-ink-22
```

### 2.9 Error and offline

```
ERROR: statement slot shows font-display text-[22px] text-ink "COULD NOT READ THIS REQUEST",
  sub-line font-mono text-[12px] text-ink-45 with the failing stage ("DECODE FAILED" |
  "NETWORK DOWN" | "SOURCE REJECTED"), action hint "TAP TO RETRY  HOLD TO DISMISS"
OFFLINE (SDK reports link down): top-right chip becomes "OFFLINE" (dashed border),
  queued requests are shown as "WAITING FOR LINK", no verdict is possible while
  the backend cannot record one (safety invariant)
```

### 2.10 Input map

| Input | Context | Action |
|---|---|---|
| R1 ring tap | VERDICT | Approve. Only approval path |
| R1 ring hold 400ms | VERDICT | Deny |
| Ring tap | DETAIL ROWS | Next detail row |
| Ring tap | IDLE / ERROR | Refresh / retry |
| Touch strip tap 200ms | any | Voice listening |
| Touch strip swipe right | VERDICT | Open detail rows |
| Voice "approve" | VERDICT | Approve (same as ring tap, recorded as via voice) |
| Voice "deny" / "stop" | VERDICT | Deny |
| Voice "details" | VERDICT | Detail rows |
| Voice "explain" | VERDICT | Replace statement with one expanded deterministic line for 6s |
| Countdown 0 | VERDICT | Auto-deny |

---

## 3. Companion Web

Product grammar: an evidence ledger. Sparse headings, dense rows, everything traceable. The companion never signs anything; it pairs devices, holds settings and keeps the audit trail.

### 3.1 Shell and top bar

```
Top bar: fixed top-0 inset-x-0 z-50 h-14 bg-[var(--bg-secondary)]/90 backdrop-blur-sm
  border-b border-[var(--border-subtle)]
  Left: wordmark "SIGIL" font-mono text-sm font-semibold tracking-[0.3em]
    text-[var(--text-primary)] uppercase (logo slot: plain HTML comment above the
    wordmark, never a placeholder icon)
  Centre/right nav (three links, aria-current on the active one):
    "PAIR"  "LEDGER"  "SETTINGS"
    font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-secondary)]
    hover:text-[var(--phosphor)] transition-colors duration-[120ms]
    active: text-[var(--phosphor)] with a 1px underline (absolute bottom-0 h-px bg-[var(--phosphor)])
  Status pill (far right):
    inline-flex items-center gap-2 rounded-full border border-[var(--border-default)]
    px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--text-primary)]
    dot: w-1.5 h-1.5 rounded-full bg-[var(--phosphor)] (live) or
    border-[var(--risk)] text-[var(--risk)] with a risk dot when a device is unpaired

Page shell: pt-14 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]
  Scanline layer: fixed inset-0 z-0 pointer-events-none opacity-[0.03]
    background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(77,255,158,0.5) 2px 3px)
  Content: relative z-10 max-w-6xl mx-auto px-6 md:px-10
```

### 3.2 Page /pair

Purpose: bind a glasses install (or the Telegram bot) to this account with a code. Google sign-in is never used in the WebView; the code flow replaces it.

```
Composition: single centred card (flex items-center justify-center min-h-[calc(100dvh-3.5rem)])
Card: w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-default)]
  rounded-lg p-8 shadow-[0_0_40px_rgba(77,255,158,0.06)]
  Eyebrow: font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--phosphor)] "DEVICE PAIRING"
  Heading: font-display text-2xl font-bold text-[var(--text-primary)] mt-3 "Enter the code on your glasses"
  Body: font-body text-sm text-[var(--text-secondary)] mt-2 leading-relaxed
    "Open Sigil on the glasses and type the six characters shown here. The code expires in ten minutes."
  Code display (generated): font-mono text-[40px] tracking-[0.35em] text-[var(--phosphor)]
    tabular-nums select-all  format "K7-4M2" (three chars, hyphen, three chars)
  Countdown line: font-mono text-[11px] text-[var(--text-muted)] "EXPIRES IN 09:58"
  Secondary action: font-mono text-[11px] tracking-[0.18em] uppercase
    text-[var(--text-secondary)] hover:text-[var(--phosphor)] "REGENERATE CODE"
States: generating (code slot shows 6 skeleton blocks, opacity pulse 0.3 ↔ 0.6, 900ms),
  paired (card swaps to ✓ "DEVICE PAIRING" + "G2 · connected" row, phosphor dot),
  expired (code dims to text-[var(--text-muted)], copy "Code expired, generate a new one"),
  error (risk-bordered inline strip: "! That code does not match", retry preserved)
```

### 3.3 Page / (dashboard + ledger)

Purpose: see what is waiting, what happened today, and inspect any verdict.

```
Stat strip (mt-8, grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border-subtle)] border
  border-[var(--border-subtle)] rounded-lg overflow-hidden):
  Cell: bg-[var(--bg-surface)] p-5
    Number: font-mono text-3xl font-medium text-[var(--text-primary)] tabular-nums
    Label: font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mt-2
  Cells: "WAITING" (phosphor when 0, risk when ≥ 1) | "APPROVED TODAY" | "DENIED TODAY" | "AUTO-DENIED"
  Count animation: count from 0 to value over 1.2s, ease-out, once per load (reduced motion: final value)

Live queue (mt-10): sparse heading "WAITING" (font-mono text-[11px] tracking-[0.22em]
  uppercase text-[var(--text-muted)]) then rows
Ledger (below queue, the page's spine): heading "LEDGER" same style, plus filter chips
  ("ALL" "APPROVED" "DENIED" "RISK") in the same label font; active chip gets
  border-[var(--phosphor)] text-[var(--phosphor)]

Ledger row (grid grid-cols-[110px_90px_1fr_120px_120px] md:grid-cols-[130px_100px_1fr_140px_140px]
  items-center gap-4 py-3 border-b border-[var(--border-subtle)] text-sm):
  time: font-mono text-xs text-[var(--text-muted)] tabular-nums "23 NOV 09:41"
  source: font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--text-secondary)] "HYPERLIQUID"
  plain line: font-body text-[var(--text-primary)] truncate
  risk: chip (same glyph system as the glasses, coloured per §1.2 table)
  verdict: font-mono text-[11px] tracking-[0.16em] uppercase
    approved: text-[var(--phosphor)] "✓ APPROVED · RING"
    denied:   text-[var(--risk)]     "✕ DENIED · VOICE"
    expired:  text-[var(--text-muted)] "✕ AUTO-DENY"
  Hover: bg-[var(--bg-surface)] transition-colors duration-[120ms]
  Click: expands an inline detail block (grid-column 1 / -1) with the full facts list,
    raw selector and byte count, and the testnet explorer link (font-mono text-xs
    text-[var(--phosphor)] hover:underline). Expansion height 0 → auto over 180ms
    --ease-snap (reduced motion: instant)
Empty ledger: "NOTHING RECORDED YET" + "Pair a device and the first verdict lands here"

Mobile (<768px): row collapses to two lines (time+source / plain line + chips),
  filters become a horizontally scrollable chip rail, no hover-only affordances
```

### 3.4 Page /settings

Purpose: risk rules, timeouts, integration status. Every field has a visible label; no placeholder-only labels.

```
Layout: max-w-2xl, stacked field groups separated by hairline borders
Groups: "VERDICT RULES" | "TRUSTED RECIPIENTS" | "INTEGRATIONS" | "VOICE"
Field row: flex items-center justify-between py-4 border-b border-[var(--border-subtle)]
  Label: font-body text-sm text-[var(--text-primary)]
  Aside (where needed): parenthetical, lowercase, text-[var(--text-muted)] (per copy rules)
  Controls:
    auto-deny timeout: segmented control "15s" "30s" "60s" (active: border-[var(--phosphor)]
      text-[var(--phosphor)]; 30s default)
    value threshold for CHECK upgrade: mono number input (bg-[var(--bg-surface)]
      border border-[var(--border-default)] rounded-sm px-3 py-2 font-mono text-sm)
    trusted recipients: repeatable mono address rows with remove buttons (visible "REMOVE",
      destructive, asks inline "Remove 0x7a3c…9f2c?" with CONFIRM / CANCEL)
    integrations: status rows (HYPERLIQUID TESTNET · connected · key ending 4f2a) with
      "ROTATE" and "DISCONNECT" actions; secrets never displayed, only last four characters
    voice: toggle "RING WAKE WORD" and STT language select
  Saving: instant with a toast (z-60 fixed bottom-6 right-6 bg-[var(--bg-lift)]
    border border-[var(--border-default)] rounded-md px-4 py-3 font-mono text-xs
    "Saved." visible 1.8s, enter/exit opacity + y 6px snap)
Invariant copy, always visible under VERDICT RULES in text-[var(--text-muted)]:
  "Sigil never auto-approves. Timeouts can only deny."
```

---

## 4. Interactions and State Behaviour

### 4.1 Interaction table (companion)

| Element | Input | State change | Feedback / timing | Reverse or recovery | Keyboard / alternate |
|---|---|---|---|---|---|
| Pair code display | appears on load | generating → code | skeleton 900ms max | REGENERATE button | fully keyboard operable |
| Filter chip | click | ledger filters | instant row swap, 120ms opacity | click ALL | chips are buttons with aria-pressed |
| Ledger row | click / Enter | expanded ↔ collapsed | height 180ms snap | click again or Escape | Enter/Space toggle |
| Remove recipient | click → confirm | row removed | inline confirm first, toast "Removed." | Cancel keeps row | focus moves to confirm |
| Save any setting | change | persisted | toast "Saved." 1.8s | change again | native controls |

### 4.2 State inventory

| Component | Initial | Loading | Empty | Success | Error / offline | Disabled |
|---|---|---|---|---|---|---|
| G2 queue | IDLE | DECODING | IDLE copy | VERDICT → STAMP | ERROR / OFFLINE strips | n/a (no verdict while offline) |
| Pair card | generating | skeleton | n/a | paired view | expired / mismatch | regenerate while generating |
| Ledger | full rows | row skeletons (3) | empty copy | expand detail | fetch failure strip + RETRY | n/a |
| Settings | saved values | n/a | n/a | toast "Saved." | toast "Not saved, retry" with value preserved | SAVE only when dirty |

### 4.3 Verdict flow transition table (G2)

| Current | Event / guard | Next | Visible feedback | Data kept |
|---|---|---|---|---|
| IDLE | request arrives | DECODING | "READING TRANSACTION" | queue intact |
| DECODING | decode done ≤ 900ms | VERDICT | snap swap to card | request cached |
| DECODING | decode fails | ERROR | "DECODE FAILED" | raw payload kept |
| VERDICT | ring tap | STAMP APPROVED | stamp lands 160ms | verdict posted to backend |
| VERDICT | ring hold 400ms | STAMP DENIED | hold meter fills (hairline ring around the chip) | verdict posted |
| VERDICT | countdown 0 | STAMP DENIED AUTO | "AUTO" suffix | verdict posted, flagged expired |
| VERDICT | voice "explain" | VERDICT (explain line) | statement swaps for 6s | returns to plain line |
| STAMP | 900ms elapsed | DECODING or IDLE | overlay snaps out | next request pulled |
| any | link loss | OFFLINE | chip dashes | pending state retained locally |

### 4.4 Gesture and input ownership (G2)

| Surface | Owns | Yields | Boundary |
|---|---|---|---|
| Ring tap / hold | verdict actions, row advance | OS-level gestures | hold threshold 400ms, cancel on early release |
| Touch strip | voice wake (200ms press), detail swipe | left-edge app switching | swipe axis-locks after 12px |
| Voice overlay | its 6 intents | everything else while not listening | auto-dismiss after 4s silence |

---

## 5. Motion and Transitions

| Motion | Purpose and trigger | Start → end | Timing | Reduced motion / cleanup |
|---|---|---|---|---|
| Card swap | new state enters | opacity 0→1, y 4→0 | 120ms, --ease-snap | instant swap |
| Verdict stamp (signature) | approve or deny | opacity 0→1, scale 1.45→1, rotate -7→-3deg | 160ms + 60ms settle, --ease-snap | end state held 900ms |
| Card dim under stamp | stamp lands | opacity 1→0.35 | 120ms linear | static 0.35 |
| Countdown hairline | every verdict | width 100%→0 | linear over the countdown | static 50% width |
| Skeleton pulse | decoding | opacity 0.22→0.45→0.22 | 900ms linear infinite | static 0.3 |
| Voice meter | listening | scaleY 0.3→1 | 140ms steps, random cadence | static 0.6 |
| Count-up stats (companion) | first view | 0 → value | 1.2s ease-out, once | final value |
| Ledger expand | row click | height 0→auto | 180ms --ease-snap | instant |
| Toast (companion) | save / actions | opacity 0→1, y 6→0 | 180ms in, 1.8s hold, 120ms out | instant |
| Idle glyph pulse | IDLE | opacity 0.45→0.7 | 2.4s linear infinite | static |

Everything else in the product is still. No parallax, no scroll reveals on the glass, no ambient loops beyond the two listed pulses.

---

## 6. Responsive and Adaptive Behaviour

G2 app is a fixed 576 × 288 canvas. Adaptive rules there are typographic: the statement ellipsises at word boundaries at 2 lines; fact rows reduce from 3 to 2 below a 24-character average value length; font sizes never scale down (glance legibility beats fitting more).

Companion web:

| Context | Layout change | Nav / input | Must remain visible |
|---|---|---|---|
| Small phone (<768px) | ledger rows collapse to two lines; stat strip 2 × 2 | chip rail scrolls horizontally | risk chip and verdict on every row |
| Tablet (768–1024px) | stat strip 4 across, ledger full grid | top bar unchanged | time, source, plain line |
| Desktop (>1024px) | max-w-6xl centred, expandable detail inline | top bar + keyboard shortcuts (j/k rows, Enter expand) | all five columns |
| Larger text / zoom 200% | rows wrap to stacked layout | no change | nothing clipped, no horizontal scroll |

---

## 7. Accessibility and Usability

- **Risk never rides on colour alone:** glyph + label + border treatment on every surface (§1.2 table). The monochrome G2 enforces this by construction
- **Keyboard:** full companion operability; visible focus ring on every interactive element (`outline-none ring-2 ring-[var(--phosphor)] ring-offset-2 ring-offset-[var(--bg-primary)]`)
- **Screen readers:** ledger rows are buttons with complete accessible names ("Send 250 USDT to 0x7a3c…9f2c, danger, denied by voice, 23 November 09:41"); status changes announce via `aria-live="polite"`; the G2 WebView exposes the verdict line as the primary accessible name
- **Reduced motion:** every table in §5 has an instant path; `prefers-reduced-motion` disables all loops
- **Voice redundancy:** every voice intent has a ring or touch equivalent and vice versa (§2.10). No action is voice-only
- **Contrast:** ink tiers on black sit at or above 4.5:1 for anything below 18px; the 30px statement may use ink at 3:1 where hardware brightness requires
- **Timeout safety:** the auto-deny countdown is announced in the action bar and by voice on request ("how long"); denial on timeout is always recoverable by re-sending the request
- WCAG 2.2 AA is the companion target; the glasses app follows the same principles within hardware limits

---

## 8. Technical Approach and Tools

- **G2 app:** Vite + TypeScript + Tailwind (compiled to static assets), Even Hub SDK (`@evenrealities/evenhub-cli`, `@evenrealities/evenhub-simulator`) for Bluetooth, display, ring, touch and raw microphone audio. CSS transitions only. Fonts bundled as woff2 subsets
- **Companion:** Next.js 14 App Router + TypeScript + Tailwind + `motion/react` for the handful of specified transitions (import path `motion/react`)
- **Backend:** Node.js + TypeScript (Fastify), `viem` (EVM decode and testnet reads), TON libraries for transfer decoding, `grammY` (Telegram Bot API), Whisper endpoint for STT (OpenAI API key or local whisper.cpp, chosen by env), SQLite for the audit ledger and queue (single deployable unit, no user content leaves the operator's server)
- **Deterministic first:** the plain-English sentence is built from decoded facts by template, never generated by a model. This is a safety feature: a summariser must not hallucinate what a transaction does
- **Secrets:** every key lives in backend env. `app.json` whitelists only the Sigil backend origin. No key, mnemonic or user message content ever reaches the WebView bundle
- **Testing and review:** Vitest for decode and risk units, Playwright against the simulator flow for the companion; visual review at the breakpoints in §6 before demo recording

---

## 9. Assets and Image Briefs

| Asset | Role | Subject and composition | Safe area / crop | Source, licence, fallback |
|---|---|---|---|---|
| Wordmark "SIGIL" | foreground (text) | live text, IBM Plex Mono 600, tracking 0.3em | n/a | coded text, no file |
| Logo symbol | none | comment slot `{/* Logo slot: no mark supplied */}` | n/a | never substitute an icon or generated mark |
| Favicon | none | HTML comment slot | n/a | never substitute |
| Scanline texture | background layer (companion) | CSS repeating-linear-gradient only | full viewport | coded, no file |
| G2 glyphs (✓ ! ✕) | foreground | font glyphs at fixed sizes | inline | system font coverage verified at build |
| Product proof for demo video | motion capture | real simulator or G2 screen recordings, clearly real UI | per capture | recorded in build phase 6, no generated UI ever shown as live |

No photography, no illustration, no generated imagery anywhere in this product. The decoded data is the visual material.

---

## 10. Acceptance Criteria

- [ ] A real signing request (Hyperliquid testnet order, EVM testnet transaction or TON testnet transfer) flows from source to G2 verdict card in under 3 seconds on a normal connection
- [ ] The verdict sentence is deterministic from decoded facts; the same request always renders the same sentence
- [ ] Ring tap approves and only ring tap (or voice "approve") can approve; hold denies; countdown denies; there is no auto-approve path in the codebase
- [ ] The verdict stamp plays at the exact values in §2.7 and its reduced-motion variant is an instant hold
- [ ] Risk levels always render glyph + label + border treatment; flipping the companion palette to greyscale loses no information
- [ ] The Telegram bot mirrors every verdict (inline buttons) within 2 seconds and nothing else from the user's account is read or stored
- [ ] Companion ledger shows every verdict with time, source, plain line, risk and route; expanded rows show facts, raw selector and testnet explorer link
- [ ] No API key, secret or raw microphone audio is stored anywhere client-side; keys appear in the companion as last-four only
- [ ] Offline G2 blocks verdicts and says so; recovery preserves the queue
- [ ] All copy matches §1.5; no em dash exists in any interface string
- [ ] Visual review completed at every breakpoint in §6 plus 576 × 288 in the simulator

---

## 11. Handoff Notes

- **Open question for user:** which community to name on the DoraHacks submission (Community Partner Award field)
- **Verify at build:** G2 phosphor hex against real hardware or the simulator profile; Even Hub SDK method names against current docs; Hyperliquid testnet and TON testnet endpoint behaviour
- **Known risks:** STT latency in a live demo (mitigated by ring-first interaction and deterministic intent words); WebView font loading (mitigated by bundling)
- **Implementation order:** see BUILD_GUIDE.md phases

---

## 12. Spec Completeness Check

- [x] Every screen and state of both surfaces is specified (G2: 2.2–2.9, companion: 3.2–3.4 + §4.2)
- [x] Every primary action has trigger, outcome, feedback and recovery (§2.10, §4.1, §4.3)
- [x] Data and side effects are truthful: testnet only, backend records every verdict, nothing auto-approves
- [x] Copy is final (deterministic patterns + named strings), unknown business facts marked (community name)
- [x] The signature effect specifies layers, values, timing, replay and fallback (§2.7, §5)
- [x] Every visually important element has exact Tailwind classes or concrete values; shared recipes (risk chip, ledger row, entrance) defined once
- [x] Motion has explicit values, triggers and reduced-motion paths (§5)
- [x] Breakpoints and adaptive rules are concrete (§6)
- [x] Assets state role, provenance and fallback; no generated UI is presented as live (§9)
- [x] User requirements, gate decisions and assumptions are distinguished (§0 evidence table)
- [x] Tools have named jobs (§8); nothing else is installed
- [x] IDs, countdown values, thresholds, row counts and acceptance checks agree across sections
- [x] Input ownership is defined for ring, touch, voice and countdown with cancellation paths (§4.4)
- [x] This spec is saved as `FRONTEND_SPEC.md` in the project repository

---

## Builder override: Groq STT

The builder chose Groq for speech to text. `STT_PROVIDER=groq` and `GROQ_API_KEY` replace `whisper-api` and `OPENAI_API_KEY`. The route posts to `https://api.groq.com/openai/v1/audio/transcriptions` with model `whisper-large-v3-turbo`. The original Whisper wording above is retained as the written spec.
