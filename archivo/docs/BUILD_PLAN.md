# Plan horario de construccion - 23 horas efectivas

Estado: `SUPERSEDED - IMPLEMENTACION BLOQUEADA POR DECISION REABIERTA`

El deck dice 24H non-stop, pero agenda inicio 10:00 del sabado y deadline 09:00
del domingo: son 23 horas de reloj. Este plan usa el deadline mas conservador,
congelamiento interno a H+21 (07:00) y dos horas para evidencia, video y subida.

## Cuatro frentes

| Frente | Owner sugerido | Entrega principal | Dependencia compartida |
|---|---|---|---|
| Producto/UX + video | Persona 1 | Flujo, copy, fixtures, grabacion | Contrato JSON y estados. |
| PWA | Persona 2 | UI, IndexedDB, offline, cola, export | Mock API desde H+1. |
| Backend/IA/RAG | Persona 3 | API, schema, pipeline, corpus, PDF | Fixtures legales revisados. |
| Legal/evidencia/QA | Persona 4 | Corpus, reglas, pruebas, procedencia, safety | Acceso a todos los builds. |

Si hay menos personas, conservar el orden de hitos; no abrir mas frentes.

## Cronograma

| Hora | Objetivo y completion condition | Owners |
|---|---|---|
| H+0 a H+1 | Alinear blueprint; repo/build base; contrato JSON y dos fixtures versionados | Todos |
| H+1 a H+3 | PWA muestra cinco momentos con mock; API acepta caso; corpus minimo congelado | PWA, backend, legal |
| H+3 a H+5 | Corte vertical online: fixture -> hechos -> confirmacion -> ruta -> PDF | PWA + backend |
| H+5 | **Gate 1:** si no hay corte vertical, eliminar Should/Could y usar un solo caso | Todos |
| H+5 a H+8 | Captura real de medios sinteticos, schema estricto, citas por metadatos, procedencia | PWA, backend, QA |
| H+8 | **Gate 2:** M2-M9 pasan con fixtures; si no, reparar antes de seguir | Todos |
| H+8 a H+11 | IndexedDB, cola, reconexion e idempotencia; prueba offline P0 | PWA + QA |
| H+11 a H+13 | Abstenciones, errores, copy de seguridad y ruta A revisada | Backend, legal, UX |
| H+13 a H+15 | Integracion en telefono por QR; accesibilidad basica; export final | Todos |
| H+15 | **Gate 3:** flujo principal sin explicacion oral en dispositivo objetivo | QA + usuario prueba |
| H+15 a H+17 | Solo correcciones P0; segundo escenario si y solo si todo Must estable | Todos |
| H+17 a H+18 | Congelar funcionalidad; respaldo del build y fixtures; borrador video | Todos |
| H+18 a H+20 | Grabar 2-3 tomas, cronometrar, editar a 50-55 s; ejecutar suite final | UX/video + QA |
| H+20 a H+21 | Seleccionar video; build limpio; hashes y evidencia; README de entrega | Todos |
| H+21 | **FREEZE 07:00:** no features; candidato de entrega inmutable | Todos |
| H+21 a H+22 | Prueba desde QR, reproduccion completa del video y subida inicial | QA + owner entrega |
| H+22 a H+22:30 | Verificar archivos en repositorio/canal y conservar IDs/capturas | Owner entrega |
| H+22:30 a H+23 | Buffer; no depender del ultimo minuto | Todos |

## Checkpoints de integracion

- Cada dos horas: rama principal ejecutable y un responsable de merge.
- H+5, H+8, H+15 y H+21: registrar resultado, comando/build y bloqueador en el
  plan vivo antes de iniciar el siguiente tramo.
- No guardar una correccion unicamente en el telefono usado para grabar.

## Stop conditions

- Cualquier PII real: retirar, rotar fixture y revisar historial antes de subir.
- Cita sin `source_id`/fragmento/hash: bloquear ruta y PDF juridico.
- Copy que diga seguro, habitable, cumple norma o dictamen: bloquear release.
- Sync duplica o pierde caso: conservar flujo offline sin sync automatico y
  mostrar export local.
- A H+21 no hay candidato estable: entregar ultima version verificada, no el
  cambio mas reciente.

## Recuperacion

- Proveedor/modelo caido: fixtures precomputados marcados + manejo de error vivo.
- Backend caido: caso local exportable y video de candidato previamente grabado.
- Red del evento caida: PWA ya cargada, QR a URL cuando vuelva red y copia local
  del video/repositorio lista para el canal autorizado.
- Build roto despues de freeze: volver al artefacto sellado anterior; nunca
  editarlo en lugar.
