# Changelog

Todas las fechas usan America/Bogota.

## 2026-08-15 — Contados (construccion)

### Added

- `app/`: aplicacion Next.js 16 + TypeScript. Rutas `/`, `/tablero`,
  `/api/diagnose`, `/api/peticion`. Build limpio, typecheck limpio.
- `lib/schema.ts`: modelo `Case` de cinco compuertas
  (reporte, censo, evaluacion tecnica, RUD, subsidio), tomado del ciclo de
  Primero/CPIMS+ (UNICEF) en vez de inventarlo. Incluye el JSON Schema estricto
  (`additionalProperties: false`) del clasificador.
- `lib/corpus.ts`: corpus normativo congelado con SHA-256 calculado al cargar.
  Ley 1755 de 2015 arts. 13 y 14; Ley 1523 de 2012 art. 4. Calculo de dias
  habiles en codigo determinista.
- `lib/rutas.ts`: ruta verificada de Manizales (punto de atencion, que llevar,
  subsidio de $300.000 para ~1.150 familias administrado por Cruz Roja Caldas).
- `lib/fixtures.ts`: 54 casos sinteticos deterministas para el tablero.
- Captura por voz con Web Speech API (`es-CO`) en el navegador; el audio no
  sale del dispositivo. Campo de texto siempre disponible como respaldo.

### Changed

- Se pivotea a **Contados** tras deep research (8 agentes, ~130 busquedas) y
  segunda opinion de Codex. Murieron con evidencia: censo ciudadano por voz
  (el RUD solo lo digita el CMGRD; ya existe Gravitas), evaluacion de danos por
  foto (ya existe SismoAyuda Colombia con ingenieros voluntarios y ATC-20),
  detector de corrupcion en SECOP (ya existen cerocorrupcion.pro y
  anticorrupcion.co), y Seguro Oculto (el hallazgo fue noticia masiva del 11 al
  14 de agosto).
- Del paquete previo se conservan solo los limites de seguridad.

### Verified

- `npx tsc --noEmit` y `npx next build`: limpios.
- `/api/peticion`: genera el oficio con destinatario de la ruta verificada, las
  dos citas literales del corpus con su SHA-256, y el vencimiento calculado en
  codigo (15-ago-2026 + 15 dias habiles = 4-sep-2026, comprobado a mano).
- Manejo de UTF-8 correcto en formData (acentos y enies).
- Ambas paginas renderizan sin errores de consola en viewport movil 412x915.

### Safety

- La pantalla 1 declara de forma permanente que **esto no registra a nadie ante
  ninguna entidad**. No se pide cedula ni datos bancarios.
- Abstencion obligatoria: si el relato no alcanza, el clasificador devuelve
  `compuerta: null` y pregunta lo que falta. Nunca inventa una compuerta.
- Cada hecho lleva la frase textual del relato que lo sustenta.
- Ninguna cita se genera con el modelo: se renderiza desde el corpus con hash.
- El agregado se rotula siempre como autorreportado, nunca como cifra oficial.
- El PDF sale marcado `BORRADOR - NO RADICADO - CASO DE DEMOSTRACION`.
- Se afirma explicitamente que no se evalua si una vivienda es segura o
  habitable.

### PENDING

- **Sin probar contra el modelo**: no habia `ANTHROPIC_API_KEY` en el entorno de
  construccion. Falta ejecutar los tres casos de prueba y la prueba de
  abstencion contra `claude-opus-5`.
- Falta grabar los tres audios sinteticos.
- Falta la prueba de falsa expectativa con una persona ajena al equipo.

## 2026-08-15

### Changed

- Ruta Clara y sus planes de implementacion pasaron a historicos/supersedidos
  por falta de diferenciacion percibida.
- La implementacion permanece bloqueada hasta que el equipo acepte una nueva
  decision y se reemplacen backlog, build plan, guion y pruebas.
- `HISTORICAL`: Nexo GRD fue la propuesta intermedia y quedo supersedida sin
  aceptacion despues de la deep research.
- CompilaGRD paso a reevaluacion por beneficio publico indirecto; se abrio
  `Funciona`, centrado en servicio operativo y dependencias verificables.
- Funciona fue reformulado tras ground truth y segunda critica de Claude: ahora
  muestra evidencia funcional fechada y contradicciones; no promete estado en
  tiempo real. ADR 0004 queda propuesto y el MVP bloqueado por un spike.

### Added

- Deep research adversarial con evidencia de practica, oferta 2026, PAE
  publicos y segunda opinion de Claude Code.
- CompilaGRD como propuesta preventiva para consolidacion/ajuste del PAE;
  blueprint y ADR 0003 pendientes de gates.
- Siete PDF oficiales nuevos preservados con hashes.

- Analisis normativo-operativo y nueva matriz de oportunidad.
- Nexo GRD como propuesta: conciliacion verificable de EDAN, RUD y reportes
  sectoriales en la transicion a recuperacion.
- Blueprint propuesto y ADR 0002, aun pendientes de aprobacion del equipo.
- Copias inmutables y hashes de Circular 031 de 2026 y borrador ENRE 2025.

### Safety

- Nexo no decide elegibilidad, prioridad, asignacion, entrega o escalamiento.
- Solo se autorizan fixtures sinteticos; quedan bloqueados datos reales,
  integraciones, despliegue y publicacion.
- El borrador ENRE se etiqueta como documento en construccion, no norma vigente.

### PENDING

- Confirmacion de Track 01 y autorizacion del experimento de 10 compromisos.
- Entrevista futura con formulador PAE antes de afirmar valor o adopcion real.
