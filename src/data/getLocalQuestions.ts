import type { CategoryName, PlayableQuestion, Question } from '../types/question';
import { questions } from './questions';

const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Data boundary: validates a raw question and gives each answer a stable ID.
 * Throws if content is empty or the four options are not unique.
 */
export function toPlayableQuestion(raw: Question): PlayableQuestion {
  const texts = [raw.correctAnswer, ...raw.incorrectAnswers].map((t) => t.trim());

  if (!raw.id.trim() || !raw.question.trim() || texts.some((t) => t.length === 0)) {
    throw new Error(`Question "${raw.id}" has empty content`);
  }
  if (new Set(texts.map(normalize)).size !== 4) {
    throw new Error(`Question "${raw.id}" must have four unique answers`);
  }

  const correctOptionId = `${raw.id}-correct`;
  return {
    id: raw.id,
    category: raw.category,
    language: raw.language,
    question: raw.question.trim(),
    correctOptionId,
    options: [
      { id: correctOptionId, text: texts[0] },
      ...texts.slice(1).map((text, i) => ({ id: `${raw.id}-wrong-${i + 1}`, text })),
    ],
  };
}

/** Validated local questions, optionally for one category only. */
export function getLocalQuestions(category?: CategoryName): PlayableQuestion[] {
  return questions
    .filter((q) => category === undefined || q.category === category)
    .map(toPlayableQuestion);
}
