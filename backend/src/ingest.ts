import { randomUUID } from 'node:crypto'
import type { AppContext } from './context.js'
import { decodeRequest } from './decode/index.js'
import type { RequestSource, SigningRequest } from './decode/types.js'
import { ExplainError, explainLine } from './explain.js'
import { getRules } from './db/settings.js'
import { scoreRisk } from './risk.js'
import { simulateEvm, simulateHyperliquid, simulateTon, simulateTonSettlement, type SimulationResult } from './simulate.js'

/** Decode, simulate, score, explain and persist one signing request. */
export async function ingest(
  source: RequestSource,
  payload: Record<string, unknown>,
  ctx: AppContext,
): Promise<SigningRequest> {
  const decoded = decodeRequest(source, payload)
  const rules = getRules(ctx.ledger.db, ctx.env.DRAINER_LIST_PATH ?? './data/drainers.json')
  for (const recipient of rules.trustedRecipients) {
    if (decoded.counterparty === recipient) decoded.firstTimeRecipient = false
  }
  const risk = scoreRisk(decoded, rules)
  let simulation: SimulationResult
  if (decoded.kind === 'hl-order') {
    simulation = simulateHyperliquid()
  } else if (decoded.kind === 'ton-transfer') {
    const endpoint = ctx.env.TONCENTER_TESTNET_API ?? ''
    const key = ctx.env.TONCENTER_API_KEY ?? ''
    const [state, settlement] = await Promise.all([
      simulateTon(decoded, endpoint, key),
      simulateTonSettlement(decoded, endpoint, key),
    ])
    simulation = {
      ok: state.ok || settlement.ok,
      note: `${state.note} | ${settlement.note}`,
      facts: [...state.facts, ...settlement.facts],
    }
  } else {
    simulation = await simulateEvm(decoded, ctx.env.ETHEREUM_RPC_URL ?? '')
  }
  const facts = [...decoded.facts]
  if (risk.level === 'check' || risk.level === 'danger') {
    for (const flag of risk.flags) facts.push({ label: flag.level.toUpperCase(), value: flag.fact, flagged: true })
  }
  if (simulation.facts.length) facts.push(...simulation.facts.map((value) => ({ label: 'SIM', value })))
  const createdAt = Date.now()
  const request: SigningRequest = {
    id: randomUUID(),
    source: decoded.source,
    network: decoded.network,
    plainLine: explainLine(decoded),
    facts: facts.slice(0, 3),
    risk,
    raw: { kind: decoded.kind, digest: decoded.digest, byteLength: decoded.byteLength },
    status: 'pending',
    createdAt,
    autoDenyAt: createdAt + ctx.settings.autoDenySeconds * 1000,
    telegramChatId: payload.telegramChatId == null ? undefined : Number(payload.telegramChatId),
    telegramMessageId: payload.telegramMessageId == null ? undefined : Number(payload.telegramMessageId),
  }
  ctx.ledger.insert(request)
  ctx.publish({ type: 'request', request: request as unknown as Record<string, unknown> })
  setTimeout(() => ctx.expire(request.id), ctx.settings.autoDenySeconds * 1000 + 50)
  return request
}

/** Copy used when a request cannot be read. Never a guessed sentence. */
export function ingestFailure(error: unknown): { copy: string; stage: string } {
  if (error instanceof ExplainError) {
    return { copy: 'COULD NOT READ THIS REQUEST', stage: error.stage }
  }
  return { copy: 'COULD NOT READ THIS REQUEST', stage: 'SOURCE_REJECTED' }
}
