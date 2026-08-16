import {
  ErrorTokenPeticion,
  generarPeticionHtml,
  leerTokenPeticion,
} from '@/lib/nucleo/peticion';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const recuperacion = (mensaje: string) => `<!doctype html><html lang="es-CO"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Enlace no disponible — Contados</title></head><body style="font-family:system-ui;max-width:38rem;margin:4rem auto;padding:1.5rem"><h1>${mensaje}</h1><p>Por seguridad, vuelva a Contados y genere un borrador nuevo. Esto no borra ni radica ningún documento.</p><p><a href="/whatsapp">Volver al simulador</a></p></body></html>`;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const secreto = process.env.PETICION_LINK_SECRET;
  if (!secreto) return new Response(recuperacion('El enlace temporal no está configurado.'), {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
  try {
    const sobre = leerTokenPeticion(token, secreto);
    return new Response(generarPeticionHtml(sobre.datos, new Date(sobre.emitidoEn)), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'no-referrer',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch (error) {
    const expirado = error instanceof ErrorTokenPeticion && error.codigo === 'expirado';
    return new Response(recuperacion(expirado ? 'Este enlace expiró.' : 'Este enlace no es válido.'), {
      status: expirado ? 410 : 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
}
