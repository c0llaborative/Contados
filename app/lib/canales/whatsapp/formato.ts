/**
 * Legal design para WhatsApp.
 *
 * El simulador reconoce cada mensaje por su prefijo —que el núcleo genera de
 * forma determinista— y lo maqueta con jerarquía: una etiqueta, un titular, un
 * riel de cinco pasos, un pin de dirección. En WhatsApp real todo eso se
 * aplanaba a párrafos corridos, porque el adaptador mandaba el string tal cual.
 * La persona que más necesita el producto es justamente la que recibe la
 * versión sin jerarquía.
 *
 * Aquí se hace lo mismo que hace el simulador, con lo que WhatsApp sí tiene:
 * negrita, cursiva, saltos de línea y unos pocos emoji que funcionan como
 * iconos. **No se reescribe ni se resume nada**: se separan las partes que el
 * núcleo ya distingue y se les da aire. Si un prefijo no coincide, el mensaje
 * sale tal cual y no se pierde nada.
 *
 * El núcleo no se entera. Es la misma regla que ya rige el resto: un núcleo,
 * y cada superficie presenta a su manera.
 */
import {
  COMPUERTAS,
  COMPUERTA_EXPLICACION,
  COMPUERTA_LABEL,
  PREFIJO_AVISO_BARRIO,
  type Compuerta,
} from '../../nucleo/schema';
import { SALUDO, SIN_UBICACION } from '../../nucleo/conversacion';

const PREFIJO_PASO = 'Su caso parece estar en: ';
const PREFIJO_SIGUE = 'Sigue en: ';
const PREFIJO_ACCION = 'Qué hacer ahora: ';
const PREFIJO_RIESGO = 'Riesgo de quedar por fuera: ';
const PREFIJO_PETICION = 'Borrador de derecho de petición';
const CIERRE_AVISO = 'Puedo avisarle por este canal';

/**
 * Riel de progreso en texto. Los círculos de color son emoji estándar, así que
 * se ven igual en cualquier teléfono; los caracteres de bloque no.
 */
function riel(indice: number) {
  return COMPUERTAS.map((_, i) => (i <= indice ? '🟢' : '⚪')).join('');
}

function ubicarCompuerta(resto: string): { compuerta: Compuerta; detalle: string } | null {
  const compuerta = COMPUERTAS.find((c) => resto.startsWith(`${COMPUERTA_LABEL[c]}.`));
  if (!compuerta) return null;
  return { compuerta, detalle: resto.slice(COMPUERTA_LABEL[compuerta].length + 1).trim() };
}

function tarjetaPaso(resto: string, titulo: string) {
  const ubicado = ubicarCompuerta(resto);
  if (!ubicado) return null;
  const indice = COMPUERTAS.indexOf(ubicado.compuerta);
  const encabezado = `*${titulo}: ${COMPUERTA_LABEL[ubicado.compuerta]}*\n${riel(indice)} paso ${indice + 1} de ${COMPUERTAS.length}`;
  if (!ubicado.detalle) return encabezado;

  // El núcleo pega la explicación del paso y la razón del caso en un solo
  // párrafo. Son dos cosas distintas —qué es este paso, y por qué usted está
  // aquí— y juntas forman el bloque más denso de la conversación. La
  // explicación es texto fijo, así que se puede separar sin adivinar.
  const explicacion = COMPUERTA_EXPLICACION[ubicado.compuerta];
  if (ubicado.detalle.startsWith(explicacion)) {
    const razon = ubicado.detalle.slice(explicacion.length).trim();
    if (razon) return `${encabezado}\n\n${explicacion}\n\n_${razon}_`;
  }
  return `${encabezado}\n\n${ubicado.detalle}`;
}

function tarjetaAccion(cuerpo: string) {
  const corte = cuerpo.indexOf(' Dónde: ');
  const accion = corte === -1 ? cuerpo : cuerpo.slice(0, corte);
  const resto = corte === -1 ? '' : cuerpo.slice(corte + ' Dónde: '.length);
  // Tras el lugar puede venir una nota; el núcleo la separa con un punto.
  const finLugar = resto.indexOf('. ');
  const lugar = finLugar === -1 ? resto : resto.slice(0, finLugar + 1);
  const nota = finLugar === -1 ? '' : resto.slice(finLugar + 2).trim();

  let mensaje = `*✅ Qué hacer ahora*\n${accion.trim()}`;
  if (lugar.trim()) mensaje += `\n\n📍 ${lugar.trim()}`;
  if (nota) mensaje += `\n_${nota}_`;
  return mensaje;
}

function tarjetaRiesgo(cuerpo: string) {
  const corte = cuerpo.indexOf(' Pida esto: ');
  const encabezado = corte === -1 ? cuerpo : cuerpo.slice(0, corte);
  const accion = corte === -1 ? '' : cuerpo.slice(corte + ' Pida esto: '.length).trim();
  const punto = encabezado.indexOf('. ');
  const titulo = punto === -1 ? encabezado : encabezado.slice(0, punto);
  const razon = punto === -1 ? '' : encabezado.slice(punto + 2).trim();

  let mensaje = `*⚠️ Riesgo de quedar por fuera*\n${titulo.replace(/\.$/, '')}`;
  if (razon) mensaje += `\n${razon}`;
  if (accion) mensaje += `\n\n👉 *Pida esto:* ${accion}`;
  return mensaje;
}

function tarjetaEstafa(texto: string) {
  const corte = texto.indexOf(': ');
  if (corte === -1) return texto;
  const cuerpo = texto.slice(corte + 2);
  return `*⚠️ Cuidado*\n${cuerpo.charAt(0).toUpperCase()}${cuerpo.slice(1)}`;
}

function tarjetaPeticion(texto: string) {
  const url = texto.match(/https?:\/\/\S+/)?.[0];
  if (!url) return texto;
  return [
    '*📄 Borrador de derecho de petición*',
    'Listo con los hechos que usted contó. Ábralo, revíselo y radíquelo.',
    '',
    url,
    '',
    '_Enlace privado, válido 15 minutos. Contados no lo radica por usted._',
  ].join('\n');
}

function tarjetaSaludo() {
  return [
    'Soy *Contados*. Le ayudo a entender en qué paso de la ruta de atención va y qué puede hacer.',
    '',
    '⚠️ Esto *no* lo registra ante ninguna entidad.',
    '🔒 Nunca le pediremos cédula, datos bancarios ni huella. Registrarse en el censo es *gratis*.',
    '',
    'Cuénteme qué pasó: puede escribir o mandar una nota de voz.',
  ].join('\n');
}

/**
 * Aviso que manda un coordinador a un barrio. Llega sin que la persona haya
 * preguntado nada, así que lo primero tiene que ser de dónde viene.
 */
function tarjetaAvisoBarrio(cuerpo: string) {
  return `*📣 Aviso de su barrio*\n${cuerpo.trim()}`;
}

/**
 * La abstención. Son tres frases con tres funciones distintas —qué pasa, qué
 * hacer, y la promesa de no inventar— y corridas se leen como una disculpa.
 * Separadas, la última queda donde se ve.
 */
function tarjetaSinUbicacion() {
  const [titular, accion, promesa] = SIN_UBICACION.split('. ');
  return `*${titular}*\n${accion}.\n\n_${promesa}_`;
}

function tarjetaCierre(texto: string) {
  const corte = texto.indexOf('Recuerde: ');
  if (corte === -1) return texto;
  return `${texto.slice(0, corte).trim()}\n\n_${texto.slice(corte + 'Recuerde: '.length).trim()}_`;
}

/**
 * Maqueta un mensaje del núcleo para WhatsApp. Devuelve el texto sin tocar
 * cuando no reconoce el prefijo — el caso de las preguntas de abstención, que
 * ya son una sola línea corta y no ganan nada con jerarquía.
 */
export function formatearParaWhatsApp(texto: string): string {
  if (texto === SALUDO) return tarjetaSaludo();
  if (texto === SIN_UBICACION) return tarjetaSinUbicacion();
  if (texto.startsWith(PREFIJO_AVISO_BARRIO)) {
    return tarjetaAvisoBarrio(texto.slice(PREFIJO_AVISO_BARRIO.length));
  }
  if (texto.startsWith(PREFIJO_PASO)) {
    return tarjetaPaso(texto.slice(PREFIJO_PASO.length), 'Su caso va aquí') ?? texto;
  }
  if (texto.startsWith(PREFIJO_SIGUE)) {
    return tarjetaPaso(texto.slice(PREFIJO_SIGUE.length), 'Sigue en el mismo paso') ?? texto;
  }
  if (texto.startsWith(PREFIJO_ACCION)) return tarjetaAccion(texto.slice(PREFIJO_ACCION.length));
  if (texto.startsWith(PREFIJO_RIESGO)) return tarjetaRiesgo(texto.slice(PREFIJO_RIESGO.length));
  if (texto.startsWith('⚠️')) return tarjetaEstafa(texto);
  if (texto.startsWith(PREFIJO_PETICION)) return tarjetaPeticion(texto);
  if (texto.startsWith(CIERRE_AVISO)) return tarjetaCierre(texto);
  return texto;
}
