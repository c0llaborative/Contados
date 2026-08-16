'use client';

import { useRef, useState } from 'react';

type Chat = { de: 'persona' | 'contados'; texto: string };

export default function SimuladorWhatsApp() {
  const sesion = useRef(`sim_${crypto.randomUUID().replaceAll('-', '')}`);
  const [texto, setTexto] = useState('');
  const [municipio, setMunicipio] = useState('Manizales');
  const [barrio, setBarrio] = useState('San José');
  const [chat, setChat] = useState<Chat[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(textoAEnviar = texto, mostrarPersona = true) {
    if (cargando || (mostrarPersona && !textoAEnviar.trim())) return;
    if (mostrarPersona) setChat((actual) => [...actual, { de: 'persona', texto: textoAEnviar }]);
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
      setChat((actual) => [
        ...actual,
        ...(data.mensajes ?? []).map((mensaje): Chat => ({ de: 'contados', texto: mensaje })),
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No hay conexión.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-[38rem] px-5 pb-24 pt-8">
      <p className="folio">Contados · Simulador del canal</p>
      <div className="rule-double my-3" />
      <h1 className="display text-[2.4rem] leading-tight">La misma conversación de WhatsApp, sin depender de Meta</h1>
      <p className="mt-3 text-[1rem]" style={{ color: 'var(--ink-soft)' }}>
        Este simulador usa el mismo núcleo que el webhook real. No envía mensajes ni guarda su conversación.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <label className="folio">Municipio<input className="mt-1 w-full border-2 p-3 text-base" value={municipio} onChange={(e) => setMunicipio(e.target.value)} /></label>
        <label className="folio">Barrio<input className="mt-1 w-full border-2 p-3 text-base" value={barrio} onChange={(e) => setBarrio(e.target.value)} /></label>
      </div>

      <section className="mt-6 min-h-72 space-y-3 border-2 p-4" style={{ background: 'var(--paper-raised)' }} aria-live="polite">
        {chat.length === 0 && <p style={{ color: 'var(--ink-faint)' }}>Escriba «hola» para comenzar.</p>}
        {chat.map((item, index) => (
          <div key={index} className={`max-w-[88%] break-words p-3 ${item.de === 'persona' ? 'ml-auto' : 'mr-auto'}`} style={{ background: item.de === 'persona' ? 'var(--signal-wash)' : 'white', border: '1px solid var(--rule)' }}>
            {item.texto}
          </div>
        ))}
        {cargando && <p style={{ color: 'var(--ink-faint)' }}>Contados está revisando…</p>}
      </section>

      {error && <p className="mt-3" style={{ color: 'var(--alert)' }}>{error}</p>}
      <textarea className="mt-4 min-h-28 w-full border-2 p-3 text-base" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Cuente qué pasó" />
      <button className="mt-3 w-full p-4 text-lg font-bold text-white disabled:opacity-40" style={{ background: 'var(--signal)' }} disabled={cargando || !texto.trim()} onClick={() => enviar()}>
        Enviar
      </button>
      <button className="mt-3 w-full border-2 p-3 font-bold" disabled={cargando} onClick={() => enviar('', false)}>
        Revisar avisos del barrio
      </button>
    </main>
  );
}
