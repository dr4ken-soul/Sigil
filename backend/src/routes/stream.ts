import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'

type Sender = (line: string) => void

/** Server-sent events for the G2 queue and companion. */
export function registerStreamRoutes(app: FastifyInstance, ctx: AppContext): void {
  const subscribers = new Set<Sender>()
  app.get('/stream', async (request, reply) => {
    reply.hijack()
    reply.raw.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'access-control-allow-origin': '*',
    })
    const send: Sender = (line) => reply.raw.write(line)
    subscribers.add(send)
    reply.raw.write(': connected\n\n')
    request.raw.on('close', () => subscribers.delete(send))
  })
  const original = ctx.publish
  ctx.publish = (event) => {
    original(event)
    const line = `data: ${JSON.stringify(event)}\n\n`
    for (const send of subscribers) send(line)
  }
}
