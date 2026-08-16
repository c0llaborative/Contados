# Contados

> «Todavía no nos han dicho nada, **solo nos tienen contados** y estamos
> esperando que nos den la ayuda.»
> — Felipe Varela, damnificado del terremoto del 10 de agosto de 2026, a EFE

**Una familia damnificada manda un audio por WhatsApp contando qué le pasó. En
segundos sabe en qué paso va su ayuda, qué sigue, dónde hacerlo, y recibe el
borrador del único documento que obliga al Estado a responderle en 15 días.**

Al mismo tiempo, y sin que nadie llene un formulario extra, esas conversaciones
producen la cifra que hoy no existe: **dónde se detiene la gente**. Con ella, un
coordinador municipal decide a qué barrio mandar primero los ingenieros que le
faltan — y avisa. El aviso llega al WhatsApp de la familia.

Hac[k]athon CTW 2026 · Track 02, Justicia · [Video de 1 minuto](#) ·
Licencia [AGPL-3.0](LICENSE)

---

## El problema

Tras el terremoto, para recibir cualquier ayuda hay que pasar cinco pasos:

**Reporte → Censo → Evaluación técnica → Registro en el RUD → Subsidio**

Nadie le dice a una familia en cuál va. Lo verificamos: **no existe consulta de
estado por cédula** en la UNGRD ni en ninguna de las cinco alcaldías que
revisamos. Todo es presencial, sin número de radicado, y el resultado llega «por
SMS o listados en la alcaldía».

El efecto es doble, y esa es la clave:

- **La familia** hace filas que no le corresponden, o deja de hacer la única que
  sí. Y los que más se caen del proceso son los que ya estaban peor: los
  arrendatarios, los que no tienen escritura, los que perdieron los documentos.
- **El municipio** tampoco sabe. No tiene cómo ver dónde se está acumulando la
  fila, así que reparte ingenieros escasos sin datos. En Manizales la Alcaldía
  pidió 500 ingenieros para revisar más de 2.000 edificaciones.

Nadie es el malo aquí. **Falta el dato, y falta del lado de los dos.**

La evidencia completa, con fuentes, está en
[`docs/EVIDENCIA.md`](docs/EVIDENCIA.md).

## A quién le sirve, y qué gana

| | Qué hace hoy | Qué gana con Contados |
|---|---|---|
| **Familia damnificada** | Va presencialmente a preguntar, sin radicado, y vuelve | Manda un audio y sabe en qué paso va, qué sigue y dónde. Se entera si está en riesgo de quedar por fuera, **antes** de que pase. Y recibe aviso cuando la atención llega a su barrio |
| **Coordinador municipal / UNGRD** | Reparte ingenieros escasos sin saber dónde se acumula la fila | Ve en qué paso están detenidos los hogares y en qué barrios. Prioriza con un dato que hoy no existe, y notifica a un barrio con un clic |

**El círculo se cierra solo.** La conversación que ayuda a la familia produce el
dato que ayuda al municipio; y la decisión del municipio vuelve a la familia como
un mensaje. Ninguno de los dos tuvo que hacer trabajo extra para que eso pasara.

## Dónde está la IA, y por qué es el núcleo

Sin IA este producto no existe. El insumo es un relato hablado, desordenado y en
lenguaje coloquial —«vino una señora con un chaleco y anotó en un cuaderno»— y la
salida tiene que ser una posición exacta en un proceso administrativo.

1. **La voz se transcribe** con Gemini. La persona no escribe: habla, como le
   hablaría a un vecino. En la demostración se oye el audio real.
2. **`claude-sonnet-5` clasifica el relato** con *structured outputs* y schema
   estricto: en qué paso va, con qué frase textual lo sustenta, y qué riesgos de
   exclusión aparecen.
3. **Se abstiene cuando no le alcanza.** Si el relato no basta, devuelve
   `null` y pregunta, hasta tres veces. **Nunca inventa un paso.** En WhatsApp
   esa abstención no es una limitación: es literalmente el siguiente mensaje.
4. **Detecta suplantación** —hay denuncias verificadas de personas haciéndose
   pasar por funcionarios— y ese aviso va **primero**, antes que cualquier otra
   cosa.

**Lo que el modelo no decide.** Después de seis rondas de pruebas contra el
modelo real, el texto de las alertas y la razón de cada paso dejaron de venir del
proveedor y pasaron a ser copy fijo del producto. El modelo elige el paso y el
riesgo; las palabras que lee una persona angustiada las escribimos nosotros. Cada
iteración quedó registrada, incluidas las que fallaron, en
[`docs/PLAN.md`](docs/PLAN.md).

Resultado medido: **15/15** en los casos P0 con revisión manual, mediana 6,4 s.
El artefacto y su SHA-256 están sellados en
[`EVIDENCE_REGISTER.md`](EVIDENCE_REGISTER.md) (EV-030).

## Probarlo en un minuto

```bash
cd app
cp .env.example .env.local     # pegue ANTHROPIC_API_KEY
npm install && npm run dev
```

Luego, en <http://localhost:3000>:

1. Abra **`/whatsapp`** y toque el micrófono. Suenan dos notas de voz sintéticas
   y aparece su transcripción — se transcriben de verdad, no están escritas a
   mano.
2. Contados responde: el paso, qué hacer y dónde, el riesgo de quedar por fuera,
   y el borrador del derecho de petición.
3. Abra **`/tablero`** *en otra pestaña*, elija el barrio **San José** y pulse
   **Notificar en la demo**.
4. Vuelva al simulador y pulse **Revisar avisos del barrio**.

El simulador no es una maqueta: invoca **el mismo handler** que el webhook de
Meta. Lo que se ve ahí es lo que responde el canal.

## La tesis jurídica

La Ley 1523 de 2012 **no fija plazo en días** para completar el censo, hacer la
evaluación técnica ni entregar la ayuda: sólo fija principios. El único reloj que
existe es el del derecho de petición — 15 días hábiles, Ley 1755 de 2015,
art. 14.

> **El Estado no tiene plazo para censarlo. Usted sí puede ponerle uno.**

Eso separa esto de un generador de plantillas: convierte una espera indefinida en
una obligación con fecha. El oficio cita el corpus normativo con su SHA-256 y
calcula el vencimiento en código.

## Puede vivir después de las 24 horas

- **No pide adopción.** Corre sobre WhatsApp, que la gente ya tiene. No hay app
  que instalar, ni portal que aprender, ni cuenta que crear.
- **No pide permiso para empezar.** No necesita integrarse con los sistemas de
  ninguna entidad: el dato lo aportan las personas. Un municipio puede recibir
  valor sin firmar nada.
- **Es barato de operar.** El clasificador es una extracción de un solo turno,
  sin bucle agéntico ni herramientas: unos centavos por conversación.
- **Es replicable.** La ruta de atención vive en un archivo de datos, no en el
  código. Agregar un municipio es agregar una ruta verificada con su fecha.
- **Es auditable.** AGPL-3.0: una entidad pública puede revisar el código,
  correrlo y exigir que las mejoras vuelvan a la comunidad. Ver
  [`NOTICE.md`](NOTICE.md).

## Cómo está construido

**Un núcleo, tres superficies.** El dominio vive en `app/lib/nucleo/`, sin
dependencias de Next.js. WhatsApp, el simulador y la web invocan el mismo
handler, así que no hay dos implementaciones que puedan divergir. El núcleo
entrega texto semántico y cada superficie lo presenta a su manera: el simulador
lo maqueta con tarjetas y un riel de cinco pasos; WhatsApp, con negrita, saltos
de línea y `🟢🟢⚪⚪⚪ paso 2 de 5`. Nadie reescribe ni resume: sólo se separa lo
que el núcleo ya distingue.

| Superficie | Usuario |
|---|---|
| **WhatsApp** | Damnificado — canal principal |
| Web `/whatsapp` | Damnificado sin WhatsApp; misma conversación |
| Web `/` | Damnificado; captura y pasos |
| Web `/tablero` | Coordinador municipal / UNGRD |

Detalles que importan: el estado de cada conversación vive **fuera del proceso**,
en Redis con 30 minutos de vida, porque en serverless dos mensajes seguidos
pueden caer en instancias distintas y la persona no tiene por qué contar su
historia dos veces; agrupación de mensajes de 12 s para que una historia
partida en varios audios reciba **un** diagnóstico; enlace del derecho de
petición cifrado con AES-256-GCM y válido 15 minutos; el número de teléfono nunca
se usa como identificador ni se escribe en un log —la llave es su hash con sal—
y el número crudo sólo vive dentro de la sesión, que se borra a los 30 minutos;
el audio se procesa en memoria y no toca disco; y los envíos reales exigen una
compuerta de configuración explícita.

Verificación: `npm test` · `npx tsc --noEmit` · `npm run build`.

## Lo que Contados NO hace

Lo decimos aquí y lo dice el producto en su primer mensaje, siempre:

- **No lo registra ante ninguna entidad.** Sólo el Consejo Municipal de Gestión
  del Riesgo puede inscribir en el RUD.
- **No evalúa** si una vivienda es segura o habitable.
- **No radica** el derecho de petición. Lo genera; usted lo radica.
- **No promete** que la ayuda llegue.
- **No pide** cédula, datos bancarios ni huella.

## Límites honestos de esta entrega

Preferimos decirlos a que los descubra el jurado:

- **El WhatsApp real sólo le contesta a teléfonos registrados de antemano.** El
  canal corre sobre un número de prueba de Meta, y un número de prueba únicamente
  puede responderle a los teléfonos que estén en su lista de destinatarios
  autorizados. A cualquier otro, Meta recibe el mensaje y rechaza la respuesta
  (`131030`): la persona no ve un error, ve silencio. Lo comprobamos el 16 de
  agosto de 2026 probando desde dos teléfonos, uno registrado y otro no
  ([EV-036](EVIDENCE_REGISTER.md)). Si quiere probar el canal real, díganos el
  número antes; si no, **`/whatsapp` no tiene esa restricción** y es la misma
  conversación.
- El clasificador está aprobado contra **cinco relatos sintéticos**, no contra
  relatos reales. La demostración usa esos casos.
- Las cifras del tablero son **54 casos sintéticos**. Ninguna persona real.
- La transcripción corre hoy sobre el tier gratuito de Google, que **usa el
  contenido para mejorar sus productos**. Es admisible con audio sintético y no
  lo es con la voz real de una persona damnificada; para producción hace falta un
  tier de pago.
- La ruta municipal de Manizales fue verificada el 15 de agosto de 2026 y la
  fecha se muestra en pantalla, porque cambia a diario.

## Documentación

| Pregunta | Documento |
|---|---|
| Qué es Contados y por qué funciona así | [`docs/PRODUCTO.md`](docs/PRODUCTO.md) |
| La evidencia del problema | [`docs/EVIDENCIA.md`](docs/EVIDENCIA.md) |
| Cómo funciona el canal de WhatsApp | [`docs/WHATSAPP.md`](docs/WHATSAPP.md) |
| Qué está prohibido decir o hacer | [`docs/SEGURIDAD.md`](docs/SEGURIDAD.md) |
| Por qué este producto y no otro | [`docs/adr/0005-contados.md`](docs/adr/0005-contados.md) |
| Por qué WhatsApp, y por qué Sonnet 5 | [`docs/adr/0006-whatsapp-primero.md`](docs/adr/0006-whatsapp-primero.md) |
| Comparación de Claude, OpenAI, Gemini y Groq | [`docs/adr/0007-modelos-mvp.md`](docs/adr/0007-modelos-mvp.md) |
| Cómo se verifica | [`docs/PRUEBAS.md`](docs/PRUEBAS.md) |
| Estado, decisiones y cada intento fallido | [`docs/PLAN.md`](docs/PLAN.md) |
| Procedencia y hashes de la evidencia | [`EVIDENCE_REGISTER.md`](EVIDENCE_REGISTER.md) |
| Los cinco productos que descartamos | [`archivo/README.md`](archivo/README.md) |

Los datos de personas en la demostración son **100 % sintéticos**.
