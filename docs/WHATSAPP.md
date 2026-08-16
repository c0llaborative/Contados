# El canal de WhatsApp — Contados

Estado: `CURRENT LOCAL · META REAL PENDIENTE DE PRUEBA EXTERNA`

El núcleo, simulador, webhook, firma HMAC, adaptadores de texto/audio,
agrupación de mensajes y notificación por barrio están construidos y pasan
build. **No se ha conectado ni enviado nada a Meta.** La agrupación vive en
memoria y sólo se garantiza para una instancia durante la demo.

Este documento describe el canal principal del damnificado: cómo está diseñado,
cómo se enciende contra Meta, y qué limitaciones reales tiene. El *porqué* está
en el [ADR 0006](adr/0006-whatsapp-primero.md).

> **Convención de estados en este repositorio:** `CURRENT` = construido y
> verificado. `PLANEADO` = decidido y especificado, todavía sin código. Nada
> marcado `PLANEADO` puede afirmarse como hecho ante el jurado.

## La idea en una frase

Un solo núcleo, tres superficies. El webhook de Meta y el simulador de la web
invocan **el mismo handler de conversación**; lo único que cambia es el
transporte.

```
        Meta Cloud API  ──┐
                          ├──▶  lib/canales/whatsapp/entrante.ts
   Página /whatsapp    ──┘              (normaliza a un mensaje)
                                                 │
                                                 ▼
                         lib/canales/whatsapp/agrupar.ts
                         (ventana de silencio de 12 s)
                                      │
                                      ▼
                         lib/nucleo/conversacion.ts
                           (máquina de estados)
                                                 │
                          ┌──────────────────────┼──────────────────────┐
                          ▼                      ▼                      ▼
                 nucleo/clasificar.ts     nucleo/rutas.ts     nucleo/peticion.ts
                  (Sonnet/OpenAI)       (ruta municipal)      (token cifrado)
```

## Estructura de archivos objetivo

```
app/lib/nucleo/                   ← CURRENT: sin Next.js, reutilizable por cualquier canal
  schema.ts                       (se mueve tal cual desde lib/)
  clasificar.ts                   ← prompt SISTEMA + llamada al modelo + invariante
  conversacion.ts                 ← CURRENT: máquina de estados por sesión hash
  rutas.ts, corpus.ts             (se mueven tal cual)
  peticion.ts                     ← CURRENT: renderizador y token AES-256-GCM
  enlace-peticion.ts              ← CURRENT: mensaje con enlace de 15 minutos

app/lib/canales/whatsapp/
  entrante.ts                     ← CURRENT: webhook de Meta → mensaje normalizado
  saliente.ts                     ← CURRENT: Graph API, apagada por defecto
  transcribir.ts                  ← CURRENT local: audio → texto (Groq), audio sintético aprobado

app/app/api/diagnose/route.ts     ← adaptador delgado. PIERDE el prompt
app/app/api/peticion/route.ts     ← CURRENT: adaptador POST web
app/app/api/peticion/[token]/     ← CURRENT: GET temporal; 404/410/503 seguros
app/app/api/whatsapp/route.ts     ← CURRENT local: GET + POST firmado
app/app/api/notificar/route.ts    ← CURRENT local: avisos por barrio
app/app/whatsapp/page.tsx         ← CURRENT: simulador = versión web
```

## La máquina de estados

Una entrada por número (hash). Este es el diseño de producto, no un detalle de
implementación.

```
NUEVO
  → saludo + qué es Contados + qué NO es
  → "cuénteme qué pasó; puede escribir o mandar una nota de voz"

ESCUCHANDO
  → CURRENT: agrupa hasta 8 mensajes tras 12 s de silencio (configurable 10–15 s)
  → llama a clasificar()

PREGUNTANDO                            ← aquí vive la abstención obligatoria
  → si compuerta === null: manda falta_preguntar[0], espera respuesta,
    la concatena al relato y reclasifica
  → MÁXIMO 3 rondas
  → al agotarlas: "con lo que me contó no puedo ubicarlo con seguridad"
    + ruta genérica del municipio. NUNCA inventa una compuerta.

DIAGNOSTICADO
  1. si posible_estafa → mensaje aparte, PRIMERO
  2. dónde está + qué significa + qué sigue + dónde ir en su municipio
  3. si hay alertas de exclusión → mensaje aparte
  4. CURRENT: ofrecer el derecho de petición mediante enlace privado de 15 min

SEGUIMIENTO
  → "le aviso cuando algo cambie en su barrio"
  → aquí aterriza /api/notificar
```

Dos decisiones que valen la pena defender ante el jurado:

- **El tope de tres rondas** convierte la abstención en conversación sin volverla
  un interrogatorio. Un sistema que pregunta indefinidamente es tan inútil como
  uno que inventa.
- **La estafa va primero.** Si a alguien lo están engañando, eso no espera al
  diagnóstico.

### Trampa conocida en el código actual

`app/app/api/diagnose/route.ts` devuelve `400` si `relato.length < 10`. En
WhatsApp la gente escribe «hola». Eso lo maneja la máquina de estados (estado
`NUEVO`), **no** un error HTTP. El adaptador web conserva la validación; el
núcleo no la lleva dentro.

## Estado de sesión

Un `Map` en memoria del módulo, con TTL. **Sin base de datos.** A esta altura de
la hackatón una base de datos es riesgo sin premio.

Consecuencias, documentadas y no escondidas:

- El estado se pierde al reiniciar el proceso o al redesplegar.
- En serverless (Vercel) el `Map` no se comparte entre instancias. Para el demo
  con un puñado de números es suficiente; para producción no lo es.
- Efecto secundario positivo: **nada persiste**. Es una postura de retención
  defendible, no solo una carencia.

## Encender el canal contra Meta

Pasos reales, en orden. Tiempo estimado: **~1 hora si todo sale bien.** El
[`PLAN.md`](PLAN.md) le asigna un límite duro de 90 minutos.

1. **Crear la app.** `developers.facebook.com` → nueva app tipo *Business* →
   agregar el producto **WhatsApp**.
2. **Tomar las credenciales.** En *WhatsApp > API Setup* aparecen el número de
   prueba, `PHONE_NUMBER_ID`, token y sus límites actuales. Anoten la expiración
   y cantidad de destinatarios que muestre la consola: no se fijan aquí porque
   Meta puede cambiarlas.
3. **Desplegar.** El webhook necesita una URL pública HTTPS. Desplegar el repo en
   Vercel (`vercel --prod`); ya es Next.js y de paso queda desplegado para la
   entrega. `ngrok http 3000` sirve como alternativa.
4. **Configurar el webhook.** URL `https://<app>.vercel.app/api/whatsapp`, un
   *verify token* inventado por el equipo, y suscribirse al campo `messages`.
   Meta hace un `GET` con `hub.mode`, `hub.verify_token` y `hub.challenge`:
   **hay que devolver el challenge en texto plano** o Meta no suscribe.
5. **Enviar.** `POST` a
   `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/{PHONE_NUMBER_ID}/messages`.
   La versión se copia de API Setup; no se fija en la documentación.

### Variables de entorno

```bash
AI_CLASSIFIER_PROVIDER=anthropic # o openai para la prueba comparativa
AI_CLASSIFIER_MODEL=claude-sonnet-5
ANTHROPIC_API_KEY=            # o OPENAI_API_KEY
GROQ_API_KEY=                 # transcripción de notas de voz
STT_MODEL=whisper-large-v3-turbo
WHATSAPP_GRAPH_VERSION=       # copiar la versión visible en API Setup
WHATSAPP_TOKEN=               # token de Meta; nunca versionarlo
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=        # inventado por el equipo, debe coincidir con Meta
META_APP_SECRET=              # verifica x-hub-signature-256
SESION_SAL=                   # aleatoria, 16+ caracteres
WHATSAPP_DEBOUNCE_MS=12000    # se limita automáticamente a 10000–15000
APP_PUBLIC_URL=               # URL HTTPS pública, sin barra final
PETICION_LINK_SECRET=         # 32 bytes aleatorios; no reutilizar otra clave
WHATSAPP_SEND_ENABLED=false   # cambiar a true sólo en prueba supervisada
NOTIFICAR_ADMIN_TOKEN=        # autoriza notificaciones reales
```

Ninguna credencial va al repositorio. Copiar `app/.env.example` a
`app/.env.local`; ese archivo está ignorado por git.

## Checklist del equipo: conectar Meta sin improvisar

Owner de estos pasos: **equipo de hackathon**. Son acciones externas y pueden
crear gasto o habilitar envíos. Codex ya preparó el código; no necesita recibir
ningún secreto por chat.

1. En Meta for Developers, completen la app con producto **WhatsApp** y activen
   autenticación de dos factores en las cuentas administradoras.
2. En **WhatsApp > API Setup**, usen primero el número de prueba y agreguen un
   teléfono del equipo como destinatario permitido. Conserven una captura sin
   mostrar token ni teléfono completo.
3. Copien localmente `app/.env.example` como `.env.local`. Peguen el token,
   `PHONE_NUMBER_ID`, App Secret y la versión de Graph que muestra Meta.
4. Generen cuatro valores aleatorios distintos para `WHATSAPP_VERIFY_TOKEN`,
   `SESION_SAL`, `NOTIFICAR_ADMIN_TOKEN` y `PETICION_LINK_SECRET`. No
   reutilicen contraseñas. Configuren además `APP_PUBLIC_URL` con el dominio
   HTTPS del despliegue.
   `CURRENT LOCAL 2026-08-16`: ya fueron generados por
   `npm run setup:whatsapp-secrets`; no repetir ni rotar antes de sincronizar
   Meta y el entorno desplegado.
5. Mantengan `WHATSAPP_SEND_ENABLED=false`; ejecuten `npm test`, `npm run build`
   y prueben `/whatsapp`. Resultado esperado: conversación y aviso desde
   `/tablero`, cero mensajes reales.
6. Desplieguen en una URL HTTPS (Vercel es la ruta prevista) y carguen las mismas
   variables como secretos del entorno. No expongan `.env.local`.
7. En Meta, configuren Callback URL
   `https://<dominio>/api/whatsapp`, el mismo verify token y suscriban el campo
   `messages`. Resultado esperado: Meta acepta el `GET` challenge.
8. Sólo entonces cambien `WHATSAPP_SEND_ENABLED=true`, redesplieguen y manden
   «hola» desde el destinatario de prueba. Resultado esperado: primero aparece
   el aviso de no registro/no PII y luego solicita el relato.
9. Prueben un texto sintético P0. Luego, si Groq ZDR está activado, una nota de
   voz sintética. Conserven hora, modelo, latencia observada, ID de evento de Meta
   y resultado; no conserven el audio ni capturas con el número completo.
10. Al terminar, vuelvan `WHATSAPP_SEND_ENABLED=false`. Si usaron token temporal,
    déjenlo expirar o revóquenlo.

**Deténganse inmediatamente** si la firma del webhook falla, aparece un número
en logs, el modelo inventa una compuerta, Meta pide verificación/pago fuera del
flujo oficial, o un secreto aparece en una captura. Recuperación: apagar el gate,
rotar token/App Secret afectado, borrar la captura y repetir desde el paso 3.

## Limitaciones reales del canal

Estas son las que un jurado que conozca WhatsApp puede preguntar. Conviene tener
la respuesta lista en vez de quedar en blanco.

| Limitación | Impacto en el demo | Impacto al escalar |
|---|---|---|
| **Ventana de servicio de 24 h.** Fuera de ella no se puede escribir libre: hace falta una **plantilla aprobada por Meta** | Ninguno: en el demo el usuario acaba de escribir | **Alto.** La notificación proactiva —que es la tesis del producto— necesita plantillas aprobadas |
| El token de API Setup es temporal; confirmar expiración visible | Generarlo justo antes de probar | Requiere credencial permanente y gobierno de rotación |
| El número de prueba limita destinatarios; confirmar cantidad visible | Registrar sólo al equipo | Producción requiere alta y verificaciones de Meta |
| Estado, deduplicación y debounce en memoria | Funciona en una sola instancia; un reinicio pierde el lote | Requiere cola y persistencia compartidas |
| Enlace de petición bearer de 15 min | No reenviar ni capturar; expirado se regenera | Requiere política de rotación y, si se necesita revocación individual, almacenamiento servidor |

## Contingencia para el video

El orden importa y no es negociable:

1. **Grabar primero con el simulador.** Es el activo garantizado.
2. **Después** intentar Meta, con límite duro de 90 minutos.
3. Si conecta, volver a grabar en el celular real.
4. Si no conecta, se entrega con el video del simulador. El repositorio conserva
   el adaptador real y este documento explica qué falta. **Eso es una entrega
   honesta**, y demuestra que se entendió el canal.

Lo que **no** se puede hacer bajo ninguna circunstancia: afirmar en el video o en
el repositorio que el canal está conectado a Meta si no lo está.
