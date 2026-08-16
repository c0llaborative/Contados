# Notas de voz de la demostración

Deje aquí los audios con estos nombres exactos:

```
app/public/demo/nota-1.ogg
app/public/demo/nota-2.ogg
```

La extensión puede ser `.ogg`, `.opus`, `.m4a`, `.mp3`, `.wav` o `.webm`: el
simulador prueba cada una y usa la que encuentre. No hay que tocar código.

Si no hay ningún archivo, la sección «Mandar una nota de voz» simplemente no
aparece y la demo escrita funciona igual.

## Qué pasa cuando se manda una nota

El archivo se sube a `/api/nota-voz`, se transcribe con Groq
`whisper-large-v3-turbo` y **esa transcripción** entra a la misma conversación
que el texto escrito. No hay texto prefabricado: si Groq entiende mal, el
diagnóstico cambia. Es la misma función `transcribirAudio` que usa el webhook
de Meta, no una segunda implementación.

El audio se procesa en memoria y no se escribe a disco en el servidor.

## Reglas para grabarlas

1. **El contenido debe ser sintético.** Use el relato de `docs/PRUEBAS.md`. No
   grabe el caso real de una persona damnificada.
2. **La voz debe ser de alguien del equipo, que sepa que se va a publicar.** El
   repositorio es público y el audio queda en él; además se oirá en el video.
3. Sin nombres, teléfonos, cédulas ni direcciones reales.
4. Hable claro y sin ruido de fondo: Groq transcribe bien, pero en la prueba del
   Gate 3 una voz sintética mal articulada convirtió «arriendo» en «arendo» y
   eso hizo perder la alerta de arrendatario.

## Cómo se reparten los dos audios

Si el relato quedó partido en dos, mándelos en orden. La conversación acumula lo
que se ha contado: es posible que después del primero Contados haga una pregunta
en vez de dar un diagnóstico. Eso no es un fallo — es la abstención obligatoria
funcionando, y en el video se ve bien.
