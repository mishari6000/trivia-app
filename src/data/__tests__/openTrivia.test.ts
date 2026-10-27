import {
  buildUrl,
  fetchOpenTriviaQuestions,
  fromApiResult,
  OpenTriviaError,
  parseResponse,
  BACKOFF_STEP_MS,
  REQUEST_GAP_MS,
  rateLimitDelay,
  resetRateLimit,
} from '../openTrivia';

const enc = encodeURIComponent;
const item = (q: string, correct: string, wrong: string[], type = 'multiple') => ({
  type,
  question: enc(q),
  correct_answer: enc(correct),
  incorrect_answers: wrong.map(enc),
});
const ok = (results: ReturnType<typeof item>[]) => ({ response_code: 0, results });

/** A fake fetch that returns the given bodies in order and records the URLs. */
function fakeFetch(...bodies: object[]) {
  const urls: string[] = [];
  const impl = (async (url: string) => {
    urls.push(url);
    const body = bodies.shift();
    return { ok: true, status: 200, json: async () => body } as Response;
  }) as unknown as typeof fetch;
  return { impl, urls };
}
const noSleep = async () => {};

beforeEach(() => resetRateLimit());

describe('Open Trivia DB adapter', () => {
  it('asks for multiple-choice questions in the right category, URL-encoded', () => {
    expect(buildUrl('Geography', 10)).toBe(
      'https://opentdb.com/api.php?amount=10&category=22&type=multiple&encode=url3986',
    );
  });

  it('decodes and maps an item into the app question shape (English, left-to-right)', () => {
    const q = fromApiResult(item("Who wrote 'Hamlet'?", 'Shakespeare', ['Dickens', 'Austen', 'Twain']),
      'Entertainment: Books', 0);
    expect(q).toMatchObject({
      category: 'Entertainment: Books',
      language: 'en',
      question: "Who wrote 'Hamlet'?",
      correctAnswer: 'Shakespeare',
      incorrectAnswers: ['Dickens', 'Austen', 'Twain'],
    });
  });

  it('skips true/false items and items whose answers repeat after decoding', () => {
    const questions = parseResponse(
      ok([
        item('Is the sky blue?', 'True', ['False'], 'boolean'),
        item('Pick one', 'Same', ['same', 'Other', 'Third']),
        item('Capital of France?', 'Paris', ['Lyon', 'Nice', 'Lille']),
      ]),
      'Geography',
    );
    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe('Capital of France?');
    expect(questions[0].options).toHaveLength(4);
    const correct = questions[0].options.find((o) => o.id === questions[0].correctOptionId);
    expect(correct?.text).toBe('Paris');
  });

  it('turns API response codes into clear errors', () => {
    const kindOf = (code: number) => {
      try {
        parseResponse({ response_code: code, results: [] }, 'Art');
      } catch (e) {
        return (e as OpenTriviaError).kind;
      }
    };
    expect(kindOf(1)).toBe('no-results');
    expect(kindOf(2)).toBe('invalid');
    expect(kindOf(5)).toBe('rate-limit');
    expect(kindOf(99)).toBe('unknown');
  });

  it('waits out the 5-second limit between requests', () => {
    expect(rateLimitDelay(10_000, null)).toBe(0);
    expect(rateLimitDelay(10_000, 8_000)).toBe(REQUEST_GAP_MS - 2_000);
    expect(rateLimitDelay(20_000, 8_000)).toBe(0);
  });

  it('fetches, sleeps before a quick second request, and returns validated questions', async () => {
    const results = Array.from({ length: 10 }, (_, i) => item(`Q${i}?`, `A${i}`, [`B${i}`, `C${i}`, `D${i}`]));
    const { impl, urls } = fakeFetch(ok(results), ok(results));
    const sleeps: number[] = [];
    let clock = 1_000;
    const opts = { fetchImpl: impl, sleep: async (ms: number) => { sleeps.push(ms); clock += ms; }, now: () => clock };

    const first = await fetchOpenTriviaQuestions('History', opts);
    clock += 1_000;
    await fetchOpenTriviaQuestions('History', opts);

    expect(first).toHaveLength(10);
    expect(urls).toHaveLength(2);
    expect(sleeps).toEqual([0, REQUEST_GAP_MS - 1_000]);
  });

  it('retries once when rate limited, then succeeds', async () => {
    const results = Array.from({ length: 5 }, (_, i) => item(`Q${i}?`, `A${i}`, [`B${i}`, `C${i}`, `D${i}`]));
    const { impl, urls } = fakeFetch({ response_code: 5, results: [] }, ok(results));
    const questions = await fetchOpenTriviaQuestions('Sports', { fetchImpl: impl, sleep: noSleep });
    expect(urls).toHaveLength(2);
    expect(questions).toHaveLength(5);
  });

  it('treats HTTP 429 as the rate limit: waits and retries instead of failing', async () => {
    const results = Array.from({ length: 5 }, (_, i) => item(`Q${i}?`, `A${i}`, [`B${i}`, `C${i}`, `D${i}`]));
    const calls: number[] = [];
    let clock = 0;
    const impl = (async () => {
      calls.push(clock);
      if (calls.length === 1) return { ok: false, status: 429, json: async () => ({ response_code: 5 }) };
      return { ok: true, status: 200, json: async () => ok(results) };
    }) as unknown as typeof fetch;
    const questions = await fetchOpenTriviaQuestions('Art', {
      fetchImpl: impl,
      sleep: async (ms) => { clock += ms; },
      now: () => clock,
    });
    expect(questions).toHaveLength(5);
    expect(calls).toEqual([0, REQUEST_GAP_MS + BACKOFF_STEP_MS]);
  });

  it('gives up with a rate-limit error after repeated 429s', async () => {
    const impl = (async () => ({ ok: false, status: 429, json: async () => ({}) })) as unknown as typeof fetch;
    await expect(fetchOpenTriviaQuestions('Art', { fetchImpl: impl, sleep: noSleep })).rejects.toMatchObject({
      kind: 'rate-limit',
    });
  });

  it('reports a network failure as a network error', async () => {
    const failing = (async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;
    await expect(fetchOpenTriviaQuestions('Art', { fetchImpl: failing, sleep: noSleep })).rejects.toMatchObject({
      kind: 'network',
    });
  });
});
