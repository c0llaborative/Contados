# Producto — Contados

Estado: `CURRENT LOCAL` · integración real con Meta `PENDIENTE` (ver
[ADR 0006](adr/0006-whatsapp-primero.md))

**Una frase:** Contados le dice por WhatsApp a una familia damnificada en cuál de
las cinco compuertas de la ruta oficial está trabada, qué sigue y dónde hacerlo,
si está en riesgo de quedar excluida y por qué, y le genera el único instrumento
que sí tiene reloj legal.

## Usuario y momento de uso

**Usuario primario:** persona adulta cuyo hogar resultó afectado por el
terremoto, que ya reportó o cree haber reportado, y que lleva días sin saber qué
pasó con su caso. No conoce el vocabulario oficial y no distingue «censo» de
«RUD» — nadie se lo explicó.

**Momento de uso:** después de estar fuera de peligro inmediato, cuando la
espera empieza a sentirse indefinida.

**Usuario secundario:** el coordinador municipal, que hoy no tiene forma de ver
dónde se le está atascando la gente.

## Canales: un núcleo, tres superficies

| Superficie | Usuario | Papel | Estado |
|---|---|---|---|
| **WhatsApp** | Damnificado | **Canal principal.** Conversación, diagnóstico, aviso | `CURRENT LOCAL`; Meta pendiente |
| Web `/whatsapp` | Damnificado sin WhatsApp | Misma conversación, **mismo handler**, otro transporte | `CURRENT` |
| Web `/` | Damnificado | Flujo de captura y compuertas | `CURRENT` |
| Web `/tablero` | Coordinador municipal / UNGRD | El agregado. Es el comprador | `CURRENT` |

El prompt del sistema, el modelo de caso, la conversación, las rutas municipales
y el corpus viven en `app/lib/nucleo/`, sin dependencias de framework. El
generador de peticiones sigue en su ruta web y extraerlo para entregar un enlace
desde WhatsApp queda pendiente. Los canales son adaptadores delgados. **El simulador no es una maqueta: invoca el
mismo handler de conversación que el webhook de Meta.**

La frase que une todo: **WhatsApp es la puerta; la web es el mismo caso visto
desde el otro lado.** El diseño del canal está en [`WHATSAPP.md`](WHATSAPP.md).

### Por qué WhatsApp y no solo web

No fue un pivote. Fue cerrar el hueco de nuestra propia tesis: este documento ya
sostenía que había que **notificar, no obligar a consultar** (principio 1 abajo),
y sin embargo tenía «notificaciones push reales» en *fuera de alcance* — porque
una web app no puede notificar. WhatsApp sí.

Y hay un segundo motivo, técnico: **la abstención obligatoria es conversacional
por diseño.** En la web, `falta_preguntar` era una lista que nadie respondía. En
WhatsApp es el siguiente mensaje.

## Las cinco compuertas

| # | Compuerta | Qué significa |
|---|---|---|
| 1 | Reportar el daño | Avisó que su vivienda resultó afectada. **Reportar no es estar censado.** |
| 2 | Que lo censen | Un funcionario tomó sus datos. No implica estar en el RUD. |
| 3 | Evaluación técnica | Un técnico debe visitar la vivienda. **Es la fila más larga.** |
| 4 | Registro en el RUD | Requisito de las ayudas. Solo el CMGRD puede inscribir. |
| 5 | Recibir el subsidio | El aviso llega por SMS al celular registrado. |

El modelo de datos no se inventó: es el ciclo de **Primero / CPIMS+** (UNICEF,
open source, 40 países) — `identification → registration → assessment →
referral → service_tracking → closure` — que mapea 1:1 con las cinco compuertas
colombianas. Ver `app/lib/schema.ts`.

## Las tres decisiones de diseño que lo definen

### 1. No es un portal de consulta. Notifica.

La lección más valiosa de toda la investigación, de GOV.UK Notify:

> *«Status-tracking tools are often just a channel-shift for anxiety […] it
> would be better just to tell people what we know when we know it.»*

La familia cuenta su situación **una vez**. El sistema le avisa cuando algo
cambia. No la obligamos a entrar a revisar y angustiarse.

> **Este principio es el que forzó el canal.** Una web app no puede notificar, y
> por eso este mismo documento tenía «notificaciones push reales» en *fuera de
> alcance*: predicábamos una tesis que nuestro canal no podía cumplir. WhatsApp
> la cumple. Ver [ADR 0006](adr/0006-whatsapp-primero.md).

### 2. La tesis jurídica, contraintuitiva y por eso sólida

La Ley 1523 de 2012 **no fija plazo en días** para completar el censo, hacer la
evaluación técnica ni entregar la ayuda. Solo fija principios. El único reloj
que existe es el del derecho de petición: **15 días hábiles**, Ley 1755 de 2015
art. 14 (10 días para información).

> **El Estado no tiene plazo para censarte. Tú sí puedes ponerle uno.**

Radicar la petición no es un trámite decorativo: es la única manera de convertir
una espera indefinida en una obligación con fecha. Sin esto, generar un derecho
de petición sería otro generador de plantillas.

Cuando esos 15 días se vencen sin respuesta se abre la vía de tutela, que es la
escalada legalmente correcta. **No está implementada** y no se insinúa en la
interfaz.

### 3. Detecta riesgo de exclusión

Esto es lo que nadie más va a tener. La literatura documenta exactamente quién
queda por fuera de los registros post-desastre, y son siempre los mismos:

- **Arrendatarios** (México 2017)
- **Poseedores sin título** (Houston post-Harvey, Puerto Rico post-María, Brasil)
- **Mujeres cuya vivienda está a nombre de un tercero** fallecido o ausente
- **Personas sin documentos**
- Quienes están *«out of sight, out of reach, out of the loop»* (World Disasters
  Report)

En México, el censo inicial de CDMX registró ~7.000 inmuebles; el rediagnóstico
de 2019 encontró **más de 22.000 viviendas con daño severo** que habían quedado
fuera, y a los seis años el **32%** seguía sin recuperar vivienda.

Contados dice: *«usted es arrendataria y varios apoyos piden acreditar
propiedad — esto es lo que debe pedir para no quedar por fuera»*. Sale de
evidencia, no de intuición.

## Qué hace la IA

Dos modelos, cada uno haciendo lo que sabe hacer.

**Clasificador — `claude-sonnet-5`** (`CURRENT LOCAL`; P0 sintético aprobado
15/15 automático y manual en EV-030).
Structured outputs con schema estricto; `gpt-4o-mini` es el retador configurable
(`additionalProperties: false`, `output_config.effort: medium`,
`thinking: disabled`). La tarea es extracción y clasificación de un solo turno:
sin bucle agéntico, sin herramientas, sin horizonte largo — el caso exacto para
el tier Sonnet. Cuesta 5–7× menos y responde más rápido, que ahora importa porque
en WhatsApp seis segundos de «escribiendo…» se sienten mal. El razonamiento del
cambio y la escalera de escalamiento si falla la abstención están en el
[ADR 0006](adr/0006-whatsapp-primero.md).

**Transcripción — Groq `whisper-large-v3-turbo`** (`CURRENT LOCAL`; prueba API
pendiente). Claude no procesa
audio. No se usa ningún tier gratuito que entrene con los datos: son relatos de
damnificados.

El clasificador hace cinco cosas:

1. **Relato → estado del caso.** Español coloquial y desordenado. *«Vino una
   señora con chaleco y anotó en un cuaderno»* = intento de censo, no RUD.
2. **Clasificador de riesgo de exclusión** contra los modos de falla
   documentados, con la razón y la acción concreta.
3. **Detección de suplantación.** La Alcaldía de Cali tuvo que desmentir a
   personas haciéndose pasar por funcionarios pidiendo datos, fotos y huellas.
4. **Abstención obligatoria.** Si el relato no alcanza, `compuerta: null` y las
   preguntas que faltan. Nunca inventa un estado.
5. **Evidencia por hecho.** Cada hecho lleva la frase textual del relato que lo
   sustenta. Sin cita, el hecho no existe.

Todo lo determinista está en código y **no pasa por el modelo**: el cálculo de
días hábiles, las citas normativas, el destinatario, los conteos del tablero.

## Recorrido de usuario — WhatsApp (`CURRENT EN SIMULADOR`; Meta pendiente)

**1 · Saludo.** El primer mensaje dice qué es Contados y **qué no es**: no lo
registra ante ninguna entidad, y nunca le pediremos cédula, datos bancarios ni
huella. Va primero, no enterrado — es también el antídoto contra la suplantación.

**2 · Contar.** Escribiendo o con nota de voz. Varios mensajes seguidos se leen
como un solo relato.

**3 · Repreguntar si hace falta.** Si el relato no alcanza, el sistema pregunta
lo que falta y reclasifica. **Máximo tres rondas**; después dice honestamente que
no puede ubicarlo con seguridad y da la ruta genérica del municipio. Nunca
inventa una compuerta.

**4 · Diagnóstico.** Si hay señal de estafa, ese mensaje va **primero**. Luego:
dónde está, qué significa, qué sigue y dónde ir en *su* municipio. Las alertas de
exclusión van en mensaje aparte.

**5 · Actuar (`PENDIENTE EN WHATSAPP`).** Le mandará el enlace al derecho de petición con los 15 días hábiles
ya calculados, listo para radicar.

**6 · Le avisamos.** Cuando el coordinador marca en el tablero que la evaluación
técnica llegó a un barrio, el aviso sale a los casos de ese barrio. **Esto es la
tesis funcionando**: la web no podía hacerlo.

## Recorrido de usuario — web

**Damnificado** (`/`, `CURRENT`): un botón grande, «Contar hablando». Voz o
texto, sin cédula. La fila vertical de cinco compuertas con la suya encendida, y
debajo qué significa, qué sigue y dónde ir. Se conserva como puerta de entrada
para quien no use WhatsApp.

**Coordinador** (`/tablero`, `CURRENT`): el agregado por barrio y por compuerta.
*«El 43% de los hogares está detenido en la evaluación técnica»* — la cifra que
hoy no existe. Y desde aquí se dispara el aviso del punto 6.

## Principios de UX (de la investigación, no de gusto)

- **Notificar, no obligar a consultar.** Un portal de estado es una mudanza de
  canal para la angustia.
- **Decir «no sabemos todavía» explícitamente.** El silencio destruye la
  sensación de control más que la mala noticia.
- **Frontload.** Lo que la persona necesita saber va primero.
- **Voz primero y opción de canal.** Mucha gente perdió el celular; el campo de
  texto siempre está disponible.
- **Lenguaje llano, pero cuidado con la crudeza.** Hay un caso documentado de
  GOV.UK donde el lenguaje «claro» angustió al usuario porque le reflejaba su
  propio trauma.
- **Canal de objeción visible.** En Turquía, la ausencia de un mecanismo de
  apelación tras la evaluación de daños escaló a desconfianza masiva.
- **«Registrado» nunca es «aprobado».** Chile tuvo que aclararlo explícitamente:
  *«La sola aplicación de la FIBE no garantiza el acceso a beneficios estatales
  o municipales.»*

## Decisiones técnicas y por qué

| Decisión | Razón |
|---|---|
| Voz transcrita **en el navegador** (Web Speech API, `es-CO`) | La API de Claude no recibe audio. Efecto secundario valioso: el audio nunca sale del dispositivo — **pero esto solo aplica a la web.** En WhatsApp el audio pasa por Meta y por el proveedor de STT; ver `SEGURIDAD.md` regla 12. |
| Un núcleo (`lib/nucleo/`) y adaptadores por canal | La regla de seguridad se escribe una vez y aplica a las tres superficies. El simulador de WhatsApp usa el mismo handler que el webhook, así que no puede divergir del canal real. |
| Estado de conversación **en memoria**, sin base de datos | A esta altura una base de datos es riesgo sin premio. Efecto secundario: nada persiste, que es una postura de retención defendible. Limitación documentada en `WHATSAPP.md`. |
| Oficio **HTML con CSS de impresión**, no PDF generado | Cero dependencias, y en la demo el jurado ve el documento completo en pantalla con la cita y el hash. Se guarda como PDF desde el navegador. |
| Fila **vertical**, no stepper horizontal | En un celular los steppers horizontales aplastan las etiquetas hasta volverlas ilegibles. |
| Modelo de datos tomado de Primero/CPIMS+ | Es el estándar del sector humanitario. No hay razón para inventarlo. |
| Barras del tablero escaladas al máximo, no al total | Se comparan mejor entre sí. La cifra exacta va al lado para que nadie lea solo la barra. |

## Escala

Chile ya validó el patrón con **mifibe.gob.cl**; Japón lo institucionalizó con
el 被災者台帳, que auto-identifica quién es elegible para qué al emitirse el
certificado. El comprador natural son las alcaldías y la UNGRD, que hoy no saben
dónde se atasca su gente. Y sirve para toda emergencia futura, no solo para
esta.

## Fuera de alcance (deliberado)

Integración con sistemas oficiales · radicación automática · tutela · offline /
PWA · multi-municipio · login · mapa · cualquier dato personal real ·
persistencia en base de datos · plantillas aprobadas de WhatsApp para notificar
fuera de la ventana de 24 h · número de WhatsApp de producción con verificación
de Meta.

**Salió de esta lista:** las notificaciones. Dejaron de ser una maqueta y pasan a
implementarse de verdad sobre WhatsApp — es el diferenciador del producto, no un
adorno. Las dos últimas entradas de arriba son los límites reales de esa
notificación al escalar, y están explicados en [`WHATSAPP.md`](WHATSAPP.md).
