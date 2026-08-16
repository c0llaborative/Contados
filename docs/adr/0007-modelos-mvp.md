# ADR 0007: Selección de modelos por prueba P0 y costo total del MVP

- Status: accepted for local implementation; external evaluation pending
- Date: 2026-08-15
- Decision owner: equipo de hackathon

## Context

Contados necesita dos capacidades distintas: clasificar un relato en una de
cinco compuertas con abstención segura y transcribir notas de voz en español. La
demo ocurre en menos de 24 horas; agregar proveedores sin una mejora observable
aumenta credenciales, fallos y superficie de privacidad.

La decisión no se toma por marca. El clasificador ganador debe pasar primero los
casos P0 de `docs/PRUEBAS.md`, en especial los tres relatos ambiguos. Entre los
que pasen se elige menor latencia; el costo decide sólo si la diferencia operativa
es apreciable.

## Decision

1. **Clasificador primario para la primera prueba: `claude-sonnet-5`.** Ya existe
   la integración, soporta JSON Schema estricto y cuesta USD 2/10 por millón de
   tokens de entrada/salida hasta 2026-08-31. Con el supuesto del plan (1.000
   tokens de entrada y 600 de salida) son aproximadamente USD 0,008 por caso.
2. **Retador de bajo costo: `gpt-4o-mini`.** El mismo núcleo puede activarlo con
   `AI_CLASSIFIER_PROVIDER=openai`; soporta Structured Outputs y cuesta USD
   0,15/0,60 por millón de tokens, aproximadamente USD 0,00051 por el mismo caso.
   No se cambia por precio antes de probar abstención: incluso 100 diagnósticos
   de Sonnet 5 cuestan cerca de USD 0,80 bajo este supuesto.
3. **STT: Groq `whisper-large-v3-turbo`.** Publica USD 0,04 por hora, es
   multilingüe y admite `language=es`. La nota se mantiene en memoria y no se
   escribe a disco. Antes de datos reales, el administrador activa Zero Data
   Retention; para la demo se usan relatos sintéticos.
4. **Gemini no se agrega al MVP.** Puede transcribir audio y su nivel pagado no
   usa los datos para mejorar productos, pero no ofrece una ventaja medida para
   esta demo que justifique una tercera credencial. El nivel gratuito sí figura
   como usado para mejorar productos y por eso no se usa con relatos sensibles.
5. **Un solo clasificador y un solo STT activos.** No hay fallback silencioso
   entre proveedores: mezclar resultados impediría reproducir qué modelo tomó
   una decisión.

Fuentes oficiales consultadas el 2026-08-15:

- [Claude Sonnet 5: capacidades, disponibilidad y precio introductorio](https://platform.claude.com/docs/en/about-claude/models/whats-new-sonnet-5)
- [Claude Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [OpenAI GPT-4o mini: precio y Structured Outputs](https://developers.openai.com/api/docs/models/gpt-4o-mini)
- [Groq Speech to Text: modelos y costo por hora](https://console.groq.com/docs/speech-to-text)
- [Groq: retención y Zero Data Retention](https://console.groq.com/docs/your-data)
- [Gemini API: audio](https://ai.google.dev/gemini-api/docs/audio)
- [Gemini API: precios y uso de datos por nivel](https://ai.google.dev/gemini-api/docs/pricing)

## Consequences and trade-offs

- El proyecto conserva la ruta de menor riesgo (Anthropic ya integrada) y puede
  comparar OpenAI cambiando variables, sin nueva dependencia npm.
- Sonnet es más caro que GPT-4o mini, pero el costo absoluto de la demo no
  justifica aceptar una peor abstención.
- Groq agrega una segunda cuenta, pero evita usar un LLM multimodal general para
  una tarea de STT especializada y barata.
- Ninguna cifra de calidad o latencia queda aceptada hasta ejecutar el mismo
  corpus desde la misma red y registrar resultados.

## Alternatives considered

- `claude-opus-5`: reserva si Sonnet falla P0; capacidad y costo innecesarios si
  Sonnet pasa.
- Gemini Flash para audio: técnicamente viable; descartado para el MVP por no
  tener mejora medida y por la política del free tier.
- OpenAI GPT-4o Transcribe: fallback viable si Groq falla disponibilidad o
  privacidad; no se integra preventivamente.
- Navegador Web Speech: se conserva en `/`, pero no resuelve notas de voz que ya
  pasaron por WhatsApp/Meta.

## Verification or review condition

- Ejecutar tres veces cada entrada P0 por candidato y registrar salida, latencia,
  modelo exacto y uso/costo mostrado por el proveedor.
- Condición de parada: cualquier compuerta inventada en un relato ambiguo elimina
  al candidato, sin promediar ese error con otros aciertos.
- Revisar esta decisión si cambia el proveedor, precio, política de datos o si
  el producto deja de usar datos 100% sintéticos.

## Supersedes / Superseded by

Complementa ADR 0006 y reemplaza su elección de proveedor basada sólo en
estimaciones por un gate comparativo reproducible.
