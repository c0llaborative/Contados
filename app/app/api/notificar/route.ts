import { enviarTexto } from '@/lib/canales/whatsapp/saliente';
import { conversador } from '@/lib/nucleo/conversacion';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const barrio = typeof body.barrio === 'string' ? body.barrio.trim() : '';
    const mensaje = typeof body.mensaje === 'string' ? body.mensaje.trim() : '';
    const enviarReal = body.enviarReal === true;
    if (!barrio || mensaje.length < 10 || mensaje.length > 1000) {
      return Response.json({ error: 'Barrio o mensaje inválido.' }, { status: 400 });
    }
    const destinatarios = conversador.notificarBarrio(barrio, mensaje);
    let enviados = 0;
    if (enviarReal) {
      const autorizado =
        process.env.NOTIFICAR_ADMIN_TOKEN &&
        req.headers.get('authorization') === `Bearer ${process.env.NOTIFICAR_ADMIN_TOKEN}`;
      if (!autorizado) return Response.json({ error: 'No autorizado.' }, { status: 401 });
      for (const destino of destinatarios) {
        if (!destino.destinatarioTemporal) continue;
        await enviarTexto(destino.destinatarioTemporal, mensaje);
        enviados += 1;
      }
    }
    return Response.json({ afectados: destinatarios.length, enviados });
  } catch (error) {
    console.error('[notificar]', error instanceof Error ? error.message : 'error');
    return Response.json({ error: 'No se pudo crear la notificación.' }, { status: 500 });
  }
}
