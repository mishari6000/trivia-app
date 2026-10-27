import { getLocalQuestions } from '../data/getLocalQuestions';
import { fetchOpenTriviaQuestions, OpenTriviaError, type FetchOptions } from '../data/openTrivia';
import type { CategoryName, PlayableQuestion, QuestionSource } from '../types/question';
import { prepareSession, QUESTIONS_PER_GAME } from './shuffle';

/** Extra questions are fetched so a few invalid ones never leave a game short. */
const ONLINE_FETCH_AMOUNT = 10;

/**
 * One game's questions, from the bundled Arabic bank or from the internet. Either way the
 * result is the same prepared session: 5 unique questions with shuffled answers.
 */
export async function loadSession(
  category: CategoryName,
  source: QuestionSource,
  options: Pick<FetchOptions, 'signal' | 'onWait' | 'fetchImpl' | 'sleep'> = {},
): Promise<PlayableQuestion[]> {
  if (source === 'local') return prepareSession(getLocalQuestions(category));

  const bank = await fetchOpenTriviaQuestions(category, { amount: ONLINE_FETCH_AMOUNT, ...options });
  if (bank.length < QUESTIONS_PER_GAME) {
    throw new OpenTriviaError('no-results', `Only ${bank.length} usable questions`);
  }
  return prepareSession(bank);
}
