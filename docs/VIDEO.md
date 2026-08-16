# Guion del video — Contados

Estado: `CURRENT · LISTO PARA GRABAR CON EL SIMULADOR` · duración objetivo:
55 segundos; máximo 60.

El video se graba primero en `/whatsapp`. Si después Meta pasa EXT-META-001,
puede repetirse en el teléfono. Si no pasa, se conserva el simulador y nunca se
afirma que WhatsApp real está conectado.

## Preparación

1. Usar sólo el relato sintético del Caso 1 de `PRUEBAS.md`.
2. Ejecutar `npm test`, `npx tsc --noEmit` y `npm run build`.
3. Confirmar P0 real del modelo elegido; si no está confirmado, la salida en el
   video debe rotularse **respuesta prevalidada para demo**.
4. Abrir `/whatsapp` y `/tablero` en ventanas limpias, sin consola, credenciales,
   nombres, teléfonos ni notificaciones personales.
5. Grabar a 1080p, cursor grande y zoom suficiente para leer en celular.

## Escaleta exacta

### 0–08 s · El problema

Negro, texto y voz humana:

> «Todavía no nos han dicho nada, solo nos tienen contados.»

Luego: **Reporte → Censo → Visita técnica → RUD → Subsidio. Nadie le dice
a una familia en cuál paso está trabada.**

### 08–20 s · La conversación segura

Mostrar `/whatsapp`; escribir «hola». Dejar visible el primer mensaje:
«Esto no lo registra ante ninguna entidad» y «nunca pediremos cédula, datos
bancarios ni huella».

Pegar el relato sintético:

> La casa se agrietó toda, vino una señora con un chaleco y anotó en un
> cuaderno, pero nadie más volvió. Yo pago arriendo.

### 20–34 s · Diagnóstico y exclusión

Mostrar, sin acelerar la lectura:

- **Paso: censo.** Anotar en un cuaderno no significa estar en el RUD.
- **Riesgo: arrendataria.** Acción concreta para no quedar por fuera.

Voz: «Cuando el relato no alcanza, Contados pregunta hasta tres veces y luego
se abstiene. Nunca inventa un paso.»

### 34–44 s · El único reloj

Corte breve al derecho de petición ya generado. Enfatizar:

> La ley no fija plazo para censar. Una petición sí debe responderse en 15 días
hábiles. Contados genera el borrador; no lo radica.

### 44–53 s · El coordinador notifica

En `/tablero`, seleccionar el mismo barrio y pulsar **Notificar en la demo**.
Volver al simulador y pulsar **Revisar avisos del barrio**. Mostrar el aviso.

Voz: «La familia no vuelve a consultar: el municipio le avisa cuando la
atención llega a su barrio.»

### 53–58 s · Cierre

Negro:

> **Contados. No otra fila: una forma de saber dónde está trabada.**
>
> Prototipo con datos 100% sintéticos · no es un canal oficial.

## Reglas de corte y evidencia

- Cortar primero audio de WhatsApp, luego Meta real; nunca cortar diagnóstico,
  abstención, notificación o aviso de no registro.
- Si el montaje dura más de 60 s, quitar explicación del tablero, no acelerar
  texto ilegible.
- Conservar archivo fuente, export final, duración exacta y SHA-256 en el registro
  de evidencia. No publicar hasta la prueba de falsa expectativa.
