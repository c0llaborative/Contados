import { conversador, ErrorLimiteConversacion } from '@/lib/nucleo/conversacion';
import { crearMensajeEnlacePeticion } from '@/lib/nucleo/enlace-peticion';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const sesionId = typeof body.sesionId === 'string' ? body.sesionId.trim() : '';
    const texto = typeof body.texto === 'string' ? body.texto : '';
    if (!/^[a-zA-Z0-9_-]{16,128}$/.test(sesionId)) {
      return Response.json({ error: 'Sesión inválida.' }, { status: 400 });
    }
    if (texto.length > 5000) {
      return Response.json({ error: 'El mensaje es demasiado largo.' }, { status: 400 });
    }
    const municipio = typeof body.municipio === 'string' ? body.municipio : 'Manizales';
    const barrio = typeof body.barrio === 'string' ? body.barrio : '';
    const salida = await conversador.conversar({
        sesionId,
        texto,
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
    return Response.json(salida);
  } catch (error) {
    if (error instanceof ErrorLimiteConversacion) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error('[conversacion]', error instanceof Error ? error.message : 'error');
    return Response.json(
      { error: 'No pudimos responder en este momento.' },
      { status: 500 },
    );
  }
}
