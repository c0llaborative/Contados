import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const audioPath = process.argv[2];
if (!audioPath) throw new Error('Uso: node scripts/probar-stt.mjs <audio-sintetico>');

const envText = await readFile(resolve('.env.local'), 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^(GROQ_API_KEY|STT_MODEL)=(.*)$/);
  if (match && match[2].trim()) process.env[match[1]] = match[2].trim();
}
if (!process.env.GROQ_API_KEY) throw new Error('Falta GROQ_API_KEY en .env.local.');

const absolutePath = resolve(audioPath);
const bytes = await readFile(absolutePath);
const extension = extname(absolutePath).toLowerCase();
const mime = extension === '.wav' ? 'audio/wav' : extension === '.mp3' ? 'audio/mpeg' : 'audio/ogg';
const moduleUrl = pathToFileURL(resolve('.test-dist/lib/canales/whatsapp/transcribir.js')).href;
const { transcribirAudio } = await import(moduleUrl);
const startedAt = performance.now();
const transcript = await transcribirAudio(new Blob([bytes], { type: mime }), `nota${extension || '.ogg'}`);

process.stdout.write(`${JSON.stringify({
  ok: true,
  model: process.env.STT_MODEL || 'whisper-large-v3-turbo',
  audioBytes: bytes.length,
  durationMs: Math.round(performance.now() - startedAt),
  transcript,
})}\n`);
