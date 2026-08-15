# ADR 0002: Proponer Nexo GRD para Track 01

- Status: superseded (nunca aceptado)
- Date: 2026-08-15
- Decision owner: equipo de hackathon; analisis preparado por Codex

## Context

El equipo reabrio Ruta Clara porque su patron de entrada/salida se parece a
otros productos de IA y no demuestra suficiente valor operacional. La Ley 1523
de 2012 exige continuidad e interoperabilidad; fuentes operativas oficiales
describen friccion entre EDAN/RUD y los instrumentos de recuperacion. Ya existen
herramientas de captura, tableros de capacidad y plataformas de coordinacion.

## Decision

Se propone construir Nexo GRD en Track 01: una capa acotada de conciliacion y
procedencia entre reportes de respuesta y el inicio de recuperacion. El MVP
resuelve entidades, conserva afirmaciones contradictorias, revela vacios y
exige confirmacion humana antes de exportar.

La decision quedo `superseded` sin haber sido aceptada; no autoriza
implementacion.

## Consequences and trade-offs

- A favor: dolor reconocido en una fuente oficial, IA central y verificable,
  salida interactiva y demo visual en menos de un minuto.
- A favor: complementa EDAN/RUD en lugar de competir con captura institucional.
- En contra: formatos reales, disponibilidad de datos y adopcion no estan
  validados con un operador.
- En contra: el encaje de una herramienta institucional en Track 01 debe
  confirmarse; la trazabilidad publica no permite exponer PII.
- Costo aceptado: usar fixtures sinteticos y demostrar conciliacion, no una
  integracion real.
- Limite: la herramienta no decide elegibilidad, prioridad, escalamiento,
  asignacion ni entrega.

## Alternatives considered

- SimulaGRD: excelente retador para Track 04, pero se solapa parcialmente con
  MEGIR/simulaciones y una demo multiagente puede ser dificil de validar.
- Brecha Cero: trazabilidad clara de necesidad a ayuda, pero compite con
  plataformas humanitarias existentes y requiere mas datos logisticos.
- Ruta Clara: viable, pero documental y menos diferenciada.
- Escala Capacidades: descartada como producto autonomo por autoridad sensible
  y encaje ambiguo.

## Verification or review condition

Aceptar solo si el equipo confirma los cinco puntos de
`docs/REDESIGN_DECISION.md` y no mezcla SimulaGRD ni gestion logistica en el
MVP. Antes de afirmar valor real, entrevistar a un operador territorial y
registrar la evidencia como `user-observed` o `domain-approved`.

Rechazar o reformular si el organizador considera que Track 01 exige una salida
publica incompatible con datos protegidos. En ese caso, revisar SimulaGRD como
producto separado.

## Supersedes / Superseded by

- Supersedes: ADR 0001 solo cuando este ADR cambie a `accepted`.
- Superseded by: ADR 0003 (propuesto).
