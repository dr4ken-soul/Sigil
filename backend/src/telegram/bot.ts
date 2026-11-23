import { Bot } from 'grammy'
import type { AppContext } from '../context.js'
import { ingest } from '../ingest.js'
import { HELP_COPY, START_COPY } from './commands.js'

/** Create the Telegram bot. Returns null when no token is configured. */
export function createTelegramBot(ctx: AppContext): Bot | null {
  const token = ctx.env.TELEGRAM_BOT_TOKEN
  if (!token) return null
  const bot = new Bot(token)

  bot.command('start', async (command) => {
    await command.reply(START_COPY)
  })

  bot.command('help', async (command) => {
    await command.reply(HELP_COPY)
  })

  bot.command('pair', async (command) => {
    const code = command.match.replace(/[-\s]/g, '').toUpperCase()
    const bound = ctx.ledger.confirmPairing(code, `telegram:${command.from?.id ?? 0}`)
    await command.reply(bound ? 'Paired.' : '! That code does not match')
  })

  bot.command('status', async (command) => {
    await command.reply(`Pending verdicts: ${ctx.ledger.counts().waiting || 0}`)
  })

  bot.on('message:text', async (message) => {
    const text = message.message.text.trim()
    if (!text.startsWith('sigil:')) return
    try {
      const payload = JSON.parse(text.slice(6)) as Record<string, unknown>
      const request = await ingest('telegram', {
        ...payload,
        telegramChatId: message.message.chat.id,
        telegramMessageId: message.message.message_id,
      }, ctx)
      await message.reply(`${request.plainLine}\n${request.risk.level.toUpperCase()}`)
    } catch {
      await message.reply('COULD NOT READ THIS REQUEST. DECODE FAILED')
    }
  })

  return bot
}
