import type { SigningRequest } from '../decode/types.js'

/** Mirror a recorded verdict back to its chat. Buttons reflect, never approve. */
export async function mirrorVerdict(request: SigningRequest, token: string): Promise<boolean> {
  if (!token || !request.telegramChatId || !request.telegramMessageId) return false
  const text = request.status === 'approved'
    ? `✓ APPROVED · ${request.plainLine}`
    : `✕ ${request.status === 'expired' ? 'AUTO-DENY' : 'DENIED'} · ${request.plainLine}`
  const response = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: request.telegramChatId,
      message_id: request.telegramMessageId,
      text,
      reply_markup: {
        inline_keyboard: [[
          { text: 'Open on glasses', callback_data: `open:${request.id}` },
          { text: 'Full facts', callback_data: `facts:${request.id}` },
        ]],
      },
    }),
  })
  return response.ok
}
