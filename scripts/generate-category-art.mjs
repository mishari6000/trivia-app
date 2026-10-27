// Generates category card illustrations with kie.ai (Nano Banana 2) and saves them to
// assets/images/category-<slug>.png.
//
// Usage: node scripts/generate-category-art.mjs [slug ...]   (default: every slug below)
// The API key is read from KIE_API_KEY, or asked for with hidden input. It is never
// written to disk, and must never be committed or shipped inside the app.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.kie.ai/api/v1/jobs';

/** What each category card shows; the shared style keeps the set consistent. */
const SUBJECTS = {
  general:
    '"General Knowledge": an open book, a small globe, a glowing light bulb, a magnifying glass and a big question mark',
  science:
    '"Science & Nature": a bubbling lab flask, a microscope, an atom symbol, a green leaf and a small planet',
  geography:
    '"Geography": a globe, a folded paper map with a location pin, a compass and small mountains',
  history:
    '"History": an hourglass, an old parchment scroll, an ancient column, a quill and a small pyramid',
  sports:
    '"Sports": a football, a basketball, a gold trophy, a stopwatch and a whistle',
  animals:
    '"Animals": a friendly camel, a giraffe head, a parrot, a sea turtle and a paw print',
};

const STYLE = [
  'arranged in a playful centered composition.',
  'Bold dark navy outlines, clean vector style, vibrant teal, blue and orange accents,',
  'on a warm golden-yellow background with soft subtle shapes.',
  'Friendly, modern, high contrast, no people, no text, no letters, no logos.',
].join(' ');

const promptFor = (slug) =>
  `Flat cartoon illustration for a trivia game category card called ${SUBJECTS[slug]}, ${STYLE}`;

function askHidden(question) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (chunk) => {
      // A paste arrives as one chunk, often wrapped in bracketed-paste markers
      // (ESC[200~ … ESC[201~). Drop those and keep only printable ASCII key characters.
      const text = chunk.replace(/\u001b\[20[01]~/g, '');
      for (const char of text) {
        if (char === '\r' || char === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', onData);
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u0003') process.exit(1);
        if (char === '\u0008' || char === '\u007f') value = value.slice(0, -1);
        else if (/^[\x21-\x7e]$/.test(char)) value += char;
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

async function generate(slug, apiKey) {
  const output = path.join('assets', 'images', `category-${slug}.png`);
  const { taskId } = await api(`${API}/createTask`, apiKey, {
    method: 'POST',
    body: JSON.stringify({
      model: 'nano-banana-2',
      input: { prompt: promptFor(slug), aspect_ratio: '1:1', resolution: '1K', output_format: 'png' },
    }),
  });
  process.stdout.write(`${slug}: task ${taskId} `);

  let imageUrl;
  for (let attempt = 0; attempt < 60 && !imageUrl; attempt++) {
    await new Promise((r) => setTimeout(r, 5000));
    const task = await api(`${API}/recordInfo?taskId=${taskId}`, apiKey);
    if (task.state === 'fail') throw new Error(`${slug} failed: ${task.failMsg ?? 'unknown'}`);
    if (task.state === 'success') imageUrl = JSON.parse(task.resultJson).resultUrls[0];
    else process.stdout.write('.');
  }
  if (!imageUrl) throw new Error(`${slug}: timed out waiting for the image.`);

  const image = Buffer.from(await (await fetch(imageUrl)).arrayBuffer());
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, image);
  console.log(`\nSaved ${output} (${Math.round(image.length / 1024)} KB)`);
}

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SUBJECTS);
const unknown = slugs.filter((slug) => !SUBJECTS[slug]);
if (unknown.length) throw new Error(`Unknown category: ${unknown.join(', ')}`);

const apiKey = process.env.KIE_API_KEY || (await askHidden('kie.ai API key (hidden): '));
if (!apiKey) throw new Error('No API key provided.');

for (const slug of slugs) await generate(slug, apiKey);
