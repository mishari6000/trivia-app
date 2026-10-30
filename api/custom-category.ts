import {
  applyCheck,
  buildTopicCheckRequest,
  buildTopicWriteRequest,
  cleanTopic,
  OPENROUTER_URL,
  parseTopicQuestions,
  pickPlan,
} from '../server/customCategory';

/**
 * POST /api/custom-category  { topic }  →  { topic, questions }  (five questions)
 *
 * «صمم فئتك»: writes questions about the player's topic with OpenRouter, fact-checks them,
 * and returns 2 easy, 2 medium and 1 hard. The key lives only in the OPENROUTER_API_KEY
 * environment variable (named «Haiku» in this project) on Vercel. The five-a-month limit is kept on each device; the real
 * money cap is the key's own monthly limit on OpenRouter.
 * Errors: not-configured (503), invalid-topic (400), bad-topic (422), rate-limit (429),
 * budget (402), not-enough / upstream (502).
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { ...CORS, 'Cache-Control': 'no-store' } });

const UPSTREAM_TIMEOUT_MS = 30_000;

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

class Upstream extends Error {
  constructor(
    readonly status: number,
    readonly reason = '',
  ) {
    super(`OpenRouter ${status}${reason ? `: ${reason}` : ''}`);
  }
}

async function complete(key: string, body: object): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://trivia-app-phi-two.vercel.app',
      'X-OpenRouter-Title': 'Trivia App custom category',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) {
    // OpenRouter's own reason (never the key), for the function logs and the response.
    const detail = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Upstream(res.status, detail.error?.message?.slice(0, 200) ?? '');
  }
  const data = (await res.json()) as { choices?: { finish_reason?: string; message?: { content?: string } }[] };
  const choice = data.choices?.[0];
  if (!choice?.message?.content || choice.finish_reason === 'length') {
    throw new Upstream(502, `no content (finish ${choice?.finish_reason ?? 'none'})`);
  }
  return choice.message.content;
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: Request): Promise<Response> {
  // The project stores the key as «Haiku»; OPENROUTER_API_KEY is accepted too.
  const key = (process.env.OPENROUTER_API_KEY || process.env.Haiku || '').trim();
  if (!key) return json({ error: 'not-configured' }, 503);
  // OpenRouter keys look like «sk-or-v1-…»; anything else (a model name, a stray quote or
  // «Bearer …») is a setup mistake. Only the verdict is reported, never the value.
  if (!/^sk-or-[A-Za-z0-9_-]{20,}$/.test(key)) return json({ error: 'not-configured', reason: 'key-format' }, 503);

  let topic: string | null;
  try {
    topic = cleanTopic(((await request.json()) as { topic?: unknown }).topic);
  } catch {
    return json({ error: 'invalid-topic' }, 400);
  }
  if (!topic) return json({ error: 'invalid-topic' }, 400);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!allowed(ip, Date.now())) return json({ error: 'rate-limit' }, 429);

  try {
    const written = parseTopicQuestions(await complete(key, buildTopicWriteRequest(topic)));
    if (!written.allowed) return json({ error: 'bad-topic' }, 422);
    if (!written.questions.length) return json({ error: 'not-enough' }, 502);

    const approved = applyCheck(written.questions, await complete(key, buildTopicCheckRequest(written.questions)));
    const questions = approved && pickPlan(approved);
    if (!questions) return json({ error: 'not-enough' }, 502);
    return json({ topic, questions });
  } catch (error) {
    const status = error instanceof Upstream ? error.status : 502;
    console.error('custom-category:', error instanceof Error ? error.message : error);
    if (status === 429) return json({ error: 'rate-limit' }, 429);
    if (status === 402) return json({ error: 'budget' }, 402);
    return json({ error: 'upstream', status, reason: error instanceof Upstream ? error.reason : '' }, 502);
  }
}
