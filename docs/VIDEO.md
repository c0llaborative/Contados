# Guion del video — Contados

Estado: `CURRENT · ESCALETA MEDIDA EN VIVO` · duración objetivo: 58 segundos;
máximo 60.

Los tiempos de abajo no son estimados: salen de correr la demostración completa
en Chrome el 2026-08-16 y medir cada tramo. La nota de voz dura 9,5 s, la segunda
3 s, y el diagnóstico completo entra en unos 6 s.

## El arco: problema, solución, a quién le sirve

El video cuenta **un círculo que se cierra**, y hay que verlo cerrarse. Quien
monte debe tener claros los cuatro tiempos:

1. **El problema tiene dos lados.** La familia no sabe en qué paso va. Y el
   municipio tampoco sabe dónde se está deteniendo la gente. Esto se planta en
   los primeros ocho segundos, porque si no se planta, el tablero después parece
   una gráfica decorativa.
2. **La solución para la familia.** Manda un audio y recibe su posición exacta,
   qué hacer, dónde, el riesgo de quedar por fuera, y el documento con reloj.
3. **El valor para la institución.** Las mismas conversaciones producen, sin
   encuestas ni formularios, el dato que ninguna entidad tiene: en qué paso y en
   qué barrios se acumula la fila. El coordinador decide a dónde mandar
   ingenieros escasos. **Este es el tramo que convence de que esto vive después
   del hackathon, y por eso no se recorta.**
4. **El círculo se cierra.** Esa decisión vuelve a la familia como un mensaje.
   Nadie hizo trabajo extra para que pasara.

La idea que tiene que quedar, si sólo queda una:

> **El Estado no tiene plazo para censarlo. Usted sí puede ponerle uno.**

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

### 0:00 – 0:08 · El problema, por los dos lados

Negro. Texto en pantalla:

> «Todavía no nos han dicho nada, **solo nos tienen contados**.»
> — Felipe Varela, damnificado del terremoto del 10 de agosto de 2026, a EFE

Luego, los cinco pasos apareciendo en fila:

**Reporte → Censo → Evaluación técnica → RUD → Subsidio**

Voz:

> «Después del terremoto hay cinco pasos para recibir ayuda. Nadie le dice a la
> familia en cuál va. Y el municipio tampoco sabe dónde se detiene la gente.»

Esa segunda frase es la que hace que el tablero signifique algo más adelante. Si
se recorta el video, **no se recorta esta frase**.

### 0:08 – 0:21 · Ella solo manda un audio

Entra el teléfono. Un toque al micrófono y suenan las dos notas mientras la
transcripción aparece debajo.

Voz, una sola frase al entrar, y después **silencio**:

> «Ella no llena un formulario. Manda un audio, como le hablaría a un vecino.»

No narrar encima de las notas. La voz de la persona es el argumento; taparla con
locución es desperdiciar el mejor plano del video.

### 0:21 – 0:29 · Qué le responde

Se ven, sin acelerar la lectura: la fila de cinco pasos con el segundo marcado,
**Que lo censen**, la acción con el punto de atención, y la alerta.

Voz:

> «Contados le dice en qué paso va, qué falta, y que por pagar arriendo puede
> quedar por fuera.»

### 0:29 – 0:35 · El único reloj que existe

Corte a la tarjeta del derecho de petición.

Voz:

> «La ley no fija plazo para censarla. El derecho de petición sí: quince días
> hábiles. Contados lo redacta; ella lo radica.»

### 0:35 – 0:48 · Lo que gana la institución

**Este es el tramo que responde «¿a quién más le sirve, y puede vivir después del
hackathon?».** Es el más largo del video después del audio, y es deliberado.

Cambio a `/tablero`. En este orden, sin acelerar:

1. El **43 %** grande, y debajo «Evaluación técnica de la vivienda».
2. La tabla **por barrio**, deteniéndose en el titular: *A dónde mandar los
   ingenieros primero*.
3. El barrio **San José** seleccionado, y el clic en **Notificar en la demo**.

Voz:

> «Cada conversación deja un dato. Sin encuestas ni formularios, aparece lo que
> ninguna entidad tiene hoy: el 43 % está esperando la visita técnica, y se ve en
> qué barrios. El coordinador ya sabe a dónde mandar los ingenieros que le
> faltan. Y avisa.»

Lo que el jurado tiene que entender aquí no es que hay una gráfica. Es que **el
municipio recibió una herramienta de decisión que hoy no tiene, y no tuvo que
montar un sistema ni pedirle un formulario a nadie para tenerla.**

### 0:48 – 0:53 · El círculo se cierra

Vuelta al teléfono. Llega el aviso.

Voz:

> «Y ese aviso llega al WhatsApp de la familia. No tuvo que volver a preguntar.»

Es el plano que sostiene la tesis entera: la misma conversación que ayudó a la
familia produjo el dato que ayudó al municipio, y la decisión del municipio
volvió a la familia. Si algo hay que alargar, es este.

### 0:53 – 0:58 · Cierre

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

1. **Segundos de la nota de voz.** Es lo más largo y basta con oír el principio
   para entender el gesto; se puede cortar a la mitad y bajar el resto.
2. La pausa sobre la tarjeta de petición.
3. La explicación hablada del 43 %, conservando el plano.

**Nunca se recortan:** la frase de que el municipio tampoco sabe, el tramo del
tablero completo, el aviso que llega al barrio, la alerta de exclusión, ni el
aviso de no registro. El tablero se conserva porque es lo único del video que
responde a «viabilidad y escala», y ese criterio no se recupera hablando.

## Evidencia

Conservar archivo fuente, export final, duración exacta y SHA-256 en
`EVIDENCE_REGISTER.md`. No publicar antes de la prueba de falsa expectativa
(EXT-UX-003): si una persona ajena cree que quedó registrada ante la alcaldía,
se corrige el copy y se vuelve a grabar.
