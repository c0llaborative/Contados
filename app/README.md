# Contados

> «Todavía no nos han dicho nada, **solo nos tienen contados** y estamos esperando que nos den la ayuda.»
> — Felipe Varela, damnificado del terremoto del 10 de agosto de 2026, a EFE

Para recibir cualquier ayuda hay que atravesar cinco compuertas:

**Reporte → Censo → Evaluación técnica → Registro en el RUD → Subsidio**

Nadie le dice a una familia en cuál está trabada. No existe consulta por cédula
en la UNGRD ni en ninguna de las alcaldías revisadas: todo es presencial, sin
número de radicado, y el resultado llega «por SMS o listados en la alcaldía».

Contados le dice a la familia en qué compuerta está, qué sigue y dónde hacerlo,
si está en riesgo de quedar excluida y por qué, y le genera el único instrumento
que sí tiene reloj legal. En agregado y anonimizado, produce la cifra que hoy no
existe: cuánta gente está detenida en cada paso.

**El canal principal del damnificado es WhatsApp** (código `CURRENT LOCAL`,
conexión Meta pendiente). Ver
[`../docs/WHATSAPP.md`](../docs/WHATSAPP.md) y el
[ADR 0006](../docs/adr/0006-whatsapp-primero.md). Esta app es la superficie web:
`/` para el damnificado, `/tablero` para el coordinador municipal, y `/whatsapp`
(`CURRENT`) para la conversación.

## Correr

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # obligatorio: sin esto /api/diagnose falla
npm install
npm test
npm run dev
```

Abre <http://localhost:3000>. El tablero está en `/tablero`.

Las variables del canal de WhatsApp están en
[`../docs/WHATSAPP.md`](../docs/WHATSAPP.md).
Los cuatro secretos locales se crean una sola vez con
`npm run setup:whatsapp-secrets`; el comando cancela si alguno ya tiene valor y
nunca imprime los valores.

## Qué hace la IA

**`claude-sonnet-5`** (`CURRENT LOCAL`; aprobado 15/15 automático y manual en
los cinco casos sintéticos del MVP, evidencia EV-030) con
**structured outputs y schema estricto**
(`additionalProperties: false`, ver `lib/nucleo/schema.ts`). También se puede
comparar `gpt-4o-mini`; ver [ADR 0007](../docs/adr/0007-modelos-mvp.md):

1. **Relato caótico → estado del caso.** «Vino una señora con chaleco y anotó en
   un cuaderno» = intento de censo, no registro en RUD.
2. **Riesgo de exclusión** contra los modos de falla documentados
   (arrendatarios, tenencia informal, titular ausente, sin documentos).
3. **Abstención obligatoria.** Si el relato no alcanza, devuelve
   `compuerta: null` y pregunta lo que falta. Nunca inventa un estado.
4. **Detección de suplantación**, porque hay denuncias verificadas de personas
   haciéndose pasar por funcionarios.

**En esta app web** la voz se transcribe en el navegador (Web Speech API,
`es-CO`) y el audio no sale del dispositivo. El campo de texto siempre está
disponible. **Esa promesa no aplica al canal de WhatsApp**, donde el audio pasa
por Meta y por el proveedor de transcripción — ver
[`../docs/SEGURIDAD.md`](../docs/SEGURIDAD.md) regla 12.

## Lo que este producto NO hace

- **No lo registra ante ninguna entidad.** Solo el Consejo Municipal de Gestión
  del Riesgo puede inscribir en el RUD.
- **No evalúa si una vivienda es segura o habitable.** Eso lo hace un
  profesional en la visita técnica.
- **No radica** el derecho de petición. Lo genera; usted lo radica.
- **No promete** que la ayuda llegue.
- No pide cédula, datos bancarios ni huella.

## La tesis jurídica

La Ley 1523 de 2012 **no fija plazo en días** para completar el censo, hacer la
evaluación técnica ni entregar la ayuda: solo fija principios. El único reloj
que existe es el del derecho de petición — 15 días hábiles, Ley 1755 de 2015,
art. 14.

> El Estado no tiene plazo para censarlo. Usted sí puede ponerle uno.

Por eso el instrumento no es un generador de plantillas: es el mecanismo que
convierte una espera indefinida en una obligación con fecha.

## Estructura

```
lib/nucleo/       Schema, clasificador, conversación, petición, corpus y rutas
lib/canales/      Adaptadores de Meta, firma, envío y transcripción
lib/fixtures.ts   54 casos sintéticos deterministas para el tablero
app/api/diagnose  Relato → compuerta + riesgos (structured outputs)
app/api/peticion  POST web y GET temporal cifrado del derecho de petición
app/api/whatsapp  Verificación y webhook firmado de Meta
app/whatsapp      Simulador con el mismo handler de conversación
app/tablero       Agregado por compuerta y por barrio
```

El modelo de datos no se inventó: es el ciclo de **Primero / CPIMS+** (UNICEF,
open source, 40 países) — `identification → registration → assessment →
referral → service_tracking → closure` — que mapea 1:1 con las cinco compuertas
colombianas.

## Pendiente

- Revisar visualmente `/whatsapp` y `/tablero` en 412×915.
- Conectar y probar Meta. Groq STT pasó con audio sintético y ZDR reportado;
  todavía no prueba voces humanas ni el transporte de audio desde Meta.
- Grabar los tres audios sintéticos.
- Prueba de falsa expectativa: que alguien ajeno recorra el flujo y luego se le
  pregunte «¿usted quedó registrado ante la alcaldía?». Si duda, el copy está
  mal.

Los datos de personas en la demostración son **100% sintéticos**.
