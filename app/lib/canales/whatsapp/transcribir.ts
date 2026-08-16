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

export async function transcribirAudio(
  audio: Blob,
  nombre = 'nota.ogg',
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Falta GROQ_API_KEY.');
  if (audio.size > MAX_AUDIO_BYTES) {
    throw new Error('La nota de voz supera el límite de 10 MB.');
  }
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

export async function transcribirAudioMeta(mediaId: string): Promise<string> {
  const audio = await descargarAudioMeta(mediaId);
  return transcribirAudio(audio, 'nota.ogg');
}
