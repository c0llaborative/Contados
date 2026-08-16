# ADR 0006 — WhatsApp primero, con la web como segunda superficie

> La selección y los precios de modelos de este ADR quedan complementados y, si
> hay conflicto, reemplazados por [ADR 0007](0007-modelos-mvp.md). La afirmación
> de latencia de Groq no fue medida en este proyecto y no debe citarse como hecho.

- Fecha: 2026-08-15
- Estado: **ACEPTADO**
- Complementa: [ADR 0005](0005-contados.md) — no lo supersede. El producto sigue
  siendo Contados; cambia el canal por el que llega a la familia.
- Track: **02 — Justicia**

## Contexto

Tras construir el corte vertical en web, consultamos a un jurado del evento. Su
observación: **la experiencia debería ocurrir en WhatsApp**, porque es la
herramienta más usada en Latinoamérica y porque llegar por ahí gana confianza en
una población que desconfía de aplicaciones nuevas.

Al revisar nuestra propia documentación encontramos que la observación no era un
pivote sino **la pieza que le faltaba a nuestra tesis**. `PRODUCTO.md` ya decía,
citando a GOV.UK Notify:

> *«Status-tracking tools are often just a channel-shift for anxiety […] it would
> be better just to tell people what we know when we know it.»*

Y de ahí salía nuestro principio de UX número uno: **notificar, no obligar a
consultar**. Pero una web app no puede notificar. Por eso `PRODUCTO.md` tenía
«notificaciones push reales» en *fuera de alcance*: el producto **predicaba** una
tesis que su canal **no podía cumplir**. WhatsApp sí puede.

Hay un segundo hallazgo, técnico y más fuerte: **la abstención obligatoria es
conversacional por diseño y la web la estaba desperdiciando.** El clasificador ya
devuelve `falta_preguntar` cuando no puede ubicar la compuerta. En la web eso se
pinta como una lista que nadie responde. En WhatsApp, `falta_preguntar[0]` **es**
el siguiente mensaje: el sistema pregunta, la persona contesta, se reclasifica.
La conversación ya estaba construida; le faltaba el canal.

## Decisión

**1. WhatsApp es el canal principal del damnificado.** Es la superficie que se
muestra en el video y la que define el pitch.

**2. La web se conserva completa, con dos usos**, no como respaldo degradado:

| Superficie | Usuario | Papel |
|---|---|---|
| WhatsApp | Damnificado | Canal principal. Conversación, diagnóstico, aviso |
| Web `/whatsapp` | Damnificado sin WhatsApp | Misma conversación, mismo handler, otro transporte |
| Web `/` | Damnificado | Flujo actual de captura y compuertas. Se conserva |
| Web `/tablero` | Coordinador municipal / UNGRD | El agregado. Es el comprador |

**3. Un solo núcleo, tres superficies.** El prompt del sistema, el modelo de caso,
las rutas municipales, el corpus normativo y el generador de peticiones salen de
las rutas de Next.js y pasan a `app/lib/nucleo/`, sin dependencias de framework.
Los canales son adaptadores delgados.

**4. El simulador no es una maqueta.** La página `/whatsapp` invoca **el mismo
handler de conversación** que el webhook de Meta, con la misma forma de mensaje.
No hay dos implementaciones. Eso significa que el simulador es a la vez el plan
de contingencia para grabar el video **y** la versión web para el damnificado.

**5. El clasificador baja de `claude-opus-5` a `claude-sonnet-5`.** Ver más
abajo.

**6. La transcripción de audio se hace con un modelo distinto a Claude**, porque
Claude no procesa audio. Ver más abajo.

## Por qué Sonnet 5 y no Opus 5

La tarea del clasificador es extracción y clasificación de un solo turno con
schema estricto: sin bucle agéntico, sin herramientas, sin horizonte largo. Es
exactamente el caso para el que existe el tier Sonnet.

Tres razones concretas:

1. **En Opus 5 el *thinking* está encendido por defecto.** Nuestro código no pasa
   el parámetro `thinking`, así que estábamos pagando razonamiento que nunca
   pedimos.
2. **La latencia pasó a importar.** En web, seis segundos con un *spinner* se
   toleran. En WhatsApp, seis segundos de «escribiendo…» se sienten mal.
3. **Costo.** Con sistema ≈700 tokens, relato ≈300 y salida JSON ≈600:

| Modelo | Costo aprox. por diagnóstico | Nota |
|---|---|---|
| **Sonnet 5** | **~$0.008** | Precio introductorio $2/$10 por MTok hasta 2026-08-31 |
| Opus 5 | ~$0.02 mínimo; con thinking on, $0.04–0.06 | 5–7× más caro y más lento |
| Haiku 4.5 | ~$0.004 | **Descartado**: la abstención y las citas literales son justo donde un modelo pequeño falla |

Configuración adoptada:

```ts
model: 'claude-sonnet-5',
max_tokens: 2000,                 // el JSON no pasa de ~800; 16000 era innecesario
thinking: { type: 'disabled' },   // latencia; el schema estricto ya acota la salida
output_config: {
  effort: 'medium',
  format: { type: 'json_schema', schema: DIAGNOSTICO_SCHEMA },
},
```

**El riesgo es bajo porque el clasificador nunca se había probado contra ningún
modelo** (era el pendiente 1 de `PLAN.md`). Probar Sonnet 5 cuesta exactamente lo
mismo que probar Opus 5, y si falla la prueba de abstención el escalamiento es
cambiar un string, en este orden:

`effort: 'high'` → `thinking: { type: 'adaptive' }` → `model: 'claude-opus-5'`

Nota: el prompt del sistema (~700 tokens) queda **por debajo del mínimo cacheable
de Sonnet 5** (1024 tokens), así que agregar `cache_control` no haría nada. No se
implementa.

## Por qué un modelo distinto para el audio

Claude no procesa audio, así que hace falta un servicio aparte. Esto da una línea
limpia de arquitectura: **cada modelo hace lo que sabe hacer.**

| Opción | A favor | En contra |
|---|---|---|
| **Groq `whisper-large-v3-turbo`** ← elegida | Multilingüe; USD 0,04/hora publicado; ZDR configurable | Un proveedor más; latencia local pendiente de medir |
| Gemini Flash (audio nativo) | Acepta OGG/Opus directo, tier gratuito | **El tier gratuito entrena con los datos.** Con relatos de damnificados eso es inaceptable; el tier pagado no tiene el problema |
| OpenAI Whisper API | Predecible, ~$0.006/min | Algo más lento |
| OpenRouter | — | **Descartado**: es principalmente un router de LLMs de texto, no una capa de STT |

**Condición de aceptación:** verificar la política de datos y las cuotas vigentes
del proveedor **antes de grabar**. Si Groq no cumple, se cae a OpenAI Whisper
(pagado). No se usa ningún tier gratuito que entrene con los datos.

Esto tiene una consecuencia de seguridad que se documenta explícitamente y no se
esconde: **la promesa «el audio nunca sale del dispositivo» solo aplica a la
web.** Ver [`SEGURIDAD.md`](../SEGURIDAD.md) regla 12.

## Consecuencias

**Positivas**

- El producto por fin puede **notificar**, que era su propia tesis desde el día
  uno. La notificación disparada desde el tablero cierra el círculo entre los dos
  usuarios: coordinador → damnificado.
- La abstención obligatoria deja de ser una lista muerta en pantalla y se
  convierte en una conversación con tope de tres rondas.
- Un núcleo compartido significa que la regla de seguridad se escribe una vez y
  aplica a los tres canales.
- Menor costo y menor latencia por diagnóstico.

**Negativas y aceptadas**

- **El estado de conversación vive en memoria**, con TTL. Se pierde al reiniciar
  el proceso. Una base de datos es riesgo sin premio a esta altura. Se documenta
  como limitación; además es una postura de retención defendible.
  **Revisado el 2026-08-16:** la limitación se volvió un fallo en cuanto el
  producto corrió en más de una instancia —la sesión desaparecía entre un mensaje
  y el siguiente— y el estado pasó a Redis con el mismo TTL de 30 minutos. La
  postura de retención se sostiene; la afirmación «se pierde al reiniciar el
  proceso» ya no es cierta y queda aquí sólo como registro de lo que se decidió
  ese día.
- **Fuera de la ventana de 24 h de WhatsApp no se puede escribir libre**: hace
  falta una plantilla aprobada por Meta. En el demo la ventana está abierta, pero
  es una restricción real para escalar la notificación proactiva. Se documenta en
  [`WHATSAPP.md`](../WHATSAPP.md), no se oculta.
- **El número de teléfono es dato personal**, y en la práctica identifica más que
  la cédula. Se guarda solo como hash con sal. Ver `SEGURIDAD.md` regla 13.
- **El audio pasa por Meta y por el proveedor de STT.** Se borra apenas se
  transcribe, y la promesa de la web se acota explícitamente.
- **Riesgo de dilución del pitch** al tener dos canales. Se mitiga en el guion,
  no en el producto: WhatsApp ocupa ~40 s del video, el tablero ~15 s, y el flujo
  web del damnificado **0 s**. Existe en el repo, se menciona en una frase.

## Condiciones de aceptación

1. ⬜ Núcleo extraído a `app/lib/nucleo/`, sin dependencias de Next.js.
2. ⬜ **Clasificador probado contra `claude-sonnet-5`**: los tres casos y la
   prueba de abstención de [`PRUEBAS.md`](../PRUEBAS.md). Sigue siendo el único
   bloqueador vivo, heredado del ADR 0005.
3. ⬜ Máquina de estados conversacional con tope de tres rondas de repregunta.
4. ⬜ `/api/whatsapp` implementa el contrato real de Meta Cloud API (verificación
   `GET` + recepción `POST` + envío por Graph API).
5. ⬜ `/whatsapp` (simulador) invoca el mismo handler, no una copia.
6. ⬜ Notificación disparada desde el tablero funcionando extremo a extremo.
7. ⬜ Aviso de no-registro y de «no pedimos cédula ni datos bancarios» en el
   **primer** mensaje de WhatsApp, no enterrado.

## Reversión

Si el adaptador de Meta no conecta a tiempo, **no se revierte nada**: el
simulador usa el mismo handler, el video se graba ahí, y el repositorio conserva
el adaptador real más [`WHATSAPP.md`](../WHATSAPP.md) explicando exactamente qué
falta para encenderlo. Es una entrega honesta y demuestra que se entendió el
canal.

Si el clasificador falla la prueba de abstención con Sonnet 5 y con Opus 5, aplica
la reversión ya definida en el [ADR 0005](0005-contados.md): se entrega el flujo
con selección manual de compuerta y se declara que la clasificación automática
quedó fuera de alcance. **No se cambia de producto ni de canal a esta altura.**
