import type { DecodedRequest, RiskFlag, RiskRules, RiskVerdict } from './decode/types.js'

/**
 * Score a decoded request into SAFE, CHECK or DANGER with explicit fact flags.
 * Flags are facts about the request, never financial advice.
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
  if (request.kind === 'hl-order' && (request.leverage ?? 1) > rules.maxLeverage) {
    flags.push({ level: 'check', fact: `leverage ${request.leverage}× above your cap` })
  }
  const level = flags.some((f) => f.level === 'danger')
    ? 'danger'
    : flags.length > 0
      ? 'check'
      : 'safe'
  return { level, flags }
}
