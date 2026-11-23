import type { FastifyInstance } from 'fastify'
import type { Bot } from 'grammy'

/** Webhook endpoint for deployments that prefer webhooks over polling. */
export function registerTelegramWebhook(app: FastifyInstance, bot: Bot | null): void {
  app.post('/telegram/webhook', async (request, reply) => {
    if (!bot) return reply.code(503).send({ error: 'TELEGRAM_BOT_TOKEN_MISSING' })
    await bot.handleUpdate(request.body as Parameters<Bot['handleUpdate']>[0])
    return { ok: true }
  })
}
