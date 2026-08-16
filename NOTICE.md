# Avisos de licencia — Contados

## El código

Contados se distribuye bajo la **GNU Affero General Public License v3.0**
([`LICENSE`](LICENSE)).

Se eligió AGPL y no una licencia permisiva por una razón concreta: Contados está
pensado para ofrecerse a entidades públicas y a organismos de cooperación. Bajo
MIT o Apache, un tercero podría tomar este código, cerrarlo y venderlo a la misma
alcaldía sin devolver nada a la comunidad. La AGPL cierra esa vía: quien ejecute
una versión modificada como servicio en red debe poner su código fuente a
disposición de las personas que lo usan.

La AGPL es una licencia aprobada por la OSI, de modo que el proyecto sigue siendo
software libre y elegible como bien público digital.

## Licenciamiento comercial

El copyright pertenece a los contribuidores del proyecto. Una entidad que
necesite integrar Contados bajo términos distintos a la AGPL puede solicitar una
licencia comercial separada. Esa posibilidad **no** restringe los derechos que la
AGPL ya concede a todo el mundo: es una opción adicional, no una condición.

## Material de terceros — no cubierto por la AGPL

- `archivo/evidencia-fuentes/*.pdf` — documentos públicos de entidades
  colombianas (UNGRD, DNP, ministerios y circulares oficiales). Los derechos son
  de sus emisores. Se conservan con su SHA-256 en
  [`EVIDENCE_REGISTER.md`](EVIDENCE_REGISTER.md) para que la procedencia de las
  afirmaciones del proyecto sea verificable, no como obra propia.
- `deck-CTW-2026.pdf` — material del evento Colombia Tech Week 2026, © 2026
  Colombia Tech Week × Next. Se incluye como referencia de las reglas y la
  rúbrica bajo las cuales se construyó el proyecto.
- Las dependencias declaradas en `app/package.json`, cada una bajo su propia
  licencia.

## Alcance del producto

Contados no registra a nadie ante ninguna entidad, no radica documentos y no
promete ayuda. Los límites completos están en
[`docs/SEGURIDAD.md`](docs/SEGURIDAD.md) y en la sección «Lo que Contados NO
hace» del [`README.md`](README.md). Los datos de personas en la demostración son
100% sintéticos.
