# Procedimiento de revisiones externas

Estado: `SUPERSEDED - PROCEDIMIENTO DE RUTA CLARA; NO EJECUTAR`. Estas
revisiones no estan delegadas al usuario por defecto;
el equipo debe conseguir a la persona competente. Ninguna revision autoriza
produccion, radicacion o uso de datos reales.

## Preparacion comun

1. Congelar un candidato con commit o ZIP, fecha y SHA-256. No editarlo despues
   de enviarlo; corregir en una version nueva.
2. Crear solo los dos casos sinteticos de `TEST_PLAN.md`; buscar nombres,
   direcciones, voces, fotos, numeros y metadatos que identifiquen personas.
3. Preparar URL local/staging, dos PDFs, contrato JSON, corpus y lista de
   preguntas. Ocultar secretos, consola, analytics y logs.
4. Registrar reviewer, rol, fecha/zona y version. Su resultado sera
   `Domain-approved` o `User-observed`, nunca `Machine-verified`.

Stop comun: si aparece PII, secreto o una persona real, detener, retirar acceso,
crear fixtures nuevos y revisar copias/logs antes de reanudar.

## Revision juridica

Owner de la accion: abogado colombiano. Objetivo: aprobar o rechazar cada ruta
de demo, no validar el producto completo.

### Acciones exactas

1. Entregar blueprint, corpus congelado, reglas, casos A/B y PDFs. Esperado: el
   abogado identifica exactamente la version revisada.
2. Pedir que marque para cada caso: hechos admisibles, objetivo, instrumento,
   autoridad/competencia, contenido minimo, pretensiones, fuente y limite.
   Esperado: cada campo queda `APROBADO`, `CORREGIR` o `NO DETERMINADO`.
3. Pedir comparacion explicita entre peticion y tutela y condicion de
   escalamiento. Esperado: la demo no presenta tutela como atajo automatico.
4. Verificar cada cita contra el fragmento y la fuente oficial. Esperado: cero
   referencias inexistentes, impertinentes o parafraseadas como texto literal.
5. Pedir lectura en lenguaje ciudadano y del disclaimer. Esperado: no promete
   exito, derecho definitivo, respuesta ni plazo fuera de lo aprobado.
6. Conservar dictamen/comentarios y registrar resultado en evidencia.

### Stop y recuperacion

- Cualquier `CORREGIR` en autoridad, instrumento o fuente bloquea esa ruta.
- Recuperacion segura: mostrar solo expediente y "requiere orientacion humana";
  corregir en nueva version y repetir todos los pasos.
- La aprobacion expira si cambia corpus, regla, prompt que controla contenido
  juridico, destinatario o caso.

## Revision de seguridad/riesgo

Owner de la accion: profesional competente en gestion del riesgo o evaluacion
post-desastre. Objetivo: asegurar que la UX no induzca entrada, ocupacion o una
interpretacion de dictamen.

### Acciones exactas

1. Entregar las cinco pantallas, caso peligroso y video sin explicar la
   intencion. Esperado: el reviewer evalua lo que un usuario realmente ve.
2. Pedir que senale cualquier instruccion que incentive acercarse, entrar,
   permanecer, tomar mas fotos o esperar respuesta de la app. Esperado: ninguna.
3. Revisar colores, iconos, scores y palabras. Esperado: nada se interpreta como
   seguro/habitable, nivel de dano o permiso de ocupacion.
4. Ejecutar variante olor a gas, colapso, cables y movimiento. Esperado: el
   flujo se detiene antes de analisis y manda alejarse/seguir autoridades.
5. Registrar aprobacion/correcciones y version.

### Stop y recuperacion

- Si una pantalla parece dictamen o permiso, retirarla del candidato y video.
- Recuperacion segura: abstencion total; permitir solo evidencia ya existente y
  export local. Repetir revision en version nueva.
- La aprobacion expira si cambia copy, iconografia, logica de stop o recorrido de
  captura.

## Prueba UX sin ayuda

Owner: facilitador del equipo. Observadores: dos personas que no construyeron el
MVP.

1. Preparar telefono limpio, URL/QR, caso sintetico y cronometro; no activar
   grabacion sin consentimiento.
2. Leer solo: "Documenta este caso y prepara el resultado". No explicar botones.
3. Observar en silencio los puntos de `TEST_PLAN.md`; anotar errores, tiempo y
   frases exactas sin datos personales.
4. Al final preguntar que significa offline, si fue radicado y si la app dijo
   que la vivienda era segura.
5. Esperado: ambos completan, entienden cola/sync, dicen que no fue radicado y
   que la app no evalua seguridad.

Stop: confusion que pueda causar riesgo o radicacion equivocada bloquea el
video. Recuperacion: corregir, crear nueva version y probar con otra persona;
no instruir al mismo participante hasta forzar un pase.

## Evidencia a retener y privacidad

- Version/hash, fecha/zona, reviewer/rol, checklist y resultado por item.
- No publicar nombres/contactos del reviewer sin permiso; puede registrarse rol
  o identificador interno.
- Comentarios con casos reales deben ser anonimizados antes de entrar al repo.
- Capturas o grabaciones se clasifican `Interno` y se eliminan si no son
  necesarias; conservar solo evidencia minima de la decision.
