/**
 * Dónde vive el estado de cada conversación.
 *
 * Hasta ahora vivía en un `Map` dentro del proceso. En una máquina local eso
 * funciona porque hay un solo proceso; en Vercel cada mensaje puede caer en una
 * instancia distinta y recién arrancada, así que la sesión desaparecía entre un
 * mensaje y el siguiente: la persona mandaba un audio y Contados la volvía a
 * saludar como si no la conociera.
 *
 * La memoria sigue siendo la implementación por defecto —las pruebas y el
 * simulador local no necesitan nada más— y en producción se usa Redis cuando
 * hay credenciales. Se habla con Upstash por su API REST con `fetch`, sin
 * agregar dependencias: es una petición HTTP por operación, que es justo lo que
 * conviene en funciones serverless.
 */

export interface SesionGuardada {
  estado: string;
  relato: string;
  rondas: number;
  preguntas: string[];
  municipio: string;
  barrio: string;
  actualizadoEn: number;
  destinatarioTemporal?: string;
  pendientes: string[];
}

export interface AlmacenSesiones {
  leer(id: string): Promise<SesionGuardada | undefined>;
  escribir(id: string, sesion: SesionGuardada, ttlMs: number): Promise<void>;
  borrar(id: string): Promise<void>;
  /** Sesiones de un barrio que pueden recibir un aviso. */
  porBarrio(barrio: string): Promise<{ id: string; sesion: SesionGuardada }[]>;
}

function claveBarrio(barrio: string) {
  return `barrio:${barrio.trim().toLowerCase()}`;
}

/** Implementación en memoria. Suficiente para pruebas y para un solo proceso. */
export function almacenEnMemoria(): AlmacenSesiones {
  const sesiones = new Map<string, SesionGuardada>();

  return {
    async leer(id) {
      return sesiones.get(id);
    },
    async escribir(id, sesion) {
      sesiones.set(id, sesion);
    },
    async borrar(id) {
      sesiones.delete(id);
    },
    async porBarrio(barrio) {
      const objetivo = barrio.trim().toLowerCase();
      const encontradas: { id: string; sesion: SesionGuardada }[] = [];
      for (const [id, sesion] of sesiones) {
        if (sesion.barrio.trim().toLowerCase() === objetivo) encontradas.push({ id, sesion });
      }
      return encontradas;
    },
  };
}

interface CredencialesRedis {
  url: string;
  token: string;
}

function credencialesRedis(): CredencialesRedis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

/**
 * Almacén sobre Upstash Redis por REST.
 *
 * El índice por barrio existe porque el tablero necesita encontrar a quién
 * avisar, y en Redis no se puede recorrer las sesiones como se recorría el
 * `Map`. Se mantiene un conjunto por barrio con los identificadores; las
 * entradas que ya expiraron se limpian al leerlas, que es cuando importa.
 */
export function almacenRedis({ url, token }: CredencialesRedis): AlmacenSesiones {
  async function comando(partes: (string | number)[]): Promise<unknown> {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(partes.map(String)),
      cache: 'no-store',
    });
    if (!respuesta.ok) throw new Error(`Redis respondió ${respuesta.status}.`);
    const datos = (await respuesta.json()) as { result?: unknown; error?: string };
    if (datos.error) throw new Error(`Redis: ${datos.error}`);
    return datos.result;
  }

  return {
    async leer(id) {
      const crudo = (await comando(['GET', `sesion:${id}`])) as string | null;
      if (!crudo) return undefined;
      try {
        return JSON.parse(crudo) as SesionGuardada;
      } catch {
        // Un valor corrupto no puede tumbar la conversación: se trata como
        // sesión inexistente y el siguiente mensaje la reconstruye.
        return undefined;
      }
    },

    async escribir(id, sesion, ttlMs) {
      const segundos = Math.max(60, Math.round(ttlMs / 1000));
      await comando(['SET', `sesion:${id}`, JSON.stringify(sesion), 'EX', segundos]);
      if (sesion.barrio.trim()) {
        await comando(['SADD', claveBarrio(sesion.barrio), id]);
        await comando(['EXPIRE', claveBarrio(sesion.barrio), segundos]);
      }
    },

    async borrar(id) {
      await comando(['DEL', `sesion:${id}`]);
    },

    async porBarrio(barrio) {
      const ids = ((await comando(['SMEMBERS', claveBarrio(barrio)])) as string[]) ?? [];
      const encontradas: { id: string; sesion: SesionGuardada }[] = [];
      for (const id of ids) {
        const crudo = (await comando(['GET', `sesion:${id}`])) as string | null;
        if (!crudo) {
          await comando(['SREM', claveBarrio(barrio), id]);
          continue;
        }
        try {
          encontradas.push({ id, sesion: JSON.parse(crudo) as SesionGuardada });
        } catch {
          await comando(['SREM', claveBarrio(barrio), id]);
        }
      }
      return encontradas;
    },
  };
}

/** Redis si hay credenciales; memoria si no. Nunca falla por configuración. */
export function almacenPorDefecto(): AlmacenSesiones {
  const credenciales = credencialesRedis();
  return credenciales ? almacenRedis(credenciales) : almacenEnMemoria();
}

export function usaRedis() {
  return credencialesRedis() !== null;
}
