/**
 * The translation scripts' model call, in one place.
 *
 * These scripts ran on OpenAI (gpt-4o-mini) until that account's credit ran out
 * mid-batch, which left 150 new routes half-translated and blocked the whole
 * publishing pipeline on a second vendor's balance. They now run on Anthropic —
 * the same key that already writes the routes' English and Spanish copy — so
 * there is one account to keep funded instead of two.
 *
 * The contract the callers rely on is unchanged: give it a system prompt and a
 * user prompt, get back the model's raw text, which is expected to be a JSON
 * object (each script parses it with its own tolerant parseJSON).
 */
import Anthropic from '@anthropic-ai/sdk'

// Built on first use, not at import time: the callers read the key out of
// .env.local themselves and set it just after importing this module, so a
// client created up here would capture an empty key.
let client
const getClient = () => (client ||= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }))

export const DEFAULT_MODEL = 'claude-opus-5'

/**
 * One translation call.
 *
 * `effort: 'low'` because this is the cheap end of the work — short titles and
 * meta descriptions, no reasoning to do — and low effort keeps the token spend
 * down without touching quality on a task this shape. No `temperature`: the
 * sampling parameters were removed on this model family and sending one is a
 * 400.
 */
export async function askForJson({ system, prompt, model = DEFAULT_MODEL, maxTokens = 8000 }) {
  const res = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system,
    output_config: { effort: 'low' },
    messages: [{ role: 'user', content: prompt }],
  })

  // A safety decline comes back as a normal 200 with no usable content, so it
  // has to be checked before reading the blocks or it looks like an empty reply.
  if (res.stop_reason === 'refusal') {
    throw new Error(`el modelo rechazó la petición (${res.stop_details?.category || 'sin categoría'})`)
  }

  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  return { text, usage: res.usage }
}
