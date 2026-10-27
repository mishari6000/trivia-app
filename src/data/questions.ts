import type { Question } from '../types/question';

/**
 * Local General Knowledge question bank (Arabic), kept apart from screens and components.
 *
 * Each question has: an id, the category, its language (for text direction), the question
 * text, the right answer and exactly three wrong answers. A future internet or AI source
 * only needs to return this same `Question[]` shape; `getLocalQuestions` validates it and
 * gives every answer a stable id, and the game never reads anything else.
 */
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
  {
    id: 'gk-006',
    category: 'General Knowledge',
    language: 'ar',
    question: 'ما هو الكوكب المعروف باسم «الكوكب الأحمر»؟',
    correctAnswer: 'المريخ',
    incorrectAnswers: ['الزهرة', 'عطارد', 'زحل'],
  },
  {
    id: 'gk-007',
    category: 'General Knowledge',
    language: 'ar',
    question: 'كم عدد أيام السنة الكبيسة في التقويم الميلادي؟',
    correctAnswer: '366 يومًا',
    incorrectAnswers: ['365 يومًا', '364 يومًا', '367 يومًا'],
  },
  {
    id: 'gk-008',
    category: 'General Knowledge',
    language: 'ar',
    question: 'ما هي أكبر قارة في العالم من حيث المساحة؟',
    correctAnswer: 'آسيا',
    incorrectAnswers: ['أفريقيا', 'أمريكا الشمالية', 'أوروبا'],
  },
  {
    id: 'gk-009',
    category: 'General Knowledge',
    language: 'ar',
    question: 'ما هو العضو الذي يضخ الدم إلى أنحاء جسم الإنسان؟',
    correctAnswer: 'القلب',
    incorrectAnswers: ['الكبد', 'الرئتان', 'الكليتان'],
  },
  {
    id: 'gk-010',
    category: 'General Knowledge',
    language: 'ar',
    question: 'كم عدد الدقائق في الساعة الواحدة؟',
    correctAnswer: 'ستون دقيقة',
    incorrectAnswers: ['خمسون دقيقة', 'مئة دقيقة', 'أربعون دقيقة'],
  },
];
