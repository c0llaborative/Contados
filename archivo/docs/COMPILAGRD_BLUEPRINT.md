# Blueprint propuesto - CompilaGRD

Estado: `PROPOSED - NO IMPLEMENTAR SIN APROBACION Y EXPERIMENTO`

## Producto en una frase

CompilaGRD convierte aportes sectoriales de recuperacion en un grafo
verificable y bloquea compromisos incompletos o contradictorios antes de que el
PAE se convierta en la hoja de ruta oficial.

## Trabajo del usuario

Cuando una PMO recibe documentos de muchas entidades, necesita saber que cada
accion tiene identidad, responsable, horizonte, presupuesto, dependencias y
fuente, y que una actualizacion corresponde realmente a una accion del plan.

## Recorrido unico

1. Seleccionar PAE base y aporte sectorial.
2. Ver actividades extraidas con procedencia por pagina.
3. Revisar el grafo y tres clases de hallazgo: bloqueante, advertencia y dudoso.
4. Resolver solo los mapeos de baja confianza o devolver el compromiso.
5. Exportar manifiesto de compilacion y diff; nunca un certificado de
   cumplimiento.

## Contrato de IA

| Parte | Especificacion MVP |
|---|---|
| Entradas | Dos PDF publicos precargados o fixture derivado sin PII. |
| Extraccion | `actividad`, `responsable`, `apoyo`, `inicio`, `fin`, `presupuesto`, `avance`, `fuente_pagina`. |
| Alineacion | Similitud semantica con candidatos top-3 y explicacion de rasgos coincidentes. |
| Reglas | Campos minimos, fechas validas, presupuesto interpretable, dependencia con owner y fuente existente. |
| Confianza | Alta: sugerir match; media/baja: exigir revision; nunca autoaceptar. |
| Abstencion | Texto ilegible, tabla rota, empate o ausencia de evidencia. |
| Procedencia | Documento, pagina, fragmento y hash del archivo. |

El modelo no declara incumplimiento. Produce una propuesta estructurada; las
reglas emiten hallazgos documentales y una persona decide.

## Salida visual

El centro es un grafo/diff, no una conversacion. Nodos: compromiso, entidad,
presupuesto, hito, dependencia y fuente. Aristas rojas son referencias faltantes
o incompatibles; amarillas son alineaciones inciertas; verdes son campos
verificados contra la fuente.

## Arquitectura minima de 24 horas

- Frontend web responsive con caso precargado, grafo y panel de fuente.
- Backend local/API con extraccion estructurada y embeddings.
- Motor determinista de reglas y esquema JSON versionado.
- Cache de respuestas y fixture precomputado para recuperar la demo si el
  modelo o internet falla.
- Sin login, base institucional, radicacion, escritura externa ni PII.

## Must / Should / Could

### Must

- Caso oficial precargado y fixture reducido de 10 compromisos.
- Extraccion/alineacion con cita de pagina y abstencion.
- Tres hallazgos visuales y correccion humana reversible.
- Manifiesto exportable con hash de fuentes.
- Modo demo precomputado.

### Should

- Vista lado a lado del fragmento fuente.
- Filtros por entidad y tipo de error.
- Metricas del experimento visibles en una pantalla tecnica.

### Could

- Cruce con contratos SECOP.
- Versionado completo del PAE.
- Comentarios multiusuario.

## Explicitamente fuera

Ingesta abierta de cualquier PDF, PII, firma/aprobacion, seguimiento financiero
real, sanciones, ranking de entidades, prediccion de corrupcion, decisiones de
seguridad o publicacion externa.

## Plan de recuperacion

Si falla OCR/modelo, usar extraccion y matches precomputados etiquetados. Si el
experimento no alcanza el umbral, no maquillar la demo: reducir a un linter de
completitud determinista o abandonar la idea.

