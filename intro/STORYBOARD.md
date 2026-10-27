# Storyboard — 20 s, 120 BPM (beat = 0.5 s, bar = 2 s, 40 beats)

## What the codebase gives us
- Name/logo: «تحدّي اليمعة» + green «؟» tile rotated −8° (GameTitle.tsx).
- Theme: navy #0A1620 / #122230 / #1A2D3C, white #FFFFFF, muted #9DB1BF, accent green #22DD82, Tajawal.
- Real screens: Welcome (greeting «هلا والله!», rules banner with a 15 ring, category cards with art,
  «10» and «15ث» chips and «ابدأ»), Game (category, score pill, ring timer, question card,
  «50/50 · احذف إجابتين», four answers, feedback), Results (score ring, «نتيجتك: X من 5», «العب مرة ثانية»).
- Real features only: 6 categories, 5 questions, 4 answers, 15 s, 50/50 once, correct answer, score.

## Through-line object
**The green «؟» tile.** tile → «ابدأ» pill → full-frame wash → ring timer → 50/50 pill →
check → correct-answer fill → results ring → logo tile.
Accent green is used only on the tile and on the key word «تعرف».

## Beats
| Beat | Time | Scene | What changes |
| --- | --- | --- | --- |
| 0 | 0.0 | Hook | «تظن إنك» rises in through a mask |
| 1 | 0.5 | Hook | «تعرف» rises in (green key word) |
| 2 | 1.0 | Hook | «كل شي» rises in on line two |
| 3 | 1.5 | Hook | the «؟» tile springs in below and nudges the lines up |
| 4 | 2.0 | Welcome · HIT | words exit upward; welcome screen unfolds from the top; tile flies to the wordmark |
| 5 | 2.5 | Welcome | name «تحدّي اليمعة» + «هلا والله!» revealed |
| 6 | 3.0 | Welcome | rules banner grows (ring 15) |
| 7 | 3.5 | Welcome | category cards grow in |
| 8 | 4.0 | Welcome | cursor grows in and drags the page up |
| 9 | 4.5 | Welcome | tile leaves the wordmark and becomes the «ابدأ» pill on جغرافيا |
| 10 | 5.0 | Welcome | cursor taps «ابدأ» |
| 11 | 5.5 | Welcome | the pill grows past all four corners |
| 12 | 6.0 | Timer · HIT | green shrinks into the ring timer, revealing the game screen; 15 |
| 13 | 6.5 | Timer | question card unfolds; 14 |
| 14 | 7.0 | Timer | four answers grow in; 13 |
| 15 | 7.5 | Timer | caption «15 ثانية لكل سؤال»; 12 |
| 16 | 8.0 | 50/50 · HIT | green leaves the ring (ring turns white) and becomes the 50/50 pill; 11 |
| 17 | 8.5 | 50/50 | cursor taps 50/50 |
| 18 | 9.0 | 50/50 | two wrong answers collapse into empty slots; 10 |
| 19 | 9.5 | 50/50 | caption «50/50 · مرة وحدة»; 9 |
| 20 | 10.0 | Answer · HIT | pill goes grey; green becomes a check that moves to «روسيا»; 8 |
| 21 | 10.5 | Answer | cursor taps «روسيا» |
| 22 | 11.0 | Answer | check grows into the answer fill; caption «صح عليك!» |
| 23 | 11.5 | Answer | score pill counts 0 → 1 |
| 24 | 12.0 | Results · BIG HIT | answer fill shrinks into the results ring; game folds away |
| 25–29 | 12.5–14.5 | Results | ring fills 1 → 5 of 5, one step per beat |
| 30 | 15.0 | Results | «نتيجتك: 5 من 5» revealed |
| 31 | 15.5 | Results | «العب مرة ثانية» pill grows |
| 32 | 16.0 | End · HIT | results fold away; ring collapses into the «؟» tile |
| 33 | 16.5 | End | «تحدّي اليمعة» revealed |
| 34 | 17.0 | End | «6 فئات · 60 سؤال» revealed |
| 35 | 17.5 | End | white «العب الحين» pill grows |
| 36 | 18.0 | End | link revealed |
| 37 | 18.5 | End | tile settles from −8° to 0° |
| 38 | 19.0 | End | cursor taps «العب الحين» |
| 39 | 19.5 | End · HIT | tile returns to −8°, final hit |

Camera: each scene pushes 1.04× from the zoom the previous scene ended on, zooming about the
moment in focus (wordmark → cards → ring → answers → «روسيا» → results ring → logo).
