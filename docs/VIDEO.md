# Guion del video — Contados

Estado: `CURRENT · ESCALETA MEDIDA EN VIVO` · duración objetivo: 58 segundos;
máximo 60.

Los tiempos de abajo no son estimados: salen de correr la demostración completa
en Chrome el 2026-08-16 y medir cada tramo. La nota de voz dura 9,5 s, la segunda
3 s, y el diagnóstico completo entra en unos 6 s.

## La idea que tiene que quedar

Una sola, y todo lo demás la sirve:

> **El Estado no tiene plazo para censarlo. Usted sí puede ponerle uno.**

Si el jurado se lleva eso y el gesto de la nota de voz, el video funcionó.

## Preparación

1. Sólo el relato sintético; las notas de voz de `app/public/demo/` ya lo son.
2. Ejecutar `npm test`, `npx tsc --noEmit` y `npm run build`.
3. Reiniciar el servidor antes de grabar. Si quedan sesiones de una toma
   anterior, el tablero dirá «2 familias» en vez de «1» y se nota.
4. Dos pestañas: `/whatsapp` y `/tablero`. **No navegar de una a otra en la
   misma pestaña**: la sesión del simulador se pierde y el aviso no llega.
5. Modo No molestar. Cerrar correo, WhatsApp personal, consolas y gestores de
   contraseñas. Grabar la ventana de Chrome, no la pantalla completa.
6. **Capturar el audio del sistema.** Las notas de voz se reproducen solas y son
   la mitad de la narrativa; sin sonido, los primeros trece segundos son dos
   burbujas quietas.

## Escaleta

### 0:00 – 0:06 · El problema

Negro. Texto en pantalla:

> «Todavía no nos han dicho nada, **solo nos tienen contados**.»
> — Felipe Varela, damnificado del terremoto del 10 de agosto de 2026, a EFE

Luego, los cinco pasos apareciendo en fila:

**Reporte → Censo → Evaluación técnica → RUD → Subsidio**

Voz:

> «Después del terremoto, para recibir ayuda hay que pasar cinco pasos. Nadie le
> dice a una familia en cuál va.»

### 0:06 – 0:19 · Ella solo manda un audio

Entra el teléfono. Un toque al micrófono y suenan las dos notas mientras la
transcripción aparece debajo.

Voz, una sola frase al entrar, y después **silencio**:

> «Ella no llena un formulario. Manda un audio, como le hablaría a un vecino.»

No narrar encima de las notas. La voz de la persona es el argumento; taparla con
locución es desperdiciar el mejor plano del video.

### 0:19 – 0:27 · Qué le responde

Se ven, sin acelerar la lectura: la fila de cinco pasos con el segundo marcado,
**Que lo censen**, la acción con el punto de atención, y la alerta.

Voz:

> «Contados le dice en qué paso va, qué falta, y que por pagar arriendo puede
> quedar por fuera.»

### 0:27 – 0:34 · El único reloj que existe

Corte a la tarjeta del derecho de petición.

Voz:

> «La ley no fija plazo para censarla. El derecho de petición sí: quince días
> hábiles. Contados lo redacta; ella lo radica.»

### 0:34 – 0:45 · El otro lado del mismo caso

Cambio a `/tablero`. Se ve el 43 %, la tabla por barrio, y la notificación a
San José.

Voz:

> «En agregado produce la cifra que hoy no existe: dónde se detiene la gente. El
> coordinador ve a qué barrio mandar los ingenieros primero.»

### 0:45 – 0:52 · Se cierra el círculo

Vuelta al teléfono. Llega el aviso.

Voz:

> «Y cuando la atención llega al barrio, la familia no vuelve a preguntar: le
> avisan.»

Es el plano que sostiene la tesis del producto. Si algo hay que alargar, es este.

### 0:52 – 0:58 · Cierre

Negro:

> **Contados**
> No otra fila. Saber en qué paso va.
>
> Prototipo · datos 100 % sintéticos · no es un canal oficial

## Reglas de lenguaje

Las mismas que rigen el producto. El video no puede decir lo que la pantalla no
dice.

- **Nunca «trabada» ni «trabado».** Nadie describe así su propia situación. Se
  dice «en qué paso va» o «dónde se detiene».
- **«Paso», no «compuerta».** Compuerta es vocabulario interno.
- Nunca «lo registramos», «queda inscrito» ni «le tramitamos la ayuda».
- No prometer que la ayuda llegue, ni poner plazos que la ley no fija.
- Decir «puede quedar por fuera», no «va a quedar por fuera».

## Qué se puede afirmar y qué no

| Se puede decir | No se puede decir |
|---|---|
| Contados funciona por WhatsApp | Que el canal ya está conectado a Meta, mientras EXT-META-001 no pase |
| El clasificador es `claude-sonnet-5` y pasó 15/15 en casos sintéticos | Que acierta con relatos reales |
| Las notas de voz se transcriben de verdad, con Gemini | Que la transcripción es privada: el tier gratuito de Google usa el contenido para mejorar sus productos |
| La cifra del tablero es autorreportada | Que son cifras oficiales o un censo |
| El oficio cita el corpus normativo con su SHA-256 | Que Contados radica la petición |

Si Meta no llega a conectarse antes de entregar, **la única frase que hay que
revisar** es cualquiera que sugiera que el canal está vivo hoy. «Funciona por
WhatsApp» describe el producto y se sostiene; «ya está conectado» no.

## Orden de corte

Si el montaje pasa de 60 segundos, se recorta en este orden:

1. Segundos del tablero (0:34–0:45), que es lo más explicable de palabra.
2. La pausa sobre la tarjeta de petición.
3. **Nunca** se recorta el aviso que llega al barrio, ni la alerta de exclusión,
   ni el aviso de no registro.

## Evidencia

Conservar archivo fuente, export final, duración exacta y SHA-256 en
`EVIDENCE_REGISTER.md`. No publicar antes de la prueba de falsa expectativa
(EXT-UX-003): si una persona ajena cree que quedó registrada ante la alcaldía,
se corrige el copy y se vuelve a grabar.
