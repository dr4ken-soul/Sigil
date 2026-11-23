/** Clinical terse command copy. Buttons reflect verdicts, never approve. */
export const START_COPY = [
  'Sigil reads a signing request before you act on it.',
  'Forward a request here or send a transaction hash. Decide on the glasses. This chat mirrors the verdict.',
  'Commands: /pair <code>, /status, /help',
].join('\n')

export const HELP_COPY = [
  '/pair <code> bind this bot to a glasses install',
  '/status show integration status',
  '/help show this list',
].join('\n')
