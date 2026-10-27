# Intro video prompt — تحدّي اليمعة

<inputs>
Screenshots: rebuild the real screens of this app (welcome, game, results) yourself.
Logo: the green «؟» tile next to the name «تحدّي اليمعة» (src/components/GameTitle.tsx).
Brand: the app's own dark theme (src/theme/theme.ts) and the bundled Tajawal typeface.
Music: compose a royalty-free track with a clear beat in code.
</inputs>

<direction>
A 20-second motion graphics intro for my Arabic trivia game, تحدّي اليمعة. It plays when the app
or website opens. Read the codebase first: six categories, five questions per game, four answers,
a 15-second ring timer, a once-per-game 50/50, the right answer revealed, a final score.
Build the scenes from the real UI; never invent features (no prizes, money, accounts or rankings).
Through-line object: the green «؟» tile from the logo. It starts in the UI, changes role in every
scene (selection, ring timer, 50/50, the correct-answer check, the results ring) and becomes the
logo on the end card.
Rebuild the real UI as vector layers so its parts can move on their own; never slide a flat
screenshot in. A cursor drives every interaction with real taps, and the camera zooms
screen-studio style so each moment fills the frame.
Brand: dark navy surfaces, Tajawal only, and one accent (green #22DD82) used only on the
through-line object and the key word. Arabic, right-to-left, lots of empty space.
Motion rules: springs with at most a small overshoot; nothing appears from nothing (it grows,
unfolds or is revealed by a mask); the camera never sits still (push from 1.0 to 1.04 across a
scene, and start each scene at the zoom the last one ended on); something changes on every beat.
Banned: particle bursts, glows, lens flares, camera shake, RGB split, crossfades, generic
gradients, bouncy easing, holds longer than half a second, anything that looks like a template.
</direction>

<structure>
120 BPM. Write a timed storyboard first, beat by beat, then build exactly that.
Hook (first bar): the challenge in three to five Arabic words, in big type that the «؟» tile interrupts.
Middle: four moments of the game: pick a category, the 15-second ring timer, 50/50, a correct
answer. Each begins with the «؟» tile turning into the next UI element and lands one readable idea.
Payoff (last bars): the results ring filling to 5 من 5 on the biggest beat, then the tile becomes
the logo and the end card: «تحدّي اليمعة» and a one-line call to action.
</structure>

<build>
1. One HTML file at 1080x1920. Every style is computed from time inside window.seek(t):
   no CSS animations, no timers, no state carried between frames.
2. Spring and exponential easing written as functions of time. Blur follows speed and direction on fast moves.
3. Soundtrack in code with the Web Audio API (OfflineAudioContext): a kick on every beat and a hit
   on each scene change. Render it to WAV.
4. Render with Playwright at 60fps, 3 subframes per frame blended with ffmpeg tmix for motion blur,
   then mux the audio.
5. Before the full render, render one frame per beat and look at them. Fix anything cluttered,
   off the beat, overlapping or hard to read.
6. Also export a light version for the app (720x1280, 30fps) that plays on launch with a skip button.
</build>

<gotchas>
Measure element positions at runtime for match cuts instead of hard-coding them. When a shape fills
the frame, scale it past all four corners. Give outgoing and incoming text separate timing so
letters never overlap. Never put will-change on anything the camera scales, or text renders blurry.
Arabic text must stay connected: never animate or mask individual letters, only whole words.
</gotchas>
