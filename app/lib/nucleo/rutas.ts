import type { Compuerta } from './schema';

/**
 * Ruta municipal. Un municipio, un objeto.
 *
 * Esto es lo que un directorio estático no puede sostener: cada alcaldía
 * publica su propio punto y su propio criterio, y cambian a diario.
 * colombiatramita.co, el directorio más completo que existe, es un blog
 * de guías precisamente por esto.
 */
export interface PasoRuta {
  /** Qué hacer, en imperativo y en segunda persona. */
  accion: string;
  /** Dónde. Dirección real, no "la alcaldía". */
  lugar?: string;
  /** Qué llevar. Vacío es válido y es buena noticia. */
  llevar: string[];
  /** Advertencia si aplica. */
  nota?: string;
}

export interface RutaMunicipal {
  municipio: string;
  departamento: string;
  /** Fecha en que se verificó esta ruta. Se muestra en pantalla. */
  verificado: string;
  fuente: string;
  fuente_url: string;
  pasos: Record<Compuerta, PasoRuta>;
  /** Datos del subsidio, cuando el municipio ya lo activó. */
  subsidio?: {
    monto_mensual: number;
    familias_objetivo: number;
    administra: string;
    /** Cómo avisan. Este es el punto ciego del producto. */
    notificacion: string;
  };
  /** Canales de denuncia, cuando existen. */
  denuncias?: { motivo: string; canal: string }[];
}

export const MANIZALES: RutaMunicipal = {
  municipio: 'Manizales',
  departamento: 'Caldas',
  verificado: '2026-08-15',
  fuente: 'Alcaldía de Manizales y prensa local (La Patria, Eje21)',
  fuente_url:
    'https://www.eje21.com.co/2026/08/manizales-activa-subsidios-de-arriendo-para-damnificados/',
  pasos: {
    reporte: {
      accion:
        'Reporte el daño de su vivienda a Bomberos o a la Unidad de Gestión del Riesgo.',
      lugar: 'Comando de Bomberos de Fundadores — carpa de registro',
      llevar: [],
      nota: 'Reportar es gratis. Nadie puede cobrarle por hacerlo ni por acelerarlo.',
    },
    censo: {
      accion:
        'Pida que lo incluyan en el censo de damnificados y anote el nombre de quien lo atendió.',
      lugar: 'Comando de Bomberos de Fundadores — carpa de registro',
      llevar: ['Documento de identidad si lo conserva'],
      nota: 'Si no tiene documento, insista: la falta de documento no puede dejarlo por fuera del censo. Pida que lo dejen por escrito.',
    },
    evaluacion_tecnica: {
      accion:
        'Solicite la visita técnica a su vivienda y pida la constancia de la solicitud.',
      llevar: [],
      nota: 'Esta es la fila más larga. La Alcaldía pidió 500 ingenieros para más de 2.000 edificaciones. Sin esta visita no hay registro en el RUD ni subsidio.',
    },
    rud: {
      accion:
        'Confirme con la Unidad de Gestión del Riesgo que su hogar quedó inscrito en el RUD.',
      llevar: ['Documento de identidad', 'Constancia de la visita técnica'],
      nota: 'Solo el Consejo Municipal de Gestión del Riesgo puede inscribir en el RUD. Ninguna aplicación, incluida esta, puede hacerlo por usted.',
    },
    subsidio: {
      accion:
        'Esté pendiente del mensaje de texto al celular que registró, y confirme que el número registrado sea uno al que usted tenga acceso hoy.',
      llevar: ['Documento de identidad'],
      nota: 'Si perdió el celular o cambió de número, avise en el punto de atención. El aviso llega por SMS al número registrado: si ese número no funciona, no se entera.',
    },
  },
  subsidio: {
    monto_mensual: 300000,
    familias_objetivo: 1150,
    administra: 'Cruz Roja Colombiana, Seccional Caldas',
    notificacion:
      'Mensaje de texto al celular registrado, indicando el procedimiento y el lugar al que debe acudir.',
  },
  denuncias: [
    {
      motivo: 'Cobros abusivos o especulación con el arriendo',
      canal: 'Línea 606 893 1378 — Alcaldía de Manizales',
    },
  ],
};

export const RUTAS: Record<string, RutaMunicipal> = {
  manizales: MANIZALES,
};

export function getRuta(municipio: string): RutaMunicipal | null {
  return RUTAS[municipio.trim().toLowerCase()] ?? null;
}
