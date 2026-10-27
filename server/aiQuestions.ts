import type { CategoryName, Question } from '../src/types/question';

/**
 * Question generation with OpenRouter, shared by the Vercel function (api/generate.ts) and
 * its tests. Runs only on the server: the API key never reaches the app.
 */
export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_KEY_URL = 'https://openrouter.ai/api/v1/key';

/**
 * Fast, cheap, strong at Arabic and factual recall, with structured outputs.
 * OpenRouter falls back to the next model if the first one fails or is slow to respond.
 */
export const MODELS = ['anthropic/claude-haiku-5.5', 'google/gemini-2.5-flash-lite'];

/** Hard spending cap for this key, checked before every generation. */
export const BUDGET_USD = 5;

/** Questions requested per game; a few spares so validation can drop weak ones. */
export const GENERATE_COUNT = 8;

/** What each category is about, for the prompt (Arabic label + English topic hint). */
export const CATEGORY_TOPICS: Record<CategoryName, { label: string; topic: string }> = {
  'General Knowledge': { label: 'معلومات عامة', topic: 'general knowledge' },
  'Entertainment: Books': { label: 'كتب', topic: 'famous books, authors and literature' },
  'Entertainment: Film': { label: 'أفلام', topic: 'well-known films, directors and cinema history' },
  'Entertainment: Music': { label: 'موسيقى', topic: 'music, instruments, famous songs and musicians' },
  'Entertainment: Musicals & Theatres': { label: 'مسرح', topic: 'theatre, plays and stage musicals' },
  'Entertainment: Television': { label: 'تلفزيون', topic: 'television history and famous TV shows' },
  'Entertainment: Video Games': { label: 'ألعاب فيديو', topic: 'video games, consoles and game history' },
  'Entertainment: Board Games': { label: 'ألعاب لوحية', topic: 'board games, chess and card games' },
  'Science & Nature': { label: 'علوم وطبيعة', topic: 'science and nature' },
  'Science: Computers': { label: 'كمبيوتر', topic: 'computers, the internet and programming basics' },
  'Science: Mathematics': { label: 'رياضيات', topic: 'mathematics: numbers, shapes and famous concepts' },
  Mythology: { label: 'أساطير', topic: 'world mythology and legends' },
  Sports: { label: 'رياضة', topic: 'sports, rules and major tournaments' },
  Geography: { label: 'جغرافيا', topic: 'world geography: countries, capitals, landmarks' },
  History: { label: 'تاريخ', topic: 'world and Arab history' },
  Politics: { label: 'سياسة', topic: 'political systems and international organisations (no opinions)' },
  Art: { label: 'فن', topic: 'art, painters and famous artworks' },
  Celebrities: { label: 'مشاهير', topic: 'famous historical figures and inventors' },
  Animals: { label: 'حيوانات', topic: 'animals and their facts' },
  Vehicles: { label: 'مركبات', topic: 'cars, planes, trains and how vehicles work' },
  'Entertainment: Comics': { label: 'قصص مصوّرة', topic: 'comics and comic book history' },
  'Science: Gadgets': { label: 'أجهزة', topic: 'gadgets and everyday technology' },
  'Entertainment: Japanese Anime & Manga': { label: 'أنمي ومانجا', topic: 'popular anime and manga' },
  'Entertainment: Cartoon & Animations': { label: 'رسوم متحركة', topic: 'cartoons and animated films' },
};

export function isCategory(value: unknown): value is CategoryName {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(CATEGORY_TOPICS, value);
}

/** Strict JSON schema, so the model can only answer in the exact shape the game needs. */
export const QUESTIONS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['question', 'correctAnswer', 'incorrectAnswers'],
        properties: {
          question: { type: 'string' },
          correctAnswer: { type: 'string' },
          incorrectAnswers: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
} as const;

export function buildRequestBody(category: CategoryName, count = GENERATE_COUNT) {
  const { label, topic } = CATEGORY_TOPICS[category];
  return {
    models: MODELS,
    temperature: 0.9,
    max_tokens: 2_000,
    // Only route to providers that honour the JSON schema.
    provider: { require_parameters: true },
    usage: { include: true },
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'trivia_questions', strict: true, schema: QUESTIONS_SCHEMA },
    },
    messages: [
      {
        role: 'system',
        content: [
          'You write multiple-choice trivia questions for an Arabic quiz game played in Kuwait.',
          'Write in clear Modern Standard Arabic. Each question ends with «؟».',
          'Rules: every fact must be accurate, well established and not time-sensitive;',
          'no opinions, no disputed facts, no religious rulings, no questions about living politicians;',
          'exactly one correct answer and three plausible but clearly wrong answers;',
          'all four answers distinct and short (at most 6 words); no "all of the above";',
          'mix easy and medium difficulty; do not repeat a question.',
        ].join(' '),
      },
      {
        role: 'user',
        content: `اكتب ${count} أسئلة جديدة ومتنوعة في فئة «${label}» (${topic}).`,
      },
    ],
  };
}

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

/** Validates the model's JSON and returns only well-formed, unambiguous questions. */
export function parseGenerated(content: string, category: CategoryName): Question[] {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return [];
  }
  const items = (data as { questions?: unknown })?.questions;
  if (!Array.isArray(items)) return [];

  const seen = new Set<string>();
  const out: Question[] = [];
  items.forEach((raw, i) => {
    const q = raw as { question?: unknown; correctAnswer?: unknown; incorrectAnswers?: unknown };
    if (typeof q.question !== 'string' || typeof q.correctAnswer !== 'string') return;
    if (!Array.isArray(q.incorrectAnswers) || q.incorrectAnswers.length !== 3) return;
    if (!q.incorrectAnswers.every((a) => typeof a === 'string')) return;

    const question = q.question.trim();
    const answers = [q.correctAnswer, ...q.incorrectAnswers].map((a: string) => a.trim());
    if (!question || answers.some((a) => !a || a.length > 60)) return;
    if (new Set(answers.map(normalize)).size !== 4) return;
    if (seen.has(normalize(question))) return;
    seen.add(normalize(question));

    out.push({
      id: `ai-${Date.now().toString(36)}-${i}`,
      category,
      language: 'ar',
      question,
      correctAnswer: answers[0],
      incorrectAnswers: [answers[1], answers[2], answers[3]],
    });
  });
  return out;
}

/** Key usage from OpenRouter's /api/v1/key (USD spent so far on this key). */
export function usageFromKeyResponse(body: unknown): number | null {
  const usage = (body as { data?: { usage?: unknown } })?.data?.usage;
  return typeof usage === 'number' ? usage : null;
}
