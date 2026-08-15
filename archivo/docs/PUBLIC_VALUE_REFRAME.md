# Reencuadre de valor publico - Funciona

Estado: `SUPERSEDED - PROMESA "HOY" REVOCADA; VER FUNCIONA_DECISION.md`

Fecha: 2026-08-15 (America/Bogota)

## Objecion que reabre la decision

CompilaGRD resuelve un problema real, pero su valor ocurre dentro de una PMO y
el jurado tendria que entender primero el proceso de formulacion del PAE. Esto
debilita impacto percibido, demo y escala.

## Nueva tesis

**Funciona** muestra si el servicio publico prometido despues de un desastre ya
esta realmente operativo y que dependencia lo bloquea. No se limita a porcentajes
de obra o gasto.

Frase de demo: **"No te dice cuanto han gastado; te dice si el servicio volvio y
que falta para que funcione."**

## Usuario y momento

- Usuario primario: lider de veeduria o comunidad que sigue la reconstruccion.
- Secundarios: periodista, organo de control y gerente publico.
- Momento: cuando una entidad reporta avance y la comunidad necesita saber si
  ese avance ya produce escuela, agua, vivienda, salud o movilidad utilizable.
- Decision habilitada: priorizar una dependencia, pedir explicacion con fuente
  o concentrar seguimiento; el producto no acusa corrupcion ni sanciona.

## Evidencia inicial

- En Mocoa, la Procuraduria reporto un megacolegio con 97 % de obra que no podia
  operar hasta completar la interconexion de alcantarillado de Sauces II.
- El mismo reporte indico un acueducto al 94 % que aun necesitaba trabajos y un
  cronograma cierto para entrar en operacion.
- Las matrices publicas de obras y SECOP privilegian avance fisico/financiero,
  contrato, suspensiones y prorrogas. No se encontro en la busqueda publica una
  capa colombiana que represente sistematicamente recuperacion funcional y
  dependencias; esto sigue siendo una hipotesis de ausencia.
- El seguimiento PNGRD 2015-2024 muestra que completar actividades no garantiza
  mejores indicadores de personas/servicios afectados.

## Producto visible

Una pagina publica precargada, no una pantalla de carga de archivos:

1. Mapa/lista de servicios prometidos por territorio.
2. Estado: `operativo`, `parcial`, `no operativo` o `sin evidencia suficiente`.
3. Grafo de dependencias: obra -> conexion/permiso/dotacion -> servicio.
4. Cada nodo cita documento, pagina, fecha y nivel de confianza.
5. Comparacion entre avance contractual y recuperacion funcional.

## IA como nucleo

La IA extrae de contratos, PAE, reportes y boletines afirmaciones sobre obras,
servicios, dependencias y condiciones de entrada en operacion; resuelve
entidades que cambian de nombre/redaccion y propone enlaces. Reglas
deterministas controlan fechas, fuentes y estados. Sin evidencia suficiente se
abstiene.

## Demo de 50 segundos

1. `Megacolegio: 97 % de obra` (5 s).
2. Cambiar la vista de `avance` a `servicio`: `NO OPERATIVO` (5 s).
3. Abrir el grafo: alcantarillado de Sauces II bloquea apertura para 960
   estudiantes, con fuente visible (15 s).
4. Simular que llega evidencia de conexion terminada; la IA enlaza el documento
   y solicita verificacion humana (15 s).
5. El servicio cambia a `listo para verificar`, no automaticamente a operativo;
   cierre con escala a agua, salud, vivienda y movilidad (10 s).

## Ventaja frente a CompilaGRD

| Criterio | CompilaGRD | Funciona |
|---|---|---|
| Beneficio visible | Indirecto, interno | Directo para comunidad/veeduria |
| Momento wow | Error en un PAE | 97 % construido pero servicio bloqueado |
| Track 01 | Correcto pero administrativo | Transparencia publica inequivoca |
| Escala | Formulacion de PAE | Recuperacion y luego toda obra publica |
| Riesgo | Adopcion institucional | Actualizacion y verificacion de estado |

## Riesgos fatales

1. Que los documentos publicos no permitan distinguir obra terminada de servicio
   operativo sin inspeccion de campo.
2. Que una plataforma estatal ya publique dependencias y estado funcional.
3. Que el MVP termine mostrando solo otro semaforo sin cadena causal.
4. Que el lenguaje parezca acusacion o convierta inferencias en hechos.

## Proximo experimento

Construir manualmente ground truth para tres servicios de Mocoa: megacolegio,
acueducto y vivienda. Para cada uno, registrar avance, resultado funcional,
dependencia, fecha y cita. La hipotesis pasa si al menos dos tienen una cadena
documental verificable y la diferencia `avance != servicio` es comprendida por
tres personas en menos de 15 segundos.
