import Fastify from 'fastify'
import { describe, expect, it } from 'vitest'
import type { AppContext } from '../context.js'
import { registerSttRoutes } from '../routes/stt.js'

function context(provider: string, key: string): AppContext {
  return {
    ledger: {} as AppContext['ledger'],
    env: { STT_PROVIDER: provider, GROQ_API_KEY: key },
    root: '/tmp',
    settings: {} as AppContext['settings'],
    publish: () => undefined,
    expire: () => undefined,
    record: async () => null,
  }
}

async function post(provider: string, key: string) {
  const app = Fastify()
  registerSttRoutes(app, context(provider, key))
  await app.ready()
  return app.inject({
    method: 'POST',
    url: '/stt',
    headers: { 'content-type': 'audio/webm' },
    payload: Buffer.from('audio-bytes'),
  })
}

describe('Groq STT route', () => {
  it('reports a missing Groq key instead of guessing', async () => {
    const response = await post('groq', '')
    expect(response.statusCode).toBe(503)
    expect(response.json().error).toBe('GROQ_API_KEY_MISSING')
  })
  it('keeps the local whisper.cpp path explicit', async () => {
    const response = await post('whisper-cpp', '')
    expect(response.statusCode).toBe(501)
    expect(response.json().error).toBe('WHISPER_CPP_PATH_NOT_RUNNING')
  })
})
