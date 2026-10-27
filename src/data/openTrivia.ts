import type { CategoryName, PlayableQuestion, Question } from '../types/question';
import { getCategory } from './categories';
import { toPlayableQuestion } from './getLocalQuestions';

/**
 * Open Trivia DB adapter (https://opentdb.com/api_config.php, CC BY-SA 4.0).
 * Returns the same validated `PlayableQuestion[]` shape as the local bank, so the game
 * never knows where its questions came from.
 */
export const OPEN_TRIVIA_API = 'https://opentdb.com/api.php';
/** The API allows one request per IP every 5 seconds. */
export const RATE_LIMIT_MS = 5_000;
/** Gap the app keeps between requests: the limit plus a safety margin (it is enforced a bit strictly). */
export const REQUEST_GAP_MS = RATE_LIMIT_MS + 1_000;
/** Extra wait after each 429, so a shared network (phone + laptop) can still get through. */
export const BACKOFF_STEP_MS = 3_000;

export type OpenTriviaErrorKind = 'network' | 'no-results' | 'rate-limit' | 'invalid' | 'unknown';

export class OpenTriviaError extends Error {
  constructor(
    readonly kind: OpenTriviaErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'OpenTriviaError';
  }
}

type ApiResult = {
  type: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};
type ApiResponse = { response_code: number; results: ApiResult[] };

// https://opentdb.com/api_config.php → "Response Codes"
const RESPONSE_ERRORS: Record<number, OpenTriviaErrorKind> = {
  1: 'no-results',
  2: 'invalid',
  3: 'invalid',
  4: 'no-results',
  5: 'rate-limit',
};

export function buildUrl(category: CategoryName, amount: number): string {
  const id = getCategory(category).openTriviaId;
  return `${OPEN_TRIVIA_API}?amount=${amount}&category=${id}&type=multiple&encode=url3986`;
}

/** Converts one raw API item into the app's `Question`, or null if it cannot be used. */
export function fromApiResult(item: ApiResult, category: CategoryName, index: number): Question | null {
  if (item.type !== 'multiple' || item.incorrect_answers?.length !== 3) return null;
  try {
    const decode = (s: string) => decodeURIComponent(s).trim();
    const question = decode(item.question);
    return {
      id: `otdb-${getCategory(category).openTriviaId}-${index}-${question.slice(0, 24)}`,
      category,
      language: 'en',
      question,
      correctAnswer: decode(item.correct_answer),
      incorrectAnswers: item.incorrect_answers.map(decode) as [string, string, string],
    };
  } catch {
    return null;
  }
}

/** Validated questions from a raw API response; invalid items are dropped, not fatal. */
export function parseResponse(body: ApiResponse, category: CategoryName): PlayableQuestion[] {
  const kind = RESPONSE_ERRORS[body.response_code];
  if (kind) throw new OpenTriviaError(kind, `Open Trivia DB response code ${body.response_code}`);
  if (body.response_code !== 0 || !Array.isArray(body.results)) {
    throw new OpenTriviaError('unknown', 'Unexpected Open Trivia DB response');
  }
  const playable: PlayableQuestion[] = [];
  body.results.forEach((item, i) => {
    const question = fromApiResult(item, category, i);
    if (!question) return;
    try {
      playable.push(toPlayableQuestion(question));
    } catch {
      // Empty or duplicate answers after decoding: skip this one.
    }
  });
  return playable;
}

/** How long to wait before the next request so the API's 5-second limit is respected. */
export function rateLimitDelay(now: number, lastRequestAt: number | null): number {
  if (lastRequestAt === null) return 0;
  return Math.max(0, lastRequestAt + REQUEST_GAP_MS - now);
}

let lastRequestAt: number | null = null;
const MAX_ATTEMPTS = 4;

/** Why the client is waiting before a request: the normal gap, or a retry after a 429. */
export type WaitReason = 'gap' | 'rate-limit';

export type FetchOptions = {
  amount?: number;
  signal?: AbortSignal;
  /** Called before any non-zero wait, so the UI can say what is happening and for how long. */
  onWait?: (ms: number, reason: WaitReason) => void;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
};

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Fetches multiple-choice questions for a category, waiting out the rate limit if needed. */
export async function fetchOpenTriviaQuestions(
  category: CategoryName,
  {
    amount = 10,
    signal,
    onWait,
    fetchImpl = fetch,
    sleep = defaultSleep,
    now = Date.now,
  }: FetchOptions = {},
): Promise<PlayableQuestion[]> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // After a rejection the server restarts its window, so back off a little more each time.
    const wait = rateLimitDelay(now(), lastRequestAt) + attempt * BACKOFF_STEP_MS;
    if (wait > 0) onWait?.(wait, attempt > 0 ? 'rate-limit' : 'gap');
    await sleep(wait);
    if (signal?.aborted) throw new OpenTriviaError('network', 'Aborted');
    lastRequestAt = now();

    let body: ApiResponse;
    try {
      const res = await fetchImpl(buildUrl(category, amount), { signal });
      lastRequestAt = now(); // count the gap from the response, not just the request
      // The rate limit comes back as HTTP 429 with {"response_code":5}.
      if (res.status === 429) body = { response_code: 5, results: [] };
      else if (!res.ok) throw new Error(`HTTP ${res.status}`);
      else body = (await res.json()) as ApiResponse;
    } catch (error) {
      if (error instanceof OpenTriviaError) throw error;
      throw new OpenTriviaError('network', String(error));
    }

    try {
      return parseResponse(body, category);
    } catch (error) {
      // Rate limited despite waiting (another tab, a shared network): wait and retry.
      const retry = error instanceof OpenTriviaError && error.kind === 'rate-limit';
      if (retry && attempt < MAX_ATTEMPTS - 1) continue;
      throw error;
    }
  }
  throw new OpenTriviaError('rate-limit', 'Rate limited');
}

/** For tests: forget the last request time. */
export function resetRateLimit(): void {
  lastRequestAt = null;
}
