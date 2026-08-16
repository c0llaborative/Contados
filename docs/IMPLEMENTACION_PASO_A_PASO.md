# Runbook de implementación y entrega — Contados

- Estado: `CURRENT · EN EJECUCIÓN`.
- Fecha: 2026-08-16 (America/Bogota).
- Owner técnico: Codex.
- Owners de cuentas, credenciales, pagos, publicación y pruebas humanas: equipo
  de hackathon.
- Fuente de estado general: [`PLAN.md`](PLAN.md).
- Siguiente acción exacta: Gate 6. Publicar el repositorio y desplegar con
  envíos apagados; la URL HTTPS desbloquea el webhook de Gate 7.

Este documento es el procedimiento operativo. No reemplaza el plan vivo: explica
cómo ejecutar cada paso, qué resultado esperar, qué evidencia conservar y
cuándo detenerse.

## Tablero de avance

| # | Gate | Estado actual | Owner | Criterio de cierre |
|---|---|---|---|---|
| 0 | Alcance del MVP congelado | `HECHO` | Equipo + Codex | Simulador garantizado; Meta/audio cortables |
| 1 | Clasificador | `HECHO` | Equipo + Codex | Sonnet 5 aprobado 15/15, EV-030 |
| 2 | Código restante | `HECHO` | Codex + equipo | Debounce, enlace, pruebas y revisión 412×915 |
| 3 | STT Groq | `HECHO` | Equipo + Codex | ZDR observado + audio sintético pasa |
| 4 | Secretos de WhatsApp | `HECHO` | Codex | Cuatro valores aleatorios y separados |
| 5 | Meta Developer | `HECHO CON RIESGO` | Equipo | Credenciales válidas; sin 2FA y sin expiración visible |
| 6 | Repositorio y despliegue | Repo `HECHO`; despliegue `PENDIENTE` | Equipo + Codex | URL HTTPS vinculada a commit identificado |
| 7 | Webhook Meta | `PENDIENTE` | Equipo + Codex | Challenge aceptado con envío apagado |
| 8 | Meta extremo a extremo | `PENDIENTE` | Equipo + Codex | Saludo, P0, estafa y audio pasan |
| 9 | Notificación | `HECHO EN SIMULADOR`; real pendiente | Equipo + Codex | Barrio correcto recibe el aviso |
| 10 | Falsa expectativa | `PENDIENTE` | Persona externa | Comprende que no quedó registrada |
| 11 | Video | `PENDIENTE` | Equipo | Export final ≤60 s, sin PII |
| 12 | Release | `PENDIENTE` | Equipo + Codex | Quality gate, hash, commit y publicación aprobada |

## Reglas que aplican a todos los pasos

1. Nunca pegar claves, tokens, teléfonos o App Secret en chat, documentos,
   capturas, commits o logs.
2. Todos los relatos, nombres, audios y barrios usados en pruebas son sintéticos.
3. `WHATSAPP_SEND_ENABLED=false` hasta que el webhook esté verificado y el
   equipo autorice una prueba supervisada.
4. Un resultado con mocks o sin llamada confirmada no se presenta como prueba
   de Anthropic, Groq, Meta o Vercel.
5. Si un relato ambiguo recibe una compuerta inventada, el modelo falla aunque
   acierte todos los demás casos.
6. Si Meta consume más de 90 minutos, se corta y se graba con el simulador.
7. Si audio amenaza el cronograma o ZDR no está confirmado, se corta audio.
8. Codex ejecuta toda tarea técnica posible; el equipo sólo realiza acciones que
   necesitan cuentas, secretos, pagos, aprobaciones, grabación o juicio humano.

## Gate 1 — Seleccionar y aprobar el clasificador

### 1.1 Obtener la clave de Anthropic — `USER-OBSERVED: HECHO`

El equipo reportó el 2026-08-15 que ya obtuvo una API key de Anthropic. Esto no
prueba saldo, cuota, permisos ni funcionamiento y no revela la clave.

Revisar en la consola:

- organización correcta;
- clave exclusiva para Contados;
- nombre reconocible, por ejemplo `contados-hackathon-demo`;
- alerta o límite de gasto más bajo que permita la cuenta;
- método de pago o crédito disponible, si la plataforma lo exige.

Evidencia a conservar: captura de organización/límite sin mostrar la clave.

### 1.2 Guardar la clave localmente — `HECHO · VERIFICADO SIN EXPONER LA CLAVE`

Owner: equipo. Codex no debe recibir ni ver el valor.

En PowerShell:

```powershell
cd C:\Users\SEBASTIAN\Projects\Hackaton-colombia-tech-week\app
Copy-Item .env.example .env.local
notepad .env.local
```

Dejar configurado:

```env
AI_CLASSIFIER_PROVIDER=anthropic
AI_CLASSIFIER_MODEL=claude-sonnet-5
ANTHROPIC_API_KEY=PEGAR_LA_CLAVE_REAL_AQUI
WHATSAPP_SEND_ENABLED=false
```

No cambiar todavía variables de Meta ni Groq. Guardar y cerrar el editor.

Resultado esperado: existe `app/.env.local`, está ignorado por git y las tres
variables del clasificador tienen valor. El equipo informa solamente:

```text
ANTHROPIC listo en app/.env.local
```

Stop conditions:

- la clave fue pegada en otro archivo;
- `.env.local` aparece en `git status`;
- la consola muestra saldo inesperado o una organización equivocada.

Recuperación: revocar la clave expuesta, crear otra y eliminarla de cualquier
captura o archivo incorrecto antes de continuar.

**Comprobación 2026-08-15:** tras el primer reporte `ANTHROPIC listo`, Codex
verificó las tres ubicaciones probables y `app/.env.local` no existía. No se leyó
ninguna clave y no se llamó a Anthropic. Repetir la creación y confirmar que
Notepad no lo guardó como `.env.local.txt`.

**Recuperación aplicada:** Codex creó `app/.env.local` con proveedor/modelo,
clave vacía y envío de WhatsApp apagado. El equipo sólo debe pegar la clave en
la línea `ANTHROPIC_API_KEY=` y guardar.

### 1.3 Ejecutar P0 — `HECHO · 15/15 AUTOMÁTICO Y MANUAL`

Owner: Codex. Después del aviso del equipo, Codex:

1. verifica variables sin imprimir valores;
2. ejecuta `npm test`, typecheck y build;
3. levanta la app local;
4. ejecuta `npm run eval:model`;
5. revisa las 15 respuestas, no sólo el exit code;
6. registra modelo exacto, 15 resultados y latencias;
7. actualiza plan y evidencia.

Cierre: `15/15 pasan`. Si Sonnet no pasa, no se graba.

#### HISTORICAL · intentos y correcciones previos

**Avance 2026-08-15:** la integración respondió correctamente después de
corregir el JSON Schema y 15/15 reglas iniciales pasaron. Sin embargo, la
revisión manual encontró inferencias no citadas, alertas demasiado amplias y
tratamiento de tú/vos. EV-025 conserva las respuestas y su hash. Sonnet aún no
está aprobado; Codex debe endurecer prompt/evaluador y repetir las 15 llamadas.

**Corrección aplicada:** se agregaron barreras en prompt, posprocesado y
evaluador; `npm test` pasa 7/7, typecheck y build pasan. Próximo control: una
ronda de cinco inferencias antes del P0 completo para no gastar llamadas si
persiste un defecto.

**Probe reforzado:** `3/5`. Persistieron dos inferencias indebidas: convertir
“anotó” en “tomó sus datos” y una explicación oral en “constancia formal”. El
modelo sigue sin aprobar. Es válido preguntar si hubo identificación o
constancia; no es válido afirmar que existieron.

**Segundo probe:** `5/5` automático pero fallo manual: el caso de estafa recibió
`reporte` sin evidencia de un reporte oficial. Se endureció el cierre esperado
a `compuerta: null`; una visita sospechosa no completa la ruta.

**Tercer probe:** `4/5`. Se aclaró que chaleco + anotación + falta de seguimiento
se ubica provisionalmente en `censo`, siempre sin afirmar oficialidad. También
se añadió una barrera que sustituye ejemplos de documentos no verificados por
“pregunte qué alternativa admite la autoridad y pida respuesta por escrito”.

**Cuarto probe:** `4/5` automático, `3/5` manual. Desde ahora “anotó datos” y
“sin identificación” fallan si el relato sólo dijo “anotó” o “iban de civil”.

**Quinto probe:** `5/5` automático y manual. Habilita, pero no sustituye, el P0
completo de 15 respuestas y su revisión.

**P0 endurecido EV-026:** `14/15`, mediana 5881 ms; `FAIL`. La revisión manual
también encontró una alerta `ausente_en_visita` sin evidencia. El archivo JSONL
está sellado con SHA-256 en el registro; no se modifica ni aprueba Sonnet aún.

**Corrección posterior:** los seis riesgos tienen disparadores deterministas y
las acciones piden respuesta escrita. Suite final 7/7, typecheck y build pasan;
un fixture obsoleto falló primero y fue corregido para aportar la evidencia que
pretendía verificar.

**Segundo P0 EV-027:** `14/15`, mediana 6406 ms; `FAIL`. La reincidencia en
“constancia formal” demuestra que el prompt solo no es una frontera suficiente.
Se requiere normalización determinista antes de una nueva aprobación.

**Normalizador listo:** roles/documentos agregados en hechos vuelven a la cita
literal y razones con documentos no narrados se sustituyen por texto neutro.
Pruebas 7/7, typecheck y build pasan. Falta la corrida decisiva de 15.

**Corrida EV-028:** `15/15` automático, mediana 6153 ms, pero `FAIL` manual por
sugerir “autorización del propietario” sin respaldo. La razón y acción de todas
las alertas pasan a ser copy determinista; el modelo sólo seleccionará el riesgo.

**Copy determinista listo:** 7/7 pruebas, typecheck y build pasan. El próximo P0
de 15 es el cierre de Gate 1; no se harán más iteraciones de prompt en este gate.

**P0 EV-029:** `15/15` automático, pero `FAIL` manual por “le tomaron datos” y
“anotó los datos” sin soporte literal. La razón pasa a ser totalmente fija por
compuerta y esa paráfrasis se limpia en preguntas antes del cierre definitivo.

**Defensa final verificada localmente:** 7/7 pruebas, typecheck y build pasan.
Falta únicamente el P0 de cierre 15/15 y su revisión manual.

#### CURRENT · cierre aprobado

**Cierre EV-030:** `claude-sonnet-5`, `effort: medium`, thinking desactivado;
15/15 automático y revisión manual aprobada. Mediana 6445 ms, mínimo 4735 y
máximo 7604 ms. El JSONL y SHA-256 están en `EVIDENCE_REGISTER.md`. Alcance:
cinco relatos sintéticos, no desempeño con relatos reales.

### 1.4 Comparar GPT-4o mini sólo si hace falta — `NO ABIERTO`

Se abre este paso si Sonnet falla o si el equipo quiere medir el ahorro.

No se abre para el MVP: Sonnet pasó el gate y agregar otra credencial/proveedor
no aporta valor suficiente a la demo. Se conserva como contingencia.

Owner equipo: crear clave de OpenAI y guardarla en `.env.local` sin compartirla.
Configuración:

```env
AI_CLASSIFIER_PROVIDER=openai
AI_CLASSIFIER_MODEL=gpt-4o-mini
OPENAI_API_KEY=PEGAR_LA_CLAVE_REAL_AQUI
```

Owner Codex: repetir exactamente el mismo P0. Selección:

1. 15/15 obligatorio;
2. menor mediana de latencia;
3. costo como desempate;
4. si ninguno pasa, selección manual de compuerta.

## Gate 2 — Cerrar el código pendiente

Owner: Codex.

Estado: `HECHO` desde 2026-08-15. No requirió credenciales ni llamadas
externas. Decisiones vigentes:

- ventana de silencio: 12 segundos, configurable entre 10 y 15 s;
- webhook confirma recepción y completa el lote con `after()`;
- cola/deduplicación en memoria: suficiente para demo de una instancia, no
  garantía multi-instancia;
- enlace de petición autocontenido, cifrado y válido 15 minutos;
- `PETICION_LINK_SECRET` será un cuarto secreto independiente en Gate 4;
- si falta ese secreto, se conserva la petición web y WhatsApp no inventa URL.

**Avance 2026-08-15:** agrupado, deduplicación, reintento, serialización por
sesión, generador compartido y token cifrado de 15 minutos implementados. Suite
17/17, typecheck y build pasan. Prueba HTTP local: válido 200, alterado 404,
expirado 410 y caché desactivada. No hubo llamadas externas.

**HISTORICAL — primer intento visual:** el navegador integrado no estaba
conectado. Se conservó el gate abierto hasta la conexión posterior de Chrome.

**Cierre visual 2026-08-15 23:30 America/Bogota:** Chrome conectado por el
equipo y controlado por Codex. `/whatsapp` y `/tablero` pasaron en viewport
412×915: ancho de documento 397 px igual al contenido, cero overflow horizontal;
tabla 357/357 px; botones del simulador 357 px y controles del tablero 313 px;
saludo visible sin desbordar; cero errores o warnings de consola. No se envió
nada a Meta ni se usaron relatos o teléfonos reales. EV-031.

1. Implementar agrupación/debounce de mensajes consecutivos de 10–15 s.
2. Garantizar una sola clasificación para un relato dividido en varios mensajes.
3. Extraer el generador de petición al núcleo.
4. Crear enlace temporal aleatorio y no adivinable para la petición.
5. Definir expiración y recuperación del enlace.
6. Probar reintentos, duplicados, expiración, proveedor caído y límites.
7. Revisar visualmente `/whatsapp` y `/tablero` en viewport 412×915.

Cierre: pruebas, tipos y build limpios; documentos actualizados; ninguna
afirmación pendiente presentada como construida.

### Procedimiento para repetir la revisión visual 412×915

Owner de observación: equipo. Owner de corrección y registro: Codex.

Estado: `HECHO` el 2026-08-15 23:30 America/Bogota; se conserva como prueba de
regresión para cambios posteriores.

Preparación: no usar datos, teléfonos ni relatos reales. Conectar el navegador
integrado a Codex; si no está disponible, abrir la app local y activar el modo
responsive del navegador con ancho `412`, alto `915` y zoom `100%`.

1. Abrir `/whatsapp`. Resultado esperado: título, campos, conversación,
   textarea y ambos botones caben; no hay desplazamiento horizontal.
2. Escribir `hola` y luego un relato sintético. Resultado esperado: las burbujas
   y el enlace largo parten línea; nada queda oculto o superpuesto.
3. Abrir `/tablero`. Resultado esperado: encabezados, cifras, tabla y acción de
   notificación son legibles y utilizables sin corte horizontal.
4. Conservar sólo el resultado `pasa/falla`, la ruta, el viewport, navegador y
   hora. Una captura es opcional y debe excluir teléfonos, tokens y relatos
   reales.

Detenerse si aparece un token real, dato personal, desbordamiento horizontal,
texto cortado o control inaccesible. No publicar ni activar Meta. Recuperación:
cerrar la pestaña, borrar cualquier captura sensible y reportar exactamente la
ruta y el elemento que falla; Codex corrige y repite la revisión. La observación
no autoriza despliegue ni uso con personas damnificadas.

## Gate 3 — Activar Groq para notas de voz

Owner equipo:

1. crear una API key exclusiva para Contados;
2. abrir Data Controls de la organización;
3. activar Zero Data Retention;
4. conservar captura sin clave, correo, teléfono o facturación;
5. guardar en `.env.local`:

```env
GROQ_API_KEY=PEGAR_LA_CLAVE_REAL_AQUI
STT_MODEL=whisper-large-v3-turbo
```

6. informar `GROQ listo y ZDR activado`.

El equipo graba fuera del repositorio un audio sintético de 15–25 segundos:

> La casa se agrietó toda, vino una señora con un chaleco y anotó en un
> cuaderno, pero nadie más volvió. Yo pago arriendo.

Owner Codex: probar transcripción, diagnóstico, no persistencia y logs.

Avance 2026-08-15: clave presente y modelo correcto, verificados sin mostrar el
secreto; `.env.local` continúa ignorado. El reporte `groq listo` no confirma ZDR,
por lo que todavía no se realizó ninguna llamada externa.

Evidencia externa 2026-08-15: el equipo reportó `ZDR activado` (`user-observed`).
Alcance autorizado: una prueba con audio sintético; no audio real ni Meta.

Intento técnico 1: `System.Speech` no pudo inicializar el motor local y no creó
audio. No hubo llamada externa. Recuperación: intentar SAPI local; si no existe,
el equipo graba el texto sintético indicado fuera del repositorio.

Intento técnico 2: SAPI creó 496.292 bytes; Groq respondió en 1.976 ms y el
clasificador devolvió `censo`. La voz robótica fue transcrita como `arendo`, por
lo que faltó la alerta `arrendatario`. Estado: `PASS PARCIAL`, no cierre. Se
intentará una voz española/mejor articulada; si no existe, aplica la grabación
humana sintética prevista.

Cierre 2026-08-15: una repetición controlada con la voz española Microsoft
Helena produjo 494.498 bytes. Groq transcribió el texto exacto en 1.456 ms;
Anthropic devolvió `censo` y alerta `arrendatario`. Suite 19/19, typecheck y
build pasan. Cero audio generado en el repositorio, cero coincidencias de la
clave fuera de `.env.local`, cero logs sensibles y temporales eliminados.
EV-032. Esto prueba audio sintético local, no voz humana ni Meta.

Cierre: transcripción correcta, `censo`, alerta `arrendatario`, cero archivo y
cero audio/log sensible. Si falla, audio sale del MVP.

## Gate 4 — Generar secretos propios de WhatsApp

Owner equipo. Ejecutar cuatro veces:

```powershell
[Convert]::ToHexString(
  [Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
).ToLower()
```

Guardar valores distintos:

```env
WHATSAPP_VERIFY_TOKEN=PRIMER_VALOR
SESION_SAL=SEGUNDO_VALOR
NOTIFICAR_ADMIN_TOKEN=TERCER_VALOR
PETICION_LINK_SECRET=CUARTO_VALOR
```

No reutilizar API keys, contraseñas ni el mismo valor entre campos.

Avance 2026-08-16: Codex ejecutó el generador local seguro. Se crearon cuatro
valores de 32 bytes/64 caracteres hexadecimales, todos distintos y sin imprimir
ninguno. El script cancela si una variable ya tiene valor para evitar rotación
accidental. Envíos reales permanecen apagados. Falta verificación final y build.

Cierre 2026-08-16: cuatro valores válidos/únicos, 0 coincidencias fuera de
`.env.local`, plantilla vacía, archivo ignorado/no rastreado y envíos apagados.
19/19 pruebas, typecheck y build pasan; cero llamadas externas. EV-033.

## Gate 5 — Preparar Meta Developer

Owner equipo:

Estado: `EN CURSO` desde 2026-08-16. El equipo reportó que los valores de API
Setup están disponibles; falta guardarlos localmente y verificarlos sin revelar
su contenido.

Verificación 2026-08-16: después del reporte `credenciales listas`, las cuatro
variables Meta seguían ausentes de `app/.env.local`. El archivo permanece
ignorado y `WHATSAPP_SEND_ENABLED=false`. Se inicia recuperación por ubicación;
no se llama a Meta ni se da el gate por aprobado.

Diagnóstico de recuperación: las cuatro líneas estaban en el archivo correcto,
pero con dos espacios al inicio del nombre. Los valores no se revelaron. Se
normalizarán únicamente esos prefijos y se repetirá el gate de aislamiento.

Segundo diagnóstico: nombres ya corregidos, pero el access token largo estaba
bajo `META_APP_SECRET` y `WHATSAPP_TOKEN` contenía un ID numérico. La versión
Graph tampoco tenía forma `vN.N`. El Phone Number ID es numérico, pero sólo la
etiqueta de Meta permite distinguirlo del WABA ID. Gate 5 sigue abierto y no se
ha llamado a Meta.

Reverificación: versión, access token y Phone Number ID cumplen formato; falta
el App Secret real. La URL pública no es necesaria para esos datos: sólo será
necesaria al registrar el callback HTTPS en Gate 7.

Avance final de credenciales: el equipo confirmó la etiqueta `Phone number ID`
y guardó App Secret. Machine-verified: cuatro formatos mínimos válidos, únicos,
sin espacios/duplicados; 10 valores sensibles escaneados, 0 fugas; archivo
ignorado/no rastreado y envíos apagados. Un chequeo intermedio dio falso negativo
por regex demasiado restrictiva, no por credenciales incorrectas. Falta registrar
2FA, expiración del token y límite de destinatarios, además de pruebas/build.

Regresión local: 19/19 pruebas, typecheck y build pasan con 10 rutas; cero
llamadas externas.

Cierre 2026-08-16 con riesgo registrado: el equipo reportó que **no hay 2FA
activa** y que ni la expiración del token ni el límite de destinatarios aparecen
en su consola. Gate 5 se cierra porque las cuatro credenciales están verificadas
en formato, unicidad y aislamiento, y porque el alcance sigue acotado a número de
prueba con envíos apagados. No se cierra afirmando lo que no se observó: los tres
datos quedan como riesgo abierto, no como verificados. Si el webhook o el envío
fallan por autenticación, la primera hipótesis es token vencido y la recuperación
es regenerarlo reemplazando sólo `WHATSAPP_TOKEN`. Activar 2FA queda como acción
obligatoria antes de cualquier uso no sintético.

1. activar 2FA en administradores;
2. identificar propietario y, si es posible, segundo administrador;
3. crear/configurar app `Contados CTW 2026` con producto WhatsApp;
4. usar número de prueba;
5. agregar sólo uno o dos teléfonos del equipo;
6. abrir WhatsApp > API Setup;
7. copiar localmente token, `PHONE_NUMBER_ID` y versión Graph visible;
8. tomar App Secret desde la configuración de la app;
9. registrar expiración y límites que muestre la consola;
10. guardar en `.env.local`:

```env
WHATSAPP_GRAPH_VERSION=vXX.X
WHATSAPP_TOKEN=TOKEN_REAL
WHATSAPP_PHONE_NUMBER_ID=ID_REAL
META_APP_SECRET=APP_SECRET_REAL
WHATSAPP_SEND_ENABLED=false
```

El equipo informa sólo: `Credenciales Meta listas; envío apagado`.

### Gate 5A — Encontrar y verificar cada dato sin URL pública

Owner de la consola y credenciales: equipo. Owner de verificación local: Codex.
La URL pública **no** es prerrequisito: sólo se usará para el callback en Gate 7.

#### Preparación

1. Abrir `developers.facebook.com/apps` en una ventana privada, sin compartir
   pantalla ni grabar.
2. Elegir la app por nombre y App ID esperados. Si hay dos apps parecidas,
   detenerse hasta identificar al propietario correcto.
3. Confirmar que la cuenta tiene rol administrador/desarrollador y 2FA. No pedir
   ni compartir códigos de autenticación.
4. Abrir localmente `app/.env.local`; nunca `.env.example`.
5. Mantener `WHATSAPP_SEND_ENABLED=false` y `APP_PUBLIC_URL=` vacío.

#### A. Versión Graph

1. En la app, abrir **WhatsApp → API Setup**; en algunas vistas aparece como
   **Getting Started**.
2. Buscar la URL o ejemplo `curl` para enviar mensajes:
   `https://graph.facebook.com/vN.N/<ID>/messages`.
3. Copiar únicamente `vN.N`, incluida la `v` minúscula, a
   `WHATSAPP_GRAPH_VERSION`.
4. Esperado: formato `v` + entero + punto + entero; no copiar la URL completa.

#### B. Access token temporal

1. En la misma pantalla localizar **Temporary access token**.
2. Copiarlo con el botón de Meta y pegarlo únicamente en `WHATSAPP_TOKEN`.
3. Registrar aparte su expiración visible, sin registrar el token.
4. Esperado: cadena larga; no es App Secret, App ID, Phone Number ID ni WABA ID.
5. Si está vencido, generar otro desde el flujo oficial y reemplazar sólo esta
   variable. No guardar ambos.

#### C. Phone Number ID

1. En **API Setup**, seleccionar el número de prueba en **From** si existe ese
   selector.
2. Localizar dos etiquetas distintas: **Phone number ID** y **WhatsApp Business
   Account ID**.
3. Copiar exclusivamente **Phone number ID** a
   `WHATSAPP_PHONE_NUMBER_ID`.
4. Esperado: identificador numérico interno, no el teléfono visible con `+57`.
5. El WABA ID no se usa en el código actual; conservarlo fuera del env sólo si
   Meta lo exige en un paso futuro.

#### D. App Secret

1. En el menú de la misma app abrir **App settings → Basic**.
2. Localizar **App Secret** y seleccionar **Show**.
3. Completar personalmente la reautenticación/2FA de Meta.
4. Copiar el valor únicamente a `META_APP_SECRET`.
5. Esperado: es distinto del access token y del **Client Token**. No pulsar
   **Reset** ni rotarlo durante esta preparación.
6. Si **Show** no aparece, detenerse: normalmente falta rol suficiente o se
   abrió otra app. No crear una app duplicada como recuperación.

#### E. Verificación y evidencia segura

Guardar el archivo y reportar sólo:

`Phone Number ID confirmado y App Secret guardado; envío apagado; token vence
<fecha/hora>; límite de destinatarios <cantidad>`.

Codex comprobará presencia, formato, no duplicación, aislamiento en Git y gate
de envío sin imprimir valores ni llamar a Meta. Evidencia permitida: nombre de
la app, hora, expiración y límites. No guardar capturas de API Setup/App Secret;
pueden incluir token, IDs, correo o datos del número.

#### Condiciones de parada y recuperación

- Si Meta pide Callback URL, se entró al área de webhook: volver; corresponde a
  Gate 7 y necesita despliegue HTTPS.
- Si aparece pago, verificación empresarial o registro de un número propio,
  detenerse; el Gate 5 usa el número de prueba y no autoriza esos cambios.
- Si un secreto aparece en chat, commit, captura o log, detener, borrar la copia
  insegura y rotar únicamente la credencial expuesta.
- Si el token vence después del gate, reemplazar sólo `WHATSAPP_TOKEN`; no rotar
  App Secret ni los cuatro secretos propios.
- Si se confunden Phone Number ID y WABA ID, volver a la etiqueta de API Setup y
  corregir una sola variable. No probar envíos para adivinar.

## Gate 6 — Repositorio y despliegue

Owner equipo decide y aprueba:

- repositorio público o privado;
- cuenta propietaria de GitHub;
- cuenta de Vercel;
- autorización de commit/push/despliegue/publicación.

Owner Codex antes de publicar:

- pruebas, typecheck y build;
- PII/secrets scan;
- enlaces y contradicciones;
- documentación/evidencia;
- diff review.

En Vercel: importar repo, Root Directory `app`, Next.js, cargar secretos en el
entorno correcto y mantener `WHATSAPP_SEND_ENABLED=false`. Conservar URL, ID del
deploy, commit y hora.

## Gate 7 — Conectar el webhook

Owner equipo en Meta:

1. Callback URL: `https://<dominio>/api/whatsapp`.
2. Verify token: valor exacto de `WHATSAPP_VERIFY_TOKEN`.
3. Suscribir campo `messages`.

Resultado esperado: Meta acepta el challenge. Si falla, conservar código HTTP,
mensaje, hora y pantalla sin secreto. No rotar todas las credenciales a la vez.

Cuando el challenge pase y el equipo autorice la prueba:

```env
WHATSAPP_SEND_ENABLED=true
```

Redesplegar. Enviar `hola` desde el teléfono permitido. El primer mensaje debe
declarar no registro, no cédula, no datos bancarios y no huella. Si no llega
primero, detenerse.

## Gate 8 — Meta extremo a extremo

Ejecutar con datos sintéticos:

1. `hola` → aviso de seguridad.
2. `Se me cayó la casa` → pregunta, nunca compuerta inventada.
3. tres respuestas `no sé` → el sistema se rinde honestamente.
4. caso arrendataria → `censo` + alerta.
5. relato de cobro/huella → posible estafa primero.
6. nota de voz sólo con ZDR observado → mismo resultado que texto.

Evidencia: fecha/hora, modelo, duración, ID de evento, pass/fail y captura con
teléfono oculto. Nunca guardar token, número completo o audio real.

## Gate 9 — Notificación

Simulador:

1. abrir `/whatsapp`;
2. seleccionar Manizales y barrio San José;
3. completar diagnóstico;
4. abrir `/tablero`;
5. notificar San José;
6. volver al simulador y revisar avisos.

Debe llegar sólo al barrio correcto. Meta real se prueba sólo dentro de la
ventana permitida y con autorización; no se busca aprobación de plantillas si
amenaza el cronograma.

## Gate 10 — Prueba humana de falsa expectativa

Owner: persona ajena al desarrollo. Recorre el flujo sin ayuda. Pregunta final:

> ¿Usted quedó registrado ante la alcaldía?

Debe responder que no; Contados sólo explicó situación y siguiente acción.
Preguntar también qué hace, qué datos entregaría, si la ayuda está garantizada
y si el documento está radicado. Si duda, Codex corrige copy antes de grabar.

Evidencia: `participante externo`, fecha, respuestas textuales y cambios; no
nombre completo.

## Gate 11 — Video

Seguir [`VIDEO.md`](VIDEO.md). Orden:

1. grabar primero `/whatsapp`;
2. diagnóstico y exclusión;
3. petición;
4. tablero y notificación;
5. exportar ≤60 s;
6. repetir con Meta sólo si EXT-META-001 pasa perfectamente.

Antes de grabar: modo No molestar; cerrar correo, WhatsApp personal, consolas,
Meta, Vercel y administradores de contraseñas. Si se usa salida prevalidada,
rotular `Respuesta prevalidada para demostración`.

## Gate 12 — Release

Owner Codex:

1. pruebas, tipos y build;
2. revisión visual móvil;
3. PII/secret scan;
4. enlaces, contradicciones y comandos;
5. plan, README, changelog y evidencia;
6. hash del video;
7. diff final.

Owner equipo aprueba expresamente: publicación, despliegue, envío real, video,
track y descripción. No hacer commit/push apresurado antes del gate.

## Contingencias y orden de corte

1. Cortar notas de voz.
2. Cortar Meta real y conservar simulador.
3. Nunca cortar P0, aviso de no registro, abstención, notificación ni video.
4. Si ningún modelo pasa, usar selección manual de compuerta y declararlo.
5. Tras la prueba real, volver `WHATSAPP_SEND_ENABLED=false` y rotar/revocar
   tokens temporales según corresponda.
