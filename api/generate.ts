import {
  BUDGET_USD,
  buildRequestBody,
  isCategory,
  OPENROUTER_KEY_URL,
  OPENROUTER_URL,
  parseGenerated,
  usageFromKeyResponse,
} from '../server/aiQuestions';

/**
 * POST /api/generate  { category }  →  { questions: Question[] }
 *
 * Generates Arabic trivia questions for a category with OpenRouter. The key lives only in
 * the OPENROUTER_API_KEY environment variable on Vercel. Errors use clear codes the app maps
 * to its error/empty faces: budget (402), rate-limit (429), bad-output / upstream (502).
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { ...CORS, 'Cache-Control': 'no-store' } });

const UPSTREAM_TIMEOUT_MS = 25_000;
const MIN_QUESTIONS = 5;

// Best-effort per-instance limits (instances are short-lived; the budget check is the real cap).
const PER_IP_PER_MINUTE = 8;
const hits = new Map<string, number[]>();
function allowed(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= PER_IP_PER_MINUTE) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

let usageCache: { at: number; usage: number } | null = null;
async function spentUsd(key: string): Promise<number | null> {
  if (usageCache && Date.now() - usageCache.at < 30_000) return usageCache.usage;
  try {
    const res = await fetch(OPENROUTER_KEY_URL, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5_000),
    });
    const usage = usageFromKeyResponse(await res.json());
    if (usage !== null) usageCache = { at: Date.now(), usage };
    return usage;
  } catch {
    return usageCache?.usage ?? null;
  }
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return json({ error: 'not-configured' }, 503);

  let category: unknown;
  try {
    ({ category } = (await request.json()) as { category?: unknown });
  } catch {
    return json({ error: 'invalid-request' }, 400);
  }
  if (!isCategory(category)) return json({ error: 'invalid-category' }, 400);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!allowed(ip, Date.now())) return json({ error: 'rate-limit' }, 429);

  // Never spend past the budget, whatever the dashboard limit is.
  const spent = await spentUsd(key);
  if (spent !== null && spent >= BUDGET_USD) return json({ error: 'budget' }, 402);

  let upstream: Response;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://trivia-app-phi-two.vercel.app',
        'X-OpenRouter-Title': 'تحدّي اليمعة',
      },
      body: JSON.stringify(buildRequestBody(category)),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return json({ error: 'upstream' }, 502);
  }
  if (upstream.status === 429) return json({ error: 'rate-limit' }, 429);
  if (upstream.status === 402) return json({ error: 'budget' }, 402);
  if (!upstream.ok) return json({ error: 'upstream', status: upstream.status }, 502);

  const body = (await upstream.json()) as {
    model?: string;
    choices?: { message?: { content?: string } }[];
    usage?: { cost?: number; total_tokens?: number };
  };
  const questions = parseGenerated(body.choices?.[0]?.message?.content ?? '', category);
  if (usageCache && typeof body.usage?.cost === 'number') usageCache.usage += body.usage.cost;
  if (questions.length < MIN_QUESTIONS) return json({ error: 'bad-output', count: questions.length }, 502);

  return json({ questions, model: body.model, cost: body.usage?.cost ?? null });
}
