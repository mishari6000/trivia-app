import Anthropic from '@anthropic-ai/sdk';

import {
  answerText,
  applyCheck,
  buildTopicCheckRequest,
  buildTopicWriteRequest,
  cleanTopic,
  looksLikeAnthropicKey,
  parseTopicQuestions,
  pickPlan,
} from '../server/customCategory';

/**
 * POST /api/custom-category  { topic }  →  { topic, questions }  (five questions)
 *
 * «صمم فئتك»: Claude Haiku 5.5 writes questions about the player's topic, a second call
 * fact-checks them, and the server returns 2 easy, 2 medium and 1 hard. The Claude API key
 * lives only in a Vercel environment variable (named «Haiku» in this project;
 * ANTHROPIC_API_KEY also works). The five-a-month limit is kept on each device; the real money
 * cap is the spend limit on the key in the Claude Console.
 * Errors: not-configured (503), invalid-topic (400), bad-topic (422), rate-limit (429),
 * not-enough / upstream (502).
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { ...CORS, 'Cache-Control': 'no-store' } });

// Best-effort per-instance limit against someone hammering the endpoint.
const PER_IP_PER_MINUTE = 3;
const hits = new Map<string, number[]>();
function allowed(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= PER_IP_PER_MINUTE) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

/** A refused or cut-off answer: nothing usable came back. */
class NoAnswer extends Error {}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: Request): Promise<Response> {
  const key = (process.env.ANTHROPIC_API_KEY || process.env.Haiku || '').trim();
  if (!key) return json({ error: 'not-configured' }, 503);
  // Only the verdict is reported, never the value.
  if (!looksLikeAnthropicKey(key)) return json({ error: 'not-configured', reason: 'key-format' }, 503);

  let topic: string | null;
  try {
    topic = cleanTopic(((await request.json()) as { topic?: unknown }).topic);
  } catch {
    return json({ error: 'invalid-topic' }, 400);
  }
  if (!topic) return json({ error: 'invalid-topic' }, 400);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!allowed(ip, Date.now())) return json({ error: 'rate-limit' }, 429);

  const client = new Anthropic({ apiKey: key, timeout: 30_000, maxRetries: 1 });
  const ask = async (params: Anthropic.MessageCreateParamsNonStreaming) => {
    const text = answerText(await client.messages.create(params));
    if (text === null) throw new NoAnswer();
    return text;
  };

  try {
    const written = parseTopicQuestions(await ask(buildTopicWriteRequest(topic)));
    if (!written.allowed) return json({ error: 'bad-topic' }, 422);
    if (!written.questions.length) return json({ error: 'not-enough' }, 502);

    const approved = applyCheck(written.questions, await ask(buildTopicCheckRequest(written.questions)));
    const questions = approved && pickPlan(approved);
    if (!questions) return json({ error: 'not-enough' }, 502);
    return json({ topic, questions });
  } catch (error) {
    if (error instanceof NoAnswer) return json({ error: 'not-enough' }, 502);
    console.error('custom-category:', error instanceof Error ? error.message : error);
    if (error instanceof Anthropic.AuthenticationError) {
      return json({ error: 'not-configured', reason: 'key-rejected' }, 503);
    }
    if (error instanceof Anthropic.RateLimitError) return json({ error: 'rate-limit' }, 429);
    if (error instanceof Anthropic.APIError) return json({ error: 'upstream', status: error.status }, 502);
    return json({ error: 'upstream' }, 502);
  }
}
