# تحدّي اليمعة — Trivia on Your Phone

لعبة أسئلة فردية بالعربي في **6 فئات**: معلومات عامة، علوم وطبيعة، جغرافيا، تاريخ، رياضة، حيوانات، مبنية بـ
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
App.tsx                         تحميل الخط (Tajawal مضمّن) + المقدمة ← الفئات ← المستوى ← اللعبة
src/
  types/question.ts             أنواع Question وBankQuestion وDifficulty وPlayableQuestion
  data/questions.ts             60 سؤال مكتوبة باليد في 6 فئات (تنحسب «سهل»)
  data/bank.json                بنك الأسئلة المولّدة: عربي، مدقّق، مع المستوى (يتولّد بالسكربت)
  data/bank.ts                  يجمع البنكين: العدد لكل فئة ومستوى، والتحقق عند أول استخدام
  data/categories.ts            24 فئة: الاسم العربي، الصورة/الأيقونة، والست المميزة أولًا
  data/getLocalQuestions.ts     حدّ البيانات: تحقّق + معرّفات ثابتة للإجابات
  game/pickSession.ts           يختار 5 أسئلة ما انلعبت، لين تخلص أسئلة المستوى
  game/gameReducer.ts           حالات اللعبة + المؤقّت (deadline) + 50/50؛ كل سؤال ينحسم مرة وحدة
  game/fiftyFifty.ts            اختيار إجابتين خطأ للحذف
  game/answerStatus.ts          حالة كل زر + كشف الإجابة الصحيحة بعد الغلط
  game/shuffle.ts               خلط Fisher–Yates للأسئلة والإجابات
  game/useTriviaGame.ts         hook: عدّاد العرض، انتهاء الوقت، الانتقال التلقائي، الرجوع من الخلفية
  screens/IntroScreen.tsx       فيديو المقدمة أول ما يفتح التطبيق (expo-video) مع «تخطّي»
  screens/WelcomeScreen.tsx     شاشة البداية (الاسم + الفئات)
  screens/LevelScreen.tsx       اختيار المستوى: سهل / متوسط / صعب، مع عدد الأسئلة
  screens/GameScreen.tsx        شاشة اللعب (لعب + نتيجة)
  components/                   المكوّنات القابلة لإعادة الاستخدام
  theme/theme.ts                الألوان والخطوط والمسافات واتجاه النص
scripts/
  generate-questions.mts        يولّد الأسئلة بـ OpenRouter ويدقّقها ويحفظها في bank.json (حد 5$)
  questionGen.ts                البرومبت، الـ JSON Schema، التحقق، التكلفة (مع اختبارات)
  generate-category-art.mjs     صور الفئات بـ kie.ai
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
| `GameTitle` | `src/components/GameTitle.tsx` | `WelcomeScreen` — شعار الاسم مع علامة «؟» خضرا |
| `QuestionProgress` | `src/components/QuestionProgress.tsx` | `GameScreen` — «السؤال 2 من 5» وشريط الخطوات |
| `QuestionTimer` | `src/components/QuestionTimer.tsx` | `GameScreen` — حلقة عدّ تنازلي، حمرا مع «أسرع!» آخر 5 ثوانٍ |
| `FiftyFiftyButton` | `src/components/FiftyFiftyButton.tsx` | `GameScreen` — 50/50 مرة وحدة لكل لعبة |
| `CategoryTile` | `src/components/CategoryTile.tsx` | `WelcomeScreen` — بطاقة فئة (صورة + عدد الأسئلة + ابدأ)؛ الضغط يفتح اختيار المستوى |
| `ProgressRing` | `src/components/ProgressRing.tsx` | `QuestionTimer` و `InfoBanner` و `ResultsPanel` — حلقة تقدّم (react-native-svg) |
| `InfoBanner` | `src/components/InfoBanner.tsx` | `WelcomeScreen` — شريط أخضر بقوانين اللعبة |
| `SecondaryButton` | `src/components/SecondaryButton.tsx` | `ResultsPanel` — «غيّر الفئة» |

## مصدر الأسئلة

كل الأسئلة عربية وداخل التطبيق، وما يتصل بأي خادم وقت اللعب.

- **مكتوبة باليد:** 60 سؤال في 6 فئات (`src/data/questions.ts`)، وتنحسب مستوى «سهل».
- **مولّدة بالذكاء الاصطناعي:** 1,027 سؤال في 24 فئة وثلاث مستويات (`src/data/bank.json`).
  انولّدت مرة وحدة بسكربت على الجهاز (`node scripts/generate-questions.mts`) عن طريق [OpenRouter](https://openrouter.ai):
  - `anthropic/claude-haiku-5.5` يكتب 20 سؤال لكل دفعة حسب الفئة والمستوى، ويشوف الأسئلة الموجودة عشان ما يكررها.
  - نموذج ثاني يدقّق كل سؤال (الإجابة صح؟ الخطأ خطأ أكيد؟ واضح؟ المستوى مناسب؟)، واللي ما ينجح ينحذف.
  - المفتاح ينكتب مخفي وقت التشغيل، وما ينحفظ ولا يدخل التطبيق أو Git.
  - المصروف ينجمع في `bank.json` ويوقف عند 5$. نموذج واحد لكل خطوة، ولو جاوب نموذج ثاني يوقف.
  - الأسئلة اللي انكتبت وما اندقّقت تنحفظ في `scripts/pending-questions.json` وتندقّق أول التشغيل الجاي.
- **المستويات:** بعد ما تختار الفئة تختار سهل / متوسط / صعب. المستوى اللي فيه أقل من 5 أسئلة يطلع «قريبًا».
- **كل لعبة مختلفة:** `pickSession` ما يكرر سؤال لين تخلص أسئلة المستوى، وأول لعبة بعدها ما تكرر اللعبة اللي قبلها.

## أين الأسئلة؟

`src/data/questions.ts` و`src/data/bank.json`، بعيد عن الشاشات والمكوّنات. كل سؤال فيه:
`id`، الفئة (`category`)، نص السؤال (`question`)، الإجابة الصحيحة (`correctAnswer`)،
وثلاث إجابات خطأ (`incorrectAnswers`)، والمولّدة فيها المستوى (`difficulty`).
`src/data/bank.ts` يجمعها، و`getLocalQuestions`/`toPlayableQuestion` يتحقق من كل سؤال.

## نسخة الويب (Vercel)

`vercel.json` يبني بـ `npx expo export -p web` ويخدم مجلد `dist` كتطبيق صفحة وحدة.
المستودع مربوط بـ Vercel، وكل push على `main` ينشر نسخة جديدة تلقائيًا.

**الرابط:** https://trivia-app-phi-two.vercel.app

## فيديو المقدمة

`intro/` فيه البرومت (`PROMPT.md`)، الـ storyboard، والمشهد (`intro.html`) — كل إطار يُحسب من `window.seek(t)`.
التصيير: `node intro/render.mjs <tools-dir> beats|audio|full` (Playwright + ffmpeg-static في مجلد أدوات خارج المشروع).
النسخة الكاملة 1080×1920 60fps تطلع في `intro/out/` (مو في Git)، ونسخة التطبيق 720×1280 30fps في `assets/intro/intro.mp4`.

## ملاحظات تصميمية

- **الصحّة بالمعرّف لا بالموقع:** كل إجابة لها `id` ثابت، والإجابة الصحيحة تُعرف بـ `correctOptionId`.
- **قفل الإجابة:** الـ reducer يقبل أول `answer` فقط في حالة `answering`؛ أي ضغطات سريعة بعدها تُتجاهل.
- **RTL محصور بالشاشة:** `direction: 'rtl'` على native و `dir="rtl"` على الويب — بدون `I18nManager.forceRTL`.
  اتجاه نص السؤال والإجابات يتحدد من `language` لكل سؤال، فالأسئلة الإنجليزية مستقبلًا تظهر LTR.
- **الخط:** Tajawal (رخصة OFL) مضمّن من `@expo-google-fonts/tajawal`؛ لا يوجد طلب خط من الإنترنت وقت التشغيل.
- **رسومات الفئات (24):** مولّدة بـ kie.ai عبر `node scripts/generate-category-art.mjs [slug ...]`
  (يطلب مفتاح API بإدخال مخفي، أو من `KIE_API_KEY`، ولا يُحفظ المفتاح في أي ملف).
  السكربت يحفظ PNG 1024px؛ بعدها تنقص الحواف وتصغّر لـ 480×480 وتتحول JPG (`assets/images/category-*.jpg`، المجموع ~1.8MB).

## اختبار الهاتف

1. يفتح التطبيق على شاشة البداية؛ «ابدأ التحدّي» يدخلك اللعبة والنقاط صفر.
2. العب الأسئلة الخمسة؛ النقاط تزيد فقط مع الإجابة الصحيحة.
3. اضغط على الإجابات بسرعة؛ تُقبل إجابة واحدة فقط لكل سؤال.
4. تأكد أن النتيجة النهائية تساوي عدد الإجابات الصحيحة.
5. اضغط «العب مرة ثانية»؛ كل شي يرجع للبداية والنقاط صفر.
6. «السؤال 1 من 5» يزيد لين «5 من 5» وما يطلع 6، ويرجع 1 بعد «العب مرة ثانية».
7. العب 3 ألعاب ورا بعض؛ ترتيب الإجابات يتغيّر (ممكن يتكرر أحيانًا بالصدفة) وما يتحرك بعد الضغط.
8. جاوب غلط: اختيارك أحمر ✗، والإجابة الصحيحة تتلوّن أخضر ✓ ويطلع «الإجابة الصحيحة: …»، والنقاط ما تزيد.
9. العب 3 ألعاب: كل لعبة 5 أسئلة مختلفة، والخلطة تتغيّر (ممكن يتكرر سؤال بين الألعاب).
10. تأكد أن العربي واضح، والأزرار مريحة، وما في نص مقصوص.
