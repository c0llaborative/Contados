import {
  CORPUS,
  PLAZO_PETICION_DIAS_HABILES,
  sumarDiasHabiles,
} from '@/lib/corpus';
import { COMPUERTA_LABEL, type Compuerta, type Hecho } from '@/lib/schema';
import { getRuta } from '@/lib/rutas';

/**
 * Genera el derecho de petición.
 *
 * Todo lo que puede ser determinista lo es: la cita sale del corpus con hash,
 * el plazo se calcula en código contando días hábiles, y el destinatario sale
 * de la ruta municipal verificada. El modelo no participa en este documento.
 */

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;',
  );

const FECHA = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Qué se pide en cada compuerta. Reglas fijas, no generadas. */
const SOLICITUD: Record<Compuerta, string> = {
  reporte:
    'que se me informe si mi reporte de afectación quedó radicado, con el número o constancia correspondiente, y en qué fecha se realizará el censo de mi hogar.',
  censo:
    'que se me informe si mi hogar quedó incluido en el censo de damnificados, y que se programe y me informe la fecha de la evaluación técnica de la vivienda.',
  evaluacion_tecnica:
    'que se programe y me informe la fecha de la evaluación técnica de mi vivienda, indicando cuántas visitas están pendientes en mi barrio y el criterio con el que se ordenan.',
  rud: 'que se me informe si mi hogar quedó inscrito en el Registro Único de Damnificados (RUD) y, en caso negativo, cuál es la razón concreta y qué debo aportar para quedar inscrito.',
  subsidio:
    'que se me informe si mi hogar figura entre los beneficiarios del subsidio, por qué medio se me notificará y qué debo hacer si el número de celular registrado ya no está a mi alcance.',
};

export async function POST(req: Request) {
  const form = await req.formData();
  const municipio = String(form.get('municipio') ?? '').trim();
  const barrio = String(form.get('barrio') ?? '').trim();
  const compuerta = String(form.get('compuerta') ?? '') as Compuerta;

  let hechos: Hecho[] = [];
  try {
    const raw = form.get('hechos');
    if (typeof raw === 'string') hechos = JSON.parse(raw) as Hecho[];
  } catch {
    hechos = [];
  }

  if (!SOLICITUD[compuerta]) {
    return new Response('Compuerta desconocida', { status: 400 });
  }

  const cita = CORPUS['ley1755-art14'];
  const citaDerecho = CORPUS['ley1755-art13'];
  const ruta = getRuta(municipio);

  const hoy = new Date();
  const vence = sumarDiasHabiles(hoy, PLAZO_PETICION_DIAS_HABILES);

  const destinatario = ruta
    ? `Alcaldía de ${ruta.municipio} — Unidad de Gestión del Riesgo de Desastres`
    : 'Alcaldía municipal — Consejo Municipal de Gestión del Riesgo de Desastres';

  const html = `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Derecho de petición — Contados</title>
<style>
  :root { --ink:#171b24; --soft:#4a5261; --faint:#8c93a1; --rule:#cfcdc4; --alert:#8a1c2b; }
  * { box-sizing:border-box; }
  body { margin:0; background:#edece6; color:var(--ink);
         font-family:Georgia,'Times New Roman',serif; font-size:16px; line-height:1.65; }
  .barra { position:sticky; top:0; display:flex; gap:.75rem; flex-wrap:wrap;
           padding:.9rem 1.25rem; background:var(--ink); color:#f6f5f1;
           font-family:system-ui,sans-serif; font-size:.9rem; align-items:center; }
  .barra button, .barra a { font:inherit; font-weight:700; cursor:pointer;
           border:2px solid #f6f5f1; background:#f6f5f1; color:var(--ink);
           padding:.55rem 1.1rem; border-radius:2px; text-decoration:none; }
  .barra a { background:transparent; color:#f6f5f1; }
  .hoja { max-width:44rem; margin:1.5rem auto 4rem; background:#fff; padding:3.5rem 3rem;
          box-shadow:0 1px 3px rgba(0,0,0,.14); }
  .marca { font-family:system-ui,sans-serif; font-size:.68rem; letter-spacing:.18em;
           text-transform:uppercase; font-weight:700; color:var(--alert);
           border:1.5px solid var(--alert); padding:.4rem .7rem; display:inline-block;
           margin-bottom:2rem; }
  h1 { font-size:1.15rem; letter-spacing:.06em; text-transform:uppercase; margin:0 0 2rem; }
  .campo { margin-bottom:.35rem; }
  .et { font-family:system-ui,sans-serif; font-size:.68rem; letter-spacing:.16em;
        text-transform:uppercase; font-weight:700; color:var(--faint); }
  p { margin:0 0 1.1rem; text-align:justify; }
  ol, ul { padding-left:1.4rem; }
  li { margin-bottom:.55rem; }
  .cita { border-left:3px solid var(--ink); padding:.2rem 0 .2rem 1.1rem; margin:1.4rem 0;
          font-size:.95rem; color:var(--soft); }
  .procedencia { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.7rem;
                 color:var(--faint); word-break:break-all; line-height:1.5; }
  .firma { margin-top:3.5rem; border-top:1px solid var(--rule); padding-top:.6rem; width:60%; }
  hr { border:0; border-top:1px solid var(--rule); margin:2.5rem 0; }
  @media print {
    .barra { display:none; }
    body { background:#fff; font-size:11.5pt; }
    .hoja { box-shadow:none; margin:0; max-width:none; padding:0; }
    @page { margin:2.2cm; }
  }
</style>
</head>
<body>
<div class="barra">
  <button onclick="window.print()">Descargar o imprimir</button>
  <a href="/">← Volver</a>
  <span style="opacity:.75">Para guardarlo como PDF, elija «Guardar como PDF» en el destino de impresión.</span>
</div>

<div class="hoja">
  <div class="marca">Borrador · No radicado · Caso de demostración</div>

  <h1>Derecho de petición</h1>

  <div class="campo"><span class="et">Señores</span><br>${esc(destinatario)}</div>
  <div class="campo"><span class="et">Asunto</span><br>Solicitud de información sobre el estado de mi hogar en la ruta de atención a damnificados</div>
  <div class="campo"><span class="et">Fecha</span><br>${esc(municipio || 'Ciudad')}, ${FECHA.format(hoy)}</div>

  <hr>

  <p>Respetados señores:</p>

  <p>En ejercicio del derecho fundamental de petición consagrado en el artículo 23 de la
  Constitución Política y reglamentado por la Ley 1755 de 2015, me permito solicitar
  <strong>${esc(SOLICITUD[compuerta])}</strong></p>

  <p><span class="et">Hechos</span></p>
  <ol>
    <li>El 10 de agosto de 2026 ocurrió un sismo de magnitud 7,4 que afectó el occidente
    del país, incluido el municipio de ${esc(municipio || '__________')}${
      barrio ? `, barrio ${esc(barrio)}` : ''
    }.</li>
    ${
      hechos.length > 0
        ? hechos
            .map((h) => `<li>${esc(h.afirmacion)}</li>`)
            .join('\n    ')
        : '<li>Mi vivienda resultó afectada por el sismo.</li>'
    }
    <li>A la fecha de esta petición, el estado de mi hogar en la ruta de atención
    corresponde al paso «${esc(COMPUERTA_LABEL[compuerta])}», sin que se me haya
    informado la fecha ni el resultado del paso siguiente.</li>
  </ol>

  <p><span class="et">Fundamento</span></p>

  <div class="cita">
    «${esc(citaDerecho.texto)}»<br>
    — ${esc(citaDerecho.norma)}, ${esc(citaDerecho.articulo)}
  </div>

  <div class="cita">
    «${esc(cita.texto)}»<br>
    — ${esc(cita.norma)}, ${esc(cita.articulo)}
  </div>

  <p>En consecuencia, la respuesta a esta petición debe producirse a más tardar el
  <strong>${FECHA.format(vence)}</strong>, contados quince (15) días hábiles desde su
  radicación.</p>

  <p><span class="et">Notificaciones</span></p>
  <p>Recibiré respuesta en la dirección y los datos de contacto que dejo registrados al
  momento de radicar esta petición.</p>

  <div class="firma">
    <span class="et">Firma</span><br>
    Nombre: __________________________________<br>
    Documento: _______________________________
  </div>

  <hr>

  <p class="procedencia">
    Procedencia de las citas — ${esc(cita.norma)}, ${esc(cita.articulo)} ·
    ${esc(cita.entidad)} · consultado ${esc(cita.consultado)} ·
    ${esc(cita.url)} · SHA-256 ${esc(cita.hash)}<br>
    ${esc(citaDerecho.norma)}, ${esc(citaDerecho.articulo)} · SHA-256 ${esc(citaDerecho.hash)}<br><br>
    Documento generado por Contados como borrador. Contados no radica peticiones ante
    ninguna entidad, no es un canal oficial y no evalúa la seguridad ni la habitabilidad
    de una vivienda.
  </p>
</div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
