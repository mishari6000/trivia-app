# تحدّي اليمعة — Trivia on Your Phone

لعبة أسئلة فردية بالعربي (فئة **معلومات عامة / General Knowledge**)، مبنية بـ
React Native + Expo (SDK 58) + TypeScript، وتشتغل على Expo Go (iOS / Android) وعلى الويب عبر React Native Web.

## التشغيل

المتطلبات: Node.js 20+ وتطبيق **Expo Go** (آخر إصدار يدعم SDK 58) على الهاتف، والهاتف واللابتوب على نفس الـ Wi‑Fi.

```bash
npm install
npx expo start
```

امسح رمز QR بكاميرا الآيفون أو من داخل Expo Go على أندرويد.
إذا ما اشتغل الاتصال عبر الشبكة المحلية:

```bash
npx expo start --tunnel
```

## الأوامر

| الأمر | الوظيفة |
| --- | --- |
| `npm start` | تشغيل خادم Expo لـ Expo Go |
| `npm run web` | تشغيل نسخة الويب محليًا |
| `npm test` | اختبارات منطق اللعبة (Jest + jest-expo) |
| `npm run typecheck` | فحص TypeScript |
| `npm run lint` | ESLint (eslint-config-expo) |
| `npm run export:web` | بناء نسخة الويب في `dist/` |

## هيكل المشروع

```
App.tsx                         تحميل الخط (Tajawal مضمّن) + التبديل بين شاشة البداية واللعبة
src/
  types/question.ts             نوع Question المشترك + PlayableQuestion
  data/questions.ts             بنك الأسئلة المحلي (خارج JSX)
  data/getLocalQuestions.ts     حدّ البيانات: تحقّق + معرّفات ثابتة للإجابات
  game/gameReducer.ts           حالات اللعبة: answering → feedback → results
  game/useTriviaGame.ts         hook يربط الـ reducer بالشاشة
  screens/WelcomeScreen.tsx     شاشة البداية (الاسم + الفئة + ابدأ التحدّي)
  screens/GameScreen.tsx        شاشة اللعب (لعب + نتيجة)
  components/                   المكوّنات القابلة لإعادة الاستخدام
  theme/theme.ts                الألوان والخطوط والمسافات واتجاه النص
```

### المكوّنات

| المكوّن | الملف | مكان الاستخدام |
| --- | --- | --- |
| `QuestionCard` | `src/components/QuestionCard.tsx` | `GameScreen` — بطاقة السؤال |
| `AnswerButton` | `src/components/AnswerButton.tsx` | `GameScreen` — الأزرار الأربعة |
| `ScoreBadge` | `src/components/ScoreBadge.tsx` | `GameScreen` — الهيدر (ظاهر دائمًا) |
| `FeedbackBanner` | `src/components/FeedbackBanner.tsx` | `GameScreen` — صح عليك! / مو هذي الإجابة |
| `PrimaryButton` | `src/components/PrimaryButton.tsx` | `WelcomeScreen` (ابدأ التحدّي)، `GameScreen` (التالي / شوف النتيجة)، `ResultsPanel` |
| `ResultsPanel` | `src/components/ResultsPanel.tsx` | `GameScreen` — حالة النتيجة |
| `CategoryBadge` | `src/components/CategoryBadge.tsx` | `WelcomeScreen` و `GameScreen` — شارة الفئة |
| `ScreenLayout` | `src/components/ScreenLayout.tsx` | `WelcomeScreen` و `GameScreen` — الهيدر المنحني، المساحات الآمنة، التمرير، عمود RTL |
| `FramedCard` | `src/components/FramedCard.tsx` | `QuestionCard` و `ResultsPanel` و `WelcomeScreen` — البطاقة بالإطار السماوي |
| `GameTitle` | `src/components/GameTitle.tsx` | `WelcomeScreen` (كبير) و `GameScreen` (مصغّر) — شعار الاسم |
| `CategoryTile` | `src/components/CategoryTile.tsx` | `WelcomeScreen` — بطاقة فئة «معلومات عامة» |

## ملاحظات تصميمية

- **الصحّة بالمعرّف لا بالموقع:** كل إجابة لها `id` ثابت، والإجابة الصحيحة تُعرف بـ `correctOptionId`.
- **قفل الإجابة:** الـ reducer يقبل أول `answer` فقط في حالة `answering`؛ أي ضغطات سريعة بعدها تُتجاهل.
- **RTL محصور بالشاشة:** `direction: 'rtl'` على native و `dir="rtl"` على الويب — بدون `I18nManager.forceRTL`.
  اتجاه نص السؤال والإجابات يتحدد من `language` لكل سؤال، فالأسئلة الإنجليزية مستقبلًا تظهر LTR.
- **الخط:** Tajawal (رخصة OFL) مضمّن من `@expo-google-fonts/tajawal`؛ لا يوجد طلب خط من الإنترنت وقت التشغيل.
- **رسمة الفئة:** `assets/images/category-general.png` مولّدة بـ kie.ai عبر
  `node scripts/generate-category-art.mjs` (يطلب مفتاح API بإدخال مخفي، أو من `KIE_API_KEY`).
  المفتاح لا يُحفظ في ملف ولا يوضع في التطبيق أو GitHub.

## اختبار الهاتف

0. يفتح التطبيق على شاشة البداية؛ «ابدأ التحدّي» يدخلك اللعبة والنقاط صفر.
1. العب الأسئلة الخمسة؛ النقاط تزيد فقط مع الإجابة الصحيحة.
2. اضغط على الإجابات بسرعة؛ تُقبل إجابة واحدة فقط لكل سؤال.
3. تأكد أن النتيجة النهائية تساوي عدد الإجابات الصحيحة.
4. اضغط «العب مرة ثانية»؛ كل شي يرجع للبداية والنقاط صفر.
5. تأكد أن العربي واضح، والأزرار مريحة، وما في نص مقصوص.
