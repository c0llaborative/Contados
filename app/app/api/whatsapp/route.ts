import { createHmac, timingSafeEqual } from 'crypto';
import { after } from 'next/server';
import { crearAgrupador, debounceWhatsAppMs } from '@/lib/canales/whatsapp/agrupar';
import { extraerMensajes } from '@/lib/canales/whatsapp/entrante';
import type { MensajeMeta } from '@/lib/canales/whatsapp/entrante';
import { idSeguroDeTelefono } from '@/lib/canales/whatsapp/identidad';
import {
  enviarTexto,
  ErrorEnvioMeta,
  META_DESTINO_NO_AUTORIZADO,
} from '@/lib/canales/whatsapp/saliente';
import { transcribirAudioMeta } from '@/lib/canales/whatsapp/transcribir';
import { conversador, MAX_RELATO_CARACTERES } from '@/lib/nucleo/conversacion';
import { crearMensajeEnlacePeticion } from '@/lib/nucleo/enlace-peticion';

export const runtime = 'nodejs';
export const maxDuration = 30;

const agrupador = crearAgrupador<MensajeMeta>(async (entradas) => {
  const destino = entradas[0]?.valor.de;
  if (!destino) return;
  try {
    const fragmentos = await Promise.all(entradas.map(async ({ valor }) =>
      valor.tipo === 'audio' && valor.audioId
        ? transcribirAudioMeta(valor.audioId)
        : valor.texto ?? ''));
    const texto = fragmentos.map((item) => item.trim()).filter(Boolean).join('\n');
    if (!texto) return;
    if (texto.length > MAX_RELATO_CARACTERES) {
      throw new Error(`El relato agrupado supera ${MAX_RELATO_CARACTERES} caracteres.`);
    }
    const salida = await conversador.conversar({
      sesionId: entradas[0].clave,
      texto,
      municipio: 'Manizales',
      destinatarioTemporal: destino,
    });
    const enlace = process.env.APP_PUBLIC_URL
      ? crearMensajeEnlacePeticion(
          salida.diagnostico,
          'Manizales',
          '',
          process.env.APP_PUBLIC_URL,
        )
      : null;
    if (enlace) salida.mensajes.push(enlace);
    if (process.env.WHATSAPP_SEND_ENABLED === 'true') {
      for (const respuesta of salida.mensajes) await enviarTexto(destino, respuesta);
    }
  } catch (error) {
    // Si lo que falló fue la entrega, disculparse por el mismo canal vuelve a
    // fallar exactamente igual y sólo ensucia el log. El caso observado en
    // producción es 131030: el número de pruebas de Meta no puede responderle a
    // un teléfono que no esté en su lista de destinatarios autorizados, así que
    // la persona no recibe nada y aquí queda dicho por qué.
    if (error instanceof ErrorEnvioMeta) {
      if (error.codigo === META_DESTINO_NO_AUTORIZADO) {
        console.error(
          '[whatsapp] Meta no entregó la respuesta: el teléfono no está en la lista de destinatarios autorizados del número de pruebas. Agréguelo en la consola de Meta (WhatsApp › API Setup) o use un número de producción.',
        );
      }
      throw error;
    }
    if (process.env.WHATSAPP_SEND_ENABLED === 'true') {
      try {
        await enviarTexto(
          destino,
          'No pudimos procesar su mensaje en este momento. Intente enviarlo de nuevo o use la ruta web de Contados.',
        );
      } catch (sendError) {
        console.error('[whatsapp-send]', sendError instanceof Error ? sendError.message : 'error');
      }
    }
    throw error;
  }
}, { esperaMs: debounceWhatsAppMs() });

function firmaValida(raw: string, firma: string | null) {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !firma?.startsWith('sha256=')) return false;
  const esperada = `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`;
  const a = Buffer.from(esperada);
  const b = Buffer.from(firma);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const modo = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (
    modo === 'subscribe' &&
    challenge &&
    process.env.WHATSAPP_VERIFY_TOKEN &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
  return new Response('Verificación rechazada', { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!firmaValida(raw, req.headers.get('x-hub-signature-256'))) {
    return new Response('Firma inválida', { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response('JSON inválido', { status: 400 });
  }

  const mensajes = extraerMensajes(payload as never);
  for (const mensaje of mensajes) {
    const sesionId = idSeguroDeTelefono(mensaje.de);
    after(async () => {
      try {
        await agrupador.recibir({ clave: sesionId, id: mensaje.id, valor: mensaje });
      } catch (error) {
        console.error('[whatsapp]', error instanceof Error ? error.message : 'error');
      }
    });
  }
  return Response.json({ recibido: true, mensajes: mensajes.length, agrupadoMs: debounceWhatsAppMs() });
}
