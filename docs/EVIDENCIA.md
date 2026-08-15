# Evidencia — el problema que resuelve Contados

Estado: `CURRENT` · Fuentes consultadas el 2026-08-15 (America/Bogota)

Método: tres rondas de deep research (8 agentes, ~130 búsquedas) más una segunda
opinión independiente de Codex, con instrucción explícita de **refutar** cada
idea en vez de venderla. Cinco productos murieron en el proceso; las razones
están en [`archivo/README.md`](../archivo/README.md).

## El evento

Terremoto de magnitud 7,4 el **10 de agosto de 2026**, epicentro en San José del
Palmar (Chocó), afectando el occidente del país. Al 15 de agosto:

- **288 fallecidos**, ~4.000 heridos, más de 300 desaparecidos
- **135.179 personas afectadas**, 56.448 familias
- **10.677 viviendas destruidas** y 65.841 averiadas
- **15 departamentos y 437 municipios** afectados
- **Más de 100.000 damnificados siguen esperando asistencia**

Fuentes: [Wikipedia — Terremoto de Colombia de 2026](https://es.wikipedia.org/wiki/Terremoto_de_Colombia_de_2026),
[Infobae — balance UNGRD](https://www.infobae.com/colombia/2026/08/14/temblor-de-74-en-colombia-el-10-de-agosto-se-actualizo-el-numero-de-fallecidos-en-todo-el-pais/)

## El hueco: nadie sabe en qué va su caso

**No existe consulta de estado por cédula.** Verificado en la UNGRD y en las
cinco alcaldías principales (Manizales, Pereira, Armenia, Cali, Quibdó). Todo el
proceso es presencial, sin número de radicado. El resultado llega *«por SMS o
listados en la alcaldía»*.
→ [Infobae — guía para damnificados](https://www.infobae.com/colombia/2026/08/13/guia-para-damnificados-donde-y-como-solicitar-las-ayudas-del-gobierno-tras-el-terremoto/)

**Reportar no es estar censado.** El País, en su guía para familias afectadas en
Cali, lo dice textual: *«El ciudadano no se inscribe por su cuenta directamente
en el RUD»*, y distingue cuatro etapas: Reporte → Censo → Evaluación técnica →
Registro RUD.
→ [El País — guía para familias en Cali](https://www.elpais.com.co/cali/guia-para-familias-afectadas-en-cali-que-hacer-para-reportar-danos-y-acreditar-la-condicion-de-damnificado-1312.html)

**Ni las alcaldías lo tienen claro.** La Patria, sobre Manizales: *«Hasta el
momento no se ha establecido la ruta para la inscripción de estos damnificados
para acceder a subsidios específicos.»* El boletín oficial de Cali no describe
ninguna ruta de censo o RUD.

**No hay ningún chatbot, WhatsApp ni línea oficial** para orientar sobre
censo/RUD/subsidio. Las líneas que existen son de emergencia (123, 119, 132) o
de aseguradoras privadas.

**La Defensoría lo declaró.** Iris Marín, en Quibdó, 12 de agosto: *«Es urgente
tomar los censos porque no hay realmente una estimación de cuántas son las
personas afectadas, cuántas personas no tienen en este momento dónde dormir.»*
Pidió además verificar 32 asentamientos indígenas sin información.
→ [El Heraldo](https://www.elheraldo.co/colombia/2026/08/13/defensoria-advierte-que-la-falta-de-censo-dificulta-la-atencion-de-damnificados-por-terremoto-en-quibdo/)

**El sitrep humanitario lo confirma.** ReliefWeb, *Colombia Earthquake: Rapid
Situation Overview*, 13 de agosto: *«Thirteen Chocó municipios have reported no
data at all, a reporting gap rather than evidence of lower impact»* · *«No
national displacement figure exists»* · *«no flash appeal, CERF allocation,
joint needs assessment or mapping of who is working where had been issued»*.
→ [ReliefWeb](https://reliefweb.int/report/colombia/colombia-earthquake-rapid-situation-overview-13-august-2026)

**La cita que abre el video, de un damnificado real.** Felipe Varela, a EFE:
*«Todavía no nos han dicho nada, solo nos tienen contados y estamos esperando
que nos den la ayuda.»*

## El caso ancla: Manizales

- Subsidio de arriendo de **$300.000 mensuales** para **~1.150 familias**
- Primera entrega: **sábado 15 de agosto**, a través de la Cruz Roja
- *«Las personas identificadas como beneficiarias recibieron un mensaje en el
  teléfono celular registrado»*
- Contratos verificados por consulta directa a la API de SECOP II:
  **$1.000.000.000 + $360.000.000** firmados el 13 de agosto con **Cruz Roja
  Colombiana Seccional Caldas**
- 2.000 damnificados contabilizados frente a 1.150 familias objetivo

**La aritmética cuadra:** 1.150 × $300.000 × ~4 meses ≈ $1.380M. Que cuadre
importa: significa que el hueco no es de plata, es de información.

**Y ahí está el punto ciego, en una línea:** el aviso llega por SMS al celular
registrado. Si perdió el celular, cambió de número, nunca lo censaron, o lo
censaron pero el ingeniero no ha ido — no le llega nada y nadie le dice por qué.

→ [Eje21](https://www.eje21.com.co/2026/08/manizales-activa-subsidios-de-arriendo-para-damnificados/) ·
[La Patria](https://www.lapatria.com/manizales/alcalde-de-manizales-anuncia-la-entrega-subsidios-de-arrendamiento-por-terremoto-este-es)

## El cuello de botella: la evaluación técnica

La Alcaldía pidió **500 ingenieros para revisar más de 2.000 edificaciones**.
Han salido ~37 voluntarios (24 de la Escuela Colombiana de Ingeniería, 13 desde
Medellín). La prensa lo dice sin rodeos: *«la cantidad de edificaciones
pendientes de valoración supera ampliamente el número de técnicos disponibles»*.

Y el subsidio de arriendo **exige verificación técnica** de inhabitabilidad. Sin
esa visita no hay RUD, y sin RUD no hay subsidio.

## La base jurídica

**No existe plazo normado** en la Ley 1523 de 2012 para completar el censo,
hacer la evaluación técnica ni entregar la ayuda humanitaria. Solo fija
principios («oportunidad, eficacia»), sin días.

**El único reloj que existe** es el del derecho de petición: **15 días hábiles**
(Ley 1755 de 2015, art. 14; 10 días para información).

> El Estado no tiene plazo para censarte. Tú sí puedes ponerle uno.

Esta es la tesis del producto y es contraintuitiva: la primera versión del plan
decía «se venció el término del censo», lo cual **habría sido falso**.

## Quién queda por fuera (y por qué lo detectamos)

| Modo de falla | Evidencia |
|---|---|
| Arrendatarios | México 2017: el censo inicial de CDMX registró ~7.000 inmuebles; el rediagnóstico de 2019 encontró **+22.000 viviendas con daño severo** excluidas. A los seis años, el **32%** seguía sin recuperar vivienda. |
| Poseedores sin título | Houston post-Harvey y Puerto Rico post-María: familias sin título claro declaradas inelegibles. Brasil: *«privileging legally recognized property owners while marginalizing those without formal tenure»*. |
| Sin documentos | Precondición dura de registro en todos los casos revisados (Chile, Japón, México). |
| «Out of sight, out of reach, out of the loop, out of money, out of scope» | World Disasters Report, vía ODI — las cinco razones por las que la gente vulnerable cae por las grietas. |

→ [Grupo Animal — 6 años del 19S](https://grupoanimal.mx/estados/sismo-19s-reconstruccion-cdmx-damnificados-vivienda) ·
[ODI — Falling through the cracks](https://odi.org/en/about/our-work/falling-through-the-cracks-inclusion-and-exclusion-in-humanitarian-action/)

## Precedentes que validan el diseño

| País | Sistema | Lección aplicada |
|---|---|---|
| **Chile** | FIBE + `mifibe.gob.cl` | El patrón de consulta de estado ya está validado. Y su advertencia se copia textual: *«La sola aplicación de la FIBE no garantiza el acceso a beneficios.»* |
| **Japón** | 罹災証明書 + 被災者台帳 | El certificado auto-identifica quién es elegible para qué. Tuvieron que legislar la emisión «sin demora» contra su propia lentitud. La inspección física es el paso lento — igual que aquí. |
| **Turquía 2023** | Hasar Tespit | Sin canal de objeción visible, la evaluación de daños derivó en desconfianza masiva y disputa política. Por eso el canal de objeción va desde el diseño. |
| **México 2017** | Censo del Bienestar / Bansefi | La advertencia más fuerte: censo rehecho dos años después, tarjetas duplicadas y clonadas. Cualquier producto que toque el flujo de dinero necesita trazabilidad auditable **por diseño**. |
| **Sector humanitario** | Primero / CPIMS+ (UNICEF) | El modelo de datos no se inventa: `identification → registration → assessment → referral → service_tracking → closure`. |
| **Reino Unido** | GOV.UK Notify | *«Status-tracking tools are often just a channel-shift for anxiety.»* Por eso Contados notifica en vez de obligar a consultar. |

## Lo que ya existe y por qué no nos reemplaza

| Herramienta | Qué hace | Qué **no** hace |
|---|---|---|
| [Gravitas](https://www.elcolombiano.com/tecnologia/plataforma-ia-organiza-ayudas-voluntarios-recursos-terremoto-colombia-KC39918222) | Agrega reportes ciudadanos, satélite y WhatsApp con IA. Construida en 42 h para este sismo. | No hace seguimiento individual; no toca censo/RUD/subsidio. |
| mapadelterremoto.com | Mapa de daños agregados por municipio. | Cero consulta individual. |
| cuidarcolombia.vercel.app | Directorio verificado de donaciones y albergues. | Explícitamente «no es un censo ni sistema de subsidios». |
| colombiatramita.co | Guías informativas tipo blog. | Estático, sin matching por perfil. |
| [SismoAyuda Colombia](https://sismoayudaco.com/) | Evaluación estructural remota con ingenieros voluntarios (ATC-20, EMS-98). | Otro problema: evalúa la vivienda, no la fila. |
| Ushahidi | Recolección y mapeo de reportes en crisis. | No clasifica, no deduplica, no enruta ni hace seguimiento del caso. |

**Ninguna hace seguimiento del estado individual de una persona en la ruta.** El
hueco sigue abierto, con alta confianza.

## Verificaciones propias

Además de las fuentes anteriores, se verificó por consulta directa (no a través
de un agente):

- **API de SECOP II** (`datos.gov.co/resource/jbjy-vk9h`): datos frescos hasta
  el 14 de agosto; 12 contratos por urgencia manifiesta firmados tras el sismo,
  incluidos los dos de Manizales con Cruz Roja Caldas.
- **Hipótesis descartada:** no hubo pico de contratación de emergencia tras el
  sismo (37, 35, 26, 61 y 12 contratos en ventanas comparables). Registrado para
  que nadie lo repita como hallazgo.

## Qué no está verificado

- Que la ruta de Manizales siga vigente el domingo. Cambia a diario; por eso el
  producto muestra la fecha de verificación en pantalla.
- Cuántos hogares hay realmente detenidos en cada compuerta. Es justamente la
  cifra que el producto propone producir, y por eso el agregado se rotula
  siempre como autorreportado.
- Las cifras del desastre cambian a diario. **No hardcodear**: citar con fuente y
  fecha.
