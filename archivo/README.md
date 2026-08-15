# Archivo — productos descartados

Estado: `HISTÓRICO · NO IMPLEMENTAR`

Todo lo que está en esta carpeta corresponde a productos que se propusieron y se
descartaron antes de llegar a Contados. **Nada de aquí describe lo que estamos
construyendo.** Se conserva por trazabilidad: si un jurado pregunta «¿por qué no
hicieron X?», la respuesta está documentada.

Si busca el producto actual, empiece en el [README](../README.md) o en el
[plan vivo](../docs/PLAN.md).

## Los cinco productos que murieron, en orden

| # | Producto | Track | Por qué murió |
|---|---|---|---|
| 1 | **Ruta Clara** | 02 | Generador de derechos de petición con expediente trazable. Categoría saturada: la propia organización puso DoNotPay como referencia del track, y ya existen `tutelasypeticiones.com`, Doctor Peralta y LegalApp. |
| 2 | **Nexo GRD** | 01 | Conciliación de EDAN, RUD y reportes sectoriales. Superado sin aceptación tras la deep research. |
| 3 | **CompilaGRD** | 01 | Consolidación del PAE. Beneficio público indirecto e institucional; el impacto no se ve en 60 segundos. |
| 4 | **Funciona** | 01 | Evidencia funcional fechada de obras de reconstrucción. Ganador provisional durante unas horas; quedó bloqueado por un spike de 2 h que nunca se autorizó, y el equipo eligió Contados, que ya tenía código corriendo. |
| 5 | **Seguro Oculto** | 02 | Detectar la póliza obligatoria de incendio y terremoto en créditos hipotecarios. El hallazgo fue **noticia masiva entre el 11 y el 14 de agosto** (Semana, Infobae, La República, El Tiempo, Portafolio); el extracto de Bancolombia ya desglosa la prima; existe el RUS de Fasecolda; y el excedente sobre la deuda puede ser cero. Sirve a la clase media urbana, no a los más golpeados. |

Además se descartaron con evidencia, sin llegar a documento propio:

- **Censo ciudadano por voz.** El RUD solo lo digita el CMGRD, así que un
  autorreporte no otorga elegibilidad. KoBoToolbox y ODK ya resuelven la captura
  offline y la UNGRD ya los usa. Y **Gravitas** ya lo construyó en 42 horas para
  este mismo sismo, incluida la deduplicación por IA.
- **Evaluación de daños por foto.** [SismoAyuda Colombia](https://sismoayudaco.com/)
  ya opera con ingenieros civiles voluntarios reales usando ATC-20 y EMS-98. Una
  IA que clasifica daño estructural sería visiblemente menos confiable, y estaría
  emitiendo un dictamen implícito de habitabilidad.
- **Módulo pre-evento de sismorresistencia.** No existe dataset público de
  cumplimiento NSR-10 por dirección en Colombia.
- **Detector de corrupción en SECOP.** Ya existen
  [cerocorrupcion.pro](https://www.cerocorrupcion.pro/) y
  [anticorrupcion.co](https://www.anticorrupcion.co/); Open Contracting ya publicó
  73 banderas rojas estandarizadas.
- **Manifiesta** (contratos por urgencia manifiesta). Solo hay 12 contratos
  firmados tras el sismo: una persona los clasifica a mano en 20 minutos. La IA
  no era necesaria.

## Una hipótesis que se probó y resultó FALSA

Se verificó si hubo un pico de contratación de emergencia tras el sismo,
consultando la API de SECOP II. **No lo hubo**: 37, 35, 26, 61 y 12 contratos por
urgencia manifiesta en ventanas comparables. El post-sismo está dentro de la
línea base. Queda registrado para que nadie lo repita como si fuera un hallazgo.

## Qué hay en cada carpeta

| Carpeta | Contenido |
|---|---|
| `docs/` | Los 19 documentos de los productos descartados: blueprints, matrices de decisión, planes de construcción, guiones de video y revisiones adversariales. |
| `adr/` | ADR 0001 a 0004. El ADR vigente es el [0005](../docs/adr/0005-contados.md). |
| `evidencia-fuentes/` | Nueve PDFs oficiales descargados para los productos descartados (PAE San Andrés, PNGRD, Circulares UNGRD, ENRE 2025, evaluación DNP). Sus hashes siguen en el [registro de evidencia](../EVIDENCE_REGISTER.md). |
| `canal-interno/` | Cuatro capturas del canal de Discord del evento. |

## ⚠️ `canal-interno/` no puede publicarse

Las cuatro capturas muestran el **nombre y la fotografía de una persona real**.
Clasificación: `Interno`. No entran al repositorio público, ni al video, ni a
ningún material de entrega. El `deck-CTW-2026.pdf` basta para sustentar tracks,
reglas y rúbrica, y ese sí es publicable.

Están excluidas en el `.gitignore` de la raíz. Si va a publicar el repositorio,
verifique antes que sigan excluidas.

## Lo único que sobrevivió de todo esto

Los **límites de seguridad** del blueprint de Ruta Clara: abstención
obligatoria, corpus allowlist con hash, citas solo desde el corpus y nunca
generadas, prohibición de afirmar habitabilidad, y cero radicación automática.
Están vigentes y se recogen en [`docs/SEGURIDAD.md`](../docs/SEGURIDAD.md).
