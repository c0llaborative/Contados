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
/** Una historia partida en dos o tres audios es normal; más, no. */
const MAX_NOTAS = 4;
const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 12;

const llamadas: number[] = [];

/**
 * Compuerta explícita. El 2026-08-16 la cuenta de Groq empezó a rechazar los
 * endpoints de inferencia con 401 aunque la clave sirve para listar modelos,
 * así que la función queda apagada por defecto: más vale que el botón no
 * exista a que falle delante del jurado. Se enciende poniendo
 * `NOTAS_VOZ_DEMO=true` en el entorno, sin tocar código.
 */
function habilitado() {
  if (process.env.NOTAS_VOZ_DEMO !== 'true') return false;
  return process.env.STT_PROVIDER === 'gemini'
    ? Boolean(process.env.GEMINI_API_KEY)
    : Boolean(process.env.GROQ_API_KEY);
}

/**
 * El simulador consulta esto al cargar para decidir si muestra los botones.
 * Devuelve también el proveedor para que la pantalla no pueda nombrar uno
 * distinto del que realmente transcribe.
 */
export async function GET() {
  const proveedor = process.env.STT_PROVIDER === 'gemini' ? 'Gemini' : 'Groq';
  return Response.json({ disponible: habilitado(), proveedor });
}

function excedeLimite() {
  const ahora = Date.now();
  while (llamadas.length > 0 && llamadas[0] < ahora - VENTANA_MS) llamadas.shift();
  if (llamadas.length >= MAX_POR_VENTANA) return true;
  llamadas.push(ahora);
  return false;
}

export async function POST(req: Request) {
  try {
    if (!habilitado()) {
      return Response.json({ error: 'Las notas de voz están desactivadas.' }, { status: 503 });
    }
    if (excedeLimite()) {
      return Response.json({ error: 'Demasiadas notas seguidas. Espere un momento.' }, { status: 429 });
    }

    const form = await req.formData();
    const audios = form.getAll('audio').filter((a): a is File => a instanceof Blob);
    const sesionId = String(form.get('sesionId') ?? '').trim();
    const municipio = String(form.get('municipio') ?? 'Manizales');
    const barrio = String(form.get('barrio') ?? '');

    if (!/^[a-zA-Z0-9_-]{16,128}$/.test(sesionId)) {
      return Response.json({ error: 'Sesión inválida.' }, { status: 400 });
    }
    if (audios.length === 0 || audios.some((a) => a.size === 0)) {
      return Response.json({ error: 'No llegó la nota de voz.' }, { status: 400 });
    }
    if (audios.length > MAX_NOTAS) {
      return Response.json({ error: 'Demasiadas notas en un envío.' }, { status: 400 });
    }
    if (audios.reduce((suma, a) => suma + a.size, 0) > MAX_BYTES) {
      return Response.json({ error: 'Las notas de voz son demasiado grandes.' }, { status: 413 });
    }
    if (audios.some((a) => a.type && !a.type.startsWith('audio/'))) {
      return Response.json({ error: 'El archivo no es audio.' }, { status: 415 });
    }

    // Varias notas seguidas se transcriben y se juntan en un solo relato antes
    // de clasificar, igual que hace la agrupación de 12 segundos del canal de
    // Meta. Así quien manda su historia partida en dos audios recibe un
    // diagnóstico, no dos medias respuestas.
    // El audio vive sólo en memoria durante la transcripción y nunca se escribe
    // a disco. Ver docs/SEGURIDAD.md regla 12.
    const transcripciones: string[] = [];
    for (const audio of audios) {
      transcripciones.push(await transcribirAudio(audio, 'nota.ogg'));
    }
    const transcripcion = transcripciones.join('\n');

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

    return Response.json({ ...salida, transcripcion, transcripciones });
  } catch (error) {
    if (error instanceof ErrorLimiteConversacion) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error('[nota-voz]', error instanceof Error ? error.message : 'error');
    return Response.json({ error: 'No pudimos transcribir la nota de voz.' }, { status: 500 });
  }
}
