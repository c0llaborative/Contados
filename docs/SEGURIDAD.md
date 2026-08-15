# Límites de seguridad — Contados

Estado: `CURRENT · INNEGOCIABLE`

Cada regla de aquí existe por un error ajeno documentado. Romper cualquiera
hunde el proyecto, y varias lo hundirían con razón.

Estos límites son lo único que sobrevivió del blueprint de Ruta Clara. Se
conservan porque son el mejor trabajo que quedó de aquella etapa.

## 1. No registramos a nadie

**En la pantalla 1, permanente y grande: «Esto no lo registra ante ninguna
entidad.»**

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

Aviso fijo: *«Registrarse en el censo es gratis. Nadie puede cobrarle.»*

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

Invariante en código (`app/app/api/diagnose/route.ts`): si el modelo se abstiene
sin explicar qué falta, el servidor rellena la pregunta. Nunca devuelve una
abstención muda.

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

## Barrido antes de entregar

```bash
grep -rniE "es segura|es habitable|cumple norma|garantiza|queda registrado ante" app/app app/components app/lib
```

Cero coincidencias, salvo las prohibiciones mismas dentro del prompt del
sistema. Ejecutado el 2026-08-15: pasa.
