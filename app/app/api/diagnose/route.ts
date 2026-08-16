import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { clasificar } from '@/lib/nucleo/clasificar';

export async function POST(req: Request) {
  let relato = '';
  let municipio = '';
  try {
    const body = await req.json();
    relato = typeof body.relato === 'string' ? body.relato.trim() : '';
    municipio = typeof body.municipio === 'string' ? body.municipio : '';
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (relato.length < 10) {
    return NextResponse.json(
      { error: 'Cuéntenos un poco más de lo que pasó.' },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await clasificar(relato, municipio));
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'Hay mucha gente usando el sistema. Intente en un momento.' },
        { status: 429 },
      );
    }
    console.error('[diagnose]', error instanceof Error ? error.message : 'error');
    return NextResponse.json(
      { error: 'No pudimos analizar su caso en este momento.' },
      { status: 500 },
    );
  }
}
