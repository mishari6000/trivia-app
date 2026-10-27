// Generates the General Knowledge category illustration with kie.ai (Nano Banana 2)
// and saves it to assets/images/category-general.png.
//
// Usage: node scripts/generate-category-art.mjs
// The API key is read from KIE_API_KEY, or asked for with hidden input. It is never
// written to disk, and must never be committed or shipped inside the app.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.kie.ai/api/v1/jobs';
const OUTPUT = path.join('assets', 'images', 'category-general.png');

const PROMPT = [
  'Flat cartoon illustration for a trivia game category card called "General Knowledge".',
  'An open book, a small globe, a glowing light bulb, a magnifying glass and a big question mark,',
  'arranged in a playful centered composition.',
  'Bold dark navy outlines, clean vector style, vibrant teal, blue and orange accents,',
  'on a warm golden-yellow background with soft subtle shapes.',
  'Friendly, modern, high contrast, no people, no text, no letters, no logos.',
].join(' ');

function askHidden(question) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (char) => {
      if (char === '\r' || char === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off('data', onData);
        stdout.write('\n');
        resolve(value.trim());
      } else if (char === '\u0003') {
        process.exit(1);
      } else if (char === '\u0008' || char === '\u007f') {
        value = value.slice(0, -1);
      } else {
        value += char;
      }
    };
    stdin.on('data', onData);
  });
}

async function api(url, apiKey, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  });
  const body = await res.json();
  if (!res.ok || body.code !== 200) {
    throw new Error(`kie.ai error ${body.code ?? res.status}: ${body.msg ?? res.statusText}`);
  }
  return body.data;
}

const apiKey = process.env.KIE_API_KEY || (await askHidden('kie.ai API key (hidden): '));
if (!apiKey) throw new Error('No API key provided.');

const { taskId } = await api(`${API}/createTask`, apiKey, {
  method: 'POST',
  body: JSON.stringify({
    model: 'nano-banana-2',
    input: { prompt: PROMPT, aspect_ratio: '1:1', resolution: '1K', output_format: 'png' },
  }),
});
console.log(`Task created: ${taskId}. Generating...`);

let imageUrl;
for (let attempt = 0; attempt < 60 && !imageUrl; attempt++) {
  await new Promise((r) => setTimeout(r, 5000));
  const task = await api(`${API}/recordInfo?taskId=${taskId}`, apiKey);
  if (task.state === 'fail') throw new Error(`Generation failed: ${task.failMsg ?? 'unknown'}`);
  if (task.state === 'success') imageUrl = JSON.parse(task.resultJson).resultUrls[0];
  else process.stdout.write('.');
}
if (!imageUrl) throw new Error('Timed out waiting for the image.');

const image = Buffer.from(await (await fetch(imageUrl)).arrayBuffer());
await mkdir(path.dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, image);
console.log(`\nSaved ${OUTPUT} (${Math.round(image.length / 1024)} KB)`);
