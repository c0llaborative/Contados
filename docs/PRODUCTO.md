# Producto — Contados

Estado: `CURRENT`

**Una frase:** Contados le dice a una familia damnificada en cuál de las cinco
compuertas de la ruta oficial está trabada, qué sigue y dónde hacerlo, si está
en riesgo de quedar excluida y por qué, y le genera el único instrumento que sí
tiene reloj legal.

## Usuario y momento de uso

**Usuario primario:** persona adulta cuyo hogar resultó afectado por el
terremoto, que ya reportó o cree haber reportado, y que lleva días sin saber qué
pasó con su caso. No conoce el vocabulario oficial y no distingue «censo» de
«RUD» — nadie se lo explicó.

**Momento de uso:** después de estar fuera de peligro inmediato, cuando la
espera empieza a sentirse indefinida.

**Usuario secundario:** el coordinador municipal, que hoy no tiene forma de ver
dónde se le está atascando la gente.

## Las cinco compuertas

| # | Compuerta | Qué significa |
|---|---|---|
| 1 | Reportar el daño | Avisó que su vivienda resultó afectada. **Reportar no es estar censado.** |
| 2 | Que lo censen | Un funcionario tomó sus datos. No implica estar en el RUD. |
| 3 | Evaluación técnica | Un técnico debe visitar la vivienda. **Es la fila más larga.** |
| 4 | Registro en el RUD | Requisito de las ayudas. Solo el CMGRD puede inscribir. |
| 5 | Recibir el subsidio | El aviso llega por SMS al celular registrado. |

El modelo de datos no se inventó: es el ciclo de **Primero / CPIMS+** (UNICEF,
open source, 40 países) — `identification → registration → assessment →
referral → service_tracking → closure` — que mapea 1:1 con las cinco compuertas
colombianas. Ver `app/lib/schema.ts`.

## Las tres decisiones de diseño que lo definen

### 1. No es un portal de consulta. Notifica.

La lección más valiosa de toda la investigación, de GOV.UK Notify:

> *«Status-tracking tools are often just a channel-shift for anxiety […] it
> would be better just to tell people what we know when we know it.»*

La familia cuenta su situación **una vez**. El sistema le avisa cuando algo
cambia. No la obligamos a entrar a revisar y angustiarse.

### 2. La tesis jurídica, contraintuitiva y por eso sólida

La Ley 1523 de 2012 **no fija plazo en días** para completar el censo, hacer la
evaluación técnica ni entregar la ayuda. Solo fija principios. El único reloj
que existe es el del derecho de petición: **15 días hábiles**, Ley 1755 de 2015
art. 14 (10 días para información).

> **El Estado no tiene plazo para censarte. Tú sí puedes ponerle uno.**

Radicar la petición no es un trámite decorativo: es la única manera de convertir
una espera indefinida en una obligación con fecha. Sin esto, generar un derecho
de petición sería otro generador de plantillas.

Cuando esos 15 días se vencen sin respuesta se abre la vía de tutela, que es la
escalada legalmente correcta. **No está implementada** y no se insinúa en la
interfaz.

### 3. Detecta riesgo de exclusión

Esto es lo que nadie más va a tener. La literatura documenta exactamente quién
queda por fuera de los registros post-desastre, y son siempre los mismos:

- **Arrendatarios** (México 2017)
- **Poseedores sin título** (Houston post-Harvey, Puerto Rico post-María, Brasil)
- **Mujeres cuya vivienda está a nombre de un tercero** fallecido o ausente
- **Personas sin documentos**
- Quienes están *«out of sight, out of reach, out of the loop»* (World Disasters
  Report)

En México, el censo inicial de CDMX registró ~7.000 inmuebles; el rediagnóstico
de 2019 encontró **más de 22.000 viviendas con daño severo** que habían quedado
fuera, y a los seis años el **32%** seguía sin recuperar vivienda.

Contados dice: *«usted es arrendataria y varios apoyos piden acreditar
propiedad — esto es lo que debe pedir para no quedar por fuera»*. Sale de
evidencia, no de intuición.

## Qué hace la IA

`claude-opus-5`, structured outputs con schema estricto
(`additionalProperties: false`, `output_config.effort: medium`):

1. **Relato → estado del caso.** Español coloquial y desordenado. *«Vino una
   señora con chaleco y anotó en un cuaderno»* = intento de censo, no RUD.
2. **Clasificador de riesgo de exclusión** contra los modos de falla
   documentados, con la razón y la acción concreta.
3. **Detección de suplantación.** La Alcaldía de Cali tuvo que desmentir a
   personas haciéndose pasar por funcionarios pidiendo datos, fotos y huellas.
4. **Abstención obligatoria.** Si el relato no alcanza, `compuerta: null` y las
   preguntas que faltan. Nunca inventa un estado.
5. **Evidencia por hecho.** Cada hecho lleva la frase textual del relato que lo
   sustenta. Sin cita, el hecho no existe.

Todo lo determinista está en código y **no pasa por el modelo**: el cálculo de
días hábiles, las citas normativas, el destinatario, los conteos del tablero.

## Recorrido de usuario

**1 · Contar.** Un botón grande: «Contar hablando». Voz o texto. **No se pide
cédula.** Solo municipio y barrio.

**2 · Ver dónde está.** La fila vertical de cinco compuertas con la suya
encendida. Debajo: qué significa, qué sigue, dónde ir en *su* municipio con
dirección y qué llevar. Si aplica, la alerta de exclusión con su razón.

**3 · Actuar.** «Ponerle plazo al Estado» genera el derecho de petición con los
15 días hábiles calculados, listo para radicar.

**4 · El agregado.** Por barrio y por compuerta. *«El 43% de los hogares está
detenido en la evaluación técnica»* — la cifra que hoy no existe.

## Principios de UX (de la investigación, no de gusto)

- **Notificar, no obligar a consultar.** Un portal de estado es una mudanza de
  canal para la angustia.
- **Decir «no sabemos todavía» explícitamente.** El silencio destruye la
  sensación de control más que la mala noticia.
- **Frontload.** Lo que la persona necesita saber va primero.
- **Voz primero y opción de canal.** Mucha gente perdió el celular; el campo de
  texto siempre está disponible.
- **Lenguaje llano, pero cuidado con la crudeza.** Hay un caso documentado de
  GOV.UK donde el lenguaje «claro» angustió al usuario porque le reflejaba su
  propio trauma.
- **Canal de objeción visible.** En Turquía, la ausencia de un mecanismo de
  apelación tras la evaluación de daños escaló a desconfianza masiva.
- **«Registrado» nunca es «aprobado».** Chile tuvo que aclararlo explícitamente:
  *«La sola aplicación de la FIBE no garantiza el acceso a beneficios estatales
  o municipales.»*

## Decisiones técnicas y por qué

| Decisión | Razón |
|---|---|
| Voz transcrita **en el navegador** (Web Speech API, `es-CO`) | La API de Claude no recibe audio. Efecto secundario valioso: el audio nunca sale del dispositivo. |
| Oficio **HTML con CSS de impresión**, no PDF generado | Cero dependencias, y en la demo el jurado ve el documento completo en pantalla con la cita y el hash. Se guarda como PDF desde el navegador. |
| Fila **vertical**, no stepper horizontal | En un celular los steppers horizontales aplastan las etiquetas hasta volverlas ilegibles. |
| Modelo de datos tomado de Primero/CPIMS+ | Es el estándar del sector humanitario. No hay razón para inventarlo. |
| Barras del tablero escaladas al máximo, no al total | Se comparan mejor entre sí. La cifra exacta va al lado para que nadie lea solo la barra. |

## Escala

Chile ya validó el patrón con **mifibe.gob.cl**; Japón lo institucionalizó con
el 被災者台帳, que auto-identifica quién es elegible para qué al emitirse el
certificado. El comprador natural son las alcaldías y la UNGRD, que hoy no saben
dónde se atasca su gente. Y sirve para toda emergencia futura, no solo para
esta.

## Fuera de alcance (deliberado)

Integración con sistemas oficiales · radicación automática · tutela · offline /
PWA · multi-municipio · notificaciones push reales (se muestran, no se
implementan) · login · mapa · cualquier dato personal real.
