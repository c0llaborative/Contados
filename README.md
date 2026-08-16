# Contados — Hac[k]athon CTW 2026

> «Todavía no nos han dicho nada, **solo nos tienen contados** y estamos
> esperando que nos den la ayuda.»
> — Felipe Varela, damnificado del terremoto del 10 de agosto de 2026, a EFE

Estado: `CURRENT LOCAL · GATES 0–5 CERRADOS · DESPLIEGUE Y META EN CURSO`
· Licencia [AGPL-3.0](LICENSE) ([por qué](NOTICE.md))
· Estado detallado en [`docs/PLAN.md`](docs/PLAN.md)

Para recibir cualquier ayuda tras el terremoto hay que pasar cinco pasos:

**Reporte → Censo → Evaluación técnica → Registro en el RUD → Subsidio**

Nadie le dice a una familia en cuál va. No existe consulta de estado por cédula
en la UNGRD ni en ninguna de las cinco alcaldías revisadas: todo es presencial,
sin número de radicado, y el resultado llega «por SMS o listados en la alcaldía».

**Contados es una conversación de WhatsApp.** La persona manda un audio contando
qué pasó —como le hablaría a un vecino— y recibe cuatro cosas: en qué paso va,
qué sigue y dónde hacerlo en su municipio, si está en riesgo de quedar por fuera
y por qué, y el borrador del único instrumento que sí tiene reloj legal. **Y le
avisa cuando la atención llega a su barrio**, en vez de obligarla a volver a
preguntar.

En agregado y anonimizado produce la cifra que hoy no existe: dónde se detiene la
gente. Un coordinador municipal abre el tablero y ve a qué barrio mandar los
ingenieros primero.

> **El Estado no tiene plazo para censarlo. Usted sí puede ponerle uno.**

## Un núcleo, tres superficies

| Superficie | Usuario | Papel | Estado |
|---|---|---|---|
| **WhatsApp** | Damnificado | **Canal principal** | `CURRENT LOCAL`; conexión Meta pendiente |
| Web `/whatsapp` | Damnificado sin WhatsApp | Misma conversación, mismo handler | `CURRENT` |
| Web `/` | Damnificado | Captura y pasos | `CURRENT` |
| Web `/tablero` | Coordinador municipal / UNGRD | El agregado. Es el comprador | `CURRENT` |

**WhatsApp es la puerta; la web es el mismo caso visto desde el otro lado.**
El simulador `/whatsapp` no es una maqueta: invoca **el mismo handler** que el
webhook de Meta, así que lo que se ve ahí es lo que responde el canal.

> **Convención de estados en este repositorio:** `CURRENT` = construido y
> verificado. `PLANEADO` = decidido y especificado, todavía sin código. Nada
> marcado `PLANEADO` puede afirmarse como hecho.

## Correr el producto

```bash
cd app
cp .env.example .env.local     # pegue ahí ANTHROPIC_API_KEY; sin ella /api/diagnose falla
npm install && npm run dev
```

<http://localhost:3000> · simulador en `/whatsapp` · tablero en `/tablero`

Las credenciales van **sólo** en `app/.env.local`, que está en `.gitignore`. No
las exporte en la terminal: quedan en el historial del shell. La conexión
supervisada con Meta está en [`docs/WHATSAPP.md`](docs/WHATSAPP.md), y el envío
real permanece apagado (`WHATSAPP_SEND_ENABLED=false`) hasta una prueba
autorizada.

Verificación local: `npm test` · `npx tsc --noEmit` · `npm run build`.

### Ver la demostración en un minuto

Con la app corriendo, esto es exactamente lo que se ve en el video:

1. Abra `/whatsapp` y **toque el micrófono**. Suenan dos notas de voz sintéticas
   y aparece su transcripción; se transcriben de verdad, no están escritas a
   mano.
2. Contados responde: en qué paso va, qué hacer y dónde, el riesgo de quedar por
   fuera, y el borrador del derecho de petición.
3. Abra `/tablero` **en otra pestaña** —si navega en la misma, la conversación se
   pierde—, elija el barrio San José y pulse **Notificar en la demo**.
4. Vuelva al simulador y pulse **Revisar avisos del barrio**. El aviso llega.

Si no hay clave de transcripción configurada, el micrófono no aparece y la
conversación funciona igual escribiendo el relato.

## Fuentes de verdad

| Pregunta | Documento |
|---|---|
| Estado, bloqueadores y siguiente acción | [`docs/PLAN.md`](docs/PLAN.md) |
| Qué es Contados y por qué funciona así | [`docs/PRODUCTO.md`](docs/PRODUCTO.md) |
| **Cómo funciona el canal de WhatsApp** | [`docs/WHATSAPP.md`](docs/WHATSAPP.md) |
| **Paso a paso operativo hasta la entrega** | [`docs/IMPLEMENTACION_PASO_A_PASO.md`](docs/IMPLEMENTACION_PASO_A_PASO.md) |
| Qué está prohibido decir o hacer | [`docs/SEGURIDAD.md`](docs/SEGURIDAD.md) |
| Por qué este producto y no otro | [`docs/adr/0005-contados.md`](docs/adr/0005-contados.md) |
| **Por qué WhatsApp, y por qué Sonnet 5** | [`docs/adr/0006-whatsapp-primero.md`](docs/adr/0006-whatsapp-primero.md) |
| **Cómo se comparan Claude, OpenAI, Gemini y Groq** | [`docs/adr/0007-modelos-mvp.md`](docs/adr/0007-modelos-mvp.md) |
| La evidencia del problema | [`docs/EVIDENCIA.md`](docs/EVIDENCIA.md) |
| Cómo se verifica | [`docs/PRUEBAS.md`](docs/PRUEBAS.md) |
| El video de entrega | [`docs/VIDEO.md`](docs/VIDEO.md) |
| Cómo correr el código | [`app/README.md`](app/README.md) |
| Historia de cambios | [`CHANGELOG.md`](CHANGELOG.md) |
| Procedencia y hashes | [`EVIDENCE_REGISTER.md`](EVIDENCE_REGISTER.md) |
| Los cinco productos descartados | [`archivo/README.md`](archivo/README.md) |

## Estructura

```
app/                      El producto. Next.js 16 + TypeScript.
  lib/nucleo/             CURRENT — dominio compartido, sin Next.js.
  lib/canales/whatsapp/   CURRENT LOCAL — adaptadores del canal.
  app/api/whatsapp/       CURRENT LOCAL — webhook firmado de Meta.
  app/whatsapp/           CURRENT — simulador = mismo handler, otro transporte.
docs/                     Documentación vigente de Contados.
  adr/                    Decisiones de arquitectura, con sus alternativas.
evidence/runtime/         Corridas selladas con SHA-256. No se editan.
archivo/                  Los cinco productos descartados. Nada de ahí aplica.
deck-CTW-2026.pdf         Reglas, tracks y rúbrica del evento.
```

El mapa completo de qué se mueve y por qué está en la tabla «Qué vamos a
modificar» de [`docs/PLAN.md`](docs/PLAN.md).

## Qué hace la IA

Dos modelos, cada uno haciendo lo que sabe hacer:

- **Clasificador — `claude-sonnet-5`** (`CURRENT LOCAL`; P0 sintético aprobado
  15/15, EV-030).
  Puede compararse con `gpt-4o-mini` sin cambiar código. Es extracción de un
  solo turno con schema estricto: sin bucle agéntico, sin herramientas. 5–7× más
  barato y más rápido que Opus, que importa porque en WhatsApp seis segundos de
  «escribiendo…» se sienten mal. Razonamiento completo en el
  [ADR 0007](docs/adr/0007-modelos-mvp.md).
- **Transcripción de las notas de voz** (`CURRENT`; verificada con audio
  sintético). El proveedor es intercambiable con `STT_PROVIDER` y hay un solo
  punto de transcripción, así que el webhook de Meta y el simulador no pueden
  divergir. Hoy corre con **Gemini**; Groq `whisper-large-v3-turbo` sigue
  soportado y fue el primero en pasar la prueba (EV-032). El audio se procesa en
  memoria y no se escribe a disco.

  > **Límite declarado:** el tier gratuito de Google usa el contenido para
  > mejorar sus productos. Es admisible con el audio sintético de esta demo y
  > **no** lo es con la voz real de una persona damnificada. Antes de cualquier
  > uso real hace falta un tier de pago o equivalente.

El clasificador corre con **structured outputs y schema estricto**
(`additionalProperties: false`):

1. **Relato caótico → estado del caso.** «Vino una señora con chaleco y anotó en
   un cuaderno» = intento de censo, no registro en RUD.
2. **Riesgo de exclusión** contra los modos de falla documentados: arrendatarios,
   tenencia informal, titular ausente, personas sin documentos.
3. **Abstención obligatoria.** Si el relato no alcanza, devuelve
   `compuerta: null` y pregunta lo que falta. Nunca inventa un estado. **En
   WhatsApp eso se vuelve conversación**, con tope de tres rondas.
4. **Detección de suplantación**, porque hay denuncias verificadas de personas
   haciéndose pasar por funcionarios. Ese mensaje va **primero**.

### Dónde va la voz, exactamente

Tres caminos distintos, y conviene no confundirlos:

| Superficie | Qué pasa con el audio |
|---|---|
| Web `/` | Se transcribe con la Web Speech API del navegador. **Ojo:** en Chrome esa API envía el audio a servidores de Google; no es transcripción estrictamente local, y decir lo contrario sería falso |
| Simulador `/whatsapp` | La nota de voz sube al proveedor de transcripción configurado, se procesa en memoria y no se escribe a disco |
| WhatsApp real | La nota pasa además por Meta antes de llegar al proveedor |

En ningún caso guardamos el audio. Lo que no podemos prometer es que no salga del
dispositivo, porque en las tres superficies sale. Ver
[`docs/SEGURIDAD.md`](docs/SEGURIDAD.md) regla 12.

## La tesis jurídica

La Ley 1523 de 2012 **no fija plazo en días** para completar el censo, hacer la
evaluación técnica ni entregar la ayuda: solo fija principios. El único reloj
que existe es el del derecho de petición — 15 días hábiles, Ley 1755 de 2015,
art. 14.

> **El Estado no tiene plazo para censarlo. Usted sí puede ponerle uno.**

Eso es lo que separa esto de un generador de plantillas: convierte una espera
indefinida en una obligación con fecha.

## Lo que Contados NO hace

- **No lo registra ante ninguna entidad.** Solo el Consejo Municipal de Gestión
  del Riesgo puede inscribir en el RUD.
- **No evalúa si una vivienda es segura o habitable.**
- **No radica** el derecho de petición. Lo genera; usted lo radica.
- **No promete** que la ayuda llegue.
- No pide cédula, datos bancarios ni huella.

Los datos de personas en la demostración son **100% sintéticos**.
