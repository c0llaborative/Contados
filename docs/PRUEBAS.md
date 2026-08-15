# Plan de pruebas — Contados

Estado: `CURRENT` · P0 = bloquea la entrega

## Cómo correr

```bash
export ANTHROPIC_API_KEY=sk-ant-...
cd app && npm run dev
```

## P0 · Prueba de abstención (la que hunde el proyecto)

**Es la primera que hay que correr.** Un relato ambiguo **no puede** producir
una compuerta inventada.

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

- [ ] P0 abstención pasa
- [ ] Los tres casos dan la compuerta correcta, revisados a mano
- [ ] P0 falsa expectativa pasa con una persona ajena
- [ ] Barrido de lenguaje pasa
- [ ] `next build` limpio
- [ ] Ningún dato real en el repo, los fixtures ni el video
- [ ] El video dura ≤60 s reproducido completo
