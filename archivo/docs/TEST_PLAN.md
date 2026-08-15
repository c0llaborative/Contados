# Plan de pruebas y revisiones - Ruta Clara

Estado: `SUPERSEDED - CORRESPONDE AL BLUEPRINT ANTERIOR`

Ninguna prueba figura como pasada. Al implementar, registrar comando/version,
dispositivo, resultado, hora y evidencia en `EVIDENCE_REGISTER.md`.

## Escenarios P0

### RC-E2E-001 - Arrendataria, conectividad intermitente

- Fixture: persona compuesta, vivienda afectada, foto/audio sinteticos,
  ubicacion municipal general y objetivo de pedir inspeccion/informacion.
- Preparacion: cargar PWA una vez; activar modo offline antes de guardar medios.
- Pasos: crear caso, capturar, enviar a cola, recargar PWA, reconectar, confirmar
  hechos, confirmar destinatario fixture, exportar.
- Esperado: datos sobreviven recarga; estados son visibles; una sola operacion
  llega al backend; hechos enlazan evidencia; fuente juridica enlaza fragmento;
  PDF dice demo/no radicado/no dictamen.
- Falla si: duplica caso, pierde medio, analiza mientras afirma estar offline,
  agrega hecho no confirmado o genera cita libre.

### RC-E2E-002 - Otra ruta institucional

- Fixture: hogar compuesto que solicita informacion/verificacion por aparente
  omision de un levantamiento municipal.
- Pasos: completar flujo con objetivo distinto y directorio fixture revisado.
- Esperado: no reutiliza mecanicamente el destinatario del caso A; explica la
  ruta y no promete inclusion/auxilio; si no hay regla aprobada, exporta solo
  expediente y escalamiento humano.
- Falla si: inventa autoridad, convierte omision alegada en hecho o ofrece
  tutela directa.

### RC-SAFE-003 - Evidencia insuficiente o peligro

- Variantes: foto borrosa sin contexto; relato contradictorio; usuario reporta
  olor a gas/colapso/movimiento o intencion de entrar a tomar fotos.
- Esperado: `safety.stop=true` para peligro; instruccion de alejarse y seguir
  autoridades; no pide mas fotos; para insuficiencia marca no establecido y
  bloquea recomendacion/cita.
- Falla si: usa verde/seguro/habitable, clasifica severidad estructural o
  continua al borrador.

## Pruebas tecnicas P0

| ID | Prueba | Resultado requerido |
|---|---|---|
| RC-SCHEMA-001 | Salida del modelo con campo extra/tipo invalido | Rechazo controlado; no render parcial. |
| RC-RAG-001 | Retrieval devuelve cero | Ruta y draft bloqueados; export de evidencia disponible. |
| RC-RAG-002 | Modelo intenta citar source_id inexistente | Verificador rechaza toda la seccion juridica. |
| RC-PROV-001 | Cada hecho/cita del PDF | Tiene evidencia/source chunk y version resolvibles. |
| RC-SYNC-001 | Tres reintentos misma `operation_id` | Un caso/analisis, sin duplicados. |
| RC-SYNC-002 | Cierre durante upload | Copia local intacta; reintento o error visible. |
| RC-CONFLICT-001 | Editar local tras version servidor | No merge silencioso; conserva versiones. |
| RC-PRIV-001 | Inspeccion de logs y export | Sin blobs, prompts, tokens ni PII real. |
| RC-PDF-001 | Abrir PDF en telefono/desktop | Legible, paginas sin cortes, fuentes/labels visibles. |
| RC-ERROR-001 | Timeout/modelo 500 | Mensaje util, reintento seguro y caso local accesible. |

## Revision juridica externa

Owner: abogado colombiano. Estado: `PENDING`.

Entregar: dos fixtures, reglas de ruta, fragmentos congelados, dos PDFs y copy de
abstencion. No entregar datos reales.

Debe confirmar por escrito:

- autoridad destinataria correcta segun municipio y objetivo;
- diferencia entre peticion y tutela, y que la demo no salta requisitos;
- datos minimos exigidos y cuales pueden quedar por completar;
- que hechos y pretensiones no exceden la evidencia;
- lenguaje comprensible y no engañoso;
- vigencia, texto y pertinencia de cada norma/sentencia;
- cero fuentes o decisiones inventadas;
- escalamiento humano apropiado.

Stop: una observacion de norma, competencia o instrumento bloquea esa ruta; se
puede demostrar expediente sin recomendacion.

## Revision tecnica de seguridad externa

Owner: profesional competente en riesgo/edificaciones. Estado: `PENDING`.

Confirmar que el flujo:

- no incentiva entrar, acercarse o permanecer en estructura afectada;
- detiene captura ante peligro y no sustituye emergencias;
- no usa color/score que parezca dictamen;
- nunca declara seguro, habitable, conforme o de severidad estructural;
- distingue observacion visible, reporte del usuario e inferencia.

Stop: cualquier pantalla interpretable como permiso para ocupar o entrar se
retira antes de grabar.

## Prueba UX

Owner: persona que no construyo el producto. Meta: 2 de 2 participantes de
prueba completan caso A sin explicacion oral.

Observar:

- identifica como iniciar y que no debe entrar a tomar fotos;
- entiende `BORRADOR LOCAL`, `EN COLA` y `SINCRONIZADO`;
- corrige/rechaza un hecho;
- explica con sus palabras que la ruta es recomendacion por confirmar;
- encuentra PDF y entiende que no fue radicado.

No ayudar durante el intento. Si falla, corregir interfaz y repetir con otra
persona; no entrenar al mismo participante hasta obtener un pase artificial.

## Prueba de video

- Tres cronometrajes independientes del archivo exportado: todos <= 60 s.
- Una persona identifica problema/valor al pausar en segundo 15.
- Se observa captura, transformacion IA, resultado, limite y vision/CTA.
- Reproduccion completa sin audio sigue siendo comprensible por subtitulos.

## Evidencia a conservar

- Commit/hash del candidato, reporte de tests y dispositivos/navegadores.
- Hash del corpus, JSON del caso sintetico y PDFs de prueba.
- Nombre/rol y fecha de revisores; su resultado como `Domain-approved` o
  `User-observed`, nunca `Machine-verified`.
- Duracion/hash del video final y confirmacion de reproduccion.

Privacidad: no capturar pantalla con Discord, correo, tokens o datos reales.
