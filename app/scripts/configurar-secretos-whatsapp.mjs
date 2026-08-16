import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const VARIABLES = [
  'WHATSAPP_VERIFY_TOKEN',
  'SESION_SAL',
  'NOTIFICAR_ADMIN_TOKEN',
  'PETICION_LINK_SECRET',
];

const envPath = resolve('.env.local');
const original = await readFile(envPath, 'utf8');
const newline = original.includes('\r\n') ? '\r\n' : '\n';
const lines = original.split(/\r?\n/);
const existing = new Map();

for (const name of VARIABLES) {
  const matches = lines.filter((line) => line.startsWith(`${name}=`));
  if (matches.length > 1) throw new Error(`${name} está repetida en .env.local.`);
  const value = matches[0]?.slice(name.length + 1).trim() ?? '';
  if (value) throw new Error(`${name} ya tiene valor; se canceló sin sobrescribir.`);
  existing.set(name, randomBytes(32).toString('hex'));
}

for (const [name, value] of existing) {
  const index = lines.findIndex((line) => line.startsWith(`${name}=`));
  if (index >= 0) lines[index] = `${name}=${value}`;
  else lines.push(`${name}=${value}`);
}

const values = [...existing.values()];
const valid = values.every((value) => /^[a-f0-9]{64}$/.test(value));
const unique = new Set(values).size === VARIABLES.length;
if (!valid || !unique) throw new Error('La generación no cumplió longitud o unicidad.');

const updated = `${lines.join(newline).replace(/(?:\r?\n)*$/, '')}${newline}`;
await writeFile(envPath, updated, { encoding: 'utf8', mode: 0o600 });

process.stdout.write(`${JSON.stringify({
  configured: VARIABLES.length,
  bytesEach: 32,
  hexCharactersEach: 64,
  unique,
  valuesPrinted: false,
})}\n`);
