# ADR 0004: Proponer Funciona con evidencia vigente para Track 01

- Status: proposed
- Date: 2026-08-15
- Decision owner: equipo de hackathon; analisis preparado por Codex

## Context

CompilaGRD tiene valor institucional pero impacto indirecto. Funciona hizo
visible una brecha publica entre avance de obra y servicio. La primera version
prometia estado actual y fallo al usar evidencia 2023 del megacolegio, que entro
en operacion en 2024. Mocoa tambien contiene evidencia temporal fuerte para
vivienda y alerta temprana.

## Decision

Proponer una version temporal y verificable: Funciona no declara estado en
tiempo real. Reconcilia afirmaciones fechadas, revela obsolescencia,
contradicciones y dependencias, y muestra el ultimo estado sustentado con fecha.
Track 01 fue confirmado por el equipo.

## Consequences and trade-offs

- Impacto y demo mas claros que un linter interno.
- IA central y auditable en razonamiento temporal/semantico.
- Riesgo alto de fuentes incompletas o desactualizadas.
- Definicion de evidencia funcional cambia por sector.
- No reemplaza inspeccion de campo, control fiscal ni periodismo.

## Alternatives considered

- CompilaGRD: fallback si falla vigencia/extraccion.
- Replay GRD: dolor directo insuficiente.
- Tracker/mapa de obras: oferta abundante y IA ornamental.

## Verification or review condition

Aceptar despues del spike si hay cero citas inventadas/estados sin fecha,
precision >= 0,90 en relaciones temporales y comprension en 15 segundos. Demo
principal SAT Mocoa 2026; prohibido presentar el megacolegio como no operativo
actual.

## Supersedes / Superseded by

- Supersedes: ADR 0003 solo al cambiar este ADR a `accepted`.
- Superseded by: ninguno.
