'use client';

import { useState } from 'react';

export function Notificador({ barrios }: { barrios: string[] }) {
  const [barrio, setBarrio] = useState(barrios[0] ?? '');
  const [mensaje, setMensaje] = useState(
    'La evaluación técnica llegó a su barrio. Confirme el horario y el punto con la Unidad de Gestión del Riesgo.',
  );
  const [resultado, setResultado] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function notificar() {
    setEnviando(true);
    setResultado(null);
    try {
      const response = await fetch('/api/notificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barrio, mensaje, enviarReal: false }),
      });
      const data = (await response.json()) as { afectados?: number; error?: string };
      if (!response.ok) throw new Error(data.error || 'No se pudo crear el aviso.');
      const n = data.afectados ?? 0;
      setResultado(
        n === 1
          ? '1 familia del barrio recibió el aviso en el simulador. No se envió nada por WhatsApp.'
          : `${n} familias del barrio recibieron el aviso en el simulador. No se envió nada por WhatsApp.`,
      );
    } catch (error) {
      setResultado(error instanceof Error ? error.message : 'No se pudo crear el aviso.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="mt-12 border-2 p-5" style={{ borderColor: 'var(--ink)', background: 'var(--paper-raised)' }}>
      <p className="folio" style={{ color: 'var(--signal)' }}>Cerrar el círculo</p>
      <h2 className="display mt-2 text-2xl">Avisarle a un barrio que ya le toca</h2>
      <p className="mt-2 text-[1.0625rem] leading-relaxed">
        La familia no vuelve a preguntar: el municipio le avisa. Es la diferencia entre
        un portal que hay que consultar y un mensaje que llega.
      </p>
      <p className="mt-2 text-[0.9375rem]" style={{ color: 'var(--ink-soft)' }}>
        En esta demostración el aviso llega al simulador. El envío real por WhatsApp
        exige que un operador lo autorice.
      </p>
      <label className="folio mt-5 block">Barrio</label>
      <select className="mt-1 w-full border-2 p-3 text-base" value={barrio} onChange={(e) => setBarrio(e.target.value)}>
        {barrios.map((item) => <option key={item}>{item}</option>)}
      </select>
      <label className="folio mt-4 block">Mensaje</label>
      <textarea className="mt-1 min-h-28 w-full border-2 p-3 text-base" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
      <button type="button" className="mt-4 w-full p-4 font-bold text-white disabled:opacity-40" style={{ background: 'var(--signal)' }} disabled={enviando || mensaje.trim().length < 10} onClick={notificar}>
        {enviando ? 'Creando aviso…' : 'Notificar en la demo'}
      </button>
      {resultado && <p className="mt-3 text-sm" aria-live="polite">{resultado}</p>}
    </section>
  );
}
