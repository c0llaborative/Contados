# Rediseño de oportunidad - CTW 2026

Estado: `SUPERSEDED - NO IMPLEMENTAR; VER DEEP_RESEARCH_FINDINGS.md`

## Resultado ejecutivo

La recomendacion es **Nexo GRD, Track 01**: un motor de conciliacion con
procedencia para el handoff entre respuesta y recuperacion. Recibe exportaciones
ya existentes de EDAN, RUD y reportes sectoriales; construye un grafo de
afectaciones, detecta duplicados, contradicciones y vacios, y entrega una base
revisada por una persona para iniciar EDANPRI/PAE sin volver a preguntar todo.

No es captura de informacion ni generacion de texto. La transformacion visible
es:

`registros incompatibles -> afectaciones conciliadas + conflictos + vacios +
trazabilidad de cada afirmacion`.

La recomendacion es de producto, no evidencia de adopcion institucional. Antes
de uso real debe validarse el dolor, los esquemas y la autoridad del operador
con un CMGRD/CDGRD o responsable de informacion de sala de crisis.

## Por que existe esta oportunidad

### Marco vinculante

La Ley 1523 de 2012 establece tres procesos permanentes: conocimiento del
riesgo, reduccion del riesgo y manejo de desastres. Dentro del ultimo estan la
preparacion, la ejecucion de la respuesta y la recuperacion. Tambien asigna al
alcalde responsabilidad directa municipal, exige PMGRD y EMRE territoriales,
ordena interoperabilidad de sistemas de informacion y contempla planes de
accion especificos para recuperacion.

La Circular 031 de 2026 exige que PMGRD y EMRE sean instrumentos dinamicos, con
mecanismos claros de implementacion, seguimiento, evaluacion y ajuste. Esto
confirma una necesidad de continuidad verificable, pero no prueba que una
entidad compraria o adoptaria Nexo GRD.

### Modelo operativo en construccion

El documento tecnico ENRE 2025 describe el flujo EDAN/RUD como fundamento de
la respuesta y EDANPRI/PAE como instrumentos de recuperacion. Su pagina 72
advierte que una captura o sistematizacion deficiente obliga a iniciar EDANPRI
desde cero, produce demoras, consultas repetidas, fatiga comunitaria y perdida
de credibilidad. El mismo documento pide informacion oportuna, verificable,
georreferenciada e interoperable y ya reconoce plataformas oficiales como EDAN
Digital y RUD/RUFE.

**Limite juridico:** ENRE 2025 es un documento tecnico en construccion asociado
a un proyecto de decreto; se usa como evidencia del proceso diseñado y del
problema reconocido, no como norma vigente.

### Evidencia de practica

UNGRD ha documentado verificaciones conjuntas de RUD y EDAN para validar la
veracidad e incluir personas e infraestructura ausentes de ambas bases. Esto
prueba que conciliacion y omisiones ocurren; no cuantifica su frecuencia ni el
tiempo que una herramienta ahorraria.

## Mapa del proceso y punto elegido

| Momento | Actor principal | Instrumento/dato | Decision o salida | Oportunidad |
|---|---|---|---|---|
| Preparacion | CMGRD/CDGRD | PMGRD, EMRE, MEGIR | Roles, capacidades y protocolos | Ya existen reporte de capacidades y simulaciones; evitar duplicarlos. |
| Respuesta inicial | Equipos de campo y consejos territoriales | EDAN, RUD, reportes sectoriales | Necesidades, daños, poblacion afectada | Ya existen formularios y plataformas de captura; no crear otra. |
| Coordinacion | Sala de crisis / funcion de planeacion | Multiples cortes, hojas y reportes | Panorama comun y prioridades para revision | Nexo puede reconciliar entidades, afirmaciones y procedencia. |
| **Transicion a recuperacion** | **CMGRD/CDGRD y sectores** | **EDAN + RUD + sectoriales** | **Base para EDANPRI/PAE** | **Punto elegido: preservar continuidad, evidenciar contradicciones y vacios.** |
| Recuperacion | Entidades responsables | EDANPRI, PAE y seguimiento | Intervenciones, recursos y evaluacion | La asignacion y aprobacion siguen siendo humanas e institucionales. |

## Matriz con rubrica oficial

Se asignan puntos directos con los pesos oficiales. Diferenciacion, datos y
seguridad explican esos cinco criterios, pero no agregan puntos ni cambian los
pesos.

| Concepto / track | Impacto /25 | IA /25 | Demo /20 | Viabilidad /15 | Tecnica + UX /15 | Total | G1 track | G2 60 s | G3 24 h | G4 seguridad | Elegible |
|---|---:|---:|---:|---:|---:|---:|:---:|:---:|:---:|:---:|:---:|
| **Nexo GRD / T01** | 24 | 24 | 19 | 12 | 14 | **93** | P | P | P | P | Si |
| SimulaGRD / T04 | 23 | 23 | 19 | 13 | 13 | **91** | P | P | P | P | Si |
| Brecha Cero / T01 | 24 | 20 | 19 | 12 | 14 | **89** | P | P | P | P | Si |
| Ruta Clara / T02 | 20 | 17 | 18 | 13 | 13 | **81** | P | P | P | P | Si |
| Escala Capacidades / T04 candidato | 21 | 21 | 17 | 11 | 11 | **81** | F | P | P | F | No |

Los puntajes son estimaciones trazables, no predicen la evaluacion del jurado.
Ruta Clara se reevalua con la evidencia competitiva nueva; su puntaje no es
comparable con la matriz historica que asumio mayor diferenciacion.

### 1. Nexo GRD - recomendado

- **Impacto 24:** evita que la recuperacion pierda contexto de la respuesta y
  hace visibles omisiones o contradicciones antes de convertirlas en acciones.
  Pierde un punto porque el ahorro e impacto real aun no estan medidos.
- **IA 24:** mapeo semantico de esquemas, resolucion de entidades, comparacion
  de afirmaciones y explicacion trazable son el nucleo; reglas simples no
  resuelven nombres, ubicaciones y categorias inconsistentes. Una persona
  confirma coincidencias ambiguas.
- **Demo 19:** tres archivos incompatibles se convierten en un grafo auditable;
  el antes/despues es visual y autocontenido. Queda por verificar latencia.
- **Viabilidad 12:** un corte con archivos sinteticos cabe en 24 horas y puede
  adaptarse por esquema; adopcion real exige acceso, acuerdos, proteccion de
  datos e integracion institucional.
- **Tecnica/UX 14:** una cola de conflictos y un panel de procedencia son
  comprensibles. Robustecer geocodificacion, control de acceso y auditoria queda
  fuera del MVP.
- **Track 01:** encaja si el relato central es transparencia y verificabilidad
  de necesidades frente a actuaciones publicas. Debe validarse con la
  organizacion que este encaje no se interprete como una herramienta interna
  desconectada del reto.

### 2. SimulaGRD - retador

Convierte una EMRE en un grafo de roles, recursos y dependencias; luego ejecuta
un escenario acotado para revelar acciones sin responsable, recursos no
disponibles y rutas de comunicacion rotas. Es una demo potente y encaja en
resiliencia, pero MEGIR y ejercicios de simulacion ya cubren parte del espacio.
En 24 horas, agentes simulados pueden parecer teatro de LLM si no se anclan en
capacidades verificadas. Recomendado como alternativa si Track 01 rechaza el
encaje institucional de Nexo.

### 3. Brecha Cero

Concilia necesidades evaluadas con despachos y entregas para hallar duplicados,
vacios y entregas sin confirmacion. Su historia de transparencia es inmediata,
pero Sahana e IFRC GO ya relacionan necesidades, respuesta y cobertura. Solo
seria diferencial como adaptador a instrumentos colombianos; ese alcance se
solapa con Nexo y depende mas de datos logisticos.

### 4. Ruta Clara

Sigue siendo construible y encaja en Track 02, pero generacion legal y
orientacion por IA son categorias existentes. Su transformacion principal se
percibe como documental, no como cambio operacional colectivo. Se mantiene
supersedida.

### 5. Escala Capacidades

Compararia necesidades del evento con capacidad local y sugeriria elevar la
revision al nivel departamental o nacional. Falla encaje inequivoco y seguridad:
la escalada es una decision institucional sensible que no debe automatizarse.
Puede existir despues como indicador revisable, no como producto del hackathon.

## Comparacion funcional

| Espacio | Ya existe | Consecuencia de diseño |
|---|---|---|
| Captura movil/offline | Survey123, KoBo y productos de evaluacion de daños | No construir otro formulario ni vender offline como innovacion. |
| Capacidad territorial | MEGIR | No duplicar un cuestionario o tablero de capacidades. |
| Necesidades y coordinacion | IFRC GO y Sahana | No construir un tablero logistico generico. |
| Plataformas oficiales | EDAN Digital y RUD/RUFE, segun borrador ENRE | Nexo importa/exporta; nunca pretende reemplazarlas. |
| Diferenciador | No se verifico un producto que concilie el handoff colombiano EDAN/RUD/sectoriales hacia EDANPRI/PAE | Mantener el corte en resolucion de entidades, contradicciones y procedencia. Esta ausencia es una hipotesis competitiva, no prueba de mercado. |

## Demo decisiva de 55 segundos

1. **0-8 s:** “Tres equipos reportaron el mismo desastre: 147 filas, nombres y
   ubicaciones distintas, ningun identificador comun”.
2. **8-20 s:** se cargan tres fixtures sinteticos inspirados en EDAN, RUD y un
   reporte sectorial. Nexo construye el grafo y muestra coincidencias con nivel
   de confianza.
3. **20-35 s:** aparecen dos hallazgos accionables: una comunidad registrada en
   daños pero ausente del universo de hogares, y dos registros que podrian ser
   el mismo hogar con cantidades contradictorias.
4. **35-46 s:** el analista abre las fuentes lado a lado, confirma una
   coincidencia y deja la otra en revision; toda decision queda auditada.
5. **46-55 s:** se exporta una base de continuidad para recuperacion con
   registros verificados, conflictos pendientes y procedencia. “La IA no asigna
   ayudas: evita que una decision empiece con datos invisibles o duplicados”.

## Prueba de valor antes de implementar

La hipotesis merece codigo solo si el equipo acepta las cinco respuestas:

1. El usuario primario es un responsable de informacion/planeacion de
   CMGRD/CDGRD o sala de crisis, no “cualquier entidad”.
2. El objeto unico es conciliar afectaciones en el handoff a recuperacion; no
   capturar, asignar ayudas, administrar emergencias ni redactar informes.
3. La salida principal es un grafo y cola de decisiones, no texto generado.
4. La demo usa datos sinteticos con esquemas realistas y nunca datos personales
   reales.
5. El equipo acepta validar el encaje con Track 01 y, despues de la hackathon,
   entrevistar al menos un operador antes de afirmar ahorro o adopcion.

## Riesgos y stop conditions

| Riesgo | Control MVP | Stop condition |
|---|---|---|
| Falso match mezcla dos hogares o comunidades | Umbrales, factores visibles y confirmacion humana | Ningun match ambiguo entra al export sin confirmar. |
| Omision interpretada como inelegibilidad | Etiqueta “sin correspondencia”, nunca “no elegible” | Si no hay fuente suficiente, queda en revision. |
| Exposicion de datos personales | Fixtures sinteticos, sin cuentas ni telemetria | Cualquier dato real bloquea demo/publicacion. |
| IA opaca | Cada resultado lista fuentes, campos y factores | Sin procedencia, el hallazgo no se muestra como verificado. |
| Producto reemplaza autoridad | Solo recomendaciones de conciliacion | No asignar, negar, escalar ni publicar decisiones automaticamente. |
| Encaje de track ambiguo | Validacion con organizador; narrativa de trazabilidad publica | Si no se confirma Track 01, evaluar SimulaGRD; no mezclar ambos productos. |

## Decision solicitada al equipo

Este documento recomienda aprobar **Nexo GRD** para preparar implementacion,
pero no la autoriza todavia. La aprobacion convierte ADR 0002 en `accepted` y
habilita un backlog nuevo. Si el equipo no acepta el encaje con Track 01, la
decision correcta es revisar SimulaGRD, no añadir sus funciones a Nexo.
