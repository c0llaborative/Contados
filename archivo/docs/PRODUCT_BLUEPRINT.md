# Blueprint - Ruta Clara

Estado: `SUPERSEDED - NO CONSTRUIR; DECISION REABIERTA EL 2026-08-15`

> Se conserva como referencia historica. El equipo considero insuficiente su
> diferenciacion frente a asistentes que reciben archivos y devuelven texto.
> `docs/PLAN.md` controla el rediseño actual.

## Definicion del producto

**Frase:** Ruta Clara convierte fotos, voz y documentos de una afectacion
post-desastre en un expediente trazable, muestra que falta y propone una ruta
institucional con un borrador sustentado, sin inventar citas ni emitir
dictamenes estructurales.

**Usuario primario:** persona adulta afectada o arrendataria de una vivienda,
con conectividad intermitente, sin abogado y con evidencia dispersa en el
telefono.

**Trabajo que necesita resolver:** "Ayudame a organizar lo que paso, entender
que puedo hacer ahora y preparar algo verificable para pedir atencion, sin
exponerme ni aprender lenguaje juridico".

**Momento de uso:** despues de estar fuera de peligro inmediato y antes de
solicitar inspeccion, informacion o apoyo ante la entidad correspondiente.

**Diferenciador:** no entrega una respuesta de chat aislada. Construye una
cadena auditable donde cada hecho vuelve a una evidencia y cada fundamento
juridico vuelve a un fragmento de una fuente oficial aprobada.

## Promesa y limite

Ruta Clara ayuda a **documentar y preparar**. No confirma derechos, no predice
decisiones, no sustituye abogado, no radica, no inspecciona una edificacion y no
afirma que sea segura, habitable o conforme a norma.

La primera pantalla siempre muestra:

> Si hay riesgo, lesion, olor a gas, incendio, cables expuestos, movimiento o
> colapso, alejese y siga a las autoridades de emergencia. No entre para tomar
> fotos. Ruta Clara no evalua si un lugar es seguro.

El numero/canal de emergencia solo se muestra si ha sido verificado para la
ubicacion y fecha del demo; de lo contrario se usa "autoridad local de
emergencias" y no se inventa un contacto.

## Recorrido unico - cinco momentos

### 1. Iniciar caso

- Elegir ubicacion general, relacion con el inmueble y objetivo en lenguaje
  simple.
- Aceptar uso de caso sintetico en demo y ver limites.
- Si reporta peligro inmediato, detener el flujo y mostrar salida segura.
- Resultado: `case_id`, objetivo y estado `BORRADOR LOCAL`.

### 2. Capturar evidencia guiada

- Foto desde distancia segura o archivo existente; audio corto; documento
  opcional.
- Guia: que ocurrio, cuando, donde, a quien aviso y que respuesta recibio.
- Cada pieza recibe ID, hora declarada/capturada, origen, hash y nota del
  usuario. No se exige volver a la estructura.
- Offline: todo queda local y se ve "Guardado en este dispositivo".

### 3. Entender hallazgos e incertidumbre

- IA propone hechos atomicos: confirmado por usuario, visible en evidencia o
  no establecido.
- El usuario corrige/acepta cada hecho. Una foto nunca prueba causa, propiedad,
  seguridad ni responsabilidad.
- Se muestran faltantes y confianza de extraccion, no "probabilidad de ganar".

### 4. Recibir ruta recomendada

- Motor acotado combina hechos confirmados, reglas revisadas y recuperacion del
  corpus.
- Muestra: objetivo, destinatario por confirmar, por que esta ruta, documentos
  faltantes, alternativa humana y fuentes.
- Si no hay soporte o competencia clara: "No podemos recomendar una ruta con
  suficiente sustento" y exportacion del expediente solamente.

### 5. Exportar o compartir

- Vista previa de expediente y borrador; casillas para confirmar hechos y
  destinatario.
- PDF contiene evidencia listada, hechos confirmados, incertidumbres, fuente y
  version de cada cita, limites y procedencia.
- MVP descarga/compartir nativo si el dispositivo lo permite. No envia ni
  radica ante una entidad.

## Nucleo de IA

### Entradas

- Fotos/archivos existentes, audio, documentos y metadatos de captura.
- Respuestas del formulario y correcciones del usuario.
- Ubicacion general, nunca geolocalizacion precisa obligatoria.
- Fragmentos recuperados exclusivamente del corpus allowlist versionado.
- Reglas de ruta aprobadas para los dos escenarios de demo.

### Pipeline

1. **Ingesta:** valida tipo/tamano, calcula hash y elimina metadatos no
   necesarios de copias enviadas.
2. **Extraccion multimodal:** transcribe y propone observaciones atomicas.
3. **Normalizacion:** separa `user_reported`, `visible`, `document_text` e
   `inferred`; las inferencias no entran como hechos confirmados.
4. **Chequeo de completitud:** detecta campos necesarios y contradicciones.
5. **Recuperacion juridica:** busca solo en allowlist y devuelve fragmentos con
   `source_id`, URL, version y hash.
6. **Seleccion de ruta:** reglas deterministas primero; el modelo explica, no
   inventa competencia.
7. **Redaccion:** genera solo desde hechos confirmados y citas recuperadas.
8. **Verificacion:** rechaza citas sin fragmento, hechos sin procedencia y
   destinatarios no confirmados.

### Contrato de salida

```json
{
  "case_id": "case_demo_01",
  "extraction": [
    {
      "statement": "El usuario reporta dano posterior al evento",
      "kind": "user_reported",
      "evidence_ids": ["ev_audio_01"],
      "confidence": 0.94,
      "user_confirmed": true
    }
  ],
  "missing": ["destinatario_competente_confirmado"],
  "safety": {"stop": false, "reasons": []},
  "route": {
    "status": "needs_confirmation",
    "instrument": "peticion",
    "recipient": null,
    "rationale": "Solicitar inspeccion oficial e informacion de ayudas",
    "source_chunks": ["ley1755-art13-v1"]
  },
  "draft": {"status": "blocked", "reason": "recipient_unconfirmed"},
  "model_trace": {"pipeline_version": "demo-v1", "corpus_version": "ctw-v1"}
}
```

En implementacion el JSON se valida con schema y `additionalProperties: false`.

### Confianza, explicacion y abstencion

- Confianza aplica a extraccion/transcripcion por campo. No mide certeza
  juridica, riesgo estructural ni probabilidad de exito.
- Umbral inicial de demo: bajo `0.75`, pedir confirmacion o marcar no
  establecido. Es un parametro de UX, no validacion cientifica.
- Abstencion obligatoria si: hay peligro reportado; evidencia ilegible o
  contradictoria; no hay fragmento oficial; no se confirma destinatario; una
  cita no coincide exactamente con el fragmento; falla schema/modelo; o la
  diferencia entre rutas no supera el umbral definido por reglas.
- Escalamiento: personeria/consultorio juridico/abogado o autoridad de gestion
  del riesgo solo si el canal concreto fue verificado. En otro caso, texto
  generico sin datos de contacto.

## Corpus y citas

- Allowlist minima definida en `SOURCES.md`; nada entra por busqueda web libre.
- Cada fragmento: `source_id`, titulo, entidad, URL oficial, fecha de consulta,
  vigencia observada, texto, seccion/articulo y SHA-256.
- El modelo recibe fragmentos, no memoriza citas. El renderizador toma titulo,
  articulo y URL desde metadatos, no desde texto generado.
- Si retrieval devuelve cero resultados, el borrador juridico queda bloqueado.
- Corpus de demo congelado. Cambios requieren nueva version y nueva revision.

## PWA y comportamiento offline

La PWA se instala por QR y usa diseno movil. El service worker cachea solo el
shell de aplicacion; IndexedDB guarda casos, medios, hashes y colas. No se
promete analisis local.

Estados visibles:

`BORRADOR LOCAL -> EN COLA -> ENVIANDO -> ANALIZADO -> SINCRONIZADO`

Errores vuelven a `REQUIERE ATENCION`; nunca a un estado ambiguo.

- Captura y edicion funcionan offline.
- Analisis, RAG y PDF en servidor quedan en cola hasta recuperar conectividad.
- Cada mutacion lleva `operation_id` idempotente; reintentos no duplican casos.
- El dispositivo conserva la copia local hasta recibir ACK y comparar hash.
- Conflicto: no mezclar silenciosamente. Mostrar ambas versiones y conservar la
  local.
- El boton "Analizar" offline dice "Se analizara cuando vuelva la conexion".
- Si Web Share no existe, descargar PDF/JSON.

**Cifrado:** la interfaz de almacenamiento debe permitir cifrado con Web Crypto,
pero el equipo no puede mostrar "cifrado" hasta probarlo. Para el demo solo se
usan datos sinteticos; si el cifrado no se completa, no se admiten datos reales.

## Arquitectura minima

| Componente | Responsabilidad | Limite/invariante |
|---|---|---|
| PWA | Captura, confirmacion, estados, preview | No interpreta seguridad; offline first. |
| IndexedDB + cola | Casos, blobs, operaciones, hashes | No borrar antes de ACK verificado. |
| API de orquestacion | Autenticacion demo, validacion, idempotencia, jobs | Logs sin medios ni texto sensible. |
| Modelo multimodal | Extraccion y redaccion estructurada | Schema estricto; no controla citas/recipient. |
| RAG juridico acotado | Recuperar fragmentos allowlist | Cero resultados bloquea salida juridica. |
| Motor de rutas | Reglas aprobadas y umbrales | Destinatario requiere confirmacion. |
| Generador PDF | Expediente, borrador, fuentes, hashes | No envia ni radica. |
| Registro de procedencia | Mapea salida a evidencia/corpus/modelo | Append-only durante la sesion. |

Flujo:

`PWA/IndexedDB -> API/job -> extraccion -> confirmacion usuario -> RAG + reglas
-> redaccion/verificacion -> PDF + provenance -> PWA`

### API conceptual

- `POST /v1/cases`: crea caso sintetico; idempotency key obligatoria.
- `POST /v1/cases/{id}/evidence`: URL firmada o multipart con limite.
- `POST /v1/cases/{id}/analysis`: crea job; devuelve `202` y `job_id`.
- `PATCH /v1/cases/{id}/facts`: guarda confirmaciones con version optimista.
- `POST /v1/cases/{id}/route`: solo tras confirmacion; puede abstenerse.
- `POST /v1/cases/{id}/exports`: produce PDF/JSON; nunca radica.
- `GET /v1/jobs/{id}`: estado y error seguro.

Para la hackathon pueden fusionarse endpoints, pero no sus invariantes.

### Modelo de datos minimo

- `Case`: id, objetivo, ubicacion general, relacion, estado, version.
- `Evidence`: id, case_id, tipo, blob/local_ref, hash, origen, timestamps.
- `Fact`: statement, kind, evidence_ids, confidence, user_confirmed.
- `SourceChunk`: corpus_version, source_id, articulo/seccion, URL, hash.
- `Route`: status, instrument, recipient, rationale, source_ids, review_state.
- `Export`: id, case_version, hashes, generated_at, disclaimer_version.
- `ProvenanceEvent`: actor, action, input_ids, output_ids, version, timestamp.

## Privacidad y seguridad

- Demo: solo personas, nombres, direcciones, documentos, fotos y audios
  sinteticos. No copiar capturas del canal al producto.
- Minimizar: ubicacion general por defecto; EXIF eliminado de la copia de nube;
  no guardar prompts/respuestas en logs.
- Separar blobs y metadatos; URLs de carga con expiracion; limites de tipo y
  tamano; nombres de archivo no confiables.
- Retencion demo: boton borrar local; backend efimero con borrado al cierre si
  se implementa. No prometer borrado si no se prueba.
- Sin analitica de terceros, publicidad ni entrenamiento con evidencia.
- PDF muestra `CASO DE DEMOSTRACION - NO RADICADO - NO ES DICTAMEN`.

## Ruta de demo propuesta - PENDIENTE DE REVISION JURIDICA

Caso A: arrendataria con vivienda afectada y conectividad intermitente. Objetivo:
pedir inspeccion oficial e informacion sobre atencion/ayudas. Ruta candidata:
peticion a la autoridad municipal competente en gestion del riesgo o vivienda,
con destinatario seleccionado desde directorio oficial y confirmado.

Caso B: hogar que afirma haber sido omitido de un registro/levantamiento de
afectacion. Objetivo: solicitar informacion, verificacion y respuesta de fondo.
Ruta candidata: peticion a la entidad municipal responsable del registro. No se
promete inclusion ni auxilio.

Tutela no se genera en el flujo principal. Solo podria aparecer como
escalamiento humano cuando exista una peticion previa, evidencia de falta o
insuficiencia de respuesta y revision juridica especifica.

## Definicion de corte vertical

En un telefono: abrir por QR, crear caso fixture, agregar foto/audio sinteticos,
ver dos hechos con procedencia y un faltante, confirmar, ver una ruta con un
fragmento oficial y exportar PDF marcado. Funciona con reconexion simulada y se
abstiene en el caso peligroso. Todo lo demas puede diferirse.
