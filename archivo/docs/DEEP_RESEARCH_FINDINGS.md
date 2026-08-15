# Deep research - necesidad desatendida y decision provisional

Estado: `CURRENT - DECISION PROVISIONAL; NO AUTORIZA IMPLEMENTACION`

Fecha de corte: 2026-08-15 (America/Bogota)

## Resultado ejecutivo

La investigacion refuta la propuesta anterior de Nexo GRD y debilita un tracker
generico de recuperacion. El SNIGRD ya integra datos de riesgos, emergencias,
inversion y capacidades; las circulares 035 y 045 de 2026 ya exigen matrices y,
para el PRT Frente Frio, una herramienta interna de seguimiento.

La necesidad mejor sustentada esta un paso antes: **formular y ajustar un Plan
de Accion Especifico (PAE) consolidado, verificable y sin compromisos huerfanos**.
La propuesta provisional es **CompilaGRD**, un compilador semantico para Track
01. Convierte aportes sectoriales heterogeneos en un grafo de compromisos y
marca errores bloqueantes antes de aprobar o publicar el plan.

No se afirma que la herramienta resuelva por si sola retrasos politicos,
contractuales o presupuestales. La evidencia prueba un problema documental y de
coordinacion; la causalidad y adopcion siguen sin validar.

## Punto exacto del proceso

La Ley 1523 de 2012, articulo 61, exige un PAE para rehabilitacion y
reconstruccion una vez declarada la situacion de desastre o calamidad. El punto
elegido es la **consolidacion y ajuste del PAE**, despues de recibir aportes
sectoriales y antes de su aprobacion/publicacion o de aceptar una modificacion.

| Elemento | Definicion acotada |
|---|---|
| Usuario primario | PMO, gerencia o secretaria tecnica que consolida el PAE. |
| Usuario secundario | Control interno, Procuraduria, Contraloria y veeduria. |
| Decision humana | Aceptar, devolver o aclarar un compromiso sectorial. |
| Entrada | PAE base, reporte sectorial y, opcionalmente, relacion contractual. |
| Salida | Grafo/diff con errores, advertencias, confianza y cita de pagina. |
| No hace | No aprueba gasto, contrato, seguridad, prioridad ni cumplimiento. |

## Evidencia de dolor

1. La Procuraduria reporto el 12 de diciembre de 2025 que no existia una
   version final consolidada del PAE de Providencia y que varias entidades no
   tenian valores de inversion ni horizonte de ejecucion.
2. En Mocoa, la Procuraduria documento en 2025 retrasos, contratos de
   interventoria tardios, proyectos sin supervisores y dependencias operativas:
   un megacolegio no podia funcionar sin la interconexion de alcantarillado de
   otro proyecto.
3. El XVI seguimiento del PNGRD recibio reporte de 804 municipios (73 %) y 13
   sectores (72 %), con variacion territorial extrema. Esto prueba cobertura
   incompleta de reporte, no la causa.
4. El borrador de estrategia de recuperacion 2025 reconoce dificultades para
   seguir PAE/CONPES, acciones compartidas sin liderazgo/plan de trabajo y
   necesidad de automatizar y sistematizar. Se usa como diagnostico, no norma.

## Prueba de factibilidad con datos publicos

- El PAE publico 2021 de San Andres, Providencia y Santa Catalina tiene 68
  paginas y repite campos de actividad, responsable, apoyo, cronograma y
  presupuesto.
- El reporte sectorial de agosto de 2022 tiene 262 paginas y reorganiza el
  contenido alrededor de avance y asignacion. La inspeccion textual encontro
  `PRESUPUESTO` 67 veces en el PAE y solo 2 en el reporte, mientras `AVANCE`
  aparece 0 y 151 veces respectivamente.
- El caso permite demostrar alineacion semantica y cambio de esquema con
  documentos publicos. Aun no mide precision ni recall del modelo.

## Refutacion de oportunidades

| Oportunidad | Evidencia a favor | Refutacion principal | Gate |
|---|---|---|---|
| **CompilaGRD** | Providencia, Mocoa, PAE/reportes publicos, Ley 1523 art. 61 | La causa puede ser autoridad/incentivos, no software; Circular 045 ya tiene herramienta interna para un plan | Pasa provisional |
| Replay GRD | OCDE y libro UNGRD piden institucionalizar lecciones | No hay evidencia directa de que buscar precedentes sea el cuello de botella; puede quedar en RAG | Falla dolor directo |
| Integridad PAE como auditor | Hallazgos de organos de control | Llega tarde y genera friccion; la adopcion por control externo no esta validada | Pasa, pero pierde frente a prevencion |
| Pre-mortem de interdependencias | Casos reales muestran dependencias; Vision 2026 lo prioriza | No hay dataset local ni ground truth; AHA ya cubre simulacion global | Falla MVP/validacion |
| Accion anticipatoria | Contexto El Nino 2026-2027 | FAO, IFRC y UNGRD ya tienen protocolos/pilotos | Falla oferta existente |
| Nexo EDAN/RUD | Reconciliacion es plausible | SNIGRD 2026 y herramientas de captura reducen novedad; frecuencia/costo no cuantificados | Falla evidencia |

## Matriz CTW con pesos oficiales

Puntajes conservadores sobre evidencia disponible, no resultados de usuario.

| Concepto | Impacto /25 | IA /25 | Demo /20 | Viabilidad /15 | Tecnica/UX /15 | Total |
|---|---:|---:|---:|---:|---:|---:|
| **CompilaGRD** | 23 | 23 | 18 | 12 | 13 | **89** |
| Auditor de integridad PAE | 22 | 22 | 18 | 11 | 12 | 85 |
| Replay GRD | 18 | 21 | 17 | 10 | 11 | 77 |
| Pre-mortem interdependencias | 20 | 20 | 15 | 8 | 11 | 74 |
| Nexo EDAN/RUD | 17 | 19 | 15 | 8 | 10 | 69 |
| Accion anticipatoria generica | 18 | 16 | 15 | 9 | 9 | 67 |

## Por que la IA es nucleo

El modelo extrae compromisos desde tablas y prosa heterogeneas y alinea una
actividad reformulada con su antecedente. Las reglas deterministas comprueban
campos obligatorios y consistencia despues de la alineacion. Sin IA, el
producto no resuelve cambios de redaccion/esquema; sin reglas, seria un chatbot
no auditable.

## Demo de 55 segundos

1. Abrir un caso precargado derivado de los PAE publicos (5 s).
2. Soltar un aporte sectorial reformulado; el grafo incorpora compromisos (10 s).
3. El compilador marca una actividad sin presupuesto, otra sin contraparte y
   una dependencia de servicio huerfana, cada una con pagina fuente (15 s).
4. El usuario resuelve un mapeo ambiguo y agrega el responsable faltante; el
   grafo cambia de rojo a verde (15 s).
5. Exportar manifiesto verificable y mostrar limites: hallazgo documental, no
   dictamen ni decision institucional (10 s).

## Falsadores y experimento previo a construir

Abandonar o reformular si ocurre cualquiera:

1. La herramienta de Circular 045 ya valida semanticamente aportes antes de la
   aprobacion y puede generalizarse a todos los PAE.
2. En una muestra de 10 compromisos reales, el alineador no alcanza precision y
   recall >= 0,85 o inventa una sola cita.
3. Dos operadores de formulacion PAE indican que los vacios se conocen y el
   bloqueo real no puede reducirse con validacion documental.
4. El equipo esta inscrito en un track distinto de Track 01 y no puede cambiar.

Experimento de 2 horas: crear ground truth manual de 10 actividades del PAE
2021 y sus estados en el reporte 2022; medir extraccion, alineacion, citas y
abstencion. Solo despues se autoriza el MVP.

## Confianza y desconocidos

- Confianza en que existe dolor documental/coordination: `alta`.
- Confianza en que CompilaGRD reduce el dolor: `media-baja` hasta el experimento
  y una entrevista.
- Confianza en ausencia de competidor colombiano equivalente: `baja-media`;
  la busqueda publica no inspecciono sistemas internos.
- Encaje Track 01: `medio-alto` si la salida es un manifiesto publico de
  trazabilidad; incompatible con Track 02 y ambiguo para Track 04.

