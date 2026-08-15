import type { Compuerta, RiesgoExclusion } from './schema';

/**
 * Casos sintéticos para el tablero.
 *
 * Ninguna persona real. Ningún dato real. Se generan de forma determinista
 * para que la demo sea reproducible: la misma semilla produce el mismo tablero.
 *
 * La forma de la distribución no es arbitraria: refleja lo que está documentado
 * — la evaluación técnica es el cuello de botella (500 ingenieros solicitados
 * para más de 2.000 edificaciones), así que ahí se acumula la gente.
 */

export interface CasoAgregado {
  barrio: string;
  compuerta: Compuerta;
  riesgos: RiesgoExclusion[];
  dias_esperando: number;
}

const BARRIOS = [
  'San José',
  'Galán',
  'La Sultana',
  'Bosques del Norte',
  'Solferino',
  'Fundadores',
  'La Enea',
  'Villahermosa',
];

/** Peso de cada compuerta. La evaluación técnica se lleva la mitad. */
const DISTRIBUCION: [Compuerta, number][] = [
  ['reporte', 12],
  ['censo', 21],
  ['evaluacion_tecnica', 47],
  ['rud', 14],
  ['subsidio', 6],
];

const RIESGOS_POSIBLES: RiesgoExclusion[] = [
  'arrendatario',
  'sin_titulo',
  'titular_ausente',
  'sin_documentos',
  'ausente_en_visita',
];

/** PRNG determinista (mulberry32). Misma semilla, mismo tablero. */
function rng(semilla: number) {
  return () => {
    semilla |= 0;
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function elegirCompuerta(r: number): Compuerta {
  const total = DISTRIBUCION.reduce((s, [, w]) => s + w, 0);
  let acc = 0;
  const objetivo = r * total;
  for (const [c, w] of DISTRIBUCION) {
    acc += w;
    if (objetivo < acc) return c;
  }
  return 'evaluacion_tecnica';
}

export function generarCasos(n = 54, semilla = 20260815): CasoAgregado[] {
  const rand = rng(semilla);
  const casos: CasoAgregado[] = [];

  for (let i = 0; i < n; i++) {
    const compuerta = elegirCompuerta(rand());
    const riesgos: RiesgoExclusion[] = [];

    // Los arrendatarios son el riesgo más frecuente y el peor atendido.
    if (rand() < 0.34) riesgos.push('arrendatario');
    if (rand() < 0.16) {
      const otro = RIESGOS_POSIBLES[Math.floor(rand() * RIESGOS_POSIBLES.length)];
      if (!riesgos.includes(otro)) riesgos.push(otro);
    }

    casos.push({
      barrio: BARRIOS[Math.floor(rand() * BARRIOS.length)],
      compuerta,
      riesgos,
      dias_esperando: 1 + Math.floor(rand() * 5),
    });
  }

  return casos;
}
