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

## Correr

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # obligatorio: sin esto /api/diagnose falla
npm install
npm run dev
```

Abre <http://localhost:3000>. El tablero está en `/tablero`.

## Qué hace la IA

`claude-opus-5` con **structured outputs y schema estricto**
(`additionalProperties: false`, ver `lib/schema.ts`):

1. **Relato caótico → estado del caso.** «Vino una señora con chaleco y anotó en
   un cuaderno» = intento de censo, no registro en RUD.
2. **Riesgo de exclusión** contra los modos de falla documentados
   (arrendatarios, tenencia informal, titular ausente, sin documentos).
3. **Abstención obligatoria.** Si el relato no alcanza, devuelve
   `compuerta: null` y pregunta lo que falta. Nunca inventa un estado.
4. **Detección de suplantación**, porque hay denuncias verificadas de personas
   haciéndose pasar por funcionarios.

La voz se transcribe **en el navegador** (Web Speech API, `es-CO`): el audio no
sale del dispositivo. El campo de texto siempre está disponible.

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
lib/schema.ts     Modelo Case de 5 compuertas + JSON Schema del clasificador
lib/corpus.ts     Corpus normativo congelado con SHA-256; días hábiles en código
lib/rutas.ts      Ruta verificada de Manizales
lib/fixtures.ts   54 casos sintéticos deterministas para el tablero
app/api/diagnose  Relato → compuerta + riesgos (structured outputs)
app/api/peticion  Derecho de petición con citas del corpus y su hash
app/tablero       Agregado por compuerta y por barrio
```

El modelo de datos no se inventó: es el ciclo de **Primero / CPIMS+** (UNICEF,
open source, 40 países) — `identification → registration → assessment →
referral → service_tracking → closure` — que mapea 1:1 con las cinco compuertas
colombianas.

## Pendiente

- Probar contra el modelo (los tres casos + la prueba de abstención).
- Grabar los tres audios sintéticos.
- Prueba de falsa expectativa: que alguien ajeno recorra el flujo y luego se le
  pregunte «¿usted quedó registrado ante la alcaldía?». Si duda, el copy está
  mal.

Los datos de personas en la demostración son **100% sintéticos**.
