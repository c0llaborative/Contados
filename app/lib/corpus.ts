import { createHash } from 'crypto';

/**
 * Corpus normativo congelado (allowlist).
 *
 * Regla innegociable: ninguna cita se genera con el modelo. El renderizador
 * toma el texto, el artículo y la URL desde estos metadatos. Si un fragmento
 * no está aquí, el instrumento se bloquea.
 */
export interface Fragmento {
  id: string;
  norma: string;
  articulo: string;
  entidad: string;
  url: string;
  consultado: string;
  texto: string;
  /** SHA-256 del texto, calculado al cargar el módulo. */
  hash: string;
}

function congelar(f: Omit<Fragmento, 'hash'>): Fragmento {
  return {
    ...f,
    hash: createHash('sha256').update(f.texto, 'utf8').digest('hex'),
  };
}

export const CORPUS: Record<string, Fragmento> = {
  'ley1755-art14': congelar({
    id: 'ley1755-art14',
    norma: 'Ley 1755 de 2015',
    articulo: 'Artículo 14',
    entidad: 'Congreso de la República',
    url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?id=30019904',
    consultado: '2026-08-15',
    texto:
      'Salvo norma legal especial y so pena de sanción disciplinaria, toda petición deberá resolverse dentro de los quince (15) días siguientes a su recepción.',
  }),
  'ley1755-art13': congelar({
    id: 'ley1755-art13',
    norma: 'Ley 1755 de 2015',
    articulo: 'Artículo 13',
    entidad: 'Congreso de la República',
    url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?id=30019904',
    consultado: '2026-08-15',
    texto:
      'Toda persona tiene derecho a presentar peticiones respetuosas a las autoridades, en los términos señalados en este código, por motivos de interés general o particular, y a obtener pronta resolución completa y de fondo sobre la misma.',
  }),
  'ley1523-art4': congelar({
    id: 'ley1523-art4',
    norma: 'Ley 1523 de 2012',
    articulo: 'Artículo 4, numeral 8',
    entidad: 'Congreso de la República',
    url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=47141',
    consultado: '2026-08-15',
    texto:
      'Calamidad pública: es el resultado que se desencadena de la manifestación de uno o varios eventos naturales o antropogénicos no intencionales que al encontrar condiciones propicias de vulnerabilidad en las personas, los bienes, la infraestructura, los medios de subsistencia, la prestación de servicios o los recursos ambientales, causa daños o pérdidas humanas, materiales, económicas o ambientales.',
  }),
};

/**
 * El plazo del derecho de petición es el ÚNICO reloj que existe en esta ruta.
 *
 * Verificado: la Ley 1523 de 2012 no fija plazo en días para completar el censo,
 * hacer la evaluación técnica ni entregar la ayuda humanitaria. Solo fija
 * principios. Por eso el producto nunca dice "se venció el término del censo":
 * sería falso. Lo que sí tiene reloj es la petición que radique la persona.
 */
export const PLAZO_PETICION_DIAS_HABILES = 15;
export const PLAZO_INFORMACION_DIAS_HABILES = 10;

/** Días hábiles hacia adelante, sin contar sábados ni domingos. */
export function sumarDiasHabiles(desde: Date, dias: number): Date {
  const d = new Date(desde);
  let restantes = dias;
  while (restantes > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) restantes--;
  }
  return d;
}
