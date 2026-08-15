# Decision provisional - Funciona, evidencia vigente

Estado: `CURRENT - GANADOR PROVISIONAL; REQUIERE SPIKE ANTES DEL MVP`

Fecha: 2026-08-15 (America/Bogota)

## Resultado

Se descarta la promesa `decir si funciona hoy`: ningun corpus documental puede
garantizar estado en tiempo real. Se conserva el valor publico con una promesa
verificable:

**Funciona reconcilia afirmaciones publicas fechadas para mostrar la evidencia
mas reciente sobre la disponibilidad de un servicio, revelar fuentes obsoletas
o contradictorias y explicar las dependencias que faltan.**

No afirma mas que la evidencia. Sus estados son:

- `confirmado operativo al <fecha>`;
- `confirmado no operativo al <fecha>`;
- `evidencia contradictoria o desactualizada`;
- `sin evidencia suficiente`.

## Ground truth manual - Mocoa

### 1. Megacolegio Ciudad Mocoa

| Momento | Evidencia | Interpretacion limitada |
|---|---|---|
| 2023 | Procuraduria: 97 % de obra, sin operacion por dependencia de alcantarillado Sauces II | No operativo en ese corte pese a avance alto. |
| 2024 | Fuentes de inauguracion/entrada en funcionamiento | Cambio de estado; invalida usar 2023 como presente. |
| 2025 | Actividad escolar documentada; portal UNGRD aun muestra cifras antiguas | Operacion posterior confirmada; fuente oficial de avance esta obsoleta. |

### 2. Vivienda Sauces II

| Momento | Evidencia | Interpretacion limitada |
|---|---|---|
| 2018 | MinVivienda anuncio inicio de 909 viviendas | Promesa/anuncio, no entrega. |
| 2023 | Seguimiento reporto contratos en liquidacion y avance fisico parcial | Proyecto no materializado para la mayoria. |
| 2025 | UNGRD anuncio que las obras iniciarian en el segundo semestre | Nueva etapa/preparacion, no viviendas entregadas. |
| 2026 | UNGRD socializo nuevo diseño urbanistico; contratos por grupos seguian en proceso | Evidencia mas reciente encontrada: construccion/reformulacion, no entrega de 909 soluciones. |

### 3. Sistema de Alerta Temprana de Mocoa

| Momento | Evidencia | Interpretacion limitada |
|---|---|---|
| 2017-2018 | Instalacion y puesta en funcionamiento contractual | Existio una entrega inicial. |
| Portal historico vigente en web | Presenta un SAT que monitorea cinco cuencas | Afirmacion sin fecha de corte visible. |
| 2025 | Licitacion de repotenciacion para Mocoa quedo sin ofertas | Recuperacion no contratada en ese intento. |
| 29 mayo 2026 | UNGRD adjudico recuperacion y afirmo que todas las estaciones estaban fuera de servicio | `Confirmado no operativo al 29-05-2026`; no afirmar estado posterior sin evidencia. |

Los tres casos pasan el gate documental: tienen identidad, cronologia,
contradiccion/cambio de estado y fuente. Tambien prueban que `avance` no equivale
a `resultado funcional` y que la fecha es parte del dato.

## Oferta y diferenciacion

| Sustituto | Ya ofrece | Funciona solo gana si ofrece |
|---|---|---|
| SECOP / SGR / MapaRegalias | Contrato, recursos, etapa, avance | Reconciliacion temporal entre proyecto y servicio. |
| Portal Construyendo Mocoa | Resumen sectorial y cifras de avance | Deteccion visible de contenido obsoleto y fuente mas reciente. |
| Procuraduria / prensa | Investigacion caso por caso con autoridad | Exploracion sistematica, citas y dependencias; no reemplazo del juicio. |
| ANIscopio / veedurias | Consulta y seguimiento de proyectos | Estado funcional fechado, no solo ejecucion. |

No se encontro equivalente publico exacto. Esto es evidencia de busqueda, no
prueba de ausencia de herramientas internas o nuevas.

## IA indispensable

1. Resolver que `Colegio Ciudad Mocoa`, `megacolegio` y una actividad PAE son la
   misma entidad.
2. Extraer afirmacion, fecha de corte, evento y fuente desde PDF/web heterogeneos.
3. Clasificar relacion temporal: actualiza, contradice, completa o no compara.
4. Enlazar dependencia `alcantarillado -> apertura del colegio`.
5. Abstenerse si falta fecha, sujeto o evidencia funcional.

Reglas deterministas validan fechas, citas y transiciones permitidas. El modelo
propone; no publica ni acusa.

## Demo ganadora - 52 segundos

1. Abrir `Mocoa > Sistema de Alerta Temprana` (4 s).
2. Mostrar pagina oficial: `1 SAT, monitoreo de 5 cuencas` (6 s).
3. Funciona detecta que no hay fecha de corte y abre la linea de tiempo (8 s).
4. 2025: licitacion desierta; 29-may-2026: contrato de recuperacion y todas las
   estaciones reportadas fuera de servicio (12 s).
5. Cambia a `confirmado no operativo al 29-may-2026`, con cita, no `hoy` (8 s).
6. Grafo muestra estaciones/sirenas/telecomunicaciones y responsable de
   verificacion; cierre: `avance no es servicio; evidencia sin fecha no es
   vigencia` (14 s).

## Rubrica CTW provisional

| Criterio | Puntos | Justificacion |
|---|---:|---|
| Impacto publico /25 | 23 | Resultado entendible para comunidad y control; problema probado. |
| IA /25 | 24 | Resolucion temporal, entidades, contradiccion y dependencias son nucleares. |
| Demo /20 | 20 | Contradiccion oficial visual en menos de 15 segundos. |
| Viabilidad/escala /15 | 11 | Datos publicos, pero actualizacion y definiciones sectoriales cuestan. |
| Tecnica/UX /15 | 13 | Un caso precargado es viable; grafo completo requiere disciplina. |
| **Total** | **91** | Supera CompilaGRD 89 por impacto/demo; tiene mayor riesgo de vigencia. |

## Gates antes de implementar el MVP

Spike de 2 horas sobre las tres lineas de tiempo:

1. Extraccion de sujeto, afirmacion, fecha y cita en 12 fragmentos.
2. Cero citas inventadas y cero estados sin fecha.
3. Precision >= 0,90 en `actualiza/contradice/no comparable`.
4. Una persona ajena entiende la diferencia entre `hoy` y `al <fecha>` en 15 s.
5. Demo usa SAT como caso principal; megacolegio solo como ejemplo de cambio de
   estado, nunca como servicio actualmente bloqueado.

Si falla, volver a CompilaGRD. No reducir Funciona a un mapa o semaforo manual.

