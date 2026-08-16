import { generarPeticionHtml, normalizarDatosPeticion } from '@/lib/nucleo/peticion';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    let hechos: unknown[] = [];
    const raw = form.get('hechos');
    if (typeof raw === 'string') hechos = JSON.parse(raw) as unknown[];
    const datos = normalizarDatosPeticion({
      municipio: form.get('municipio'),
      barrio: form.get('barrio'),
      compuerta: form.get('compuerta'),
      hechos,
    });
    return new Response(generarPeticionHtml(datos), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch {
    return new Response('No fue posible generar el borrador.', { status: 400 });
  }
}
