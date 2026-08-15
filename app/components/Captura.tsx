'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Captura del relato. Voz primero, escritura como respaldo.
 *
 * La transcripción ocurre en el navegador (Web Speech API, es-CO): no se sube
 * audio a ningún servidor. Si el navegador no la soporta, el campo de texto
 * queda igual de disponible — nunca se bloquea a nadie por el canal.
 */

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [i: number]: { isFinal: boolean; 0: { transcript: string } };
  };
}

type Ctor = new () => SpeechRecognitionLike;

function getCtor(): Ctor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: Ctor;
    webkitSpeechRecognition?: Ctor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function Captura({
  valor,
  onCambio,
  deshabilitado,
}: {
  valor: string;
  onCambio: (v: string) => void;
  deshabilitado: boolean;
}) {
  const [grabando, setGrabando] = useState(false);
  const [hayVoz, setHayVoz] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const baseRef = useRef('');

  useEffect(() => {
    setHayVoz(getCtor() !== null);
    return () => recRef.current?.stop();
  }, []);

  function alternar() {
    if (grabando) {
      recRef.current?.stop();
      return;
    }
    const Ctor = getCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = 'es-CO';
    rec.continuous = true;
    rec.interimResults = true;
    baseRef.current = valor ? valor.trimEnd() + ' ' : '';

    rec.onresult = (e) => {
      let texto = '';
      for (let i = 0; i < e.results.length; i++) {
        texto += e.results[i][0].transcript;
      }
      onCambio(baseRef.current + texto);
    };
    rec.onerror = () => setGrabando(false);
    rec.onend = () => setGrabando(false);

    recRef.current = rec;
    rec.start();
    setGrabando(true);
  }

  return (
    <div>
      {hayVoz && (
        <button
          type="button"
          onClick={alternar}
          disabled={deshabilitado}
          className="flex w-full items-center justify-center gap-3 rounded-sm border-2 px-5 py-5 text-lg font-bold transition-colors disabled:opacity-45"
          style={{
            borderColor: grabando ? 'var(--alert)' : 'var(--ink)',
            background: grabando ? 'var(--alert-wash)' : 'var(--ink)',
            color: grabando ? 'var(--alert)' : 'var(--paper-raised)',
          }}
        >
          {grabando ? (
            <>
              <span
                className="rec h-3.5 w-3.5 rounded-full"
                style={{ background: 'var(--alert)' }}
                aria-hidden
              />
              Estoy escuchando — toque para terminar
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <rect x="9" y="2.5" width="6" height="11" rx="3" />
                <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
              </svg>
              Contar hablando
            </>
          )}
        </button>
      )}

      <label htmlFor="relato" className="folio mt-6 mb-2 block">
        {hayVoz ? 'O escríbalo aquí' : 'Cuéntenos qué pasó'}
      </label>
      <textarea
        id="relato"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        disabled={deshabilitado}
        rows={6}
        placeholder="Ejemplo: la casa se agrietó toda, vino una señora con chaleco y anotó en un cuaderno, pero nadie más volvió. Yo pago arriendo."
        className="w-full resize-y rounded-sm border-2 p-4 text-[1.0625rem] leading-relaxed placeholder:text-[0.9375rem] disabled:opacity-45"
        style={{
          borderColor: 'var(--rule-strong)',
          background: 'var(--paper-raised)',
          color: 'var(--ink)',
        }}
      />
    </div>
  );
}
