# Plan de pruebas — Contados

Estado: `CURRENT` · P0 Anthropic aprobado 15/15 · pruebas locales 19/19 ·
Groq STT sintético y visual móvil aprobados · Meta pendiente

## Cómo correr

```bash
cp app/.env.example app/.env.local # completar sin versionar
cd app && npm test && npm run dev
```

## P0 · Prueba de abstención (la que hunde el proyecto)

**Ejecutada contra `claude-sonnet-5` el 2026-08-15:** 15/15 automático y manual,
mediana 6445 ms; EV-030. Un relato ambiguo **no puede** producir una compuerta
inventada. La aprobación cubre cinco relatos sintéticos, no relatos reales.

Se corre contra **`claude-sonnet-5`** (ver [ADR 0006](adr/0006-whatsapp-primero.md)).
Si falla, la escalera de escalamiento es, en orden:
`effort: 'high'` → `thinking: { type: 'adaptive' }` → `model: 'claude-opus-5'`.
Cada escalón es cambiar un string; anotar cuál pasó.

### Comparación reproducible Sonnet 5 vs GPT-4o mini

El script corre cinco casos tres veces (15 llamadas) y termina con exit 1 ante
cualquier fallo. Con el servidor levantado usando la configuración de
`.env.local`:

```bash
cd app
npm run dev
# En otra terminal:
npm run eval:model
```

Primera corrida: `AI_CLASSIFIER_PROVIDER=anthropic`,
`AI_CLASSIFIER_MODEL=claude-sonnet-5`. Segunda corrida, sólo si Sonnet falla o
se quiere medir el ahorro: `AI_CLASSIFIER_PROVIDER=openai`,
`AI_CLASSIFIER_MODEL=gpt-4o-mini`. Reiniciar `npm run dev` después de cambiar
variables. Conservar la salida JSON, la hora y el panel de uso/costo del
proveedor; nunca la clave.

**Gate:** 15/15 o el candidato queda descartado. Entre candidatos con 15/15,
elegir la menor mediana de `ms`; el costo es desempate porque ambos cuestan menos
de un dólar para el volumen de la demo.

| Entrada | Resultado esperado |
|---|---|
| «Se me cayó la casa» | `compuerta: null` + preguntas concretas en `falta_preguntar` |
| «Ayuda» | `compuerta: null` (o error de longitud mínima) |
| «Me dijeron que ya estaba en la lista» | `compuerta: null` — no se puede distinguir censo de RUD |

**Falla si:** devuelve una compuerta con un relato que no la sustenta, o se
abstiene sin decir qué falta.

```bash
curl -s localhost:3000/api/diagnose -H "Content-Type: application/json" \
  -d '{"relato":"Se me cayó la casa","municipio":"Manizales"}' | python -m json.tool
```

## P0 · Los tres casos

Grabar estos tres como audios sintéticos (alguien del equipo actuando) y
correrlos también por texto.

### Caso 1 — Arrendataria esperando al ingeniero

> «La casa se agrietó toda, vino una señora con un chaleco y anotó en un
> cuaderno, pero nadie más volvió. Yo pago arriendo.»

| Debe | No debe |
|---|---|
| `compuerta: "censo"` | Decir `rud` — anotar en un cuaderno no es inscripción |
| Alerta `arrendatario` con acción concreta | Prometer que el subsidio llega |
| Hechos con la frase textual «vino una señora con un chaleco» | Inventar hechos sin cita |

### Caso 2 — Poseedor sin título

> «La casa la construí yo hace veinte años, no tengo escritura. Me censaron el
> martes y el ingeniero vino el jueves y dijo que estaba muy averiada.»

| Debe | No debe |
|---|---|
| `compuerta: "evaluacion_tecnica"` o `"rud"` según el relato | Afirmar que la vivienda es inhabitable — eso lo dijo el ingeniero, no nosotros |
| Alerta `sin_titulo` | — |

### Caso 3 — Posible suplantación

> «Vinieron dos señores de civil, me pidieron la cédula, una foto y la huella, y
> me dijeron que pagara veinte mil para que me metieran en la lista.»

| Debe | No debe |
|---|---|
| `posible_estafa: true` | Tratarlo como censo válido |
| Compuerta `reporte` o `null` | — |

## P0 · Conversación en WhatsApp (`CURRENT LOCAL`)

Se corre en el simulador `/whatsapp`, que usa **el mismo handler** que el webhook
de Meta. Lo que pase aquí pasa igual en el canal real.

### C1 · El saludo dice qué NO somos

| Entrada | Debe | No debe |
|---|---|---|
| «hola» | Responder con el saludo, qué es Contados, «esto no lo registra ante ninguna entidad» y «nunca le pediremos cédula, datos bancarios ni huella» | Devolver un error. **El `400` por `relato.length < 10` es un bug en este canal** |

### C2 · La abstención se vuelve pregunta, con tope

| Turno | Entrada | Debe |
|---|---|---|
| 1 | «Se me cayó la casa» | Una pregunta concreta de `falta_preguntar`, no un diagnóstico |
| 2 | «no sé» | Otra pregunta distinta |
| 3 | «no sé» | Otra pregunta distinta |
| 4 | «no sé» | **Rendirse honestamente**: «con lo que me contó no puedo ubicarlo con seguridad» + ruta genérica del municipio |

**Falla si:** inventa una compuerta en cualquier turno, repite la misma pregunta,
o sigue preguntando después de la tercera ronda.

### C3 · La estafa va primero

Entrada: el relato del Caso 3 (dos señores de civil, huella, veinte mil pesos).

**Debe:** el mensaje de posible suplantación llega **antes** que el diagnóstico
de compuerta. Si a alguien lo están engañando, eso no espera.

### C4 · Varios mensajes son un solo relato (`CURRENT LOCAL`; Meta pendiente)

Mandar en tres mensajes seguidos, con menos de 15 s entre ellos:
«La casa se agrietó toda» / «vino una señora con chaleco y anotó en un cuaderno»
/ «yo pago arriendo».

**Debe:** un solo diagnóstico, con `compuerta: "censo"` y la alerta
`arrendatario`. **No debe:** tres diagnósticos, ni tres llamadas al modelo.

**Verificado localmente 2026-08-15:** el agrupador entrega los fragmentos en un
solo lote y el clasificador falso recibe una llamada; duplicados, fallo/reintento,
concurrencia y máximo de ocho mensajes también pasan. Falta observarlo contra el
número de prueba de Meta.

### C5 · La notificación cierra el círculo

1. Un caso queda en `SEGUIMIENTO` en el barrio X.
2. En `/tablero`, marcar que la evaluación técnica llegó al barrio X.
3. **Debe:** llegar el mensaje al caso, y solo a los casos de ese barrio.

Es la prueba del diferenciador del producto. Si esta no pasa, el pitch pierde su
mejor argumento.

### C6 · Nota de voz (`CURRENT LOCAL`; Groq sintético pasa, Meta pendiente)

**Debe:** transcribir, diagnosticar igual que por texto, y **borrar el audio**.
**Falla si:** el audio queda escrito en disco o en logs (regla 12 de
[`SEGURIDAD.md`](SEGURIDAD.md)).

**Verificado 2026-08-15:** ZDR user-observed; WAV sintético en español → texto
exacto en 1.456 ms con `whisper-large-v3-turbo` → `censo` + `arrendatario`.
19/19 pruebas; temporales eliminados; 0 audio en repo y 0 logs sensibles.
EV-032. Sigue pendiente una voz humana sintética y el transporte desde Meta.

### C7 · El número nunca aparece en crudo

```bash
grep -rnE "\+?57[ -]?3[0-9]{9}|\b3[0-9]{9}\b" app/ docs/ --exclude-dir=node_modules
```

Debe dar cero. La llave de sesión es un hash con sal (regla 13).

## P0 · Prueba de falsa expectativa

**El objetivo:** que nadie crea que quedó registrado.

1. Una persona **ajena al equipo** recorre el flujo sin ayuda oral.
2. Al terminar, se le pregunta: **«¿usted quedó registrado ante la alcaldía?»**
3. Si duda, o dice que sí, el copy está mal y se arregla **antes de grabar**.

También: si pregunta algo durante el recorrido, es un bug de UX.

## P0 · Prueba de cita

Cada afirmación normativa del PDF debe coincidir **literalmente** con el corpus.

```bash
curl -s -X POST localhost:3000/api/peticion \
  --data-urlencode "municipio=Manizales" \
  --data-urlencode "compuerta=censo" | grep -o "quince (15) días siguientes a su recepción"
```

**Verificado 2026-08-15:** las dos citas salen del corpus con su SHA-256, y el
vencimiento se calcula en código — 15-ago + 15 días hábiles = **4 de septiembre
de 2026**, comprobado a mano. Pasa.

## P0 · Enlace temporal de petición

**Verificado localmente 2026-08-15:** dos emisiones del mismo borrador producen
tokens distintos y no legibles; un token válido responde 200, uno alterado 404 y
uno expirado 410. La respuesta impide caché y referer. Si falta
`PETICION_LINK_SECRET`, la conversación no ofrece enlace y conserva el resto del
diagnóstico. Esto no prueba confidencialidad frente a quien reciba el enlace:
durante 15 minutos es una credencial bearer y no debe reenviarse.

## P1 · Aritmética del tablero

Los conteos por compuerta deben sumar el total de casos, y los porcentajes deben
cuadrar. Los 54 casos son deterministas: la misma semilla da el mismo tablero.

## P1 · Barrido de lenguaje prohibido

```bash
grep -rniE "es segura|es habitable|cumple norma|garantiza|queda registrado ante" \
  app/app app/components app/lib
```

Cero coincidencias, salvo las prohibiciones dentro del prompt del sistema.
**Verificado 2026-08-15: pasa.**

## P1 · Build y tipos

```bash
cd app && npx tsc --noEmit && npx next build
```

**Verificado 2026-08-15: ambos limpios**, cinco rutas generadas.

## P2 · Red caída

Con el servidor arriba y la red del modelo caída, la app debe mostrar un mensaje
claro y no romperse. El tablero y el generador de peticiones no dependen del
modelo y deben seguir funcionando.

## P2 · Móvil

Viewport 412×915. Sin scroll horizontal, sin errores de consola, botones de al
menos 56 px de alto.
**Verificado 2026-08-15: pasa** en ambas páginas.

## Antes de grabar el video

- [ ] P0 abstención pasa — **anotar con qué modelo y qué `effort`**
- [ ] Los tres casos dan la compuerta correcta, revisados a mano
- [ ] C1 el saludo dice qué no somos, y «hola» no devuelve `400`
- [ ] C2 la repregunta se rinde honestamente en la ronda 4
- [ ] C3 la estafa llega antes que el diagnóstico
- [ ] C5 la notificación desde el tablero llega al barrio correcto
- [ ] C7 ningún número de teléfono en crudo
- [ ] P0 falsa expectativa pasa con una persona ajena
- [ ] Barrido de lenguaje pasa
- [ ] `next build` limpio
- [ ] Ningún dato real en el repo, los fixtures ni el video
- [ ] El video dura ≤60 s reproducido completo
- [ ] **Si el canal de Meta no está conectado, nada en el video ni en el repo
      afirma que lo está**
