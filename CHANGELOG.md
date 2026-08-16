# Changelog

Todas las fechas usan America/Bogota.

## 2026-08-16 — Video entregable publicado en el README

### Changed

- El enlace reservado `Video de 1 minuto` del README ahora abre el Short de
  YouTube entregado por el equipo.

### Verified

- Comprobación local del destino exacto, ausencia del marcador `#`, revisión
  del diff y `git diff --check`. El contenido y la disponibilidad del video son
  evidencia reportada por el equipo, no verificada por esta tarea.

## 2026-08-16 — La conversación deja de olvidar, y WhatsApp recibe el legal design

### Fixed

- **El seguimiento perdía la historia.** Reportado desde WhatsApp real: audio
  enviado, diagnóstico correcto, y diez minutos después un mensaje nuevo recibía
  una de las preguntas del principio. Otra vez la sospecha era Redis, y otra vez
  no era: en `conversacion.ts`, al entrar en `SEGUIMIENTO` se borraban relato,
  rondas y preguntas, así que el mensaje siguiente se clasificaba **solo**. Un
  «¿y cuánto me demoro?» suelto no alcanza para ubicar a nadie, el modelo se
  abstiene —que es lo que debe hacer— y devuelve una pregunta de apertura.
  Reproducido con el almacén **en memoria**, lo que descarta Redis y descarta el
  tiempo: el TTL es de 30 minutos y se renueva con cada mensaje.
- Ahora el relato se conserva y lo nuevo se le suma, y `preguntas` se conserva
  para no repetir lo ya preguntado. Si el paso resultante es el mismo que el
  último comunicado, se responde corto —`Sigue en: …` más qué hacer— en vez de
  soltar el bloque completo otra vez. Un riesgo ya avisado no se repite; uno
  nuevo sí aparece.

### Added

- `lib/canales/whatsapp/formato.ts`: **el legal design del simulador ahora
  también llega a WhatsApp.** El simulador reconoce cada mensaje por su prefijo
  y dibuja tarjetas; el adaptador de Meta enviaba ese mismo string tal cual, así
  que el jurado veía las tarjetas y la persona damnificada recibía párrafos
  corridos. Estaba al revés. El adaptador aplica ahora la misma lógica con lo
  que WhatsApp tiene: negrita, cursiva, saltos de línea y un riel
  `🟢🟢⚪⚪⚪ paso 2 de 5`. El núcleo no cambia — un núcleo, y cada superficie
  presenta a su manera.
- Dos reglas que no se negocian: **no se reescribe ni se resume nada**, sólo se
  separa lo que el núcleo ya distingue; y si un prefijo no coincide, el mensaje
  sale tal cual. Los círculos del riel son emoji estándar a propósito: los
  caracteres de bloque se rompen en teléfonos de gama baja, que son los de esta
  gente.

- Segunda pasada, a pedido: el legal design cubre ahora **todo** lo que sale por
  el canal. El aviso de barrio abre con `*📣 Aviso de su barrio*` —llega sin que
  la persona haya preguntado nada, así que lo primero es de dónde viene—; la
  abstención deja `_No voy a inventar un paso._` en línea propia, porque esa
  promesa sostiene el producto y estaba enterrada al final de un párrafo; y el
  mensaje de error dejó de ser una línea corrida. El simulador ganó las dos
  tarjetas que le faltaban para quedar parejo: seguimiento y aviso de barrio.
- El prefijo del aviso se movió a `lib/nucleo/schema.ts`: el simulador es un
  componente de cliente y no puede arrastrar el clasificador ni el almacén sólo
  para leer una constante.

### Verified

- `npm test` 28/28, `npx tsc --noEmit` exit 0, `npm run build` exit 0 con 11
  rutas. Seis pruebas nuevas, todas fallarían con el código anterior. El render
  se comprobó contra la ruta real de Manizales. Evidencia **EV-037**.

### Not verified

- El legal design de WhatsApp **no se ha validado con nadie ajeno al equipo**.
  `EXT-UX-003` sigue pendiente.

## 2026-08-16 — Por qué un teléfono no recibía nada

### Fixed

- `lib/canales/whatsapp/saliente.ts`: el adaptador lanzaba
  `Meta rechazó el envío (400)` y **descartaba el cuerpo de la respuesta**, que es
  donde Meta pone el código real. En el log, la lista de destinatarios (`131030`),
  la ventana de 24 h (`131047`) y un cuerpo mal formado se veían idénticos. Ahora
  hay un `ErrorEnvioMeta` que conserva estado HTTP y código. El teléfono de
  destino sigue sin aparecer en el error, que va al log.
- `app/api/whatsapp/route.ts`: cuando lo que fallaba era la **entrega**, el
  webhook intentaba mandar un mensaje de disculpa por el mismo canal. Volvía a
  fallar igual y dejaba dos líneas de error confusas. Ahora no se reintenta, y un
  `131030` escribe una línea que dice dónde se arregla.

### Diagnosed

- Prueba desde dos teléfonos contra producción: uno conversaba y el otro no
  recibía **nada**. La sospecha era la persistencia en Redis desplegada esa misma
  mañana. **No era Redis.** Las dos sesiones estaban vivas en Redis con TTL
  vigente, y la del teléfono que sí respondía llevaba `rondas=2`, que sólo es
  posible si la sesión sobrevivió entre mensajes servidos por instancias
  distintas — exactamente lo que fallaba antes del arreglo.
- La causa es la plataforma: el remitente es un **número de prueba** de Meta y
  sólo puede responderle a los teléfonos de su lista de destinatarios
  autorizados. Al resto, Meta le acepta el mensaje entrante —por eso el webhook
  corre y la sesión se crea— y le rechaza la respuesta con `131030`. La persona no
  ve un error: ve silencio. Confirmado con el log de las 06:06:53 y reproducido
  con una sonda dirigida a un número 555 no asignable. Evidencia sellada en
  **EV-036**.
- **No se puede arreglar desde el producto**: el único canal para avisarle a esa
  persona es el que está bloqueado. Cada teléfono que vaya a probar debe
  registrarse antes en Meta › WhatsApp › API Setup, o hay que pasar a un número de
  producción. Queda declarado en el README como límite honesto.

### Verified

- `npm test` 22/22, `npx tsc --noEmit` exit 0, `npm run build` exit 0 con 11
  rutas. La prueba nueva usa el cuerpo de error real que devolvió Meta ese día.

### Note

- El riesgo aceptado que se registró más abajo —«la consola no muestra el límite
  de destinatarios»— **se materializó**. Ahora el límite está confirmado.

## 2026-08-16 — Publicación del repositorio

### Added

- `LICENSE`: **AGPL-3.0**, texto canónico sin modificar. Se prefirió sobre MIT y
  Apache porque el producto se piensa ofrecer a entidades públicas y a
  cooperación: bajo una licencia permisiva un tercero podría cerrarlo y vendérselo
  a la misma alcaldía. La AGPL lo impide y, al ser aprobada por la OSI, mantiene
  al proyecto elegible como bien público digital.
- `NOTICE.md`: razón de la licencia, posibilidad de licenciamiento comercial
  separado, y exclusión explícita del material de terceros — los PDF oficiales de
  `archivo/evidencia-fuentes/` y el deck del evento.

### Changed

- README: estado actualizado, estructura con `docs/adr/` y `evidence/runtime/`, y
  la instrucción de credencial dejó de enseñar `export ANTHROPIC_API_KEY=...`,
  que deja el secreto en el historial del shell. Ahora apunta a `.env.local`.
- `.gitignore` raíz: cubre `.vercel/`, `.gstack/` y `*.key`.

### Verified

- `npm test` 19/19, `npx tsc --noEmit` exit 0, `npm run build` exit 0 con 10
  rutas.
- Aislamiento de secretos previo a publicar: 9 valores sensibles de `.env.local`
  contrastados contra 96 archivos del repositorio, **0 coincidencias**. Ningún
  valor se imprimió. `.env.local` ignorado y no rastreado; `.env.example` sin
  valores; `git diff --check` exit 0; 0 teléfonos y 0 identificadores tipo cédula
  en la documentación.

### Known risk

- La cuenta administradora de Meta **no tiene 2FA** y la consola del equipo no
  muestra la expiración del token temporal ni el límite de destinatarios. Se
  registra como riesgo aceptado y acotado —número de prueba, envíos apagados—, no
  como verificado. Activar 2FA es obligatorio antes de cualquier uso no
  sintético.

## 2026-08-15 — Núcleo compartido, simulador y adaptadores de WhatsApp

### Added

- `docs/IMPLEMENTACION_PASO_A_PASO.md`: runbook operativo con 12 gates,
  responsables, resultados esperados, evidencia, stop conditions y recuperación.
- Núcleo independiente de Next.js con clasificador Anthropic/OpenAI configurable,
  máquina de estados y abstención limitada a tres repreguntas.
- Simulador `/whatsapp`, webhook de Meta con verificación GET, firma HMAC del
  POST, deduplicación, hash de sesión y envío real apagado por defecto.
- Transcripción Groq en memoria, límite de 10 MB y cero archivos de audio.
- Notificación por barrio desde `/tablero`; en demo queda en el simulador y el
  envío real requiere dos compuertas de autorización.
- Agrupación por sesión tras 12 segundos de silencio, máximo ocho mensajes,
  deduplicación y reintento transaccional ante fallo del proveedor.
- Generador de petición compartido y enlace cifrado AES-256-GCM de 15 minutos,
  con recuperación segura para enlaces alterados, expirados o sin secreto.
- Transcripción Groq separada de la descarga Meta para poder probar el mismo
  flujo en memoria sin exponer una ruta pública de diagnóstico.
- Script local `scripts/probar-stt.mjs` para audio sintético, sin imprimir claves.
- Generador `setup:whatsapp-secrets` que crea cuatro secretos independientes de
  32 bytes y cancela antes de sobrescribir valores existentes.
- Suite local de cinco pruebas y `app/.env.example` sin secretos.
- ADR 0007 con comparación reproducible de Sonnet 5, GPT-4o mini, Groq y Gemini.

### Verified

- `npm test`: 19/19 pruebas pasan, incluidas agrupación, duplicados, reintentos,
  concurrencia, límites, cifrado, alteración, expiración y escape HTML.
- `npx tsc --noEmit`: exit 0.
- `npm run build`: exit 0; diez rutas, incluida `/api/peticion/[token]`.
- Anthropic `claude-sonnet-5` con `effort: medium`: P0 final 15/15 automático y
  manual; mediana 6445 ms. EV-030 conserva JSONL y SHA-256.
- Quality gate documental: 17 Markdown vigentes, 0 enlaces locales rotos, 0
  patrones de secreto en alcance, hash EV-030 coincide y `git diff --check`
  pasa; `.env.local` no está versionado.
- Chrome 412×915: `/whatsapp` y `/tablero` sin overflow horizontal, controles y
  tabla dentro del viewport, saludo visible y cero errores/warnings de consola.
- Groq `whisper-large-v3-turbo`: audio sintético español transcrito exactamente
  en 1.456 ms; diagnóstico `censo` + `arrendatario`. EV-032.
- Gate 4: cuatro secretos válidos y únicos, aislados en `.env.local`; 0 fugas,
  envíos apagados, 19/19 pruebas y build limpio. EV-033.

### Pending

- STT y Meta no se han probado y no se presentan como verificados. El P0 sólo
  cubre cinco relatos sintéticos; no demuestra desempeño con relatos reales.
- Meta continúa sin prueba real; Groq no se ha probado con voz humana ni medios
  descargados desde Meta.

## 2026-08-15 — WhatsApp primero (decision y especificacion, sin codigo)

### Added

- `docs/adr/0006-whatsapp-primero.md`: WhatsApp como canal principal del
  damnificado, con la web conservada completa para dos usuarios. Incluye la
  decision de bajar el clasificador de `claude-opus-5` a `claude-sonnet-5` y la
  eleccion de Groq `whisper-large-v3-turbo` para transcribir audio.
- `docs/WHATSAPP.md`: arquitectura del canal (un nucleo, tres superficies),
  maquina de estados conversacional con tope de tres rondas de repregunta, pasos
  concretos para encender Meta Cloud API con numero de prueba, variables de
  entorno, y las limitaciones reales del canal (ventana de servicio de 24 h,
  token temporal, 5 destinatarios, estado en memoria).
- `docs/SEGURIDAD.md` reglas 12, 13 y 14: la promesa del audio solo vale en la
  web y se enuncia acotada; el numero de telefono es dato personal y se guarda
  solo como hash con sal; el estado de conversacion es efimero y eso es la
  postura de retencion.
- `docs/PRUEBAS.md`: siete pruebas P0 del flujo conversacional (C1 a C7),
  incluyendo que «hola» no puede devolver `400`, que la repregunta se rinde
  honestamente en la ronda 4, que la estafa llega antes que el diagnostico, y que
  la notificacion desde el tablero llega solo al barrio correcto.

### Changed

- Tras consultar a un jurado del evento se adopta WhatsApp como canal principal.
  **No es un pivote**: `PRODUCTO.md` ya sostenia, citando a GOV.UK Notify, que
  habia que notificar en vez de obligar a consultar, y sin embargo tenia
  «notificaciones push reales» en fuera de alcance porque una web app no puede
  notificar. Segundo hallazgo: la abstencion obligatoria es conversacional por
  diseno y la web la estaba desperdiciando — `falta_preguntar` era una lista que
  nadie respondia.
- `docs/PLAN.md`: reescrito con el estado de dos canales, la tabla «Que vamos a
  modificar» archivo por archivo, la ruta de ejecucion de 14 horas con orden de
  corte, y cinco riesgos nuevos.
- `docs/PRODUCTO.md`: tabla de canales, recorrido de usuario de WhatsApp, y las
  notificaciones salen de «fuera de alcance» para pasar a implementarse.
- `README.md`: estado, estructura objetivo y la seccion de IA con los dos
  modelos.

### Notes

- **Nada de esto esta construido.** Todo lo nuevo queda marcado `PLANEADO`. Se
  introduce la convencion explicita `CURRENT` / `PLANEADO` en README, PLAN,
  PRODUCTO, SEGURIDAD y WHATSAPP para que ninguna afirmacion sin verificar pueda
  leerse como hecho.
- El bloqueador sigue siendo el mismo desde temprano: el clasificador nunca se ha
  ejecutado contra ningun modelo.

## 2026-08-15 — Contados (construccion)

### Added

- `app/`: aplicacion Next.js 16 + TypeScript. Rutas `/`, `/tablero`,
  `/api/diagnose`, `/api/peticion`. Build limpio, typecheck limpio.
- `lib/schema.ts`: modelo `Case` de cinco compuertas
  (reporte, censo, evaluacion tecnica, RUD, subsidio), tomado del ciclo de
  Primero/CPIMS+ (UNICEF) en vez de inventarlo. Incluye el JSON Schema estricto
  (`additionalProperties: false`) del clasificador.
- `lib/corpus.ts`: corpus normativo congelado con SHA-256 calculado al cargar.
  Ley 1755 de 2015 arts. 13 y 14; Ley 1523 de 2012 art. 4. Calculo de dias
  habiles en codigo determinista.
- `lib/rutas.ts`: ruta verificada de Manizales (punto de atencion, que llevar,
  subsidio de $300.000 para ~1.150 familias administrado por Cruz Roja Caldas).
- `lib/fixtures.ts`: 54 casos sinteticos deterministas para el tablero.
- Captura por voz con Web Speech API (`es-CO`) en el navegador; el audio no
  sale del dispositivo. Campo de texto siempre disponible como respaldo.

### Changed

- Se pivotea a **Contados** tras deep research (8 agentes, ~130 busquedas) y
  segunda opinion de Codex. Murieron con evidencia: censo ciudadano por voz
  (el RUD solo lo digita el CMGRD; ya existe Gravitas), evaluacion de danos por
  foto (ya existe SismoAyuda Colombia con ingenieros voluntarios y ATC-20),
  detector de corrupcion en SECOP (ya existen cerocorrupcion.pro y
  anticorrupcion.co), y Seguro Oculto (el hallazgo fue noticia masiva del 11 al
  14 de agosto).
- Del paquete previo se conservan solo los limites de seguridad.

### Verified

- `npx tsc --noEmit` y `npx next build`: limpios.
- `/api/peticion`: genera el oficio con destinatario de la ruta verificada, las
  dos citas literales del corpus con su SHA-256, y el vencimiento calculado en
  codigo (15-ago-2026 + 15 dias habiles = 4-sep-2026, comprobado a mano).
- Manejo de UTF-8 correcto en formData (acentos y enies).
- Ambas paginas renderizan sin errores de consola en viewport movil 412x915.

### Safety

- La pantalla 1 declara de forma permanente que **esto no registra a nadie ante
  ninguna entidad**. No se pide cedula ni datos bancarios.
- Abstencion obligatoria: si el relato no alcanza, el clasificador devuelve
  `compuerta: null` y pregunta lo que falta. Nunca inventa una compuerta.
- Cada hecho lleva la frase textual del relato que lo sustenta.
- Ninguna cita se genera con el modelo: se renderiza desde el corpus con hash.
- El agregado se rotula siempre como autorreportado, nunca como cifra oficial.
- El PDF sale marcado `BORRADOR - NO RADICADO - CASO DE DEMOSTRACION`.
- Se afirma explicitamente que no se evalua si una vivienda es segura o
  habitable.

### PENDING

- **Sin probar contra el modelo**: no habia `ANTHROPIC_API_KEY` en el entorno de
  construccion. Falta ejecutar los tres casos de prueba y la prueba de
  abstencion contra `claude-opus-5`.
- Falta grabar los tres audios sinteticos.
- Falta la prueba de falsa expectativa con una persona ajena al equipo.

## 2026-08-15

### Changed

- Ruta Clara y sus planes de implementacion pasaron a historicos/supersedidos
  por falta de diferenciacion percibida.
- La implementacion permanece bloqueada hasta que el equipo acepte una nueva
  decision y se reemplacen backlog, build plan, guion y pruebas.
- `HISTORICAL`: Nexo GRD fue la propuesta intermedia y quedo supersedida sin
  aceptacion despues de la deep research.
- CompilaGRD paso a reevaluacion por beneficio publico indirecto; se abrio
  `Funciona`, centrado en servicio operativo y dependencias verificables.
- Funciona fue reformulado tras ground truth y segunda critica de Claude: ahora
  muestra evidencia funcional fechada y contradicciones; no promete estado en
  tiempo real. ADR 0004 queda propuesto y el MVP bloqueado por un spike.

### Added

- Deep research adversarial con evidencia de practica, oferta 2026, PAE
  publicos y segunda opinion de Claude Code.
- CompilaGRD como propuesta preventiva para consolidacion/ajuste del PAE;
  blueprint y ADR 0003 pendientes de gates.
- Siete PDF oficiales nuevos preservados con hashes.

- Analisis normativo-operativo y nueva matriz de oportunidad.
- Nexo GRD como propuesta: conciliacion verificable de EDAN, RUD y reportes
  sectoriales en la transicion a recuperacion.
- Blueprint propuesto y ADR 0002, aun pendientes de aprobacion del equipo.
- Copias inmutables y hashes de Circular 031 de 2026 y borrador ENRE 2025.

### Safety

- Nexo no decide elegibilidad, prioridad, asignacion, entrega o escalamiento.
- Solo se autorizan fixtures sinteticos; quedan bloqueados datos reales,
  integraciones, despliegue y publicacion.
- El borrador ENRE se etiqueta como documento en construccion, no norma vigente.

### PENDING

- Confirmacion de Track 01 y autorizacion del experimento de 10 compromisos.
- Entrevista futura con formulador PAE antes de afirmar valor o adopcion real.
