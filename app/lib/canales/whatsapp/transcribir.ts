export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

async function descargarAudioMeta(mediaId: string): Promise<Blob> {
  const token = process.env.WHATSAPP_TOKEN;
  const version = process.env.WHATSAPP_GRAPH_VERSION;
  if (!token || !version) throw new Error('Falta configuración de Meta para descargar audio.');
  const metadata = await fetch(`https://graph.facebook.com/${version}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metadata.ok) throw new Error(`No se pudo resolver el audio de Meta (${metadata.status}).`);
  const { url } = (await metadata.json()) as { url?: string };
  if (!url) throw new Error('Meta no devolvió la URL del audio.');
  const media = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!media.ok) throw new Error(`No se pudo descargar el audio (${media.status}).`);
  const blob = await media.blob();
  return blob;
}

/**
 * Instrucción para el transcriptor basado en LLM.
 *
 * Groq usa Whisper, un modelo de reconocimiento de voz: devuelve lo que oyó.
 * Gemini es un modelo de lenguaje haciendo la misma tarea, y por defecto
 * tiende a corregir la gramática, completar frases y limpiar muletillas. Este
 * producto se apoya en la literalidad —cada hecho se cita con la frase textual
 * de la persona— así que la instrucción es explícita y la temperatura es cero.
 */
const PROMPT_TRANSCRIPCION = [
  'Transcribe literalmente el audio en español.',
  'Devuelve únicamente la transcripción, sin comillas, sin comentarios y sin explicaciones.',
  'No corrijas la gramática, no completes frases, no resumas y no cambies palabras.',
  'Si una parte es ininteligible, escribe [inaudible].',
].join(' ');

/**
 * Transcribe con Gemini.
 *
 * ATENCIÓN: el tier gratuito de Google usa el contenido para mejorar sus
 * productos, según su propia página de precios. Por eso este proveedor sólo es
 * admisible con el audio sintético de la demostración. Antes de procesar la voz
 * real de una persona damnificada hace falta un tier de pago o equivalente, y
 * volver a revisar `docs/SEGURIDAD.md` regla 12.
 */
async function transcribirConGemini(audio: Blob): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Falta GEMINI_API_KEY.');
  const modelo = process.env.GEMINI_STT_MODEL || 'gemini-3.6-flash';

  const base64 = Buffer.from(await audio.arrayBuffer()).toString('base64');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT_TRANSCRIPCION },
              {
                inline_data: {
                  mime_type: audio.type || 'audio/ogg',
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: { temperature: 0 },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`La transcripción falló (${response.status}).`);
  }
  const result = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const texto = result.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? '')
    .join('')
    .trim();
  if (!texto) throw new Error('La transcripción llegó vacía.');
  return texto;
}

async function transcribirConGroq(audio: Blob, nombre: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Falta GROQ_API_KEY.');
  const form = new FormData();
  form.set('file', new File([audio], nombre, { type: audio.type || 'audio/ogg' }));
  form.set('model', process.env.STT_MODEL || 'whisper-large-v3-turbo');
  form.set('language', 'es');
  form.set('temperature', '0');
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!response.ok) throw new Error(`La transcripción falló (${response.status}).`);
  const result = (await response.json()) as { text?: string };
  if (!result.text?.trim()) throw new Error('La transcripción llegó vacía.');
  return result.text.trim();
}

/**
 * Punto único de transcripción. El webhook de Meta y el simulador pasan por
 * aquí, así que cambiar de proveedor con `STT_PROVIDER` los cambia a los dos y
 * no puede haber dos comportamientos distintos.
 */
export async function transcribirAudio(
  audio: Blob,
  nombre = 'nota.ogg',
): Promise<string> {
  if (audio.size > MAX_AUDIO_BYTES) {
    throw new Error('La nota de voz supera el límite de 10 MB.');
  }
  return process.env.STT_PROVIDER === 'gemini'
    ? transcribirConGemini(audio)
    : transcribirConGroq(audio, nombre);
}

export async function transcribirAudioMeta(mediaId: string): Promise<string> {
  const audio = await descargarAudioMeta(mediaId);
  return transcribirAudio(audio, 'nota.ogg');
}
