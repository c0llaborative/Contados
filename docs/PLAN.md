# Plan vivo — Contados

- Estado: `PUBLICADO · GATES 0–5 CERRADOS · DESPLEGADO EN VERCEL · META CONECTADO CON LÍMITE DE DESTINATARIOS`
- Fecha de estado: 2026-08-16 06:20 (America/Bogota)
- Owner: equipo de hackathon
- **Cierre de entregas: domingo 16 a las 09:00.**
- Repositorio público: <https://github.com/c0llaborative/contados>
- **Siguiente acción exacta:** terminar el video y subirlo. El despliegue está
  hecho y el webhook de Meta está conectado; lo que queda del canal real es
  operativo: agregar a la lista de destinatarios autorizados **cada teléfono**
  que vaya a probarlo (ver la entrada del 2026-08-16 sobre `131030`). Nada de
  esto bloquea la entrega: el video se graba con el simulador y ya está
  verificado.
- Track: **02 — Justicia** (defendible también en 01; ver
  [ADR 0005](adr/0005-contados.md))
- Entregables: **repositorio** + **video de 60 segundos**.

Este documento es la fuente de verdad sobre el estado. Si algo aquí contradice
otro documento, gana este.

## HISTORICAL · alcance autorizado al iniciar esta implementación

- Fecha: 2026-08-15 (America/Bogota).
- Problema: el clasificador existe dentro de una ruta de Next.js, nunca se ha
  ejecutado contra un modelo real y no puede reutilizarse desde WhatsApp; el
  canal de Meta y las notas de voz siguen sin código.
- Alcance: extraer un núcleo compartido; implementar una conversación segura,
  simulador y contrato de Meta; agregar STT reemplazable; y preparar pruebas y
  pasos operativos. No incluye desplegar, crear cuentas, cargar saldo, aceptar
  términos ni habilitar envíos reales sin aprobación del equipo.
- Decisión provisional: evaluar `claude-sonnet-5` como clasificador primario y
  Groq `whisper-large-v3-turbo` como STT. La marca no decide: cada uno debe pasar
  los casos P0 con costo y latencia registrados. Gemini y OpenAI quedan como
  alternativas documentadas, no como dependencias simultáneas del MVP.
- Hechos verificados: Sonnet 5 ofrece JSON Schema estricto y precio introductorio
  de USD 2/10 por millón de tokens de entrada/salida hasta 2026-08-31; Groq
  publica USD 0,04 por hora para Whisper Large V3 Turbo, no usa entradas/salidas
  para entrenamiento y permite activar Zero Data Retention. La disponibilidad y
  cuota de las cuentas del equipo siguen `UNKNOWN`.
- Seguridad: no se escribirá a Meta, Vercel ni ningún proveedor; no se guardará
  audio ni teléfono crudo; secretos sólo por variables de entorno; los endpoints
  de salida real tendrán una compuerta explícita de configuración.
- Aceptación: tipos y build limpios; pruebas locales del núcleo y conversación;
  P0 del modelo real registrado por modelo/configuración; webhook verificable;
  simulador usando el mismo handler; ninguna credencial o número real en git.
- Verificación prevista: pruebas automatizadas deterministas, `npx tsc --noEmit`,
  `npm run build`, barridos de PII/lenguaje, `git diff --check` y prueba manual
  externa separada para Meta y el modelo real.
- Recuperación: desactivar el canal omitiendo `WHATSAPP_SEND_ENABLED=true`; si
  Meta falla se usa el simulador; si STT falla se conserva texto; si ningún
  modelo pasa abstención se revierte a selección manual según ADR 0005.
- Acciones externas: equipo de hackathon — crear/autorizar cuentas, guardar
  credenciales localmente, aprobar gasto mínimo, desplegar y observar mensajes
  reales. Codex — código, pruebas, documentación y checklist reproducible.

> **Convención de estados.** `CURRENT` = construido y verificado. `PLANEADO` =
> decidido y especificado, todavía sin código. Nada marcado `PLANEADO` puede
> afirmarse como hecho ante el jurado.

## El problema

Para recibir ayuda hay que atravesar cinco compuertas: Reporte → Censo →
Evaluación técnica → RUD → Subsidio. Nadie le dice a una familia en cuál está
trabada, y nadie sabe en agregado dónde se atasca la gente. La evidencia completa
está en [`EVIDENCIA.md`](EVIDENCIA.md).

## Hacia dónde vamos y por qué cambió el rumbo

Un jurado del evento nos dijo que la experiencia debería ocurrir **en WhatsApp**.
Al revisar nuestra propia documentación encontramos que **no era un pivote sino
la pieza que le faltaba a nuestra tesis**: `PRODUCTO.md` ya sostenía, citando a
GOV.UK Notify, que había que *notificar, no obligar a consultar* — y sin embargo
tenía «notificaciones push reales» en *fuera de alcance*, porque una web app no
puede notificar. WhatsApp sí.

Hay un segundo hallazgo, técnico: **la abstención obligatoria es conversacional
por diseño y la web la estaba desperdiciando.** `falta_preguntar` se pintaba como
una lista que nadie respondía; en WhatsApp es, literalmente, el siguiente
mensaje.

La decisión completa, con alternativas y consecuencias, está en el
[ADR 0006](adr/0006-whatsapp-primero.md). El diseño del canal está en
[`WHATSAPP.md`](WHATSAPP.md).

### Las cuatro decisiones que definen esta etapa

1. **WhatsApp es el canal principal del damnificado.** Define el pitch y el video.
2. **La web se conserva completa**, con dos usuarios: damnificado (`/` y
   `/whatsapp`) y coordinador municipal (`/tablero`). No se degrada a respaldo.
3. **Un núcleo, tres superficies.** El simulador `/whatsapp` invoca **el mismo
   handler** que el webhook de Meta. No hay dos implementaciones.
4. **El clasificador baja de `claude-opus-5` a `claude-sonnet-5`**, y la
   transcripción de audio usa un modelo distinto porque Claude no procesa audio.

## Qué está hecho

| Pieza | Estado | Dónde |
|---|---|---|
| Modelo de caso de 5 compuertas (Primero/CPIMS+) | `CURRENT` | `app/lib/schema.ts` |
| Clasificador con JSON Schema estricto | `CURRENT`, Sonnet 5 aprobado 15/15 en P0 sintético | `app/lib/nucleo/clasificar.ts` |
| Captura por voz en el navegador (`es-CO`) | `CURRENT` | `app/components/Captura.tsx` |
| Pantalla de compuertas + siguiente acción | `CURRENT` | `app/app/page.tsx` |
| Alerta de riesgo de exclusión | `CURRENT` | `app/app/page.tsx` |
| Ruta verificada de Manizales | `CURRENT` | `app/lib/rutas.ts` |
| Corpus normativo con SHA-256 | `CURRENT` | `app/lib/corpus.ts` |
| Derecho de petición y enlace cifrado de 15 min | `CURRENT LOCAL` y verificado | `app/lib/nucleo/peticion.ts`, `/api/peticion/[token]` |
| Tablero agregado, 54 casos sintéticos | `CURRENT` | `app/app/tablero/page.tsx` |
| Organización del repositorio (`archivo/`) | `CURRENT` | `archivo/` |
| Núcleo y clasificador Anthropic/OpenAI configurable | `CURRENT LOCAL`, Anthropic aprobado en EV-030 | `app/lib/nucleo/` |
| Conversación, agrupación y simulador | `CURRENT LOCAL`, pruebas 17/17 y visual móvil aprobada | `app/lib/nucleo/conversacion.ts`, `app/lib/canales/whatsapp/agrupar.ts`, `/whatsapp` |
| Webhook y STT | `CURRENT LOCAL`; proveedor conmutable con `STT_PROVIDER`. Gemini verificado 2026-08-16 (EV-035); Groq aprobado antes (EV-032) y hoy rechazado por su cuenta; Meta pendiente | `/api/whatsapp`, `/api/nota-voz`, `app/lib/canales/whatsapp/` |
| Notas de voz en el simulador | `CURRENT`, dos audios sintéticos transcritos de verdad | `/api/nota-voz`, `/whatsapp` |
| Aviso por barrio desde tablero | `CURRENT EN SIMULADOR`, envío real bloqueado | `/api/notificar`, `/tablero` |

## HISTORICAL · cambios que guiaron esta implementación

Nada de lo construido se bota. Lo que cambia es **dónde vive** el código y **qué
modelo** se llama.

| Archivo | Cambio | Por qué |
|---|---|---|
| `app/lib/{schema,rutas,corpus}.ts` | **Mover** a `app/lib/nucleo/` | Que WhatsApp los pueda usar sin arrastrar Next.js |
| `app/app/api/diagnose/route.ts` | **Pierde** el prompt y la llamada al modelo → `nucleo/clasificar.ts`. Queda como adaptador delgado | Hoy el prompt vive dentro de una route y WhatsApp no lo puede reutilizar |
| `nucleo/clasificar.ts` | `claude-opus-5` → **`claude-sonnet-5`**; `max_tokens` 16000 → 2000; agregar `thinking: { type: 'disabled' }` | 5–7× más barato, más rápido. En Opus 5 el thinking está encendido por defecto y lo estábamos pagando sin pedirlo |
| `app/app/api/peticion/route.ts` | **Pierde** la generación del oficio → `nucleo/peticion.ts` | Para poder mandar el enlace desde WhatsApp |
| `app/app/api/whatsapp/route.ts` | **Nuevo**: `GET` verificación + `POST` mensajes | Contrato real de Meta Cloud API |
| `app/lib/nucleo/conversacion.ts` | **Nuevo**: máquina de estados por número | La abstención convertida en conversación |
| `app/lib/canales/whatsapp/` | **Nuevo**: `entrante`, `saliente`, `transcribir` | Adaptadores del canal |
| `app/app/whatsapp/page.tsx` | **Nuevo**: simulador | Es a la vez contingencia del video y versión web para el damnificado |
| `app/app/api/notificar/route.ts` | **Nuevo**: dispara avisos desde el tablero | Cierra el círculo coordinador → damnificado. Es la tesis funcionando |
| `docs/SEGURIDAD.md` | Reglas 12 y 13 nuevas; acotar la promesa del audio | El audio de WhatsApp **sí** sale del dispositivo |
| `docs/PRUEBAS.md` | Pruebas P0 del flujo conversacional | El canal nuevo necesita su propia prueba |
| `docs/VIDEO.md` | Reescribir la escaleta para WhatsApp | El video es el producto ante el jurado |

## Ruta de ejecución (≈14 horas productivas)

| # | Bloque | Horas | Nota |
|---|---|---|---|
| 1 | Refactor a `lib/nucleo/` — sacar prompt y modelo de las routes | 1.0 | Habilita todo lo demás |
| 2 | **Probar el clasificador contra Sonnet 5**: los tres casos + abstención | 1.0 | ⛔ El bloqueador real. **No se corta** |
| 3 | Máquina de estados + `/api/whatsapp` + simulador `/whatsapp` | 3.0 | El grueso del trabajo |
| 4 | Desplegar a Vercel | 0.5 | Necesario para Meta y para la entrega |
| 5 | Meta Cloud API — **límite duro de 90 minutos** | 1.5 | Si no sale, se corta y queda el simulador |
| 6 | `/api/notificar` disparado desde el tablero | 1.0 | ⭐ El diferenciador. **No se corta** |
| 7 | Notas de voz con Groq | 1.5 | 🔪 Primer candidato a corte |
| 8 | Docs: `PRODUCTO`, `SEGURIDAD`, `PRUEBAS`, `VIDEO`, `README`, `CHANGELOG` | 1.0 | Lo exige el contrato de `CLAUDE.md` |
| 9 | Guion + grabación + edición del video | 2.0 | Grabar **primero** con simulador |
| 10 | Repositorio final, commit, push | 1.0 | |

**Orden de corte si aprieta el reloj:**
① notas de voz → ② Meta real (queda el simulador) → ③ alertas de exclusión en
mensaje aparte.

**Nunca se corta:** paso 2 (probar el clasificador), paso 6 (la notificación),
paso 9 (el video).

## Qué falta

| # | Pendiente | Bloquea | Estado |
|---|---|---|---|
| 1 | **Probar el clasificador contra `claude-sonnet-5`**: casos y abstención | Todo | `HECHO`; 15/15 automático y manual, EV-030 |
| 2 | Refactor del núcleo | Los pasos 3, 6, 7 | `HECHO`; typecheck/build pasan |
| 3 | Máquina de estados + webhook + simulador | El video | `HECHO LOCAL`; Meta pendiente |
| 4 | Notificación disparada desde el tablero | El diferenciador del pitch | `HECHO EN SIMULADOR`; real bloqueado |
| 5 | Meta Cloud API con número de prueba | Nada — hay contingencia | Límite duro 90 min |
| 6 | Notas de voz (Groq) | Nada — cortable | Código hecho; activar ZDR y probar cuenta |
| 6a | Extraer petición y generar enlace desde WhatsApp | Tramo legal en WhatsApp | `HECHO LOCAL`; falta secreto Gate 4 y visual |
| 7 | Prueba de falsa expectativa con una persona ajena | La entrega | Heredado del ADR 0005 |
| 8 | Grabar y editar el video ≤60 s | La entrega | — |
| 9 | Consolidar el repositorio git y subir | La entrega | — |

## Verificado

- `npm test`: 17/17; `npx tsc --noEmit`: limpio; `npm run build`: limpio,
  **diez rutas generadas**. Chrome 412×915 aprobado en EV-031.
- P0 real `claude-sonnet-5`, `effort: medium`, thinking desactivado: 15/15
  automático y revisión manual aprobada; mediana 6445 ms, mínimo 4735 y máximo
  7604 ms. Evidencia sellada EV-030.
- **Derecho de petición extremo a extremo**: destinatario tomado de la ruta
  verificada, las dos citas literales del corpus con su SHA-256, y el vencimiento
  calculado en código — 15-ago-2026 + 15 días hábiles = **4 de septiembre de
  2026**, comprobado a mano.
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
- Que el clasificador mantenga la misma calidad con relatos reales; EV-030 sólo
  prueba cinco relatos sintéticos repetidos tres veces. La demo usa esos casos
  prevalidados y la abstención sigue siendo obligatoria.
- **Política de Groq verificada; configuración de la cuenta pendiente.** La
  documentación oficial declara no entrenamiento y ZDR configurable. El equipo
  debe activar ZDR y conservar evidencia antes de cualquier dato no sintético.

**Desconocido**

- Cuántos hogares hay realmente detenidos en cada compuerta. Esa es justamente la
  cifra que el producto propone producir, y por eso el agregado se rotula siempre
  como autorreportado.

## Riesgos y qué hacer

| Riesgo | Control | Condición de parada |
|---|---|---|
| El clasificador inventa una compuerta | Abstención obligatoria + schema estricto | Si falla la prueba de abstención, no se graba el video hasta corregir el prompt |
| **Sonnet 5 abstiene peor que Opus 5** | Escalar `effort: 'high'` → `thinking: 'adaptive'` → `claude-opus-5` | Si ninguno pasa, aplica la reversión del ADR 0005: selección manual de compuerta |
| **Meta no conecta a tiempo** | Simulador con el mismo handler; video grabado antes de intentar Meta | A los 90 minutos se corta sin discusión |
| **El repositorio afirma un canal que no está conectado** | `WHATSAPP.md` marcado `PLANEADO` hasta que se verifique | Cualquier afirmación no verificada bloquea la publicación |
| **La ventana de 24 h de WhatsApp** impide notificar sin plantilla aprobada | Documentado en `WHATSAPP.md`; en el demo la ventana está abierta | Si el jurado pregunta, se responde con la limitación, no se esquiva |
| **El audio sale del dispositivo** en WhatsApp | Acotar la promesa en `SEGURIDAD.md` regla 12; borrar el audio tras transcribir | Si no se alcanza a documentar, se cortan las notas de voz |
| **El teléfono es dato personal** | Hash con sal como llave de sesión; nunca el número crudo en logs | Cualquier número crudo en el repo bloquea la publicación |
| Alguien cree que quedó registrado | Aviso en el **primer** mensaje de WhatsApp y permanente en pantalla 1 | Si la persona ajena duda en la prueba, se corrige el copy antes de grabar |
| La ruta municipal cambia | Fecha de verificación visible | Si no se puede verificar, se muestra el paso sin dirección |
| El pitch se diluye con dos canales | Se mitiga en el guion: WhatsApp ~40 s, tablero ~15 s, flujo web del damnificado **0 s** | Si el video pasa de 60 s, se recorta del tablero |
| Latencia del modelo arruina la toma | Sonnet 5 + `thinking: disabled`; red estable | Si falla, usar respuesta prevalidada marcada como tal |
| Se filtra PII | Todo sintético; capturas del canal excluidas en `.gitignore` | Cualquier dato real bloquea la publicación |

## Historial

### 2026-08-16 — Un teléfono no recibía nada: no era Redis, era la lista de Meta

- Status: `RESUELTO EN CÓDIGO Y DOCUMENTADO · ACCIÓN OPERATIVA ABIERTA`.
- Scope: se probó el despliegue de producción desde dos teléfonos para verificar
  la persistencia de sesiones en Redis desplegada esa mañana. Uno conversaba
  normalmente; el otro **no recibía absolutamente nada**. Sospecha inicial:
  Redis.
- Machine-verified: **no era Redis, y Redis funciona.** Las dos sesiones estaban
  vivas en el almacén con TTL vigente (1761 s y 1376 s de 1800 s). La del
  teléfono que sí respondía estaba en `PREGUNTANDO` con `rondas=2`, y ese
  contador sólo llega a 2 si la sesión sobrevivió entre mensajes que pudieron
  caer en instancias distintas — justo lo que fallaba antes del arreglo. La del
  teléfono silencioso **también existía**: el webhook recibió su mensaje y lo
  procesó; lo único que falló fue la entrega.
- Diagnosis: el remitente es un **número de prueba** de Meta Cloud API
  (`verified_name: "Test Number"`, `code_verification_status: NOT_VERIFIED`,
  confirmado con `GET /{phone_number_id}`). Un número de prueba sólo puede
  responderle a los teléfonos que estén en su lista de destinatarios
  autorizados. A cualquier otro, Meta acepta el mensaje entrante y rechaza la
  respuesta con `131030`. Log de producción de las 06:06:53 con HTTP 400, y
  reproducido con una sonda dirigida a `+1 555-011-1111`, un número no asignable
  a ninguna persona, elegido precisamente para no escribirle a nadie.
- Por qué costó verlo: el adaptador de salida lanzaba
  `Meta rechazó el envío (400)` y **descartaba el cuerpo**, que es donde viene el
  código. Un `131030`, un `131047` y un cuerpo mal formado se veían idénticos en
  el log. Hizo falta una sonda manual contra Meta para distinguirlos.
- Fix en código: `ErrorEnvioMeta` conserva estado HTTP y código de Meta, sin
  meter el teléfono en el mensaje que va al log; y el webhook dejó de intentar
  un mensaje de disculpa por el canal que acaba de fallar, porque volvía a
  fallar igual y duplicaba el error. Ante `131030` escribe una línea que dice
  dónde se arregla.
- Lo que **no** se puede arreglar desde el producto: no hay forma de avisarle a
  esa persona que no se le puede responder, porque el único canal para avisarle
  es el bloqueado. Por eso el arreglo real es operativo.
- Riesgo materializado: el registro del Gate 5 aceptó como riesgo que la consola
  no mostrara el límite de destinatarios. Era este. Ahora está confirmado,
  medido y escrito donde el jurado lo va a leer.
- Verified: `npm test` 22/22, `npx tsc --noEmit` exit 0, `npm run build` exit 0
  con 11 rutas. Evidencia sellada en **EV-036**; `EXT-META-001` pasa a **PASS con
  límite** — el canal está conectado y se puede afirmar.
- Next action (equipo): agregar en Meta › WhatsApp › API Setup **cada teléfono**
  que vaya a probar el canal real, jurado incluido, antes de la demostración. Si
  no se puede, la demostración va por `/whatsapp`, que no tiene esa restricción.
- Owners: equipo para la consola de Meta; Claude para código, documentación y
  evidencia.

### 2026-08-16 — Regresión de Groq: la cuenta pierde acceso de inferencia

- Status: `BLOQUEADO POR PROVEEDOR · FUNCIÓN APAGADA, NO RETIRADA`.
- Scope: el equipo pidió iniciar la demo con notas de voz reales. Se construyó
  `/api/nota-voz`, que transcribe con la misma función `transcribirAudio` del
  webhook de Meta y mete la transcripción en la misma conversación que el texto.
  El equipo grabó dos notas sintéticas y las dejó en `app/public/demo/`.
- Machine-verified 2026-08-16 02:55: la clave de Groq responde **200 en
  `/models`** pero **401 «Invalid API Key» en `/audio/transcriptions` y en
  `/chat/completions`**. Una clave inventada da 401 también en `/models`, así que
  el endpoint sí valida y la credencial es genuina. El equipo generó una clave
  nueva y el patrón se repitió idéntico.
- Diagnosis: no es el código, ni los archivos, ni la clave. La cuenta autentica
  para lectura y está rechazada para inferencia — el patrón típico de facturación
  vencida, cuenta suspendida o clave sin permiso de inferencia. `x-request-id`
  para soporte de Groq: `req_01m04s2w1je02rqc3xbqhk15w1`.
- Regression contra EV-032: esa evidencia registró una transcripción correcta el
  2026-08-15 23:53 con este mismo montaje. EV-032 no se edita ni se invalida:
  probó lo que probó el día que se corrió. Lo que cambió es el estado de la
  cuenta, y eso se registra aquí.
- Decision: la función queda **apagada por compuerta explícita**, no retirada.
  `NOTAS_VOZ_DEMO=false` hace que `/api/nota-voz` responda 503 y que el simulador
  no muestre los botones. Un botón que falla delante del jurado es peor que un
  botón que no existe. Se enciende poniendo la variable en `true`, sin tocar
  código, si la cuenta se recupera.
- Honestidad: el repositorio no puede afirmar que las notas de voz funcionan hoy.
  Están construidas y probadas localmente hasta el borde del proveedor; la
  llamada externa no pasa. Si no se resuelve antes de grabar, el video no las
  muestra y el orden de corte del plan se cumple: audio es lo primero que cae.
- Verified: `npm test` 19/19, `npx tsc --noEmit` exit 0, `npm run build` exit 0
  con 11 rutas. El camino de texto con Anthropic sigue respondiendo 200 y el
  diagnóstico completo se reprodujo en Chrome.
- Next action: grabar el video con la demo escrita, que está verificada.
- Owners: equipo para la cuenta de Groq; Codex para la compuerta y el registro.

### 2026-08-16 — Gate 5 cerrado con riesgo registrado; Gate 6 iniciado

- Status Gate 5: `HECHO CON RIESGO REGISTRADO`. Las cuatro credenciales están
  machine-verified en formato, unicidad y aislamiento. Los tres datos operativos
  que faltaban **no** se obtuvieron, y eso se registra en vez de omitirse.
- User-observed 2026-08-16: **no hay 2FA activa** en la cuenta administradora, y
  ni la expiración del token ni el límite de destinatarios aparecen visibles en
  la consola del equipo.
- Risk accepted, no mitigado: sin 2FA, el App Secret y el token dependen de una
  sola contraseña. Se acota por alcance —número de prueba, envíos apagados,
  credenciales sólo locales— no por control técnico. La recomendación de activar
  2FA queda abierta y debe ejecutarse antes de cualquier uso no sintético.
- Assumption, explícitamente no verificada: el token temporal de Meta caduca en
  aproximadamente 24 horas y el número de prueba admite un puñado de
  destinatarios registrados. Ninguna de las dos se observó en la consola, así que
  ninguna se afirma. Consecuencia operativa: si el webhook o el envío fallan con
  error de autenticación, la primera hipótesis es token vencido, y la
  recuperación es regenerarlo y reemplazar sólo `WHATSAPP_TOKEN`.
- Regression: `npm test` 19/19, `npx tsc --noEmit` exit 0, `npm run build` exit 0
  con 10 rutas. Aislamiento de secretos: 9 valores sensibles contrastados contra
  96 archivos del repositorio, **0 coincidencias**; `.env.local` ignorado y no
  rastreado; `.env.example` sin valores; `git diff --check` exit 0; 0 teléfonos y
  0 identificadores tipo cédula en la documentación. Cero llamadas externas.
- Status Gate 6: `EN CURSO`.
- Scope: consolidar el trabajo local en git, publicar el repositorio y desplegar.
  No incluye conectar el webhook ni activar envíos, que son Gate 7.
- Authorization: el equipo autorizó el 2026-08-16 repositorio **público** en la
  cuenta `c0llaborative` y despliegue con `npx vercel` desde esta máquina.
- Safety: se publica sólo lo ya escaneado. `WHATSAPP_SEND_ENABLED=false` se
  mantiene también en el entorno desplegado; las variables se cargan en Vercel
  como acción del equipo, nunca por chat ni por commit.
- Repo hygiene: se corrigió la instrucción del README que enseñaba a exportar la
  clave en la terminal, y `.gitignore` cubre ahora `.vercel/`, `.gstack/` y
  `*.key`.
- Licencia decidida: **AGPL-3.0**. El deck del evento no exige ninguna licencia,
  así que la elección es estratégica. Se descartó MIT porque el equipo planteó
  ofrecer el producto a entidades públicas y a cooperación internacional, y una
  licencia permisiva permitiría a un tercero cerrar el código y venderlo a la
  misma alcaldía. La AGPL exige publicar las modificaciones a quien lo opere como
  servicio, conserva la opción de vender una licencia comercial separada porque
  el copyright sigue siendo del equipo, y al ser aprobada por la OSI no cierra la
  puerta a la elegibilidad como bien público digital. `NOTICE.md` documenta esto
  y excluye el material de terceros.
- Schedule finding: el deck fija el cierre de entregas el domingo 16 a las 09:00,
  y la entrega es video ≤1 min **más** código. A las 01:53 del domingo quedan
  ~7 horas y el video no está grabado. La rúbrica asigna 20 puntos a la demo
  funcional vista en el video y 0 puntos directos a que Meta esté conectado.
- Decision: se ejecuta el orden de corte que el propio plan ya fijaba. Publicar
  el repositorio primero, grabar el video con el simulador enseguida, y sólo
  intentar Vercel y Meta con el tiempo que sobre.
- Repositorio publicado 2026-08-16 02:05: **https://github.com/c0llaborative/contados**,
  público, en dos commits (`face9ed` el canal, `682dd52` licencia y evidencia).
  Machine-verified tras el push: el único archivo de entorno en el remoto es
  `app/.env.example`, sin valores; GitHub detecta la licencia como AGPL-3.0.
- Status parcial Gate 6: repositorio `HECHO`; despliegue `PENDIENTE`.
- Next action: el equipo graba el video con el simulador —es el entregable
  calificado y el reloj corre—; el despliegue en Vercel queda después.
- Owners: Codex para git, higiene y despliegue; equipo para grabar y para cargar
  las variables de entorno en Vercel.

### 2026-08-16 — Gate 5 iniciado: preparar credenciales de Meta

- Status: `EN CURSO`.
- User-observed: el equipo reportó tener disponibles los valores de API Setup.
  Todavía no se consideran guardados ni machine-verified.
- Scope: guardar localmente versión Graph, token temporal, Phone Number ID y App
  Secret; registrar expiración/límites sin valores sensibles. No se configura
  webhook, despliega ni envía mensajes en este gate.
- Safety: valores sólo en `app/.env.local`; nunca chat, capturas, documentación o
  comandos. No confundir Phone Number ID con número visible/App ID, ni App Secret
  con token/client token. `WHATSAPP_SEND_ENABLED=false` permanece obligatorio.
- Acceptance: cuatro variables Meta presentes/no-placeholder; versión con forma
  `vN.N`; archivo ignorado/no rastreado; 0 coincidencias fuera del env; envíos
  apagados. 2FA, número de prueba y límites quedan user-observed.
- Recovery/stop: si el token está vencido, el App Secret no puede revelarse o
  aparece pago/verificación inesperada, detener sin activar envíos. Reemplazar
  sólo la credencial afectada y volver a verificar aislamiento.
- Next action: equipo copia los cuatro valores a `.env.local` y reporta
  `Credenciales Meta listas; envío apagado`.
- Owners: equipo para consola/cuenta/credenciales; Codex para verificación local
  sin imprimir valores y actualización documental.
- User report 2026-08-16: `credenciales listas`.
- Machine verification: las cuatro variables Meta no aparecen en
  `app/.env.local`; el archivo sigue ignorado/no rastreado y los envíos siguen
  apagados. El reporte no se convierte en configuración verificada.
- Recovery: localizar sólo por nombres en las ubicaciones probables, sin revelar
  valores. Si se editaron `.env.example` u otro archivo, moverlos manualmente al
  `.env.local` correcto y limpiar el archivo equivocado antes de continuar.
- Next action actualizado: identificar la ubicación usada y corregirla; cero
  llamadas a Meta mientras falten las variables.
- Recovery finding: el archivo correcto fue modificado, pero las cuatro claves
  tenían dos espacios antes del nombre (`  WHATSAPP_...` / `  META_APP_SECRET`).
  Los valores no se mostraron. Next.js no reconoce esos nombres.
- Next action actualizado: normalizar sólo el espacio inicial mediante un script
  que preserve los valores, rechace duplicados y no imprima secretos; verificar
  de nuevo antes de cualquier llamada externa.
- User recovery: el equipo retiró manualmente los espacios; machine-verified:
  cuatro nombres exactos, sin duplicados ni indentación, envíos apagados.
- Format diagnosis: el valor bajo `META_APP_SECRET` tiene forma de access token
  largo; `WHATSAPP_TOKEN` tiene forma de ID numérico; la versión Graph no cumple
  `vN.N`. `WHATSAPP_PHONE_NUMBER_ID` es numérico, pero no puede distinguirse
  localmente de otros IDs de Meta. Ningún valor se mostró.
- Status: `EN CURSO`; no se llama a Meta. Recovery: mover el token largo a
  `WHATSAPP_TOKEN`, obtener el App Secret real desde Settings > Basic, copiar el
  campo explícitamente rotulado Phone number ID y corregir la versión `vN.N`.
- Recheck: versión Graph, access token y Phone Number ID ya cumplen formato; el
  token no quedó duplicado. `META_APP_SECRET` aún no tiene forma de App Secret.
  Envíos permanecen apagados.
- Verified decision: la URL pública no es requisito para obtener el Phone Number
  ID (API Setup o consulta de phone numbers) ni el App Secret (App Settings >
  Basic). La URL HTTPS sólo bloquea la verificación/suscripción del webhook en
  Gate 7. No se hizo llamada a Meta para esta comprobación.
- Next action actualizado: equipo confirma que el ID proviene del campo exacto
  `Phone number ID` y guarda el App Secret real; después Codex cierra Gate 5.
- Operator guide expanded: Gate 5A documenta preparación, rutas de UI, mapeo de
  los cuatro campos, evidencia sin secretos, stop conditions y recuperación.
  Fuente operativa: `docs/IMPLEMENTACION_PASO_A_PASO.md`.
- User-observed: el equipo confirmó que el identificador proviene del campo
  exacto `Phone number ID` y que guardó el App Secret.
- Machine recheck: versión `vN.N`, access token largo, Phone Number ID de 16
  dígitos, App Secret sin espacios y cuatro valores distintos. La validación
  anterior produjo un falso negativo por una expresión local excesivamente
  restrictiva; no había defecto en las credenciales finales.
- Isolation: 10 valores sensibles del entorno contrastados contra código,
  scripts, tests, docs y evidencia; 0 coincidencias. `.env.example` sólo contiene
  campos semánticamente vacíos; `.env.local` ignorado/no rastreado; envíos
  apagados. No hubo llamada a Meta.
- Remaining: registrar expiración visible del token, límite de destinatarios y
  confirmar 2FA antes de cerrar formalmente Gate 5.
- Next action actualizado: ejecutar pruebas/build y recibir esos tres datos
  operativos no secretos del equipo.
- Verified regression: `npm test` 19/19, `npx tsc --noEmit` y
  `npm run build` pasan con 10 rutas; cero llamadas externas.
- Remaining exact closure condition: equipo reporta 2FA activa, expiración
  visible del token y límite/cantidad de destinatarios de prueba. Hasta entonces
  Gate 5 queda `EN CURSO` aunque el código/configuración local pasan.

### 2026-08-16 — Gate 4 iniciado: secretos independientes de WhatsApp

- Status: `EN CURSO`.
- Problem/scope: faltan `WHATSAPP_VERIFY_TOKEN`, `SESION_SAL`,
  `NOTIFICAR_ADMIN_TOKEN` y `PETICION_LINK_SECRET`. Se generarán localmente con
  32 bytes criptográficamente aleatorios cada uno; no se tocan API keys.
- Safety: los valores sólo se escriben en `app/.env.local`, ya ignorado por Git;
  no se imprimen, documentan ni copian al chat. `WHATSAPP_SEND_ENABLED=false`
  permanece sin cambios. No hay Meta, despliegue ni llamada externa.
- Acceptance: cuatro valores presentes, 64 caracteres hexadecimales cada uno,
  todos distintos y distintos de Anthropic/Groq; plantilla sin valores;
  `.env.local` ignorado; pruebas/build limpios.
- Verification: script local informa sólo presencia, longitud y unicidad;
  escaneo exacto comprueba que no salieron de `.env.local`; diff y documentos.
- Recovery: si falla la escritura, conservar el archivo original y no activar
  Meta. Rotar un secreto después de conectar Meta exige sincronizar el valor
  correspondiente en la plataforma.
- External owner: ninguno en esta generación local. El equipo será owner de
  copiar los secretos necesarios al entorno desplegado y Meta en gates futuros.
- Verified precondition: las cuatro variables estaban vacías, `.env.local`
  ignorado y envíos apagados; machine-verified sin mostrar valores.
- Next action: crear ejecutor seguro, generar valores y verificar aislamiento.
- Advance: `npm run setup:whatsapp-secrets` generó 4 valores de 32 bytes/64
  caracteres hexadecimales, todos distintos, y reportó `valuesPrinted: false`.
  El ejecutor se niega a sobrescribir cualquier secreto existente.
- Safety: el primer arranque quedó bloqueado por el sandbox antes de ejecutar
  Node; la repetición autorizada terminó exit 0. No hubo llamadas externas,
  Meta ni cambio de `WHATSAPP_SEND_ENABLED=false`.
- Next action actualizado: comprobar aislamiento exacto y ejecutar pruebas,
  typecheck, build y quality gate documental.
- Closure: las cuatro variables tienen exactamente 64 caracteres hexadecimales,
  son únicas y no coinciden con API keys. 0 coincidencias exactas fuera de
  `.env.local`; plantilla vacía; archivo ignorado/no rastreado; envíos apagados.
- Verified: `npm test` 19/19, `npx tsc --noEmit` y `npm run build` pasan con 10
  rutas. Cero llamadas externas. EV-033 sellada con SHA-256.
- Status final Gate 4: `HECHO`.
- Next action: Gate 5, preparar Meta Developer. Owner de cuenta/UI: equipo;
  owner de guía, comprobaciones locales y registro: Codex.

### 2026-08-15 — Gate 3 iniciado: transcripción con privacidad verificable

- Status: `EN CURSO`.
- Scope: configurar Groq sólo para transcribir una nota de voz sintética con
  `whisper-large-v3-turbo`; no incluye audio real, Meta ni despliegue.
- Safety: la clave pertenece al equipo y sólo va en `app/.env.local`, confirmado
  como ignorado por Git. No se pega en chat, capturas, comandos ni documentos.
  No se llama al proveedor hasta que el equipo reporte ZDR activado.
- Acceptance: ZDR user-observed, clave presente machine-verified sin leerla,
  audio sintético transcrito en memoria, diagnóstico esperado, cero archivo de
  audio y cero secreto/dato sensible en logs.
- Recovery/stop: si ZDR no está disponible, hay cobro o cuota inesperada, el
  audio persiste o aparece información sensible, detener y cortar audio del MVP;
  texto y simulador permanecen funcionales.
- Next action: equipo guarda la clave y confirma ZDR; Codex ejecuta la prueba.
- Owners: equipo para cuenta, privacidad y credencial; Codex para código,
  verificación local y documentación.
- Advance: machine-verified el 2026-08-15 — `GROQ_API_KEY` está presente con
  longitud no-placeholder, `STT_MODEL=whisper-large-v3-turbo` y `.env.local`
  sigue ignorado. El valor del secreto no se imprimió ni se registró.
- User report: `groq listo`; se interpreta como credencial guardada, no como
  confirmación de ZDR porque el mensaje no lo indicó.
- Remaining/blocker: confirmar visualmente que ZDR esté activado en Data
  Controls. No se ha enviado audio ni hecho llamada a Groq.
- Next action actualizado: equipo confirma `ZDR activado`; luego Codex ejecuta
  la prueba sintética.
- External evidence: user-observed el 2026-08-15 — el equipo reportó `ZDR
  activado`. Esto autoriza únicamente la prueba de audio sintético del Gate 3;
  no autoriza audio real, Meta, despliegue ni datos personales.
- Next action actualizado: Codex genera un audio sintético temporal, prueba STT,
  diagnóstico, no persistencia y logs, y elimina el archivo temporal.
- Attempt 1: la síntesis local con `System.Speech` falló antes de crear audio
  porque el motor de voz no pudo inicializarse en este entorno. Cero llamadas a
  Groq/Anthropic/Meta y archivo de 0 bytes/no existente. No afecta el producto.
- Recovery: probar el motor SAPI local; si tampoco está disponible, pedir al
  equipo una grabación sintética fuera del repositorio, sin datos reales.
- Attempt 2/recovery: SAPI requirió ejecución local ampliada y creó un WAV
  sintético de 496.292 bytes fuera del repositorio. Groq
  `whisper-large-v3-turbo` lo transcribió en 1.976 ms; la llamada pasó, pero la
  voz robótica produjo errores fonéticos, incluido `arendo` por `arriendo`.
- Diagnosis: Anthropic conservó `compuerta: censo`, pero no produjo la alerta
  `arrendatario` debido al error fonético. Resultado parcial: STT e integración
  pasan; el criterio semántico completo no. No se convierte en PASS.
- Next action actualizado: buscar una voz local española/mejor articulada y
  repetir una sola vez; si no existe, usar grabación humana sintética del equipo.
- Final recovery/pass: Microsoft Helena Desktop (español) generó un WAV
  sintético de 494.498 bytes. Groq devolvió el texto exacto en 1.456 ms;
  Anthropic devolvió `censo`, alerta `arrendatario`, `posible_estafa: false` y
  cuatro hechos. Gate 3: `HECHO`.
- Verification: `npm test` 19/19, typecheck y build pasan; clave exacta hallada
  en 0 archivos del alcance; 0 logs sensibles; 0 audios generados en repo. Los
  tres directorios/WAV temporales se eliminaron y no quedan remanentes. Servidor
  local detenido. Evidencia sellada EV-032.
- Safety/limits: se hicieron 2 transcripciones Groq y 2 diagnósticos Anthropic,
  todos sintéticos; 0 Meta. ZDR sigue siendo user-observed, no verificable por
  API. No prueba voz humana, descarga de medios de Meta ni producción.
- Next action: Gate 4; owner equipo para generar/guardar secretos y Codex para
  verificarlos sin leerlos en salida.

### 2026-08-15 — Gate 2 iniciado: robustez conversacional y petición temporal

- Status: `EN CURSO`.
- Problem/scope: el webhook clasifica cada fragmento por separado, deduplica
  antes de confirmar procesamiento y la petición sólo existe como POST web.
  Gate 2 cubrirá agrupado de 12 s, una clasificación por lote, serialización por
  sesión, reintento seguro, límites, generador de petición en el núcleo y enlace
  cifrado con expiración. No incluye Meta real, Groq, despliegue ni persistencia.
- Safety boundaries: `WHATSAPP_SEND_ENABLED=false`; ninguna llamada externa ni
  secreto nuevo durante implementación. El enlace será bearer, cifrado y de 15
  minutos; no se registrará ni se pondrá en evidencia. Su secreto se configurará
  después como acción externa distinta y no reutilizada.
- Assumptions/decision: para el MVP la cola de debounce será en memoria y usará
  `after()` de Next.js para responder rápido al webhook. Funciona en una
  instancia; multi-instancia requiere una cola durable y queda fuera del MVP.
  El token de petición será autocontenido y cifrado para no depender de esa cola.
- Acceptance: un relato dividido produce una llamada; duplicados no reprocesan;
  un fallo permite reintentar sin duplicar texto; límites son explícitos; token
  válido genera el mismo borrador, expirado responde 410 con recuperación;
  pruebas, tipos, build y revisión 412×915 pasan.
- Verification plan: tests con reloj/espera corta y clasificador falso; pruebas
  criptográficas de alteración/expiración; route/build; prueba visual local;
  quality gate documental y de secretos.
- Recovery: desactivar agrupado usando simulador/direct API; si falta el secreto
  no se crea enlace y se conserva la ruta web; un token inválido/expirado nunca
  genera documento.
- Next action: implementar cola, transacción por sesión y sus pruebas.
- Owner: Codex; equipo sólo configurará el secreto en Gate 4.
- Advance: cola de 12 s y deduplicación implementadas; `after()` permite
  confirmar el webhook antes del trabajo. La conversación serializa cada sesión
  y sólo confirma el relato después de una clasificación exitosa.
- Verified: machine-verified — `npm test` 12/12 y `npx tsc --noEmit` exit 0.
  Cubierto: dos fragmentos/un lote, duplicado, fallo y reintento, concurrencia y
  límites de ventana/longitud. No se llamó a Anthropic, Meta ni Groq.
- Remaining: petición en núcleo, token cifrado/expiración, rutas y visual.
- Next action actualizado: extraer el generador y añadir token temporal.
- Advance: generador extraído a `lib/nucleo/peticion.ts`; token AES-256-GCM
  autocontenido, aleatorio, autenticado y válido 15 minutos; GET temporal usa
  `no-store`, `no-referrer` y `noindex`; expirado responde 410 y alterado 404.
  La ruta POST web reutiliza el mismo generador. Si falta el secreto, la
  conversación conserva el diagnóstico sin inventar un enlace.
- Verified adicional: machine-verified — `npm test` 15/15 y typecheck limpio.
  La primera firma de la ruta dinámica falló el typecheck por tipos aún no
  generados; se cambió a contexto explícito y la repetición pasó. Cubierto:
  aleatoriedad, cifrado, round-trip, alteración, expiración y escape HTML.
- Remaining: build, HTTP local, revisión 412×915 y documentación/quality gate.
- Next action actualizado: verificar rutas compiladas y experiencia móvil.
- HTTP probe inicial: POST directo 200, token válido 200 con `no-store` y
  `no-referrer`, expirado 410; una alteración del último carácter respondió 200
  porque era una codificación Base64URL no canónica de los mismos bytes. No es
  ruptura de AES-GCM, pero incumple el rechazo estricto esperado.
- Next action actualizado: exigir Base64URL canónico y repetir el probe HTTP.
- Advance de cierre técnico: se rechazó Base64URL no canónico; el probe repetido
  dio válido 200, alterado 404 y expirado 410. Se añadieron pruebas del máximo de
  ocho mensajes, del secreto ausente y del enlace generado, además de corte de
  palabras largas en el chat.
- Verified: machine-verified — `npm test` 17/17, `npx tsc --noEmit` exit 0 y
  `npm run build` exit 0 con 10 rutas. Cero llamadas a Anthropic, Meta o Groq.
- Remaining/blocker: revisión visual 412×915. El navegador integrado no estaba
  conectado (`agent.browsers.list()` devolvió lista vacía); según su procedimiento
  no se sustituyó por otra automatización. El código del Gate 2 queda hecho pero
  el gate no se declara cerrado sin esa evidencia.
- Next action actualizado: equipo conecta el navegador integrado o ejecuta la
  lista manual documentada; Codex registra el resultado y, si pasa, cierra Gate 2.
- Documentation quality gate: 17 documentos Markdown vigentes inspeccionados,
  0 enlaces locales rotos, 0 archivos con patrones de secreto en el alcance,
  `.env.local` confirmado como ignorado, hash EV-030 coincide y
  `git diff --check` exit 0. El recorrido encontró un directorio de herramienta
  inaccesible y fuera de alcance; no se leyó ni es evidencia del producto.
- Visual closure: machine-verified con Chrome conectado por el equipo el
  2026-08-15 23:30 America/Bogota. `/whatsapp` y `/tablero` pasaron a 412×915:
  cero overflow horizontal, tabla y controles dentro del viewport, saludo
  visible y cero errores/warnings de consola. Se restableció el viewport y se
  cerró la pestaña de prueba. No hubo Meta, Groq, datos reales ni envíos.
- Status final Gate 2: `HECHO`. Evidence: EV-031.
- Next action: Gate 3, activar ZDR de Groq y probar audio sintético. Owner de la
  cuenta/clave: equipo; owner de verificación técnica: Codex.

### 2026-08-15 — Gate 1 cerrado: Sonnet 5 aprobado para el MVP

- Status: `HECHO · APROBADO PARA DEMO SINTÉTICA`.
- Completed: JSON Schema compatible, prompt endurecido, disparadores
  deterministas para los seis riesgos, razones/acciones seguras y normalización
  de hechos/preguntas. Se conservaron todas las corridas fallidas sin reescribirlas.
- Verified: machine-verified — `npm test` 7/7, typecheck y build pasan; P0 final
  15/15 con revisión manual, mediana 6445 ms; EV-030 y SHA-256 en el registro.
- Quality gate: 17 Markdown vigentes, 0 enlaces locales rotos; 0 valores con
  patrón de secreto en archivos de alcance; `.env.local` no está versionado;
  hash EV-030 coincide; puerto 3000 detenido; `git diff --check` pasa (sólo
  avisos de conversión LF/CRLF, sin errores de whitespace).
- Decisions: `claude-sonnet-5` queda como clasificador del MVP. No se abre OpenAI
  porque el candidato aprobado satisface el gate y otro proveedor añade costo y
  complejidad sin valor demostrado para la demo.
- Safety: sólo relatos sintéticos; ninguna llamada Meta/Groq; servidor local
  detenido; WhatsApp real continúa apagado.
- Remaining/blocker: la evidencia no prueba relatos reales ni disponibilidad en
  producción. Debounce, Groq, Meta, prueba humana y release siguen pendientes.
- Next action: Gate 2, agrupado de mensajes y pruebas de robustez.
- Owner: Codex.

### 2026-08-15 — P0 automático pasó, revisión semántica lo rechazó

- Status: `EN CURSO · MODELO NO APROBADO`.
- Completed: clave local comprobada sin imprimirla; `npm test` 6/6,
  `npx tsc --noEmit` y `npm run build` pasaron; se corrigió el schema nullable
  rechazado por Anthropic y se ejecutaron 15 inferencias reales con
  `claude-sonnet-5` y `effort: medium`.
- Verified: machine-verified — 15/15 reglas automáticas pasaron, mediana 5486 ms
  (mín. 5074, máx. 6926); artefacto EV-025 y SHA-256 registrados en
  `EVIDENCE_REGISTER.md`.
- Decisions: el 15/15 automático no aprueba el modelo. La revisión manual halló
  hechos inventados (por ejemplo, convertir una explicación oral en una
  constancia), alertas demasiado amplias y uso ocasional de tú/vos; por eso el
  resultado operativo es `FAIL`.
- Safety: sólo se enviaron cinco relatos sintéticos a Anthropic; no hubo llamadas
  a Meta o Groq, datos personales, despliegue ni envíos de WhatsApp.
- Completed adicional: prompt endurecido para tratamiento de usted, evidencia
  literal, riesgos explícitos y prohibición de convertir visitas orales en
  constancias; posprocesado determinista elimina citas alteradas y dos alertas
  sin disparador explícito; el evaluador ahora comprueba estas reglas.
- Verified adicional: machine-verified — `npm test` 7/7,
  `npx tsc --noEmit` exit 0 y `npm run build` exit 0, nueve rutas.
- Remaining/blocker: validar el cambio contra inferencias reales y revisar su
  contenido antes de aprobar el modelo.
- Next action: ejecutar una ronda de cinco casos; si pasa, repetir 15 veces y
  sellar la evidencia nueva.
- Probe real posterior: `3/5` con el evaluador reforzado. Los dos rechazos
  confirmaron inferencias todavía presentes: “anotó” se convirtió en “tomó sus
  datos” y una explicación oral en “constancia formal”. No se selló artefacto
  ni se aprobó el modelo; el servidor local fue detenido.
- Next action actualizado: distinguir preguntas prudentes de afirmaciones en el
  evaluador, reforzar esas dos prohibiciones y repetir la ronda corta.
- Segundo probe: `5/5` automático, pero `FAIL` manual porque el relato de estafa
  recibió `reporte` sin decir que hubiera informado daños a una autoridad. La
  regla anterior sólo prohibía `censo` y era insuficiente.
- Next action actualizado: exigir abstención (`compuerta: null`) cuando el único
  contacto descrito es sospechoso y repetir el probe.
- Tercer probe: `4/5`. El caso chaleco/cuaderno cayó a `reporte`, contrario a la
  regla operacional del producto que lo ubica provisionalmente en `censo` sin
  afirmar oficialidad. La revisión manual también detectó ejemplos documentales
  no verificados en otra recomendación.
- Next action actualizado: hacer explícita la clasificación provisional, limitar
  `posible_estafa` a señales narradas y reemplazar de forma determinista ejemplos
  documentales no verificados; repetir pruebas locales y probe.
- Cuarto probe: `4/5` automático y `3/5` tras revisión manual. Persistieron dos
  paráfrasis que agregaban hechos: “anotó datos” en vez de sólo “anotó”, y “sin
  identificación clara” cuando el relato únicamente decía que iban de civil.
- Next action actualizado: convertir ambas paráfrasis en fallos automáticos y
  repetir la ronda corta antes de habilitar el P0 de 15.
- Quinto probe: `5/5` automático y revisión manual sin inferencias nuevas; los
  casos complejos tardaron aproximadamente 6,5 s. Este probe habilita el gate
  completo, pero no aprueba por sí solo el modelo.
- Next action actualizado: ejecutar tres rondas (15 inferencias), conservar el
  JSONL, calcular SHA-256 y revisar las 15 respuestas antes de decidir.
- Gate completo endurecido: `14/15`, por tanto `FAIL`; mediana 5881 ms (mín.
  4363, máx. 6961). EV-026 conserva el JSONL y hash. La revisión manual halló
  además una alerta `ausente_en_visita` sin evidencia en el caso de estafa.
- Next action actualizado: aplicar disparadores deterministas a los seis riesgos,
  exigir acción escrita segura y ajustar la regla de constancia para prohibir
  afirmaciones, no preguntas prudentes; repetir pruebas y el P0 completo.
- Corrección aplicada: los seis riesgos ahora requieren señales explícitas en el
  relato; recomendaciones sin “por escrito” se completan de forma determinista;
  ejemplos documentales no verificados se sustituyen. La primera ejecución de
  tests reveló un fixture obsoleto (`6/7`) y se corrigió para incluir la evidencia
  que pretendía probar. Resultado final: `npm test` 7/7, typecheck y build pasan.
- Next action actualizado: repetir directamente el P0 de 15, porque la corrección
  crítica es determinista y ya tiene cobertura local.
- Segundo P0 endurecido: `14/15`, mediana 6406 ms (mín. 4203, máx. 8998),
  `FAIL`; EV-027. Sonnet repitió “esperando constancia formal” y agregó
  “funcionario” a una cita que sólo decía “me censaron”.
- Decision: el prompt no será la única frontera de seguridad. Codex añadirá una
  normalización determinista de razón y afirmaciones para esos patrones antes de
  una tercera y última corrida de aprobación.
- Next action actualizado: implementar y probar el normalizador; repetir 15/15.
- Normalizador implementado: una afirmación que agrega rol/documento no presente
  vuelve a la cita literal; una razón que presenta como pendiente un documento
  no narrado se reemplaza por una explicación neutra de la compuerta. Verificado
  con `npm test` 7/7, typecheck y build de nueve rutas.
- Next action actualizado: tercera y última corrida de 15 para decidir si Sonnet
  se aprueba con estas defensas o se abre comparación con otro proveedor.
- Tercera corrida: `15/15` automático, mediana 6153 ms (mín. 4123, máx. 7437),
  pero `FAIL` manual; EV-028. Una acción sugirió “autorización del propietario”
  sin respaldo en la ruta verificada.
- Decision actualizada: el modelo sólo detectará el tipo de riesgo. Razón y
  acción de cada alerta serán copy determinista del producto, no texto del
  proveedor. Es la mínima defensa que elimina recomendaciones variables.
- Next action actualizado: implementar copy determinista, probar y ejecutar el
  gate final de 15 sobre el comportamiento exacto que verá el usuario.
- Copy determinista implementado para los seis riesgos; razones y acciones del
  proveedor ya no llegan al usuario. Verificado con `npm test` 7/7, typecheck y
  build de nueve rutas.
- Next action actualizado: ejecutar el P0 final y sellar su evidencia; no habrá
  más iteraciones de prompt dentro de Gate 1.
- P0 con alertas deterministas: `15/15` automático, mediana 6438 ms (mín. 4094,
  máx. 7685), pero `FAIL` manual; EV-029. Persistió “le tomaron datos” en una
  razón y “anotó los datos” en una pregunta.
- Decision final de arquitectura: la razón de la compuerta también será copy
  determinista; las preguntas reemplazan esa paráfrasis por la frase neutral
  “anotó en el cuaderno”. El modelo queda limitado a compuerta, citas, riesgos y
  preguntas bajo normalización.
- Next action actualizado: verificar la defensa y ejecutar un único P0 de cierre.
- Razón fija y limpieza de preguntas implementadas. Verificado con `npm test`
  7/7, typecheck y build de nueve rutas.
- Next action actualizado: ejecutar P0 de cierre 15/15, revisión manual, hash y
  apagar el servidor; el resultado cierra Gate 1 como aprobado o rechazado.
- Owner: Codex.

### 2026-08-15 — P0 Anthropic bloqueado por schema nullable incompatible

- Status: `DIAGNÓSTICO CONFIRMADO · CORRECCIÓN EN CURSO`.
- Completed: credencial configurada y protegida; controles locales pasaron;
  Anthropic recibió 15 solicitudes pero rechazó cada una antes de inferencia.
- Verified: machine-verified — HTTP 400 de Anthropic, request IDs registrados en
  log local: `output_config.format.schema: Invalid schema: Enum value 'reporte'
  does not match declared type '['string', 'null']'`. Evaluador reportó 0/15 por
  HTTP 500 del adaptador; no hubo diagnósticos de modelo que evaluar.
- Decisions: reemplazar el nullable `type: ['string','null']` por `anyOf` con un
  enum string y una rama `null`; agregar prueba de regresión; ejecutar una sola
  llamada antes de repetir P0 completo.
- Safety: Meta/Groq apagados; clave no impresa; servidor temporal detenido. Los
  requests fueron rechazados antes de generar salida; costo de inferencia no
  confirmado y debe revisarse en el panel, no asumirse.
- Remaining/blocker: corregir schema y obtener una respuesta 200 válida.
- Next action: patch + tests locales + una llamada de validación.
- Owner: Codex.

### 2026-08-15 — Primera configuración Anthropic no quedó guardada

- Status: `GATE 1.2 EN CURSO`.
- Completed: equipo reportó configuración lista; Codex comprobó de forma segura
  las ubicaciones raíz, `app/` y `app/app/`.
- Verified: machine-verified — no existe `.env.local` en ninguna ubicación
  esperada; sólo existe `app/.env.example`. Cero contenido secreto leído.
- Decisions: no ejecutar pruebas ni llamadas hasta que el archivo exista y las
  cuatro variables requeridas pasen la comprobación booleana.
- Safety: cero llamadas a Anthropic y cero costo generado.
- Remaining/blocker: Codex ya creó `app/.env.local`; falta que el equipo pegue la
  clave en `ANTHROPIC_API_KEY=` y guarde.
- Next action: abrir el archivo preparado, pegar la clave y avisar
  `clave guardada en el archivo preparado`.
- Owner: equipo para guardar el secreto; Codex para verificar y ejecutar P0.

### 2026-08-15 — Runbook operativo iniciado; clave Anthropic obtenida

- Status: `GATE 1 EN CURSO`.
- Completed: runbook completo guardado en
  `docs/IMPLEMENTACION_PASO_A_PASO.md` y enlazado desde README; equipo reportó
  haber obtenido una API key de Anthropic.
- Verified: user-observed — existencia de la clave reportada por el usuario el
  2026-08-15; machine-verified — `app/.env.local` no existe todavía y la regla
  de git ignora ese path. No se leyó ni expuso ningún secreto.
- Decisions: ejecutar gates secuenciales; Codex asume tareas técnicas y el equipo
  sólo acciones externas/secretos/aprobaciones.
- Safety: ninguna llamada a Anthropic y ningún gasto observado.
- Remaining/blocker: guardar la clave en `.env.local` y comprobar saldo/cuota.
- Next action: Gate 1.2; luego el equipo informa `ANTHROPIC listo`.
- Owner: equipo para el secreto; Codex para verificación y P0.

### 2026-08-15 — Implementación local y handoff operativo cerrados

- Status: `HECHO LOCAL · EXTERNO PENDIENTE`.
- Completed: selector Anthropic/OpenAI, evaluador P0 de 15 llamadas, STT Groq,
  webhook firmado, simulador, notificación desde tablero, `.env.example`, ADR
  0007, guía de Meta con gates/recuperación y guion de video de 58 segundos.
- Verified: machine-verified — `npm test` 5/5; `npx tsc --noEmit` exit 0;
  `npm run build` exit 0 con nueve rutas; sintaxis del evaluador exit 0; 16
  Markdown activos con 0 enlaces locales rotos; 0 coincidencias de PII, secretos
  o estados activos obsoletos; `git diff --check` exit 0.
- Decisions: Sonnet 5 se prueba primero por menor riesgo de integración;
  GPT-4o mini es retador de costo; Groq Turbo es STT; Gemini no se agrega sin
  ventaja medida. Ver ADR 0007.
- Safety: no hubo llamadas a modelos, Groq, Meta o Vercel; envío real permanece
  apagado; ningún secreto ni dato real fue creado o leído.
- Remaining/blocker: credencial y P0 real; activar/observar ZDR; desplegar;
  prueba Meta; prueba de falsa expectativa; grabar video. Debounce y enlace del
  derecho de petición desde WhatsApp quedan pendientes y no se muestran como
  hechos. La revisión visual móvil de `/whatsapp` y del nuevo control del tablero
  queda pendiente porque esta sesión no tenía navegador conectado.
- Next action: equipo configura un proveedor en `.env.local`, ejecuta
  `npm run eval:model` y reporta el resultado 15/15 con latencias.
- Owner: equipo para las acciones externas; Codex para corregir cualquier fallo
  que esas pruebas revelen.

### 2026-08-15 — Núcleo extraído y clasificador configurado

- Status: `HECHO CON PRUEBA EXTERNA BLOQUEADA`.
- Completed: `schema`, `rutas` y `corpus` movidos a `app/lib/nucleo/` con
  reexportaciones compatibles; prompt, llamada a Anthropic e invariante de
  abstención extraídos a `nucleo/clasificar.ts`; `/api/diagnose` quedó como
  adaptador HTTP. Modelo por defecto `claude-sonnet-5`, `max_tokens: 2000`,
  thinking desactivado y modelo reemplazable con `AI_CLASSIFIER_MODEL`.
- Verified: machine-verified — `npx tsc --noEmit`, exit 0 (2026-08-15).
- Decisions: conservar Anthropic como único proveedor de clasificación del MVP;
  cualquier cambio de marca exige comparar el mismo corpus P0, latencia y costo.
- Safety: no se llamó a ningún proveedor, no se desplegó y no se escribieron
  secretos. La prueba real no se presenta como realizada.
- Remaining/blocker: `ANTHROPIC_API_KEY` no está disponible en este entorno; P0
  de abstención y tres casos siguen pendientes.
- Next action: máquina de estados, simulador y adaptadores de Meta.
- Owner: Codex para código local; equipo para credencial y gasto autorizado.

### 2026-08-15 — Conversación, simulador y contrato de Meta implementados

- Status: `HECHO LOCAL · INTEGRACIONES EXTERNAS PENDIENTES`.
- Completed: máquina de estados efímera con TTL y tope de tres repreguntas;
  simulador `/whatsapp`; adaptadores de entrada/salida de Meta; `GET` de
  verificación y `POST` con comprobación HMAC `x-hub-signature-256`, deduplicado
  de mensajes y hash de sesión; notificación por barrio; descarga en memoria y
  STT Groq sin archivo temporal. El envío externo exige
  `WHATSAPP_SEND_ENABLED=true` y la notificación real exige token de operador.
- Verified: machine-verified — `npm test`: 5/5 pruebas pasan; `npx tsc
  --noEmit`: exit 0 (2026-08-15). Las pruebas cubren saludo, abstención, orden de
  estafa, normalización Meta e identidad hash.
- Decisions: `WHATSAPP_GRAPH_VERSION` es obligatoria y no se fija en código para
  evitar una versión de Graph obsoleta; el número crudo sólo vive transitoriamente
  en memoria para poder responder/notificar y nunca se usa como llave o log.
- Safety: cero llamadas externas y cero datos reales; firma de webhook obligatoria;
  audio limitado a 10 MB y procesado como `Blob`; envío real apagado por defecto.
- Remaining/blocker: faltan pruebas con credenciales, URL HTTPS y número de Meta;
  el agrupado/debounce de varios mensajes consecutivos no está implementado y no
  debe afirmarse en el demo; la notificación desde la UI del tablero aún falta.
- Next action: conectar el control del tablero, ejecutar build y completar guías
  operativas/evidencia; luego el equipo realiza las pruebas externas.
- Owner: Codex para código/docs; equipo para Meta, credenciales, gasto y observación.

### 2026-08-15 — WhatsApp primero (decisión y especificación)

- Status: `DECIDIDO Y DOCUMENTADO · SIN CÓDIGO`.
- Completed: consulta con un jurado del evento; [ADR 0006](adr/0006-whatsapp-primero.md)
  con la decisión de canal, la bajada de modelo y la elección de STT;
  [`WHATSAPP.md`](WHATSAPP.md) con la arquitectura del canal, la máquina de
  estados, los pasos de Meta y las limitaciones reales; este plan reescrito con
  la ruta de ejecución de 14 horas y el orden de corte.
- Decisions: WhatsApp es el canal principal y la web se conserva completa con dos
  usuarios; un núcleo y tres superficies, con el simulador invocando el mismo
  handler que el webhook; `claude-sonnet-5` en vez de `claude-opus-5`; Groq
  `whisper-large-v3-turbo` para audio, descartando cualquier tier gratuito que
  entrene con los datos.
- Safety: se identificaron dos huecos nuevos —el número de teléfono como dato
  personal y la promesa del audio, que solo es cierta en la web— y quedan como
  reglas 12 y 13 de `SEGURIDAD.md`.
- Remaining/blocker: el pendiente 1 sigue siendo el mismo desde el 15 de agosto
  temprano — el clasificador nunca se ha ejecutado contra ningún modelo.
- Next action: paso 1 de la ruta de ejecución.
- Owner: equipo de hackathon.

### 2026-08-15 — Organización del repositorio

- Status: `HECHO`.
- Completed: los cinco productos descartados y sus 19 documentos, 4 ADRs y 9
  PDFs pasaron a `archivo/`. Documentación de Contados reescrita: README raíz,
  este plan, `PRODUCTO.md`, `SEGURIDAD.md`, `EVIDENCIA.md`, `PRUEBAS.md`,
  `VIDEO.md` y ADR 0005.
- Decisions: se conservan solo los límites de seguridad del blueprint de Ruta
  Clara. Las capturas del canal quedan excluidas del repositorio por contener
  nombre y foto de una persona real.
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
