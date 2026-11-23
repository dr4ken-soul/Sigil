import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AppContext } from './context.js'
import { createLedger } from './db/ledger.js'
import { getSettings } from './db/settings.js'
import { loadEnv } from './env.js'
import { expire, recordVerdict } from './verdict.js'
import { registerRoutes } from './routes/index.js'
import { createTelegramBot } from './telegram/bot.js'
import { registerTelegramWebhook } from './telegram/webhook.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = process.env.SIGIL_ROOT ?? resolve(here, '../..')
const env = loadEnv(root)
const databaseUrl = resolve(root, env.DATABASE_URL ?? './sigil.db')
const drainerPath = resolve(root, env.DRAINER_LIST_PATH ?? './data/drainers.json')
const ledger = createLedger(databaseUrl)

const ctx: AppContext = {
  ledger,
  env,
  root,
  settings: getSettings(ledger.db, drainerPath),
  publish: () => undefined,
  expire: () => undefined,
  record: async () => null,
}

const app = Fastify({ logger: true })
await app.register(cors, { origin: true })
await app.register(cookie)
registerRoutes(app, ctx)
ctx.expire = (id) => expire(ctx, id)
ctx.record = (id, decision, route) => recordVerdict(ctx, id, decision, route)
const bot = createTelegramBot(ctx)
registerTelegramWebhook(app, bot)

const port = Number(env.PORT ?? 8080)
await app.listen({ port, host: '0.0.0.0' })
if (bot) {
  void bot.start().catch((error) => app.log.error({ err: error }, 'telegram polling failed'))
} else {
  app.log.warn('TELEGRAM_BOT_TOKEN_MISSING: bot is inactive until a token is provided')
}
