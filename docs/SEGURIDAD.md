# Límites de seguridad — Contados

Estado: `CURRENT · INNEGOCIABLE` · reglas 12 a 14 implementadas localmente;
prueba externa pendiente

Cada regla de aquí existe por un error ajeno documentado. Romper cualquiera
hunde el proyecto, y varias lo hundirían con razón.

Las reglas 1 a 11 son lo único que sobrevivió del blueprint de Ruta Clara. Se
conservan porque son el mejor trabajo que quedó de aquella etapa. Las reglas 12 a
14 son nuevas: **las obliga el canal de WhatsApp**. Están implementadas
localmente; falta comprobar Meta y Groq en cuentas reales.

**Las reglas aplican a las tres superficies** (WhatsApp, web damnificado,
tablero). Por eso el núcleo compartido de `app/lib/nucleo/` no es solo comodidad:
es lo que impide que una regla se cumpla en un canal y no en el otro.

## 1. No registramos a nadie

**En la pantalla 1 y en el primer mensaje de WhatsApp, permanente y grande:
«Esto no lo registra ante ninguna entidad.»**

Solo el Consejo Municipal de Gestión del Riesgo puede inscribir en el RUD. Esta
es la falla que mató la idea anterior (censo ciudadano por voz) y la peor forma
en que este producto podría hacer daño: que alguien crea que reportar aquí es
estar censado, y por eso deje de ir al punto de atención.

Chile tuvo que aclararlo por escrito para su propia ficha oficial: *«La sola
aplicación de la FIBE no garantiza el acceso a beneficios estatales o
municipales.»* Si un Estado tiene que aclararlo sobre su instrumento oficial,
nosotros con más razón.

**Verificación:** la prueba de falsa expectativa de [`PRUEBAS.md`](PRUEBAS.md).

## 2. No pedimos cédula, datos bancarios ni huella

Hay denuncias verificadas de personas haciéndose pasar por funcionarios para
pedir exactamente eso puerta a puerta; la Alcaldía de Cali tuvo que desmentirlo
públicamente. Un producto no oficial que pida esos datos es indistinguible de la
estafa.

Aviso fijo: *«Registrarse en el censo es gratis. Nadie puede cobrarle.»* En
WhatsApp va en el **primer** mensaje, antes de que la persona cuente nada: si un
canal desconocido le escribe, lo primero que debe leer es que no le vamos a pedir
esos datos.

El producto además **marca** el relato como posible suplantación cuando quien
tomó los datos pudo no ser funcionario.

## 3. Nunca afirmamos que una vivienda es segura, habitable o cumple norma

Eso lo determina un profesional en la visita técnica. El producto dice en qué
punto de la fila está la persona; **no** evalúa riesgo estructural. Ni FEMA
P-2055 ni la guía de la UNGRD permiten que un sistema autónomo cruce esa línea.

## 4. Abstención obligatoria

Si el relato no alcanza para ubicar la compuerta, el clasificador devuelve
`compuerta: null` y las preguntas que faltan. **Abstenerse es una respuesta
correcta y esperada.**

Inventar una compuerta es el peor error posible, porque la persona actuará sobre
ella: irá al lugar equivocado, o dejará de ir al correcto.

Invariante en código (`app/lib/nucleo/clasificar.ts`): si el modelo se abstiene sin explicar qué
falta, el servidor rellena la pregunta. Nunca devuelve una abstención muda.

**En WhatsApp la abstención se vuelve conversación, con tope.** El sistema
pregunta lo que falta y reclasifica, **máximo tres rondas**. Al agotarlas dice
que no puede ubicarlo con seguridad y entrega la ruta genérica del municipio. Un
sistema que pregunta indefinidamente es tan inútil como uno que inventa, y en un
canal de mensajería se siente como un interrogatorio.

## 5. Cada hecho lleva su evidencia textual

Cada hecho extraído del relato lleva la frase literal que lo sustenta, y la
interfaz la muestra: *«porque usted dijo: …»*. Si no se puede citar la frase, el
hecho no existe.

## 6. Ninguna cita normativa se genera con el modelo

El corpus está congelado en `app/lib/corpus.ts` con SHA-256 calculado al cargar.
El renderizador toma el texto, el artículo y la URL **desde los metadatos**,
nunca desde texto generado. Si un fragmento no está en el corpus, el instrumento
se bloquea.

Corpus vigente: Ley 1755 de 2015 arts. 13 y 14; Ley 1523 de 2012 art. 4.

## 7. No decimos que se venció un plazo que no existe

Verificado: la Ley 1523 de 2012 **no fija plazo en días** para completar el
censo, hacer la evaluación técnica ni entregar la ayuda humanitaria. Decir «se
venció el término del censo» sería **falso**.

Lo único que tiene reloj es el derecho de petición que radique la persona: 15
días hábiles. El cálculo se hace en código determinista, contando días hábiles,
nunca con el modelo.

## 8. No radicamos nada

El PDF sale marcado `BORRADOR · NO RADICADO · CASO DE DEMOSTRACIÓN`. El producto
genera el instrumento; la persona lo radica.

## 9. El agregado es autorreportado, siempre rotulado

El tablero nunca se presenta como cifra oficial ni como censo. La evidencia
cuasi-experimental sobre sesgo de autorreporte en targeting de ayuda es
contundente, y México 2017 muestra a dónde lleva un censo percibido como no
auditable: se rehízo dos años después bajo presión social.

En el tablero, el rótulo va **arriba**, antes de cualquier cifra.

## 10. Cero datos personales reales

Personas, nombres, cédulas, direcciones y relatos de la demostración: **100%
sintéticos**, generados de forma determinista.

Las cuatro capturas del canal del evento (`archivo/canal-interno/`) muestran el
nombre y la fotografía de una persona real. Clasificación `Interno`: no entran
al repositorio público, al video ni a ningún material de entrega. Están
excluidas en el `.gitignore` de la raíz.

## 11. No prometemos que la ayuda llegue

El copy dice qué quedó registrado y qué sigue. Nunca que el subsidio llegará,
ni cuándo.

## 12. La promesa del audio solo vale en la web — y lo decimos

Estado: `CURRENT LOCAL · STT REAL PENDIENTE`

En la web, la voz se transcribe **en el navegador** con Web Speech API: el audio
nunca sale del dispositivo. Eso es cierto y lo hemos afirmado.

**En WhatsApp no es cierto.** La nota de voz pasa por los servidores de Meta y
por el proveedor de transcripción. Decir lo contrario sería mentir, y un jurado
que note la contradicción hace más daño que la limitación misma.

Reglas concretas:

- La promesa se enuncia **acotada**: «en la web, el audio no sale de su
  dispositivo». Nunca sin el «en la web».
- El audio se **borra apenas se transcribe**. No se guarda ni se reenvía.
- **No se usa ningún tier gratuito que entrene con los datos.** Son relatos de
  damnificados. Verificar la política del proveedor **antes de grabar**; si no
  cumple, se cae a un proveedor pagado.
- Si no da tiempo de documentar esto bien, **se cortan las notas de voz.** Es el
  primer candidato a corte de [`PLAN.md`](PLAN.md) precisamente por esto.

## 13. El número de teléfono es dato personal

Estado: `CURRENT LOCAL`

En la práctica un celular identifica a una persona más que su cédula: es
directamente contactable. La regla 2 dice que no pedimos cédula; sería incoherente
tratar el número con menos cuidado.

- La llave de sesión es `SHA-256(número + SESION_SAL)`. Nunca se usa el
  número crudo como identificador.
- El número crudo no se escribe en logs, ni en fixtures, ni en el repositorio.
- Para poder responder y notificar, el destinatario crudo vive dentro de la
  sesión efímera y muere con su TTL de 30 minutos. **Desde el 2026-08-16 esa
  sesión no vive en memoria sino en Redis**, porque en serverless se perdía
  entre un mensaje y el siguiente. El cambio es real y se dice: el número crudo
  sale del proceso y llega a un almacén administrado durante media hora. Sigue
  sin ser la llave, sin escribirse en logs y sin sobrevivir al TTL.
- La sal va en variable de entorno, no en el código.
- El enlace al derecho de petición lleva un token autocontenido cifrado y
  autenticado con AES-256-GCM, no un consecutivo ni datos legibles.

**Condición de parada:** cualquier número de teléfono real en el repositorio
bloquea la publicación.

## 14. El estado de conversación es efímero, y eso es la postura

Estado: `CURRENT LOCAL`

El estado vive con un TTL de 30 minutos y se borra solo. La postura de retención
no cambia —**no acumulamos historias de damnificados**— pero desde el 2026-08-16
lo que la garantiza es el TTL y no el reinicio de un proceso: la sesión pasó de
un `Map` en memoria a Redis, porque en serverless se perdía entre un mensaje y
el siguiente y la persona tenía que contar su historia otra vez.

Se dice como es: durante esa media hora el relato y el número crudo **sí están
guardados fuera del proceso**, en un almacén administrado. No hay base de datos
relacional, no hay respaldo y no hay histórico; pasados los 30 minutos no queda
nada que consultar. Lo único que sobrevive es el agregado anonimizado del
tablero, que ya está rotulado como autorreportado por la regla 9.

## 15. El enlace temporal es una credencial de acceso

Estado: `CURRENT LOCAL`

El enlace de petición funciona como una credencial *bearer*: cualquier persona
que lo reciba puede abrir el borrador durante 15 minutos. Por eso:

- el contenido viaja cifrado y autenticado; una alteración responde 404;
- al vencer responde 410 y orienta a generar otro desde `/whatsapp`;
- la respuesta usa `no-store`, `no-referrer` y `noindex`;
- `PETICION_LINK_SECRET` es independiente de las demás claves; rotarlo invalida
  todos los enlaces emitidos;
- no se guardan tokens en logs, capturas ni evidencia;
- la persona no debe reenviar ni capturar el enlace mientras esté vigente.

Si falta el secreto, el diagnóstico sigue funcionando pero no se ofrece un
enlace. La ruta POST web se conserva como recuperación. Esto no radica el
documento ante ninguna entidad.

## Barrido antes de entregar

```bash
# Lenguaje prohibido
grep -rniE "es segura|es habitable|cumple norma|garantiza|queda registrado ante" app/app app/components app/lib
```

Cero coincidencias, salvo las prohibiciones mismas dentro del prompt del
sistema. Ejecutado el 2026-08-15: pasa.

```bash
# CURRENT — números de teléfono crudos (regla 13)
grep -rnE "\+?57[ -]?3[0-9]{9}|\b3[0-9]{9}\b" app/ docs/ --exclude-dir=node_modules
```

Debe dar cero. Pendiente de ejecutar cuando exista el canal.
