/**
 * Modelo de caso — Contados
 *
 * Basado en el ciclo de vida de Primero / CPIMS+ (UNICEF, open source, 40 países):
 *   identification -> registration -> assessment -> referral -> service_tracking -> closure
 *
 * Mapeado 1:1 a la ruta oficial colombiana de atención a damnificados:
 *   Reporte -> Censo -> Evaluación técnica -> Registro en RUD -> Subsidio
 *
 * Fuente de la ruta: UNGRD (solo el CMGRD digita el RUD) y guías municipales.
 * Ver docs/PLAN.md para la evidencia.
 */

/** Las cuatro compuertas más el estado terminal. El orden importa: es una fila. */
export const COMPUERTAS = [
  'reporte',
  'censo',
  'evaluacion_tecnica',
  'rud',
  'subsidio',
] as const;

export type Compuerta = (typeof COMPUERTAS)[number];

/** Etiquetas en lenguaje llano. Nunca mostrar el identificador técnico al usuario. */
export const COMPUERTA_LABEL: Record<Compuerta, string> = {
  reporte: 'Reportar el daño',
  censo: 'Que lo censen',
  evaluacion_tecnica: 'Evaluación técnica de la vivienda',
  rud: 'Registro en el RUD',
  subsidio: 'Recibir el subsidio',
};

/**
 * Qué significa cada compuerta, dicho como se lo diría a la persona.
 * "Reportar no significa estar censado" — El País, guía para familias en Cali.
 */
export const COMPUERTA_EXPLICACION: Record<Compuerta, string> = {
  reporte:
    'Usted avisó que su vivienda resultó afectada. Reportar no es lo mismo que estar censado: es apenas el primer paso.',
  censo:
    'Un funcionario tomó sus datos. Todavía falta que un técnico revise la vivienda; sin esa visita no hay registro en el RUD.',
  evaluacion_tecnica:
    'Un técnico debe visitar su vivienda y dejar constancia del daño. Esta es la fila más larga: hay muchas más viviendas que ingenieros.',
  rud: 'Su hogar quedó inscrito en el Registro Único de Damnificados. El RUD es el requisito para las ayudas, pero no las garantiza por sí solo.',
  subsidio:
    'Su hogar figura entre los beneficiarios. El aviso suele llegar por mensaje de texto al celular registrado.',
};

/**
 * Riesgos de exclusión documentados en la literatura post-desastre.
 * México 2017: el censo inicial de CDMX registró ~7.000 inmuebles; el rediagnóstico
 * de 2019 encontró +22.000 viviendas con daño severo que habían quedado fuera.
 * Houston post-Harvey y Puerto Rico post-María: tenencia informal sin título.
 * World Disasters Report: "out of sight, out of reach, out of the loop".
 */
export const RIESGOS_EXCLUSION = [
  'arrendatario',
  'sin_titulo',
  'titular_ausente',
  'sin_documentos',
  'ausente_en_visita',
  'zona_sin_cobertura',
] as const;

export type RiesgoExclusion = (typeof RIESGOS_EXCLUSION)[number];

export const RIESGO_LABEL: Record<RiesgoExclusion, string> = {
  arrendatario: 'Usted paga arriendo',
  sin_titulo: 'La vivienda no tiene escritura a su nombre',
  titular_ausente: 'La vivienda está a nombre de otra persona',
  sin_documentos: 'Perdió sus documentos',
  ausente_en_visita: 'No estaba cuando pasaron tomando datos',
  zona_sin_cobertura: 'Su zona todavía no ha sido visitada',
};

/** Un hecho que la persona relató, con la frase textual que lo sustenta. */
export interface Hecho {
  /** Lo que el sistema entendió, en tercera persona. */
  afirmacion: string;
  /** La frase textual del relato que lo sustenta. Sin esto no hay hecho. */
  evidencia: string;
}

/** Alerta de riesgo de exclusión, con su razón y la acción concreta. */
export interface AlertaExclusion {
  riesgo: RiesgoExclusion;
  /** Por qué esto puede dejarlo por fuera, en lenguaje llano. */
  razon: string;
  /** Qué debe hacer o pedir. Concreto, no genérico. */
  accion: string;
}

/**
 * Salida del clasificador. Se valida contra JSON Schema con
 * additionalProperties:false — el modelo no puede inventar campos.
 */
export interface Diagnostico {
  /**
   * La compuerta donde está trabada la persona, o null si el relato
   * no alcanza para determinarlo. Abstención obligatoria: null es
   * una respuesta válida y esperada, nunca un error.
   */
  compuerta: Compuerta | null;
  /** Por qué se ubicó ahí. Debe citar lo que la persona dijo. */
  razon: string;
  /** Hechos atómicos extraídos del relato, cada uno con su evidencia textual. */
  hechos: Hecho[];
  /** Riesgos de exclusión detectados. Vacío es válido. */
  alertas: AlertaExclusion[];
  /**
   * Qué falta preguntar para poder determinar la compuerta.
   * Obligatorio cuando compuerta es null.
   */
  falta_preguntar: string[];
  /**
   * Señal de posible estafa: alguien que se hizo pasar por funcionario.
   * La Alcaldía de Cali tuvo que desmentir a personas pidiendo datos,
   * fotos y huellas puerta a puerta.
   */
  posible_estafa: boolean;
}

/**
 * JSON Schema para output_config.format. Estricto: additionalProperties:false
 * en todos los objetos y required completo, según exige la API.
 */
export const DIAGNOSTICO_SCHEMA = {
  type: 'object',
  properties: {
    compuerta: {
      type: ['string', 'null'],
      enum: [...COMPUERTAS, null],
      description:
        'La compuerta donde está trabada la persona. null si el relato no alcanza para determinarlo.',
    },
    razon: {
      type: 'string',
      description:
        'Por qué se ubicó ahí, citando lo que la persona dijo. Una o dos frases, en segunda persona.',
    },
    hechos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          afirmacion: { type: 'string' },
          evidencia: {
            type: 'string',
            description: 'Frase textual del relato que sustenta la afirmación.',
          },
        },
        required: ['afirmacion', 'evidencia'],
        additionalProperties: false,
      },
    },
    alertas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          riesgo: { type: 'string', enum: [...RIESGOS_EXCLUSION] },
          razon: { type: 'string' },
          accion: { type: 'string' },
        },
        required: ['riesgo', 'razon', 'accion'],
        additionalProperties: false,
      },
    },
    falta_preguntar: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Preguntas concretas que faltan. Obligatorio y no vacío cuando compuerta es null.',
    },
    posible_estafa: {
      type: 'boolean',
      description:
        'true si el relato sugiere que quien tomó los datos podría no ser un funcionario real.',
    },
  },
  required: [
    'compuerta',
    'razon',
    'hechos',
    'alertas',
    'falta_preguntar',
    'posible_estafa',
  ],
  additionalProperties: false,
} as const;

/**
 * Un caso guardado. `Case` en el modelo de Primero.
 * El agregado se construye sobre esto, siempre rotulado como autorreportado.
 */
export interface Caso {
  id: string;
  creado_en: string;
  municipio: string;
  barrio: string;
  relato: string;
  diagnostico: Diagnostico;
}
