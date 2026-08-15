# Prompt de revision independiente para Claude Code

Actua como revisor adversarial de producto para una hackathon colombiana de
gestion del riesgo. No asumas que la hipotesis de Codex es correcta. Puedes
consultar fuentes publicas, pero distingue evidencia de practica, documentos
aspiracionales, inferencias y ausencia no demostrada.

## Pregunta

¿Cual necesidad concreta y desatendida dentro de la gestion del riesgo de
desastres en Colombia puede originar un producto de IA diferencial, demostrable
en 60 segundos y construible en 18-24 horas, sin automatizar decisiones de
seguridad humana o autoridad publica?

## Hipotesis que debes intentar refutar

1. `Memoria operativa / Replay GRD`: antes de una decision de recuperacion, un
   equipo carga o estructura una alternativa; el producto recupera precedentes
   colombianos, representa dependencias y bloqueos como grafo y ejecuta un
   pre-mortem trazable. No es un repositorio ni un chatbot.
2. `Integridad semantica del PAE`: contrasta compromisos, responsables,
   cronogramas, presupuesto y contratos para hallar orfandades y contradicciones.
3. `Pre-mortem de interdependencias`: prueba secuencias de recuperacion de
   servicios esenciales y revela cascadas.

## Evidencia inicial, no vinculante

- La evaluacion DNP del SNGRD (2018) encontro que instrumentos se volvieron fin,
  no medio; faltaba detalle local, evaluacion sistematica de alternativas y
  materializacion en inversiones.
- La OCDE reporto que Colombia no tenia mecanismos institucionalizados para
  extraer y retroalimentar lecciones de operaciones de respuesta.
- El libro UNGRD `Lecciones aprendidas de recuperacion posdesastre` (2024), con
  13 casos, concluye que hacen falta metodologia e instrumentos para compilar
  componentes tecnicos, juridicos, sociales y financieros en un sistema
  posdesastre disponible para aprender de otros.
- El SNIGRD fue lanzado en mayo de 2026 e integra mapas de riesgo, historicos de
  emergencias, inversiones, maquinaria y capacidades. Puede invalidar ideas de
  integracion de datos, aunque su anuncio no describe memoria de decisiones.
- Circulares UNGRD 035 y 045 de 2026 ya exigen matrices y una herramienta
  tecnologica para seguimiento de contratos y planes; esto debilita un tracker
  generico de PAE.
- Providencia y Mocoa muestran problemas recientes de planes incompletos,
  retrasos y seguimiento fragmentado.
- Soluciones globales como FEMA continuous improvement, IRP y AHA ya cubren
  partes del aprendizaje y simulacion; no se puede alegar novedad mundial.

## Entrega obligatoria

Devuelve en espanol y de forma compacta:

1. La tesis mas fuerte contra `Replay GRD`.
2. Evidencia nueva que confirme o refute que el problema sigue abierto en 2026,
   con URL y fecha cuando sea posible.
3. Una tabla de maximo cinco oportunidades con: usuario/momento, dolor probado,
   oferta existente, aporte indispensable de IA, demo de 60 s, riesgo fatal y
   veredicto.
4. Tu ganador independiente, aunque sea `ninguno`, y por que supera a los otros.
5. Tres falsadores concretos que obligarian a abandonar al ganador.
6. El experimento de 2 horas y el prototipo de 24 horas que reducirian mas la
   incertidumbre.
7. Señala expresamente cualquier afirmacion que no pudiste verificar.

No redactes marketing. No confundas una obligacion legal con prueba de dolor,
ni ausencia en Google con ausencia real. No edites archivos.
