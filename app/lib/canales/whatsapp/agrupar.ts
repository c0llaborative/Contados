export interface EntradaAgrupable<T> {
  clave: string;
  id: string;
  valor: T;
}

export type ResultadoAgrupado = 'procesado' | 'duplicado';

interface Lote<T> {
  entradas: EntradaAgrupable<T>[];
  timer: ReturnType<typeof setTimeout>;
  promesa: Promise<void>;
  resolver: () => void;
  rechazar: (error: unknown) => void;
}

interface OpcionesAgrupador {
  esperaMs?: number;
  maximoPorLote?: number;
  ttlDuplicadoMs?: number;
  ahora?: () => number;
}

/**
 * Agrupa entradas por una clave de sesión después de una ventana de silencio.
 * Los identificadores sólo quedan deduplicados si el procesamiento termina bien;
 * ante un fallo se liberan para permitir un reintento seguro.
 */
export function crearAgrupador<T>(
  procesar: (entradas: EntradaAgrupable<T>[]) => Promise<void>,
  opciones: OpcionesAgrupador = {},
) {
  const esperaMs = opciones.esperaMs ?? 12_000;
  const maximoPorLote = opciones.maximoPorLote ?? 8;
  const ttlDuplicadoMs = opciones.ttlDuplicadoMs ?? 60 * 60 * 1000;
  const ahora = opciones.ahora ?? Date.now;
  const lotes = new Map<string, Lote<T>>();
  const identificadores = new Map<string, number>();

  function limpiarDuplicados() {
    const limite = ahora() - ttlDuplicadoMs;
    for (const [id, fecha] of identificadores) {
      if (fecha < limite) identificadores.delete(id);
    }
  }

  function programar(clave: string, lote: Lote<T>) {
    clearTimeout(lote.timer);
    lote.timer = setTimeout(async () => {
      if (lotes.get(clave) !== lote) return;
      lotes.delete(clave);
      try {
        await procesar(lote.entradas);
        lote.resolver();
      } catch (error) {
        for (const entrada of lote.entradas) identificadores.delete(entrada.id);
        lote.rechazar(error);
      }
    }, esperaMs);
  }

  function recibir(entrada: EntradaAgrupable<T>): Promise<ResultadoAgrupado> {
    limpiarDuplicados();
    if (identificadores.has(entrada.id)) return Promise.resolve('duplicado');

    let lote = lotes.get(entrada.clave);
    if (!lote) {
      let resolver!: () => void;
      let rechazar!: (error: unknown) => void;
      const promesa = new Promise<void>((resolve, reject) => {
        resolver = resolve;
        rechazar = reject;
      });
      lote = {
        entradas: [],
        timer: setTimeout(() => undefined, 0),
        promesa,
        resolver,
        rechazar,
      };
      clearTimeout(lote.timer);
      lotes.set(entrada.clave, lote);
    }

    if (lote.entradas.length >= maximoPorLote) {
      return Promise.reject(new Error(`Máximo ${maximoPorLote} mensajes por lote.`));
    }
    identificadores.set(entrada.id, ahora());
    lote.entradas.push(entrada);
    programar(entrada.clave, lote);
    return lote.promesa.then(() => 'procesado');
  }

  return { recibir };
}

export function debounceWhatsAppMs(valor = process.env.WHATSAPP_DEBOUNCE_MS) {
  const solicitado = Number(valor ?? 12_000);
  if (!Number.isFinite(solicitado)) return 12_000;
  return Math.min(15_000, Math.max(10_000, Math.round(solicitado)));
}
