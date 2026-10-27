// Renders intro.html with Playwright + ffmpeg.
//
//   node intro/render.mjs <tools-dir> beats   one frame per beat → out/beats.jpg contact sheet
//   node intro/render.mjs <tools-dir> audio   soundtrack → out/soundtrack.wav
//   node intro/render.mjs <tools-dir> full    60 fps, 3 subframes blended (tmix) + audio → MP4s
//
// <tools-dir> holds `playwright` and `ffmpeg-static` (kept outside the app's dependencies).

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [toolsDir, mode = 'beats'] = process.argv.slice(2);
if (!toolsDir) throw new Error('Usage: node intro/render.mjs <tools-dir> beats|audio|full');

const require = createRequire(path.join(path.resolve(toolsDir), 'package.json'));
const { chromium } = require('playwright');
const ffmpeg = require('ffmpeg-static');

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'out');
const frames = path.join(out, 'frames');
mkdirSync(out, { recursive: true });

const FPS = 60, SUB = 3, DURATION = 20, BEAT = 0.5;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(here, 'intro.html')).href);
await page.evaluate(() => window.ready);

const shot = async (t, file, quality = 92) => {
  await page.evaluate((time) => window.seek(time), t);
  await page.screenshot({ path: file, type: 'jpeg', quality });
};

if (mode === 'beats') {
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  const beats = DURATION / BEAT;
  for (let b = 0; b < beats; b++) {
    // Sample just after each beat lands, when the change is readable.
    await shot(b * BEAT + 0.32, path.join(frames, `beat_${String(b).padStart(2, '0')}.jpg`));
  }
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', path.join(frames, 'beat_%02d.jpg'),
    '-vf', 'scale=270:480,tile=10x4:padding=6:color=white', '-frames:v', '1', path.join(out, 'beats.jpg')]);
  console.log('beats →', path.join(out, 'beats.jpg'));
}

if (mode === 'audio' || mode === 'full') {
  const wav = await page.evaluate(() => window.renderAudio());
  writeFileSync(path.join(out, 'soundtrack.wav'), Buffer.from(wav, 'base64'));
  console.log('audio →', path.join(out, 'soundtrack.wav'));
}

if (mode === 'full') {
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  const total = DURATION * FPS * SUB;
  const started = Date.now();
  for (let i = 0; i < total; i++) {
    await shot(i / (FPS * SUB), path.join(frames, `f_${String(i).padStart(5, '0')}.jpg`), 95);
    if (i % 300 === 0) console.log(`frame ${i}/${total} (${Math.round((Date.now() - started) / 1000)} s)`);
  }
  const silent = path.join(out, 'video_silent.mp4');
  // Average each group of 3 subframes, keep one frame per group → 60 fps with motion blur.
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(FPS * SUB),
    '-i', path.join(frames, 'f_%05d.jpg'),
    '-vf', `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)`,
    '-r', String(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', silent]);
  const finalMp4 = path.join(out, 'trivia-intro-1080x1920.mp4');
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', silent, '-i', path.join(out, 'soundtrack.wav'),
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', finalMp4]);
  // Light version for the app: 720x1280, 30 fps.
  const appMp4 = path.join(here, '..', 'assets', 'intro', 'intro.mp4');
  mkdirSync(path.dirname(appMp4), { recursive: true });
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', finalMp4, '-vf', 'scale=720:1280:flags=lanczos',
    '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', appMp4]);
  console.log('video →', finalMp4, '\napp   →', appMp4);
}

await browser.close();
