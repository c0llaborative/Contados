import { transcribirAudio } from '@/lib/canales/whatsapp/transcribir';
import { conversador, ErrorLimiteConversacion } from '@/lib/nucleo/conversacion';
import { crearMensajeEnlacePeticion } from '@/lib/nucleo/enlace-peticion';

/**
 * Transcribe una nota de voz del simulador y la mete en la misma conversación
 * que el texto escrito. Es el mismo `transcribirAudio` que usa el webhook de
 * Meta: no hay una segunda implementación que pueda divergir.
 *
 * Esta ruta gasta cuota de un proveedor externo, así que está acotada a
 * propósito: tope de tamaño, tipo de contenido comprobado y un límite de
 * llamadas por minuto. Aun así, es una ruta pública de transcripción; si el
 * despliegue queda expuesto más allá de la demo, conviene apagarla.
 */

/** Muy por debajo del tope de Meta: una nota de la demo pesa cientos de KB. */
const MAX_BYTES = 2 * 1024 * 1024;
const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 12;

const llamadas: number[] = [];

function excedeLimite() {
  const ahora = Date.now();
  while (llamadas.length > 0 && llamadas[0] < ahora - VENTANA_MS) llamadas.shift();
  if (llamadas.length >= MAX_POR_VENTANA) return true;
  llamadas.push(ahora);
  return false;
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return Response.json({ error: 'La transcripción no está configurada.' }, { status: 503 });
    }
    if (excedeLimite()) {
      return Response.json({ error: 'Demasiadas notas seguidas. Espere un momento.' }, { status: 429 });
    }

    const form = await req.formData();
    const audio = form.get('audio');
    const sesionId = String(form.get('sesionId') ?? '').trim();
    const municipio = String(form.get('municipio') ?? 'Manizales');
    const barrio = String(form.get('barrio') ?? '');

    if (!/^[a-zA-Z0-9_-]{16,128}$/.test(sesionId)) {
      return Response.json({ error: 'Sesión inválida.' }, { status: 400 });
    }
    if (!(audio instanceof Blob) || audio.size === 0) {
      return Response.json({ error: 'No llegó la nota de voz.' }, { status: 400 });
    }
    if (audio.size > MAX_BYTES) {
      return Response.json({ error: 'La nota de voz es demasiado grande.' }, { status: 413 });
    }
    if (audio.type && !audio.type.startsWith('audio/')) {
      return Response.json({ error: 'El archivo no es audio.' }, { status: 415 });
    }

    // El audio vive sólo en memoria durante la transcripción y nunca se
    // escribe a disco. Ver docs/SEGURIDAD.md regla 12.
    const transcripcion = await transcribirAudio(audio, 'nota.ogg');

    const salida = await conversador.conversar({
      sesionId,
      texto: transcripcion,
      municipio,
      barrio,
    });
    const enlace = crearMensajeEnlacePeticion(
      salida.diagnostico,
      municipio,
      barrio,
      new URL(req.url).origin,
    );
    if (enlace) salida.mensajes.push(enlace);

    return Response.json({ ...salida, transcripcion });
  } catch (error) {
    if (error instanceof ErrorLimiteConversacion) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error('[nota-voz]', error instanceof Error ? error.message : 'error');
    return Response.json({ error: 'No pudimos transcribir la nota de voz.' }, { status: 500 });
  }
}
