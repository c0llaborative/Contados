# Matriz de decision - CTW 2026

Estado: `HISTORICAL - DECISION REABIERTA EL 2026-08-15; NO IMPLEMENTAR`

> Esta matriz conserva la decision anterior para auditoria. Fue reabierta
> porque el equipo no encontro diferenciacion ni valor operacional suficientes.
> `docs/PLAN.md` controla el estado actual.

## Resultado

Gana **Ruta Clara, Track 02**, con 93/100 y cuatro gates aprobados.
**Reconstruccion Visible, Track 01**, es el retador con 87/100. La diferencia de
seis puntos es material para un sprint de 24 horas: Ruta Clara necesita menos
integraciones, tiene un antes/despues mas visible y permite demostrar la IA con
un caso autocontenido en el telefono.

## Metodo

Cada criterio recibe puntos directos hasta su maximo oficial. No se agregan
criterios ni bonificaciones:

- Impacto publico: 25.
- Uso real de IA: 25.
- Demo funcional: 20.
- Viabilidad y escala: 15.
- Ejecucion tecnica y UX: 15.

Antes de ser elegible, un concepto debe aprobar cuatro gates:

- G1: encaje inequivoco con el track.
- G2: historia demostrable en 60 segundos.
- G3: MVP construible antes del deadline.
- G4: seguridad juridica/estructural defendible con limites visibles.

Los puntajes son una decision de producto trazable, no una prediccion del
puntaje real del jurado.

## Matriz final

| # | Concepto / track | Impacto /25 | IA /25 | Demo /20 | Viabilidad /15 | Tecnica + UX /15 | Total /100 | G1 | G2 | G3 | G4 | Elegible |
|---:|---|---:|---:|---:|---:|---:|---:|:---:|:---:|:---:|:---:|:---:|
| 1 | Ruta Clara / T02 | 23 | 24 | 19 | 13 | 14 | **93** | P | P | P | P | Si |
| 2 | Reconstruccion Visible / T01 | 24 | 20 | 18 | 12 | 13 | **87** | P | P | P | P | Si |
| 3 | Campo Responde / T04 | 22 | 19 | 17 | 13 | 13 | **84** | P | P | P | P | Si |
| 4 | Guardianes del Territorio / T03 | 19 | 18 | 16 | 12 | 13 | **78** | P | P | P | P | Si |
| 5 | Triage estructural offline / T04 candidato | 22 | 23 | 17 | 12 | 11 | **85** | F | P | P | F | No |
| 6 | Superapp pre/post desastre / multi-track | 23 | 18 | 8 | 5 | 7 | **61** | F | F | F | F | No |

Comprobacion: cada fila suma sus cinco columnas; los maximos suman 100.

## Evidencia y razon por concepto

### 1. Ruta Clara - seleccionada

- Impacto 23: resuelve una barrera concreta de Track 02 para una persona sin
  abogado: convertir hechos y evidencia en una siguiente accion comprensible.
  Pierde dos puntos porque el impacto real depende de que la ruta sea correcta y
  de que una entidad responda.
- IA 24: multimodalidad, extraccion estructurada, deteccion de faltantes,
  recuperacion juridica y redaccion explicada forman el nucleo. Pierde un punto
  porque la ruta final requiere reglas y revision humana, no solo modelo.
- Demo 19: el antes/despues se ve en un unico telefono y puede usarse un corpus
  congelado. El punto pendiente es latencia real.
- Viabilidad 13: la captura y exportacion escalan sin integraciones; operacion
  real exige mantenimiento legal, privacidad y alianzas institucionales.
- Tecnica/UX 14: cinco momentos, PWA y procedencia visible. El cifrado y sync
  robustos son riesgos en 24 horas.
- Gates: todos pasan si se respetan recuperacion obligatoria, abstencion,
  destinatario confirmable y cero radicacion automatica.

### 2. Reconstruccion Visible - retador

- Impacto 24: transparencia de ayudas, contratos y avance es directamente Track
  01 y de alto valor civico.
- IA 20: puede conciliar entidades, montos, hitos y evidencia, pero buena parte
  del valor inicial puede parecer un dashboard con reglas.
- Demo 18: una brecha contractual es visual; requiere fixtures SECOP/ayudas para
  ser estable.
- Viabilidad 12: escala por municipio, pero sufre calidad, identificadores y
  disponibilidad heterogenea de fuentes.
- Tecnica/UX 13: visualmente fuerte; pipeline y explicacion de falsos positivos
  elevan la complejidad.
- Desempate perdido: mayor dependencia externa y menor control de una historia
  movil autocontenida.

### 3. Campo Responde

- Impacto 22: perdida productiva y priorizacion de recuperacion encajan en Track
  04.
- IA 19: estructura evidencia y podria estimar categorias, pero una priorizacion
  responsable necesita datos agronomicos y criterios de politica no disponibles.
- Demo 17, viabilidad 13, tecnica/UX 13: flujo movil claro y escalable, con mayor
  carga de datos y validacion sectorial que Ruta Clara.
- Descarte: no falla gates, pero no gana en IA demostrable ni control de
  dependencias.

### 4. Guardianes del Territorio

- Impacto 19: fortalece habilidades y preparacion, pero demostrar impacto
  medible en una demo es mas indirecto que los finalistas.
- IA 18: co-creacion y retroalimentacion de planes puede ser util, pero corre el
  riesgo de verse como tutor generico.
- Demo 16, viabilidad 12, tecnica/UX 13: construible, aunque la prueba de cambio
  educativo exige seguimiento posterior.
- Descarte: aprueba gates pero pierde claridad del antes/despues y fuerza del
  nucleo de IA.

### 5. Triage estructural offline

- Puntaje previo a gates 85: la imagen y priorizacion producen una demo fuerte.
- G1 falla: la relacion con Track 04 es defendible, pero no inequivoca frente al
  texto centrado en clima, comunidad y pequenos productores.
- G4 falla: en 24 horas no se puede validar que una clasificacion visual no
  induzca decisiones peligrosas. FEMA P-2055 y la iniciativa UNGRD tratan la
  evaluacion post-desastre como practica y capacidad tecnica; no validan un
  dictamen autonomo por IA.
- Descarte: el riesgo de que el usuario interprete prioridad como seguridad no
  se compensa con un disclaimer.

### 6. Superapp pre/post desastre

- Falla G1 por mezclar tracks, G2 por no tener una transformacion unica, G3 por
  demasiados flujos e integraciones y G4 por combinar alertas, rutas legales y
  evaluaciones con autoridades confusas.
- Se conserva como referencia negativa: 61/100 muestra que amplitud no equivale
  a ejecucion.

## Comparacion competitiva

| Categoria | Producto revisado | Lo que ya demuestra su descripcion publica | Implicacion para Ruta Clara |
|---|---|---|---|
| Captura de campo | ArcGIS Survey123 | Formularios, GPS, fotos, audio, offline y sync | Camara/offline no son diferenciador. |
| Evaluacion de danos | Futurity | Formularios, fotos/documentos, GIS, offline, sync y dashboards | Captura post-desastre tampoco basta. |
| Orientacion publica | LegalApp (MinJusticia) | Acceso institucional a informacion y rutas juridicas | Una lista de tramites no basta. |
| Generacion legal IA | Tutelas y Peticiones | Promete generar peticiones/tutelas con IA y jurisprudencia | Un generador de documentos es categoria existente. |
| Asistente para abogados | Doctor Peralta | Consulta, analisis y documentos juridicos | Chat y redaccion generica no diferencian. |

La comparacion no afirma que ningun competidor tenga capacidades adicionales;
se limita a sus descripciones publicas revisadas el 2026-08-15.

## Diferenciacion elegida

La demo debe unir en un solo resultado:

`evidencia cruda -> hechos trazables -> faltantes/incertidumbre -> ruta explicada
-> borrador con citas recuperadas -> expediente exportable con procedencia`.

No es un chatbot: cada afirmacion importante permite volver a la evidencia o a
la fuente juridica que la sustenta. El usuario confirma hechos y destinatario
antes de exportar.

## Riesgos decisivos

| Riesgo | Prob. | Severidad | Control de MVP | Stop condition |
|---|:---:|:---:|---|---|
| Cita inventada o desactualizada | M | Alta | Corpus allowlist; cita solo desde retrieval; fixture de demo | Si no hay fuente, no hay recomendacion ni borrador. |
| Autoridad incorrecta | M | Alta | Municipio y destinatario confirmables; etiqueta pendiente | Si no se confirma competencia, exportar solo expediente. |
| Usuario confunde senal visible con dictamen | M | Critica | No clasificar seguridad; advertencia antes de captura | Peligro inmediato: salir/alejarse y acudir a emergencias. |
| Perdida o duplicacion offline | M | Alta | IDs idempotentes, estados visibles, export local | No borrar local hasta ACK y verificacion de hash. |
| Exposicion de datos | M | Alta | Caso sintetico; minimizacion; no logs de medios | Cualquier dato real bloquea demo compartida. |
| Latencia del modelo | M | Media | Fixture reversible y expediente util sin analisis | A H+4, activar modo demo con respuesta prevalidada. |

## Decision

Construir Ruta Clara en Track 02. No incorporar dashboard de Track 01, triage
estructural ni superapp al MVP. Si sobra tiempo, mejorar claridad, procedencia y
resiliencia offline antes de agregar funciones.
