# ADR 0005 — Contados: acompañar a la familia por la ruta de atención

- Fecha: 2026-08-15
- Estado: **ACEPTADO**
- Supersede: ADR 0001 (Ruta Clara), 0002 (Nexo GRD), 0003 (CompilaGRD),
  0004 (Funciona) — todos en [`archivo/adr/`](../../archivo/adr/)
- Track: **02 — Justicia**

## Contexto

Cinco productos anteriores murieron con evidencia (ver
[`archivo/README.md`](../../archivo/README.md)). El patrón detrás de todos los
descartes es el mismo: en esta emergencia **la prensa y las instituciones
organizan información rápido**, así que cualquier producto cuyo valor sea
«organizar información que nadie ha organizado» llega tarde o duplica algo que
ya existe.

Lo que sí quedó sin cubrir, verificado con alta confianza: **nadie acompaña a
una persona a través del proceso, y nadie mide dónde se está trabando la gente.**

## Decisión

Construir **Contados**: una aplicación que ubica a una familia damnificada en
las cinco compuertas de la ruta oficial (Reporte → Censo → Evaluación técnica →
RUD → Subsidio), le dice qué sigue y dónde hacerlo en su municipio, detecta si
está en riesgo de quedar excluida, y le genera el derecho de petición —el único
instrumento con reloj legal—. En agregado y anonimizado, produce la cifra de
cuánta gente está detenida en cada paso.

## Por qué esta y no las otras

| Alternativa | Por qué no |
|---|---|
| Ruta Clara | Categoría saturada; DoNotPay es la referencia oficial del track. |
| Nexo GRD / CompilaGRD | Beneficio institucional indirecto; no se ve en 60 segundos. |
| Funciona | Bloqueado por un spike de 2 h sin autorizar, sin código, con la hackatón corriendo. |
| Seguro Oculto | El hallazgo fue noticia masiva del 11 al 14 de agosto; sirve a la clase media urbana, no a los más golpeados. |
| Censo ciudadano | El RUD solo lo digita el CMGRD; Gravitas ya lo construyó en 42 h. |
| Daños por foto | SismoAyuda Colombia ya opera con ingenieros voluntarios reales. |
| Detector SECOP | cerocorrupcion.pro y anticorrupcion.co ya existen y corren. |

## Consecuencias

**Positivas**

- El problema está declarado por la Defensoría y verificado ciudad por ciudad.
- Sirve a los más vulnerables: la detección de exclusión apunta justo a
  arrendatarios y tenencia informal, no a quien ya tiene todo en regla.
- La IA hace trabajo genuinamente difícil (relato coloquial → estado
  estructurado, riesgo de exclusión), no un chatbot.
- El modelo de datos viene de un estándar probado (Primero/CPIMS+), y el patrón
  de producto está validado en Chile y Japón.
- Escala a cualquier emergencia futura, no solo a esta.

**Negativas y aceptadas**

- **No otorga elegibilidad.** El RUD solo lo digita el CMGRD. El producto
  acompaña y presiona; no registra. Esto es un límite real, no un defecto que se
  vaya a corregir.
- **Depende de que la persona cuente bien su caso.** Por eso la abstención es
  obligatoria: preferimos no responder a responder mal.
- **La ruta municipal cambia a diario.** Se mitiga mostrando la fecha de
  verificación en pantalla, no ocultando el problema.
- **El agregado es autorreportado.** Nunca se presenta como censo ni cifra
  oficial.
- Solo hay una ruta municipal verificada (Manizales). Es una limitación de
  alcance consciente, no un descuido.

## Condiciones de aceptación

1. ✅ Corte vertical funcionando: relato → compuerta → acción → instrumento.
2. ✅ Schema estricto con abstención obligatoria implementada en código.
3. ✅ Citas normativas solo desde corpus con hash; plazo calculado en código.
4. ✅ Aviso permanente de que no registra ante ninguna entidad.
5. ⬜ **Probado contra `claude-opus-5`**: los tres casos y la prueba de
   abstención. **Pendiente** — es el único bloqueador vivo.
6. ⬜ Prueba de falsa expectativa con una persona ajena.

## Reversión

Si el clasificador falla la prueba de abstención y no se corrige a tiempo, el
producto conserva valor sin el modelo: el tablero, la ruta municipal y el
generador de peticiones son deterministas y funcionan solos. En ese escenario se
entrega el flujo con selección manual de compuerta y se dice explícitamente que
la clasificación automática quedó fuera de alcance. **No se cambia de producto a
esta altura.**
