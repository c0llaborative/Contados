import type { Clasificador } from './clasificar';
import { clasificar as clasificarReal } from './clasificar';
import { COMPUERTA_EXPLICACION, COMPUERTA_LABEL, RIESGO_LABEL, type Diagnostico } from './schema';
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
}

const SALUDO =
  'Soy Contados. Le ayudo a entender en qué paso de la ruta de atención va y qué puede hacer. Esto no lo registra ante ninguna entidad. Nunca le pediremos cédula, datos bancarios ni huella; registrarse en el censo es gratis. Cuénteme qué pasó: puede escribir o mandar una nota de voz.';

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

function mensajeDiagnostico(dx: Diagnostico, municipio: string): string[] {
  const mensajes: string[] = [];
  if (dx.posible_estafa) {
    mensajes.push(
      '⚠️ Cuidado: por lo que contó, quien tomó sus datos podría no ser funcionario. No pague ni entregue huella o datos bancarios; verifique en el punto oficial.',
    );
  }
  if (dx.compuerta === null) return mensajes;

  const ruta = getRuta(municipio);
  const paso = ruta?.pasos[dx.compuerta];
  mensajes.push(
    `Su caso parece estar en: ${COMPUERTA_LABEL[dx.compuerta]}. ${COMPUERTA_EXPLICACION[dx.compuerta]} ${dx.razon}`,
  );
  if (paso) {
    mensajes.push(
      `Qué hacer ahora: ${paso.accion}${paso.lugar ? ` Dónde: ${paso.lugar}.` : ''}${paso.nota ? ` ${paso.nota}` : ''}`,
    );
  } else {
    mensajes.push(
      'Confirme el siguiente paso con la Unidad de Gestión del Riesgo de su alcaldía. Aún no tenemos una ruta municipal verificada para su municipio.',
    );
  }
  for (const alerta of dx.alertas) {
    mensajes.push(
      `Riesgo de quedar por fuera: ${RIESGO_LABEL[alerta.riesgo]}. ${alerta.razon} Pida esto: ${alerta.accion}`,
    );
  }
  mensajes.push(
    'Puedo avisarle por este canal si cambia la atención en su barrio. Recuerde: Contados no es un canal oficial y no garantiza una ayuda.',
  );
  return mensajes;
}

export function crearConversador(
  clasificador: Clasificador = clasificarReal,
  ahora: () => number = Date.now,
) {
  const sesiones = new Map<string, Sesion>();
  const colas = new Map<string, Promise<void>>();

  function limpiarExpiradas() {
    const limite = ahora() - TTL_MS;
    for (const [id, sesion] of sesiones) {
      if (sesion.actualizadoEn < limite) sesiones.delete(id);
    }
  }

  async function conversarInterno(entrada: EntradaConversacion): Promise<SalidaConversacion> {
    limpiarExpiradas();
    const texto = entrada.texto.trim();
    let sesion = sesiones.get(entrada.sesionId);
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
      sesiones.set(entrada.sesionId, sesion);
      mensajes.push(SALUDO);
      sesion.estado = 'ESCUCHANDO';
      if (!texto || esSoloSaludo(texto)) return { estado: sesion.estado, mensajes };
    }

    sesion.actualizadoEn = ahora();
    sesion.municipio = entrada.municipio?.trim() || sesion.municipio;
    sesion.barrio = entrada.barrio?.trim() || sesion.barrio;
    sesion.destinatarioTemporal = entrada.destinatarioTemporal ?? sesion.destinatarioTemporal;
    mensajes.push(...sesion.pendientes.splice(0));

    if (!texto) return { estado: sesion.estado, mensajes };
    if (sesion.estado === 'SEGUIMIENTO') {
      sesion.relato = '';
      sesion.rondas = 0;
      sesion.preguntas = [];
      sesion.estado = 'ESCUCHANDO';
    }
    if (sesion.estado === 'PREGUNTANDO' && sesion.rondas >= 3) {
      sesion.estado = 'SEGUIMIENTO';
      mensajes.push(
        'Con lo que me contó no puedo ubicarlo con seguridad. Confirme su caso con la Unidad de Gestión del Riesgo de su alcaldía. No voy a inventar un paso.',
      );
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
      return { estado: sesion.estado, mensajes, diagnostico };
    }

    sesion.estado = 'SEGUIMIENTO';
    mensajes.push(...mensajeDiagnostico(diagnostico, sesion.municipio));
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

  function notificarBarrio(barrio: string, mensaje: string) {
    const destinatarios: { sesionId: string; destinatarioTemporal?: string }[] = [];
    for (const [sesionId, sesion] of sesiones) {
      if (sesion.estado === 'SEGUIMIENTO' && sesion.barrio.toLowerCase() === barrio.trim().toLowerCase()) {
        sesion.pendientes.push(mensaje);
        destinatarios.push({ sesionId, destinatarioTemporal: sesion.destinatarioTemporal });
      }
    }
    return destinatarios;
  }

  return { conversar, notificarBarrio };
}

export const conversador = crearConversador();
