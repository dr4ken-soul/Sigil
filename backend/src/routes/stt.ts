import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'
import { matchIntent, UNKNOWN_INTENT_COPY } from '../intents.js'

/** Groq transcription model. OpenAI-compatible endpoint, no model in the verdict path. */
const GROQ_STT_MODEL = 'whisper-large-v3-turbo'
const GROQ_STT_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'

/** Raw microphone audio in, normalised text and intent out. */
export function registerSttRoutes(app: FastifyInstance, ctx: AppContext): void {
  for (const type of ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wav', 'application/octet-stream']) {
    app.addContentTypeParser(type, { parseAs: 'buffer' }, (_request, body, done) => done(null, body))
  }

  app.post('/stt', async (request, reply) => {
    const audio = request.body as Buffer | undefined
    if (!audio || audio.length === 0) return reply.code(400).send({ error: 'NO_AUDIO' })
    const provider = ctx.env.STT_PROVIDER ?? 'groq'
    if (provider === 'whisper-cpp') {
      return reply.code(501).send({ error: 'WHISPER_CPP_PATH_NOT_RUNNING' })
    }
    if (provider !== 'groq') {
      return reply.code(503).send({ error: 'STT_PROVIDER_UNSUPPORTED' })
    }
    const key = ctx.env.GROQ_API_KEY ?? ''
    if (!key) return reply.code(503).send({ error: 'GROQ_API_KEY_MISSING' })
    try {
      const form = new FormData()
      form.append('model', GROQ_STT_MODEL)
      form.append('language', 'en')
      const bytes = audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer
      form.append('file', new Blob([bytes], { type: 'audio/webm' }), 'speech.webm')
      const response = await fetch(GROQ_STT_URL, {
        method: 'POST',
        headers: { authorization: `Bearer ${key}` },
        body: form,
      })
      if (!response.ok) return reply.code(502).send({ error: `STT_FAILED_${response.status}` })
      const json = await response.json() as { text?: string }
      const text = (json.text ?? '').trim()
      const intent = matchIntent(text)
      return { text, intent, copy: intent ? undefined : UNKNOWN_INTENT_COPY }
    } catch (error) {
      return reply.code(502).send({ error: `STT_FAILED: ${(error as Error).message}` })
    }
  })
}
