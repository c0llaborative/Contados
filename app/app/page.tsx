'use client';

import { useState } from 'react';
import { Captura } from '@/components/Captura';
import { Compuertas } from '@/components/Compuertas';
import { COMPUERTA_LABEL, RIESGO_LABEL, type Diagnostico } from '@/lib/schema';
import { getRuta } from '@/lib/rutas';

const PESOS = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function Home() {
  const [municipio, setMunicipio] = useState('Manizales');
  const [barrio, setBarrio] = useState('');
  const [relato, setRelato] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dx, setDx] = useState<Diagnostico | null>(null);

  const ruta = getRuta(municipio);

  async function analizar() {
    setCargando(true);
    setError(null);
    setDx(null);
    try {
      const r = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relato, municipio }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? 'No pudimos analizar su caso.');
        return;
      }
      setDx(data as Diagnostico);
    } catch {
      setError('No hay conexión en este momento. Intente de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  const paso = dx?.compuerta ? ruta?.pasos[dx.compuerta] : null;

  return (
    <main className="mx-auto min-h-screen max-w-[38rem] px-5 pb-24 pt-8">
      {/* Membrete */}
      <header className="lift">
        <p className="folio">Contados · Ruta de atención a damnificados</p>
        <div className="rule-double my-3" />
        <h1 className="display text-[2.6rem] leading-[1.05]">
          ¿En qué va<br />su ayuda?
        </h1>
        <p
          className="mt-4 text-[1.0625rem] leading-relaxed"
          style={{ color: 'var(--ink-soft)' }}
        >
          Para recibir cualquier apoyo hay que pasar cinco compuertas. Casi nadie
          sabe en cuál está trabado. Cuéntenos qué ha pasado y se lo decimos.
        </p>
      </header>

      {/* Advertencia permanente. Nunca se colapsa ni se oculta. */}
      <aside
        className="lift mt-7 border-l-4 py-3 pl-4"
        style={{ borderColor: 'var(--alert)', background: 'var(--alert-wash)' }}
      >
        <p className="folio" style={{ color: 'var(--alert)' }}>
          Léalo antes de empezar
        </p>
        <p className="mt-1.5 text-[1.0625rem] leading-snug">
          <strong>Esto no lo registra ante ninguna entidad.</strong> Solo le
          decimos en qué paso está y qué puede hacer. Registrarse en el censo es
          gratis y nadie puede cobrarle. No le pedimos cédula ni datos bancarios.
        </p>
      </aside>

      {/* Formulario */}
      <section className="lift mt-9" style={{ animationDelay: '90ms' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="municipio" className="folio mb-2 block">
              Municipio
            </label>
            <input
              id="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              className="w-full rounded-sm border-2 px-3 py-3 text-[1.0625rem]"
              style={{
                borderColor: 'var(--rule-strong)',
                background: 'var(--paper-raised)',
              }}
            />
          </div>
          <div>
            <label htmlFor="barrio" className="folio mb-2 block">
              Barrio o vereda
            </label>
            <input
              id="barrio"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              placeholder="Opcional"
              className="w-full rounded-sm border-2 px-3 py-3 text-[1.0625rem]"
              style={{
                borderColor: 'var(--rule-strong)',
                background: 'var(--paper-raised)',
              }}
            />
          </div>
        </div>

        <div className="mt-6">
          <Captura valor={relato} onCambio={setRelato} deshabilitado={cargando} />
        </div>

        <button
          type="button"
          onClick={analizar}
          disabled={cargando || relato.trim().length < 10}
          className="mt-6 w-full rounded-sm px-5 py-5 text-lg font-bold transition-opacity disabled:opacity-40"
          style={{ background: 'var(--signal)', color: '#fff' }}
        >
          {cargando ? 'Revisando lo que nos contó…' : 'Ver en qué voy'}
        </button>

        {!ruta && municipio.trim() !== '' && (
          <p className="mt-3 text-[0.9375rem]" style={{ color: 'var(--ink-soft)' }}>
            Todavía no tenemos la ruta verificada de {municipio}. Le diremos en qué
            paso está, pero sin la dirección exacta del punto de atención.
          </p>
        )}

        {error && (
          <p
            className="mt-4 border-l-4 py-2 pl-3 text-[1.0625rem]"
            style={{ borderColor: 'var(--alert)', color: 'var(--alert)' }}
          >
            {error}
          </p>
        )}
      </section>

      {/* Resultado */}
      {dx && (
        <section className="mt-12">
          <div className="rule-double mb-8" />

          {dx.posible_estafa && (
            <aside
              className="lift mb-8 border-2 p-4"
              style={{ borderColor: 'var(--alert)', background: 'var(--alert-wash)' }}
            >
              <p className="folio" style={{ color: 'var(--alert)' }}>
                Cuidado
              </p>
              <p className="mt-1.5 text-[1.0625rem] leading-snug">
                Por lo que nos contó, quien tomó sus datos podría no ser un
                funcionario. Hay denuncias de personas haciéndose pasar por
                funcionarios para pedir datos, fotos y huellas. Verifique en el
                punto oficial de atención antes de entregar nada más.
              </p>
            </aside>
          )}

          {dx.compuerta === null ? (
            /* Abstención. No inventamos una compuerta. */
            <div className="lift">
              <h2 className="display text-2xl">
                Todavía no podemos decirle en qué paso está
              </h2>
              <p className="mt-3 text-[1.0625rem]" style={{ color: 'var(--ink-soft)' }}>
                {dx.razon}
              </p>
              <p className="folio mt-7 mb-3">Cuéntenos también esto</p>
              <ul className="space-y-3">
                {dx.falta_preguntar.map((q, i) => (
                  <li
                    key={i}
                    className="border-l-4 py-1 pl-4 text-[1.0625rem]"
                    style={{ borderColor: 'var(--signal)' }}
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <Compuertas actual={dx.compuerta} />

              <p
                className="mt-6 border-l-4 py-2 pl-4 text-[1.0625rem] leading-relaxed"
                style={{ borderColor: 'var(--rule-strong)', color: 'var(--ink-soft)' }}
              >
                {dx.razon}
              </p>

              {/* Siguiente acción concreta */}
              {paso && (
                <div
                  className="lift mt-8 border-2 p-5"
                  style={{ borderColor: 'var(--ink)', background: 'var(--paper-raised)' }}
                >
                  <p className="folio">Qué hacer ahora</p>
                  <p className="display mt-2 text-xl leading-snug">{paso.accion}</p>

                  {paso.lugar && (
                    <p className="mt-4 text-[1.0625rem]">
                      <span className="folio block mb-1">Dónde</span>
                      {paso.lugar}
                    </p>
                  )}

                  {paso.llevar.length > 0 && (
                    <div className="mt-4">
                      <span className="folio block mb-1">Qué llevar</span>
                      <ul className="list-disc pl-5 text-[1.0625rem]">
                        {paso.llevar.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {paso.nota && (
                    <p
                      className="mt-4 text-[1rem] leading-relaxed"
                      style={{ color: 'var(--ink-soft)' }}
                    >
                      {paso.nota}
                    </p>
                  )}

                  {ruta && (
                    <p className="folio mt-5" style={{ color: 'var(--ink-faint)' }}>
                      Ruta de {ruta.municipio} verificada el {ruta.verificado}
                    </p>
                  )}
                </div>
              )}

              {/* Riesgo de quedar por fuera */}
              {dx.alertas.length > 0 && (
                <div className="mt-8">
                  <p className="folio mb-3" style={{ color: 'var(--alert)' }}>
                    Puede quedar por fuera
                  </p>
                  <div className="space-y-4">
                    {dx.alertas.map((a) => (
                      <div
                        key={a.riesgo}
                        className="lift border-l-4 py-3 pl-4"
                        style={{
                          borderColor: 'var(--alert)',
                          background: 'var(--alert-wash)',
                        }}
                      >
                        <h3 className="display text-lg">{RIESGO_LABEL[a.riesgo]}</h3>
                        <p className="mt-1 text-[1.0625rem] leading-snug">{a.razon}</p>
                        <p className="mt-2 text-[1.0625rem] leading-snug">
                          <strong>Pida esto: </strong>
                          {a.accion}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p
                    className="mt-3 text-[0.9375rem] leading-snug"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    En Ciudad de México, tras el sismo de 2017, el censo inicial dejó
                    por fuera más de 22.000 viviendas con daño severo. Casi siempre
                    quedan por fuera los mismos: arrendatarios y quienes no tienen
                    escritura.
                  </p>
                </div>
              )}

              {/* El único reloj que existe */}
              <div className="mt-10">
                <div className="rule-double mb-6" />
                <p className="folio" style={{ color: 'var(--signal)' }}>
                  El único plazo que existe
                </p>
                <h2 className="display mt-2 text-2xl leading-snug">
                  El Estado no tiene plazo para censarlo.
                  <br />
                  Usted sí puede ponerle uno.
                </h2>
                <p
                  className="mt-3 text-[1.0625rem] leading-relaxed"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  La ley no fija un término en días para completar el censo, hacer la
                  visita técnica ni entregar la ayuda. Lo que sí tiene reloj es un
                  derecho de petición: la entidad debe responderle dentro de los 15
                  días siguientes.
                </p>

                <form action="/api/peticion" method="POST" className="mt-5">
                  <input type="hidden" name="municipio" value={municipio} />
                  <input type="hidden" name="barrio" value={barrio} />
                  <input type="hidden" name="compuerta" value={dx.compuerta} />
                  <input
                    type="hidden"
                    name="hechos"
                    value={JSON.stringify(dx.hechos)}
                  />
                  <button
                    type="submit"
                    className="w-full rounded-sm border-2 px-5 py-5 text-lg font-bold"
                    style={{
                      borderColor: 'var(--ink)',
                      background: 'var(--ink)',
                      color: 'var(--paper-raised)',
                    }}
                  >
                    Ponerle plazo al Estado
                  </button>
                </form>
                <p
                  className="mt-2 text-[0.9375rem]"
                  style={{ color: 'var(--ink-faint)' }}
                >
                  Le generamos el derecho de petición en PDF, listo para radicar.
                  Nosotros no lo radicamos por usted.
                </p>
              </div>

              {/* Lo que entendimos, con su evidencia */}
              {dx.hechos.length > 0 && (
                <details className="mt-10">
                  <summary className="folio cursor-pointer">
                    Lo que entendimos de lo que nos contó
                  </summary>
                  <ul className="mt-4 space-y-3">
                    {dx.hechos.map((h, i) => (
                      <li key={i} className="text-[1.0625rem]">
                        {h.afirmacion}
                        <span
                          className="mt-0.5 block text-[0.9375rem] italic"
                          style={{ color: 'var(--ink-faint)' }}
                        >
                          porque usted dijo: «{h.evidencia}»
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </section>
      )}

      {/* Agregado */}
      {ruta?.subsidio && (
        <section className="mt-16">
          <div className="rule-double mb-6" />
          <p className="folio">
            {ruta.municipio} · lo que ya se decidió
          </p>
          <p className="mt-3 text-[1.0625rem] leading-relaxed">
            El subsidio de arriendo es de{' '}
            <strong>{PESOS.format(ruta.subsidio.monto_mensual)} al mes</strong> y
            apunta a{' '}
            <strong>
              {ruta.subsidio.familias_objetivo.toLocaleString('es-CO')} familias
            </strong>
            . Lo
            administra {ruta.subsidio.administra}.
          </p>
          <p
            className="mt-3 text-[1.0625rem] leading-relaxed"
            style={{ color: 'var(--ink-soft)' }}
          >
            El aviso llega por mensaje de texto al celular registrado. Si perdió el
            celular, cambió de número o nunca lo censaron, no le llega nada y nadie le
            dice por qué.
          </p>
          <a
            href="/tablero"
            className="mt-5 inline-block border-b-2 text-[1.0625rem] font-bold"
            style={{ borderColor: 'var(--signal)' }}
          >
            Ver dónde se está trabando la gente →
          </a>
        </section>
      )}

      <footer
        className="mt-16 border-t pt-5 text-[0.875rem] leading-relaxed"
        style={{ borderColor: 'var(--rule)', color: 'var(--ink-faint)' }}
      >
        <p>
          Contados no es un canal oficial y no reemplaza a la alcaldía ni a la UNGRD.
          No evalúa si una vivienda es segura o habitable: eso lo hace un profesional
          en la visita técnica.
        </p>
        <p className="folio mt-4">Hac[k]athon CTW 2026 · Caso de demostración</p>
      </footer>
    </main>
  );
}
