import { createHash } from 'crypto';

export function idSeguroDeTelefono(numero: string): string {
  const sal = process.env.SESION_SAL;
  if (!sal || sal.length < 16) {
    throw new Error('SESION_SAL debe existir y tener al menos 16 caracteres.');
  }
  return createHash('sha256').update(`${numero}:${sal}`).digest('hex');
}
