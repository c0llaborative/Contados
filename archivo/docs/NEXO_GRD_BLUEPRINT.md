# Nexo GRD - blueprint propuesto

Estado: `SUPERSEDED - NO IMPLEMENTAR; VER COMPILAGRD_BLUEPRINT.md`

## Producto en una frase

Nexo GRD convierte reportes incompatibles de respuesta en un grafo verificable
de afectaciones, conflictos y vacios para que la recuperacion no empiece desde
cero.

## Usuario, trabajo y momento

- **Usuario primario:** responsable de informacion o planeacion en CMGRD,
  CDGRD o sala de crisis.
- **Trabajo:** construir una version comun y revisable de “que ocurrio, a quien,
  donde y segun que fuente” sin conciliar manualmente cientos de filas.
- **Momento:** cierre de cortes de respuesta y preparacion del insumo para
  EDANPRI/PAE.
- **Diferenciador:** resolucion de entidades y afirmaciones entre instrumentos
  colombianos, con procedencia y revision humana. No es chat, captura ni gestor
  de ayudas.

## Un recorrido de cuatro momentos

1. **Cargar un corte:** tres archivos sinteticos preseleccionados o por
   arrastrar; la interfaz muestra esquema, fecha y fuente declarada.
2. **Ver el nexo:** un grafo agrupa registros probablemente equivalentes y
   separa verificados, conflictos y sin correspondencia.
3. **Resolver excepciones:** el analista compara campos y fuentes, acepta,
   rechaza o mantiene en revision; debe indicar motivo.
4. **Entregar continuidad:** exporta JSON/CSV con entidades conciliadas,
   conflictos pendientes, fuentes y bitacora de decisiones.

## Nucleo de IA

### Entradas del MVP

- Un CSV tipo RUD: hogar, personas, contacto ficticio, municipio, vereda,
  coordenadas aproximadas y afectacion declarada.
- Un CSV tipo EDAN: ubicacion, categoria de daño/necesidad, cantidad, fecha y
  equipo reportante.
- Un CSV sectorial: ubicacion, activo/servicio, estado, cantidad, fecha y
  fuente.

Los fixtures son sinteticos; no afirman replicar formatos oficiales completos.

### Pipeline

1. **Mapeo semantico de columnas:** un modelo propone correspondencias al
   esquema canonico. Las propuestas quedan visibles y congeladas para la demo.
2. **Generacion de candidatos:** reglas deterministas reducen comparaciones por
   municipio, proximidad geografica, tokens normalizados y ventana temporal.
3. **Resolucion de entidades:** el modelo compara candidatos y devuelve JSON
   estricto con `decision_propuesta`, `confianza`, `factores_a_favor`,
   `factores_en_contra` y referencias a campos.
4. **Conciliacion de afirmaciones:** diferencias de cantidad, categoria o estado
   se conservan como afirmaciones paralelas; nunca se inventa un valor ganador.
5. **Revision humana:** solo una aceptacion registrada crea el nexo definitivo.

### Abstencion

- Confianza inferior al umbral: `REQUIERE_REVISION`.
- Fuentes insuficientes o incompatibles: conservar ambas afirmaciones.
- Ubicacion ambigua: no geocodificar ni fusionar automaticamente.
- Ningun resultado decide elegibilidad, prioridad final, entrega o asignacion.

## Contrato de datos minimo

| Objeto | Campos esenciales |
|---|---|
| `SourceRecord` | id, source, source_row, captured_at, raw_fields_hash |
| `Entity` | id, entity_type, normalized_location, status |
| `Claim` | id, entity_id, predicate, value, unit, source_record_id |
| `MatchProposal` | left_id, right_id, confidence, supporting_fields, conflicting_fields, status |
| `ReviewDecision` | proposal_id, action, reason, reviewer_alias, timestamp |

Invariante: toda afirmacion visible debe volver a por lo menos un
`SourceRecord`; una decision humana nunca sobrescribe la evidencia original.

## Interfaz del corte de 24 horas

- Encabezado con nombre del incidente sintetico, fuentes y estado del proceso.
- Resumen con conteos: conciliados, conflictos, sin correspondencia y
  pendientes.
- Grafo simple o matriz de tres columnas por fuente; no se necesita mapa para
  probar el valor.
- Panel lateral con comparacion campo a campo, confianza y factores.
- Acciones `Confirmar nexo`, `No son la misma entidad`, `Mantener en revision`.
- Export y bitacora descargables.

## Arquitectura minima

`React/PWA -> API de orquestacion -> normalizador + candidate matcher -> modelo
con salida JSON -> base local/SQLite -> export JSON/CSV`.

- El navegador conserva solo el incidente sintetico de demo.
- El matcher determinista y fixtures permiten una ruta de recuperacion si el
  modelo falla.
- La API registra hash de entrada, version de prompt/modelo y decision humana.
- No hay autenticacion, integracion oficial, nube de produccion ni PII en el
  corte de hackathon.

## Must / Should / Could propuesto

### Must

- Tres fixtures incompatibles con cuatro casos sembrados: match claro, match
  ambiguo, contradiccion y registro sin correspondencia.
- Ingesta y esquema canonico.
- Propuestas estructuradas de matching con factores y confianza.
- Revision humana y bitacora inmutable durante la sesion.
- Vista de procedencia y export JSON/CSV.
- Modo fixture reproducible si falla el modelo.

### Should

- Grafo visual animado al aparecer nexos.
- Filtros por municipio/categoria/estado.
- Comparacion de dos cortes temporales.
- Persistencia local tras recargar.

### Could

- Mapa, importador configurable y export de campos sugeridos para EDANPRI.
- Compartir un paquete cifrado entre operadores.

Fuera del MVP: captura de campo, asignacion de ayudas, scoring de personas,
alertas publicas, radicacion, reemplazo de EDAN/RUD, integracion institucional y
datos reales.

## Aceptacion tecnica antes del video

1. Los cuatro casos sembrados producen el estado esperado en una ejecucion
   limpia.
2. Un match ambiguo no se exporta como confirmado sin accion humana.
3. Cada claim permite abrir fuente, fila y campos originales.
4. El export conserva conflictos y bitacora; no aplana incertidumbre.
5. El modo de recuperacion funciona sin llamada al modelo.
6. La demo completa dura 55 segundos o menos y muestra valor antes del segundo
   15.

## Fallo y recuperacion

- Si el modelo no responde, cargar propuestas precomputadas identificadas como
  fixture; la conciliacion manual y procedencia siguen operativas.
- Si un archivo no mapea, no descartar filas: mostrarlo como fuente no procesada
  y permitir descargar diagnostico.
- Si falla persistencia, conservar los archivos originales y exportar la
  bitacora de la sesion antes de recargar.
- Si aparece PII real, detener, no subir ni grabar, eliminarla del conjunto de
  trabajo mediante un procedimiento aprobado y volver a fixtures sinteticos.

## Preguntas que requieren validacion externa

- ¿Quien realiza hoy esta conciliacion y con que archivos?
- ¿Que identificadores sobreviven entre EDAN, RUD, reportes sectoriales y
  recuperacion?
- ¿Cual error cuesta mas: duplicado, omision, contradiccion o desactualizacion?
- ¿Que salida puede consumirse sin modificar sistemas oficiales?
- ¿Track 01 acepta una herramienta institucional de trazabilidad cuya demo no
  expone datos personales al publico?
