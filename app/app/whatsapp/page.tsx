'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import { COMPUERTAS, COMPUERTA_LABEL } from '@/lib/schema';

type Chat = {
  de: 'persona' | 'contados';
  texto: string;
  /** Porción ya revelada. Igual a `texto` cuando terminó de aparecer. */
  mostrado: string;
  hora: string;
  /** Si el mensaje se mandó como nota de voz, la URL del audio reproducible. */
  audio?: string;
};

/**
 * Notas de voz de la demostración. Se resuelven al cargar la página probando
 * varias extensiones, así el equipo puede dejar el archivo en el formato que
 * tenga sin tocar el código. Si no hay ninguna, la sección no aparece: la demo
 * escrita sigue funcionando igual.
 */
const NOTAS_DEMO = [
  { id: 'nota-1', etiqueta: 'Nota de voz 1' },
  { id: 'nota-2', etiqueta: 'Nota de voz 2' },
];
const EXTENSIONES = ['ogg', 'opus', 'm4a', 'mp3', 'wav', 'webm'];

function segundosBonitos(total: number) {
  if (!Number.isFinite(total) || total <= 0) return '0:00';
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Reproductor con el aspecto del de WhatsApp. Las barras de la onda son
 * decorativas y deterministas —no se analiza el audio— pero el avance sí
 * corresponde a la reproducción real.
 */
function NotaDeVoz({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [sonando, setSonando] = useState(false);
  const [avance, setAvance] = useState(0);
  const [duracion, setDuracion] = useState(0);

  const barras = 34;
  const alturas = Array.from({ length: barras }, (_, i) => {
    // Patrón fijo: se ve como voz sin depender de analizar la señal.
    const onda = Math.sin(i * 1.7) * Math.cos(i * 0.6) * 0.5 + 0.5;
    return 28 + onda * 62;
  });

  function alternar() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }

  return (
    <div className="wa-nota">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setSonando(true)}
        onPause={() => setSonando(false)}
        onEnded={() => {
          setSonando(false);
          setAvance(0);
        }}
        onLoadedMetadata={(e) => setDuracion(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setAvance(el.duration > 0 ? el.currentTime / el.duration : 0);
        }}
      />
      <button
        type="button"
        className="wa-play"
        data-sonando={sonando}
        onClick={alternar}
        aria-label={sonando ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
      >
        {sonando ? '❚❚' : '▶'}
      </button>
      <div className="wa-onda" aria-hidden="true">
        {alturas.map((altura, i) => (
          <span
            key={i}
            data-oido={i / barras <= avance}
            style={{ height: `${altura}%` }}
          />
        ))}
      </div>
      <span className="wa-duracion">
        {segundosBonitos(sonando || avance > 0 ? duracion * (1 - avance) : duracion)}
      </span>
    </div>
  );
}

/** Duración objetivo de la aparición de un mensaje, en milisegundos. */
const REVELADO_MS = 900;
const FOTOGRAMA_MS = 16;

function horaCorta() {
  return new Date().toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function pausa(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Convierte las URLs del mensaje en enlaces reales sin usar HTML crudo.
 * Construir nodos de React en vez de inyectar HTML evita cualquier riesgo
 * de que el texto de una persona se ejecute como marcado.
 */
function conEnlaces(texto: string) {
  return texto.split(/(https?:\/\/\S+)/g).map((parte, i) =>
    /^https?:\/\//.test(parte) ? (
      <a
        key={i}
        href={parte}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-enlace"
      >
        {parte}
      </a>
    ) : (
      parte
    ),
  );
}

/**
 * El mensaje del borrador trae un token cifrado de cientos de caracteres.
 * Se detecta aquí para presentarlo como tarjeta en vez de como URL cruda;
 * si el formato cambiara, el mensaje simplemente vuelve a mostrarse como
 * texto con su enlace, sin romperse.
 */
function comoPeticion(texto: string) {
  if (!texto.startsWith('Borrador de derecho de petición')) return null;
  const url = texto.match(/https?:\/\/\S+/)?.[0];
  if (!url) return null;
  return { url, cierre: texto.slice(texto.indexOf(url) + url.length).trim() };
}

/** Los mensajes con estructura se muestran completos; el resto se escribe. */
function esEstructurado(texto: string) {
  return (
    comoPeticion(texto) !== null ||
    texto.startsWith('Su caso parece estar en: ') ||
    texto.startsWith('Qué hacer ahora: ') ||
    texto.startsWith('Riesgo de quedar por fuera: ') ||
    texto.startsWith('⚠️')
  );
}

function Contenido({ texto, mostrado }: { texto: string; mostrado: string }) {
  const peticion = comoPeticion(texto);
  if (peticion) return <TarjetaPeticion url={peticion.url} cierre={peticion.cierre} />;
  if (texto.startsWith('Su caso parece estar en: ')) return <TarjetaPaso texto={texto} />;
  if (texto.startsWith('Qué hacer ahora: ')) return <TarjetaAccion texto={texto} />;
  if (texto.startsWith('Riesgo de quedar por fuera: ')) return <TarjetaRiesgo texto={texto} />;
  if (texto.startsWith('⚠️')) return <TarjetaEstafa texto={texto} />;
  return <>{conEnlaces(mostrado)}</>;
}

/**
 * Reconoce el tipo de cada mensaje por su prefijo, que el núcleo genera de
 * forma determinista, para poder maquetarlo con jerarquía en vez de como un
 * párrafo. No reescribe ni resume: si un prefijo no coincide, el mensaje cae
 * al render de texto plano y no se pierde nada.
 */
function TarjetaPaso({ texto }: { texto: string }) {
  const resto = texto.slice('Su caso parece estar en: '.length);
  const compuerta = COMPUERTAS.find((c) => resto.startsWith(`${COMPUERTA_LABEL[c]}.`));
  if (!compuerta) return <>{texto}</>;

  const indice = COMPUERTAS.indexOf(compuerta);
  const detalle = resto.slice(COMPUERTA_LABEL[compuerta].length + 1).trim();

  return (
    <>
      <p className="wa-etiqueta" style={{ color: 'var(--signal)' }}>
        Su caso va aquí
      </p>
      <div className="wa-pasos" role="img" aria-label={`Paso ${indice + 1} de 5`}>
        {COMPUERTAS.map((c, i) => (
          <Fragment key={c}>
            {i > 0 && <span className={`wa-riel ${i <= indice ? 'wa-riel-hecho' : ''}`} />}
            <span
              className={`wa-paso ${i < indice ? 'wa-paso-hecho' : ''} ${
                i === indice ? 'wa-paso-aqui' : ''
              }`}
            >
              {i < indice ? '✓' : i + 1}
            </span>
          </Fragment>
        ))}
      </div>
      <p className="wa-titular">{COMPUERTA_LABEL[compuerta]}</p>
      <p className="wa-detalle">{detalle}</p>
    </>
  );
}

function TarjetaAccion({ texto }: { texto: string }) {
  const cuerpo = texto.slice('Qué hacer ahora: '.length);
  const corte = cuerpo.indexOf(' Dónde: ');
  const accion = corte === -1 ? cuerpo : cuerpo.slice(0, corte);
  const lugar = corte === -1 ? '' : cuerpo.slice(corte + ' Dónde: '.length);

  return (
    <>
      <p className="wa-etiqueta" style={{ color: 'var(--done)' }}>
        Qué hacer ahora
      </p>
      <p className="wa-titular">{accion}</p>
      {lugar && (
        <p className="wa-accionable">
          <span className="wa-accionable-icono" aria-hidden="true">
            📍
          </span>
          <span>{lugar}</span>
        </p>
      )}
    </>
  );
}

function TarjetaRiesgo({ texto }: { texto: string }) {
  const cuerpo = texto.slice('Riesgo de quedar por fuera: '.length);
  const corte = cuerpo.indexOf(' Pida esto: ');
  const cabeza = corte === -1 ? cuerpo : cuerpo.slice(0, corte);
  const pida = corte === -1 ? '' : cuerpo.slice(corte + ' Pida esto: '.length);
  const punto = cabeza.indexOf('. ');
  const titulo = punto === -1 ? cabeza : cabeza.slice(0, punto);
  const razon = punto === -1 ? '' : cabeza.slice(punto + 2);

  return (
    <div className="wa-alerta">
      <p className="wa-etiqueta" style={{ color: 'var(--alert)' }}>
        Podría quedar por fuera
      </p>
      <p className="wa-titular">{titulo}</p>
      {razon && <p className="wa-detalle">{razon}</p>}
      {pida && (
        <p className="wa-accionable">
          <span className="wa-accionable-icono" aria-hidden="true">
            ✋
          </span>
          <span>
            <b>Pida esto: </b>
            {pida}
          </span>
        </p>
      )}
    </div>
  );
}

function TarjetaEstafa({ texto }: { texto: string }) {
  return (
    <div className="wa-alerta">
      <p className="wa-etiqueta" style={{ color: 'var(--alert)' }}>
        Cuidado
      </p>
      <p className="wa-detalle" style={{ color: 'var(--ink)' }}>
        {texto.replace(/^⚠️\s*Cuidado:\s*/, '')}
      </p>
    </div>
  );
}

function TarjetaPeticion({ url, cierre }: { url: string; cierre: string }) {
  return (
    <>
      <a className="wa-peticion" href={url} target="_blank" rel="noopener noreferrer">
        <div className="wa-peticion-cuerpo">
          <p className="wa-peticion-folio">Derecho de petición</p>
          <p className="wa-peticion-titulo">Borrador listo con sus hechos</p>
          <p className="wa-peticion-nota">
            Ley 1755 de 2015, art. 14: la entidad debe responder en 15 días hábiles.
          </p>
        </div>
        <div className="wa-peticion-pie">
          <span>Abrir borrador →</span>
          <span className="wa-peticion-plazo">Enlace privado · 15 min</span>
        </div>
      </a>
      {cierre}
    </>
  );
}

export default function SimuladorWhatsApp() {
  const sesion = useRef(`sim_${crypto.randomUUID().replaceAll('-', '')}`);
  const [texto, setTexto] = useState('');
  const [municipio, setMunicipio] = useState('Manizales');
  const [barrio, setBarrio] = useState('San José');
  const [chat, setChat] = useState<Chat[]>([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notas, setNotas] = useState<{ id: string; etiqueta: string; src: string }[]>([]);
  const [notasUsadas, setNotasUsadas] = useState<string[]>([]);

  const hilo = useRef<HTMLDivElement>(null);
  const cola = useRef<string[]>([]);
  const drenando = useRef(false);

  // Descubre qué notas de la demo existen y en qué formato quedaron.
  useEffect(() => {
    let vigente = true;
    (async () => {
      const encontradas: { id: string; etiqueta: string; src: string }[] = [];
      for (const nota of NOTAS_DEMO) {
        for (const ext of EXTENSIONES) {
          const src = `/demo/${nota.id}.${ext}`;
          try {
            const r = await fetch(src, { method: 'HEAD' });
            if (r.ok) {
              encontradas.push({ ...nota, src });
              break;
            }
          } catch {
            // Un formato que no está no es un error: se prueba el siguiente.
          }
        }
      }
      if (vigente) setNotas(encontradas);
    })();
    return () => {
      vigente = false;
    };
  }, []);

  // Seguir el final del hilo mientras el texto aparece, como en la app real.
  useEffect(() => {
    const nodo = hilo.current;
    if (nodo) nodo.scrollTop = nodo.scrollHeight;
  }, [chat, escribiendo, cargando]);

  const drenarCola = useCallback(async () => {
    if (drenando.current) return;
    drenando.current = true;

    const sinMovimiento =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    while (cola.current.length > 0) {
      const mensaje = cola.current.shift()!;

      // Una pausa breve antes de cada mensaje: en WhatsApp los mensajes
      // llegan uno por uno, no todos de golpe.
      setEscribiendo(true);
      await pausa(sinMovimiento ? 0 : Math.min(650, 240 + mensaje.length * 1.4));
      setEscribiendo(false);

      // Los mensajes con estructura aparecen completos: una tarjeta se revela
      // como una pieza, y no tiene sentido "escribir" un token cifrado. El
      // efecto de escritura queda para el texto corrido, que es donde se lee.
      const instantaneo = sinMovimiento || esEstructurado(mensaje);

      setChat((actual) => [
        ...actual,
        {
          de: 'contados',
          texto: mensaje,
          mostrado: instantaneo ? mensaje : '',
          hora: horaCorta(),
        },
      ]);

      if (instantaneo) continue;

      // Se revela por bloques calculados para que cualquier mensaje termine
      // en REVELADO_MS: los cortos se sienten escritos, y el enlace de la
      // petición —cientos de caracteres— no eterniza la toma.
      const porPaso = Math.max(1, Math.ceil(mensaje.length / (REVELADO_MS / FOTOGRAMA_MS)));
      for (let i = porPaso; i < mensaje.length; i += porPaso) {
        const corte = mensaje.slice(0, i);
        setChat((actual) => {
          const copia = [...actual];
          const ultimo = copia.at(-1);
          if (ultimo) copia[copia.length - 1] = { ...ultimo, mostrado: corte };
          return copia;
        });
        await pausa(FOTOGRAMA_MS);
      }

      setChat((actual) => {
        const copia = [...actual];
        const ultimo = copia.at(-1);
        if (ultimo) copia[copia.length - 1] = { ...ultimo, mostrado: mensaje };
        return copia;
      });
    }

    drenando.current = false;
  }, []);

  async function enviar(textoAEnviar = texto, mostrarPersona = true) {
    if (cargando || (mostrarPersona && !textoAEnviar.trim())) return;
    if (mostrarPersona) {
      setChat((actual) => [
        ...actual,
        { de: 'persona', texto: textoAEnviar, mostrado: textoAEnviar, hora: horaCorta() },
      ]);
    }
    setTexto('');
    setCargando(true);
    setError(null);
    try {
      const response = await fetch('/api/conversacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sesionId: sesion.current,
          texto: textoAEnviar,
          municipio,
          barrio,
        }),
      });
      const data = (await response.json()) as { mensajes?: string[]; error?: string };
      if (!response.ok) throw new Error(data.error || 'No pudimos responder.');
      cola.current.push(...(data.mensajes ?? []));
      void drenarCola();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No hay conexión.');
    } finally {
      setCargando(false);
    }
  }

  /**
   * Manda una nota de voz de verdad: el archivo va a Groq, vuelve la
   * transcripción y esa transcripción entra a la misma conversación que el
   * texto escrito. No hay texto prefabricado en este camino.
   */
  async function enviarNota(nota: { id: string; etiqueta: string; src: string }) {
    if (cargando) return;
    setCargando(true);
    setError(null);
    setNotasUsadas((actual) => [...actual, nota.id]);
    setChat((actual) => [
      ...actual,
      { de: 'persona', texto: '', mostrado: '', hora: horaCorta(), audio: nota.src },
    ]);
    try {
      const archivo = await fetch(nota.src).then((r) => r.blob());
      const form = new FormData();
      form.set('audio', archivo, `${nota.id}.ogg`);
      form.set('sesionId', sesion.current);
      form.set('municipio', municipio);
      form.set('barrio', barrio);

      const response = await fetch('/api/nota-voz', { method: 'POST', body: form });
      const data = (await response.json()) as {
        mensajes?: string[];
        transcripcion?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || 'No pudimos transcribir la nota.');

      // La transcripción se pega bajo la burbuja del audio, como en WhatsApp.
      const dicho = data.transcripcion ?? '';
      setChat((actual) => {
        const copia = [...actual];
        for (let i = copia.length - 1; i >= 0; i--) {
          if (copia[i].audio === nota.src) {
            copia[i] = { ...copia[i], texto: dicho, mostrado: dicho };
            break;
          }
        }
        return copia;
      });

      cola.current.push(...(data.mensajes ?? []));
      void drenarCola();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No hay conexión.');
      setNotasUsadas((actual) => actual.filter((id) => id !== nota.id));
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-[38rem] px-5 pb-24 pt-8">
      <p className="folio">Contados · Simulador de WhatsApp</p>
      <div className="rule-double my-3" />
      <h1 className="display text-[2.4rem] leading-tight">¿En qué va su ayuda?</h1>
      <p className="mt-3 text-[1rem]" style={{ color: 'var(--ink-soft)' }}>
        Cuéntenos qué pasó, como le escribiría a alguien por WhatsApp. Le decimos en qué paso va
        su caso, qué sigue y dónde hacerlo.
      </p>
      <p
        className="mt-3 border-l-2 pl-3 text-[0.875rem] leading-snug"
        style={{ borderColor: 'var(--rule-strong)', color: 'var(--ink-faint)' }}
      >
        Demostración: no envía mensajes, no guarda la conversación y no lo registra ante ninguna
        entidad.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <label className="folio">
          Municipio
          <input
            className="mt-1 w-full border-2 p-3 text-base"
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
          />
        </label>
        <label className="folio">
          Barrio
          <input
            className="mt-1 w-full border-2 p-3 text-base"
            value={barrio}
            onChange={(e) => setBarrio(e.target.value)}
          />
        </label>
      </div>

      <section className="wa-marco mt-6">
        <header className="wa-barra">
          <div className="wa-avatar" aria-hidden="true">
            C
          </div>
          <div>
            <p className="wa-nombre">Contados</p>
            <p className="wa-estado">
              {escribiendo || cargando ? 'escribiendo…' : 'en línea'}
            </p>
          </div>
        </header>

        <div ref={hilo} className="wa-hilo h-[26rem]" aria-live="polite">
          {chat.length === 0 && !cargando && (
            <p
              className="m-auto max-w-[19rem] rounded-md px-4 py-3 text-center text-[0.85rem]"
              style={{ background: '#fdf5c8', color: '#54656f' }}
            >
              Escriba «hola» para comenzar. Nadie más ve esta conversación.
            </p>
          )}

          {chat.map((item, index) => {
            const propia = item.de === 'persona';
            const escribiendoAun =
              item.mostrado.length < item.texto.length && !esEstructurado(item.texto);
            return (
              <div key={index} className={`wa-burbuja ${propia ? 'wa-propia' : 'wa-ajena'}`}>
                {item.audio ? (
                  <>
                    <NotaDeVoz src={item.audio} />
                    {item.texto && (
                      <p className="wa-transcripcion">
                        <span className="wa-transcripcion-folio">Transcripción</span>
                        {item.texto}
                      </p>
                    )}
                  </>
                ) : (
                  <Contenido texto={item.texto} mostrado={item.mostrado} />
                )}
                {escribiendoAun && !item.audio && <i className="wa-cursor" />}
                <span className="wa-hora">
                  {item.hora}
                  {propia && (
                    <b className="wa-check" aria-hidden="true">
                      ✓✓
                    </b>
                  )}
                </span>
              </div>
            );
          })}

          {(escribiendo || cargando) && (
            <div className="wa-burbuja wa-ajena" aria-label="Contados está escribiendo">
              <span className="wa-puntos">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}
        </div>
      </section>

      {error && (
        <p className="mt-3" style={{ color: 'var(--alert)' }}>
          {error}
        </p>
      )}

      {notas.length > 0 && (
        <div className="mt-4 border-2 p-4" style={{ borderColor: 'var(--rule-strong)' }}>
          <p className="folio">Mandar una nota de voz</p>
          <p className="mt-1 text-[0.875rem]" style={{ color: 'var(--ink-soft)' }}>
            Se transcribe de verdad con Groq y entra a la misma conversación que el texto.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {notas.map((nota) => (
              <button
                key={nota.id}
                type="button"
                className="border-2 px-4 py-2 text-[0.9375rem] font-bold disabled:opacity-35"
                disabled={cargando || notasUsadas.includes(nota.id)}
                onClick={() => void enviarNota(nota)}
              >
                🎤 {nota.etiqueta}
              </button>
            ))}
          </div>
        </div>
      )}

      <textarea
        className="mt-4 min-h-28 w-full border-2 p-3 text-base"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Cuente qué pasó"
      />
      <button
        className="mt-3 w-full p-4 text-lg font-bold text-white disabled:opacity-40"
        style={{ background: 'var(--signal)' }}
        disabled={cargando || !texto.trim()}
        onClick={() => enviar()}
      >
        Enviar
      </button>
      <button
        className="mt-3 w-full border-2 p-3 font-bold"
        disabled={cargando}
        onClick={() => enviar('', false)}
      >
        Revisar avisos del barrio
      </button>
    </main>
  );
}
