import Link from 'next/link';
import { COMPUERTAS, COMPUERTA_LABEL, RIESGO_LABEL } from '@/lib/schema';
import { generarCasos } from '@/lib/fixtures';
import { MANIZALES } from '@/lib/rutas';

export const metadata = {
  title: 'Contados — dónde se está trabando la gente',
};

export default function Tablero() {
  const casos = generarCasos();
  const total = casos.length;

  const porCompuerta = COMPUERTAS.map((c) => ({
    compuerta: c,
    n: casos.filter((x) => x.compuerta === c).length,
  }));
  const pico = Math.max(...porCompuerta.map((x) => x.n));
  const cuello = porCompuerta.find((x) => x.n === pico)!;

  const barrios = [...new Set(casos.map((c) => c.barrio))]
    .map((b) => ({
      barrio: b,
      n: casos.filter((c) => c.barrio === b).length,
      trabados: casos.filter(
        (c) => c.barrio === b && c.compuerta === cuello.compuerta,
      ).length,
    }))
    .sort((a, b) => b.trabados - a.trabados);

  const conRiesgo = casos.filter((c) => c.riesgos.length > 0).length;
  const arrendatarios = casos.filter((c) => c.riesgos.includes('arrendatario')).length;

  return (
    <main className="mx-auto min-h-screen max-w-[46rem] px-5 pb-24 pt-8">
      <header className="lift">
        <p className="folio">Contados · Tablero de {MANIZALES.municipio}</p>
        <div className="rule-double my-3" />
        <h1 className="display text-[2.4rem] leading-[1.08]">
          Dónde se está<br />trabando la gente
        </h1>
        <p
          className="mt-4 text-[1.0625rem] leading-relaxed"
          style={{ color: 'var(--ink-soft)' }}
        >
          Esta es la cifra que hoy no existe: cuántos hogares están detenidos en
          cada paso de la ruta. No la produce ninguna entidad — la producen las
          personas al contar su caso.
        </p>
      </header>

      {/* Rótulo innegociable */}
      <aside
        className="lift mt-6 border-l-4 py-3 pl-4"
        style={{ borderColor: 'var(--signal)', background: 'var(--signal-wash)' }}
      >
        <p className="folio" style={{ color: 'var(--signal)' }}>
          Cómo leer esto
        </p>
        <p className="mt-1.5 text-[1.0625rem] leading-snug">
          Cifras <strong>autorreportadas</strong> por quienes usaron Contados. No son
          cifras oficiales ni un censo. Sirven para ver dónde se acumula la fila, no
          para contar damnificados.
        </p>
        <p className="mt-2 text-[0.9375rem]" style={{ color: 'var(--ink-soft)' }}>
          En esta demostración son {total} casos sintéticos. Ninguna persona real.
        </p>
      </aside>

      {/* El hallazgo, arriba */}
      <section className="mt-10">
        <p className="folio">El cuello de botella</p>
        <p className="display mt-2 text-2xl leading-snug">
          {Math.round((cuello.n / total) * 100)}% de los hogares está detenido en
          «{COMPUERTA_LABEL[cuello.compuerta]}».
        </p>
        <p
          className="mt-3 text-[1.0625rem] leading-relaxed"
          style={{ color: 'var(--ink-soft)' }}
        >
          Es coherente con lo que se sabe: la Alcaldía pidió 500 ingenieros para
          revisar más de 2.000 edificaciones. Sin esa visita no hay registro en el RUD,
          y sin RUD no hay subsidio.
        </p>
      </section>

      {/* Distribución por compuerta */}
      <section className="mt-10">
        <div className="rule-double mb-6" />
        <p className="folio mb-5">Hogares detenidos en cada paso</p>
        <ol className="space-y-5">
          {porCompuerta.map(({ compuerta, n }, i) => {
            // Escalada al máximo, no al total: así se comparan los pasos entre
            // sí. La cifra exacta va al lado, para que nadie lea solo la barra.
            const pct = Math.round((n / pico) * 100);
            const esCuello = compuerta === cuello.compuerta;
            return (
              <li
                key={compuerta}
                className="lift"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className="display text-lg"
                    style={{ color: esCuello ? 'var(--ink)' : 'var(--ink-soft)' }}
                  >
                    {i + 1}. {COMPUERTA_LABEL[compuerta]}
                  </span>
                  <span
                    className="display shrink-0 text-lg tabular-nums"
                    style={{ color: esCuello ? 'var(--signal)' : 'var(--ink-faint)' }}
                  >
                    {n}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-6"
                  style={{ background: 'var(--paper-raised)' }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${pct}%`,
                      background: esCuello ? 'var(--signal)' : 'var(--rule-strong)',
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Por barrio */}
      <section className="mt-12">
        <div className="rule-double mb-6" />
        <p className="folio mb-1">Por barrio</p>
        <p className="mb-5 text-[1rem]" style={{ color: 'var(--ink-soft)' }}>
          Cuántos hogares esperan la visita técnica en cada barrio. Es el orden en que
          convendría enviar a los ingenieros.
        </p>
        <table className="w-full text-[1.0625rem]">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ink)' }}>
              <th className="folio pb-2 text-left">Barrio</th>
              <th className="folio pb-2 text-right">Esperando visita</th>
              <th className="folio pb-2 text-right">Casos</th>
            </tr>
          </thead>
          <tbody>
            {barrios.map((b) => (
              <tr key={b.barrio} style={{ borderBottom: '1px solid var(--rule)' }}>
                <td className="py-2.5">{b.barrio}</td>
                <td
                  className="py-2.5 text-right font-bold tabular-nums"
                  style={{ color: b.trabados > 0 ? 'var(--signal)' : 'var(--ink-faint)' }}
                >
                  {b.trabados}
                </td>
                <td
                  className="py-2.5 text-right tabular-nums"
                  style={{ color: 'var(--ink-faint)' }}
                >
                  {b.n}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Riesgo de exclusión */}
      <section className="mt-12">
        <div className="rule-double mb-6" />
        <p className="folio mb-1" style={{ color: 'var(--alert)' }}>
          En riesgo de quedar por fuera
        </p>
        <p className="display mt-2 text-2xl leading-snug">
          {conRiesgo} de {total} hogares tienen al menos una condición que
          históricamente los deja fuera del censo.
        </p>
        <p
          className="mt-3 text-[1.0625rem] leading-relaxed"
          style={{ color: 'var(--ink-soft)' }}
        >
          {arrendatarios} de ellos son arrendatarios — el grupo que quedó por fuera del
          censo inicial en Ciudad de México en 2017, y que dos años después obligó a
          rehacer el diagnóstico con más de 22.000 viviendas adicionales.
        </p>
        <ul className="mt-5 space-y-2">
          {(
            Object.keys(RIESGO_LABEL) as (keyof typeof RIESGO_LABEL)[]
          ).map((r) => {
            const n = casos.filter((c) => c.riesgos.includes(r)).length;
            if (n === 0) return null;
            return (
              <li
                key={r}
                className="flex items-baseline justify-between gap-3 border-b py-1.5 text-[1.0625rem]"
                style={{ borderColor: 'var(--rule)' }}
              >
                <span>{RIESGO_LABEL[r]}</span>
                <span className="font-bold tabular-nums">{n}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <footer
        className="mt-16 border-t pt-5 text-[0.875rem] leading-relaxed"
        style={{ borderColor: 'var(--rule)', color: 'var(--ink-faint)' }}
      >
        <Link
          href="/"
          className="mb-4 inline-block border-b-2 text-[1.0625rem] font-bold"
          style={{ borderColor: 'var(--signal)', color: 'var(--ink)' }}
        >
          ← Ver en qué voy yo
        </Link>
        <p>
          Contados no es un canal oficial. Estas cifras son autorreportadas y no
          reemplazan el censo de la alcaldía ni el RUD de la UNGRD.
        </p>
        <p className="folio mt-4">Hac[k]athon CTW 2026 · Caso de demostración</p>
      </footer>
    </main>
  );
}
