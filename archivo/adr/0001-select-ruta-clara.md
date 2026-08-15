# ADR 0001: Seleccionar Ruta Clara en Track 02

- Status: superseded
- Date: 2026-08-15
- Decision owner: equipo de hackathon; analisis preparado por Codex

## Context

La hackathon usa una rubrica de 100 puntos y una entrega de codigo mas video de
maximo un minuto. Se compararon seis conceptos. El ganador necesita IA central,
impacto publico visible, construccion en menos de 24 horas y limites de
seguridad defendibles.

## Decision

Construir Ruta Clara para Track 02. El MVP convierte evidencia post-desastre en
un expediente trazable, identifica faltantes, recupera solo fuentes juridicas
aprobadas, recomienda una ruta sujeta a confirmacion y exporta un borrador.

La IA no decide seguridad estructural, no sustituye abogado, no radica y no
genera citas fuera del corpus. Track 01 permanece como alternativa historica,
no como modulo.

## Consecuencias y trade-offs

- A favor: mejor puntaje estimado (93), historia movil autocontenida, pocas
  dependencias y nucleo de IA visible.
- En contra: mantenimiento del corpus, riesgo de autoridad incorrecta y
  privacidad de evidencia sensible.
- Costo aceptado: limitar rutas y casos de demo para hacer verificables las
  citas y abstenciones.
- Costo evitado: no integrar SECOP ni intentar clasificacion estructural.

## Alternatives considered

- Reconstruccion Visible (87): alto impacto, descartada por dependencia de
  fuentes y conciliacion de datos.
- Campo Responde (84): viable, con mas validacion sectorial y menor claridad de
  IA en un minuto.
- Guardianes del Territorio (78): impacto educativo dificil de demostrar en 24
  horas.
- Triage estructural (85, inelegible): falla encaje inequivoco y seguridad.
- Superapp (61, inelegible): sobrealcance.

## Verification or review condition

- Reabrir solo si antes de H+2 una dependencia critica impide cualquier corte
  vertical de Ruta Clara y un fixture local tampoco permite demostrarlo.
- No reabrir por deseo de agregar funciones.
- Requiere revision juridica antes de uso real; la aceptacion del ADR no es
  aprobacion legal.

## Supersedes / Superseded by

- Supersedes: ninguna decision previa documentada.
- Superseded by: la decision fue reabierta; ADR 0003 propone CompilaGRD y solo la
  reemplazara formalmente cuando el equipo la acepte.
