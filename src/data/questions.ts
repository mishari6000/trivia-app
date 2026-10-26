import type { Question } from '../types/question';

/** Local General Knowledge question bank (Arabic). */
export const questions: Question[] = [
  {
    id: 'gk-001',
    category: 'General Knowledge',
    language: 'ar',
    question: 'ما هو أكبر كوكب في المجموعة الشمسية؟',
    correctAnswer: 'المشتري',
    incorrectAnswers: ['زحل', 'نبتون', 'الأرض'],
  },
  {
    id: 'gk-002',
    category: 'General Knowledge',
    language: 'ar',
    question: 'كم عدد قارات العالم؟',
    correctAnswer: 'سبع قارات',
    incorrectAnswers: ['خمس قارات', 'ست قارات', 'ثماني قارات'],
  },
  {
    id: 'gk-003',
    category: 'General Knowledge',
    language: 'ar',
    question: 'ما هو الغاز الذي تمتصه النباتات من الهواء لتصنع غذاءها؟',
    correctAnswer: 'ثاني أكسيد الكربون',
    incorrectAnswers: ['الأكسجين', 'النيتروجين', 'الهيدروجين'],
  },
  {
    id: 'gk-004',
    category: 'General Knowledge',
    language: 'ar',
    question: 'ما هو أكبر محيط على سطح الأرض؟',
    correctAnswer: 'المحيط الهادئ',
    incorrectAnswers: ['المحيط الأطلسي', 'المحيط الهندي', 'المحيط المتجمد الشمالي'],
  },
  {
    id: 'gk-005',
    category: 'General Knowledge',
    language: 'ar',
    question: 'كم عدد أضلاع الشكل السداسي؟',
    correctAnswer: 'ستة',
    incorrectAnswers: ['خمسة', 'سبعة', 'ثمانية'],
  },
];
