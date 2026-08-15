# Backlog CTW - Ruta Clara

Estado: `SUPERSEDED - NO EJECUTAR HASTA NUEVA SELECCION`.

## Must - necesarios para la entrega

| ID | Entregable | Criterio de aceptacion observable |
|---|---|---|
| M1 | PWA movil por QR | Abre en telefono, se puede agregar a inicio y carga shell sin red tras primera visita. |
| M2 | Caso fixture seguro | Carga caso compuesto sin PII real y muestra banner de demo. |
| M3 | Captura local | Foto/archivo y audio/texto se guardan con ID, hash y estado `BORRADOR LOCAL`. |
| M4 | Cola offline visible | Sin red, `Analizar` pasa a `EN COLA`; al volver red procesa una vez y llega a estado final. |
| M5 | Extraccion IA estructurada | Devuelve schema valido, hechos con `kind`, evidencia, confianza y faltantes. |
| M6 | Confirmacion humana | Ningun hecho no confirmado entra al borrador; usuario puede corregir/rechazar. |
| M7 | RAG allowlist | Ruta usa al menos un fragmento oficial congelado; cero retrieval bloquea cita/borrador. |
| M8 | Ruta y abstencion | Caso feliz explica ruta pendiente de revision; caso peligroso y evidencia insuficiente se abstienen. |
| M9 | PDF/JSON con procedencia | Export muestra banner demo, hechos, evidencia, incertidumbre, fuentes, versiones y hashes. |
| M10 | Video de 55 s | Valor antes de 15 s, recorrido completo, limite de seguridad y CTA; archivo menor de 1 min. |
| M11 | QA P0 | Todos los tests P0 de `TEST_PLAN.md` pasan y resultado queda en evidencia. |

## Should - solo despues del corte vertical

| ID | Entregable | Criterio de aceptacion |
|---|---|---|
| S1 | Segundo camino institucional | Caso B usa reglas y destinatario revisados, sin duplicar pipeline. |
| S2 | Cifrado local | Prueba demuestra ciphertext en persistencia y recuperacion correcta; entonces puede mostrarse etiqueta. |
| S3 | Compartir nativo | Usa Web Share cuando existe y descarga como fallback. |
| S4 | Correccion de conflictos | Dos versiones nunca se fusionan en silencio y ambas se conservan. |
| S5 | Accesibilidad basica | Navegacion teclado, labels, contraste y lectura de estados verificados. |
| S6 | Timeline de procedencia | Usuario puede abrir "De donde salio" para cada hecho/cita. |

## Could - no comprometer entrega

| ID | Entregable | Condicion |
|---|---|---|
| C1 | Directorio municipal adicional | Solo fuente oficial, versionada y revisada. |
| C2 | OCR adicional | Solo si no aumenta latencia ni rompe schema. |
| C3 | Multilenguaje | Copia revisada; no traduccion legal libre. |
| C4 | Dashboard agregado anonimo | Solo datos sinteticos; nunca antes de M1-M11. |

## Explicitamente fuera

- Dictamen o semaforo de seguridad estructural/habitabilidad.
- Tutela automatica, prediccion de exito o asesoria definitiva.
- Radicacion automatica, login institucional, SECOP o decisiones de ayudas.
- Datos personales reales, IA on-device no implementada y aplicacion nativa.
- Funciones de Track 01 o superapp.

## Regla de corte

Si a H+8 no pasa el corte M2-M9 con fixtures, congelar Should/Could. Si a H+16
falla el proveedor de IA, usar una respuesta fixture claramente marcada para la
demo tecnica y mostrar el manejo de error real; no fingir que el fixture fue
generado en vivo.
