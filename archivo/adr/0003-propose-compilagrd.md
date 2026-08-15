# ADR 0003: Proponer CompilaGRD para Track 01

- Status: proposed
- Date: 2026-08-15
- Decision owner: equipo de hackathon; investigacion preparada por Codex

## Context

La investigacion adversarial encontro que integracion de datos, captura,
alertas y seguimiento generico ya tienen oferta estatal/humanitaria. En cambio,
Providencia llego a diciembre de 2025 sin PAE final consolidado y con campos de
inversion/horizonte faltantes; Mocoa muestra dependencias y bloqueos de
planeacion. Hay PAE y reportes publicos con estructuras incompatibles.

## Decision

Proponer CompilaGRD: un compilador semantico preventivo para la consolidacion y
ajuste del PAE. Extrae y alinea compromisos, aplica reglas auditables y produce
un grafo/diff con procedencia. Permanece propuesto hasta que el equipo confirme
Track 01 y el experimento de 10 compromisos alcance el umbral.

## Consequences and trade-offs

- Diferenciacion visible y una salida no conversacional.
- Datos publicos suficientes para una demo acotada.
- IA central en extraccion/alineacion; reglas controlan el veredicto documental.
- No resuelve falta de presupuesto, voluntad, autoridad o ejecucion.
- Puede duplicar una capacidad interna no visible de UNGRD.
- Una falsa contradiccion puede erosionar confianza; por eso exige abstencion,
  cita y revision humana.

## Alternatives considered

- Replay GRD: evidencia directa insuficiente del trabajo del usuario.
- Auditor PAE: dolor probado, pero actua tarde y tiene mayor friccion.
- Interdependencias: valioso, sin datos/ground truth viable en 24 horas.
- Nexo GRD: superado por SNIGRD 2026 y falta de cuantificacion del handoff.

## Verification or review condition

Aceptar solo si: (1) Track 01 esta disponible; (2) ground truth de 10
compromisos; (3) precision y recall >= 0,85; (4) cero citas inventadas; (5) demo
entendible sin narracion adicional. Rechazar si un producto estatal ya hace
validacion semantica pre-aprobacion generalizable.

## Supersedes / Superseded by

- Supersedes: propuesta ADR 0002, que nunca fue aceptada.
- Superseded by: ninguno.
