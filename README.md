# Contados — Hac[k]athon CTW 2026

> «Todavía no nos han dicho nada, **solo nos tienen contados** y estamos
> esperando que nos den la ayuda.»
> — Felipe Varela, damnificado del terremoto del 10 de agosto de 2026, a EFE

Estado: `CURRENT · CONSTRUIDO Y CORRIENDO · PENDIENTE PROBAR CONTRA EL MODELO`

Para recibir cualquier ayuda tras el terremoto hay que atravesar cinco
compuertas:

**Reporte → Censo → Evaluación técnica → Registro en el RUD → Subsidio**

Nadie le dice a una familia en cuál está trabada. No existe consulta de estado
por cédula en la UNGRD ni en ninguna de las cinco alcaldías revisadas: todo es
presencial, sin número de radicado, y el resultado llega «por SMS o listados en
la alcaldía».

**Contados** le dice a la familia en qué compuerta está, qué sigue y dónde
hacerlo en su municipio, si está en riesgo de quedar excluida y por qué, y le
genera el único instrumento que sí tiene reloj legal. En agregado y anonimizado,
produce la cifra que hoy no existe: cuánta gente está detenida en cada paso.

## Correr el producto

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # sin esto, /api/diagnose falla
cd app && npm install && npm run dev
```

<http://localhost:3000> · el tablero agregado en `/tablero`

## Fuentes de verdad

| Pregunta | Documento |
|---|---|
| Estado, bloqueadores y siguiente acción | [`docs/PLAN.md`](docs/PLAN.md) |
| Qué es Contados y por qué funciona así | [`docs/PRODUCTO.md`](docs/PRODUCTO.md) |
| Qué está prohibido decir o hacer | [`docs/SEGURIDAD.md`](docs/SEGURIDAD.md) |
| Por qué este producto y no otro | [`docs/adr/0005-contados.md`](docs/adr/0005-contados.md) |
| La evidencia del problema | [`docs/EVIDENCIA.md`](docs/EVIDENCIA.md) |
| Cómo se verifica | [`docs/PRUEBAS.md`](docs/PRUEBAS.md) |
| El video de entrega | [`docs/VIDEO.md`](docs/VIDEO.md) |
| Cómo correr el código | [`app/README.md`](app/README.md) |
| Historia de cambios | [`CHANGELOG.md`](CHANGELOG.md) |
| Procedencia y hashes | [`EVIDENCE_REGISTER.md`](EVIDENCE_REGISTER.md) |
| Los cinco productos descartados | [`archivo/README.md`](archivo/README.md) |

## Estructura

```
app/            El producto. Next.js 16 + TypeScript.
docs/           Documentación vigente de Contados.
archivo/        Los cinco productos descartados. Nada de ahí aplica.
deck-CTW-2026.pdf   Reglas, tracks y rúbrica del evento.
```

## Qué hace la IA

`claude-opus-5` con **structured outputs y schema estricto**
(`additionalProperties: false`):

1. **Relato caótico → estado del caso.** «Vino una señora con chaleco y anotó en
   un cuaderno» = intento de censo, no registro en RUD.
2. **Riesgo de exclusión** contra los modos de falla documentados: arrendatarios,
   tenencia informal, titular ausente, personas sin documentos.
3. **Abstención obligatoria.** Si el relato no alcanza, devuelve
   `compuerta: null` y pregunta lo que falta. Nunca inventa un estado.
4. **Detección de suplantación**, porque hay denuncias verificadas de personas
   haciéndose pasar por funcionarios.

La voz se transcribe **en el navegador** (Web Speech API, `es-CO`): el audio no
sale del dispositivo.

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
