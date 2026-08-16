import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { CORPUS, PLAZO_PETICION_DIAS_HABILES, sumarDiasHabiles } from './corpus';
import { COMPUERTA_LABEL, COMPUERTAS, type Compuerta, type Hecho } from './schema';
import { getRuta } from './rutas';

export interface DatosPeticion {
  municipio: string;
  barrio: string;
  compuerta: Compuerta;
  hechos: Hecho[];
}

export const PETICION_TOKEN_TTL_MS = 15 * 60 * 1000;
const TOKEN_AAD = Buffer.from('contados-peticion-v1');
const MAX_TOKEN_CHARS = 20_000;

export class ErrorTokenPeticion extends Error {
  constructor(public readonly codigo: 'invalido' | 'expirado') {
    super(codigo === 'expirado' ? 'El enlace expiró.' : 'El enlace no es válido.');
    this.name = 'ErrorTokenPeticion';
  }
}

function textoLimitado(valor: unknown, maximo: number) {
  return typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';
}

export function normalizarDatosPeticion(valor: unknown): DatosPeticion {
  if (!valor || typeof valor !== 'object') throw new Error('Datos de petición inválidos.');
  const raw = valor as Record<string, unknown>;
  const compuerta = textoLimitado(raw.compuerta, 40) as Compuerta;
  if (!COMPUERTAS.includes(compuerta)) throw new Error('Compuerta desconocida.');
  const hechosRaw = Array.isArray(raw.hechos) ? raw.hechos.slice(0, 20) : [];
  const hechos = hechosRaw.flatMap((item): Hecho[] => {
    if (!item || typeof item !== 'object') return [];
    const hecho = item as Record<string, unknown>;
    const afirmacion = textoLimitado(hecho.afirmacion, 500);
    const evidencia = textoLimitado(hecho.evidencia, 500);
    return afirmacion && evidencia ? [{ afirmacion, evidencia }] : [];
  });
  return {
    municipio: textoLimitado(raw.municipio, 100),
    barrio: textoLimitado(raw.barrio, 120),
    compuerta,
    hechos,
  };
}

function claveToken(secreto: string) {
  if (secreto.trim().length < 32) {
    throw new Error('PETICION_LINK_SECRET debe tener al menos 32 caracteres.');
  }
  return createHash('sha256').update(secreto).digest();
}

export function crearTokenPeticion(
  datos: DatosPeticion,
  secreto: string,
  ahora = Date.now(),
) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', claveToken(secreto), iv);
  cipher.setAAD(TOKEN_AAD);
  const plano = Buffer.from(JSON.stringify({
    v: 1,
    emitidoEn: ahora,
    expiraEn: ahora + PETICION_TOKEN_TTL_MS,
    datos: normalizarDatosPeticion(datos),
  }));
  const cifrado = Buffer.concat([cipher.update(plano), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, cifrado].map((item) => item.toString('base64url')).join('.');
}

export function leerTokenPeticion(token: string, secreto: string, ahora = Date.now()) {
  if (!token || token.length > MAX_TOKEN_CHARS) throw new ErrorTokenPeticion('invalido');
  try {
    const partes = token.split('.');
    if (partes.length !== 3) throw new ErrorTokenPeticion('invalido');
    const [iv, tag, cifrado] = partes.map((item) => {
      if (!/^[A-Za-z0-9_-]+$/u.test(item)) throw new ErrorTokenPeticion('invalido');
      const bytes = Buffer.from(item, 'base64url');
      if (bytes.toString('base64url') !== item) throw new ErrorTokenPeticion('invalido');
      return bytes;
    });
    if (iv.length !== 12 || tag.length !== 16 || cifrado.length === 0) {
      throw new ErrorTokenPeticion('invalido');
    }
    const decipher = createDecipheriv('aes-256-gcm', claveToken(secreto), iv);
    decipher.setAAD(TOKEN_AAD);
    decipher.setAuthTag(tag);
    const plano = Buffer.concat([decipher.update(cifrado), decipher.final()]).toString('utf8');
    const sobre = JSON.parse(plano) as {
      v?: number;
      emitidoEn?: number;
      expiraEn?: number;
      datos?: unknown;
    };
    if (sobre.v !== 1 || !Number.isFinite(sobre.emitidoEn) || !Number.isFinite(sobre.expiraEn)) {
      throw new ErrorTokenPeticion('invalido');
    }
    if ((sobre.expiraEn as number) <= ahora) throw new ErrorTokenPeticion('expirado');
    return {
      datos: normalizarDatosPeticion(sobre.datos),
      emitidoEn: sobre.emitidoEn as number,
      expiraEn: sobre.expiraEn as number,
    };
  } catch (error) {
    if (error instanceof ErrorTokenPeticion) throw error;
    throw new ErrorTokenPeticion('invalido');
  }
}

const esc = (s: string) => s.replace(/[&<>\"]/g, (c) =>
  c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;');

const FECHA = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const SOLICITUD: Record<Compuerta, string> = {
  reporte: 'que se me informe si mi reporte de afectación quedó radicado, con el número o constancia correspondiente, y en qué fecha se realizará el censo de mi hogar.',
  censo: 'que se me informe si mi hogar quedó incluido en el censo de damnificados, y que se programe y me informe la fecha de la evaluación técnica de la vivienda.',
  evaluacion_tecnica: 'que se me informe el resultado de la evaluación técnica de mi vivienda y el siguiente paso aplicable a mi hogar.',
  rud: 'que se me informe si mi hogar quedó inscrito en el Registro Único de Damnificados (RUD) y, en caso negativo, cuál es la razón concreta y qué debo aportar para quedar inscrito.',
  subsidio: 'que se me informe si mi hogar figura entre los beneficiarios del subsidio, por qué medio se me notificará y qué debo hacer si el número de celular registrado ya no está a mi alcance.',
};

export function generarPeticionHtml(datosEntrada: DatosPeticion, fecha = new Date()) {
  const datos = normalizarDatosPeticion(datosEntrada);
  const cita = CORPUS['ley1755-art14'];
  const citaDerecho = CORPUS['ley1755-art13'];
  const ruta = getRuta(datos.municipio);
  const vence = sumarDiasHabiles(fecha, PLAZO_PETICION_DIAS_HABILES);
  const destinatario = ruta
    ? `Alcaldía de ${ruta.municipio} — Unidad de Gestión del Riesgo de Desastres`
    : 'Alcaldía municipal — Consejo Municipal de Gestión del Riesgo de Desastres';
  const hechos = datos.hechos.length > 0
    ? datos.hechos.map((hecho) => `<li>${esc(hecho.afirmacion)}</li>`).join('\n')
    : '<li>Mi vivienda resultó afectada por el sismo.</li>';

  return `<!doctype html>
<html lang="es-CO"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Derecho de petición — Contados</title>
<style>
:root{--ink:#171b24;--soft:#4a5261;--rule:#cfcdc4;--alert:#8a1c2b}*{box-sizing:border-box}
body{margin:0;background:#edece6;color:var(--ink);font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.65}
.barra{position:sticky;top:0;display:flex;gap:.75rem;flex-wrap:wrap;padding:.9rem 1.25rem;background:var(--ink);color:#f6f5f1;font-family:system-ui,sans-serif;align-items:center}
.barra button,.barra a{font:inherit;font-weight:700;cursor:pointer;border:2px solid #f6f5f1;background:#f6f5f1;color:var(--ink);padding:.55rem 1.1rem;text-decoration:none}.barra a{background:transparent;color:#f6f5f1}
.hoja{max-width:44rem;margin:1.5rem auto 4rem;background:#fff;padding:3.5rem 3rem;box-shadow:0 1px 3px #0002}.marca{font-family:system-ui,sans-serif;font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:var(--alert);border:1.5px solid var(--alert);padding:.4rem .7rem;display:inline-block;margin-bottom:2rem}
h1{font-size:1.15rem;letter-spacing:.06em;text-transform:uppercase;margin:0 0 2rem}.campo{margin-bottom:.35rem}.et{font-family:system-ui,sans-serif;font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:var(--soft)}p{margin:0 0 1.1rem;text-align:justify}li{margin-bottom:.55rem}.cita{border-left:3px solid var(--ink);padding:.2rem 0 .2rem 1.1rem;margin:1.4rem 0;color:var(--soft)}.firma{margin-top:3.5rem;border-top:1px solid var(--rule);padding-top:.6rem;width:60%}.procedencia{font-family:ui-monospace,monospace;font-size:.7rem;color:var(--soft);word-break:break-all}
@media(max-width:520px){.hoja{margin:0;padding:2rem 1.25rem;box-shadow:none}.barra{position:static}.firma{width:100%}}@media print{.barra{display:none}body{background:#fff;font-size:11.5pt}.hoja{box-shadow:none;margin:0;max-width:none;padding:0}@page{margin:2.2cm}}
</style></head><body>
<div class="barra"><button onclick="window.print()">Descargar o imprimir</button><a href="/">← Volver</a><span>Para PDF, elija «Guardar como PDF».</span></div>
<div class="hoja"><div class="marca">Borrador · No radicado · Caso de demostración</div><h1>Derecho de petición</h1>
<div class="campo"><span class="et">Señores</span><br>${esc(destinatario)}</div>
<div class="campo"><span class="et">Asunto</span><br>Solicitud de información sobre el estado de mi hogar en la ruta de atención a damnificados</div>
<div class="campo"><span class="et">Fecha</span><br>${esc(datos.municipio || 'Ciudad')}, ${FECHA.format(fecha)}</div><hr>
<p>Respetados señores:</p><p>En ejercicio del derecho fundamental de petición consagrado en el artículo 23 de la Constitución Política y reglamentado por la Ley 1755 de 2015, solicito <strong>${esc(SOLICITUD[datos.compuerta])}</strong></p>
<p><span class="et">Hechos</span></p><ol><li>El 10 de agosto de 2026 ocurrió un sismo que afectó el municipio de ${esc(datos.municipio || '__________')}${datos.barrio ? `, barrio ${esc(datos.barrio)}` : ''}.</li>${hechos}<li>El estado autorreportado de mi hogar corresponde al paso «${esc(COMPUERTA_LABEL[datos.compuerta])}». Solicito confirmación oficial y el siguiente paso aplicable.</li></ol>
<p><span class="et">Fundamento</span></p><div class="cita">«${esc(citaDerecho.texto)}»<br>— ${esc(citaDerecho.norma)}, ${esc(citaDerecho.articulo)}</div><div class="cita">«${esc(cita.texto)}»<br>— ${esc(cita.norma)}, ${esc(cita.articulo)}</div>
<p>Si se radica hoy, la respuesta debe producirse a más tardar el <strong>${FECHA.format(vence)}</strong>, conforme al término general de quince (15) días hábiles.</p>
<p><span class="et">Notificaciones</span></p><p>Recibiré respuesta en los datos de contacto que registre al radicar esta petición.</p>
<div class="firma"><span class="et">Firma</span><br>Nombre: __________________________________<br>Documento: _______________________________</div><hr>
<p class="procedencia">Procedencia: ${esc(cita.norma)}, ${esc(cita.articulo)} · ${esc(cita.entidad)} · consultado ${esc(cita.consultado)} · ${esc(cita.url)} · SHA-256 ${esc(cita.hash)}<br>${esc(citaDerecho.norma)}, ${esc(citaDerecho.articulo)} · SHA-256 ${esc(citaDerecho.hash)}<br><br>Documento generado por Contados como borrador. Contados no lo radica, no es un canal oficial y no evalúa la seguridad de una vivienda.</p>
</div></body></html>`;
}
