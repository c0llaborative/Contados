# Plan vivo — Contados

- Estado: `CURRENT · CONSTRUIDO Y CORRIENDO · PENDIENTE PROBAR CONTRA EL MODELO`
- Fecha de estado: 2026-08-15 (America/Bogota)
- Owner: equipo de hackathon
- **Siguiente acción exacta:** exportar `ANTHROPIC_API_KEY`, levantar `app/` y
  ejecutar los tres casos de prueba y la prueba de abstención de
  [`PRUEBAS.md`](PRUEBAS.md). Es el único bloqueador real.
- Track: **02 — Justicia** (defendible también en 01; ver
  [ADR 0005](adr/0005-contados.md))

Este documento es la fuente de verdad sobre el estado. Si algo aquí contradice
otro documento, gana este.

## El problema

Para recibir ayuda hay que atravesar cinco compuertas: Reporte → Censo →
Evaluación técnica → RUD → Subsidio. Nadie le dice a una familia en cuál está
trabada, y nadie sabe en agregado dónde se atasca la gente. La evidencia
completa está en [`EVIDENCIA.md`](EVIDENCIA.md).

## Qué está hecho

| Pieza | Estado | Dónde |
|---|---|---|
| Modelo de caso de 5 compuertas (Primero/CPIMS+) | Hecho | `app/lib/schema.ts` |
| Clasificador con JSON Schema estricto | Hecho, **sin probar contra el modelo** | `app/app/api/diagnose/route.ts` |
| Captura por voz en el navegador (`es-CO`) | Hecho | `app/components/Captura.tsx` |
| Pantalla de compuertas + siguiente acción | Hecho | `app/app/page.tsx` |
| Alerta de riesgo de exclusión | Hecho | `app/app/page.tsx` |
| Ruta verificada de Manizales | Hecho | `app/lib/rutas.ts` |
| Corpus normativo con SHA-256 | Hecho | `app/lib/corpus.ts` |
| Derecho de petición con plazo calculado | Hecho y verificado | `app/app/api/peticion/route.ts` |
| Tablero agregado, 54 casos sintéticos | Hecho | `app/app/tablero/page.tsx` |

## Qué falta

| # | Pendiente | Bloquea | Owner |
|---|---|---|---|
| 1 | **Probar el clasificador contra `claude-opus-5`**: los tres casos y la prueba de abstención | El video y la entrega | Equipo |
| 2 | Grabar los tres audios sintéticos (arrendataria, poseedor sin título, censado esperando ingeniero) | El video | Equipo |
| 3 | Prueba de falsa expectativa con una persona ajena | La entrega | Equipo |
| 4 | Grabar y editar el video a 50-55 s | La entrega | Equipo |
| 5 | Consolidar el repositorio git y subir | La entrega | Equipo |

## Verificado

- `npx tsc --noEmit` y `npx next build`: limpios. Cinco rutas generadas.
- **Derecho de petición end-to-end**: destinatario tomado de la ruta verificada,
  las dos citas literales del corpus con su SHA-256, y el vencimiento calculado
  en código — 15-ago-2026 + 15 días hábiles = **4 de septiembre de 2026**,
  comprobado a mano.
- Manejo correcto de UTF-8 en `formData` (acentos y eñes).
- Ambas páginas renderizan sin errores de consola en viewport móvil 412×915.
- Barrido de lenguaje prohibido: la única coincidencia es la prohibición misma
  dentro del prompt del sistema.

## Supuestos y desconocidos

**Verificado**
- No existe consulta de estado por cédula en la UNGRD ni en Manizales, Pereira,
  Armenia, Cali o Quibdó.
- La Ley 1523 de 2012 no fija plazo en días para censo, evaluación técnica ni
  entrega de ayuda. La Ley 1755 de 2015 art. 14 sí: 15 días.
- Manizales: subsidio de $300.000 para ~1.150 familias, administrado por Cruz
  Roja Seccional Caldas, avisado por SMS al celular registrado.

**Supuesto, no verificado**
- Que la ruta de Manizales siga vigente el domingo. Cambia a diario; el producto
  muestra la fecha de verificación en pantalla precisamente por eso.
- Que el clasificador acierte la compuerta con relatos reales. Es el pendiente 1.

**Desconocido**
- Cuántos hogares hay realmente detenidos en cada compuerta. Esa es justamente
  la cifra que el producto propone producir, y por eso el agregado se rotula
  siempre como autorreportado.

## Riesgos y qué hacer

| Riesgo | Control | Condición de parada |
|---|---|---|
| El clasificador inventa una compuerta | Abstención obligatoria + schema estricto | Si falla la prueba de abstención, no se graba el video hasta corregir el prompt |
| Alguien cree que quedó registrado | Aviso permanente en pantalla 1 | Si la persona ajena duda en la prueba, se corrige el copy antes de grabar |
| La ruta municipal cambia | Fecha de verificación visible | Si no se puede verificar, se muestra el paso sin dirección |
| Latencia del modelo arruina la toma | Grabar con red estable | Si falla, usar respuesta prevalidada marcada como tal |
| Se filtra PII | Todo sintético; capturas del canal excluidas en `.gitignore` | Cualquier dato real bloquea la publicación |

## Historial

### 2026-08-15 — Organización del repositorio

- Status: `HECHO`.
- Completed: los cinco productos descartados y sus 19 documentos, 4 ADRs y 9
  PDFs pasaron a `archivo/`. Documentación de Contados reescrita: README raíz,
  este plan, `PRODUCTO.md`, `SEGURIDAD.md`, `EVIDENCIA.md`, `PRUEBAS.md`,
  `VIDEO.md` y ADR 0005.
- Decisions: se conservan solo los límites de seguridad del blueprint de Ruta
  Clara. Las capturas del canal quedan excluidas del repositorio por contener
  nombre y foto de una persona real.
- Next action: pendiente 1 de la tabla de arriba.
- Owner: equipo de hackathon.

### 2026-08-15 — Contados construido y verificado sin modelo

- Status: `HECHO CON PENDIENTE`.
- Completed: aplicación Next.js 16 con cinco rutas; modelo de caso de cinco
  compuertas basado en Primero/CPIMS+; clasificador con JSON Schema estricto;
  ruta verificada de Manizales; generador del derecho de petición; tablero
  agregado.
- Verified: ver la sección «Verificado» arriba.
- Decisions: la transcripción de voz ocurre en el navegador — la API de Claude
  no recibe audio, y así además el audio nunca sale del dispositivo. El
  instrumento legal se entrega como oficio HTML con CSS de impresión en vez de
  PDF generado: cero dependencias, y el jurado ve el documento completo en
  pantalla.
- Safety: aviso permanente de no registro; sin cédula ni datos bancarios;
  abstención obligatoria; cada hecho con su frase textual; agregado rotulado
  como autorreportado.
- Remaining/blocker: no se probó contra el modelo por falta de
  `ANTHROPIC_API_KEY` en el entorno de construcción.
- Owner: equipo de hackathon.

### 2026-08-15 — Pivote a Contados

- Status: `HECHO`.
- Completed: deep research en tres rondas (8 agentes, ~130 búsquedas) más
  segunda opinión de Codex, con instrucción explícita de refutar en vez de
  vender. Cinco productos murieron con evidencia.
- Decisions: se elige Contados. Ver [ADR 0005](adr/0005-contados.md) y
  [`archivo/README.md`](../archivo/README.md) para las razones de cada descarte.
- Owner: equipo de hackathon.
