import type { SigningRequest } from '../decode/types.js'

/** Post a verdict alert to a subscribed channel. Reflect-only, never an approval surface. */
export async function alertChannel(request: SigningRequest, token: string, chatId: string): Promise<boolean> {
  if (!token || !chatId) return false
  const text = request.status === 'approved'
    ? `✓ APPROVED · ${request.plainLine}`
    : `✕ ${request.status === 'expired' ? 'AUTO-DENY' : 'DENIED'} · ${request.plainLine}`
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  })
  return response.ok
}
