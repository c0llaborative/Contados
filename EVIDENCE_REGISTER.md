# Registro de evidencia

Estado: `CURRENT`

Fuentes web consultadas el 2026-08-15 en America/Bogota.

> **Nota de reorganizacion (2026-08-15).** Los productos descartados y sus
> fuentes se movieron a `archivo/`. Las rutas historicas de este registro se
> reinterpretan asi:
>
> | Ruta original | Ruta actual |
> |---|---|
> | `docs/SOURCES.md` y demas docs de productos descartados | `archivo/docs/` |
> | `docs/adr/000[1-4]*.md` | `archivo/adr/` |
> | `evidence/sources/*.pdf` | `archivo/evidencia-fuentes/` |
> | `2026-08-15_*.jpg` | `archivo/canal-interno/` |
>
> Los hashes no cambian: solo se movieron los archivos. La procedencia y los
> limites vigentes de Contados estan en [`docs/EVIDENCIA.md`](docs/EVIDENCIA.md).

| ID | Fecha y zona | Fuente/observador | Alcance | Resultado | Efecto de seguridad | Ruta | SHA-256 | Privacidad | Interpretacion |
|---|---|---|---|---|---|---|---|---|---|
| EV-001 | 2026-08-15 America/Bogota | `pdfplumber`, PyMuPDF + Codex | Deck CTW, 16 paginas | Pass | Solo lectura | `deck-CTW-2026.pdf` | `901A1752E93FD442686505A33A9B705AFFD561BEE40156C74280E5A240220CD8` | Interno | Prueba tracks, entrega y rubrica; no viabilidad. |
| EV-002 | 2026-08-15 America/Bogota | Codex | Cuatro capturas del canal | Pass | Solo lectura | `2026-08-15_*.jpg` | Manifiesto inferior | Interno; nombres/fotos | Redundante frente al deck; no usar publicamente. |
| EV-003 | 2026-08-15 America/Bogota | Codex + fuentes web | Oficiales y comparables | Pass | Solo lectura | `docs/SOURCES.md` | N/A | Publico | Sustenta contexto y limites; no aprobacion institucional. |
| EV-004 | 2026-08-15 America/Bogota | Codex | Quality gate historico de Ruta Clara | Pass con limitacion | Solo lectura | `README.md`, `docs/` | N/A | Interno | Gate documental historico; Git diff no disponible. |
| EV-005 | 2026-08-15 America/Bogota | Codex + inspeccion PDF | Circular UNGRD 031 de 2026, 4 paginas | Pass | Descarga y lectura local | `evidence/sources/Circular-031-2026.pdf` | `8F2C99FF731CC39A8F93E142867B5351B92667EB78A61090CFA27BBA3B23D062` | Publico | Sustenta seguimiento/ajuste de PMGRD/EMRE; no aprueba Nexo. |
| EV-006 | 2026-08-15 America/Bogota | Codex + inspeccion PDF | ENRE 2025, paginas pertinentes de 101 | Pass con limite | Descarga y lectura local | `evidence/sources/ENRE-2025-draft.pdf` | `CE401E7F907A9746CAC8931EAF41911AF91173142815D52F4CF6EFC6E301ADB9` | Publico | Describe handoff y friccion; es borrador, no norma vigente. |
| EV-007 | 2026-08-15 America/Bogota | Codex | Matriz, blueprint y ADR Nexo | Pass documental; decision pendiente | Solo documentos locales | `docs/REDESIGN_DECISION.md`, `docs/NEXO_GRD_BLUEPRINT.md`, `docs/adr/0002-propose-nexo-grd.md` | N/A | Interno | Prueba trazabilidad; no valor real, adopcion ni aceptacion. |
| EV-008 | 2026-08-15 America/Bogota | Codex + PowerShell | Quality gate sobre 16 Markdown y 2 PDF | Pass con limitacion | Solo lectura y eliminacion de renders temporales | `README.md`, `docs/`, `evidence/sources/` | Hashes EV-005/006 | Mixto | 0 enlaces locales rotos, 5/5 sumas, 0 whitespace/tabs/conflictos y hashes coincidentes. `git diff --check` no disponible: el proyecto no es un repositorio Git valido. |
| EV-009 | 2026-08-15 America/Bogota | Codex + inspeccion textual/visual | Evaluacion DNP 2018, 334 paginas | Pass con limite temporal | Descarga y lectura | `evidence/sources/DNP-evaluacion-SNGRD-2018.pdf` | `BD0170706AF56A4FD850F26C0A5196DAE7E940D04DCFFEE5469037A3FD22AF58` | Publico | Prueba diagnostico nacional historico; no estado 2026. |
| EV-010 | 2026-08-15 America/Bogota | Codex + inspeccion textual/visual | Estrategia 2025, PNGRD XVI, Vision 2026 y Circular 045 | Pass con limites | Descarga y lectura | `evidence/sources/` | Manifiesto EV-010 | Publico | Prueba brechas declaradas, reporte reciente y oferta interna; estrategia es borrador y vision es aspiracional. |
| EV-011 | 2026-08-15 America/Bogota | Codex + PyMuPDF | PAE 2021 (68 p.) y reporte 2022 (262 p.) | Pass de factibilidad documental | Descarga y lectura; sin PII | `evidence/sources/PAE-*.pdf` | Manifiesto EV-011 | Publico | Hay datos reales y cambio de esquema para experimento; no mide exactitud del modelo. |
| EV-012 | 2026-08-15 America/Bogota | Claude Code 2.1.233 Sonnet | Revision adversarial segun prompt local | Pass, 152 s, exit 0 | Solo lectura/web; sin edicion | `docs/CLAUDE_REVIEW_PROMPT.md`, `docs/CLAUDE_REVIEW.md` | N/A | Interno | Segunda opinion favorece integridad PAE; no es fuente factual ni aprobacion. |
| EV-013 | 2026-08-15 America/Bogota | Python/PowerShell + Codex | Gate documental final sobre 22 Markdown y 9 PDF | Pass con limitacion Git | Solo lectura; 28 renders temporales eliminados | `README.md`, `docs/`, `evidence/sources/` | 9/9 hashes coinciden | Mixto | 0 enlaces locales rotos, 6/6 sumas, 0 whitespace/tabs/conflictos, 0 temporales; `git diff --check` no disponible porque no es repo Git. |
| EV-014 | 2026-08-15 America/Bogota | Codex + fuentes web oficiales | Reencuadre de recuperacion funcional | Pass inicial; hipotesis abierta | Solo lectura/documentacion | `docs/PUBLIC_VALUE_REFRAME.md` | N/A | Publico | Mocoa prueba diferencia entre avance fisico y servicio; matrices existentes privilegian avance fisico/financiero. No prueba ausencia de competidor ni causalidad. |
| EV-015 | 2026-08-15 America/Bogota | Codex + web oficial | Ground truth temporal de tres servicios Mocoa | Pass manual con limites | Solo lectura/documentacion | `docs/FUNCIONA_DECISION.md`, `docs/SOURCES.md` | N/A | Publico | Tres lineas de tiempo utilizables; prueba cambios/obsolescencia, no estado en tiempo real. |
| EV-016 | 2026-08-15 America/Bogota | Claude Code 2.1.233 Sonnet | Revision adversarial de Funciona | Pass, 209,5 s, exit 0 | Solo lectura/web; sin edicion | `docs/CLAUDE_FUNCIONA_PROMPT.md`, `docs/CLAUDE_FUNCIONA_REVIEW.md` | N/A | Interno | Detecto uso caduco del megacolegio; causo revocacion de promesa `hoy`. No es fuente factual. |
| EV-017 | 2026-08-15 America/Bogota | Python/PowerShell + Codex | Gate documental Funciona | Pass con limitacion Git | Solo lectura | `README.md`, `docs/`, `EVIDENCE_REGISTER.md` | N/A | Mixto | 27 Markdown, 0 links rotos, 0 issues de formato, rubrica suma 91 y 0 temporales; Git diff no disponible por no ser repo. |
| EV-018 | 2026-08-15 America/Bogota | Claude Code + deep research | Tres rondas, 8 agentes, ~130 busquedas, mas segunda opinion de Codex | Pass | Solo lectura/web | `docs/EVIDENCIA.md` | N/A | Publico | Prueba el hueco: no existe consulta de estado por cedula en UNGRD ni en 5 alcaldias. No prueba adopcion ni valor real. |
| EV-019 | 2026-08-15 America/Bogota | `curl` directo a datos.gov.co | API SECOP II `jbjy-vk9h` | Pass | Solo lectura | Consulta en vivo, sin artefacto local | Publico | Datos frescos al 14-ago; 12 contratos por urgencia manifiesta post-sismo, incluidos los 2 de Manizales con Cruz Roja Caldas. **Hipotesis de pico de contratacion: FALSA** (37/35/26/61/12 en ventanas comparables). |
| EV-020 | 2026-08-15 America/Bogota | `tsc`, `next build`, `curl`, browse headless | Verificacion de Contados sin modelo | Pass con pendiente | Build y lectura local | `app/` | N/A | Interno | Typecheck y build limpios, 5 rutas; oficio con 2 citas del corpus y su SHA-256; plazo 15-ago + 15 dias habiles = 4-sep-2026 comprobado a mano; UTF-8 correcto; 0 errores de consola en 412x915. **No prueba el clasificador: no habia `ANTHROPIC_API_KEY`.** |
| EV-021 | 2026-08-15 America/Bogota | Claude Code | Reorganizacion del repositorio | Pass | Movimiento de archivos, sin borrado | `archivo/`, `docs/`, `README.md` | N/A | Interno | 19 docs, 4 ADR, 9 PDF y 4 capturas movidos a `archivo/` sin perdida. Documentacion de Contados reescrita. |

## Manifiesto EV-002

| Archivo | SHA-256 |
|---|---|
| `2026-08-15_121527.jpg` | `50786C1B1D8813B5300628B3ABC2E2AF2D9CFB4EC01F4B5234CE0282CAC6E92B` |
| `2026-08-15_121538.jpg` | `0BC48BC1268D82B06EC69746987B458CE8F306D336A6AB171065124D34C37C37` |
| `2026-08-15_121550.jpg` | `4F11C6416D8B0CB253CA3810A84A3F7DD9C2D964F4A7069074F448AD6109032D` |
| `2026-08-15_121601.jpg` | `A8AC392E1B17E6A6C110A09F7705AF51F9D569FC75078968A746C1EADBF7E649` |

## Manifiesto EV-010

| Archivo | SHA-256 |
|---|---|
| `Circular-045-PRT-2026.pdf` | `4AF755B3C14E1C91B99B56063A77592BF5B1B34810694ECB1DDFC3EDF1FCCE63` |
| `Estrategia-Recuperacion-2025.pdf` | `025D27E6FBA56A2BE195F5142B00A39FD41776CB5E7C275228270560299D90E5` |
| `PNGRD-XVI-2015-2024.pdf` | `3AA01FB3B04E2C6AB84B0EBFA8209A6F96D3B27F5D90F5ECFCD3F79D5AD2B6BF` |
| `Vision-Pais-2026.pdf` | `25AF412A9CEB3FABD7A7E3435047ADBB2DBE9AD3209DD46B1831B7A24F27A7EB` |

## Manifiesto EV-011

| Archivo | SHA-256 |
|---|---|
| `PAE-SAN-ANDRES-2021.pdf` | `8FD03FF5E5FD58C0F626310210040DA7E6A2D8A6F74FE6F8376C52C1E1F58459` |
| `PAE-SAI-REPORTE-2022.pdf` | `3A80B2CCFD4D22FA8497698A7916B0BDA1D695F4CDEFA89C2C79A65FD9E3B573` |

## Evidencia externa pendiente

Vigentes para Contados. Las de productos descartados quedan en `archivo/`.

| ID | Owner/observador | Resultado requerido | Estado | Efecto |
|---|---|---|---|---|
| EXT-MODELO-001 | Equipo de hackathon | Los tres casos dan la compuerta correcta y la prueba de abstencion pasa contra `claude-opus-5` | **PENDIENTE — BLOQUEANTE** | Sin esto no se graba el video. Ver `docs/PRUEBAS.md`. |
| EXT-UX-003 | Persona ajena al desarrollo | Recorre el flujo sin ayuda oral y, al preguntarle «¿usted quedo registrado ante la alcaldia?», responde que no | PENDIENTE | Si duda, el copy esta mal y se corrige antes de grabar. |
| EXT-RUTA-001 | Punto de atencion de Manizales | Confirma que la ruta y el punto siguen vigentes | PENDIENTE | Si cambio, se actualiza `app/lib/rutas.ts` y su fecha de verificacion. |
| EXT-TRACK-001 | Equipo de hackathon, 2026-08-15 | Puede elegir track sin problema | PASS - USER-OBSERVED | Elimina bloqueo de track; no valida el producto. |
