import {
  COMPUERTAS,
  COMPUERTA_EXPLICACION,
  COMPUERTA_LABEL,
  type Compuerta,
} from '@/lib/schema';

/**
 * La fila, vertical. Cinco compuertas que hay que subir.
 *
 * Deliberadamente no es un stepper horizontal: en un celular los steppers
 * horizontales aplastan las etiquetas hasta volverlas ilegibles, y esta
 * pantalla se lee de pie y con prisa.
 */
export function Compuertas({ actual }: { actual: Compuerta }) {
  const indiceActual = COMPUERTAS.indexOf(actual);

  return (
    <ol className="relative">
      {COMPUERTAS.map((c, i) => {
        const hecho = i < indiceActual;
        const aqui = i === indiceActual;
        const ultimo = i === COMPUERTAS.length - 1;

        return (
          <li
            key={c}
            className="lift relative grid grid-cols-[3.25rem_1fr] gap-x-4"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {/* Riel vertical entre marcadores */}
            {!ultimo && (
              <span
                aria-hidden
                className="absolute left-[1.625rem] top-11 -ml-px h-[calc(100%-2.75rem)] w-0.5"
                style={{
                  background: hecho ? 'var(--done)' : 'var(--rule)',
                }}
              />
            )}

            {/* Marcador numerado */}
            <span
              className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-display text-lg ${
                aqui ? 'here' : ''
              }`}
              style={
                hecho
                  ? {
                      background: 'var(--done)',
                      borderColor: 'var(--done)',
                      color: 'var(--paper-raised)',
                    }
                  : aqui
                    ? {
                        background: 'var(--signal)',
                        borderColor: 'var(--signal)',
                        color: 'var(--paper-raised)',
                      }
                    : {
                        background: 'var(--paper-raised)',
                        borderColor: 'var(--rule)',
                        color: 'var(--ink-faint)',
                      }
              }
            >
              {hecho ? (
                <svg
                  viewBox="0 0 20 20"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 10.5 8 14.5 16 6" />
                </svg>
              ) : (
                i + 1
              )}
              <span className="sr-only">
                {hecho ? 'Paso completado' : aqui ? 'Usted está aquí' : 'Paso pendiente'}
              </span>
            </span>

            {/* Contenido */}
            <div className={ultimo ? 'pb-1' : 'pb-8'}>
              {aqui && (
                <p className="folio mb-1" style={{ color: 'var(--signal)' }}>
                  Usted está aquí
                </p>
              )}
              <h3
                className="display text-xl"
                style={{
                  color: aqui ? 'var(--ink)' : hecho ? 'var(--ink-soft)' : 'var(--ink-faint)',
                }}
              >
                {COMPUERTA_LABEL[c]}
              </h3>
              {aqui && (
                <p
                  className="mt-2 text-[1.0625rem] leading-relaxed"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  {COMPUERTA_EXPLICACION[c]}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
