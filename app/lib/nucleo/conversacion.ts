import { almacenPorDefecto, type AlmacenSesiones } from './almacen-sesiones';
import type { Clasificador } from './clasificar';
import { clasificar as clasificarReal } from './clasificar';
import {
  COMPUERTA_EXPLICACION,
  COMPUERTA_LABEL,
  PREFIJO_AVISO_BARRIO,
  RIESGO_LABEL,
  type Compuerta,
  type Diagnostico,
} from './schema';
import { getRuta } from './rutas';

export type EstadoConversacion =
  | 'NUEVO'
  | 'ESCUCHANDO'
  | 'PREGUNTANDO'
  | 'SEGUIMIENTO';

export interface EntradaConversacion {
  sesionId: string;
  texto: string;
  municipio?: string;
  barrio?: string;
  destinatarioTemporal?: string;
}

export interface SalidaConversacion {
  estado: EstadoConversacion;
  mensajes: string[];
  diagnostico?: Diagnostico;
}

interface Sesion {
  estado: EstadoConversacion;
  relato: string;
  rondas: number;
  preguntas: string[];
  municipio: string;
  barrio: string;
  actualizadoEn: number;
  destinatarioTemporal?: string;
  pendientes: string[];
  /** Último paso comunicado. Sirve para no repetir el bloque completo. */
  ultimaCompuerta?: Compuerta;
  /** Riesgos ya avisados, para no volver a alarmar con lo mismo. */
  alertasVistas?: string[];
}

export const SALUDO =
  'Soy Contados. Le ayudo a entender en qué paso de la ruta de atención va y qué puede hacer. Esto no lo registra ante ninguna entidad. Nunca le pediremos cédula, datos bancarios ni huella; registrarse en el censo es gratis. Cuénteme qué pasó: puede escribir o mandar una nota de voz.';

/** Cuando ni con tres preguntas alcanza. Se abstiene y lo dice. */
export const SIN_UBICACION =
  'Con lo que me contó no puedo ubicarlo con seguridad. Confirme su caso con la Unidad de Gestión del Riesgo de su alcaldía. No voy a inventar un paso.';

const TTL_MS = 30 * 60 * 1000;
export const MAX_RELATO_CARACTERES = 5000;

export class ErrorLimiteConversacion extends Error {
  constructor() {
    super(`El relato supera ${MAX_RELATO_CARACTERES} caracteres.`);
    this.name = 'ErrorLimiteConversacion';
  }
}

function esSoloSaludo(texto: string) {
  return /^(hola|buen(?:os|as)(?: días| tardes| noches)?|hey|buenas)[.!\s]*$/i.test(
    texto,
  );
}

const AVISO_ESTAFA =
  '⚠️ Cuidado: por lo que contó, quien tomó sus datos podría no ser funcionario. No pague ni entregue huella o datos bancarios; verifique en el punto oficial.';

const CIERRE =
  'Puedo avisarle por este canal si cambia la atención en su barrio. Recuerde: Contados no es un canal oficial y no garantiza una ayuda.';

function mensajeQueHacer(compuerta: Compuerta, municipio: string): string {
  const paso = getRuta(municipio)?.pasos[compuerta];
  if (!paso) {
    return 'Confirme el siguiente paso con la Unidad de Gestión del Riesgo de su alcaldía. Aún no tenemos una ruta municipal verificada para su municipio.';
  }
  return `Qué hacer ahora: ${paso.accion}${paso.lugar ? ` Dónde: ${paso.lugar}.` : ''}${paso.nota ? ` ${paso.nota}` : ''}`;
}

/**
 * Avisa sólo de los riesgos que no se hayan avisado antes en esta sesión.
 * Repetir la misma alarma en cada mensaje la vuelve ruido y deja de leerse;
 * un riesgo nuevo sí tiene que aparecer. `vistas` se actualiza aquí.
 */
function alertasNuevas(dx: Diagnostico, vistas: string[]): string[] {
  const mensajes: string[] = [];
  for (const alerta of dx.alertas) {
    if (vistas.includes(alerta.riesgo)) continue;
    vistas.push(alerta.riesgo);
    mensajes.push(
      `Riesgo de quedar por fuera: ${RIESGO_LABEL[alerta.riesgo]}. ${alerta.razon} Pida esto: ${alerta.accion}`,
    );
  }
  return mensajes;
}

function mensajeDiagnostico(dx: Diagnostico, municipio: string, vistas: string[]): string[] {
  const mensajes: string[] = [];
  if (dx.posible_estafa) mensajes.push(AVISO_ESTAFA);
  if (dx.compuerta === null) return mensajes;

  mensajes.push(
    `Su caso parece estar en: ${COMPUERTA_LABEL[dx.compuerta]}. ${COMPUERTA_EXPLICACION[dx.compuerta]} ${dx.razon}`,
  );
  mensajes.push(mensajeQueHacer(dx.compuerta, municipio));
  mensajes.push(...alertasNuevas(dx, vistas));
  mensajes.push(CIERRE);
  return mensajes;
}

/**
 * Respuesta a un mensaje de seguimiento cuando el paso no cambió.
 *
 * Volver a soltar el bloque completo ante cada «¿y cuánto me demoro?» hace que
 * la persona deje de leerlo. Se confirma el paso y se repite qué hacer, que es
 * lo accionable; la explicación larga y el cierre ya se dijeron.
 */
function mensajeSeguimiento(dx: Diagnostico, municipio: string, vistas: string[]): string[] {
  const mensajes: string[] = [];
  if (dx.posible_estafa) mensajes.push(AVISO_ESTAFA);
  if (dx.compuerta === null) return mensajes;

  mensajes.push(`Sigue en: ${COMPUERTA_LABEL[dx.compuerta]}.`);
  mensajes.push(mensajeQueHacer(dx.compuerta, municipio));
  mensajes.push(...alertasNuevas(dx, vistas));
  return mensajes;
}

export function crearConversador(
  clasificador: Clasificador = clasificarReal,
  ahora: () => number = Date.now,
  almacen: AlmacenSesiones = almacenPorDefecto(),
) {
  const colas = new Map<string, Promise<void>>();

  async function conversarInterno(entrada: EntradaConversacion): Promise<SalidaConversacion> {
    const texto = entrada.texto.trim();
    const guardada = await almacen.leer(entrada.sesionId);
    // Una sesión más vieja que el TTL se descarta aquí. En Redis la expiración
    // ya la aplica el propio almacén; esto cubre el caso en memoria.
    let sesion =
      guardada && guardada.actualizadoEn >= ahora() - TTL_MS
        ? (guardada as Sesion)
        : undefined;
    const mensajes: string[] = [];

    if (!sesion) {
      sesion = {
        estado: 'NUEVO',
        relato: '',
        rondas: 0,
        preguntas: [],
        municipio: entrada.municipio?.trim() || 'Manizales',
        barrio: entrada.barrio?.trim() || '',
        actualizadoEn: ahora(),
        destinatarioTemporal: entrada.destinatarioTemporal,
        pendientes: [],
      };
      mensajes.push(SALUDO);
      sesion.estado = 'ESCUCHANDO';
      if (!texto || esSoloSaludo(texto)) {
        await almacen.escribir(entrada.sesionId, sesion, TTL_MS);
        return { estado: sesion.estado, mensajes };
      }
    }

    sesion.actualizadoEn = ahora();
    sesion.municipio = entrada.municipio?.trim() || sesion.municipio;
    sesion.barrio = entrada.barrio?.trim() || sesion.barrio;
    sesion.destinatarioTemporal = entrada.destinatarioTemporal ?? sesion.destinatarioTemporal;
    mensajes.push(...sesion.pendientes.splice(0));

    // Toda salida persiste la sesión antes de responder. Si no se guardara, el
    // siguiente mensaje podría caer en otra instancia y empezar de cero.
    const guardar = async () => {
      await almacen.escribir(entrada.sesionId, sesion!, TTL_MS);
    };

    if (!texto) {
      await guardar();
      return { estado: sesion.estado, mensajes };
    }
    if (sesion.estado === 'SEGUIMIENTO') {
      // El mensaje que llega después de un diagnóstico casi siempre es sobre la
      // misma historia: «¿y cuánto me demoro?», «ya fui». Antes se borraba el
      // relato y se clasificaba ese mensaje suelto, que por sí solo no alcanza
      // para ubicar a nadie; el modelo se abstenía —correctamente— y devolvía
      // una pregunta de apertura. La sesión nunca se había perdido, pero la
      // persona veía a Contados olvidando todo lo que acababa de contar.
      // El relato se conserva y lo nuevo se le suma. `preguntas` también se
      // conserva, para no volver a preguntar lo mismo.
      sesion.rondas = 0;
      sesion.estado = 'ESCUCHANDO';
    }
    if (sesion.estado === 'PREGUNTANDO' && sesion.rondas >= 3) {
      sesion.estado = 'SEGUIMIENTO';
      mensajes.push(
        SIN_UBICACION,
      );
      await guardar();
      return { estado: sesion.estado, mensajes };
    }

    const relatoPropuesto = sesion.relato ? `${sesion.relato}\n${texto}` : texto;
    if (relatoPropuesto.length > MAX_RELATO_CARACTERES) throw new ErrorLimiteConversacion();
    const diagnostico = await clasificador(relatoPropuesto, sesion.municipio);
    sesion.relato = relatoPropuesto;
    if (diagnostico.compuerta === null) {
      const pregunta =
        diagnostico.falta_preguntar.find((item) => !sesion!.preguntas.includes(item)) ??
        '¿Un funcionario tomó sus datos o un técnico revisó su vivienda?';
      sesion.preguntas.push(pregunta);
      sesion.rondas += 1;
      sesion.estado = 'PREGUNTANDO';
      mensajes.push(pregunta);
      await guardar();
      return { estado: sesion.estado, mensajes, diagnostico };
    }

    const mismoPaso = sesion.ultimaCompuerta === diagnostico.compuerta;
    const vistas = (sesion.alertasVistas ??= []);
    sesion.estado = 'SEGUIMIENTO';
    sesion.ultimaCompuerta = diagnostico.compuerta;
    mensajes.push(
      ...(mismoPaso
        ? mensajeSeguimiento(diagnostico, sesion.municipio, vistas)
        : mensajeDiagnostico(diagnostico, sesion.municipio, vistas)),
    );
    await guardar();
    return { estado: sesion.estado, mensajes, diagnostico };
  }

  function conversar(entrada: EntradaConversacion): Promise<SalidaConversacion> {
    const anterior = colas.get(entrada.sesionId) ?? Promise.resolve();
    const turno = anterior.catch(() => undefined).then(() => conversarInterno(entrada));
    const cierre = turno.then(() => undefined, () => undefined);
    colas.set(entrada.sesionId, cierre);
    return turno.finally(() => {
      if (colas.get(entrada.sesionId) === cierre) colas.delete(entrada.sesionId);
    });
  }

  async function notificarBarrio(barrio: string, mensaje: string) {
    const destinatarios: { sesionId: string; destinatarioTemporal?: string }[] = [];
    for (const { id: sesionId, sesion } of await almacen.porBarrio(barrio)) {
      if (sesion.estado === 'SEGUIMIENTO') {
        sesion.pendientes.push(`${PREFIJO_AVISO_BARRIO}${mensaje}`);
        await almacen.escribir(sesionId, sesion, TTL_MS);
        destinatarios.push({ sesionId, destinatarioTemporal: sesion.destinatarioTemporal });
      }
    }
    return destinatarios;
  }

  return { conversar, notificarBarrio };
}

export const conversador = crearConversador();
